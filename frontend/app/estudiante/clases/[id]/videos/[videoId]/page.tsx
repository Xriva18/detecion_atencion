"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Admin/Header";

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

  // Mock data - En producción esto vendría de una API
  const mockVideo = {
    id: videoId,
    title: "Introducción a las Derivadas",
    description: "Conceptos básicos de derivadas y su interpretación geométrica",
    duration: "45:30",
    uploadDate: "2024-01-15",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  };

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

  return (
    <>
      <Header
        title={mockVideo.title}
        subtitle="Reproduciendo video"
        user={{
          name: "Sofía",
          email: "sofia@estudiante.com",
          role: "Estudiante",
        }}
      />
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#616f89] hover:text-[#111318] transition-colors self-start"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Volver a Videos</span>
        </button>

        {/* Video Player */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm overflow-hidden">
          <div className="relative w-full bg-black aspect-video">
            <video
              ref={videoRef}
              src={mockVideo.videoUrl}
              className="w-full h-full"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleFinish}
            />
            {/* Attention Level Indicator */}
            <div className="absolute top-4 right-4">
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
          </div>

          {/* Video Controls */}
          <div className="p-4 bg-gray-50 border-t border-[#e5e7eb]">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePlayPause}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white hover:bg-blue-700 transition-colors"
              >
                <span className="material-symbols-outlined">
                  {isPlaying ? "pause" : "play_arrow"}
                </span>
              </button>
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={duration > 0 ? (currentTime / duration) * 100 : 0}
                  onChange={handleSeek}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className="text-sm text-[#616f89] min-w-[80px] text-right">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Video Info */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#111318] mb-2">
            {mockVideo.title}
          </h2>
          <p className="text-[#616f89] mb-4">{mockVideo.description}</p>
          <div className="flex items-center gap-4 text-sm text-[#616f89]">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">
                schedule
              </span>
              <span>Duración: {mockVideo.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">
                calendar_today
              </span>
              <span>
                {new Date(mockVideo.uploadDate).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-blue-600 text-xl">
            info
          </span>
          <div className="flex-1">
            <p className="text-sm text-blue-900 font-medium">
              Tu nivel de atención está siendo monitoreado durante la reproducción del video.
              Al finalizar, se generará un cuestionario basado en tu nivel de atención.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

