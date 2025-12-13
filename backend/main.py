from fastapi import FastAPI

from core.config import settings
from core.exceptions import setup_exception_handlers
from endpoints.routes import register_routes

# Crear instancia de FastAPI con configuración
app = FastAPI(
    title=settings.api_title,
    version=settings.api_version
)

# Configurar manejadores de excepciones globales
setup_exception_handlers(app)

# Registrar todas las rutas
register_routes(app)
