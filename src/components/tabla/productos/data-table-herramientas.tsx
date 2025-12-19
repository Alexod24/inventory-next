"use client";

import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import {
  DataTableToolbar as GenericDataTableToolbar, // Alias the import!
  filterDateRange,
} from "@/components/common/data-table/data-table-toolbar";
import { DataTableFacetedFilter } from "@/components/common/data-table/data-table-filtros";
import { exportarToPDF } from "./exportar";
import { useModal } from "../../../hooks/useModal";
import { CrearBienModal } from "@/components/CrearBienModal";
import { opcionesEstado, opcionesDisponibilidad } from "@/lib/options";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  fetchData: () => Promise<void>;
}

export function DataTableToolbar<TData>({
  table,
  fetchData,
}: DataTableToolbarProps<TData>) {
  // Modal Logic
  const { isOpen, openModal, closeModal } = useModal();

  return (
    <>
      <GenericDataTableToolbar
        table={table}
        filterColumn="nombre"
        dateColumn="fecha_c" // Updated to match columns.tsx
        searchPlaceholder="Filtrar nombre..."
        actions={
          <>
            {/* Export Button */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 flex items-center"
              onClick={() => exportarToPDF(table)}
            >
              Exportar
            </Button>

            {/* Add Button */}
            <Button
              variant="default" // Changed from 'solid' to 'default' as standard shadcn
              size="sm"
              className="h-8 flex items-center bg-[#e9a20c] text-white hover:bg-[#d4920b]"
              onClick={openModal}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Agregar
            </Button>
          </>
        }
      >
        {/* Children: Faceted Filters */}
        {/* {table.getColumn("disponibilidad") && (
          <DataTableFacetedFilter
            column={table.getColumn("disponibilidad")}
            title="Disponibilidad"
            options={opcionesDisponibilidad}
          />
        )}
        {table.getColumn("estado") && (
          <DataTableFacetedFilter
            column={table.getColumn("estado")}
            title="Estado"
            options={opcionesEstado}
          />
        )} */}
      </GenericDataTableToolbar>

      {/* Modal for Creating Product */}
      <CrearBienModal
        isOpen={isOpen}
        onClose={closeModal}
        onBienCreated={fetchData}
      />
    </>
  );
}

// Export filter for columns.tsx
export { filterDateRange };
