"use client";

import { Table } from "@tanstack/react-table";
import { X, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { CrearProveedorModal } from "./CrearProveedorModal";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  fetchData: () => Promise<void>;
}

export function DataTableToolbar<TData>({
  table,
  fetchData,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filtrar por nombre..."
            value={
              (table.getColumn("nombre")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("nombre")?.setFilterValue(event.target.value)
            }
            className="h-9 w-[150px] lg:w-[250px] pl-8"
          />
        </div>

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Resetear
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#e9a20c] text-white hover:bg-[#d4920b] font-medium shadow-sm transition-colors"
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar
        </Button>
      </div>

      <CrearProveedorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProveedorCreated={async () => {
          await fetchData();
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
