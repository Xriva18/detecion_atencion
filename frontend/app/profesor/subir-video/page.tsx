"use client";

import { useState } from "react";
import Header from "@/components/Admin/Header";

// Mock data - En producción esto vendría de una API
const mockClasses = [
  { id: "1", name: "Matemáticas 101" },
  { id: "2", name: "Historia Universal" },
  { id: "3", name: "Química Orgánica" },
];

export default function SubirVideoPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    classId: "",
    videoType: "lecture" as "lecture" | "evaluation",
    adaptiveQuestions: false,
    finalQuiz: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar subida de video
    console.log("Subir video:", formData);
    alert("Video subido exitosamente (mock)");
  };

  return (
    <>
      <Header
        title="Gestión de Videos"
        subtitle="Sube videos, crea preguntas adaptativas y cuestionarios finales"
        user={{
          name: "Prof. Carlos Ruiz",
          email: "carlos.ruiz@edu.com",
          role: "Profesor",
        }}
      />
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
        {/* Paso 1: Subir Video */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h2 className="text-2xl font-bold text-[#111318]">Subir Video</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Upload Dropzone */}
            <div className="lg:col-span-4 flex flex-col">
              <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] p-6 flex-1 flex flex-col justify-center">
                <h3 className="text-[#111318] text-lg font-bold mb-4">
                  Subir Nuevo Video
                </h3>
                <div className="flex flex-col items-center gap-6 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 px-6 py-10 transition-colors hover:bg-primary/10 group cursor-pointer">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="size-14 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-2 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-3xl">
                        cloud_upload
                      </span>
                    </div>
                    <p className="text-[#111318] text-base font-bold leading-tight">
                      Arrastra tu video aquí
                    </p>
                    <p className="text-[#616f89] text-sm font-normal">
                      Soporta MP4, MOV, AVI (Max 2GB)
                    </p>
                  </div>
                  <button
                    type="button"
                    className="flex items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-white border border-[#dbdfe6] text-[#111318] text-sm font-bold shadow-sm hover:shadow transition-shadow"
                  >
                    <span className="truncate">Seleccionar Archivo</span>
                  </button>
                </div>
              </div>
            </div>
            {/* Configuration Form */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] p-6 h-full">
                <h3 className="text-[#111318] text-lg font-bold mb-4 border-b border-[#e5e7eb] pb-2">
                  Configuración del Video
                </h3>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <label className="flex flex-col gap-2">
                    <span className="text-[#111318] text-sm font-medium">
                      Título del Video
                    </span>
                    <input
                      className="w-full rounded-lg border border-[#dbdfe6] bg-white text-[#111318] h-12 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-[#616f89]"
                      placeholder="Ej: Introducción al Álgebra Lineal - Semana 1"
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-[#111318] text-sm font-medium">
                      Descripción
                    </span>
                    <textarea
                      className="w-full rounded-lg border border-[#dbdfe6] bg-white text-[#111318] min-h-[100px] p-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none placeholder:text-[#616f89]"
                      placeholder="Describe el contenido del video..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-[#111318] text-sm font-medium">
                      Clase Asociada
                    </span>
                    <select
                      className="w-full rounded-lg border border-[#dbdfe6] bg-white text-[#111318] h-12 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none cursor-pointer"
                      required
                      value={formData.classId}
                      onChange={(e) =>
                        setFormData({ ...formData, classId: e.target.value })
                      }
                    >
                      <option value="">Seleccionar clase</option>
                      {mockClasses.map((classItem) => (
                        <option key={classItem.id} value={classItem.id}>
                          {classItem.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="flex flex-col gap-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                        checked={formData.adaptiveQuestions}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            adaptiveQuestions: e.target.checked,
                          })
                        }
                      />
                      <span className="text-sm text-[#111318]">
                        Incluir preguntas adaptativas durante el video
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                        checked={formData.finalQuiz}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            finalQuiz: e.target.checked,
                          })
                        }
                      />
                      <span className="text-sm text-[#111318]">
                        Agregar cuestionario final
                      </span>
                    </label>
                  </div>
                  <div className="flex gap-3 justify-end pt-4 border-t border-[#e5e7eb]">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-lg bg-primary hover:bg-blue-700 text-white font-medium transition-colors"
                    >
                      Subir Video
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

