"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/common/data-table/data-table";
import { columns } from "./columns";
import { DataTableToolbar } from "./data-table-herramientas";
import { createClientComponentClient } from "@/app/utils/supabase/browser";
import { Database } from "@/types/supabase";
import { CajaSesion } from "./schema";
import { useSede } from "@/context/SedeContext";
import { toast } from "react-hot-toast";

// TODO: Import Modal components for Opening/Closing when created
import { AperturarCajaModal } from "./modal/aperturar-caja-modal";
import { RegistrarMovimientoModal } from "./modal/registrar-movimiento-modal";
import { CerrarCajaModal } from "./modal/cerrar-caja-modal";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut } from "lucide-react";

export default function CajaClient() {
  const [data, setData] = useState<CajaSesion[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals status
  const [isAperturaModalOpen, setIsAperturaModalOpen] = useState(false);
  const [isMovimientoModalOpen, setIsMovimientoModalOpen] = useState(false);
  const [isCierreModalOpen, setIsCierreModalOpen] = useState(false);

  const { sedeActual } = useSede();
  const supabase = createClientComponentClient<Database>();

  const fetchData = useCallback(async () => {
    if (!sedeActual) return;
    setLoading(true);
    try {
      const { data: sesiones, error } = await supabase
        .from("caja_sesiones")
        .select("*")
        .eq("sede_id", sedeActual.id)
        .order("fecha_apertura", { ascending: false });

      if (error) {
        console.error("Error fetching caja sessions:", error);
        toast.error("Error al cargar sesiones de caja");
      } else {
        setData(sesiones as CajaSesion[]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [supabase, sedeActual]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Check if there is an active session
  const activeSession = data.find((s) => s.estado === "abierta");

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Caja y Turnos</h2>
        <p className="text-muted-foreground">
          Historial de aperturas y cierres de caja.
        </p>
      </div>

      {activeSession ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="font-bold text-green-800 dark:text-green-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Caja Abierta Actual
            </h3>
            <p className="text-sm text-green-700 dark:text-green-400 mt-1">
              Aperturada:{" "}
              {new Date(activeSession.fecha_apertura).toLocaleString()} <br />
              Monto Inicial:{" "}
              <strong>S/ {activeSession.monto_apertura.toFixed(2)}</strong>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-green-600 text-green-700 hover:bg-green-100"
              size="sm"
              onClick={() => setIsMovimientoModalOpen(true)}
            >
              <Wallet className="mr-2 h-4 w-4" />
              Registrar Movimiento
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsCierreModalOpen(true)}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Caja
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
          <h3 className="font-bold text-yellow-800 dark:text-yellow-300">
            Caja Cerrada
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            No hay ninguna sesión activa en este momento para esta sede.
          </p>
        </div>
      )}

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        toolbar={(props) => (
          <DataTableToolbar
            {...props}
            onOpenCaja={() => setIsAperturaModalOpen(true)}
            canOpen={!activeSession}
          />
        )}
      />

      <AperturarCajaModal
        isOpen={isAperturaModalOpen}
        onClose={() => setIsAperturaModalOpen(false)}
        onSuccess={() => {
          setIsAperturaModalOpen(false);
          fetchData();
        }}
      />

      {activeSession && (
        <>
          <RegistrarMovimientoModal
            isOpen={isMovimientoModalOpen}
            onClose={() => setIsMovimientoModalOpen(false)}
            onSuccess={() => {
              setIsMovimientoModalOpen(false);
              // Opcional: Recargar datos si mostramos total actual
            }}
            sesionId={activeSession.id}
          />
          <CerrarCajaModal
            isOpen={isCierreModalOpen}
            onClose={() => setIsCierreModalOpen(false)}
            onSuccess={() => {
              setIsCierreModalOpen(false);
              fetchData();
            }}
            sesion={activeSession}
          />
        </>
      )}
    </div>
  );
}
