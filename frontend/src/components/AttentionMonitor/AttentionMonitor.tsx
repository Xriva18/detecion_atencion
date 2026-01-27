/**
 * Componente principal de monitoreo de atención.
 * 
 * Integra:
 * - Captura de video de la webcam
 * - Conexión WebSocket al backend
 * - Visualización de métricas (EngagementBar, PoseAxis3D)
 * - Calibración (CalibrationOverlay)
 * - Alertas de foco
 */

"use client";

import React, { useRef, useEffect, useState } from "react";
import { useAttentionMonitor } from "@/hooks/useAttentionMonitor";
import { EngagementBar, EngagementBarCompact } from "./EngagementBar";
import { drawPoseAxis, PoseAxisLegend } from "./PoseAxis3D";
import { CalibrationOverlay } from "./CalibrationOverlay";

// Definición de tipos para el callback
export interface AttentionMetrics {
    score: number;
    status: "engaged" | "distracted" | "asleep" | "unknown";
    faceDetected: boolean;
    isBlinking: boolean;
    gaze: { pitch: number; yaw: number } | null;
    pose: { yaw: number; pitch: number; roll: number } | null;
}

interface AttentionMonitorProps {
    className?: string;
    showDebugInfo?: boolean;
    onAttentionChange?: (score: number, status: "engaged" | "distracted" | "asleep") => void;
    onMetricsUpdate?: (metrics: AttentionMetrics) => void;
}

export function AttentionMonitor({
    className = "",
    showDebugInfo = false,
    onAttentionChange,
    onMetricsUpdate
}: AttentionMonitorProps) {
    // Referencias
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

    // Estado local
    const [cameraReady, setCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);

    // Refs para throttling
    const lastMetricsTimeRef = useRef<number>(0);
    const lastMetricsScoreRef = useRef<number>(0);

    // Callback estable para alertas
    const handleAlert = React.useCallback(() => {
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
    }, []);

    // Hook de monitoreo de atención
    const {
        connectionStatus,
        isConnected,
        attentionScore,
        status,
        gaze,
        pose,
        isBlinking,
        warnings,
        blinksPerMinute,
        faceDetected,
        alertActive,
        isCalibrated,
        isCalibrating,
        startCalibration,
        saveCalibrationPoint,
        finishCalibration,
        resetCalibration,
        connect,
        disconnect
    } = useAttentionMonitor({
        videoRef,
        canvasRef,
        enabled: cameraReady,
        onAlert: handleAlert
    });

    // Notificar cambios de atención con Throttling
    useEffect(() => {
        const now = Date.now();
        const timeDiff = now - lastMetricsTimeRef.current;
        const scoreDiff = Math.abs(attentionScore - lastMetricsScoreRef.current);

        // Criterios de actualización:
        // 1. Han pasado más de 100ms
        // 2. El score cambió más del 5% (0.05)
        // 3. El estado de atención cambió (engaged/distracted/unknown)
        // 4. La detección de rostro cambió
        const isSignificantScoreChange = scoreDiff > 0.05;
        const isTimeDue = timeDiff > 100;

        // Forzar actualización si hay un cambio significativo o si ha pasado suficiente tiempo
        // También forzar si el estado es "unknown" (para notificar faceDetected, etc.)
        // o si el estado de atención ha cambiado (engaged/distracted)
        if (isTimeDue || isSignificantScoreChange || status !== "unknown") {
            if (onAttentionChange && status !== "unknown") {
                onAttentionChange(attentionScore, status);
            }

            if (onMetricsUpdate) {
                onMetricsUpdate({
                    score: attentionScore,
                    status,
                    faceDetected,
                    isBlinking,
                    gaze,
                    pose
                });
            }

            // Actualizar refs solo si notificamos
            lastMetricsTimeRef.current = now;
            lastMetricsScoreRef.current = attentionScore;
        }
    }, [
        attentionScore,
        status,
        faceDetected,
        isBlinking,
        gaze,
        pose,
        onAttentionChange,
        onMetricsUpdate
    ]);

    // Inicializar cámara
    useEffect(() => {
        async function initCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                        facingMode: "user"
                    }
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                    setCameraReady(true);
                    setCameraError(null);
                }
            } catch (error) {
                console.error("[AttentionMonitor] Error accediendo a la cámara:", error);
                setCameraError("No se pudo acceder a la cámara. Verifica los permisos.");
            }
        }

        initCamera();

        // Cleanup
        return () => {
            const video = videoRef.current;
            if (video?.srcObject) {
                const stream = video.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Dibujar overlay con ejes de pose
    useEffect(() => {
        const overlayCanvas = overlayCanvasRef.current;
        const video = videoRef.current;

        if (!overlayCanvas || !video || !pose || !faceDetected) return;

        const ctx = overlayCanvas.getContext("2d");
        if (!ctx) return;

        // Ajustar tamaño del canvas
        if (overlayCanvas.width !== video.videoWidth || overlayCanvas.height !== video.videoHeight) {
            overlayCanvas.width = video.videoWidth || 640;
            overlayCanvas.height = video.videoHeight || 480;
        }

        // Limpiar canvas
        ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

        // Dibujar ejes en el centro (aproximación; idealmente usaríamos la posición de la nariz)
        const noseX = overlayCanvas.width / 2;
        const noseY = overlayCanvas.height / 2 - 20;

        drawPoseAxis(ctx, noseX, noseY, pose, 50);
    }, [pose, faceDetected]);

    return (
        <div className={`relative ${className}`}>
            {/* Contenedor de video */}
            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                {/* Video de la cámara */}
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                />

                {/* Canvas oculto para captura */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Canvas de overlay para visualizaciones */}
                <canvas
                    ref={overlayCanvasRef}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                />

                {/* Error de cámara */}
                {cameraError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90">
                        <div className="text-center p-4">
                            <p className="text-red-400 mb-2">{cameraError}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Reintentar
                            </button>
                        </div>
                    </div>
                )}

                {/* Alerta de foco */}
                {alertActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-900/80 animate-pulse">
                        <div className="text-center p-6">
                            <div className="text-6xl mb-4">⚠️</div>
                            <p className="text-2xl font-bold text-white">¡Atención!</p>
                            <p className="text-red-200 mt-2">Tu nivel de atención ha bajado</p>
                        </div>
                    </div>
                )}

                {/* Indicador de estado de conexión */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" :
                        connectionStatus === "connecting" ? "bg-yellow-500 animate-pulse" :
                            "bg-red-500"
                        }`} />
                    <span className="text-xs text-white bg-black/50 px-2 py-1 rounded">
                        {isConnected ? "Conectado" :
                            connectionStatus === "connecting" ? "Conectando..." :
                                "Desconectado"}
                    </span>
                </div>

                {/* Indicador de rostro */}
                {!faceDetected && cameraReady && (
                    <div className="absolute top-3 left-3 bg-yellow-600/90 text-white text-xs px-2 py-1 rounded">
                        Rostro no detectado
                    </div>
                )}
            </div>

            {/* Panel de métricas */}
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                <EngagementBar score={attentionScore} />

                {/* Estado */}
                <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-gray-400">Estado:</span>
                    <span className={`text-sm font-semibold ${status === "engaged" ? "text-green-400" :
                        status === "distracted" ? "text-red-400" :
                            "text-gray-400"
                        }`}>
                        {status === "engaged" ? "✓ Atento" :
                            status === "distracted" ? "✗ Distraído" :
                                "—"}
                    </span>
                </div>

                {/* Advertencias */}
                {warnings.length > 0 && (
                    <div className="mt-3 p-2 bg-yellow-900/30 rounded border border-yellow-600/50">
                        <p className="text-xs text-yellow-400 font-medium mb-1">Advertencias:</p>
                        <ul className="text-xs text-yellow-300 space-y-1">
                            {warnings.map((w, i) => (
                                <li key={i}>• {w}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Panel de calibración */}
            <div className="mt-4 flex gap-2">
                {!isCalibrated ? (
                    <button
                        onClick={startCalibration}
                        disabled={!isConnected}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        🎯 Calibrar Mirada
                    </button>
                ) : (
                    <button
                        onClick={resetCalibration}
                        className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                        🔄 Recalibrar
                    </button>
                )}

                {isCalibrated && (
                    <span className="flex items-center text-xs text-green-400">
                        ✓ Calibrado
                    </span>
                )}
            </div>

            {/* Info de debug */}
            {showDebugInfo && (
                <div className="mt-4 p-3 bg-gray-900 rounded text-xs font-mono text-gray-400 space-y-1">
                    <div>Gaze: Y={gaze?.yaw?.toFixed(1) || "—"}° P={gaze?.pitch?.toFixed(1) || "—"}°</div>
                    <div>Pose: Y={pose?.yaw?.toFixed(1) || "—"}° P={pose?.pitch?.toFixed(1) || "—"}° R={pose?.roll?.toFixed(1) || "—"}°</div>
                    <div>Blink: {isBlinking ? "Sí" : "No"} | Rate: {blinksPerMinute?.toFixed(1) || "—"}/min</div>
                    <div>EI: {(attentionScore * 100).toFixed(1)}% | Estado: {status}</div>
                    <PoseAxisLegend />
                </div>
            )}

            {/* Overlay de calibración */}
            {isCalibrating && (
                <CalibrationOverlay
                    onPointComplete={saveCalibrationPoint}
                    onCalibrationComplete={finishCalibration}
                    onCancel={() => resetCalibration()}
                />
            )}
        </div>
    );
}

// Exportar componentes auxiliares
export { EngagementBar, EngagementBarCompact } from "./EngagementBar";
export { drawPoseAxis, PoseAxis3D, PoseAxisLegend } from "./PoseAxis3D";
export { CalibrationOverlay } from "./CalibrationOverlay";
