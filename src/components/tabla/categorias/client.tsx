"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/common/data-table/data-table";
import { getColumns } from "./columns";
import { createClientComponentClient } from "@/app/utils/supabase/browser";
import { Database } from "@/types/supabase";
import { Categoria } from "./schema";
import { DataTableToolbar } from "./data-table-herramientas";

export default function CategoriasClient() {
  const [data, setData] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: categorias, error } = await supabase
        .from("categorias")
        .select("*")
        .order("nombre", { ascending: true });

      if (error) {
        console.error("Error fetching categorias:", error);
      } else {
        setData(categorias as Categoria[]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = getColumns(fetchData);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Categorías</h2>
        <p className="text-muted-foreground">
          Gestiona las categorías de productos
        </p>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        fetchData={fetchData}
        toolbar={DataTableToolbar}
      />
    </div>
  );
}
