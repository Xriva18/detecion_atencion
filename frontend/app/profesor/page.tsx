"use client";

import Header from "@/components/Admin/Header";
import Link from "next/link";

// Mock data - En producción esto vendría de una API
const mockStats = {
  activeClasses: 8,
  enrolledStudents: 142,
  pendingEvaluations: 12,
  averageGrade: 8.4,
};

const mockActiveClasses = [
  {
    id: "1",
    name: "Matemáticas Avanzadas I",
    schedule: "Lunes y Miércoles • 10:00 AM - 12:00 PM",
    status: "En curso",
    students: 32,
    videos: 12,
  },
  {
    id: "2",
    name: "Química Orgánica",
    schedule: "Martes y Jueves • 08:00 AM - 10:00 AM",
    status: "En curso",
    students: 26,
    videos: 8,
  },
  {
    id: "3",
    name: "Programación Básica",
    schedule: "Viernes • 02:00 PM - 05:00 PM",
    status: "Próximo",
    students: 42,
    videos: 5,
  },
];

const mockRecentEvaluations = [
  {
    id: "1",
    name: "Parcial Álgebra",
    class: "Alg",
    date: "Hace 2 días",
    average: 7.8,
    color: "red",
  },
  {
    id: "2",
    name: "Lab Química 2",
    class: "Qui",
    date: "Hace 5 días",
    average: 9.2,
    color: "blue",
  },
  {
    id: "3",
    name: "Quiz Python",
    class: "Prog",
    date: "Hace 1 semana",
    average: 8.5,
    color: "purple",
  },
];

export default function ProfesorDashboard() {
  return (
    <>
      <Header
        title="Bienvenido, Prof. Carlos Ruiz"
        subtitle="Resumen de actividad académica"
        user={{
          name: "Prof. Carlos Ruiz",
          email: "carlos.ruiz@edu.com",
          role: "Profesor",
        }}
      />
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
        {/* Stats Grid */}
        <section aria-label="Estadísticas">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stat Card 1 */}
            <div className="bg-white rounded-xl p-5 border border-[#e5e7eb] shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="bg-primary/10 p-2.5 rounded-lg text-primary">
                  <span className="material-symbols-outlined">class</span>
                </div>
              </div>
              <div>
                <p className="text-[#616f89] text-sm font-medium">
                  Clases Activas
                </p>
                <h3 className="text-[#111318] text-2xl font-bold mt-1">
                  {mockStats.activeClasses}
                </h3>
              </div>
            </div>
            {/* Stat Card 2 */}
            <div className="bg-white rounded-xl p-5 border border-[#e5e7eb] shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="bg-purple-100 p-2.5 rounded-lg text-purple-600">
                  <span className="material-symbols-outlined">group</span>
                </div>
              </div>
              <div>
                <p className="text-[#616f89] text-sm font-medium">
                  Estudiantes Matriculados
                </p>
                <h3 className="text-[#111318] text-2xl font-bold mt-1">
                  {mockStats.enrolledStudents}
                </h3>
              </div>
            </div>
            {/* Stat Card 3 */}
            <div className="bg-white rounded-xl p-5 border border-[#e5e7eb] shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="bg-amber-100 p-2.5 rounded-lg text-amber-600">
                  <span className="material-symbols-outlined">assignment</span>
                </div>
              </div>
              <div>
                <p className="text-[#616f89] text-sm font-medium">
                  Evaluaciones Pendientes
                </p>
                <h3 className="text-[#111318] text-2xl font-bold mt-1">
                  {mockStats.pendingEvaluations}
                </h3>
              </div>
            </div>
            {/* Stat Card 4 */}
            <div className="bg-white rounded-xl p-5 border border-[#e5e7eb] shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="bg-green-100 p-2.5 rounded-lg text-green-600">
                  <span className="material-symbols-outlined">grade</span>
                </div>
              </div>
              <div>
                <p className="text-[#616f89] text-sm font-medium">
                  Promedio General
                </p>
                <h3 className="text-[#111318] text-2xl font-bold mt-1">
                  {mockStats.averageGrade}
                </h3>
              </div>
            </div>
          </div>
        </section>

        {/* Clases Activas */}
        <section aria-label="Clases Activas">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#111318]">Clases Activas</h2>
            <Link
              href="/profesor/clases"
              className="text-sm font-medium text-primary hover:text-blue-700 flex items-center gap-1"
            >
              Ver todas
              <span className="material-symbols-outlined text-base">
                arrow_forward
              </span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockActiveClasses.map((classItem) => (
              <div
                key={classItem.id}
                className="bg-white rounded-xl border border-[#e5e7eb] p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-[#111318] group-hover:text-primary transition-colors">
                      {classItem.name}
                    </h3>
                    <p className="text-sm text-[#616f89] mt-1">
                      {classItem.schedule}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      classItem.status === "En curso"
                        ? "bg-green-50 text-green-700 border-green-100"
                        : "bg-blue-50 text-blue-700 border-blue-100"
                    }`}
                  >
                    {classItem.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-[#616f89]">
                      {classItem.students} Estudiantes
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[#616f89]">
                    <span className="material-symbols-outlined text-sm">
                      video_library
                    </span>
                    <span>{classItem.videos} Videos</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Últimas Evaluaciones */}
        <section aria-label="Últimas Evaluaciones">
          <div className="bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#111318]">
                Últimas Evaluaciones
              </h2>
              <Link
                href="/profesor/resultados"
                className="text-sm font-medium text-primary hover:text-blue-700"
              >
                Ver reporte completo
              </Link>
            </div>
            <div className="space-y-4">
              {mockRecentEvaluations.map((evaluation) => (
                <div
                  key={evaluation.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                        evaluation.color === "red"
                          ? "bg-red-50 text-red-500"
                          : evaluation.color === "blue"
                          ? "bg-blue-50 text-primary"
                          : "bg-purple-50 text-purple-600"
                      }`}
                    >
                      {evaluation.class}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#111318]">
                        {evaluation.name}
                      </h4>
                      <p className="text-xs text-[#616f89]">{evaluation.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-bold text-[#111318]">
                      {evaluation.average}/10
                    </span>
                    <span className="text-xs text-[#616f89]">Promedio</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

