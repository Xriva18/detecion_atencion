"""
Endpoints para gestión de Clases.
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from core.config import settings
from supabase import create_client, Client

router = APIRouter(prefix="/classes", tags=["Clases"])

# Cliente de Supabase
supabase: Client = create_client(settings.supabase_url, settings.supabase_key)


class ClassCreate(BaseModel):
    name: str
    description: Optional[str] = None
    code: Optional[str] = None
    schedule: Optional[str] = None


class ClassResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    code: Optional[str]
    professor_id: str


@router.get("/", response_model=List[ClassResponse])
async def get_classes():
    """
    Obtiene todas las clases (para Admin/Profesor).
    El RLS de Supabase filtrará automáticamente si el usuario es estudiante.
    """
    try:
        response = supabase.table("classes").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=ClassResponse)
async def create_class(class_data: ClassCreate, professor_id: str):
    """
    Crea una nueva clase. El professor_id debe venir del token de auth en producción.
    """
    try:
        final_professor_id = professor_id
        
        # Fallback para demo: si el ID es el placeholder, buscar un usuario real en la BD
        if professor_id == "profesor-demo-id":
             # Buscar perfil con rol profesor (2)
             prof_check = supabase.table("profiles").select("user_id").eq("role", 2).limit(1).execute()
             if prof_check.data:
                 final_professor_id = prof_check.data[0]['user_id']
             else:
                 # Si no hay profesor, buscar cualquier usuario
                 any_user = supabase.table("profiles").select("user_id").limit(1).execute()
                 if any_user.data:
                     final_professor_id = any_user.data[0]['user_id']
                 else:
                     raise HTTPException(status_code=400, detail="No se encontraron usuarios en la Base de Datos para asignar como profesor. Por favor cree un usuario en Supabase Auth.")

        data = {
            "name": class_data.name,
            "description": class_data.description,
            "code": class_data.code,
            "schedule": class_data.schedule,
            "professor_id": final_professor_id
        }
        response = supabase.table("classes").insert(data).execute()
        return response.data[0]
    except Exception as e:
        # Mejor manejo de error para FK
        msg = str(e)
        if "foreign key constraint" in msg.lower():
            raise HTTPException(status_code=400, detail=f"Error de Integridad: El ID de profesor '{final_professor_id}' no existe en la tabla profiles. Asegúrate de que el usuario existe.")
        raise HTTPException(status_code=500, detail=msg)


@router.get("/{class_id}", response_model=ClassResponse)
async def get_class(class_id: str):
    """
    Obtiene los detalles de una clase específica.
    """
    try:
        response = supabase.table("classes").select("*").eq("id", class_id).single().execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{class_id}/students")
async def get_class_students(class_id: str):
    """
    Obtiene los estudiantes inscritos en una clase.
    """
    try:
        response = supabase.table("class_enrollments") \
            .select("student_id, profiles(full_name, email)") \
            .eq("class_id", class_id) \
            .execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{class_id}/enroll")
async def enroll_student(class_id: str, student_id: str):
    """
    Inscribe a un estudiante en una clase.
    """
    try:
        data = {"class_id": class_id, "student_id": student_id}
        response = supabase.table("class_enrollments").insert(data).execute()
        return {"message": "Estudiante inscrito exitosamente", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
