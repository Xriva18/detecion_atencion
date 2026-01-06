"use client";

import { useState, useEffect, useCallback } from "react";
import { MFAService, MFAFactor } from "@/services/auth/mfaService";

export interface UseMFAReturn {
  isMFAEnabled: boolean;
  loading: boolean;
  error: string | null;
  factors: MFAFactor[];
  enrollMFA: () => Promise<{
    qr_code: string;
    secret: string;
    factorId: string;
  }>;
  verifyMFA: (factorId: string, code: string) => Promise<void>;
  disableMFA: () => Promise<void>;
  checkMFAStatus: () => Promise<void>;
  refreshFactors: () => Promise<void>;
}

/**
 * Hook para gestionar el estado de MFA del usuario
 */
export function useMFA(): UseMFAReturn {
  const [isMFAEnabled, setIsMFAEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [factors, setFactors] = useState<MFAFactor[]>([]);

  /**
   * Verificar el estado actual de MFA
   */
  const checkMFAStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const hasMFA = await MFAService.hasActiveMFA();
      setIsMFAEnabled(hasMFA);
      
      if (hasMFA) {
        const factorsList = await MFAService.listFactors();
        setFactors(factorsList);
      } else {
        setFactors([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al verificar estado MFA";
      setError(errorMessage);
      setIsMFAEnabled(false);
      setFactors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refrescar la lista de factores
   */
  const refreshFactors = useCallback(async () => {
    try {
      const factorsList = await MFAService.listFactors();
      setFactors(factorsList);
      setIsMFAEnabled(factorsList.length > 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al refrescar factores";
      setError(errorMessage);
    }
  }, []);

  /**
   * Activar MFA (enroll)
   */
  const enrollMFA = useCallback(async () => {
    try {
      setError(null);
      const result = await MFAService.enrollMFA();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al activar MFA";
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Verificar código durante activación
   */
  const verifyMFA = useCallback(async (factorId: string, code: string) => {
    try {
      setError(null);
      await MFAService.verifyMFA(factorId, code);
      // Actualizar estado después de verificar
      await checkMFAStatus();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al verificar código";
      setError(errorMessage);
      throw err;
    }
  }, [checkMFAStatus]);

  /**
   * Desactivar MFA
   */
  const disableMFA = useCallback(async () => {
    try {
      setError(null);
      
      // Obtener factores activos
      const activeFactors = await MFAService.listFactors();
      
      if (activeFactors.length === 0) {
        throw new Error("No hay factores MFA activos para desactivar");
      }

      // Desactivar todos los factores (normalmente solo hay uno)
      for (const factor of activeFactors) {
        await MFAService.unenrollFactor(factor.id);
      }

      // Actualizar estado
      setIsMFAEnabled(false);
      setFactors([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al desactivar MFA";
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Verificar estado al montar el componente
  useEffect(() => {
    checkMFAStatus();
  }, [checkMFAStatus]);

  return {
    isMFAEnabled,
    loading,
    error,
    factors,
    enrollMFA,
    verifyMFA,
    disableMFA,
    checkMFAStatus,
    refreshFactors,
  };
}
