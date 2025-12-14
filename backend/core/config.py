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
    face_detection_min_confidence: float = 0.5
    
    # Configuración de detección de parpadeo
    ear_threshold: float = 1.7  # Umbral EAR para detectar si esta viendo a la pantalla
    
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
