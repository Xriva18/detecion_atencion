"""
WebSocket para monitoreo de atención en tiempo real.
Refactorizado para usar MediaPipe Tasks API.
"""
import asyncio
import json
import time
from typing import Optional
from fastapi import WebSocket, WebSocketDisconnect
from fastapi.routing import APIRouter

from core.config import settings
from endpoints.websockets.connection_manager import ConnectionManager
from services.blink_detection_service import BlinkDetectionService
from services.gaze_service import GazeService
from services.head_pose_service import HeadPoseService
from services.attention_logic import (
    calculate_full_attention_metrics, 
    calculate_ear_status
)
from utils.image_utils import base64_to_opencv

router = APIRouter()

# Instancia del gestor de conexiones
manager = ConnectionManager()

# Servicios inicializados de forma lazy
_gaze_service: Optional[GazeService] = None
_head_pose_service: Optional[HeadPoseService] = None
_blink_service: Optional[BlinkDetectionService] = None

def get_services():
    """Inicializa todos los servicios cuando se necesitan."""
    global _gaze_service, _head_pose_service, _blink_service
    
    if _gaze_service is None:
        print("[AttentionMonitor] Inicializando servicios (Tasks API)...")
        _gaze_service = GazeService(
            max_concurrent=2,
            use_filter=True
        )
        _head_pose_service = HeadPoseService(
            use_filter=True
        )
        # BlinkDetectionService ahora encapsula FaceLandmarker
        _blink_service = BlinkDetectionService(
            static_image_mode=True, # IMAGE mode en Tasks API
            max_num_faces=1
        )
        print("[AttentionMonitor] ✅ Servicios inicializados")
    
    return _gaze_service, _head_pose_service, _blink_service


class BlinkRateTracker:
    """Tracker para calcular la tasa de parpadeo por minuto."""
    
    def __init__(self, window_seconds: float = 60.0):
        self.window_seconds = window_seconds
        self.blink_timestamps: list[float] = []
        self.last_blink_state: bool = False
    
    def update(self, is_blinking: bool, timestamp: float) -> float:
        if is_blinking and not self.last_blink_state:
            self.blink_timestamps.append(timestamp)
        
        self.last_blink_state = is_blinking
        cutoff = timestamp - self.window_seconds
        self.blink_timestamps = [t for t in self.blink_timestamps if t > cutoff]
        
        if len(self.blink_timestamps) < 2:
            return 13.0
        
        time_span = timestamp - self.blink_timestamps[0]
        if time_span > 0:
            blinks_per_minute = (len(self.blink_timestamps) / time_span) * 60.0
            return min(blinks_per_minute, 60.0)
        
        return 13.0
    
    def reset(self):
        self.blink_timestamps = []
        self.last_blink_state = False


class DrowsinessTracker:
    """Tracker para detectar somnolencia (ojos cerrados por tiempo prolongado)."""
    
    def __init__(self, threshold_seconds: float = 2.0):
        self.threshold_seconds = threshold_seconds
        self.eyes_closed_start_time: Optional[float] = None
        self.is_asleep = False
    
    def update(self, eyes_closed: bool, timestamp: float) -> bool:
        """
        Actualiza el estado de somnolencia.
        
        Args:
            eyes_closed: True si los ojos están cerrados (EAR < umbral)
            timestamp: Tiempo actual
            
        Returns:
            True si está "durmiendo" (ojos cerrados > umbral)
        """
        if not eyes_closed:
            # Ojos abiertos: resetear
            self.eyes_closed_start_time = None
            self.is_asleep = False
            return False
        
        # Ojos cerrados
        if self.eyes_closed_start_time is None:
            self.eyes_closed_start_time = timestamp
            
        # Calcular duración
        duration = timestamp - self.eyes_closed_start_time
        
        if duration > self.threshold_seconds:
            self.is_asleep = True
            
        return self.is_asleep
        
    def reset(self):
        self.eyes_closed_start_time = None
        self.is_asleep = False


@router.websocket("/ws/monitor")
async def websocket_attention_monitor(websocket: WebSocket):
    await manager.connect(websocket)
    
    blink_tracker = BlinkRateTracker(window_seconds=60.0)
    drowsiness_tracker = DrowsinessTracker(threshold_seconds=2.0)  # 2 segundos umbral
    
    gaze_service, head_pose_service, blink_service = get_services()
    
    gaze_available = gaze_service.is_ready()
    if not gaze_available:
        print("[AttentionMonitor] ⚠️ Modelo L2CS-Net no disponible, usando solo head pose")
    
    try:
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                if "image" not in message:
                    await manager.send_json_message({"error": "Falta 'image'"}, websocket)
                    continue
                
                timestamp = time.time()
                
                try:
                    img = base64_to_opencv(message["image"])
                    img_height, img_width = img.shape[:2]
                except Exception as e:
                    await manager.send_json_message({"error": f"Error img: {str(e)}"}, websocket)
                    continue
                
                # --- NUEVA LÓGICA USANDO BlinkDetectionService COMO MAESTRO ---
                # Obtener resultado completo de FaceLandmarker
                landmarker_result = blink_service.get_full_result(img)
                
                if not landmarker_result or not landmarker_result.face_landmarks:
                    # No rostros: Resetear trackers
                    drowsiness_tracker.reset()
                    
                    await manager.send_json_message({
                        "attention_score": 0.0,
                        "gaze": {"pitch": 0.0, "yaw": 0.0},
                        "pose": {"yaw": 0.0, "pitch": 0.0, "roll": 0.0},
                        "blink": False,
                        "ear": {"left": 0.0, "right": 0.0},
                        "status": "distracted",
                        "warnings": ["No se detectó rostro"],
                        "face_detected": False
                    }, websocket)
                    continue
                
                # Extraer landmarks del primer rostro
                face_landmarks = landmarker_result.face_landmarks[0]
                
                # 1. Head Pose (pasamos la lista de landmarks)
                head_pose = head_pose_service.estimate_pose_from_mediapipe(
                    face_landmarks, img_width, img_height, timestamp
                )
                
                # 2. Gaze (L2CS-Net)
                if gaze_available:
                    # Calc Gaze using inferred BBox
                    xs = [l.x * img_width for l in face_landmarks]
                    ys = [l.y * img_height for l in face_landmarks]
                    x1, y1 = int(min(xs)), int(min(ys))
                    w, h = int(max(xs) - min(xs)), int(max(ys) - min(ys))
                    bbox = (x1, y1, w, h)
                    
                    gaze_result = gaze_service.predict_gaze(img, bbox, timestamp)
                    gaze_yaw = gaze_result.yaw if gaze_result and gaze_result.success else 0.0
                    gaze_pitch = gaze_result.pitch if gaze_result and gaze_result.success else 0.0
                else:
                    gaze_yaw = head_pose.yaw * 0.5
                    gaze_pitch = head_pose.pitch * 0.5
                
                # 3. Blink Detection / Eyes Status
                left_indices = BlinkDetectionService.LEFT_EYE_INDICES
                right_indices = BlinkDetectionService.RIGHT_EYE_INDICES
                
                left_ear = blink_service._calculate_ear_from_landmarks(face_landmarks, left_indices, img.shape)
                right_ear = blink_service._calculate_ear_from_landmarks(face_landmarks, right_indices, img.shape)
                avg_ear = (left_ear + right_ear) / 2.0
                
                # "Ojos cerrados" umbral estándar
                eyes_closed = avg_ear < settings.ear_threshold
                
                # 4. Tasa de Parpadeo
                blinks_per_minute = blink_tracker.update(eyes_closed, timestamp)
                
                # 5. Drowsiness / Sleep Detection
                is_asleep = drowsiness_tracker.update(eyes_closed, timestamp)
                
                # 6. Métricas
                metrics = calculate_full_attention_metrics(
                    gaze_yaw, head_pose.yaw, head_pose.pitch, 
                    left_ear, right_ear, blinks_per_minute
                )
                
                # Override status if asleep
                final_status = metrics.status
                if is_asleep:
                    final_status = "asleep"
                    metrics.warnings.insert(0, "¡DORMIDO DETECTADO!")
                
                response = {
                    "attention_score": round(metrics.engagement_index, 3),
                    "gaze": {"pitch": round(gaze_pitch, 2), "yaw": round(gaze_yaw, 2)},
                    "pose": {"yaw": round(head_pose.yaw, 2), "pitch": round(head_pose.pitch, 2), "roll": round(head_pose.roll, 2)},
                    "blink": eyes_closed,
                    "ear": {"left": round(left_ear, 3), "right": round(right_ear, 3)},
                    "status": final_status,
                    "warnings": metrics.warnings,
                    "blinks_per_minute": round(blinks_per_minute, 1),
                    "face_detected": True
                }
                
                await manager.send_json_message(response, websocket)
                
            except json.JSONDecodeError:
                await manager.send_json_message({"error": "JSON inválido"}, websocket)
            except WebSocketDisconnect:
                break
                
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"[AttentionMonitor] Error: {e}")
    finally:
        manager.disconnect(websocket)
        gaze_service.reset_filter() if gaze_service else None
        head_pose_service.reset_filter() if head_pose_service else None


@router.get("/monitor/status")
async def get_monitor_status():
    gaze_service, _, _ = get_services()
    return {
        "status": "ready",
        "services": {
            "gaze": "L2CS-Net",
            "vision": "MediaPipe Tasks (FaceLandmarker)"
        }
    }
