"use client";

import { useState } from "react";
import Header from "@/components/Admin/Header";
import Link from "next/link";
import Image from "next/image";

export default function MisClasesPage() {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [accessCode, setAccessCode] = useState("");

  // Mock data - En producción esto vendría de una API
  const mockClasses = [
    {
      id: "1",
      name: "Cálculo Diferencial",
      category: "Matemáticas",
      professor: "Prof. Alejandro García",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC6V6yaUyuRkkVoKcnf0j7myrxgka2eCUnZkmEbt1WmBYDftG8-guNH7zK2mm7iFVGyAsaxspVlc11HsydQ001Nlw_gOLQWjdLnA3qc6CcBBnGdgKDTIbhYn4pkIsbHl6_NdRlds5AgXPmrwij5-p11TpS7kgrj0dfBVNvcj5cHOkWrDo8Ez4UMEutDeNw3Pikk56QoZdhvAkWxtKOBNxZDigq0NjExr4glHrJCp2QduApEmiInqEUvjipQDt5KgbzIFy3Z4O-JoL0",
      videosCount: 12,
      studentsCount: 35,
    },
    {
      id: "2",
      name: "Historia del Arte Moderno",
      category: "Historia",
      professor: "Dra. Elena Torres",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDFYenbfqYicawuxXSFTXCHW65tPOCkL0VREzyySn74jZp_QYpiJ0buWeamw-6ZEx7lSvLp7zSakjLETfpoxwDTmRKEL1Q13J9V9eN1U7ofchian5WmQbw0kjgR1LcYKHdesBjVIqlzPR3151So4jRjBEirrh-RxnQWaLqGpzE3ZKZ0ik63Eh4LdTt-aDzYQJuDJ_7EmLJc5VLNd-aTEYmGrM-oa0lbuIuO1hqZD39COH0sNvUPM1xJpH6uhJiorPvRvYUbWxktUaE",
      videosCount: 8,
      studentsCount: 28,
    },
    {
      id: "3",
      name: "Química Orgánica",
      category: "Química",
      professor: "Dr. Carlos Méndez",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBPdO8EUPwyes0jsoTFnU9pPhn3vnkrZrgzZt21hkSmar32xOGgGCbvuAe4oBV3OtG88JWTJlmyIlst3dk9Y-Yvi9W47BuknjiP7kOedS_MA4WjGAfQxGT_Z600UEgBO2EdVVtnCIZCwC1VtaAyYZHogq-EM-wuhuixcqSo0x01Q3x5xAaDdw_QsI_Q-tsck1wTwk69qHRoASciuz7F-dXRfnaFLqU2b3B_HWJs5mfrJmmTqE6Df94CFdTQsfp4znZA5rWx3Jb3E0o",
      videosCount: 15,
      studentsCount: 42,
    },
  ];

  const handleJoinClass = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar lógica para unirse a clase
    console.log("Unirse a clase con código:", accessCode);
    setIsJoinModalOpen(false);
    setAccessCode("");
  };

  return (
    <>
      <Header
        title="Mis Clases"
        subtitle="Selecciona una clase para ver sus videos"
        user={{
          name: "Sofía",
          email: "sofia@estudiante.com",
          role: "Estudiante",
        }}
      />
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-[#111318]">Mis Clases</h1>
            <p className="text-[#616f89]">
              Gestiona tus clases y accede a los materiales
            </p>
          </div>
          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-primary/30"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            <span>Unirse a Clase</span>
          </button>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockClasses.map((classItem) => (
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
                        : classItem.category === "Historia"
                        ? "text-purple-500"
                        : "text-green-500"
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
                <div className="flex items-center gap-4 mt-auto pt-2 text-sm text-[#616f89]">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">
                      video_library
                    </span>
                    <span>{classItem.videosCount} Videos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">
                      group
                    </span>
                    <span>{classItem.studentsCount} Estudiantes</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Join Class Modal */}
      {isJoinModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setIsJoinModalOpen(false)}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-[#e5e7eb] flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#111318]">
                Unirse a Clase
              </h2>
              <button
                onClick={() => setIsJoinModalOpen(false)}
                className="text-[#616f89] hover:text-[#111318]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleJoinClass} className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#111318]">
                  Código de Acceso
                </label>
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  placeholder="Ingresa el código de acceso"
                  className="w-full rounded-lg border border-[#dbdfe6] bg-white text-[#111318] h-12 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-center text-2xl font-bold tracking-widest uppercase"
                  required
                  maxLength={6}
                />
                <p className="text-xs text-[#616f89]">
                  Solicita el código de acceso a tu profesor
                </p>
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-[#e5e7eb]">
                <button
                  type="button"
                  onClick={() => setIsJoinModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg border border-[#dbdfe6] text-[#111318] hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-primary hover:bg-blue-700 text-white font-medium transition-colors"
                >
                  Unirse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

