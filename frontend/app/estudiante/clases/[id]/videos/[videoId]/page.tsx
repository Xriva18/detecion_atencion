"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import VideoCanvasBlink from "@/components/Camera/VideoCanvasBlink";

export default function VerVideoPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;
  const videoId = params.videoId as string;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoData, setVideoData] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  // Estados de Atención
  const [attentionLevel, setAttentionLevel] = useState<"Alto" | "Medio" | "Bajo">("Alto");
  const [attentionScore, setAttentionScore] = useState(1.0); // 0.0 a 1.0
  const [accumulatedAttention, setAccumulatedAttention] = useState<number[]>([]);
  const [showAttentionAlert, setShowAttentionAlert] = useState(false);
  const [attentionMessage, setAttentionMessage] = useState("¡Mantén tu atención en el video!");
  const lowAttentionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [showControls, setShowControls] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sesión ID
  const [sessionId, setSessionId] = useState<string | null>(null);
  // Usuario Mock (Demo UUID válido en BD)
  const userId = "32545b5a-71d3-4348-bc25-e0e4b8e31fa8";

  // Stream de cámara
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Inicializar cámara
  useEffect(() => {
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: false
        });
        setStream(mediaStream);
      } catch (err) {
        console.error("Error accediendo a la cámara:", err);
      }
    };
    initCamera();

    // Cleanup
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (lowAttentionTimerRef.current) {
        clearTimeout(lowAttentionTimerRef.current);
      }
      // Cancelar cualquier reproducción pendiente
      if (playPromiseRef.current) {
        playPromiseRef.current.catch(() => {
          // Ignorar errores de cancelación
        });
        playPromiseRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
        videoRef.current.load();
      }
    };
  }, []);

  // Cargar datos del video
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cancelar cualquier reproducción anterior
        if (videoRef.current && playPromiseRef.current) {
          try {
            await playPromiseRef.current;
          } catch (e) {
            // Ignorar errores de cancelación
          }
          videoRef.current.pause();
          videoRef.current.load(); // Recargar el video
        }
        
        setIsVideoReady(false);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);

        // 1. Obtener detalles de la tarea/video
        const taskRes = await api.get(`/tasks/${videoId}`);
        const task = taskRes.data;

        // 2. Obtener detalles de la clase (para nombre y profesor)
        let className = "Clase";
        let professorName = "Profesor";

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
          duration: "10:00" // Placeholder, o podrías obtenerlo de los metadatos del video
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
      const res = await api.post('/sessions/start', {
        student_id: userId,
        task_id: videoId
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
  const handleAttentionUpdate = (data: any) => {
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
    const notAttentiveCount = blinkHistoryRef.current.filter(b => b).length;
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
      currentScore = 1.0 - (notAttentiveCount / historyLength);
    }

    // Suavizado exponencial más rápido para mejor respuesta
    const newScore = attentionScore * 0.6 + currentScore * 0.4;
    setAttentionScore(newScore);

    // Debug logging
    console.log(`[Atención] blinking=${data.blinking}, noAtento:${notAttentiveCount}/${historyLength}, score=${newScore.toFixed(2)}`);

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
      setAccumulatedAttention(prev => [...prev, currentScore]);
    }
  };

  const handlePlayPause = async () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      // Pausar el video
      videoRef.current.pause();
      setIsPlaying(false);
      // Cancelar cualquier promesa de reproducción pendiente
      if (playPromiseRef.current) {
        try {
          await playPromiseRef.current;
        } catch (e) {
          // Ignorar errores de cancelación
        }
        playPromiseRef.current = null;
      }
    } else {
      // Reproducir el video
      if (!isVideoReady) {
        console.log("Video aún no está listo para reproducir");
        return;
      }

      try {
        // Cancelar cualquier reproducción anterior pendiente
        if (playPromiseRef.current) {
          try {
            await playPromiseRef.current;
          } catch (e) {
            // Ignorar errores de cancelación
          }
        }

        // Intentar reproducir
        playPromiseRef.current = videoRef.current.play();
        await playPromiseRef.current;
        setIsPlaying(true);
        if (!sessionId) startSession();
        playPromiseRef.current = null;
      } catch (error: any) {
        // Manejar errores de reproducción
        if (error.name === 'AbortError') {
          console.log("Reproducción cancelada (nuevo video cargándose)");
        } else if (error.name === 'NotAllowedError') {
          console.error("Reproducción bloqueada por el navegador (autoplay policy)");
          alert("Por favor, haz clic en el video para permitir la reproducción");
        } else {
          console.error("Error al reproducir el video:", error);
        }
        setIsPlaying(false);
        playPromiseRef.current = null;
      }
    }
  };

  const handleFinish = async () => {
    let activeSessionId = sessionId;

    if (!activeSessionId) {
      // Si no hay sesión iniciada, intentar iniciarla ahora para poder generar el quiz
      try {
        const res = await api.post('/sessions/start', {
          student_id: userId,
          task_id: videoId
        });
        activeSessionId = res.data.session.id;
        setSessionId(activeSessionId);
      } catch (e) {
        console.error("Error starting session explicitly for finish:", e);
        alert("No se pudo iniciar la sesión para generar el cuestionario.");
        return;
      }
    }

    const avgAttention = accumulatedAttention.length > 0
      ? accumulatedAttention.reduce((a, b) => a + b, 0) / accumulatedAttention.length
      : 1.0;

    try {
      const res = await api.post('/sessions/end', {
        session_id: activeSessionId,
        attention_score_avg: avgAttention
      });
      const { quiz_id } = res.data;
      router.push(`/estudiante/cuestionario/${quiz_id}`);
    } catch (error) {
      console.error("Error generating quiz:", error);
      alert("Error al finalizar la sesión. Intenta de nuevo.");
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsVideoReady(true);
    }
  };

  const handleCanPlay = () => {
    setIsVideoReady(true);
  };

  const handleLoadStart = () => {
    setIsVideoReady(false);
    setIsPlaying(false);
    // Cancelar cualquier reproducción pendiente
    if (playPromiseRef.current) {
      playPromiseRef.current.catch(() => {
        // Ignorar errores de cancelación
      });
      playPromiseRef.current = null;
    }
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error("Error en el video:", e);
    setIsVideoReady(false);
    setIsPlaying(false);
    if (playPromiseRef.current) {
      playPromiseRef.current.catch(() => {
        // Ignorar errores
      });
      playPromiseRef.current = null;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const newTime = (parseFloat(e.target.value) / 100) * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current?.requestFullscreen) videoRef.current.requestFullscreen();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!videoData) return <div className="p-10 text-center text-white">Cargando video...</div>;

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
        <div
          id="video-container"
          className="flex-1 flex flex-col relative bg-black justify-center items-center group/player"
          onMouseEnter={() => {
            setShowControls(true);
            // Limpiar timer si existe
            if (hideControlsTimerRef.current) {
              clearTimeout(hideControlsTimerRef.current);
              hideControlsTimerRef.current = null;
            }
          }}
          onMouseLeave={() => {
            if (isPlaying) {
              // Limpiar timer anterior si existe
              if (hideControlsTimerRef.current) {
                clearTimeout(hideControlsTimerRef.current);
              }
              hideControlsTimerRef.current = setTimeout(() => {
                setShowControls(false);
                hideControlsTimerRef.current = null;
              }, 2000);
            }
          }}
        >
          {/* Video Container */}
          <div className="w-full h-full relative overflow-hidden bg-black">
            <video
              ref={videoRef}
              src={videoData.videoUrl}
              className="w-full h-full object-contain"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onCanPlay={handleCanPlay}
              onLoadStart={handleLoadStart}
              onError={handleVideoError}
              onEnded={handleFinish}
              onClick={handlePlayPause}
              preload="metadata"
            />

            {/* Attention Level Indicator */}
            <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
              <div
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 ${attentionLevel === "Alto"
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : attentionLevel === "Medio"
                    ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                    : "bg-red-100 text-red-700 border border-red-200 animate-pulse"
                  }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {attentionLevel === "Alto"
                    ? "visibility"
                    : attentionLevel === "Medio"
                      ? "visibility_off"
                      : "warning"}
                </span>
                <span>Atención: {attentionLevel}</span>
              </div>

              {/* Mensaje dinámico */}
              <div className={`px-3 py-1.5 rounded-lg text-xs font-medium bg-black/70 text-white backdrop-blur-sm transition-all duration-300`}>
                {attentionMessage}
              </div>
            </div>

            {/* Alerta de baja atención - Overlay animado */}
            {showAttentionAlert && isPlaying && (
              <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
                <div className="animate-pulse bg-red-500/20 rounded-2xl p-8 backdrop-blur-sm border-2 border-red-500/50">
                  <div className="flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined text-5xl text-red-500 animate-bounce">
                      warning
                    </span>
                    <p className="text-xl font-bold text-white text-center drop-shadow-lg">
                      ¡Atención requerida!
                    </p>
                    <p className="text-sm text-white/80 text-center">
                      Vuelve a enfocarte en el video
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Video Controls Overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/60 transition-opacity duration-300 flex flex-col justify-end p-6 z-10 ${showControls || !isPlaying ? "opacity-100" : "opacity-0"
                }`}
            >
              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-white/20 rounded-full mb-4 cursor-pointer relative group/progress">
                <div
                  className="absolute top-0 left-0 h-full bg-primary rounded-full relative"
                  style={{
                    width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                  }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full scale-0 group-hover/progress:scale-100 transition-transform shadow-md"></div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={duration > 0 ? (currentTime / duration) * 100 : 0}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-6">
                  <button
                    onClick={handlePlayPause}
                    className="hover:text-primary transition-colors"
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "32px" }}
                    >
                      {isPlaying ? "pause_circle" : "play_circle"}
                    </span>
                  </button>
                  <div className="flex items-center gap-2 group/volume">
                    <button className="hover:text-primary transition-colors">
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "24px" }}
                      >
                        {volume > 0 ? "volume_up" : "volume_off"}
                      </span>
                    </button>
                    <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300 ease-out">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="h-1 bg-white/30 rounded-full w-16 ml-2 accent-white"
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium tracking-wide">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() =>
                      handlePlaybackRateChange(
                        playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1
                      )
                    }
                    className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs font-bold tracking-wider transition-colors"
                  >
                    {playbackRate}x
                  </button>
                  <button className="hover:text-primary transition-colors">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "24px" }}
                    >
                      closed_caption
                    </span>
                  </button>
                  <button
                    onClick={handleFullscreen}
                    className="hover:text-primary transition-colors"
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "24px" }}
                    >
                      fullscreen
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar (Right) */}
        <aside
          className={`w-80 bg-white border-l border-[#e5e7eb] flex flex-col shrink-0 z-20 fixed right-0 top-16 h-[calc(100vh-4rem)] lg:relative lg:top-0 lg:h-auto transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "translate-x-full"
            } lg:flex`}
        >
          {/* User Camera Preview */}
          <div className="p-4 border-b border-[#e5e7eb]">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Monitor de Atención</h3>
            <div className="w-full aspect-video bg-black/80 rounded-lg border-2 border-[#e5e7eb] overflow-hidden shadow-lg relative">
              <VideoCanvasBlink
                isActive={true}
                stream={stream}
                onBlink={handleAttentionUpdate}
                width={280}
                height={210}
              />
              <div className={`absolute bottom-0 left-0 right-0 px-3 py-2 flex flex-col items-center gap-1 transition-all duration-300 ${attentionLevel === 'Alto' ? 'bg-green-900/70' :
                attentionLevel === 'Medio' ? 'bg-yellow-900/70' : 'bg-red-900/70'
                }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${attentionLevel === 'Alto' ? 'bg-green-400 animate-pulse' :
                    attentionLevel === 'Medio' ? 'bg-yellow-400 animate-pulse' :
                      'bg-red-400 animate-ping'
                    }`}></div>
                  <span className={`text-xs font-bold uppercase tracking-wide ${attentionLevel === 'Alto' ? 'text-green-300' :
                    attentionLevel === 'Medio' ? 'text-yellow-300' : 'text-red-300'
                    }`}>
                    {attentionLevel === 'Alto' ? '✓ Atento' :
                      attentionLevel === 'Medio' ? '⚠ Atención Media' : '⚠ Distraído'}
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
                <p className="text-sm text-gray-600 mb-4">{videoData.description}</p>
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
                      Se están tomando datos biométricos para evaluar tu atención.
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

