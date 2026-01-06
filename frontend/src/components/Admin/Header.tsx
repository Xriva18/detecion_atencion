"use client";

import { useState, useEffect } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import MFADropdown from "./MFADropdown";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { user, loading } = useCurrentUser();
  const [showDropdown, setShowDropdown] = useState(false);

  // Cerrar dropdown al presionar Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [showDropdown]);

  if (loading) {
    return (
      <header className="sticky top-0 z-10 w-full bg-white/80 backdrop-blur-md border-b border-[#e5e7eb] px-6 py-3 flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-[#111318]">{title}</h2>
          {subtitle && <p className="text-xs text-[#616f89]">{subtitle}</p>}
        </div>
        <div className="size-8 rounded-full bg-gray-200 animate-pulse"></div>
      </header>
    );
  }

  const displayName =
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Usuario";
  const displayRole =
    user?.app_metadata?.role === 1
      ? "Administrador"
      : user?.app_metadata?.role === 2
      ? "Profesor"
      : user?.app_metadata?.role === 3
      ? "Estudiante"
      : "Usuario";
  const avatarUrl = user?.user_metadata?.avatar_url;

  const userProfile = {
    name: displayName,
    email: user?.email || "",
    role: displayRole,
    avatar: avatarUrl,
  };

  return (
    <header className="sticky top-0 z-10 w-full bg-white/80 backdrop-blur-md border-b border-[#e5e7eb] px-6 py-3 flex items-center justify-between">
      <div className="flex flex-col">
        <h2 className="text-xl font-bold text-[#111318]">{title}</h2>
        {subtitle && <p className="text-xs text-[#616f89]">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        {/* Profile */}
        <div className="relative">
          <div
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {avatarUrl ? (
              <div
                className="size-8 rounded-full bg-cover bg-center border border-gray-200"
                style={{ backgroundImage: `url(${avatarUrl})` }}
              ></div>
            ) : (
              <div className="size-8 rounded-full bg-gray-200 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                {displayName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
            )}
            <div className="hidden lg:flex flex-col">
              <span className="text-xs font-semibold text-[#111318]">
                {displayName}
              </span>
              <span className="text-[10px] text-[#616f89]">{displayRole}</span>
            </div>
            <span
              className={`material-symbols-outlined text-sm text-gray-500 transition-transform ${
                showDropdown ? "rotate-180" : ""
              }`}
            >
              expand_more
            </span>
          </div>

          {/* Dropdown */}
          {showDropdown && (
            <MFADropdown
              user={userProfile}
              onClose={() => setShowDropdown(false)}
            />
          )}
        </div>
      </div>
    </header>
  );
}
