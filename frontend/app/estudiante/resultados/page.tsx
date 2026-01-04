"use client";

import Header from "@/components/Admin/Header";
import Link from "next/link";

export default function ResultadosPage() {
  // Mock data - En producción esto vendría de una API
  const mockResults = [
    {
      id: "1",
      videoTitle: "Introducción a las Derivadas",
      className: "Cálculo Diferencial",
      date: "2024-01-20",
      score: 85,
      correctAnswers: 17,
      incorrectAnswers: 3,
      totalQuestions: 20,
      attentionLevel: "Alto" as "Alto" | "Medio" | "Bajo",
    },
    {
      id: "2",
      videoTitle: "Reglas de Derivación",
      className: "Cálculo Diferencial",
      date: "2024-01-18",
      score: 90,
      correctAnswers: 18,
      incorrectAnswers: 2,
      totalQuestions: 20,
      attentionLevel: "Alto" as "Alto" | "Medio" | "Bajo",
    },
    {
      id: "3",
      videoTitle: "Análisis de Obra",
      className: "Historia del Arte Moderno",
      date: "2024-01-15",
      score: 75,
      correctAnswers: 15,
      incorrectAnswers: 5,
      totalQuestions: 20,
      attentionLevel: "Medio" as "Alto" | "Medio" | "Bajo",
    },
    {
      id: "4",
      videoTitle: "Aplicaciones de las Derivadas",
      className: "Cálculo Diferencial",
      date: "2024-01-12",
      score: 70,
      correctAnswers: 14,
      incorrectAnswers: 6,
      totalQuestions: 20,
      attentionLevel: "Bajo" as "Alto" | "Medio" | "Bajo",
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    return "text-orange-600";
  };

  const getAttentionBadgeColor = (level: "Alto" | "Medio" | "Bajo") => {
    if (level === "Alto")
      return "bg-green-100 text-green-700 border-green-200";
    if (level === "Medio")
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  return (
    <>
      <Header
        title="Resultados"
        subtitle="Historial de tus evaluaciones"
        user={{
          name: "Sofía",
          email: "sofia@estudiante.com",
          role: "Estudiante",
        }}
      />
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-[#111318]">Mis Resultados</h1>
          <p className="text-[#616f89]">
            Revisa tus calificaciones y desempeño en los videos
          </p>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-[#e5e7eb] text-xs uppercase tracking-wider text-[#616f89] font-semibold">
                  <th className="px-6 py-4 text-left">Video</th>
                  <th className="px-6 py-4 text-left">Clase</th>
                  <th className="px-6 py-4 text-left">Fecha</th>
                  <th className="px-6 py-4 text-center">Calificación</th>
                  <th className="px-6 py-4 text-center">Nivel de Atención</th>
                  <th className="px-6 py-4 text-center">Respuestas</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {mockResults.map((result) => (
                  <tr
                    key={result.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-[#111318]">
                        {result.videoTitle}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-[#616f89]">
                        {result.className}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-[#616f89]">
                        {new Date(result.date).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
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
                        {result.correctAnswers}/{result.totalQuestions} correctas
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/estudiante/resultados/${result.id}`}
                        className="px-3 py-1.5 bg-primary hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-base">
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

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="material-symbols-outlined text-green-600">
                  trending_up
                </span>
              </div>
              <div>
                <p className="text-sm text-[#616f89]">Promedio General</p>
                <p className="text-2xl font-bold text-[#111318]">80%</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="material-symbols-outlined text-blue-600">
                  quiz
                </span>
              </div>
              <div>
                <p className="text-sm text-[#616f89]">Videos Completados</p>
                <p className="text-2xl font-bold text-[#111318]">
                  {mockResults.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="material-symbols-outlined text-purple-600">
                  visibility
                </span>
              </div>
              <div>
                <p className="text-sm text-[#616f89]">Nivel de Atención</p>
                <p className="text-2xl font-bold text-[#111318]">Medio-Alto</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

