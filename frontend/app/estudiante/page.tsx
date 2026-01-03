"use client";

import Header from "@/components/Admin/Header";
import Link from "next/link";
import Image from "next/image";

export default function EstudianteDashboard() {
  // Mock data - En producción esto vendría de una API
  const mockActiveClasses = [
    {
      id: "1",
      name: "Cálculo Diferencial",
      category: "Matemáticas",
      professor: "Prof. Alejandro García",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC6V6yaUyuRkkVoKcnf0j7myrxgka2eCUnZkmEbt1WmBYDftG8-guNH7zK2mm7iFVGyAsaxspVlc11HsydQ001Nlw_gOLQWjdLnA3qc6CcBBnGdgKDTIbhYn4pkIsbHl6_NdRlds5AgXPmrwij5-p11TpS7kgrj0dfBVNvcj5cHOkWrDo8Ez4UMEutDeNw3Pikk56QoZdhvAkWxtKOBNxZDigq0NjExr4glHrJCp2QduApEmiInqEUvjipQDt5KgbzIFy3Z4O-JoL0",
      hasPendingVideos: true,
    },
    {
      id: "2",
      name: "Historia del Arte Moderno",
      category: "Historia",
      professor: "Dra. Elena Torres",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDFYenbfqYicawuxXSFTXCHW65tPOCkL0VREzyySn74jZp_QYpiJ0buWeamw-6ZEx7lSvLp7zSakjLETfpoxwDTmRKEL1Q13J9V9eN1U7ofchian5WmQbw0kjgR1LcYKHdesBjVIqlzPR3151So4jRjBEirrh-RxnQWaLqGpzE3ZKZ0ik63Eh4LdTt-aDzYQJuDJ_7EmLJc5VLNd-aTEYmGrM-oa0lbuIuO1hqZD39COH0sNvUPM1xJpH6uhJiorPvRvYUbWxktUaE",
      hasPendingVideos: false,
    },
  ];

  const mockRecentGrades = [
    {
      id: "1",
      title: "Examen Parcial",
      class: "Cálculo Diferencial",
      grade: 9.5,
    },
    {
      id: "2",
      title: "Análisis de Obra",
      class: "Historia del Arte",
      grade: 8.8,
    },
  ];

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Resumen de tu actividad académica"
        user={{
          name: "Sofía",
          email: "sofia@estudiante.com",
          role: "Estudiante",
        }}
      />
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
        {/* Greeting */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-[#111318]">
            Hola, Sofía 👋
          </h1>
          <p className="text-[#616f89]">
            Aquí tienes un resumen de tu actividad esta semana.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Column: Active Classes */}
          <div className="xl:col-span-2 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#111318]">
                Mis Clases Activas
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {mockActiveClasses.map((classItem) => (
                <Link
                  key={classItem.id}
                  href={`/estudiante/clases/${classItem.id}/videos`}
                  className="flex flex-col bg-white rounded-xl border border-[#e5e7eb] shadow-sm overflow-hidden hover:shadow-md transition-shadow group cursor-pointer"
                >
                  <div className="relative h-40 w-full bg-gray-200">
                    {classItem.imageUrl && (
                      <Image
                        src={classItem.imageUrl}
                        alt={classItem.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    )}
                  </div>
                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <div className="flex flex-col gap-1">
                      <p
                        className={`text-xs font-bold uppercase tracking-wide ${
                          classItem.category === "Matemáticas"
                            ? "text-primary"
                            : "text-purple-500"
                        }`}
                      >
                        {classItem.category}
                      </p>
                      <h3 className="text-lg font-bold text-[#111318] group-hover:text-primary transition-colors">
                        {classItem.name}
                      </h3>
                      <p className="text-sm text-[#616f89]">
                        {classItem.professor}
                      </p>
                    </div>
                    <div className="mt-auto pt-2">
                      {classItem.hasPendingVideos ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
                            <span className="material-symbols-outlined text-sm">
                              video_library
                            </span>
                            Con videos pendientes
                          </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                            <span className="material-symbols-outlined text-sm">
                              check_circle
                            </span>
                            Sin videos pendientes
                          </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Column: Widgets */}
          <div className="flex flex-col gap-6">
            {/* Recent Grades Widget */}
            <div className="bg-white p-6 rounded-xl border border-[#e5e7eb] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#111318]">
                  Calificaciones Recientes
                </h3>
              </div>
              <div className="flex flex-col gap-3">
                {mockRecentGrades.map((grade) => (
                  <div
                    key={grade.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-[#111318]">
                        {grade.title}
                      </p>
                      <p className="text-xs text-[#616f89]">{grade.class}</p>
                    </div>
                    <span
                      className={`font-bold text-lg ${
                        grade.grade >= 9
                          ? "text-green-600"
                          : "text-[#111318]"
                      }`}
                    >
                      {grade.grade}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                href="/estudiante/resultados"
                className="block w-full mt-4 text-center text-primary text-sm font-medium hover:underline"
              >
                Ver reporte completo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

