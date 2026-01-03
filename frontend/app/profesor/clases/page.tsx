"use client";

import { useState } from "react";
import Header from "@/components/Admin/Header";
import {
  CreateClassModal,
  EditClassModal,
  CodeModal,
  DeleteClassModal,
} from "@/components/Profesor/ClassModals";

// Mock data - En producción esto vendría de una API
interface Class {
  id: string;
  name: string;
  description: string;
  status: "Activo" | "Archivado" | "Borrador";
  students: number;
  videos: number;
  schedule?: string;
  imageUrl?: string;
  accessCode?: string;
}

const mockClasses: Class[] = [
  {
    id: "1",
    name: "Matemáticas 101",
    description:
      "Introducción al Álgebra, ecuaciones lineales y desigualdades básicas para primer semestre.",
    status: "Activo",
    students: 35,
    videos: 12,
    schedule: "Lunes y Miércoles • 10:00 AM - 12:00 PM",
    accessCode: "ABC123",
  },
  {
    id: "2",
    name: "Historia Universal",
    description:
      "La Revolución Industrial y sus consecuencias en la sociedad moderna.",
    status: "Activo",
    students: 28,
    videos: 8,
  },
  {
    id: "3",
    name: "Química Orgánica",
    description: "Fundamentos de química del carbono. Curso finalizado en 2023.",
    status: "Archivado",
    students: 42,
    videos: 15,
  },
];

export default function GestiónClasesPage() {
  const [classes, setClasses] = useState<Class[]>(mockClasses);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos los estados");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  const filteredClasses = classes.filter((classItem) => {
    const matchesSearch =
      classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "Todos los estados" ||
      classItem.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateClass = (classData: Partial<Class>) => {
    const newClass: Class = {
      id: Date.now().toString(),
      name: classData.name || "",
      description: classData.description || "",
      status: (classData.status as Class["status"]) || "Activo",
      students: 0,
      videos: 0,
    };
    setClasses([...classes, newClass]);
    setIsCreateModalOpen(false);
  };

  const handleEditClass = (classData: Class) => {
    setClasses(
      classes.map((c) => (c.id === classData.id ? classData : c))
    );
    setIsEditModalOpen(false);
    setSelectedClass(null);
  };

  const handleDeleteClass = () => {
    if (selectedClass) {
      setClasses(classes.filter((c) => c.id !== selectedClass.id));
      setIsDeleteModalOpen(false);
      setSelectedClass(null);
    }
  };

  const handleGenerateCode = (classId: string) => {
    const newCode =
      Math.random().toString(36).substring(2, 5).toUpperCase() +
      Math.floor(Math.random() * 1000);
    setClasses(
      classes.map((c) =>
        c.id === classId ? { ...c, accessCode: newCode } : c
      )
    );
  };

  const getStatusBadge = (status: Class["status"]) => {
    const styles = {
      Activo: "bg-green-50 text-green-700 border-green-100",
      Archivado: "bg-gray-100 text-gray-600 border-gray-200",
      Borrador: "bg-yellow-50 text-yellow-700 border-yellow-100",
    };

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${styles[status]}`}
      >
        {status === "Activo" && (
          <span className="size-1.5 rounded-full bg-green-500"></span>
        )}
        {status}
      </span>
    );
  };

  return (
    <>
      <Header
        title="Gestión de Clases"
        subtitle="Crea y administra tus clases, genera códigos de acceso"
        user={{
          name: "Prof. Carlos Ruiz",
          email: "carlos.ruiz@edu.com",
          role: "Profesor",
        }}
      />
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <label className="flex flex-col flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#616f89]">
              <span className="material-symbols-outlined">search</span>
            </span>
            <input
              className="flex w-full rounded-lg text-[#111318] focus:outline-none focus:ring-2 focus:ring-primary border border-[#dbdfe6] bg-white h-12 pl-12 pr-4 text-base transition-shadow"
              placeholder="Buscar por nombre de clase o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>
          <div className="flex gap-4">
            <div className="relative min-w-[200px]">
              <select
                className="appearance-none flex w-full rounded-lg text-[#111318] focus:outline-none focus:ring-2 focus:ring-primary border border-[#dbdfe6] bg-white h-12 px-4 pr-10 text-base cursor-pointer"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option>Todos los estados</option>
                <option>Activo</option>
                <option>Archivado</option>
                <option>Borrador</option>
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#616f89]">
                <span className="material-symbols-outlined">expand_more</span>
              </span>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-primary/30"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              <span>Nueva Clase</span>
            </button>
          </div>
        </div>

        {/* Grid of Classes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classItem) => (
            <div
              key={classItem.id}
              className="group flex flex-col bg-white rounded-xl shadow-sm hover:shadow-md border border-[#e5e7eb] overflow-hidden transition-all duration-300"
            >
              <div className="relative h-40 bg-gray-200 overflow-hidden">
                {classItem.imageUrl ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${classItem.imageUrl})` }}
                  ></div>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-200"></div>
                )}
                <div className="absolute top-3 left-3">
                  {getStatusBadge(classItem.status)}
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="bg-white/90 text-gray-700 p-1.5 rounded-lg backdrop-blur-sm hover:bg-white">
                    <span className="material-symbols-outlined text-[20px]">
                      more_vert
                    </span>
                  </button>
                </div>
              </div>
              <div className="flex flex-col p-5 flex-1">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-[#111318] mb-1 line-clamp-1">
                    {classItem.name}
                  </h3>
                  <p className="text-sm text-[#616f89] line-clamp-2">
                    {classItem.description}
                  </p>
                </div>
                <div className="flex items-center gap-4 mb-5 text-sm text-[#616f89]">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">
                      group
                    </span>
                    <span>{classItem.students} Estudiantes</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">
                      video_library
                    </span>
                    <span>{classItem.videos} Videos</span>
                  </div>
                </div>
                <div className="mt-auto border-t border-[#e5e7eb] pt-4 flex items-center justify-between gap-2">
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setSelectedClass(classItem);
                        setIsCodeModalOpen(true);
                      }}
                      className="flex items-center justify-center p-2 rounded-lg text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                      title="Generar Código"
                      disabled={classItem.status !== "Activo"}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        vpn_key
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedClass(classItem);
                        setIsEditModalOpen(true);
                      }}
                      className="flex items-center justify-center p-2 rounded-lg text-[#616f89] hover:bg-gray-100 transition-colors"
                      title="Editar Clase"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        edit
                      </span>
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedClass(classItem);
                      setIsDeleteModalOpen(true);
                    }}
                    className="flex items-center justify-center p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                    title="Eliminar Clase"
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

      {/* Modals */}
      <CreateClassModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateClass}
      />
      <EditClassModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedClass(null);
        }}
        classItem={selectedClass}
        onSave={handleEditClass}
      />
      <CodeModal
        isOpen={isCodeModalOpen}
        onClose={() => {
          setIsCodeModalOpen(false);
          setSelectedClass(null);
        }}
        classItem={selectedClass}
        onGenerateNewCode={() => {
          if (selectedClass) {
            handleGenerateCode(selectedClass.id);
          }
        }}
      />
      <DeleteClassModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedClass(null);
        }}
        classItem={selectedClass}
        onDelete={handleDeleteClass}
      />
    </>
  );
}

