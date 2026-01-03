"use client";

import { useRouter } from "next/navigation";
import Header from "@/components/Admin/Header";
import Link from "next/link";

// Mock data - En producción esto vendría de una API
const mockStats = {
  activeClasses: 8,
  enrolledStudents: 142,
  totalVideos: 35,
};

const mockActiveClasses = [
  {
    id: "1",
    name: "Matemáticas Avanzadas I",
    createdDate: "2024-01-15",
    status: "En curso",
    students: 32,
    videos: 12,
  },
  {
    id: "2",
    name: "Química Orgánica",
    createdDate: "2024-02-01",
    status: "En curso",
    students: 26,
    videos: 8,
  },
  {
    id: "3",
    name: "Programación Básica",
    createdDate: "2024-02-10",
    status: "Próximo",
    students: 42,
    videos: 5,
  },
];

const mockRecentVideos = [
  {
    id: "v1",
    title: "Introducción a las Ecuaciones Lineales",
    className: "Matemáticas 101",
    classId: "1",
    uploadDate: "2024-02-15",
    duration: "45:30",
  },
  {
    id: "v2",
    title: "Sistemas de Ecuaciones",
    className: "Matemáticas 101",
    classId: "1",
    uploadDate: "2024-02-10",
    duration: "52:15",
  },
  {
    id: "v3",
    title: "La Revolución Industrial",
    className: "Historia Universal",
    classId: "2",
    uploadDate: "2024-02-08",
    duration: "60:00",
  },
];

export default function ProfesorDashboard() {
  const router = useRouter();

  const handleClassClick = (classId: string) => {
    router.push(`/profesor/clases?classId=${classId}`);
  };

  const handleVideoClick = (videoId: string, classId: string) => {
    router.push(`/profesor/clases?classId=${classId}&videoId=${videoId}`);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Hoy";
    if (diffInDays === 1) return "Hace 1 día";
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return weeks === 1 ? "Hace 1 semana" : `Hace ${weeks} semanas`;
    }
    const months = Math.floor(diffInDays / 30);
    return months === 1 ? "Hace 1 mes" : `Hace ${months} meses`;
  };

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <span className="material-symbols-outlined">
                    video_library
                  </span>
                </div>
              </div>
              <div>
                <p className="text-[#616f89] text-sm font-medium">Videos</p>
                <h3 className="text-[#111318] text-2xl font-bold mt-1">
                  {mockStats.totalVideos}
                </h3>
              </div>
            </div>
          </div>
        </section>

        {/* Clases Activas y Últimos Videos en dos columnas */}
        <section aria-label="Clases y Videos">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Clases Activas */}
            <div>
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
              <div className="space-y-4">
                {mockActiveClasses.map((classItem) => (
                  <div
                    key={classItem.id}
                    onClick={() => handleClassClick(classItem.id)}
                    className="bg-white rounded-xl border border-[#e5e7eb] p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="mb-3">
                      <h3 className="text-lg font-bold text-[#111318] group-hover:text-primary transition-colors">
                        {classItem.name}
                      </h3>
                      <p className="text-sm text-[#616f89] mt-1 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">
                          calendar_today
                        </span>
                        <span>
                          Creada:{" "}
                          {new Date(classItem.createdDate).toLocaleDateString(
                            "es-ES",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </p>
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
            </div>

            {/* Últimos Videos */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#111318]">
                  Últimos Videos Subidos
                </h2>
              </div>
              <div className="bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-sm">
                <div className="space-y-4">
                  {mockRecentVideos.map((video) => (
                    <div
                      key={video.id}
                      onClick={() => handleVideoClick(video.id, video.classId)}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined">
                            play_circle
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-[#111318] group-hover:text-primary transition-colors">
                            {video.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-xs text-[#616f89]">{video.className}</p>
                            <span className="text-xs text-[#616f89]">•</span>
                            <p className="text-xs text-[#616f89]">
                              {getTimeAgo(video.uploadDate)}
                            </p>
                            <span className="text-xs text-[#616f89]">•</span>
                            <p className="text-xs text-[#616f89] flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">
                                schedule
                              </span>
                              {video.duration}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-primary">
                        <span className="text-xs font-medium">Ver resultados</span>
                        <span className="material-symbols-outlined text-[18px]">
                          arrow_forward
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
