"use client";

import { useRef, useEffect } from "react";
import type { VideoCanvasBlinkProps } from "@/types";
import { enviarFrameParaParpadeo } from "@/services/blinkService";

export default function VideoCanvasBlink({
  stream,
  width = 640,
  height = 480,
  isPaused = false,
  isActive = true,
  onFrameSent,
  onBlink,
  onFrameError,
}: VideoCanvasBlinkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Refs para callbacks para evitar recreación del intervalo
  const onFrameSentRef = useRef(onFrameSent);
  const onBlinkRef = useRef(onBlink);
  const onFrameErrorRef = useRef(onFrameError);

  // Actualizar refs cuando cambien los callbacks
  useEffect(() => {
    onFrameSentRef.current = onFrameSent;
    onBlinkRef.current = onBlink;
    onFrameErrorRef.current = onFrameError;
  }, [onFrameSent, onBlink, onFrameError]);

  useEffect(() => {
    if (!stream || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    video.srcObject = stream;
    video.play();

    const drawFrame = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // Dibujar el frame del video
        ctx.drawImage(video, 0, 0, width, height);
      }
      requestAnimationFrame(drawFrame);
    };

    video.addEventListener("loadedmetadata", () => {
      canvas.width = width;
      canvas.height = height;
      drawFrame();
    });

    return () => {
      video.srcObject = null;
    };
  }, [stream, width, height]);

  // Efecto para pausar/reanudar el video
  useEffect(() => {
    if (!stream) return;

    const tracks = stream.getVideoTracks();
    tracks.forEach((track) => {
      // Usar enabled en lugar de stop para poder reanudar
      track.enabled = !isPaused;
    });

    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch((err) => {
          console.error("Error al reproducir video:", err);
        });
      }
    }
  }, [isPaused, stream]);

  // Efecto para capturar frames cada 500ms (más estable)
  useEffect(() => {
    console.log('[VideoCanvasBlink] Efecto captura ejecutándose:', {
      hasStream: !!stream,
      hasCanvas: !!canvasRef.current,
      isPaused,
      isActive
    });

    if (!stream || !canvasRef.current || isPaused || !isActive) {
      console.log('[VideoCanvasBlink] ⏸️ Captura detenida por condiciones');
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
        captureIntervalRef.current = null;
      }
      return;
    }

    // Si ya hay un intervalo activo, no crear otro
    if (captureIntervalRef.current) {
      console.log('[VideoCanvasBlink] ⏭️ Intervalo ya existe, no recrear');
      return;
    }

    // Función para capturar frame y enviarlo al backend
    const capturarFrame = async () => {
      if (!canvasRef.current) {
        console.log('[VideoCanvasBlink] ❌ No hay canvas');
        return;
      }

      try {
        const canvas = canvasRef.current;
        // Convertir canvas a base64
        const base64Image = canvas.toDataURL("image/jpeg", 0.8);

        // Enviar al backend para detección de parpadeos
        const response = await enviarFrameParaParpadeo(base64Image);

        console.log('[VideoCanvasBlink] ✅ Frame enviado, respuesta:', response);

        // Llamar callbacks si están disponibles (usando refs)
        if (onFrameSentRef.current) {
          onFrameSentRef.current(response);
        }
        if (onBlinkRef.current) {
          onBlinkRef.current(response);
        }
      } catch (error) {
        console.error("[VideoCanvasBlink] ❌ Error capturando frame:", error);
        if (onFrameErrorRef.current) {
          onFrameErrorRef.current(
            error instanceof Error ? error : new Error("Error desconocido")
          );
        }
      }
    };

    // Esperar a que el canvas esté listo
    const checkCanvasReady = () => {
      if (canvasRef.current && canvasRef.current.width > 0) {
        console.log('[VideoCanvasBlink] 🚀 Canvas listo, iniciando captura cada 500ms');
        // Iniciar captura inmediata
        capturarFrame();
        // Luego cada 500ms
        captureIntervalRef.current = setInterval(() => {
          capturarFrame();
        }, 500);
      } else {
        console.log('[VideoCanvasBlink] ⏳ Esperando canvas...');
        setTimeout(checkCanvasReady, 200);
      }
    };

    checkCanvasReady();

    // Cleanup: limpiar intervalo al desmontar
    return () => {
      console.log('[VideoCanvasBlink] 🧹 Limpiando intervalo');
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
        captureIntervalRef.current = null;
      }
    };
    // Solo recrear el efecto cuando stream, isPaused o isActive cambian
    // NO incluir callbacks para evitar recreación constante
  }, [stream, isPaused, isActive]);

  if (!stream) {
    return (
      <div
        className="flex items-center justify-center bg-gray-200 dark:bg-gray-800 rounded-lg w-full max-w-full"
        style={{ maxWidth: `${width}px`, aspectRatio: `${width}/${height}` }}
      >
        <p className="text-gray-500 dark:text-gray-400">
          No hay señal de video disponible
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-full">
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
        autoPlay
      />
      <canvas
        ref={canvasRef}
        className="rounded-lg border-2 border-gray-300 dark:border-gray-700 w-full h-auto max-w-full"
        style={{
          maxWidth: `${width}px`,
          aspectRatio: `${width}/${height}`,
          transform: 'scaleX(-1)'
        }}
      />
    </div>
  );
}

