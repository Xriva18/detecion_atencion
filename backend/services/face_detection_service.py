import cv2
import mediapipe as mp
import numpy as np

from models.schemas import Coordinates, FaceDetectionResponse


class FaceDetectionService:
    def __init__(self, model_selection: int = 0, min_detection_confidence: float = 0.5):
        """
        Inicializa el servicio de detección de rostros usando MediaPipe.
        
        Args:
            model_selection: 0 para modelo corto, 1 para modelo completo
            min_detection_confidence: Confianza mínima para la detección (0.0-1.0)
        """
        mp_face_detection = mp.solutions.face_detection
        self.face_detection = mp_face_detection.FaceDetection(
            model_selection=model_selection,
            min_detection_confidence=min_detection_confidence
        )

    def detect_face(self, img: np.ndarray) -> FaceDetectionResponse:
        """
        Detecta rostros en una imagen.
        
        Args:
            img: Imagen en formato numpy array (OpenCV BGR)
            
        Returns:
            FaceDetectionResponse con información sobre la detección
        """
        try:
            print(f"[FaceDetection] Procesando imagen de tamaño: {img.shape if img is not None else 'None'}")
            
            # Convertir BGR a RGB (MediaPipe usa RGB)
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

            # Detectar rostros
            results = self.face_detection.process(img_rgb)
            
            print(f"[FaceDetection] Detecciones: {len(results.detections) if results.detections else 0}")

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
                
                print(f"[FaceDetection] ✅ Rostro detectado con confianza: {confidence:.2f}")

                return FaceDetectionResponse(
                    detected=True,
                    coordinates=Coordinates(x=x, y=y, w=width, h=height),
                    confidence=float(confidence),
                )
            else:
                # No se detectó ningún rostro
                print("[FaceDetection] ❌ No se detectó rostro")
                return FaceDetectionResponse(
                    detected=False, coordinates=None, confidence=0.0
                )

        except Exception as e:
            # En caso de error, retornar que no se detectó
            print(f"[FaceDetection] ⚠️ Error: {e}")
            return FaceDetectionResponse(
                detected=False, coordinates=None, confidence=0.0
            )

