"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Admin/Header";
import Link from "next/link";
import api from "@/services/api";

export default function ProfesorDashboard() {
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const classRes = await api.get('/classes/');
        setClasses(classRes.data);
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleClassClick = (classId: string) => {
    // router.push(`/profesor/clases/${classId}`); // Idealmente detalle de clase
    // Por ahora redirigimos a subir video como acción principal o mantenemos la vista actual
    console.log("Navegar a detalle de clase", classId);
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

        {/* Actions Bar */}
        <div className="flex justify-end gap-4">
          <Link
            href="/profesor/crear-clase"
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            Crear Nueva Clase
          </Link>
          <Link
            href="/profesor/subir-video"
            className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <span className="material-symbols-outlined">upload</span>
            Subir Video
          </Link>
        </div>

        {/* Stats Grid - Placeholder / Real Count */}
        <section aria-label="Estadísticas">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 border border-[#e5e7eb] shadow-sm flex flex-col gap-4">
              <div className="bg-primary/10 p-2.5 rounded-lg text-primary w-fit">
                <span className="material-symbols-outlined">class</span>
              </div>
              <div>
                <p className="text-[#616f89] text-sm font-medium">Clases Activas</p>
                <h3 className="text-[#111318] text-2xl font-bold mt-1">{classes.length}</h3>
              </div>
            </div>
            {/* Otros stats estáticos por ahora */}
          </div>
        </section>

        {/* Clases Activas */}
        <section aria-label="Clases">
          <h2 className="text-lg font-bold text-[#111318] mb-4">Mis Clases</h2>

          {loading ? (
            <div className="p-10 text-center text-gray-500">Cargando clases...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {classes.map((classItem) => (
                <div
                  key={classItem.id}
                  className="bg-white rounded-xl border border-[#e5e7eb] p-5 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-[#111318] group-hover:text-primary transition-colors">
                        {classItem.name}
                      </h3>
                      <p className="text-sm text-[#616f89]">{classItem.code}</p>
                    </div>
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Activa</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{classItem.description}</p>

                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    {/* Botones de acción rápida por clase podrían ir aquí */}
                    <span className="text-xs text-gray-400">ID: {classItem.id}</span>
                  </div>
                </div>
              ))}
              {classes.length === 0 && (
                <div className="col-span-2 p-10 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center">
                  <p className="text-gray-500 mb-4">No tienes clases creadas.</p>
                  <Link href="/profesor/crear-clase" className="text-primary font-medium hover:underline">Crear mi primera clase</Link>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
