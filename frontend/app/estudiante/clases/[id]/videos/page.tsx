"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Admin/Header";
import Link from "next/link";

export default function VideosClasePage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;
  const [activeTab, setActiveTab] = useState<"videos" | "resultados">("videos");

  // Mock data - En producción esto vendría de una API
  const mockClass = {
    id: classId,
    name: "Cálculo Diferencial",
    professor: "Prof. Alejandro García",
    description: "Introducción al cálculo diferencial y sus aplicaciones",
  };

  const mockVideos = [
    {
      id: "1",
      title: "Introducción a las Derivadas",
      description: "Conceptos básicos de derivadas y su interpretación geométrica",
      duration: "45:30",
      uploadDate: "2024-01-15",
      watched: false,
      available: true,
    },
    {
      id: "2",
      title: "Reglas de Derivación",
      description: "Aprende las reglas fundamentales para derivar funciones",
      duration: "38:15",
      uploadDate: "2024-01-20",
      watched: true,
      available: true,
    },
    {
      id: "3",
      title: "Aplicaciones de las Derivadas",
      description: "Optimización y problemas de aplicación práctica",
      duration: "52:10",
      uploadDate: "2024-01-25",
      watched: false,
      available: true,
    },
    {
      id: "4",
      title: "Límites y Continuidad",
      description: "Fundamentos de límites y continuidad de funciones",
      duration: "40:20",
      uploadDate: "2024-02-01",
      watched: false,
      available: false,
    },
  ];

  // Mock data para resultados
  const mockVideoResults = [
    {
      videoId: "1",
      videoTitle: "Introducción a las Derivadas",
      score: 85,
      correctAnswers: 17,
      incorrectAnswers: 3,
      totalQuestions: 20,
      attentionLevel: "Alto" as "Alto" | "Medio" | "Bajo",
      date: "2024-01-20",
      resultId: "1",
    },
    {
      videoId: "2",
      videoTitle: "Reglas de Derivación",
      score: 90,
      correctAnswers: 18,
      incorrectAnswers: 2,
      totalQuestions: 20,
      attentionLevel: "Alto" as "Alto" | "Medio" | "Bajo",
      date: "2024-01-18",
      resultId: "2",
    },
    {
      videoId: "3",
      videoTitle: "Aplicaciones de las Derivadas",
      score: 70,
      correctAnswers: 14,
      incorrectAnswers: 6,
      totalQuestions: 20,
      attentionLevel: "Medio" as "Alto" | "Medio" | "Bajo",
      date: "2024-01-12",
      resultId: "4",
    },
  ];

  const getAttentionBadgeColor = (level: "Alto" | "Medio" | "Bajo") => {
    if (level === "Alto")
      return "bg-green-100 text-green-700 border-green-200";
    if (level === "Medio")
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    return "text-orange-600";
  };

  return (
    <>
      <Header
        title={mockClass.name}
        subtitle={mockClass.professor}
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
          <span>Volver a Mis Clases</span>
        </button>

        {/* Class Info */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-[#111318] mb-2">
            {mockClass.name}
          </h1>
          <p className="text-[#616f89] mb-4">{mockClass.description}</p>
          <div className="flex items-center gap-4 text-sm text-[#616f89]">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">
                person
              </span>
              <span>{mockClass.professor}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">
                video_library
              </span>
              <span>{mockVideos.length} Videos</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm overflow-hidden">
          <div className="flex border-b border-[#e5e7eb]">
            <button
              onClick={() => setActiveTab("videos")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "videos"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-[#616f89] hover:text-[#111318] hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">video_library</span>
                <span>Videos</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("resultados")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "resultados"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-[#616f89] hover:text-[#111318] hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">analytics</span>
                <span>Resultados</span>
              </div>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "videos" && (
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold text-[#111318]">
                  Videos de la Clase
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockVideos.map((video) => (
                    <Link
                      key={video.id}
                      href={`/estudiante/clases/${classId}/videos/${video.id}`}
                      className={`flex flex-col bg-white rounded-xl border border-[#e5e7eb] shadow-sm overflow-hidden hover:shadow-md transition-shadow group cursor-pointer ${
                        !video.available ? "opacity-60" : ""
                      }`}
                    >
                      <div className="relative h-40 bg-gray-200 flex items-center justify-center">
                        <span className="material-symbols-outlined text-6xl text-gray-400">
                          play_circle
                        </span>
                        {video.watched && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">
                              check_circle
                            </span>
                            Visto
                          </div>
                        )}
                        {!video.available && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-semibold">
                              Próximamente
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex flex-col gap-2">
                        <h3 className="text-lg font-bold text-[#111318] group-hover:text-primary transition-colors line-clamp-2">
                          {video.title}
                        </h3>
                        <p className="text-sm text-[#616f89] line-clamp-2">
                          {video.description}
                        </p>
                        <div className="flex items-center justify-between mt-2 text-xs text-[#616f89]">
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">
                              schedule
                            </span>
                            <span>{video.duration}</span>
                          </div>
                          <span>
                            {new Date(video.uploadDate).toLocaleDateString(
                              "es-ES",
                              {
                                day: "numeric",
                                month: "long",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "resultados" && (
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold text-[#111318]">
                  Resultados de Videos
                </h2>
                {mockVideoResults.length > 0 ? (
                  <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-[#e5e7eb] text-xs uppercase tracking-wider text-[#616f89] font-semibold">
                            <th className="px-6 py-4 text-left">Video</th>
                            <th className="px-6 py-4 text-center">Calificación</th>
                            <th className="px-6 py-4 text-center">
                              Nivel de Atención
                            </th>
                            <th className="px-6 py-4 text-center">Respuestas</th>
                            <th className="px-6 py-4 text-left">Fecha</th>
                            <th className="px-6 py-4 text-right">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e5e7eb]">
                          {mockVideoResults.map((result) => (
                            <tr
                              key={result.videoId}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <p className="text-sm font-bold text-[#111318]">
                                  {result.videoTitle}
                                </p>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span
                                  className={`text-lg font-bold ${getScoreColor(
                                    result.score
                                  )}`}
                                >
                                  {result.score}%
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span
                                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getAttentionBadgeColor(
                                    result.attentionLevel
                                  )}`}
                                >
                                  {result.attentionLevel}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <p className="text-sm text-[#616f89]">
                                  {result.correctAnswers}/
                                  {result.totalQuestions} correctas
                                </p>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-sm text-[#616f89]">
                                  {new Date(result.date).toLocaleDateString(
                                    "es-ES",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )}
                                </p>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <Link
                                  href={`/estudiante/resultados/${result.resultId}`}
                                  className="px-4 py-2 bg-primary hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2"
                                >
                                  <span className="material-symbols-outlined text-lg">
                                    visibility
                                  </span>
                                  Ver Detalle
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-[#e5e7eb] p-12 text-center">
                    <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
                      analytics
                    </span>
                    <p className="text-lg font-medium text-[#111318] mb-2">
                      No hay resultados aún
                    </p>
                    <p className="text-sm text-[#616f89]">
                      Completa los videos para ver tus resultados aquí
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

