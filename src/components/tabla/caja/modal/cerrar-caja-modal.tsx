"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClientComponentClient } from "@/app/utils/supabase/browser";
import { useSede } from "@/context/SedeContext";
import { useUser } from "@/context/UserContext";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { CajaSesion } from "../schema";

interface CerrarCajaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sesion: CajaSesion;
}

export function CerrarCajaModal({
  isOpen,
  onClose,
  onSuccess,
  sesion,
}: CerrarCajaModalProps) {
  const [montoCierre, setMontoCierre] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [loadingCalculos, setLoadingCalculos] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Totales calculados
  const [totalVentas, setTotalVentas] = useState(0);
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [totalEgresos, setTotalEgresos] = useState(0);

  const { user } = useUser();
  const supabase = createClientComponentClient();

  // Función para cargar los totales
  useEffect(() => {
    if (isOpen && sesion?.id) {
      calcularTotales();
    }
  }, [isOpen, sesion]);

  const calcularTotales = async () => {
    setLoadingCalculos(true);
    try {
      // 1. Sumar Ventas desde la apertura
      const { data: ventas, error: errVentas } = await supabase
        .from("ventas")
        .select("total")
        .eq("sede_id", sesion.sede_id)
        .gte("fecha", sesion.fecha_apertura); // Ventas DESPUÉS de abrir caja

      if (errVentas) throw errVentas;
      const sumVentas = ventas?.reduce((acc, v) => acc + v.total, 0) || 0;
      setTotalVentas(sumVentas);

      // 2. Sumar Movimientos de Caja (Ingresos/Egresos)
      const { data: movs, error: errMovs } = await supabase
        .from("caja_movimientos")
        .select("tipo, monto")
        .eq("sesion_id", sesion.id);

      if (errMovs) throw errMovs;

      const sumIngresos =
        movs
          ?.filter((m) => m.tipo === "ingreso")
          .reduce((acc, m) => acc + m.monto, 0) || 0;
      const sumEgresos =
        movs
          ?.filter((m) => m.tipo === "egreso")
          .reduce((acc, m) => acc + m.monto, 0) || 0;

      setTotalIngresos(sumIngresos);
      setTotalEgresos(sumEgresos);
    } catch (err) {
      console.error("Error calculando totales:", err);
      toast.error("Error al calcular totales");
    } finally {
      setLoadingCalculos(false);
    }
  };

  const montoTeorico =
    sesion.monto_apertura + totalVentas + totalIngresos - totalEgresos;
  const diferencia = montoCierre ? parseFloat(montoCierre) - montoTeorico : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!montoCierre || isNaN(parseFloat(montoCierre))) {
      toast.error("Ingrese el monto real en caja");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("caja_sesiones")
        .update({
          usuario_cierre_id: user?.id,
          monto_cierre_real: parseFloat(montoCierre),
          monto_teorico: montoTeorico,
          diferencia: diferencia,
          estado: "cerrada",
          observaciones: observaciones || null,
          fecha_cierre: new Date().toISOString(),
        })
        .eq("id", sesion.id);

      if (error) throw error;

      toast.success("Caja cerrada exitosamente");
      onSuccess();
    } catch (error: any) {
      console.error("Error cerrando caja:", error);
      toast.error("Error al cerrar caja: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Cerrar Caja</h2>

        {loadingCalculos ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Resumen */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-sm space-y-2">
              <div className="flex justify-between">
                <span>Apertura:</span>
                <span className="font-mono">
                  S/ {sesion.monto_apertura.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>+ Ventas:</span>
                <span className="font-mono">S/ {totalVentas.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>+ Ingresos:</span>
                <span className="font-mono">S/ {totalIngresos.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>- Egresos:</span>
                <span className="font-mono">S/ {totalEgresos.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-base">
                <span>Teórico:</span>
                <span>S/ {montoTeorico.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Monto Real (Conteo Físico){" "}
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={montoCierre}
                  onChange={(e) => setMontoCierre(e.target.value)}
                  className="text-lg font-bold"
                />
                {montoCierre && (
                  <div
                    className={`text-right text-sm mt-1 font-bold ${
                      diferencia >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    Diferencia: {diferencia > 0 ? "+" : ""}
                    {diferencia.toFixed(2)}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Observaciones
                </label>
                <textarea
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  rows={3}
                  placeholder="Comentarios sobre el cierre..."
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
                  variant="destructive"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cerrando...
                    </>
                  ) : (
                    "Cerrar Caja"
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Modal>
  );
}
