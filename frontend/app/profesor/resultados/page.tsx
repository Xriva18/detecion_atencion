"use client";

import { useState } from "react";
import Header from "@/components/Admin/Header";

// Mock data - En producción esto vendría de una API
interface StudentResult {
  id: string;
  name: string;
  email: string;
  average: number;
  completed: number;
  total: number;
  lastActivity: string;
}

const mockStudents: StudentResult[] = [
  {
    id: "1",
    name: "Ana García",
    email: "ana.garcia@edu.com",
    average: 8.5,
    completed: 12,
    total: 15,
    lastActivity: "Hace 2 horas",
  },
  {
    id: "2",
    name: "Carlos Méndez",
    email: "carlos.mendez@edu.com",
    average: 9.2,
    completed: 15,
    total: 15,
    lastActivity: "Ayer",
  },
  {
    id: "3",
    name: "María López",
    email: "maria.lopez@edu.com",
    average: 7.8,
    completed: 10,
    total: 15,
    lastActivity: "Hace 3 días",
  },
];

const mockClasses = [
  "Todas las clases",
  "Matemáticas 101",
  "Historia Universal",
  "Química Orgánica",
];

const mockKPIs = {
  average: 8.5,
  approvalRate: 92,
  atRisk: 3,
};

export default function ResultadosPage() {
  const [selectedClass, setSelectedClass] = useState("Todas las clases");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = mockStudents.filter((student) => {
    return (
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <>
      <Header
        title="Reportes de Resultados"
        subtitle="Analiza el rendimiento de tus estudiantes"
        user={{
          name: "Prof. Carlos Ruiz",
          email: "carlos.ruiz@edu.com",
          role: "Profesor",
        }}
      />
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
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
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616f89]">
              <span className="material-symbols-outlined text-[18px]">search</span>
            </span>
            <input
              className="w-full bg-white border border-[#dbdfe6] rounded-lg py-2.5 pl-9 pr-3 text-sm focus:ring-primary focus:border-primary placeholder:text-[#616f89] text-[#111318]"
              placeholder="Buscar por nombre..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-5 border border-[#e5e7eb] shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-primary">
                school
              </span>
            </div>
            <p className="text-sm font-medium text-[#616f89] z-10">
              Promedio General
            </p>
            <div>
              <p className="text-3xl font-black text-[#111318] tracking-tight">
                {mockKPIs.average}
                <span className="text-lg text-[#616f89] font-medium">/10</span>
              </p>
              <div className="flex items-center gap-1 mt-1 text-green-600 text-xs font-bold">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>+0.2% vs mes anterior</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-[#e5e7eb] shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-green-500">
                check_circle
              </span>
            </div>
            <p className="text-sm font-medium text-[#616f89] z-10">
              Tasa de Aprobación
            </p>
            <div>
              <p className="text-3xl font-black text-[#111318] tracking-tight">
                {mockKPIs.approvalRate}%
              </p>
              <div className="flex items-center gap-1 mt-1 text-green-600 text-xs font-bold">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>+1.5% record histórico</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-[#e5e7eb] shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-red-500">
                warning
              </span>
            </div>
            <p className="text-sm font-medium text-[#616f89] z-10">
              Estudiantes en Riesgo
            </p>
            <div>
              <p className="text-3xl font-black text-[#111318] tracking-tight">
                {mockKPIs.atRisk}
              </p>
              <div className="flex items-center gap-1 mt-1 text-red-600 text-xs font-bold">
                <span className="material-symbols-outlined text-sm">trending_down</span>
                <span>-2 desde la semana pasada</span>
              </div>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e5e7eb] bg-gray-50">
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#616f89]">
                    Estudiante
                  </th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#616f89]">
                    Promedio
                  </th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#616f89]">
                    Completados
                  </th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#616f89]">
                    Última Actividad
                  </th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#616f89] text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="group hover:bg-[#f9fafb] transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-full bg-gray-100 text-gray-500 font-bold flex items-center justify-center border border-gray-200">
                          {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[#111318]">
                            {student.name}
                          </span>
                          <span className="text-sm text-[#616f89]">
                            {student.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-bold text-[#111318]">
                        {student.average}/10
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-[#111318]">
                        {student.completed}/{student.total}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-[#111318]">
                      {student.lastActivity}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="size-8 flex items-center justify-center rounded-lg text-[#616f89] hover:text-primary hover:bg-blue-50 transition-colors"
                          title="Ver Detalles"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            visibility
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

