import os
import base64
import re
from typing import Optional

# Desactivar generación de archivos .pyc y __pycache__
os.environ["PYTHONDONTWRITEBYTECODE"] = "1"

import cv2
import mediapipe as mp
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="API de Detección de Atención", version="1.0.0")

# Inicializar MediaPipe Face Detection
mp_face_detection = mp.solutions.face_detection
face_detection = mp_face_detection.FaceDetection(
    model_selection=0, min_detection_confidence=0.5
)


# Modelos Pydantic
class FaceDetectionRequest(BaseModel):
    image: str  # Imagen en Base64


class Coordinates(BaseModel):
    x: int
    y: int
    w: int
    h: int


class FaceDetectionResponse(BaseModel):
    detected: bool
    coordinates: Optional[Coordinates] = None
    confidence: float


def base64_to_opencv(image_base64: str) -> np.ndarray:
    """
    Convierte una imagen en Base64 a un array de OpenCV (numpy).
    Maneja el caso donde el Base64 viene con prefijo data:image/...;base64,
    """
    # Remover el prefijo si existe
    image_base64 = re.sub(r"^data:image/[^;]+;base64,", "", image_base64)

    # Decodificar Base64
    image_bytes = base64.b64decode(image_base64)

    # Convertir a array numpy
    nparr = np.frombuffer(image_bytes, np.uint8)

    # Decodificar imagen
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    return img


@app.get("/api/saludo")
async def saludo():
    """
    Endpoint que devuelve un saludo 'Hello World'
    """
    return {"mensaje": "Hello World"}


@app.post("/detect/face", response_model=FaceDetectionResponse)
async def detect_face(request: FaceDetectionRequest):
    """
    Endpoint que recibe una imagen en Base64 y detecta rostros usando MediaPipe.
    Retorna información sobre la detección: si se detectó un rostro, coordenadas y confianza.
    """
    try:
        # Convertir Base64 a imagen OpenCV
        img = base64_to_opencv(request.image)

        # Convertir BGR a RGB (MediaPipe usa RGB)
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        # Detectar rostros
        results = face_detection.process(img_rgb)

        # Verificar si se detectó algún rostro
        if results.detections and len(results.detections) > 0:
            # Obtener el primer rostro detectado (el más confiable)
            detection = results.detections[0]
            confidence = detection.score[0]

            # Obtener bounding box (MediaPipe retorna coordenadas normalizadas 0-1)
            bbox = detection.location_data.relative_bounding_box
            h, w = img.shape[:2]

            # Convertir coordenadas normalizadas a píxeles
            x = int(bbox.xmin * w)
            y = int(bbox.ymin * h)
            width = int(bbox.width * w)
            height = int(bbox.height * h)

            return FaceDetectionResponse(
                detected=True,
                coordinates=Coordinates(x=x, y=y, w=width, h=height),
                confidence=float(confidence),
            )
        else:
            # No se detectó ningún rostro
            return FaceDetectionResponse(
                detected=False, coordinates=None, confidence=0.0
            )

    except Exception as e:
        # En caso de error, retornar que no se detectó
        return FaceDetectionResponse(
            detected=False, coordinates=None, confidence=0.0
        )

