from fastapi import APIRouter

from core.config import settings
from models.schemas import FaceDetectionRequest, FaceDetectionResponse, BlinkDetectionResponse
from services.face_detection_service import FaceDetectionService
from services.blink_detection_service import BlinkDetectionService
from services.blink_counter import increment_blink_count, reset_blink_count, get_blink_count
from utils.image_utils import base64_to_opencv

router = APIRouter()

# Inicializar servicios (singleton por endpoint)
face_detection_service = FaceDetectionService(
    model_selection=settings.face_detection_model_selection,
    min_detection_confidence=settings.face_detection_min_confidence
)

blink_detection_service = BlinkDetectionService(
    static_image_mode=True,
    max_num_faces=1
)


@router.post("/detect/face", response_model=FaceDetectionResponse)
async def detect_face(request: FaceDetectionRequest):
    """
    Endpoint para detectar rostros en una imagen.
    
    Args:
        request: Request con imagen en Base64
        
    Returns:
        FaceDetectionResponse con información sobre la detección del rostro
    """
    try:
        # Convertir Base64 a OpenCV
        img = base64_to_opencv(request.image)
        
        # Detectar rostro
        result = face_detection_service.detect_face(img)
        
        return result
    except Exception as e:
        # En caso de error, retornar que no se detectó
        return FaceDetectionResponse(
            detected=False,
            coordinates=None,
            confidence=0.0
        )


@router.post("/detect/blink", response_model=BlinkDetectionResponse)
async def detect_blink(request: FaceDetectionRequest):
    """
    Endpoint para detectar parpadeos en una imagen.
    
    Args:
        request: Request con imagen en Base64
        
    Returns:
        BlinkDetectionResponse con información sobre el parpadeo (blinking, left_ear, right_ear)
    """
    try:
        # Convertir Base64 a OpenCV
        img = base64_to_opencv(request.image)
        
        # Detectar parpadeo
        result = blink_detection_service.detect_blink(img)
        
        # Incrementar contador si se detecta parpadeo
        if result.blinking:
            increment_blink_count()
        
        return result
    except Exception as e:
        # En caso de error, retornar valores por defecto
        return BlinkDetectionResponse(
            blinking=False,
            left_ear=0.0,
            right_ear=0.0
        )


@router.get("/detect/blink/count")
async def get_blink_count_endpoint():
    """
    Endpoint para consultar el contador actual de parpadeos.
    
    Returns:
        dict: Contador actual de parpadeos
    """
    return {"blink_count": get_blink_count()}


@router.post("/detect/blink/reset")
async def reset_blink_count_endpoint():
    """
    Endpoint para reiniciar el contador de parpadeos a 0.
    
    Returns:
        dict: Confirmación del reset con el contador en 0
    """
    reset_blink_count()
    return {"message": "Contador de parpadeos reiniciado", "blink_count": 0}

