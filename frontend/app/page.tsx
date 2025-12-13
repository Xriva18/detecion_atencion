"use client";

import { useState, useEffect, useRef } from "react";
import VideoCanvas from "@/components/Camera/VideoCanvas";
import BlinkCounter from "@/components/Parapadeo/BlinkCounter";
import { useCamera } from "@/hooks/useCamera";
import { obtenerSaludo } from "@/services/checkService";
import type { FaceDetectionResponse } from "@/services/detectionService";
import { ApiError, ErrorType } from "@/services/error";

type ConnectionStatus = "connected" | "disconnected" | "checking";

export default function Home() {
  const { stream, isLoading, error } = useCamera();
  const [blinkCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [saludo, setSaludo] = useState<string | null>(null);
  const [saludoError, setSaludoError] = useState<string | null>(null);
  const [saludoLoading, setSaludoLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("checking");
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;

    const cargarSaludo = async () => {
      try {
        setSaludoLoading(true);
        setSaludoError(null);
        const respuesta = await obtenerSaludo();

        // Solo actualizar el estado si el componente sigue montado
        if (isMounted) {
          setSaludo(respuesta.mensaje);
        }
      } catch (error) {
        // Solo actualizar el estado si el componente sigue montado
        if (isMounted) {
          setSaludoError(
            error instanceof Error ? error.message : "Error desconocido"
          );
        }
        // Log del error para debugging
        console.error("Error al cargar saludo:", error);
      } finally {
        if (isMounted) {
          setSaludoLoading(false);
        }
      }
    };

    cargarSaludo();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  // Callback cuando se envía un frame exitosamente
  const handleFrameSent = (response: FaceDetectionResponse) => {
    setConnectionStatus("connected");
    // Limpiar timeout anterior si existe
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
    // Si no hay respuesta en 1 segundo, marcar como desconectado
    connectionTimeoutRef.current = setTimeout(() => {
      setConnectionStatus("disconnected");
    }, 1000);
  };

  // Callback cuando hay error al enviar frame
  const handleFrameError = (error: Error) => {
    // Solo marcar como desconectado si es un error de red o timeout
    if (error instanceof ApiError) {
      if (
        error.type === ErrorType.NETWORK_ERROR ||
        error.type === ErrorType.TIMEOUT_ERROR ||
        error.type === ErrorType.CORS_ERROR
      ) {
        setConnectionStatus("disconnected");
      }
    } else {
      // Para otros errores, también marcar como desconectado
      setConnectionStatus("disconnected");
    }
  };

  // Cleanup del timeout al desmontar
  useEffect(() => {
    return () => {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
    };
  }, []);

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
                {/* Indicador de estado de conexión */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      connectionStatus === "connected"
                        ? "bg-green-500"
                        : connectionStatus === "disconnected"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    }`}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {connectionStatus === "connected"
                      ? "Conectado"
                      : connectionStatus === "disconnected"
                      ? "Desconectado"
                      : "Verificando..."}
                  </span>
                </div>

                <VideoCanvas
                  stream={stream}
                  width={640}
                  height={480}
                  isPaused={isPaused}
                  onFrameSent={handleFrameSent}
                  onFrameError={handleFrameError}
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
