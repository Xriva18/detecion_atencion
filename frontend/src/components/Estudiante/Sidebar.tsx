"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function EstudianteSidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/estudiante",
      icon: "dashboard",
      label: "Dashboard",
    },
    {
      href: "/estudiante/clases",
      icon: "group_add",
      label: "Mis Clases",
    },
    {
      href: "/estudiante/resultados",
      icon: "analytics",
      label: "Resultados",
    },
  ];

  return (
    <aside className="w-64 flex flex-col justify-between bg-white border-r border-[#e5e7eb] transition-colors duration-200 hidden md:flex z-20">
      <div className="flex flex-col gap-4 p-4 h-full">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="bg-primary aspect-square rounded-lg size-10 flex items-center justify-center text-white">
            <span className="material-symbols-outlined !text-[28px]">
              school
            </span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-[#111318] text-lg font-bold leading-tight">
              EduXriva
            </h1>
            <p className="text-[#616f89] text-xs font-normal">
              Panel Estudiante
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 mt-4 flex-1">
          {navItems.map((item) => {
            // Para el dashboard, solo activo si es exactamente "/estudiante"
            // Para otras rutas, activo si coincide exactamente o empieza con la ruta + "/"
            const isActive =
              item.href === "/estudiante"
                ? pathname === "/estudiante"
                : pathname === item.href ||
                  pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-[#616f89] hover:bg-gray-100 hover:text-[#111318]"
                }`}
              >
                <span className="material-symbols-outlined group-hover:scale-105 transition-transform">
                  {item.icon}
                </span>
                <p className="text-sm font-medium">{item.label}</p>
              </Link>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="flex flex-col gap-1 mt-auto">
          <button
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            onClick={() => {
              // TODO: Implementar logout
              console.log("Logout");
            }}
          >
            <span className="material-symbols-outlined">logout</span>
            <p className="text-sm font-medium">Cerrar Sesión</p>
          </button>
        </div>
      </div>
    </aside>
  );
}
