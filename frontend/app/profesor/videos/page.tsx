"use client";

import { useState } from "react";
import Header from "@/components/Admin/Header";

// Mock data - En producción esto vendría de una API
interface Video {
  id: string;
  title: string;
  description: string;
  class: string;
  duration: string;
  questions: number;
  publishedDate: string;
  status: "Publicado" | "Borrador" | "Archivado";
  thumbnail?: string;
}

const mockVideos: Video[] = [
  {
    id: "1",
    title: "Introducción al Álgebra Lineal",
    description:
      "Conceptos básicos y variables. Fundamentos de álgebra lineal para estudiantes de primer semestre.",
    class: "Matemáticas Avanzadas IV",
    duration: "12:40",
    questions: 15,
    publishedDate: "12 Oct, 2024",
    status: "Publicado",
  },
  {
    id: "2",
    title: "Química Orgánica - Estructura Molecular",
    description:
      "Análisis de estructuras moleculares y enlaces químicos en compuestos orgánicos.",
    class: "Química Orgánica",
    duration: "18:25",
    questions: 8,
    publishedDate: "8 Oct, 2024",
    status: "Publicado",
  },
  {
    id: "3",
    title: "Historia de la Revolución Industrial",
    description:
      "Contexto histórico y consecuencias sociales de la Revolución Industrial.",
    class: "Historia Universal",
    duration: "22:15",
    questions: 12,
    publishedDate: "5 Oct, 2024",
    status: "Borrador",
  },
];

const mockClasses = [
  "Todas las clases",
  "Matemáticas Avanzadas IV",
  "Física Elemental",
  "Programación Web 101",
];

export default function VideosPage() {
  const [selectedClass, setSelectedClass] = useState("Todas las clases");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVideos = mockVideos.filter((video) => {
    const matchesClass =
      selectedClass === "Todas las clases" || video.class === selectedClass;
    const matchesSearch =
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesClass && matchesSearch;
  });

  return (
    <>
      <Header
        title="Lista de Videos"
        subtitle="Gestiona y revisa todos tus videos y evaluaciones"
        user={{
          name: "Prof. Carlos Ruiz",
          email: "carlos.ruiz@edu.com",
          role: "Profesor",
        }}
      />
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616f89]">
              <span className="material-symbols-outlined">search</span>
            </span>
            <input
              className="w-full bg-white border border-[#dbdfe6] rounded-lg py-2.5 pl-9 pr-3 text-sm focus:ring-primary focus:border-primary placeholder:text-[#616f89] text-[#111318]"
              placeholder="Buscar por título o descripción..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative min-w-[200px]">
            <select
              className="appearance-none flex w-full rounded-lg text-[#111318] focus:outline-none focus:ring-2 focus:ring-primary border border-[#dbdfe6] bg-white h-10 px-4 pr-10 text-sm cursor-pointer"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              {mockClasses.map((classItem) => (
                <option key={classItem} value={classItem}>
                  {classItem}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#616f89]">
              <span className="material-symbols-outlined text-[20px]">
                expand_more
              </span>
            </span>
          </div>
        </div>

        {/* Videos List */}
        <div className="space-y-4">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Video Thumbnail */}
                <div className="relative w-full md:w-48 h-32 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-200"></div>
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-white text-4xl">
                      play_circle
                    </span>
                  </div>
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </span>
                </div>
                {/* Video Info */}
                <div className="flex-1 flex flex-col gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#111318] mb-2 group-hover:text-primary transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-sm text-[#616f89] mb-3">{video.description}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#616f89] text-[18px]">
                        class
                      </span>
                      <span className="text-[#616f89]">
                        Clase: <strong className="text-[#111318]">{video.class}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#616f89] text-[18px]">
                        quiz
                      </span>
                      <span className="text-[#616f89]">
                        Evaluación: <strong className="text-[#111318]">
                          {video.questions} preguntas
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#616f89] text-[18px]">
                        calendar_today
                      </span>
                      <span className="text-[#616f89]">
                        Publicado: {video.publishedDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                          video.status === "Publicado"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : video.status === "Borrador"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        {video.status === "Publicado" && (
                          <span className="size-1.5 rounded-full bg-green-500 inline-block mr-1"></span>
                        )}
                        {video.status}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex items-start gap-2">
                  <button
                    className="p-2 rounded-lg text-[#616f89] hover:bg-gray-100 transition-colors"
                    title="Editar"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      edit
                    </span>
                  </button>
                  <button
                    className="p-2 rounded-lg text-[#616f89] hover:bg-gray-100 transition-colors"
                    title="Eliminar"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      delete
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

