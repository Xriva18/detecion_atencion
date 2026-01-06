/**
 * Coordenadas de la detección de rostro
 */
export interface Coordinates {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Respuesta del endpoint de detección de rostros
 */
export interface FaceDetectionResponse {
  detected: boolean;
  coordinates: Coordinates | null;
  confidence: number;
}

/**
 * Request body para el endpoint de detección
 */
export interface FaceDetectionRequest {
  image: string; // Imagen en Base64
}

/**
 * Respuesta del endpoint de detección de parpadeos
 */
export interface BlinkDetectionResponse {
  blinking: boolean;
  left_ear: number;
  right_ear: number;
}

/**
 * Request body para el endpoint de detección de parpadeos
 */
export interface BlinkDetectionRequest {
  image: string; // Imagen en Base64
}

/**
 * Respuesta del endpoint de contador de parpadeos
 */
export interface BlinkCountResponse {
  blink_count: number;
}

/**
 * Respuesta combinada que incluye detección de rostro y parpadeo
 */
export interface CombinedDetectionResponse {
  faceDetected: boolean;
  blinking: boolean;
  left_ear: number;
  right_ear: number;
  faceConfidence?: number;
  faceCoordinates?: Coordinates | null;
}