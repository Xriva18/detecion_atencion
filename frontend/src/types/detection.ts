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

