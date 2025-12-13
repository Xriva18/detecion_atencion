import httpClient from "./httpclient";
import { handleApiError } from "./error";

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
interface FaceDetectionRequest {
  image: string; // Imagen en Base64
}

/**
 * Envía un frame en base64 al backend para detección de rostros
 * @param base64Image - Imagen en formato base64 (sin prefijo data:image/...)
 * @returns Promise con la respuesta de detección
 * @throws ApiError si la petición falla
 */
export async function enviarFrameAlBackend(
  base64Image: string
): Promise<FaceDetectionResponse> {
  try {
    // Remover el prefijo data:image/... si existe
    const base64Data = base64Image.includes(",")
      ? base64Image.split(",")[1]
      : base64Image;

    const requestBody: FaceDetectionRequest = {
      image: base64Data,
    };

    const response = await httpClient.post<FaceDetectionResponse>(
      "/detect/face",
      requestBody
    );

    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}
