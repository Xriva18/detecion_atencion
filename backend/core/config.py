try:
    from pydantic_settings import BaseSettings, SettingsConfigDict
    PYDANTIC_V2 = True
except ImportError:
    # Compatibilidad con versiones antiguas de Pydantic
    from pydantic import BaseSettings
    PYDANTIC_V2 = False


class Settings(BaseSettings):
    """
    Configuración de la aplicación usando Pydantic Settings.
    Las variables pueden ser definidas en un archivo .env o como variables de entorno.
    """
    
    # Configuración de la API
    api_title: str = "API de Detección de Atención"
    api_version: str = "1.0.0"
    
    # Configuración de MediaPipe
    face_detection_model_selection: int = 0  # 0 para modelo corto, 1 para modelo completo
    face_detection_min_confidence: float = 0.7  # Confianza mínima para detectar rostro (0.0-1.0). Mayor valor = menos falsos positivos
    
    # Configuración de Face Mesh (para detección de parpadeos)
    face_mesh_min_detection_confidence: float = 0.7  # Confianza mínima para detectar landmarks faciales
    face_mesh_min_tracking_confidence: float = 0.7  # Confianza mínima para rastrear rostro entre frames
    
    # Configuración de detección de parpadeo
    ear_threshold: float = 1.55  # Umbral EAR para detectar si esta viendo a la pantalla. Valores más altos = más estricto
    
    # Configuración de WebSocket
    websocket_check_interval: float = 0.5  # Intervalo en segundos para verificar cambios en WebSocket (blink_count)
    
    # Configuración de Supabase
    supabase_url: str
    supabase_key: str

    # Configuración de IA (Gemini)
    gemini_api_key: str = ""
    
    if PYDANTIC_V2:
        model_config = SettingsConfigDict(
            env_file=".env",
            case_sensitive=False,
            extra="ignore"  # Ignorar variables de entorno no definidas
        )
    else:
        class Config:
            env_file = ".env"
            case_sensitive = False
            extra = "ignore"  # Ignorar variables de entorno no definidas


# Instancia global de configuración
settings = Settings()
