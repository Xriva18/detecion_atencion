import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface SaludoResponse {
  mensaje: string;
}

/**
 * Obtiene el saludo del endpoint /check/saludo
 * @returns Promise con el mensaje de saludo
 * @throws Error si la petición falla
 */
export async function obtenerSaludo(): Promise<SaludoResponse> {
  try {
    const response = await axios.get<SaludoResponse>(
      `${API_BASE_URL}/check/saludo`,
      {
        timeout: 5000, // 5 segundos de timeout
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error;

      // Error de red (sin respuesta del servidor)
      if (!axiosError.response) {
        // Verificar si es un error de CORS
        if (
          axiosError.code === "ERR_NETWORK" ||
          axiosError.message.includes("CORS")
        ) {
          throw new Error(
            "Error de CORS: El backend no permite solicitudes desde este origen. Verifica la configuración CORS del backend."
          );
        }
        throw new Error(
          "Error de conexión: No se pudo conectar al servidor. ¿Está el backend corriendo en http://127.0.0.1:8000?"
        );
      }

      // Error del servidor (4xx, 5xx)
      const status = axiosError.response.status;
      const message = axiosError.response.data?.detail || axiosError.message;
      throw new Error(`Error del servidor (${status}): ${message}`);
    }

    throw new Error(
      error instanceof Error
        ? error.message
        : "Error desconocido al obtener saludo"
    );
  }
}
