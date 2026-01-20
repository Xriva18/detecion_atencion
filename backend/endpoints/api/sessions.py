"""
Endpoints para gestión de Sesiones de Actividad (Monitoreo de Atención).
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from core.config import settings
from services.ai_service import ai_service
from supabase import create_client, Client
from datetime import datetime

router = APIRouter(prefix="/sessions", tags=["Sesiones de Estudio"])

supabase: Client = create_client(settings.supabase_url, settings.supabase_key)


class SessionStart(BaseModel):
    task_id: str
    student_id: str


class SessionEnd(BaseModel):
    session_id: str
    attention_level: str  # 'alto', 'medio', 'bajo'


class QuizAnswer(BaseModel):
    quiz_id: str
    answers: dict  # {"q0": "opcion_elegida", "q1": "otra_opcion", ...}


@router.post("/start")
async def start_session(data: SessionStart):
    """
    Inicia una sesión de estudio cuando el estudiante empieza a ver un video.
    """
    try:
        session_data = {
            "task_id": data.task_id,
            "student_id": data.student_id,
            "status": "started"
        }
        response = supabase.table("activity_sessions").insert(session_data).execute()
        return {"message": "Sesión iniciada", "session": response.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/end")
async def end_session(data: SessionEnd):
    """
    Finaliza una sesión de estudio.
    1. Actualiza el registro de sesión con el puntaje de atención.
    2. Obtiene el resumen/transcripción del video asociado.
    3. Genera un cuestionario personalizado con IA.
    4. Guarda el cuestionario.
    5. Retorna el cuestionario al frontend.
    """
    try:
        # Validar que attention_level sea válido
        if data.attention_level not in ['alto', 'medio', 'bajo']:
            raise HTTPException(
                status_code=400, 
                detail="attention_level debe ser 'alto', 'medio' o 'bajo'"
            )
        
        print(f"[Session End] 🎬 Finalizando sesión: {data.session_id}")
        print(f"[Session End] 📊 Nivel de atención: {data.attention_level}")
        
        # 1. Actualizar sesión
        update_data = {
            "attention_level": data.attention_level,
            "status": "completed",
            "completed_at": datetime.utcnow().isoformat()
        }
        supabase.table("activity_sessions") \
            .update(update_data) \
            .eq("id", data.session_id) \
            .execute()
        print(f"[Session End] ✅ Sesión actualizada")
        
        # 2. Obtener información de la tarea/video
        session_info = supabase.table("activity_sessions") \
            .select("task_id") \
            .eq("id", data.session_id) \
            .single() \
            .execute()
        print(f"[Session End] 📋 Task ID: {session_info.data['task_id']}")
        
        task_info = supabase.table("tasks") \
            .select("transcription, title, description, questions_count") \
            .eq("id", session_info.data["task_id"]) \
            .single() \
            .execute()
        print(f"[Session End] 📝 Task info - Title: {task_info.data.get('title')}")
        print(f"[Session End] 📝 Transcription: {(task_info.data.get('transcription') or 'No disponible')[:100]}...")
        
        # 3. Generar cuestionario con IA
        content_for_quiz = task_info.data.get("transcription") or \
                          f"{task_info.data.get('title', '')} {task_info.data.get('description', '')}"
        
        print(f"[Session End] 📄 Contenido para quiz ({len(content_for_quiz)} chars): {content_for_quiz[:200]}...")
        
        # Default a 5 si no hay dato
        q_count = task_info.data.get("questions_count") or 5
        print(f"[Session End] 🔢 Número de preguntas: {q_count}")

        # Convertir attention_level a score numérico para el quiz
        # (generate_quiz necesita un float)
        attention_score_map = {
            'alto': 0.8,
            'medio': 0.5,
            'bajo': 0.3
        }
        attention_score = attention_score_map.get(data.attention_level, 0.5)

        quiz_questions = await ai_service.generate_quiz(
            text=content_for_quiz,
            attention_score=attention_score,
            num_questions=q_count
        )
        print(f"[Session End] ✅ Quiz generado: {len(quiz_questions)} preguntas")
        
        # 4. Guardar cuestionario en BD
        quiz_data = {
            "session_id": data.session_id,
            "content": quiz_questions
        }
        quiz_response = supabase.table("generated_quizzes").insert(quiz_data).execute()
        print(f"[Session End] ✅ Quiz guardado con ID: {quiz_response.data[0]['id']}")
        
        # 5. Retornar cuestionario
        return {
            "message": "Sesión completada. Cuestionario generado.",
            "quiz_id": quiz_response.data[0]["id"],
            "questions": quiz_questions
        }
    except Exception as e:
        print(f"[Session End] ❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))



@router.get("/quiz/{quiz_id}")
async def get_quiz(quiz_id: str):
    """
    Obtiene el contenido de un cuestionario generado.
    """
    try:
        print(f"Fetching quiz with ID: {quiz_id}")
        response = supabase.table("generated_quizzes") \
            .select("id, content, session_id, created_at") \
            .eq("id", quiz_id) \
            .single() \
            .execute()
        return response.data
    except Exception as e:
        print(f"Error fetching quiz {quiz_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/quiz/submit")
async def submit_quiz(data: QuizAnswer):
    """
    Recibe las respuestas del estudiante, calcula el puntaje y lo guarda.
    """
    try:
        # Obtener el quiz para calcular la nota
        quiz_info = supabase.table("generated_quizzes") \
            .select("content") \
            .eq("id", data.quiz_id) \
            .single() \
            .execute()
        
        questions = quiz_info.data["content"]
        correct_count = 0
        total = len(questions)
        
        for i, q in enumerate(questions):
            user_answer = data.answers.get(f"q{i}", "")
            if user_answer == q.get("correct_answer"):
                correct_count += 1
        
        score = (correct_count / total) * 100 if total > 0 else 0
        
        # Actualizar quiz con respuestas y nota
        update_data = {
            "student_answers": data.answers,
            "score_obtained": score,
            "completed_at": datetime.utcnow().isoformat()
        }
        supabase.table("generated_quizzes") \
            .update(update_data) \
            .eq("id", data.quiz_id) \
            .execute()
        
        return {
            "message": "Cuestionario enviado",
            "score": score,
            "correct": correct_count,
            "total": total
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/student/{student_id}/history")
async def get_student_history(student_id: str):
    """
    Obtiene el historial de sesiones de un estudiante.
    Útil para el dashboard del estudiante.
    """
    try:
        response = supabase.table("activity_sessions") \
            .select("*, tasks(title, video_url), generated_quizzes(score_obtained)") \
            .eq("student_id", student_id) \
            .order("started_at", desc=True) \
            .execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
