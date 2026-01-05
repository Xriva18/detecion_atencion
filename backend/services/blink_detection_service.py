import cv2
import mediapipe as mp
import numpy as np

from core.config import settings
from models.schemas import BlinkDetectionResponse


class BlinkDetectionService:
    """
    Servicio para detectar parpadeos usando MediaPipe Face Mesh y cálculo de EAR.
    """
    
    # Índices de landmarks de MediaPipe Face Mesh para los ojos
    # Orden para EAR: [p1, p2, p3, p4, p5, p6]
    # donde p1=arriba, p2=esq_sup_izq, p3=esq_sup_der, p4=abajo, p5=esq_inf_izq, p6=esq_inf_der
    # Ojo izquierdo (desde la perspectiva de la persona)
    # MediaPipe índices: 33 (arriba), 7 (esq_sup_izq), 163 (esq_sup_der), 
    #                    144 (abajo), 153 (esq_inf_izq), 158 (esq_inf_der)
    LEFT_EYE_INDICES = [33, 7, 163, 144, 153, 158]
    # Ojo derecho (desde la perspectiva de la persona)
    # MediaPipe índices: 362 (arriba), 382 (esq_sup_izq), 381 (esq_sup_der),
    #                    380 (abajo), 374 (esq_inf_izq), 390 (esq_inf_der)
    RIGHT_EYE_INDICES = [362, 382, 381, 380, 374, 390]
    
    def __init__(self, static_image_mode: bool = True, max_num_faces: int = 1):
        """
        Inicializa el servicio de detección de parpadeos usando MediaPipe Face Mesh.
        
        Args:
            static_image_mode: Si True, procesa imágenes estáticas. Si False, procesa video.
            max_num_faces: Número máximo de rostros a detectar
        """
        mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = mp_face_mesh.FaceMesh(
            static_image_mode=static_image_mode,
            max_num_faces=max_num_faces,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.ear_threshold = settings.ear_threshold
    
    
    def detect_blink(self, img: np.ndarray) -> BlinkDetectionResponse:
        """
        Detecta parpadeos en una imagen calculando el EAR para cada ojo.
        
        Args:
            img: Imagen en formato numpy array (OpenCV BGR)
            
        Returns:
            BlinkDetectionResponse con información sobre el parpadeo
        """
        try:
            print(f"[BlinkDetection] Procesando imagen...")
            # Convertir BGR a RGB (MediaPipe usa RGB)
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
            # Procesar con Face Mesh
            results = self.face_mesh.process(img_rgb)
            
            # Verificar si se detectó algún rostro
            if not results.multi_face_landmarks or len(results.multi_face_landmarks) == 0:
                # No se detectó rostro, retornar valores por defecto
                print("[BlinkDetection] ❌ No se detectaron landmarks faciales")
                return BlinkDetectionResponse(
                    blinking=False,
                    left_ear=0.0,
                    right_ear=0.0
                )
            
            # Obtener el primer rostro detectado
            face_landmarks = results.multi_face_landmarks[0]
            
            # Calcular EAR para cada ojo
            left_ear = self._calculate_ear_from_landmarks(
                face_landmarks, self.LEFT_EYE_INDICES, img.shape
            )
            right_ear = self._calculate_ear_from_landmarks(
                face_landmarks, self.RIGHT_EYE_INDICES, img.shape
            )
            
            # Determinar si hay parpadeo (EAR promedio menor al umbral)
            avg_ear = (left_ear + right_ear) / 2.0
            blinking = avg_ear < self.ear_threshold
            
            print(f"[BlinkDetection] EAR: L={left_ear:.3f} R={right_ear:.3f} | Parpadeando: {blinking}")
            
            return BlinkDetectionResponse(
                blinking=blinking,
                left_ear=left_ear,
                right_ear=right_ear
            )
            
        except Exception as e:
            # En caso de error, retornar valores por defecto
            print(f"[BlinkDetection] ⚠️ Error:  {e}")
            return BlinkDetectionResponse(
                blinking=False,
                left_ear=0.0,
                right_ear=0.0
            )
    
    def _calculate_ear_from_landmarks(
        self, 
        face_landmarks: any, 
        eye_indices: list, 
        img_shape: tuple
    ) -> float:
        """
        Calcula EAR desde los landmarks de MediaPipe.
        
        EAR = (|p2-p6| + |p3-p5|) / (2 * |p1-p4|)
        
        Los índices en eye_indices están ordenados como: [p1, p2, p3, p4, p5, p6]
        donde:
        - p1: punto superior del ojo (arriba)
        - p2: esquina superior izquierda
        - p3: esquina superior derecha
        - p4: punto inferior del ojo (abajo)
        - p5: esquina inferior izquierda
        - p6: esquina inferior derecha
        
        Args:
            face_landmarks: Objeto de landmarks de MediaPipe
            eye_indices: Lista de 6 índices de landmarks para el ojo [p1, p2, p3, p4, p5, p6]
            img_shape: Tupla (height, width) de la imagen
            
        Returns:
            float: Valor EAR calculado
        """
        h, w = img_shape[:2]
        
        # Obtener coordenadas de los 6 puntos del ojo
        points = []
        for idx in eye_indices:
            landmark = face_landmarks.landmark[idx]
            # MediaPipe retorna coordenadas normalizadas (0-1)
            x = landmark.x * w
            y = landmark.y * h
            points.append(np.array([x, y]))
        
        # EAR = (|p2-p6| + |p3-p5|) / (2 * |p1-p4|)
        # p1 = points[0] (arriba)
        # p2 = points[1] (esquina sup izq)
        # p3 = points[2] (esquina sup der)
        # p4 = points[3] (abajo)
        # p5 = points[4] (esquina inf izq)
        # p6 = points[5] (esquina inf der)
        
        # Distancia vertical: entre p1 (arriba) y p4 (abajo)
        vertical_dist = np.linalg.norm(points[0] - points[3])
        
        # Distancia horizontal superior: entre p2 y p6
        horizontal_dist_1 = np.linalg.norm(points[1] - points[5])
        
        # Distancia horizontal inferior: entre p3 y p5
        horizontal_dist_2 = np.linalg.norm(points[2] - points[4])
        
        # Calcular EAR
        if vertical_dist == 0:
            return 0.0
        
        ear = (horizontal_dist_1 + horizontal_dist_2) / (2.0 * vertical_dist)
        return float(ear)
