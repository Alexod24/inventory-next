"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClientComponentClient } from "@/app/utils/supabase/browser";
import { useSede } from "@/context/SedeContext";
import { useUser } from "@/context/UserContext";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

interface AperturarCajaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AperturarCajaModal({
  isOpen,
  onClose,
  onSuccess,
}: AperturarCajaModalProps) {
  const [monto, setMonto] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { sedeActual } = useSede();
  const { user } = useUser();
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sedeActual || !user) {
      toast.error("Datos de sesión no disponibles");
      return;
    }

    if (!monto || isNaN(parseFloat(monto))) {
      toast.error("Ingrese un monto válido");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("caja_sesiones").insert({
        sede_id: sedeActual.id,
        usuario_apertura_id: user.id,
        monto_apertura: parseFloat(monto),
        estado: "abierta",
        observaciones: observaciones || null,
        fecha_apertura: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success("Caja aperturada exitosamente");
      onSuccess();
    } catch (error: any) {
      console.error("Error aperturando caja:", error);
      toast.error("Error al aperturar caja: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Aperturar Caja</h2>
        <p className="text-gray-500 mb-6">
          Inicia un nuevo turno de caja en <strong>{sedeActual?.nombre}</strong>
          .
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Monto Inicial (S/) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Observaciones
            </label>
            <textarea
              className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              rows={3}
              placeholder="Notas opcionales..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aperturando...
                </>
              ) : (
                "Aperturar Caja"
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
