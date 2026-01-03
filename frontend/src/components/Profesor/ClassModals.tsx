"use client";

import { useState, useEffect } from "react";

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

export function CreateClassModal({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classData: Partial<Class>) => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, status: "Activo" });
    setFormData({ name: "", description: "" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-[#e5e7eb] flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#111318]">Crear Nueva Clase</h2>
          <button
            onClick={onClose}
            className="text-[#616f89] hover:text-[#111318]"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[#111318]">
              Nombre de la Clase
            </span>
            <input
              className="w-full rounded-lg border border-[#dbdfe6] bg-white text-[#111318] h-12 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              placeholder="Ej: Matemáticas Avanzadas I"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[#111318]">Descripción</span>
            <textarea
              className="w-full rounded-lg border border-[#dbdfe6] bg-white text-[#111318] min-h-[100px] p-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
              placeholder="Describe el contenido y objetivos de la clase..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </label>
          <div className="flex gap-3 justify-end pt-4 border-t border-[#e5e7eb]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-[#dbdfe6] text-[#111318] hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-primary hover:bg-blue-700 text-white font-medium transition-colors"
            >
              Crear Clase
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EditClassModal({
  isOpen,
  onClose,
  classItem,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  classItem: Class | null;
  onSave: (classData: Class) => void;
}) {
  const [formData, setFormData] = useState<Class | null>(classItem);
  const [imagePreview, setImagePreview] = useState<string | null>(
    classItem?.imageUrl || null
  );

  // Actualizar el estado cuando cambie classItem
  useEffect(() => {
    if (classItem) {
      setFormData(classItem);
      setImagePreview(classItem.imageUrl || null);
    }
  }, [classItem]);

  if (!isOpen || !formData) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Crear URL de vista previa
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData({ ...formData, imageUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, imageUrl: undefined });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-[#e5e7eb] flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#111318]">Editar Clase</h2>
          <button
            onClick={onClose}
            className="text-[#616f89] hover:text-[#111318]"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* Campo de Imagen */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[#111318]">
              Imagen de la Clase
            </span>
            <div className="flex flex-col gap-3">
              {imagePreview && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-[#e5e7eb]">
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                    title="Eliminar imagen"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      delete
                    </span>
                  </button>
                </div>
              )}
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/30 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    cloud_upload
                  </span>
                  <span className="text-sm text-[#111318] font-medium">
                    {imagePreview ? "Cambiar imagen" : "Subir imagen"}
                  </span>
                  <span className="text-xs text-[#616f89]">
                    PNG, JPG, WEBP (Max 5MB)
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[#111318]">
              Nombre de la Clase
            </span>
            <input
              className="w-full rounded-lg border border-[#dbdfe6] bg-white text-[#111318] h-12 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[#111318]">Descripción</span>
            <textarea
              className="w-full rounded-lg border border-[#dbdfe6] bg-white text-[#111318] min-h-[100px] p-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </label>
          <div className="flex gap-3 justify-end pt-4 border-t border-[#e5e7eb]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-[#dbdfe6] text-[#111318] hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-primary hover:bg-blue-700 text-white font-medium transition-colors"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CodeModal({
  isOpen,
  onClose,
  classItem,
  onGenerateNewCode,
}: {
  isOpen: boolean;
  onClose: () => void;
  classItem: Class | null;
  onGenerateNewCode: () => void;
}) {
  const [code, setCode] = useState(classItem?.accessCode || "ABC123");

  if (!isOpen || !classItem) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code).then(() => {
      alert("Código copiado al portapapeles");
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-[#e5e7eb] flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#111318]">Código de Acceso</h2>
          <button
            onClick={onClose}
            className="text-[#616f89] hover:text-[#111318]"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 flex flex-col gap-5">
          <div className="text-center">
            <p className="text-sm text-[#616f89] mb-4">
              Código de acceso para la clase:
            </p>
            <p className="text-lg font-semibold text-[#111318] mb-6">
              {classItem.name}
            </p>
            <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-primary/30">
              <p className="text-4xl font-bold text-primary tracking-widest mb-2">
                {code}
              </p>
              <button
                onClick={handleCopyCode}
                className="text-sm text-primary hover:text-blue-700 flex items-center gap-1 mx-auto"
              >
                <span className="material-symbols-outlined text-[18px]">
                  content_copy
                </span>
                Copiar código
              </button>
            </div>
            <p className="text-xs text-[#616f89] mt-4">
              Comparte este código con tus estudiantes para que se unan a la clase.
            </p>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-[#e5e7eb]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg bg-primary hover:bg-blue-700 text-white font-medium transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DeleteClassModal({
  isOpen,
  onClose,
  classItem,
  onDelete,
}: {
  isOpen: boolean;
  onClose: () => void;
  classItem: Class | null;
  onDelete: () => void;
}) {
  if (!isOpen || !classItem) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-[#e5e7eb] flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#111318]">Eliminar Clase</h2>
          <button
            onClick={onClose}
            className="text-[#616f89] hover:text-[#111318]"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 flex flex-col gap-5">
          <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <span className="material-symbols-outlined text-red-600">
              warning
            </span>
            <p className="text-sm text-red-700 font-medium">
              Esta acción no se puede deshacer.
            </p>
          </div>
          <p className="text-[#616f89]">
            ¿Estás seguro de que deseas eliminar la clase{" "}
            <strong>{classItem.name}</strong>? Todos los datos asociados serán
            eliminados permanentemente.
          </p>
          <div className="flex gap-3 justify-end pt-4 border-t border-[#e5e7eb]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-[#dbdfe6] text-[#111318] hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
            >
              Eliminar Clase
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

