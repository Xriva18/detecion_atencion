"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { MFAService } from "@/services/auth/mfaService";

interface MFAActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MFAActivationModal({
  isOpen,
  onClose,
  onSuccess,
}: MFAActivationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [factorId, setFactorId] = useState<string>("");
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [mounted, setMounted] = useState(false);
  const verificationSuccessRef = useRef(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const factorIdRef = useRef<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Inicializar MFA solo una vez cuando se abre el modal
  useEffect(() => {
    if (!isOpen || factorId) return;

    const initializeMFA = async () => {
      setIsLoading(true);
      setError("");

      try {
        const result = await MFAService.enrollMFA();

        setQrCode(result.qr_code);
        setSecret(result.secret);
        setFactorId(result.factorId);
        factorIdRef.current = result.factorId; // Guardar en ref también
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al inicializar MFA";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    initializeMFA();
  }, [isOpen, factorId]);

  const handleCodeChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError("");

    // Auto-avanzar al siguiente input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verificar cuando se complete el código
    if (value && index === 5) {
      const codeString = newCode.join("");
      if (codeString.length === 6) {
        setTimeout(() => handleVerify(), 300);
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newCode = [...code];
      newCode[index - 1] = "";
      setCode(newCode);
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === "Enter" && code.join("").length === 6) {
      handleVerify();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newCode = pastedData.split("").slice(0, 6);
      while (newCode.length < 6) {
        newCode.push("");
      }
      setCode(newCode);
      const lastIndex = Math.min(pastedData.length - 1, 5);
      inputRefs.current[lastIndex]?.focus();

      // Auto-verificar si el código está completo
      if (pastedData.length === 6) {
        setTimeout(() => handleVerify(), 300);
      }
    }
  };

  const handleVerify = async () => {
    const codeString = code.join("");
    if (codeString.length !== 6) {
      setError("Por favor, ingresa el código completo de 6 dígitos.");
      return;
    }

    // Usar el ref como respaldo si el estado se perdió
    const currentFactorId = factorId || factorIdRef.current;

    if (!currentFactorId) {
      setError(
        "Error: No se encontró el factor MFA. Por favor, cierra este modal e intenta activar nuevamente."
      );
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      await MFAService.verifyMFA(currentFactorId, codeString);
      verificationSuccessRef.current = true;
      onSuccess();
      handleClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al verificar código";
      setError(errorMessage);
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = async () => {
    // Si hay un factorId pero NO se verificó exitosamente, eliminarlo
    const currentFactorId = factorId || factorIdRef.current;
    if (currentFactorId && !verificationSuccessRef.current) {
      try {
        await MFAService.unenrollFactor(currentFactorId);
      } catch (err) {
        console.error("Error al eliminar factor no verificado:", err);
      }
    }

    // Limpiar estado
    setCode(["", "", "", "", "", ""]);
    setError("");
    setQrCode("");
    setSecret("");
    setFactorId("");
    factorIdRef.current = "";
    setShowSecret(false);
    verificationSuccessRef.current = false;
    setIsLoading(false);
    setIsVerifying(false);
    onClose();
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      style={{ backdropFilter: "blur(4px)" }}
    >
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <span className="material-symbols-outlined text-4xl text-primary animate-spin mb-4">
                sync
              </span>
              <p className="text-gray-600">
                Inicializando autenticación de dos factores...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="mb-6 flex items-center justify-center size-16 rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[32px]">
                  lock_person
                </span>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Activar Autenticación de Dos Factores
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Escanea el código QR y luego ingresa el código de verificación
              </p>

              {qrCode && (
                <div className="mb-6 p-4 bg-white border-2 border-gray-200 rounded-lg">
                  <img
                    src={qrCode}
                    alt="QR Code para MFA"
                    className="w-64 h-64 mx-auto"
                  />
                </div>
              )}

              <div className="w-full mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Código de respaldo (guárdalo en un lugar seguro)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="text-sm text-primary hover:text-blue-700"
                  >
                    {showSecret ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
                {showSecret && secret && (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <code className="text-sm font-mono text-gray-800 break-all">
                      {secret}
                    </code>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 w-full">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Instrucciones:</span>
                  <br />
                  1. Abre Google Authenticator o una app similar
                  <br />
                  2. Escanea el código QR de arriba
                  <br />
                  3. Ingresa el código de 6 dígitos que aparece en la app
                </p>
              </div>

              {error && (
                <div className="w-full mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="w-full mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                  Código de verificación
                </label>
                <div className="flex justify-center">
                  <fieldset className="flex gap-2 sm:gap-3">
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        className="flex h-12 w-10 sm:h-14 sm:w-12 text-center bg-gray-50 border-b-2 border-gray-300 rounded-t-md focus:border-primary focus:bg-white focus:outline-none text-xl sm:text-2xl font-bold transition-all caret-primary text-gray-900"
                        inputMode="numeric"
                        maxLength={1}
                        type="text"
                        value={digit}
                        onChange={(e) =>
                          handleCodeChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        disabled={isVerifying}
                      />
                    ))}
                  </fieldset>
                </div>
              </div>

              <button
                onClick={handleVerify}
                disabled={isVerifying || code.join("").length !== 6}
                className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">
                      sync
                    </span>
                    Verificando...
                  </>
                ) : (
                  <>
                    Verificar y Activar
                    <span className="material-symbols-outlined">check</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
