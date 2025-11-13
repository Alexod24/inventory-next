// eslint-disable @typescript-eslint/no-unused-vars
"use client";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger, // Importado
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { exportarToPDF } from "./exportar";

import { useModal } from "../../../hooks/useModal";
import { MixerHorizontalIcon, PlusIcon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

// --- IMPORTAMOS EL NUEVO MODAL ---
import { CrearMovimientoModal } from "@/components/CrearMovimientoModal"; // Ajusta la ruta si es necesario

// ---------------------------------------------------------------------------------------------
interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
  fetchData: () => Promise<void>;
}
// ---------------------------------------------------------------------------------------------
export function DataTableViewOptions<TData>({
  table,
  fetchData,
}: DataTableViewOptionsProps<TData>) {
  // ¡Solo nos quedamos con la lógica para abrir y cerrar el modal!
  const { isOpen, openModal, closeModal } = useModal();

  // --- TODA LA LÓGICA DEL FORMULARIO SE FUE AL HOOK ---
  // ... (estados: items, options, etc. -> ELIMINADOS)
  // ... (funciones: loadData, fetchOptions, handleCreate, etc. -> ELIMINADAS)

  return (
    <div className="flex space-x-2 ml-auto">
      {/* Botón de Vista */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="hidden h-8 lg:flex items-center"
          >
            <MixerHorizontalIcon className="mr-2 h-4 w-4" />
            Vista
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[150px]">
          <DropdownMenuLabel>Mostrar columnas</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {table
            .getAllColumns()
            .filter(
              (column) =>
                typeof column.accessorFn !== "undefined" && column.getCanHide()
            )
            .map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Botón de Exportar */}
      <Button
        variant="outline"
        size="sm"
        className="hidden h-8 lg:flex items-center"
        onClick={() => exportarToPDF(table)}
      >
        Exportar
      </Button>

      {/* Botón de Agregar */}
      <Button
        variant="solid"
        size="sm"
        className="hidden h-8 lg:flex items-center"
        style={{ backgroundColor: "#e9a20c", color: "white" }}
        onClick={openModal} // <-- Abre el modal
      >
        <PlusIcon className="mr-2 h-4 w-4" />
        Agregar
      </Button>

      {/* ELIMINAMOS el JSX del modal y del mini-modal de aquí
       */}

      {/* RENDERIZAMOS el nuevo componente Modal */}
      <CrearMovimientoModal
        isOpen={isOpen}
        onClose={closeModal}
        onMovimientoCreated={fetchData} // Para refrescar la tabla
      />
    </div>
  );
}
