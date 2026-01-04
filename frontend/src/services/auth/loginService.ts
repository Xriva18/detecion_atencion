import httpClient from "../httpclient";
import { handleApiError } from "../error";

/**
 * Interfaz para la petición de login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Interfaz para la respuesta de login
 */
export interface LoginResponse {
  access_token: string;
  token_type: string;
}

/**
 * Autentica un usuario y retorna el token de acceso
 * @param credentials - Credenciales del usuario (email, password)
 * @returns Promise con el token de acceso y tipo de token
 * @throws ApiError si la petición falla o las credenciales son inválidas
 */
export async function login(
  credentials: LoginRequest
): Promise<LoginResponse> {
  try {
    const response = await httpClient.post<LoginResponse>(
      "/auth/login",
      credentials
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

