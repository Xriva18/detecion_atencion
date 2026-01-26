from fastapi import FastAPI

from endpoints.api import detect, check, classes, tasks, sessions, video_genai, transcription, stats, users
from endpoints.auth import auth
from endpoints.websockets import blink_count, blink_detection


def register_routes(app: FastAPI) -> None:
    """
    Registra todos los routers de endpoints en la aplicación FastAPI.
    
    Args:
        app: Instancia de FastAPI
    """
    # Registrar router de autenticación
    app.include_router(auth.router)
    
    # Registrar router de saludo
    app.include_router(check.router)
    
    # Registrar router de detección de rostros
    app.include_router(detect.router)
    
    # Registrar routers de WebSockets
    app.include_router(blink_count.router)
    app.include_router(blink_detection.router)
    
    # Registrar routers de gestión (Clases, Tareas, Sesiones)
    app.include_router(classes.router)
    app.include_router(tasks.router)
    app.include_router(sessions.router)
    app.include_router(stats.router)
    app.include_router(users.router)
    
    # Registrar router de pruebas GenAI
    app.include_router(video_genai.router)
    
    # Registrar router de transcripción
    app.include_router(transcription.router)


