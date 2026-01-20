"""
Endpoints para gestión de Tareas (Videos).
Incluye subida de video y procesamiento con IA.
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional
from core.config import settings
from services.video_service import video_service
from services.transcription_service import transcription_service
from supabase import create_client, Client
import uuid
import re
import os
import asyncio

router = APIRouter(prefix="/tasks", tags=["Tareas/Videos"])

# Asegurar que la URL de Supabase tenga trailing slash
supabase_url = settings.supabase_url.rstrip('/') + '/'
supabase: Client = create_client(supabase_url, settings.supabase_key)


def sanitize_filename(filename: str) -> str:
    """
    Sanitiza el nombre del archivo para que sea válido como clave de Supabase Storage.
    Elimina o reemplaza caracteres especiales que pueden causar errores InvalidKey.
    """
    if not filename:
        return "video.mp4"
    
    # Obtener el nombre base y la extensión
    name, ext = os.path.splitext(filename)
    
    # Reemplazar caracteres especiales y espacios
    # Mantener solo letras, números, guiones, guiones bajos y puntos
    sanitized_name = re.sub(r'[^a-zA-Z0-9._-]', '_', name)
    
    # Eliminar múltiples guiones bajos consecutivos
    sanitized_name = re.sub(r'_+', '_', sanitized_name)
    
    # Eliminar guiones bajos al inicio y final
    sanitized_name = sanitized_name.strip('_')
    
    # Si el nombre quedó vacío, usar un nombre por defecto
    if not sanitized_name:
        sanitized_name = "video"
    
    # Limitar la longitud del nombre (máximo 200 caracteres)
    if len(sanitized_name) > 200:
        sanitized_name = sanitized_name[:200]
    
    return f"{sanitized_name}{ext}"


class TaskCreate(BaseModel):
    class_id: str
    title: str
    description: Optional[str] = None


class TaskResponse(BaseModel):
    id: str
    class_id: str
    title: str
    description: Optional[str]
    video_url: str
    transcription: Optional[str]


@router.get("/class/{class_id}", response_model=List[TaskResponse])
async def get_tasks_by_class(class_id: str):
    """
    Obtiene todas las tareas/videos de una clase específica.
    """
    try:
        response = supabase.table("tasks") \
            .select("*") \
            .eq("class_id", class_id) \
            .eq("is_active", True) \
            .execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{task_id}")
async def get_task(task_id: str):
    """
    Obtiene los detalles de una tarea específica, incluyendo el resumen de IA.
    """
    try:
        response = supabase.table("tasks") \
            .select("*") \
            .eq("id", task_id) \
            .single() \
            .execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload")
async def upload_task_video(
    class_id: str = Form(...),
    title: str = Form(...),
    description: str = Form(None),
    questions_count: int = Form(5),
    video: UploadFile = File(...)
):
    """
    Sube un video para una nueva tarea.
    1. Guarda el video localmente (temporalmente).
    2. Sube al Storage de Supabase.
    3. Transcribe el video con Whisper y genera el resumen.
    4. Crea el registro en la tabla 'tasks' con el resumen.
    """
    try:
        # 1. Guardar localmente
        local_path = await video_service.save_upload_locally(video)
        
        # 2. Subir a Supabase Storage
        # Sanitizar el nombre del archivo para evitar caracteres especiales
        sanitized_filename = sanitize_filename(video.filename)
        file_name = f"{uuid.uuid4()}_{sanitized_filename}"
        with open(local_path, "rb") as f:
            storage_response = supabase.storage.from_("videos").upload(
                file_name, 
                f,
                {"content-type": video.content_type}
            )
        
        # Obtener URL pública
        video_url = supabase.storage.from_("videos").get_public_url(file_name)
        
        # 3. Transcribir video con Whisper y generar resumen
        print(f"[upload_task_video] Iniciando transcripción del video...")
        transcribe_task_id = transcription_service.start_transcription(local_path)
        
        # Polling para esperar la transcripción (máximo 10 minutos)
        summary = "Resumen no disponible (tiempo de espera agotado)."
        attempts = 0
        max_attempts = 300  # 300 intentos * 2 segundos = 10 minutos
        
        while attempts < max_attempts:
            await asyncio.sleep(2)  # Esperar 2 segundos entre intentos
            attempts += 1
            
            status_data = transcription_service.get_task_status(transcribe_task_id)
            
            if status_data is None:
                # Tarea aún no registrada, continuar esperando
                continue
            
            if status_data.get("status") == "completed":
                summary = status_data.get("text") or "Transcripción vacía."
                print(f"[upload_task_video] Transcripción completada ({attempts * 2}s)")
                break
            elif status_data.get("status") == "failed":
                error_msg = status_data.get("error", "Error en transcripción.")
                summary = f"Resumen no disponible. {error_msg}"
                print(f"[upload_task_video] Error en transcripción: {error_msg}")
                break
        
        if attempts >= max_attempts:
            print(f"[upload_task_video] Timeout esperando transcripción después de {max_attempts * 2}s")
        
        # 4. Crear registro en BD
        task_data = {
            "class_id": class_id,
            "title": title,
            "description": description,
            "video_url": video_url,
            "transcription": summary,  # Guardamos la transcripción en lugar del resumen
            "questions_count": questions_count
        }
        
        try:
            db_response = supabase.table("tasks").insert(task_data).execute()
        except Exception as e:
            # Si falla, es posible que la columna questions_count no exista aun en la BD.
            # Intentamos insertar sin ella (fallback)
            if "questions_count" in str(e) or "column" in str(e):
                del task_data["questions_count"]
                db_response = supabase.table("tasks").insert(task_data).execute()
            else:
                raise e # Si es otro error, re-lanzarlo
        
        # Limpieza
        video_service.cleanup(local_path)
        
        return {
            "message": "Video subido exitosamente",
            "task": db_response.data[0]
        }
    except Exception as e:
        # Log del error en consola del backend para debugging
        print(f"Error uploading task: {e}")
        raise HTTPException(status_code=500, detail=f"Error al subir video: {str(e)}")
