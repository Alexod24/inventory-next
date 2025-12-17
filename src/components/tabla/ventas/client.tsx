"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/common/data-table/data-table";
import { columns } from "./columns";
import { createClientComponentClient } from "@/app/utils/supabase/browser";
import { Database } from "@/types/supabase";
import { useSede } from "@/context/SedeContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { SalesToolbar } from "./data-table-herramientas";
import POSModal from "@/components/pos/POSModal";
import { Ventas } from "./schema";

export default function VentasClient() {
  const [data, setData] = useState<Ventas[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPosOpen, setIsPosOpen] = useState(false);
  const { sedeActual } = useSede();
  const supabase = createClientComponentClient<Database>();

  const fetchData = useCallback(async () => {
    if (!sedeActual) return;
    setLoading(true);

    try {
      // Necesitamos JOIN con bienes para obtener el nombre del producto
      const { data: sales, error } = await supabase
        .from("ventas")
        .select(
          `
            *,
            usuario:usuarios(nombre),
            detalles:salidas (
                id,
                cantidad,
                precio,
                total,
                producto:productos(nombre)
            )
        `
        )
        .eq("sede_id", sedeActual.id)
        .order("fecha", { ascending: false });

      if (error) {
        console.error("Error fetching sales:", error);
      } else {
        console.log("Ventas loaded:", sales); // DEBUG LOG
        setData(sales as any);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [sedeActual, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Ventas</h2>
          <p className="text-muted-foreground">
            Historial de ventas de la sede {sedeActual?.nombre}
          </p>
        </div>

        <Button
          onClick={() => setIsPosOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Nueva Venta (POS)
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        fetchData={fetchData}
        toolbar={SalesToolbar}
      />

      <POSModal
        isOpen={isPosOpen}
        onClose={() => {
          setIsPosOpen(false);
          fetchData(); // Refrescar tabla al cerrar el modal (asumiendo que se hizo venta)
        }}
      />
    </div>
  );
}
