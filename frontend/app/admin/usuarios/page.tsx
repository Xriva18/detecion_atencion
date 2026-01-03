"use client";

import { useState } from "react";
import Header from "@/components/Admin/Header";
import UserTable from "@/components/Admin/UserTable";
import {
  AddUserModal,
  EditUserModal,
  DeleteUserModal,
  ResetPasswordModal,
  UserDetailsModal,
} from "@/components/Admin/UserModals";

interface User {
  id: string;
  name: string;
  email: string;
  role: "Estudiante" | "Profesor" | "Admin";
  status: "Activo" | "Inactivo";
  lastActivity: string;
  avatar?: string;
  classes?: string[];
}

// Mock data - En producción esto vendría de una API
const mockUsers: User[] = [
  {
    id: "1",
    name: "Ana García",
    email: "ana.garcia@edu.com",
    role: "Estudiante",
    status: "Activo",
    lastActivity: "Hace 2 horas",
    classes: ["Matemáticas I", "Física Básica", "Programación Web"],
  },
  {
    id: "2",
    name: "Carlos Ruiz",
    email: "carlos.ruiz@edu.com",
    role: "Profesor",
    status: "Activo",
    lastActivity: "Ayer",
    classes: ["Álgebra Lineal", "Cálculo Diferencial"],
  },
  {
    id: "3",
    name: "Elena M.",
    email: "elena.m@edu.com",
    role: "Estudiante",
    status: "Inactivo",
    lastActivity: "Hace 5 días",
  },
  {
    id: "4",
    name: "Jorge T.",
    email: "jorge.t@edu.com",
    role: "Admin",
    status: "Activo",
    lastActivity: "Hace 5 minutos",
  },
  {
    id: "5",
    name: "Lucía P.",
    email: "lucia.p@edu.com",
    role: "Estudiante",
    status: "Activo",
    lastActivity: "Nunca",
    classes: ["Introducción a la Programación"],
  },
];

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("Todos");
  const [statusFilter, setStatusFilter] = useState<string>("Todos");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] =
    useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Filtrar usuarios
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.includes(searchTerm);
    const matchesRole = roleFilter === "Todos" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "Todos" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setIsResetPasswordModalOpen(true);
  };

  const handleSaveUser = (userData: Partial<User>) => {
    if (selectedUser) {
      // Editar usuario existente
      setUsers(
        users.map((u) => (u.id === selectedUser.id ? { ...u, ...userData } : u))
      );
    } else {
      // Crear nuevo usuario
      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name || "",
        email: userData.email || "",
        role: (userData.role as User["role"]) || "Estudiante",
        status: (userData.status as User["status"]) || "Activo",
        lastActivity: "Nunca",
        classes: [],
      };
      setUsers([...users, newUser]);
    }
    setSelectedUser(null);
  };

  const handleDeleteUser = () => {
    if (selectedUser) {
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      setSelectedUser(null);
    }
  };

  const handleResetPasswordConfirm = (password?: string) => {
    // TODO: Implementar lógica de restablecimiento de contraseña
    console.log("Restablecer contraseña para:", selectedUser?.email, password);
  };

  return (
    <>
      <Header
        title="Gestión de Usuarios"
        subtitle="Administra el acceso y los roles de los usuarios de la plataforma"
      />
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
        {/* Page Heading */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-[#111318] text-2xl md:text-3xl font-bold leading-tight tracking-tight">
              Gestión de Usuarios
            </h1>
            <p className="text-[#616f89] text-sm font-normal">
              Crea nuevos perfiles, gestiona permisos y administra el acceso de
              los usuarios.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-lg h-11 px-5 bg-primary hover:bg-blue-700 text-white text-sm font-bold leading-normal tracking-[0.015em] transition-colors shadow-sm shadow-blue-200"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span className="truncate">Añadir Nuevo Usuario</span>
          </button>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-4 rounded-xl border border-[#e5e7eb] shadow-sm">
          {/* Search */}
          <div className="w-full md:max-w-md">
            <div className="relative flex items-center w-full h-10 rounded-lg focus-within:ring-2 focus-within:ring-primary overflow-hidden border border-[#dbdfe6] bg-white">
              <div className="grid place-items-center h-full w-10 text-[#616f89]">
                <span className="material-symbols-outlined text-[20px]">
                  search
                </span>
              </div>
              <input
                className="peer h-full w-full outline-none text-sm text-[#111318] bg-transparent pr-2 placeholder:text-[#9ca3af]"
                id="search"
                placeholder="Buscar por nombre, correo o ID..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Chips / Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group">
              <select
                className="flex h-10 items-center justify-between gap-x-2 rounded-lg bg-[#f0f2f4] hover:bg-[#e5e7eb] px-4 transition-colors min-w-[140px] text-[#111318] text-sm font-medium"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="Todos">Rol: Todos</option>
                <option value="Estudiante">Rol: Estudiante</option>
                <option value="Profesor">Rol: Profesor</option>
                <option value="Admin">Rol: Admin</option>
              </select>
            </div>
            <div className="relative group">
              <select
                className="flex h-10 items-center justify-between gap-x-2 rounded-lg bg-[#f0f2f4] hover:bg-[#e5e7eb] px-4 transition-colors min-w-[150px] text-[#111318] text-sm font-medium"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="Todos">Estado: Todos</option>
                <option value="Activo">Estado: Activo</option>
                <option value="Inactivo">Estado: Inactivo</option>
              </select>
            </div>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#dbdfe6] bg-white text-[#616f89] hover:bg-gray-50 transition-colors"
              title="Exportar"
            >
              <span className="material-symbols-outlined text-[20px]">
                download
              </span>
            </button>
          </div>
        </div>

        {/* Table Section */}
        <UserTable
          users={filteredUsers}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onResetPassword={handleResetPassword}
          onDelete={handleDelete}
        />
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleSaveUser}
      />

      <EditUserModal
        key={selectedUser?.id || "new"}
        isOpen={isEditModalOpen}
        user={selectedUser}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleSaveUser}
      />

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        user={selectedUser}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        onDelete={handleDeleteUser}
      />

      <ResetPasswordModal
        isOpen={isResetPasswordModalOpen}
        user={selectedUser}
        onClose={() => {
          setIsResetPasswordModalOpen(false);
          setSelectedUser(null);
        }}
        onResetPassword={handleResetPasswordConfirm}
      />

      <UserDetailsModal
        isOpen={isDetailsModalOpen}
        user={selectedUser}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedUser(null);
        }}
        onEdit={() => {
          setIsDetailsModalOpen(false);
          setIsEditModalOpen(true);
        }}
      />
    </>
  );
}
