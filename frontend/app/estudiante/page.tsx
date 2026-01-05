"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Admin/Header";
import Link from "next/link";
import api from "@/services/api";

export default function EstudianteDashboard() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState(""); // En realidad usaremos esto para buscar clases o ID directo por ahora

  // En una app real, traeríamos solo las clases inscritas del estudiante
  // Por ahora traemos todas las disponibles para demo
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      // GET /classes retorna todas las clases.
      // En futuro endpoint /students/{id}/classes filtraría.
      const res = await api.get('/classes/');
      setClasses(res.data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClass = async (classId: string) => {
    // Simula inscripcion. En realidad el usuario ya ve la clase y puede entrar.
    // Si hubiera endpoint de inscripción explicita:
    // await api.post(`/classes/${classId}/enroll`, { student_id: 'current-user-id' });
    // Por ahora el link navega directo a los videos.
    console.log("Joined class", classId);
  };

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
            Hola, Estudiante 👋
          </h1>
          <p className="text-[#616f89]">
            Bienvenido a tus clases. Selecciona una para comenzar.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Column: Active Classes */}
          <div className="xl:col-span-2 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#111318]">
                Clases Disponibles
              </h2>
            </div>

            {loading ? (
              <div className="p-10 text-center text-gray-400">Cargando clases...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {classes.map((classItem) => (
                  <Link
                    key={classItem.id}
                    href={`/estudiante/clases/${classItem.id}/videos`}
                    className="flex flex-col bg-white rounded-xl border border-[#e5e7eb] shadow-sm overflow-hidden hover:shadow-md transition-shadow group cursor-pointer"
                  >
                    <div className="relative h-40 w-full bg-gray-200 flex items-center justify-center text-gray-400">
                      <span className="material-symbols-outlined text-6xl">school</span>
                    </div>
                    <div className="p-5 flex flex-col gap-3 flex-1">
                      <div className="flex flex-col gap-1">
                        <p className="text-xs font-bold uppercase tracking-wide text-primary">
                          {classItem.code || "Asignatura"}
                        </p>
                        <h3 className="text-lg font-bold text-[#111318] group-hover:text-primary transition-colors line-clamp-1">
                          {classItem.name}
                        </h3>
                        <p className="text-sm text-[#616f89] line-clamp-2">
                          {classItem.description || "Sin descripción"}
                        </p>
                      </div>
                      <div className="mt-auto pt-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                          <span className="material-symbols-outlined text-sm">
                            visibility
                          </span>
                          Ver Contenido
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
                {classes.length === 0 && (
                  <div className="col-span-2 p-8 text-center bg-gray-50 rounded-xl border border-dashed">
                    <p className="text-gray-500">No hay clases disponibles en este momento.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Widgets */}
          <div className="flex flex-col gap-6">
            {/* Recent Grades Widget - Placeholder por ahora */}
            <div className="bg-white p-6 rounded-xl border border-[#e5e7eb] shadow-sm opacity-60">
              <h3 className="text-lg font-bold text-[#111318] mb-4">
                Calificaciones
              </h3>
              <p className="text-sm text-gray-500 text-center py-4">
                Tus calificaciones aparecerán aquí cuando completes los cuestionarios.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

