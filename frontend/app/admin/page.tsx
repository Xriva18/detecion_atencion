"use client";

import Header from "@/components/Admin/Header";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <>
      <Header
        title="Bienvenido, Administrador"
        subtitle="Resumen de actividad del día"
      />
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
        {/* Stats Grid */}
        <section aria-label="Statistics">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stat Card 1 */}
            <div className="bg-white rounded-xl p-5 border border-[#e5e7eb] shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="bg-primary/10 p-2.5 rounded-lg text-primary">
                  <span className="material-symbols-outlined">group</span>
                </div>
                <span className="flex items-center text-[#07883b] bg-[#07883b]/10 px-2 py-0.5 rounded text-xs font-medium">
                  <span className="material-symbols-outlined text-[14px] mr-1">
                    trending_up
                  </span>
                  +12%
                </span>
              </div>
              <div>
                <p className="text-[#616f89] text-sm font-medium">
                  Total Usuarios
                </p>
                <h3 className="text-[#111318] text-2xl font-bold mt-1">
                  1,250
                </h3>
              </div>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-white rounded-xl p-5 border border-[#e5e7eb] shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="bg-purple-100 p-2.5 rounded-lg text-purple-600">
                  <span className="material-symbols-outlined">school</span>
                </div>
                <span className="flex items-center text-[#07883b] bg-[#07883b]/10 px-2 py-0.5 rounded text-xs font-medium">
                  <span className="material-symbols-outlined text-[14px] mr-1">
                    trending_up
                  </span>
                  +5%
                </span>
              </div>
              <div>
                <p className="text-[#616f89] text-sm font-medium">
                  Estudiantes Activos
                </p>
                <h3 className="text-[#111318] text-2xl font-bold mt-1">850</h3>
              </div>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-white rounded-xl p-5 border border-[#e5e7eb] shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="bg-orange-100 p-2.5 rounded-lg text-orange-600">
                  <span className="material-symbols-outlined">class</span>
                </div>
                <span className="flex items-center text-[#07883b] bg-[#07883b]/10 px-2 py-0.5 rounded text-xs font-medium">
                  <span className="material-symbols-outlined text-[14px] mr-1">
                    trending_up
                  </span>
                  +2%
                </span>
              </div>
              <div>
                <p className="text-[#616f89] text-sm font-medium">
                  Clases Creadas
                </p>
                <h3 className="text-[#111318] text-2xl font-bold mt-1">42</h3>
              </div>
            </div>

            {/* Stat Card 4 */}
            <div className="bg-white rounded-xl p-5 border border-[#e5e7eb] shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="bg-red-100 p-2.5 rounded-lg text-red-600">
                  <span className="material-symbols-outlined">warning</span>
                </div>
                <span className="flex items-center text-[#616f89] bg-gray-100 px-2 py-0.5 rounded text-xs font-medium">
                  0%
                </span>
              </div>
              <div>
                <p className="text-[#616f89] text-sm font-medium">
                  Alertas Pendientes
                </p>
                <h3 className="text-[#111318] text-2xl font-bold mt-1">3</h3>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content: Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Widget: Actividad de Inicio de Sesión */}
          <section className="bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-[#111318] text-lg">
                Actividad de Inicio de Sesión
              </h3>
              <div className="flex gap-2">
                <select className="bg-background-light border-none text-xs rounded-lg px-3 py-1.5 text-[#616f89] focus:ring-1 focus:ring-primary">
                  <option>Últimos 30 días</option>
                  <option>Última semana</option>
                </select>
              </div>
            </div>
            {/* Fake Chart Visual using flex bars */}
            <div className="flex items-end gap-3 h-48 w-full px-2">
              {[40, 60, 30, 75, 55, 85, 65].map((height, index) => (
                <div
                  key={index}
                  className="w-full bg-primary/10 hover:bg-primary/20 transition-colors rounded-t-sm relative group"
                  style={{ height: `${height}%` }}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded">
                    {height}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-[#616f89] px-2">
              <span>Lun</span>
              <span>Mar</span>
              <span>Mié</span>
              <span>Jue</span>
              <span>Vie</span>
              <span>Sáb</span>
              <span>Dom</span>
            </div>
          </section>

          {/* Widget: Distribución de Roles */}
          <section className="bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-sm">
            <h3 className="font-bold text-[#111318] text-lg mb-6">
              Distribución de Roles
            </h3>
            <div className="flex flex-col gap-4">
              {/* Role Item: Estudiantes */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <span className="material-symbols-outlined text-blue-600">
                      school
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#111318]">
                      Estudiantes
                    </p>
                    <p className="text-xs text-[#616f89]">850 usuarios</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-[#111318]">68%</span>
              </div>

              {/* Role Item: Profesores */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <span className="material-symbols-outlined text-purple-600">
                      cast_for_education
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#111318]">
                      Profesores
                    </p>
                    <p className="text-xs text-[#616f89]">350 usuarios</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-[#111318]">28%</span>
              </div>

              {/* Role Item: Administradores */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <span className="material-symbols-outlined text-indigo-600">
                      admin_panel_settings
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#111318]">
                      Administradores
                    </p>
                    <p className="text-xs text-[#616f89]">50 usuarios</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-[#111318]">4%</span>
              </div>
            </div>
            <Link
              href="/admin/usuarios"
              className="mt-6 w-full py-2.5 text-center text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors inline-block"
            >
              Ver Gestión de Usuarios
            </Link>
          </section>

          {/* Widget: Seguridad del Sistema */}
          <section className="bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-sm">
            <h3 className="font-bold text-[#111318] text-lg mb-6">
              Seguridad del Sistema
            </h3>
            <div className="flex flex-col gap-4">
              {/* Security Item */}
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-green-600">
                    shield
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[#111318]">
                      Sistema Seguro
                    </p>
                    <p className="text-xs text-[#616f89]">
                      Última verificación: Hace 2 horas
                    </p>
                  </div>
                </div>
                <span className="size-2 rounded-full bg-green-500"></span>
              </div>

              {/* Security Item */}
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-yellow-600">
                    lock_reset
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[#111318]">
                      Contraseñas Reseteadas
                    </p>
                    <p className="text-xs text-[#616f89]">
                      3 en las últimas 24 horas
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-yellow-600">3</span>
              </div>

              {/* Security Item */}
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-red-600">
                    block
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[#111318]">
                      Intentos Fallidos
                    </p>
                    <p className="text-xs text-[#616f89]">
                      5 intentos bloqueados hoy
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-red-600">5</span>
              </div>
            </div>
          </section>

          {/* Widget: Actividad Reciente */}
          <section className="bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-sm">
            <h3 className="font-bold text-[#111318] text-lg mb-6">
              Actividad Reciente del Sistema
            </h3>
            <div className="flex flex-col gap-4">
              {/* Activity Items */}
              {[
                {
                  icon: "person_add",
                  color: "blue",
                  title: "Nuevo usuario creado",
                  description: "María López registrada como Estudiante",
                  time: "Hace 15 minutos",
                },
                {
                  icon: "edit",
                  color: "purple",
                  title: "Rol modificado",
                  description: "Carlos Ruiz actualizado a Profesor",
                  time: "Hace 1 hora",
                },
                {
                  icon: "lock_reset",
                  color: "orange",
                  title: "Contraseña restablecida",
                  description: "Contraseña de Ana García restablecida",
                  time: "Hace 2 horas",
                },
                {
                  icon: "delete",
                  color: "red",
                  title: "Usuario eliminado",
                  description: "Usuario inactivo eliminado del sistema",
                  time: "Hace 3 horas",
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div
                    className={`bg-${activity.color}-100 text-${activity.color}-600 rounded-full p-2 h-fit`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {activity.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#111318]">
                      {activity.title}
                    </p>
                    <p className="text-xs text-[#616f89]">
                      {activity.description}
                    </p>
                    <span className="text-[10px] text-[#616f89] mt-1 block">
                      {activity.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
