from fastapi import APIRouter

from models.schemas import FaceDetectionRequest, FaceDetectionResponse
from services.face_detection_service import FaceDetectionService
from utils.image_utils import base64_to_opencv

router = APIRouter()

# Inicializar el servicio de detección de rostros
face_detection_service = FaceDetectionService()


@router.post("/detect/face", response_model=FaceDetectionResponse)
async def detect_face(request: FaceDetectionRequest):
    """
    Endpoint que recibe una imagen en Base64 y detecta rostros usando MediaPipe.
    Retorna información sobre la detección: si se detectó un rostro, coordenadas y confianza.
    """
    # Convertir Base64 a imagen OpenCV
    img = base64_to_opencv(request.image)
    
    # Detectar rostros usando el servicio
    result = face_detection_service.detect_face(img)
    
    return result

