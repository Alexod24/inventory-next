"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClientComponentClient } from "@/app/utils/supabase/browser";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

interface CrearCategoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoriaCreated: () => Promise<void>;
  editData?: {
    id: string;
    nombre: string;
    descripcion: string | null;
  };
}

export function CrearCategoriaModal({
  isOpen,
  onClose,
  onCategoriaCreated,
  editData,
}: CrearCategoriaModalProps) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClientComponentClient();

  const isEditMode = !!editData;

  useEffect(() => {
    if (editData) {
      setNombre(editData.nombre);
      setDescripcion(editData.descripcion || "");
    } else {
      setNombre("");
      setDescripcion("");
    }
  }, [editData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        // Update existing category
        const { error } = await supabase
          .from("categorias")
          .update({
            nombre: nombre.trim(),
            descripcion: descripcion.trim() || null,
          })
          .eq("id", editData.id);

        if (error) throw error;
        toast.success("Categoría actualizada exitosamente");
      } else {
        // Create new category
        const { error } = await supabase.from("categorias").insert({
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
        });

        if (error) throw error;
        toast.success("Categoría creada exitosamente");
      }

      await onCategoriaCreated();
      handleClose();
    } catch (error: any) {
      console.error("Error saving category:", error);
      toast.error("Error al guardar la categoría: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setNombre("");
    setDescripcion("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">
          {isEditMode ? "Editar Categoría" : "Nueva Categoría"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Nombre <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Bebidas"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Descripción
            </label>
            <Textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción opcional de la categoría"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#e9a20c] hover:bg-[#d4920b]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>{isEditMode ? "Actualizar" : "Crear"}</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
