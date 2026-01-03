"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function VerVideoPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;
  const videoId = params.videoId as string;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [attentionLevel, setAttentionLevel] = useState<"Alto" | "Medio" | "Bajo">("Alto");
  const [showControls, setShowControls] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Mock data - En producción esto vendría de una API
  const mockVideo = {
    id: videoId,
    title: "Introducción a las Derivadas",
    description: "Conceptos básicos de derivadas y su interpretación geométrica",
    duration: "45:30",
    uploadDate: "2024-01-15",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    className: "Cálculo Diferencial",
    professor: "Prof. Alejandro García",
  };

  // Detectar hover para mostrar/ocultar controles
  useEffect(() => {
    let hideControlsTimer: NodeJS.Timeout | null = null;

    const handleMouseMove = () => {
      setShowControls(true);
      // Limpiar timer anterior si existe
      if (hideControlsTimer) {
        clearTimeout(hideControlsTimer);
      }
      // Crear nuevo timer
      hideControlsTimer = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
        hideControlsTimer = null;
      }, 3000);
    };

    const container = document.getElementById("video-container");
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      return () => {
        container.removeEventListener("mousemove", handleMouseMove);
        if (hideControlsTimer) {
          clearTimeout(hideControlsTimer);
        }
      };
    }
  }, [isPlaying]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      // Simular detección de atención (en producción esto vendría del backend)
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      if (progress < 30) {
        setAttentionLevel("Alto");
      } else if (progress < 70) {
        setAttentionLevel("Medio");
      } else {
        setAttentionLevel("Bajo");
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const newTime = (parseFloat(e.target.value) / 100) * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleFinish = () => {
    // Redirigir al cuestionario cuando termine el video
    router.push(`/estudiante/cuestionario/${videoId}`);
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

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
            {mockVideo.title}
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
              src={mockVideo.videoUrl}
              className="w-full h-full object-contain"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleFinish}
              onClick={handlePlayPause}
            />

            {/* Attention Level Indicator */}
            <div className="absolute top-4 right-4 z-30">
              <div
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                  attentionLevel === "Alto"
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : attentionLevel === "Medio"
                    ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {attentionLevel === "Alto"
                    ? "visibility"
                    : attentionLevel === "Medio"
                    ? "visibility_off"
                    : "remove_red_eye"}
                </span>
                <span>Nivel de Atención: {attentionLevel}</span>
              </div>
            </div>

            {/* Video Controls Overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/60 transition-opacity duration-300 flex flex-col justify-end p-6 z-10 ${
                showControls || !isPlaying ? "opacity-100" : "opacity-0"
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
          className={`w-80 bg-white border-l border-[#e5e7eb] flex flex-col shrink-0 z-20 fixed right-0 top-16 h-[calc(100vh-4rem)] lg:relative lg:top-0 lg:h-auto transition-transform duration-300 ${
            isSidebarOpen ? "translate-x-0" : "translate-x-full"
          } lg:flex`}
        >
          {/* User Camera Preview */}
          <div className="p-4 border-b border-[#e5e7eb]">
            <div className="w-full aspect-video bg-black/80 rounded-lg border-2 border-[#e5e7eb] overflow-hidden shadow-lg relative">
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-4xl">
                  videocam
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-3 py-2 flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] text-white font-semibold uppercase tracking-wide">
                    CÁMARA ACTIVA
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
                  Detalles de la Clase
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-[#616f89]">
                    <span className="material-symbols-outlined text-[18px]">
                      school
                    </span>
                    <span>{mockVideo.className}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#616f89]">
                    <span className="material-symbols-outlined text-[18px]">
                      person
                    </span>
                    <span>{mockVideo.professor}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#616f89]">
                    <span className="material-symbols-outlined text-[18px]">
                      schedule
                    </span>
                    <span>{mockVideo.duration}</span>
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
                      Se están tomando datos biométricos para evaluar tu atención
                      durante el video. Estos datos
                      <strong> no son almacenados</strong> y se procesan únicamente
                      en tiempo real.
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

