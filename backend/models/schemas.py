from typing import Optional
from pydantic import BaseModel


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

