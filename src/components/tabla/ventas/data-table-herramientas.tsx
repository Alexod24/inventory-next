"use client";

import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useSede } from "@/context/SedeContext";
import { exportarVentasToPDF } from "./exportar";
import { DataTableToolbar } from "@/components/common/data-table/data-table-toolbar";

interface SalesToolbarProps<TData> {
  table: Table<TData>;
  fetchData?: () => Promise<void>;
}

export function SalesToolbar<TData>({ table }: SalesToolbarProps<TData>) {
  const { sedeActual } = useSede();

  return (
    <DataTableToolbar
      table={table}
      filterColumn="productos" // Search inside details
      dateColumn="fecha" // Date filter column
      searchPlaceholder="Buscar producto..."
    >
      {/* Extra Children: Export Button */}
      <Button
        variant="outline"
        size="sm"
        className="h-9 ml-auto hidden h-8 lg:flex"
        onClick={() =>
          exportarVentasToPDF(table, sedeActual?.nombre || "General")
        }
      >
        <Download className="mr-2 h-4 w-4" />
        Exportar PDF
      </Button>
    </DataTableToolbar>
  );
}

// Re-export specific filter function if needed by columns (though it's in common now)
export { filterDateRange } from "@/components/common/data-table/data-table-toolbar";
