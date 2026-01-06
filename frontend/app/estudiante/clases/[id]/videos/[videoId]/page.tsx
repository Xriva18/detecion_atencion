"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import VideoCanvasBlink from "@/components/Camera/VideoCanvasBlink";
import VideoPlayer from "@/components/Video/VideoPlayer";
import type { CombinedDetectionResponse } from "@/types/detection";

interface VideoData {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  videoSummary?: string;
  className: string;
  professor: string;
  duration: string;
}

export default function VerVideoPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;
  const videoId = params.videoId as string;

  const [videoData, setVideoData] = useState<VideoData | null>(null);

  // Estados de Atención
  const [attentionLevel, setAttentionLevel] = useState<
    "Alto" | "Medio" | "Bajo"
  >("Alto");
  const [attentionScore, setAttentionScore] = useState(1.0); // 0.0 a 1.0
  const [accumulatedAttention, setAccumulatedAttention] = useState<number[]>(
    []
  );
  const [showAttentionAlert, setShowAttentionAlert] = useState(false);
  const [attentionMessage, setAttentionMessage] = useState(
    "¡Mantén tu atención en el video!"
  );
  const [faceDetected, setFaceDetected] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const lowAttentionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sesión ID
  const [sessionId, setSessionId] = useState<string | null>(null);
  // Usuario Mock (Demo UUID válido en BD)
  const userId = "32545b5a-71d3-4348-bc25-e0e4b8e31fa8";

  // Stream de cámara
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Inicializar cámara
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: false,
        });
        currentStream = mediaStream;
        setStream(mediaStream);
      } catch (err) {
        console.error("Error accediendo a la cámara:", err);
      }
    };
    initCamera();

    // Cleanup
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
      if (lowAttentionTimerRef.current) {
        clearTimeout(lowAttentionTimerRef.current);
      }
    };
  }, []);

  // Cargar datos del video
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Obtener detalles de la tarea/video
        const taskRes = await api.get(`/tasks/${videoId}`);
        const task = taskRes.data;

        // 2. Obtener detalles de la clase (para nombre y profesor)
        let className = "Clase";
        const professorName = "Profesor";

        if (task && task.class_id) {
          try {
            const classRes = await api.get(`/classes/${task.class_id}`);
            className = classRes.data.name;
            // Si el endpoint de clase devuelve nombre de profesor, úsalo, si no, placeholder
            // (De momento el backend no devuelve el nombre del profesor en /classes/{id}, solo el ID)
          } catch (err) {
            console.error("Error fetching class info", err);
          }
        }

        setVideoData({
          id: task.id,
          title: task.title,
          description: task.description || "",
          videoUrl: task.video_url,
          videoSummary: task.video_summary, // Importante para el quiz
          className: className,
          professor: professorName,
          duration: "10:00", // Placeholder, o podrías obtenerlo de los metadatos del video
        });
      } catch (error) {
        console.error("Error fetching video data:", error);
      }
    };

    if (videoId) {
      fetchData();
    }
  }, [videoId]);

  // Manejar inicio de sesión de estudio
  const startSession = async () => {
    try {
      const res = await api.post("/sessions/start", {
        student_id: userId,
        task_id: videoId,
      });
      setSessionId(res.data.session.id);
      console.log("Sesión iniciada:", res.data.session.id);
    } catch (e) {
      console.error("Error iniciando sesión", e);
    }
  };

  // Historial de detecciones para suavizado
  const blinkHistoryRef = useRef<boolean[]>([]);

  // Callback del componente de detección de parpadeos/atención
  const handleAttentionUpdate = (data: CombinedDetectionResponse) => {
    // Actualizar estado de detección de rostro
    setFaceDetected(data.faceDetected);

    // Verificar primero si hay rostro detectado
    // Si no hay persona, marcar inmediatamente como distraído
    if (!data.faceDetected) {
      setAttentionLevel("Bajo");
      setAttentionMessage("Persona ausente - Vuelve a la cámara ⚠️");
      setAttentionScore(0.0);
      setShowAttentionAlert(true);

      // Agregar al historial como "no atento"
      blinkHistoryRef.current.push(true);
      if (blinkHistoryRef.current.length > 10) {
        blinkHistoryRef.current.shift();
      }

      // Debug logging
      console.log(`[Atención] Persona ausente - Marcado como distraído`);

      // Acumular datos de atención mientras se reproduce
      if (isPlaying) {
        setAccumulatedAttention((prev) => [...prev, 0.0]);
      }
      return;
    }

    // Si hay rostro, usar la lógica de parpadeo
    // La API devuelve: { blinking: boolean, left_ear: number, right_ear: number }
    // blinking: true = ojos cerrados/parpadeando (EAR < 1.55) = NO atento
    // blinking: false = ojos abiertos (EAR >= 1.55) = SÍ atento
    const isNotAttentive = data.blinking === true;

    // Agregar al historial (mantener últimas 10 detecciones = ~3 segundos a 300ms/frame)
    blinkHistoryRef.current.push(isNotAttentive);
    if (blinkHistoryRef.current.length > 10) {
      blinkHistoryRef.current.shift();
    }

    // Contar cuántos frames de "no atención" en el historial
    const notAttentiveCount = blinkHistoryRef.current.filter((b) => b).length;
    const historyLength = blinkHistoryRef.current.length;

    // Calcular score: 1.0 = muy atento, 0.0 = muy distraído
    let currentScore: number;

    if (historyLength < 3) {
      currentScore = 1.0; // No hay suficientes datos
    } else {
      // Score inverso a la cantidad de frames "no atento"
      // 0 no atento de 10 = score 1.0
      // 5 no atento de 10 = score 0.5
      // 10 no atento de 10 = score 0.0
      currentScore = 1.0 - notAttentiveCount / historyLength;
    }

    // Suavizado exponencial más rápido para mejor respuesta
    const newScore = attentionScore * 0.6 + currentScore * 0.4;
    setAttentionScore(newScore);

    // Debug logging
    console.log(
      `[Atención] faceDetected=${data.faceDetected}, blinking=${
        data.blinking
      }, noAtento:${notAttentiveCount}/${historyLength}, score=${newScore.toFixed(
        2
      )}`
    );

    // Actualizar nivel de atención y mensajes
    let newLevel: "Alto" | "Medio" | "Bajo";
    let newMessage: string;

    if (newScore > 0.7) {
      newLevel = "Alto";
      newMessage = "¡Excelente! Mantén tu enfoque 👁️";
      setShowAttentionAlert(false);
      if (lowAttentionTimerRef.current) {
        clearTimeout(lowAttentionTimerRef.current);
        lowAttentionTimerRef.current = null;
      }
    } else if (newScore > 0.4) {
      newLevel = "Medio";
      newMessage = "Tu atención está bajando... 👀";
      if (!lowAttentionTimerRef.current) {
        lowAttentionTimerRef.current = setTimeout(() => {
          setShowAttentionAlert(true);
        }, 2000);
      }
    } else {
      newLevel = "Bajo";
      newMessage = "¡Atención! Vuelve a enfocarte en el video ⚠️";
      setShowAttentionAlert(true);
    }

    setAttentionLevel(newLevel);
    setAttentionMessage(newMessage);

    // Acumular datos de atención mientras se reproduce
    if (isPlaying) {
      setAccumulatedAttention((prev) => [...prev, currentScore]);
    }
  };

  const handlePlayStart = () => {
    setIsPlaying(true);
    if (!sessionId) startSession();
  };

  const handleFinish = async () => {
    let activeSessionId = sessionId;

    if (!activeSessionId) {
      // Si no hay sesión iniciada, intentar iniciarla ahora para poder generar el quiz
      try {
        const res = await api.post("/sessions/start", {
          student_id: userId,
          task_id: videoId,
        });
        activeSessionId = res.data.session.id;
        setSessionId(activeSessionId);
      } catch (e) {
        console.error("Error starting session explicitly for finish:", e);
        alert("No se pudo iniciar la sesión para generar el cuestionario.");
        return;
      }
    }

    const avgAttention =
      accumulatedAttention.length > 0
        ? accumulatedAttention.reduce((a, b) => a + b, 0) /
          accumulatedAttention.length
        : 1.0;

    try {
      const res = await api.post("/sessions/end", {
        session_id: activeSessionId,
        attention_score_avg: avgAttention,
      });
      const { quiz_id } = res.data;
      router.push(`/estudiante/cuestionario/${quiz_id}`);
    } catch (error) {
      console.error("Error generating quiz:", error);
      alert("Error al finalizar la sesión. Intenta de nuevo.");
    }
  };

  if (!videoData)
    return <div className="p-10 text-center text-white">Cargando video...</div>;

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background-light text-[#111318]">
      {/* Top Navigation */}
      <header className="flex items-center justify-between border-b border-[#e5e7eb] px-6 py-3 bg-white z-20 h-16 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors text-[#616f89]"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="text-base font-bold text-[#111318]">
            {videoData.title}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/estudiante/clases/${classId}/videos`)}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors text-[#616f89]"
            title="Volver a videos"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors">
            <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
              SO
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Video Player Section */}
        <VideoPlayer
          videoUrl={videoData.videoUrl}
          attentionLevel={attentionLevel}
          faceDetected={faceDetected}
          attentionMessage={attentionMessage}
          showAttentionAlert={showAttentionAlert}
          onFinish={handleFinish}
          onPlayStart={handlePlayStart}
          onPlayingChange={setIsPlaying}
        />

        {/* Sidebar (Right) */}
        <aside className="w-80 bg-white border-l border-[#e5e7eb] flex flex-col shrink-0 z-20 fixed right-0 top-16 h-[calc(100vh-4rem)] lg:relative lg:top-0 lg:h-auto transition-transform duration-300 translate-x-0 lg:flex">
          {/* User Camera Preview */}
          <div className="p-4 border-b border-[#e5e7eb]">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">
              Monitor de Atención
            </h3>
            <div className="w-full aspect-video bg-black/80 rounded-lg border-2 border-[#e5e7eb] overflow-hidden shadow-lg relative">
              <VideoCanvasBlink
                isActive={true}
                stream={stream}
                onBlink={handleAttentionUpdate}
                width={280}
                height={210}
              />
              <div
                className={`absolute bottom-0 left-0 right-0 px-3 py-2 flex flex-col items-center gap-1 transition-all duration-300 ${
                  attentionLevel === "Alto"
                    ? "bg-green-900/70"
                    : attentionLevel === "Medio"
                    ? "bg-yellow-900/70"
                    : "bg-red-900/70"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      attentionLevel === "Alto"
                        ? "bg-green-400 animate-pulse"
                        : attentionLevel === "Medio"
                        ? "bg-yellow-400 animate-pulse"
                        : "bg-red-400 animate-ping"
                    }`}
                  ></div>
                  <span
                    className={`text-xs font-bold uppercase tracking-wide ${
                      attentionLevel === "Alto"
                        ? "text-green-300"
                        : attentionLevel === "Medio"
                        ? "text-yellow-300"
                        : "text-red-300"
                    }`}
                  >
                    {attentionLevel === "Alto"
                      ? "✓ Atento"
                      : attentionLevel === "Medio"
                      ? "⚠ Atención Media"
                      : "⚠ Distraído"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Video Details */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4">
              <div>
                <h3 className="text-lg font-bold text-[#111318] mb-2">
                  {videoData.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {videoData.description}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-[#616f89]">
                    <span className="material-symbols-outlined text-[18px]">
                      school
                    </span>
                    <span>{videoData.className}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#616f89]">
                    <span className="material-symbols-outlined text-[18px]">
                      person
                    </span>
                    <span>{videoData.professor}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Notice and Button */}
            <div className="p-4 pt-0 border-t border-[#e5e7eb] flex flex-col gap-3 shrink-0">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-[18px] mt-0.5">
                    info
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-blue-900 mb-1">
                      Nota de Privacidad
                    </p>
                    <p className="text-[10px] text-blue-800 leading-relaxed">
                      Se están tomando datos biométricos para evaluar tu
                      atención.
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleFinish}
                className="w-full px-4 py-3 bg-primary hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
              >
                <span>Finalizar Video</span>
                <span className="material-symbols-outlined text-lg">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
