import { createClientSupabase } from "@/utils/supabase/client";

export interface MFAEnrollResult {
  qr_code: string;
  secret: string;
  factorId: string;
}

export interface MFAFactor {
  id: string;
  type: string;
  status: string;
  friendly_name?: string;
}

/**
 * Servicio para manejar operaciones de Multi-Factor Authentication (MFA)
 */
export class MFAService {
  /**
   * Enrollar (activar) un factor TOTP para el usuario
   * @returns Objeto con QR code, secret y factor ID
   */
  static async enrollMFA(): Promise<MFAEnrollResult> {
    const supabase = createClientSupabase();
    
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
    });

    if (error) {
      throw new Error(`Error al activar MFA: ${error.message}`);
    }

    if (!data.totp?.qr_code || !data.totp?.secret || !data.id) {
      throw new Error("Error: datos incompletos del factor MFA");
    }

    return {
      qr_code: data.totp.qr_code,
      secret: data.totp.secret,
      factorId: data.id,
    };
  }

  /**
   * Verificar un código TOTP durante la activación (sin challenge)
   * @param factorId ID del factor a verificar (obtenido del enroll - DEBE estar en memoria)
   * @param code Código de 6 dígitos del autenticador
   * 
   * IMPORTANTE: 
   * - NO usar listFactors() aquí - el factor puede no estar disponible aún
   * - El factorId DEBE venir del enroll() reciente, guardado en el estado del componente
   * - Si el factorId expira o se pierde, hay que empezar de nuevo con enroll()
   */
  static async verifyMFA(factorId: string, code: string): Promise<void> {
    try {
      const supabase = createClientSupabase();

      // CRÍTICO: Verificar directamente con el factorId del enroll
      // NO usar listFactors() - solo para login, no para activación
      console.log("Verificando MFA con factorId del enroll:", factorId);

      // Verify USANDO EL MISMO factorId del enroll
      const { data, error } = await supabase.auth.mfa.verify({
        factorId: factorId,
        code: code.toString(), // Asegurar que sea string
      });
      
      console.log("Respuesta de verify:", {
        hasData: !!data,
        hasError: !!error,
        errorType: typeof error,
        errorKeys: error ? Object.keys(error) : [],
        errorString: error ? String(error) : null,
        errorMessage: error?.message,
      });

      if (error) {
        // Capturar información completa del error
        const errorInfo = {
          error: error,
          errorMessage: error?.message || "Error desconocido",
          errorStatus: error?.status || "unknown",
          errorName: error?.name || "unknown",
          factorId: factorId,
          fullError: error ? JSON.stringify(error, Object.getOwnPropertyNames(error), 2) : "No error object",
        };

        console.error("Error en verifyMFA:", errorInfo);

        const errorMessage = error?.message || "Error desconocido al verificar código";

        // Mensajes de error más específicos
        if (errorMessage.toLowerCase().includes("invalid code") || 
            errorMessage.toLowerCase().includes("invalid") ||
            errorMessage.toLowerCase().includes("incorrect")) {
          throw new Error("El código ingresado es incorrecto. Por favor, verifica que el código de Google Authenticator sea el correcto y que no haya expirado.");
        } else if (errorMessage.toLowerCase().includes("not found") || 
                   errorMessage.toLowerCase().includes("challenge")) {
          throw new Error("No se encontró el factor MFA. Por favor, intenta activar nuevamente.");
        } else if (errorMessage.toLowerCase().includes("expired")) {
          throw new Error("El código ha expirado. Por favor, ingresa un código nuevo de Google Authenticator.");
        } else {
          throw new Error(`Error al verificar código: ${errorMessage}`);
        }
      }

      // Si hay data, significa que la verificación fue exitosa
      // El factor ahora está activo (verified)
      console.log("MFA verificado exitosamente", { data });
    } catch (unexpectedError) {
      // Capturar cualquier error inesperado
      console.error("Error inesperado en verifyMFA:", unexpectedError);
      const errorMessage = unexpectedError instanceof Error 
        ? unexpectedError.message 
        : String(unexpectedError);
      throw new Error(`Error inesperado al verificar código: ${errorMessage}`);
    }
  }

  /**
   * Listar todos los factores MFA del usuario actual
   * @returns Array de factores MFA
   */
  static async listFactors(): Promise<MFAFactor[]> {
    const supabase = createClientSupabase();

    const { data, error } = await supabase.auth.mfa.listFactors();

    if (error) {
      throw new Error(`Error al listar factores MFA: ${error.message}`);
    }

    return data.totp || [];
  }

  /**
   * Desactivar (unenroll) un factor MFA
   * @param factorId ID del factor a eliminar
   */
  static async unenrollFactor(factorId: string): Promise<void> {
    const supabase = createClientSupabase();

    const { error } = await supabase.auth.mfa.unenroll({
      factorId,
    });

    if (error) {
      throw new Error(`Error al desactivar MFA: ${error.message}`);
    }
  }

  /**
   * Verificar si el usuario tiene MFA activo
   * @returns true si tiene al menos un factor activo
   */
  static async hasActiveMFA(): Promise<boolean> {
    try {
      const factors = await this.listFactors();
      return factors.length > 0;
    } catch (error) {
      console.error("Error al verificar estado MFA:", error);
      return false;
    }
  }

  /**
   * Obtener el primer factor TOTP activo del usuario
   * @returns El factor activo o null si no hay ninguno
   */
  static async getActiveFactor(): Promise<MFAFactor | null> {
    try {
      const factors = await this.listFactors();
      return factors.length > 0 ? factors[0] : null;
    } catch (error) {
      console.error("Error al obtener factor activo:", error);
      return null;
    }
  }

  /**
   * Challenge y verificar código durante el login
   * @param factorId ID del factor a verificar
   * @param code Código de 6 dígitos del autenticador
   * @returns Sesión completa del usuario
   */
  static async challengeAndVerify(factorId: string, code: string) {
    const supabase = createClientSupabase();

    const { data, error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code,
    });

    if (error) {
      throw new Error(`Error al verificar código MFA: ${error.message}`);
    }

    if (!data.session) {
      throw new Error("Error: no se recibió la sesión después de la verificación");
    }

    return data.session;
  }
}
