"use client";

import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";
import { supabase } from "@/app/utils/supabase/supabase";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  refreshData: () => Promise<void>; // Nueva prop para refrescar datos
}

export function DataTableRowActions<TData>({
  row,
  refreshData,
}: DataTableRowActionsProps<TData>) {
  const data = row.original; // Registro actual

  // Función para eliminar un registro
  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("base_operativa")
        .delete()
        .eq("id", data.id);

      if (error) throw error;

      toast.success("Registro eliminado con éxito");

      // Refresca los datos usando la prop
      await refreshData();
    } catch (err) {
      toast.error("Error al eliminar el registro");
      console.error("Error eliminando el registro:", err);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem>Editar</DropdownMenuItem>
        {/* <DropdownMenuItem>Hacer una copia</DropdownMenuItem>
        <DropdownMenuItem>Favorito</DropdownMenuItem> */}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete}>
          Eliminar
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
