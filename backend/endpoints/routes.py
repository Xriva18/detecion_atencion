from fastapi import FastAPI

from endpoints.api import face, saludo


def register_routes(app: FastAPI) -> None:
    """
    Registra todos los routers de endpoints en la aplicación FastAPI.
    
    Args:
        app: Instancia de FastAPI
    """
    # Registrar router de saludo
    app.include_router(saludo.router)
    
    # Registrar router de detección de rostros
    app.include_router(face.router)

