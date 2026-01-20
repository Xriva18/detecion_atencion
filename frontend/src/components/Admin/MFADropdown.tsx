"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientSupabase } from "@/utils/supabase/client";
import { useMFA } from "@/hooks/useMFA";
import { MFAService } from "@/services/auth/mfaService";
import MFAActivationModal from "./MFAActivationModal";
import MFADeactivationModal from "./MFADeactivationModal";

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
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [activeFactorId, setActiveFactorId] = useState<string | null>(null);
  
  const { isMFAEnabled, loading: mfaLoading, checkMFAStatus, factors } = useMFA();

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // No cerrar si algún modal está abierto
      if (showMFAModal || showDisableModal) return;
      
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
  }, [onClose, showMFAModal, showDisableModal]);

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
    e.stopPropagation();
    setShowMFAModal(true);
  };

  const handleDisableMFA = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Obtener el factor activo
      const activeFactors = factors.length > 0 ? factors : await MFAService.listFactors();
      
      if (activeFactors.length === 0) {
        alert("No hay factores MFA activos para desactivar");
        return;
      }

      // Verificar si se necesita AAL2
      const hasAAL2 = await MFAService.hasAAL2();
      
      if (!hasAAL2) {
        // Necesita verificar con código antes de desactivar
        setActiveFactorId(activeFactors[0].id);
        setShowDisableModal(true);
      } else {
        // Intentar desactivar directamente
        try {
          await MFAService.unenrollFactor(activeFactors[0].id);
          await checkMFAStatus();
          alert("MFA desactivado exitosamente");
        } catch (error) {
          // Si aún requiere AAL2, mostrar modal de verificación
          const errorMessage = error instanceof Error ? error.message : "";
          if (errorMessage.includes("AAL2_REQUIRED")) {
            setActiveFactorId(activeFactors[0].id);
            setShowDisableModal(true);
          } else {
            throw error;
          }
        }
      }
    } catch (error) {
      console.error("Error al preparar desactivación MFA:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Error al desactivar MFA. Por favor intenta nuevamente."
      );
    }
  };

  const handleMFASuccess = async () => {
    setShowMFAModal(false);
    onClose?.();
    await checkMFAStatus();
  };

  const handleMFADeactivationSuccess = async () => {
    setShowDisableModal(false);
    setActiveFactorId(null);
    onClose?.();
    await checkMFAStatus();
  };

  const handleCloseModal = () => {
    setShowMFAModal(false);
    onClose?.();
  };

  const handleCloseDeactivationModal = () => {
    setShowDisableModal(false);
    setActiveFactorId(null);
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
                  handleDisableMFA(e);
                } else {
                  handleActivateMFA(e);
                }
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">
                {isMFAEnabled ? "lock_open" : "lock"}
              </span>
              {isMFAEnabled ? (
                <span>Desactivar 2FA</span>
              ) : (
                <span>Activar 2FA</span>
              )}
            </button>
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

      {/* Modal de desactivación MFA */}
      {activeFactorId && (
        <MFADeactivationModal
          isOpen={showDisableModal}
          onClose={handleCloseDeactivationModal}
          onSuccess={handleMFADeactivationSuccess}
          factorId={activeFactorId}
        />
      )}
    </>
  );
}
