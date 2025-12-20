"use client";

import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import { DataTableToolbar as GenericDataTableToolbar } from "@/components/common/data-table/data-table-toolbar";
import { useState } from "react";
import { CrearCategoriaModal } from "./CrearCategoriaModal";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  fetchData: () => Promise<void>;
}

export function DataTableToolbar<TData>({
  table,
  fetchData,
}: DataTableToolbarProps<TData>) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <GenericDataTableToolbar
        table={table}
        filterColumn="nombre"
        searchPlaceholder="Filtrar por nombre..."
        actions={
          <Button
            variant="default"
            size="sm"
            className="h-8 flex items-center bg-[#e9a20c] text-white hover:bg-[#d4920b]"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Agregar
          </Button>
        }
      />

      <CrearCategoriaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCategoriaCreated={fetchData}
      />
    </>
  );
}
