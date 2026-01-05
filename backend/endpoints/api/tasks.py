"""
Endpoints para gestión de Tareas (Videos).
Incluye subida de video y procesamiento con IA.
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional
from core.config import settings
from services.ai_service import ai_service
from services.video_service import video_service
from supabase import create_client, Client
import uuid

router = APIRouter(prefix="/tasks", tags=["Tareas/Videos"])

supabase: Client = create_client(settings.supabase_url, settings.supabase_key)


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
    video_summary: Optional[str]


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
    3. Genera un resumen con IA (simplificado: usamos el título por ahora).
    4. Crea el registro en la tabla 'tasks'.
    """
    try:
        # 1. Guardar localmente
        local_path = await video_service.save_upload_locally(video)
        
        # 2. Subir a Supabase Storage
        file_name = f"{uuid.uuid4()}_{video.filename}"
        with open(local_path, "rb") as f:
            storage_response = supabase.storage.from_("videos").upload(
                file_name, 
                f,
                {"content-type": video.content_type}
            )
        
        # Obtener URL pública
        video_url = supabase.storage.from_("videos").get_public_url(file_name)
        
        # 3. Generar resumen con IA (placeholder: usaremos descripción si existe)
        # En una implementación completa, aquí extraeríamos audio -> transcripción -> resumen
        summary_text = f"Video sobre: {title}. {description or ''}"
        if settings.gemini_api_key:
            try:
                summary = await ai_service.summarize_text(summary_text)
            except Exception:
                summary = "Resumen no disponible (Error de IA)"
        else:
            summary = "Resumen no disponible (IA no configurada)"
        
        # 4. Crear registro en BD
        task_data = {
            "class_id": class_id,
            "title": title,
            "description": description,
            "video_url": video_url,
            "video_summary": summary,
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
