"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClientComponentClient } from "@/app/utils/supabase/browser";
import { useSede } from "@/context/SedeContext";
import { useUser } from "@/context/UserContext";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

interface RegistrarMovimientoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sesionId: string;
}

export function RegistrarMovimientoModal({
  isOpen,
  onClose,
  onSuccess,
  sesionId,
}: RegistrarMovimientoModalProps) {
  const [tipo, setTipo] = useState<"ingreso" | "egreso">("ingreso");
  const [monto, setMonto] = useState("");
  const [motivo, setMotivo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useUser();
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !sesionId) return;

    if (!monto || isNaN(parseFloat(monto)) || parseFloat(monto) <= 0) {
      toast.error("Ingrese un monto válido mayor a 0");
      return;
    }

    if (!motivo.trim()) {
      toast.error("El motivo es obligatorio");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("caja_movimientos").insert({
        sesion_id: sesionId,
        usuario_id: user.id,
        tipo: tipo,
        monto: parseFloat(monto),
        motivo: motivo.trim(),
      });

      if (error) throw error;

      toast.success(`Movimiento (${tipo}) registrado`);
      setMonto("");
      setMotivo("");
      onSuccess();
    } catch (error: any) {
      console.error("Error registrando movimiento:", error);
      toast.error("Error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Registrar Movimiento</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium mb-1">Tipo</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={tipo === "ingreso" ? "default" : "outline"}
                className={
                  tipo === "ingreso" ? "bg-green-600 hover:bg-green-700" : ""
                }
                onClick={() => setTipo("ingreso")}
              >
                Ingreso
              </Button>
              <Button
                type="button"
                variant={tipo === "egreso" ? "default" : "outline"}
                className={
                  tipo === "egreso" ? "bg-red-600 hover:bg-red-700" : ""
                }
                onClick={() => setTipo("egreso")}
              >
                Egreso
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Monto (S/) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Motivo <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Ej. Pago de servicio, sencillo..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
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
              className={tipo === "ingreso" ? "bg-green-600" : "bg-red-600"}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
