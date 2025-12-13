"use client";

import { useRef, useEffect } from "react";
import type { VideoCanvasProps } from "@/types";

export default function VideoCanvas({
  stream,
  width = 640,
  height = 480,
}: VideoCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  if (!stream) {
    return (
      <div className="flex items-center justify-center bg-gray-200 dark:bg-gray-800 rounded-lg" style={{ width, height }}>
        <p className="text-gray-500 dark:text-gray-400">
          No hay señal de video disponible
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
        autoPlay
      />
      <canvas
        ref={canvasRef}
        className="rounded-lg border-2 border-gray-300 dark:border-gray-700"
        style={{ width, height }}
      />
    </div>
  );
}

