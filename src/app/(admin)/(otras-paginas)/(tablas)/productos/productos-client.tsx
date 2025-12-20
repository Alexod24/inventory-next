"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { DataTableToolbar } from "@/components/tabla/productos/data-table-herramientas";
import { DataTable } from "@/components/common/data-table/data-table";
import { getColumns } from "@/components/tabla/productos/columns";

import { supabase } from "@/app/utils/supabase/supabase"; // Or use createClientComponentClient
import { useSede } from "@/context/SedeContext"; // <-- IMPORTANTE
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/modal";

export default function BienesClient() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { sedeActual } = useSede(); // <-- Sede Context

  const fetchData = useCallback(
    async (triggeredBy?: string) => {
      if (!sedeActual) return; // Esperar a que haya sede

      setLoading(true);

      // Nueva query a la tabla 'productos'
      let query = supabase
        .from("productos")
        .select(
          `
      *,
      proveedor:proveedores(nombre),
      usuario:usuarios(nombre),
      inventario:inventario_sedes(stock_actual)
      `
        )
        .eq("sede_id", sedeActual.id) // <-- FILTRAR POR SEDE
        .order("fecha_c", { ascending: false });

      const { data: fetchedData, error } = await query;

      if (error) {
        console.error("Error fetching productos:", error);
      } else {
        setData(fetchedData || []);
      }
      setLoading(false);
    },
    [sedeActual]
  ); // Re-run when sede changes

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = useMemo(() => getColumns(fetchData), [fetchData]);

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        toolbar={DataTableToolbar}
        fetchData={fetchData}
      />
    </div>
  );
}
