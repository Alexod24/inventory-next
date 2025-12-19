"use client";

import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@/app/utils/supabase/browser";
import { Modal } from "@/components/ui/modal";
import { useState } from "react";
import Alert from "@/components/ui/alerta/AlertaExito";
import ReactDOM from "react-dom";
import { useUser } from "@/context/UserContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, Trash2 } from "lucide-react";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  refreshData: (triggeredBy?: string) => Promise<void>;
}

export function DataTableRowActions<TData>({
  row,
  refreshData,
}: DataTableRowActionsProps<TData>) {
  const data: any = row.original;
  const supabase = createClientComponentClient();
  const { user, loading: userLoading } = useUser();

  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);

  // Custom Alert State
  const [currentAlert, setCurrentAlert] = useState<{
    visible: boolean;
    variant: "success" | "error" | "warning";
    title: string;
    message: string;
  } | null>(null);

  // -----------------------------------------------------------------------------------------
  // Print Ticket
  const handlePrintTicket = () => {
    // Construct URL for the ticket page
    // Route Groups (admin) do NOT add to path. path is /ventas/ticket/[id]
    const url = `/ventas/ticket/${data.id}`;
    const width = 450;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      url,
      "Ticket",
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
    );
  };

  // -----------------------------------------------------------------------------------------
  // Delete Sale Logic
  const handleInitiateDelete = () => {
    setShowConfirmDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirmDeleteModal(false);
    try {
      // 1. Delete dependent 'salidas' first?
      // Usually CASCADE on DB handles this, but let's be safe or assume DB constraints.
      // If we have ON DELETE CASCADE, deleting 'ventas' is enough.

      const { error } = await supabase
        .from("ventas")
        .delete()
        .eq("id", data.id);

      if (error) throw error;

      await refreshData("delete");

      setCurrentAlert({
        visible: true,
        variant: "success",
        title: "¡Eliminado!",
        message: "La venta ha sido eliminada exitosamente.",
      });
      setTimeout(() => setCurrentAlert(null), 3000);
    } catch (err: any) {
      console.error("Error eliminando la venta:", err);
      setCurrentAlert({
        visible: true,
        variant: "error",
        title: "Error al Eliminar",
        message: "No se pudo eliminar la venta. " + (err.message || ""),
      });
      setTimeout(() => setCurrentAlert(null), 5000);
    }
  };

  // -----------------------------------------------------------------------------------------

  const isAdmin = user && user.rol === "admin";
  const canDelete = isAdmin && !userLoading;

  return (
    <>
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
        <DropdownMenuContent align="end" className="w-[180px]">
          <DropdownMenuItem onClick={handlePrintTicket}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Ver Ticket</span>
          </DropdownMenuItem>

          {canDelete && <DropdownMenuSeparator />}

          {canDelete && (
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                handleInitiateDelete();
              }}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Eliminar</span>
              <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal de confirmación de eliminación */}
      {showConfirmDeleteModal &&
        ReactDOM.createPortal(
          <Modal
            isOpen={showConfirmDeleteModal}
            onClose={() => setShowConfirmDeleteModal(false)}
            className="max-w-sm m-4 z-[9999]"
          >
            <div className="p-6 text-center bg-white rounded-lg dark:bg-gray-900">
              <h4 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
                ¿Eliminar Venta?
              </h4>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                Esta acción eliminará el registro de venta y sus detalles de
                salida. El stock NO se repondrá automáticamente (a menos que
                haya un trigger para DELETE, que actualmente no hemos
                implementado).
                <br />
                <br />
                ¿Deseas continuar?
              </p>
              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmDeleteModal(false)}
                >
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleConfirmDelete}>
                  Sí, Eliminar
                </Button>
              </div>
            </div>
          </Modal>,
          document.body
        )}

      {/* Renderiza la alerta personalizada usando un Portal */}
      {currentAlert &&
        currentAlert.visible &&
        typeof document !== "undefined" &&
        ReactDOM.createPortal(
          <div className="fixed top-4 right-4 z-[99999]">
            <Alert
              variant={currentAlert.variant}
              title={currentAlert.title}
              message={currentAlert.message}
              showLink={false}
            />
          </div>,
          document.body
        )}
    </>
  );
}
