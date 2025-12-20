"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClientComponentClient } from "@/app/utils/supabase/browser";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

interface CrearProveedorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProveedorCreated: () => Promise<void>;
  editData?: {
    id: string;
    nombre: string;
    ruc: string | null;
    telefono: string | null;
    email: string | null;
    direccion: string | null;
  };
}

export function CrearProveedorModal({
  isOpen,
  onClose,
  onProveedorCreated,
  editData,
}: CrearProveedorModalProps) {
  const [nombre, setNombre] = useState("");
  const [ruc, setRuc] = useState("20");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [direccion, setDireccion] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClientComponentClient();

  const isEditMode = !!editData;

  useEffect(() => {
    if (editData) {
      setNombre(editData.nombre);
      setRuc(editData.ruc || "20");
      setTelefono(editData.telefono || "");
      setEmail(editData.email || "");
      setDireccion(editData.direccion || "");
    } else {
      setNombre("");
      setRuc("20");
      setTelefono("");
      setEmail("");
      setDireccion("");
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
      const proveedorData = {
        nombre: nombre.trim(),
        ruc: ruc.trim() || null,
        telefono: telefono.trim() || null,
        email: email.trim() || null,
        direccion: direccion.trim() || null,
      };

      if (isEditMode) {
        // Update existing provider
        const { error } = await supabase
          .from("proveedores")
          .update(proveedorData)
          .eq("id", editData.id);

        if (error) throw error;
        toast.success("Proveedor actualizado exitosamente");
      } else {
        // Create new provider
        const { error } = await supabase
          .from("proveedores")
          .insert(proveedorData);

        if (error) throw error;
        toast.success("Proveedor creado exitosamente");
      }

      await onProveedorCreated();
      handleClose();
    } catch (error: any) {
      console.error("Error saving provider:", error);
      toast.error("Error al guardar el proveedor: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setNombre("");
    setRuc("20");
    setTelefono("");
    setEmail("");
    setDireccion("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-xl">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">
          {isEditMode ? "Editar Proveedor" : "Nuevo Proveedor"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Distribuidora SAC"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-2">RUC</label>
              <Input
                type="text"
                value={ruc}
                onChange={(e) => setRuc(e.target.value)}
                placeholder="2060..."
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Teléfono</label>
              <Input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="999..."
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contacto@proveedor.com"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Dirección</label>
            <Input
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Av. Principal 123"
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
