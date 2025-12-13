from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse


def setup_exception_handlers(app: FastAPI) -> None:
    """
    Configura los manejadores de excepciones globales para la aplicación.
    
    Args:
        app: Instancia de FastAPI
    """
    
    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        """
        Manejador general de excepciones.
        Captura cualquier excepción no manejada y retorna una respuesta JSON.
        """
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "Error interno del servidor",
                "detail": str(exc) if str(exc) else "Ocurrió un error inesperado"
            }
        )
