"use client";

import { Row } from "@tanstack/react-table";
import { Pen, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClientComponentClient } from "@/app/utils/supabase/browser";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { Proveedor } from "./schema";
import { Modal } from "@/components/ui/modal";
import { CrearProveedorModal } from "./CrearProveedorModal";
import ReactDOM from "react-dom";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  refreshData: (triggeredBy?: string) => Promise<void>;
}

export function DataTableRowActions<TData>({
  row,
  refreshData,
}: DataTableRowActionsProps<TData>) {
  const proveedor = row.original as Proveedor;
  const supabase = createClientComponentClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("proveedores")
        .delete()
        .eq("id", proveedor.id);

      if (error) {
        throw error;
      }

      toast.success("Proveedor eliminado correctamente");
      refreshData?.("delete");
    } catch (err: any) {
      console.error("Error al eliminar:", err);
      toast.error("No se pudo eliminar: " + err.message);
    } finally {
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={() => setShowEditModal(true)}>
            <Pen className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowDeleteModal(true)}>
            <Trash2 className="mr-2 h-3.5 w-3.5 text-red-500" />
            <span className="text-red-500">Eliminar</span>
            <DropdownMenuShortcut className="text-red-500">
              ⌘⌫
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        className="max-w-md"
      >
        <div className="p-6 text-center">
          <h4 className="mb-4 text-xl font-semibold">¿Eliminar Proveedor?</h4>
          <p className="mb-6 text-muted-foreground">
            Esta acción no se puede deshacer. Esto eliminará permanentemente al
            proveedor{" "}
            <span className="font-bold text-foreground">
              {proveedor.nombre}
            </span>
            .
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Sí, Eliminar
            </Button>
          </div>
        </div>
      </Modal>

      <CrearProveedorModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onProveedorCreated={async () => {
          await refreshData();
          setShowEditModal(false);
        }}
        editData={proveedor}
      />
    </>
  );
}
