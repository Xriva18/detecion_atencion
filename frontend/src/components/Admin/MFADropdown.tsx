"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientSupabase } from "@/utils/supabase/client";
import { useMFA } from "@/hooks/useMFA";
import MFAActivationModal from "./MFAActivationModal";

interface MFADropdownProps {
  user: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  onClose?: () => void;
}

export default function MFADropdown({ user, onClose }: MFADropdownProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showMFAModal, setShowMFAModal] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  
  const { isMFAEnabled, loading: mfaLoading, disableMFA, checkMFAStatus } = useMFA();

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // No cerrar si el modal está abierto
      if (showMFAModal) return;
      
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose, showMFAModal]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const supabase = createClientSupabase();
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleActivateMFA = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevenir que el click se propague
    setShowMFAModal(true);
    // No cerrar el dropdown inmediatamente, el modal se renderiza encima
  };

  const handleDisableMFA = async () => {
    if (!showDisableConfirm) {
      setShowDisableConfirm(true);
      return;
    }

    setIsDisabling(true);
    try {
      await disableMFA();
      setShowDisableConfirm(false);
      await checkMFAStatus();
    } catch (error) {
      console.error("Error al desactivar MFA:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Error al desactivar MFA. Por favor intenta nuevamente."
      );
    } finally {
      setIsDisabling(false);
    }
  };

  const handleMFASuccess = async () => {
    setShowMFAModal(false);
    onClose?.(); // Cerrar el dropdown después de activar MFA
    await checkMFAStatus();
  };

  const handleCloseModal = () => {
    setShowMFAModal(false);
    onClose?.(); // Cerrar el dropdown cuando se cierra el modal
  };

  const displayName = user.name || "Usuario";
  const displayRole = user.role || "Usuario";
  const avatarUrl = user.avatar;

  return (
    <>
      <div
        ref={dropdownRef}
        className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
      >
        {/* Header del dropdown */}
        <div className="px-4 py-3 border-b border-gray-200">
          <p className="text-sm font-semibold text-gray-900">{displayName}</p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
          <p className="text-xs text-gray-500 mt-1">{displayRole}</p>
        </div>

        {/* Opciones del menú */}
        <div className="py-2">
          {/* Activar/Desactivar MFA */}
          {!mfaLoading && (
            <button
              onClick={(e) => {
                if (isMFAEnabled) {
                  handleDisableMFA();
                } else {
                  handleActivateMFA(e);
                }
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">
                {isMFAEnabled ? "lock_open" : "lock"}
              </span>
              {showDisableConfirm ? (
                <span className="text-red-600">
                  Confirmar desactivación
                </span>
              ) : isMFAEnabled ? (
                <span>Desactivar 2FA</span>
              ) : (
                <span>Activar 2FA</span>
              )}
            </button>
          )}

          {showDisableConfirm && (
            <div className="px-4 py-2 bg-yellow-50 border-l-4 border-yellow-400">
              <p className="text-xs text-yellow-800 mb-2">
                ¿Estás seguro de desactivar la autenticación de dos factores?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDisableMFA}
                  disabled={isDisabling}
                  className="flex-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {isDisabling ? "Desactivando..." : "Sí, desactivar"}
                </button>
                <button
                  onClick={() => setShowDisableConfirm(false)}
                  disabled={isDisabling}
                  className="flex-1 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Cerrar sesión */}
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSigningOut ? (
              <>
                <span className="material-symbols-outlined text-sm animate-spin">
                  sync
                </span>
                <span>Cerrando sesión...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">
                  logout
                </span>
                <span>Cerrar sesión</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal de activación MFA */}
      <MFAActivationModal
        isOpen={showMFAModal}
        onClose={handleCloseModal}
        onSuccess={handleMFASuccess}
      />
    </>
  );
}
