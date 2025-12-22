from fastapi import FastAPI

from endpoints.api import detect, check
from endpoints.websockets import blink_count, blink_detection


def register_routes(app: FastAPI) -> None:
    """
    Registra todos los routers de endpoints en la aplicación FastAPI.
    
    Args:
        app: Instancia de FastAPI
    """
    # Registrar router de saludo
    app.include_router(check.router)
    
    # Registrar router de detección de rostros
    app.include_router(detect.router)
    
    # Registrar routers de WebSockets
    app.include_router(blink_count.router)
    app.include_router(blink_detection.router)

