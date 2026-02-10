from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from core.exceptions import setup_exception_handlers
from endpoints.routes import register_routes

from contextlib import asynccontextmanager
from services.gaze_model_loader import GazeModelLoader

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load model on startup
    print("[Lifespan] Cargando modelo L2CS-Net...")
    GazeModelLoader.load_model()
    yield
    # Clean up (optional)
    GazeModelLoader.unload()

# Crear instancia de FastAPI con configuración
app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    lifespan=lifespan
)

# Configurar CORS para permitir peticiones desde el frontend
import os

# Determinar orígenes permitidos según el entorno
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://0.0.0.0:3000",
]

# En producción, agregar el dominio de Vercel
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)
    # También agregar la versión con www si existe
    if not frontend_url.startswith("www."):
        allowed_origins.append(frontend_url.replace("https://", "https://www."))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if not os.getenv("ALLOW_ALL_ORIGINS") else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configurar manejadores de excepciones globales
setup_exception_handlers(app)

# Registrar todas las rutas
register_routes(app)
