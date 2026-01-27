"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import VideoPlayer from "@/components/Video/VideoPlayer";
import SessionSummaryModal from "@/components/Video/SessionSummaryModal";
import { AttentionMonitor, type AttentionMetrics } from "@/components/AttentionMonitor/AttentionMonitor";

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
  const [attentionLevel, setAttentionLevel] = useState<"Alto" | "Medio" | "Bajo">("Alto");
  const [attentionScore, setAttentionScore] = useState(1.0);
  const [accumulatedAttention, setAccumulatedAttention] = useState<number[]>([]);
  const [showAttentionAlert, setShowAttentionAlert] = useState(false);
  const [attentionMessage, setAttentionMessage] = useState("¡Mantén tu atención en el video!");
  const [faceDetected, setFaceDetected] = useState(true);

  const [isPlaying, setIsPlaying] = useState(false);
  const [pausedTime, setPausedTime] = useState(0);
  const [currentPauseElapsed, setCurrentPauseElapsed] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  const pauseStartTimeRef = useRef<number | null>(null);
  const pausedTimeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lowAttentionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sesión ID y Usuario
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { createClientSupabase } = await import("@/utils/supabase/client");
      const supabase = createClientSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  // Cargar datos del video
  useEffect(() => {
    const fetchData = async () => {
      try {
        const taskRes = await api.get(`/tasks/${videoId}`);
        const task = taskRes.data;
        let className = "Clase";
        const professorName = "Profesor";

        if (task && task.class_id) {
          try {
            const classRes = await api.get(`/classes/${task.class_id}`);
            className = classRes.data.name;
          } catch (err) {
            console.error("Error fetching class info", err);
          }
        }

        setVideoData({
          id: task.id,
          title: task.title,
          description: task.description || "",
          videoUrl: task.video_url,
          videoSummary: task.transcription,
          className: className,
          professor: professorName,
          duration: "10:00",
        });
      } catch (error) {
        console.error("Error fetching video data:", error);
      }
    };

    if (videoId) fetchData();
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

  // --- CALLBACK DE MONITOR DE ATENCIÓN ---
  const handleMetricsUpdate = (metrics: AttentionMetrics) => {
    // 1. Detección de rostro
    setFaceDetected(metrics.faceDetected);

    // Si no hay rostro, actualizar UI y salir
    if (!metrics.faceDetected) {
      setAttentionLevel("Bajo");
      setAttentionMessage("Persona ausente - Vuelve a la cámara ⚠️");
      setAttentionScore(0.0);
      setShowAttentionAlert(true);

      // Acumular 0.0 si está reproduciendo
      if (isPlaying) {
        setAccumulatedAttention(prev => [...prev, 0.0]);
      }
      return;
    }

    // 2. Actualizar Score
    setAttentionScore(metrics.score);

    // 3. Determinar Nivel y Mensaje
    let newLevel: "Alto" | "Medio" | "Bajo";
    let newMessage: string;

    if (metrics.score > 0.7) {
      newLevel = "Alto";
      newMessage = "¡Excelente! Mantén tu enfoque 👁️";
      setShowAttentionAlert(false);
      if (lowAttentionTimerRef.current) {
        clearTimeout(lowAttentionTimerRef.current);
        lowAttentionTimerRef.current = null;
      }
    } else if (metrics.score > 0.4) {
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

    // 4. Acumular atención
    if (isPlaying) {
      setAccumulatedAttention(prev => [...prev, metrics.score]);
    }
  };

  // Handlers de Video Player
  const handlePlayStart = () => {
    setIsPlaying(true);
    if (!sessionId) startSession();
  };

  const handlePlayingChange = (playing: boolean) => {
    if (playing) {
      if (pauseStartTimeRef.current !== null) {
        const elapsed = currentPauseElapsed;
        setPausedTime((prev) => prev + elapsed);
        setCurrentPauseElapsed(0);
        pauseStartTimeRef.current = null;
      }
      if (pausedTimeIntervalRef.current) {
        clearInterval(pausedTimeIntervalRef.current);
        pausedTimeIntervalRef.current = null;
      }
    } else {
      if (pauseStartTimeRef.current === null) {
        pauseStartTimeRef.current = Date.now();
        setCurrentPauseElapsed(0);
      }
      if (!pausedTimeIntervalRef.current) {
        pausedTimeIntervalRef.current = setInterval(() => {
          if (pauseStartTimeRef.current !== null) {
            const elapsed = Math.floor((Date.now() - pauseStartTimeRef.current) / 1000);
            setCurrentPauseElapsed(elapsed);
          }
        }, 1000);
      }
    }
    setIsPlaying(playing);
  };

  const handleFinish = () => {
    setShowSummaryModal(true);
  };

  const handleConfirmFinish = async (level: "alto" | "medio" | "bajo") => {
    setShowSummaryModal(false);
    setIsGeneratingQuiz(true);

    let activeSessionId = sessionId;
    if (!activeSessionId) {
      try {
        const res = await api.post("/sessions/start", {
          student_id: userId,
          task_id: videoId
        });
        activeSessionId = res.data.session.id;
        setSessionId(activeSessionId);
      } catch (e) {
        console.error("Error starting session:", e);
        setIsGeneratingQuiz(false);
        alert("No se pudo iniciar la sesión.");
        return;
      }
    }

    try {
      const res = await api.post("/sessions/end", {
        session_id: activeSessionId,
        attention_level: level,
      });
      const { quiz_id } = res.data;
      setIsGeneratingQuiz(false);
      router.push(`/estudiante/cuestionario/${quiz_id}`);
    } catch (error) {
      console.error("Error generating quiz:", error);
      setIsGeneratingQuiz(false);
      alert("Error al generar el cuestionario.");
    }
  };

  const formatPausedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Cleanup hooks
  useEffect(() => {
    return () => {
      if (pausedTimeIntervalRef.current) clearInterval(pausedTimeIntervalRef.current);
      if (lowAttentionTimerRef.current) clearTimeout(lowAttentionTimerRef.current);
    };
  }, []);

  if (!videoData) return <div className="p-10 text-center text-white">Cargando video...</div>;

  if (isGeneratingQuiz) {
    return (
      <div className="flex flex-col h-screen w-full overflow-hidden bg-white text-[#111318] items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Generando Cuestionario...</h2>
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background-light text-[#111318]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#e5e7eb] px-6 py-3 bg-white z-20 h-16 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 text-[#616f89]">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="text-base font-bold text-[#111318]">{videoData.title}</h2>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push(`/estudiante/clases/${classId}/videos`)} className="text-[#616f89] hover:bg-gray-100 p-2 rounded-full">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex overflow-hidden relative">

        {/* Video Player */}
        <VideoPlayer
          videoUrl={videoData.videoUrl}
          attentionLevel={attentionLevel}
          faceDetected={faceDetected}
          attentionMessage={attentionMessage}
          showAttentionAlert={showAttentionAlert}
          onFinish={handleFinish}
          onPlayStart={handlePlayStart}
          onPlayingChange={handlePlayingChange}
          onDurationChange={setVideoDuration}
        />

        {/* Sidebar */}
        <aside className="w-80 bg-white border-l border-[#e5e7eb] flex flex-col shrink-0 z-20 h-full overflow-y-auto">
          {/* Monitor de Atención Integrado */}
          <div className="p-4 border-b border-[#e5e7eb]">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Monitor de Atención</h3>
            {showSummaryModal ? (
              <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-sm text-gray-500">Sesión Finalizada</p>
              </div>
            ) : (
              <AttentionMonitor
                className="w-full"
                onMetricsUpdate={handleMetricsUpdate}
                showDebugInfo={false}
              />
            )}
          </div>

          {/* Info Video */}
          <div className="p-4 flex-1">
            <h3 className="text-lg font-bold mb-2">{videoData.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{videoData.description}</p>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Tiempo en pausa:</span>
                <span className="font-bold">{formatPausedTime(pausedTime + currentPauseElapsed)}</span>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>Finalizar Video</span>
            </button>
          </div>
        </aside>
      </main>

      {/* Modal Resumen */}
      <SessionSummaryModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        onConfirm={handleConfirmFinish}
        pausedTime={pausedTime + currentPauseElapsed}
        accumulatedAttention={accumulatedAttention}
        totalVideoTime={videoDuration || 1}
      />
    </div>
  );
}
