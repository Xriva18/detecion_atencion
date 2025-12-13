"use client";

import { useState, useEffect } from "react";
import VideoCanvas from "@/components/Camera/VideoCanvas";
import BlinkCounter from "@/components/Parapadeo/BlinkCounter";
import ConnectionStatusIndicator from "@/components/ConnectionStatusIndicator";
import { useCamera } from "@/hooks/useCamera";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { useSaludo } from "@/hooks/useSaludo";
import { useFaceDetection } from "@/hooks/useFaceDetection";

export default function Home() {
  const { stream, isLoading, error } = useCamera();
  const [blinkCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { saludo, saludoError, saludoLoading } = useSaludo();
  const { connectionStatus, handleFrameSent, handleFrameError } =
    useConnectionStatus();
  const { detectionState, updateDetection, startFpsCalculation, stopFpsCalculation } =
    useFaceDetection();

  // Iniciar cálculo de FPS cuando el stream esté disponible
  useEffect(() => {
    if (stream && !isPaused) {
      startFpsCalculation();
    } else {
      stopFpsCalculation();
    }

    return () => {
      stopFpsCalculation();
    };
  }, [stream, isPaused, startFpsCalculation, stopFpsCalculation]);

  // Handler combinado para actualizar detección y estado de conexión
  const handleFrameSentWithDetection = (response: import("@/types/detection").FaceDetectionResponse) => {
    updateDetection(response);
    handleFrameSent(response);
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center py-8 px-4 bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-8">
          {isLoading && (
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Cargando cámara...
            </p>
          )}

          {error && (
            <div className="text-center">
              <p className="text-lg text-red-600 dark:text-red-400 mb-2">
                Error: {error}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Por favor, permite el acceso a la cámara
              </p>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {/* Mensaje del servidor */}
              <div className="w-full max-w-md p-4 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                  Mensaje del Servidor:
                </h3>
                {saludoLoading && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Cargando...
                  </p>
                )}
                {saludoError && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Error: {saludoError}
                  </p>
                )}
                {saludo && !saludoLoading && (
                  <p className="text-lg font-medium text-green-600 dark:text-green-400">
                    {saludo}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-center gap-4">
                <ConnectionStatusIndicator status={connectionStatus} />

                {/* Información de detección y FPS - Solo mostrar si está activo y conectado */}
                {!isPaused && connectionStatus === "connected" && (
                  <div className="w-full max-w-md p-4 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium text-black dark:text-white">
                          Rostro detectado:
                        </span>
                        <span
                          className={`text-lg font-semibold ${
                            detectionState.detected
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {detectionState.detected ? "SÍ" : "NO"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium text-black dark:text-white">
                          FPS:
                        </span>
                        <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                          {detectionState.fps}
                        </span>
                      </div>
                      {detectionState.detected && detectionState.confidence > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Confianza:
                          </span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {(detectionState.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <VideoCanvas
                  stream={stream}
                  width={640}
                  height={480}
                  isPaused={isPaused}
                  onFrameSent={handleFrameSentWithDetection}
                  onFrameError={handleFrameError}
                  faceCoordinates={
                    !isPaused && connectionStatus === "connected" && detectionState.detected
                      ? detectionState.coordinates
                      : null
                  }
                />
                <button
                  onClick={togglePause}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                >
                  {isPaused ? "▶ Reanudar Video" : "⏸ Pausar Video"}
                </button>
              </div>
              <BlinkCounter count={blinkCount} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
