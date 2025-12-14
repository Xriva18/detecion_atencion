"use client";

import { useState, useEffect, useRef } from "react";
import VideoCanvasBlink from "@/components/Camera/VideoCanvasBlink";
import ConnectionStatusIndicator from "@/components/ConnectionStatusIndicator";
import BlinkCounter from "@/components/Parapadeo/BlinkCounter";
import { useCamera } from "@/hooks/useCamera";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { useSaludo } from "@/hooks/useSaludo";
import {
  obtenerContadorParpadeos,
  reiniciarContadorParpadeos,
} from "@/services/blinkService";
import type { BlinkDetectionResponse } from "@/types/detection";

export default function ParpadeoPage() {
  const { stream, isLoading, error } = useCamera();

  const [isPaused, setIsPaused] = useState(false);
  const [blinkCount, setBlinkCount] = useState(0);
  const [isLoadingCount, setIsLoadingCount] = useState(false);
  const countIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { saludo, saludoError, saludoLoading } = useSaludo();
  const { connectionStatus, handleFrameSent, handleFrameError } =
    useConnectionStatus();

  // Handler para manejar la detección de parpadeos
  const handleBlinkDetection = async (
    response: BlinkDetectionResponse
  ) => {
    // Actualizar estado de conexión
    handleFrameSent(response as any);
    
    // Si se detectó un parpadeo, actualizar el contador
    if (response.blinking) {
      try {
        // Obtener el contador actualizado del servidor
        const countResponse = await obtenerContadorParpadeos();
        setBlinkCount(countResponse.blink_count);
      } catch (error) {
        console.error("Error al obtener contador de parpadeos:", error);
      }
    }
  };

  // Efecto para obtener el contador periódicamente
  useEffect(() => {
    if (!isPaused && connectionStatus === "connected") {
      // Obtener contador inicial
      obtenerContadorParpadeos()
        .then((response) => {
          setBlinkCount(response.blink_count);
        })
        .catch((error) => {
          console.error("Error al obtener contador inicial:", error);
        });

      // Actualizar contador cada 2 segundos
      countIntervalRef.current = setInterval(async () => {
        try {
          setIsLoadingCount(true);
          const response = await obtenerContadorParpadeos();
          setBlinkCount(response.blink_count);
        } catch (error) {
          console.error("Error al actualizar contador:", error);
        } finally {
          setIsLoadingCount(false);
        }
      }, 2000);
    } else {
      // Limpiar intervalo si está pausado o desconectado
      if (countIntervalRef.current) {
        clearInterval(countIntervalRef.current);
        countIntervalRef.current = null;
      }
    }

    return () => {
      if (countIntervalRef.current) {
        clearInterval(countIntervalRef.current);
        countIntervalRef.current = null;
      }
    };
  }, [isPaused, connectionStatus]);

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const resetBlinkCount = async () => {
    try {
      setIsLoadingCount(true);
      const response = await reiniciarContadorParpadeos();
      setBlinkCount(response.blink_count);
    } catch (error) {
      console.error("Error al reiniciar contador:", error);
    } finally {
      setIsLoadingCount(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-7xl flex-col items-center justify-center py-4 px-4 sm:py-8 sm:px-6 lg:px-8 bg-white dark:bg-black">
        <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 lg:gap-8 w-full flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-2">
            Detección de Parpadeos
          </h1>
          
          {isLoading && (
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
              Cargando cámara...
            </p>
          )}

          {error && (
            <div className="text-center w-full max-w-md">
              <p className="text-base sm:text-lg text-red-600 dark:text-red-400 mb-2">
                Error: {error}
              </p>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                Por favor, permite el acceso a la cámara
              </p>
            </div>
          )}

          {!isLoading && !error && (
            <div className="w-full flex flex-col md:flex-row gap-4 sm:gap-6 items-center justify-center">
              {/* Columna izquierda: Video y botón */}
              <div className="flex flex-col items-center gap-3 sm:gap-4 w-full md:w-auto md:flex-shrink-0">
                <ConnectionStatusIndicator status={connectionStatus} />
                <div className="w-full max-w-full md:max-w-none flex justify-center">
                  <VideoCanvasBlink
                    stream={stream}
                    width={640}
                    height={480}
                    isPaused={isPaused}
                    onFrameSent={handleBlinkDetection}
                    onFrameError={handleFrameError}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                  <button
                    onClick={togglePause}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg text-sm sm:text-base"
                  >
                    {isPaused ? "▶ Reanudar Video" : "⏸ Pausar Video"}
                  </button>
                  <button
                    onClick={resetBlinkCount}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg text-sm sm:text-base"
                  >
                    🔄 Reiniciar Contador
                  </button>
                </div>
              </div>

              {/* Columna derecha: Mensaje del servidor y detalles - Solo en md y mayores */}
              <div className="hidden md:flex flex-col gap-3 sm:gap-4 w-auto flex-1 max-w-md lg:max-w-lg items-center justify-center">
                {/* Mensaje del servidor */}
                <div className="w-full p-3 sm:p-4 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <h3 className="text-base sm:text-lg font-semibold text-black dark:text-white mb-2">
                    Mensaje del Servidor:
                  </h3>
                  {saludoLoading && (
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Cargando...
                    </p>
                  )}
                  {saludoError && (
                    <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">
                      Error: {saludoError}
                    </p>
                  )}
                  {saludo && !saludoLoading && (
                    <p className="text-sm sm:text-lg font-medium text-green-600 dark:text-green-400">
                      {saludo}
                    </p>
                  )}
                </div>

                {/* Contador de parpadeos */}
                <div className="w-full p-3 sm:p-4 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <div className="flex justify-center">
                    <BlinkCounter count={blinkCount} />
                  </div>
                  {isLoadingCount && (
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                      Actualizando...
                    </p>
                  )}
                </div>
              </div>

              {/* Columna única para móviles: Mensaje del servidor y detalles */}
              <div className="flex md:hidden flex-col gap-3 sm:gap-4 w-full max-w-md items-center justify-center">
                {/* Mensaje del servidor */}
                <div className="w-full p-3 sm:p-4 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <h3 className="text-base sm:text-lg font-semibold text-black dark:text-white mb-2">
                    Mensaje del Servidor:
                  </h3>
                  {saludoLoading && (
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Cargando...
                    </p>
                  )}
                  {saludoError && (
                    <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">
                      Error: {saludoError}
                    </p>
                  )}
                  {saludo && !saludoLoading && (
                    <p className="text-sm sm:text-lg font-medium text-green-600 dark:text-green-400">
                      {saludo}
                    </p>
                  )}
                </div>

                {/* Contador de parpadeos */}
                <div className="w-full p-3 sm:p-4 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <div className="flex justify-center">
                    <BlinkCounter count={blinkCount} />
                  </div>
                  {isLoadingCount && (
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                      Actualizando...
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

