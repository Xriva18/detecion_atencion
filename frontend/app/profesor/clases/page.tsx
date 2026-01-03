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

interface Video {
  id: string;
  title: string;
  description: string;
  duration: string;
  uploadDate: string;
  classId: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  classId: string;
}

interface StudentVideoResult {
  studentId: string;
  videoId: string;
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  totalQuestions: number;
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

// Mock data para videos
const mockVideos: Video[] = [
  {
    id: "v1",
    title: "Introducción a las Ecuaciones Lineales",
    description: "Conceptos básicos de ecuaciones lineales y su resolución",
    duration: "45:30",
    uploadDate: "2024-01-15",
    classId: "1",
  },
  {
    id: "v2",
    title: "Sistemas de Ecuaciones",
    description: "Métodos de resolución de sistemas de ecuaciones lineales",
    duration: "52:15",
    uploadDate: "2024-01-22",
    classId: "1",
  },
  {
    id: "v3",
    title: "Desigualdades Lineales",
    description: "Resolución de desigualdades y representación gráfica",
    duration: "38:45",
    uploadDate: "2024-01-29",
    classId: "1",
  },
  {
    id: "v4",
    title: "La Revolución Industrial",
    description: "Orígenes y desarrollo de la Revolución Industrial",
    duration: "60:00",
    uploadDate: "2024-02-01",
    classId: "2",
  },
];

// Mock data para estudiantes
const mockStudents: Student[] = [
  {
    id: "s1",
    name: "Juan Pérez",
    email: "juan.perez@estudiante.com",
    classId: "1",
  },
  {
    id: "s2",
    name: "María González",
    email: "maria.gonzalez@estudiante.com",
    classId: "1",
  },
  {
    id: "s3",
    name: "Carlos Rodríguez",
    email: "carlos.rodriguez@estudiante.com",
    classId: "1",
  },
  {
    id: "s4",
    name: "Ana Martínez",
    email: "ana.martinez@estudiante.com",
    classId: "1",
  },
  {
    id: "s5",
    name: "Luis Fernández",
    email: "luis.fernandez@estudiante.com",
    classId: "1",
  },
];

// Mock data para resultados de estudiantes en videos
const mockStudentVideoResults: StudentVideoResult[] = [
  {
    studentId: "s1",
    videoId: "v1",
    score: 85,
    correctAnswers: 17,
    incorrectAnswers: 3,
    totalQuestions: 20,
  },
  {
    studentId: "s2",
    videoId: "v1",
    score: 90,
    correctAnswers: 18,
    incorrectAnswers: 2,
    totalQuestions: 20,
  },
  {
    studentId: "s3",
    videoId: "v1",
    score: 75,
    correctAnswers: 15,
    incorrectAnswers: 5,
    totalQuestions: 20,
  },
  {
    studentId: "s4",
    videoId: "v1",
    score: 95,
    correctAnswers: 19,
    incorrectAnswers: 1,
    totalQuestions: 20,
  },
  {
    studentId: "s5",
    videoId: "v1",
    score: 70,
    correctAnswers: 14,
    incorrectAnswers: 6,
    totalQuestions: 20,
  },
  {
    studentId: "s1",
    videoId: "v2",
    score: 80,
    correctAnswers: 16,
    incorrectAnswers: 4,
    totalQuestions: 20,
  },
  {
    studentId: "s2",
    videoId: "v2",
    score: 88,
    correctAnswers: 18,
    incorrectAnswers: 2,
    totalQuestions: 20,
  },
  {
    studentId: "s3",
    videoId: "v2",
    score: 72,
    correctAnswers: 14,
    incorrectAnswers: 6,
    totalQuestions: 20,
  },
  {
    studentId: "s4",
    videoId: "v2",
    score: 92,
    correctAnswers: 18,
    incorrectAnswers: 2,
    totalQuestions: 20,
  },
  {
    studentId: "s5",
    videoId: "v2",
    score: 65,
    correctAnswers: 13,
    incorrectAnswers: 7,
    totalQuestions: 20,
  },
];

export default function GestiónClasesPage() {
  const [classes, setClasses] = useState<Class[]>(mockClasses);
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos los estados");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "detail" | "videoResults">("list");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [activeTab, setActiveTab] = useState<"videos" | "students">("videos");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isViewStudentModalOpen, setIsViewStudentModalOpen] = useState(false);
  const [isDeleteStudentModalOpen, setIsDeleteStudentModalOpen] = useState(false);

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

  const handleClassClick = (classItem: Class) => {
    setSelectedClass(classItem);
    setViewMode("detail");
    setActiveTab("videos");
    setSelectedVideo(null);
  };

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setViewMode("videoResults");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedClass(null);
    setSelectedVideo(null);
  };

  const handleBackToDetail = () => {
    setViewMode("detail");
    setSelectedVideo(null);
  };

  const getClassVideos = (classId: string) => {
    return mockVideos.filter((v) => v.classId === classId);
  };

  const getClassStudents = (classId: string) => {
    return students.filter((s) => s.classId === classId);
  };

  const getVideoResults = (videoId: string) => {
    const results = mockStudentVideoResults.filter((r) => r.videoId === videoId);
    return results.map((result) => {
      const student = students.find((s) => s.id === result.studentId);
      return {
        ...result,
        studentName: student?.name || "Estudiante desconocido",
        studentEmail: student?.email || "",
      };
    });
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsViewStudentModalOpen(true);
  };

  const handleDeleteStudent = () => {
    if (selectedStudent && selectedClass) {
      // En producción, esto sería una llamada a la API
      // Por ahora, solo actualizamos el estado local
      setStudents(
        students.filter(
          (s) => !(s.id === selectedStudent.id && s.classId === selectedClass.id)
        )
      );
      // Actualizar el contador de estudiantes en la clase
      setClasses(
        classes.map((c) =>
          c.id === selectedClass.id
            ? { ...c, students: Math.max(0, c.students - 1) }
            : c
        )
      );
      setIsDeleteStudentModalOpen(false);
      setSelectedStudent(null);
    }
  };

  const getStudentVideoResults = (studentId: string) => {
    return mockStudentVideoResults
      .filter((r) => r.studentId === studentId)
      .map((result) => {
        const video = mockVideos.find((v) => v.id === result.videoId);
        return {
          ...result,
          videoTitle: video?.title || "Video desconocido",
        };
      });
  };

  // Vista de resultados de estudiantes por video
  if (viewMode === "videoResults" && selectedVideo && selectedClass) {
    const videoResults = getVideoResults(selectedVideo.id);

    return (
      <>
        <Header
          title={selectedVideo.title}
          subtitle={`Resultados de estudiantes - ${selectedClass.name}`}
          user={{
            name: "Prof. Carlos Ruiz",
            email: "carlos.ruiz@edu.com",
            role: "Profesor",
          }}
        />
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
          <button
            onClick={handleBackToDetail}
            className="flex items-center gap-2 text-[#616f89] hover:text-[#111318] transition-colors w-fit"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span>Volver a {selectedClass.name}</span>
          </button>

          <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#111318] mb-2">
                {selectedVideo.title}
              </h2>
              <p className="text-sm text-[#616f89] mb-4">
                {selectedVideo.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-[#616f89]">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">
                    schedule
                  </span>
                  <span>{selectedVideo.duration}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">
                    calendar_today
                  </span>
                  <span>{new Date(selectedVideo.uploadDate).toLocaleDateString("es-ES")}</span>
                </span>
              </div>
            </div>

            <div className="border-t border-[#e5e7eb] pt-6">
              <h3 className="text-lg font-semibold text-[#111318] mb-4">
                Resultados de Estudiantes
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#e5e7eb]">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#111318]">
                        Estudiante
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#111318]">
                        Nota
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#111318]">
                        Respuestas Correctas
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#111318]">
                        Respuestas Fallidas
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#111318]">
                        Total Preguntas
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {videoResults.map((result) => (
                      <tr
                        key={result.studentId}
                        className="border-b border-[#e5e7eb] hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-[#111318]">
                              {result.studentName}
                            </div>
                            <div className="text-sm text-[#616f89]">
                              {result.studentEmail}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold ${
                              result.score >= 80
                                ? "bg-green-50 text-green-700"
                                : result.score >= 60
                                ? "bg-yellow-50 text-yellow-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {result.score}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#111318]">
                          {result.correctAnswers}
                        </td>
                        <td className="py-3 px-4 text-[#111318]">
                          {result.incorrectAnswers}
                        </td>
                        <td className="py-3 px-4 text-[#111318]">
                          {result.totalQuestions}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Vista de detalle de clase con tabs
  if (viewMode === "detail" && selectedClass) {
    const classVideos = getClassVideos(selectedClass.id);
    const classStudents = getClassStudents(selectedClass.id);

    return (
      <>
        <Header
          title={selectedClass.name}
          subtitle={selectedClass.description}
          user={{
            name: "Prof. Carlos Ruiz",
            email: "carlos.ruiz@edu.com",
            role: "Profesor",
          }}
        />
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 text-[#616f89] hover:text-[#111318] transition-colors w-fit"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span>Volver a Gestión de Clases</span>
          </button>

          {/* Tabs */}
          <div className="border-b border-[#e5e7eb]">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("videos")}
                className={`pb-4 px-2 font-medium transition-colors ${
                  activeTab === "videos"
                    ? "text-primary border-b-2 border-primary"
                    : "text-[#616f89] hover:text-[#111318]"
                }`}
              >
                Videos ({classVideos.length})
              </button>
              <button
                onClick={() => setActiveTab("students")}
                className={`pb-4 px-2 font-medium transition-colors ${
                  activeTab === "students"
                    ? "text-primary border-b-2 border-primary"
                    : "text-[#616f89] hover:text-[#111318]"
                }`}
              >
                Estudiantes ({classStudents.length})
              </button>
            </div>
          </div>

          {/* Tab Content - Videos */}
          {activeTab === "videos" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classVideos.length > 0 ? (
                classVideos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => handleVideoClick(video)}
                    className="group flex flex-col bg-white rounded-xl shadow-sm hover:shadow-md border border-[#e5e7eb] overflow-hidden transition-all duration-300 cursor-pointer"
                  >
                    <div className="relative h-32 bg-gray-200 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-200 flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-primary/50">
                          play_circle
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col p-4 flex-1">
                      <h3 className="text-lg font-bold text-[#111318] mb-2 line-clamp-2">
                        {video.title}
                      </h3>
                      <p className="text-sm text-[#616f89] line-clamp-2 mb-4">
                        {video.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-[#616f89] mt-auto">
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[18px]">
                            schedule
                          </span>
                          <span>{video.duration}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[18px]">
                            calendar_today
                          </span>
                          <span>
                            {new Date(video.uploadDate).toLocaleDateString("es-ES")}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-[#616f89]">
                  <span className="material-symbols-outlined text-6xl mb-4 block">
                    video_library
                  </span>
                  <p>No hay videos disponibles para esta clase</p>
                </div>
              )}
            </div>
          )}

          {/* Tab Content - Estudiantes */}
          {activeTab === "students" && (
            <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#e5e7eb] bg-gray-50">
                      <th className="text-left py-3 px-6 text-sm font-semibold text-[#111318]">
                        Nombre
                      </th>
                      <th className="text-left py-3 px-6 text-sm font-semibold text-[#111318]">
                        Email
                      </th>
                      <th className="text-left py-3 px-6 text-sm font-semibold text-[#111318]">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {classStudents.length > 0 ? (
                      classStudents.map((student) => (
                        <tr
                          key={student.id}
                          className="border-b border-[#e5e7eb] hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-6 text-[#111318]">
                            {student.name}
                          </td>
                          <td className="py-3 px-6 text-[#616f89]">
                            {student.email}
                          </td>
                          <td className="py-3 px-6">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewStudent(student)}
                                className="flex items-center justify-center p-2 rounded-lg text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                                title="Ver detalles"
                              >
                                <span className="material-symbols-outlined text-[20px]">
                                  visibility
                                </span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setIsDeleteStudentModalOpen(true);
                                }}
                                className="flex items-center justify-center p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                title="Eliminar de la clase"
                              >
                                <span className="material-symbols-outlined text-[20px]">
                                  delete
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="py-12 text-center text-[#616f89]"
                        >
                          No hay estudiantes registrados en esta clase
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modales de Estudiante */}
        {/* Modal Ver Estudiante */}
        {isViewStudentModalOpen && selectedStudent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-[#e5e7eb]">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[#111318]">
                    Detalles del Estudiante
                  </h2>
                  <button
                    onClick={() => {
                      setIsViewStudentModalOpen(false);
                      setSelectedStudent(null);
                    }}
                    className="text-[#616f89] hover:text-[#111318] transition-colors"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[#111318] mb-2">
                    Información Personal
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-[#616f89]">Nombre</label>
                      <p className="text-base text-[#111318] font-medium">
                        {selectedStudent.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-[#616f89]">Email</label>
                      <p className="text-base text-[#111318] font-medium">
                        {selectedStudent.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#e5e7eb] pt-6">
                  <h3 className="text-lg font-semibold text-[#111318] mb-4">
                    Resultados por Video
                  </h3>
                  {getStudentVideoResults(selectedStudent.id).length > 0 ? (
                    <div className="space-y-4">
                      {getStudentVideoResults(selectedStudent.id).map(
                        (result, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-lg p-4 border border-[#e5e7eb]"
                          >
                            <h4 className="font-medium text-[#111318] mb-3">
                              {result.videoTitle}
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <label className="text-xs text-[#616f89]">
                                  Nota
                                </label>
                                <p
                                  className={`text-lg font-semibold ${
                                    result.score >= 80
                                      ? "text-green-700"
                                      : result.score >= 60
                                      ? "text-yellow-700"
                                      : "text-red-700"
                                  }`}
                                >
                                  {result.score}%
                                </p>
                              </div>
                              <div>
                                <label className="text-xs text-[#616f89]">
                                  Correctas
                                </label>
                                <p className="text-lg font-semibold text-[#111318]">
                                  {result.correctAnswers}
                                </p>
                              </div>
                              <div>
                                <label className="text-xs text-[#616f89]">
                                  Fallidas
                                </label>
                                <p className="text-lg font-semibold text-[#111318]">
                                  {result.incorrectAnswers}
                                </p>
                              </div>
                              <div>
                                <label className="text-xs text-[#616f89]">
                                  Total
                                </label>
                                <p className="text-lg font-semibold text-[#111318]">
                                  {result.totalQuestions}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-[#616f89] text-center py-8">
                      El estudiante no ha completado ningún video aún.
                    </p>
                  )}
                </div>
              </div>
              <div className="p-6 border-t border-[#e5e7eb] flex justify-end">
                <button
                  onClick={() => {
                    setIsViewStudentModalOpen(false);
                    setSelectedStudent(null);
                  }}
                  className="px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Eliminar Estudiante */}
        {isDeleteStudentModalOpen && selectedStudent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
                    <span className="material-symbols-outlined text-red-600">
                      warning
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#111318]">
                      Eliminar Estudiante
                    </h2>
                  </div>
                </div>
                <p className="text-[#616f89] mb-6">
                  ¿Estás seguro de que deseas eliminar a{" "}
                  <span className="font-semibold text-[#111318]">
                    {selectedStudent.name}
                  </span>{" "}
                  de esta clase? Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setIsDeleteStudentModalOpen(false);
                      setSelectedStudent(null);
                    }}
                    className="px-4 py-2 border border-[#e5e7eb] text-[#111318] rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteStudent}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Vista de lista de clases (por defecto)
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
              onClick={() => handleClassClick(classItem)}
              className="group flex flex-col bg-white rounded-xl shadow-sm hover:shadow-md border border-[#e5e7eb] overflow-hidden transition-all duration-300 cursor-pointer"
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
                      onClick={(e) => {
                        e.stopPropagation();
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
                      onClick={(e) => {
                        e.stopPropagation();
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
                    onClick={(e) => {
                      e.stopPropagation();
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

      {/* Modal Ver Estudiante */}
      {isViewStudentModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#e5e7eb]">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#111318]">
                  Detalles del Estudiante
                </h2>
                <button
                  onClick={() => {
                    setIsViewStudentModalOpen(false);
                    setSelectedStudent(null);
                  }}
                  className="text-[#616f89] hover:text-[#111318] transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#111318] mb-2">
                  Información Personal
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-[#616f89]">Nombre</label>
                    <p className="text-base text-[#111318] font-medium">
                      {selectedStudent.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-[#616f89]">Email</label>
                    <p className="text-base text-[#111318] font-medium">
                      {selectedStudent.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#e5e7eb] pt-6">
                <h3 className="text-lg font-semibold text-[#111318] mb-4">
                  Resultados por Video
                </h3>
                {getStudentVideoResults(selectedStudent.id).length > 0 ? (
                  <div className="space-y-4">
                    {getStudentVideoResults(selectedStudent.id).map(
                      (result, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 rounded-lg p-4 border border-[#e5e7eb]"
                        >
                          <h4 className="font-medium text-[#111318] mb-3">
                            {result.videoTitle}
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <label className="text-xs text-[#616f89]">
                                Nota
                              </label>
                              <p
                                className={`text-lg font-semibold ${
                                  result.score >= 80
                                    ? "text-green-700"
                                    : result.score >= 60
                                    ? "text-yellow-700"
                                    : "text-red-700"
                                }`}
                              >
                                {result.score}%
                              </p>
                            </div>
                            <div>
                              <label className="text-xs text-[#616f89]">
                                Correctas
                              </label>
                              <p className="text-lg font-semibold text-[#111318]">
                                {result.correctAnswers}
                              </p>
                            </div>
                            <div>
                              <label className="text-xs text-[#616f89]">
                                Fallidas
                              </label>
                              <p className="text-lg font-semibold text-[#111318]">
                                {result.incorrectAnswers}
                              </p>
                            </div>
                            <div>
                              <label className="text-xs text-[#616f89]">
                                Total
                              </label>
                              <p className="text-lg font-semibold text-[#111318]">
                                {result.totalQuestions}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-[#616f89] text-center py-8">
                    El estudiante no ha completado ningún video aún.
                  </p>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-[#e5e7eb] flex justify-end">
              <button
                onClick={() => {
                  setIsViewStudentModalOpen(false);
                  setSelectedStudent(null);
                }}
                className="px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar Estudiante */}
      {isDeleteStudentModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
                  <span className="material-symbols-outlined text-red-600">
                    warning
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#111318]">
                    Eliminar Estudiante
                  </h2>
                </div>
              </div>
              <p className="text-[#616f89] mb-6">
                ¿Estás seguro de que deseas eliminar a{" "}
                <span className="font-semibold text-[#111318]">
                  {selectedStudent.name}
                </span>{" "}
                de esta clase? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setIsDeleteStudentModalOpen(false);
                    setSelectedStudent(null);
                  }}
                  className="px-4 py-2 border border-[#e5e7eb] text-[#111318] rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteStudent}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

