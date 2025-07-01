"use client";

import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { supabase } from "@/app/utils/supabase/supabase";
import { Modal } from "../../ui/modal";
import { useModal } from "../../../hooks/useModal";
import { useState, useEffect, FormEvent } from "react";
import Input from "../../form/input/Input";
import Label from "../../form/Label";
import Select from "../../form/Seleccionar";
import Alert from "@/components/ui/alerta/AlertaExito"; // <--- IMPORTACIÓN DE TU COMPONENTE ALERT
import ReactDOM from "react-dom"; // <--- IMPORTACIÓN NECESARIA PARA REACT PORTALS
import { useUser } from "@/context/UserContext"; // <--- IMPORTACIÓN DEL CONTEXTO DE USUARIO

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Option {
  value: string;
  label: string;
}

interface OptionsState {
  bienes: Option[];
  subcategorias: Option[];
  usuarios: Option[];
  espacios: Option[];
  proveedores: Option[];
}

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  refreshData: (triggeredBy?: string) => Promise<void>;
}

const opcionesEstado = [
  { value: "bueno", label: "Bueno" },
  { value: "dañado", label: "Dañado" },
  { value: "roto", label: "Roto" },
];

const opcionesMovimiento = [
  { value: true, label: "Ingreso" },
  { value: false, label: "Salida" },
];

// -----------------------------------------------------------------------------------------

export function DataTableRowActions<TData>({
  row,
  refreshData,
}: DataTableRowActionsProps<TData>) {
  const data: any = row.original;
  const { isOpen, openModal, closeModal } = useModal();

  const [options, setOptions] = useState<OptionsState>({
    bienes: [] as { value: number; label: string }[],
    usuarios: [] as { value: number; label: string }[],
  });

  const [isMiniModalOpen, setMiniModalOpen] = useState(false);
  const [currentType, setCurrentType] = useState<string | null>(null);
  const [newValue, setNewValue] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false); // Nuevo estado para el modal de confirmación

  const [selectedBien, setSelectedBien] = useState<string | undefined>(
    data.bien || undefined
  );

  const [selectedUsuario, setSelectedUsuario] = useState<string | undefined>(
    data.usuario || undefined
  );

  // Nuevo estado para controlar la alerta personalizada
  const [currentAlert, setCurrentAlert] = useState<{
    visible: boolean;
    variant: "success" | "error" | "warning";
    title: string;
    message: string;
  } | null>(null);

  // Manejadores onChange

  const handleBienChange = (selectedOption: Option | null) => {
    setSelectedBien(selectedOption?.value || undefined);
  };

  const handleUsuarioChange = (selectedOption: Option | null) => {
    setSelectedUsuario(selectedOption?.value || undefined);
  };

  // -----------------------------------------------------------------------------------------

  useEffect(() => {
    if (isEditModalOpen) {
      // Asegurar que las opciones estén cargadas antes de buscar valores
      console.log("Modal de edición abierto. Verificando opciones y datos...");
      console.log("Opciones actuales:", options);
      console.log("Datos iniciales:", data);
      if (options.bienes?.length > 0) {
        const bien = options.bienes.find((opt) => opt.label === data.bien);
        setSelectedBien(bien?.value || data.bien_id);
        console.log("Bien seleccionado en efecto:", bien);
      } else {
        setSelectedBien(data.bien_id);
      }

      if (options.usuarios?.length > 0) {
        const usuario = options.usuarios.find(
          (opt) => opt.label === data.usuario
        );
        setSelectedUsuario(usuario?.value || data.usuario_id);
        console.log("Usuario seleccionado en efecto:", usuario);
      } else {
        setSelectedUsuario(data.usuario_id);
      }
    }
  }, [options, data, isEditModalOpen]);

  // -----------------------------------------------------------------------------------------
  const handleOpenEdit = () => {
    console.log("Abriendo modal de edición...");
    setIsEditModalOpen(true);
    openModal();
  };
  // ------------------------------------------------------------------------------------------
  const fetchOptions = async () => {
    console.log("Iniciando fetch de opciones...");
    try {
      const types = ["bienes", "usuarios"];
      const promises = types.map(async (type) => {
        const { data, error } = await supabase.from(type).select("id, nombre");
        if (error) throw error;
        console.log(`Datos obtenidos para ${type}:`, data);
        return {
          [type]: data.map((item) => ({
            value: item.id,
            label: item.nombre,
          })),
        };
      });

      const results = await Promise.all(promises);
      console.log("Opciones cargadas exitosamente:", results);
      setOptions(Object.assign({}, ...results));
    } catch (err) {
      console.error("Error fetching options:", err);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  // -----------------------------------------------------------------------------------------
  const handleInitiateDelete = () => {
    setShowConfirmDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirmDeleteModal(false); // Cierra el modal de confirmación
    try {
      const { error } = await supabase
        .from("reportes")
        .delete()
        .eq("id", data.id);
      if (error) throw error;
      await refreshData("delete");
      setCurrentAlert({
        visible: true,
        variant: "success",
        title: "¡Eliminado!",
        message: "El registro ha sido eliminado exitosamente.",
      });
      setTimeout(() => setCurrentAlert(null), 3000);
    } catch (err) {
      console.error("Error eliminando el registro:", err);
      setCurrentAlert({
        visible: true,
        variant: "error",
        title: "Error al Eliminar",
        message:
          "Ocurrió un error al eliminar el registro. Por favor, inténtalo de nuevo.",
      });
      setTimeout(() => setCurrentAlert(null), 5000);
    }
  };
  // -----------------------------------------------------------------------------------------

  const handleEdit = async (e: FormEvent<HTMLFormElement>, id: string) => {
    e.preventDefault();

    console.log("Procesando formulario de edición...");
    console.log("Evento del formulario:", e);
    console.log("ID del movimiento a actualizar:", id);

    const formData = new FormData(e.target as HTMLFormElement);
    console.log("Datos del formulario:", Array.from(formData.entries()));

    const updatedData = {
      cantidad: Number(formData.get("cantidad")) || data.cantidad,
      tipo_movimiento:
        formData.get("tipo_movimiento") === "true" ? "Ingreso" : "Salida",
      usuario_id: selectedUsuario || data.usuario_id,
      bien_id: selectedBien || data.bien_id,
      motivo: formData.get("motivo")?.toString() || data.motivo,
      fecha: formData.get("fecha")?.toString() || data.fecha,
    };

    console.log("Datos actualizados para el movimiento:", updatedData);

    try {
      const { error } = await supabase
        .from("movimientos")
        .update(updatedData)
        .eq("id", id);

      if (error) throw error;

      console.log("Actualización exitosa.");
      await refreshData("edit");
      closeModal();
    } catch (err) {
      console.error("Error al actualizar:", err);
    }
  };

  // -----------------------------------------------------------------------------------------

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
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              handleOpenEdit();
            }}
          >
            Editar
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              handleInitiateDelete(); // Llama a la función para abrir el modal de confirmación
            }}
          >
            Eliminar
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div
          className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11"
          style={{ maxHeight: "100vh" }}
        >
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Editar Registro
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Completa los campos para editar el registro.
            </p>
          </div>
          <form
            className="flex flex-col"
            onSubmit={(e) => handleEdit(e, data.id)}
          >
            {/* Contenedor para las columnas */}
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                {/* Categoría */}
                <div>
                  <Label>Nombre</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      name="bien"
                      options={options.bienes}
                      placeholder="Selecciona una categoría"
                      className="dark:bg-dark-900"
                      value={selectedBien} // Solo el ID
                      onChange={(value) => setSelectedBien(value)}
                    />

                    <Button
                      size="sm"
                      onClick={() => {
                        setCurrentType("categorias");
                        setMiniModalOpen(true);
                      }}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Cantidad */}
                <div>
                  <Label>Cantidad</Label>
                  <Input
                    type="number"
                    name="cantidad"
                    min="1"
                    placeholder="Ej. 10"
                    defaultValue={data.cantidad}
                  />
                </div>

                {/* Disponibilidad */}
                <div>
                  <Label>Tipo de Movimiento</Label>
                  <Select
                    name="disponibilidad"
                    options={opcionesMovimiento}
                    placeholder="Selecciona la disponibilidad"
                    className="dark:bg-dark-900"
                    defaultValue={data.tipo_movimiento}
                  />
                </div>

                {/* Observaciones */}
                <div className="lg:col-span-2">
                  <Label>Motivos</Label>
                  <textarea
                    name="motivo"
                    className="w-full p-2 border rounded-lg dark:bg-dark-900 dark:text-white"
                    placeholder="Notas adicionales..."
                    defaultValue={data.motivo}
                  ></textarea>
                </div>

                {/* Responsable */}
                <div>
                  <Label>Responsable</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      type="text"
                      name="usuario_id"
                      options={options.usuarios}
                      placeholder="Ej. Juan Pérez"
                      defaultValue={data.usuario}
                      value={selectedUsuario}
                      onChange={(value) => setSelectedUsuario(value)}
                    />
                  </div>
                </div>

                {/* Fecha de Creación */}
                <div>
                  <Label>Fecha de Creación</Label>
                  <Input
                    type="date"
                    name="fecha"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button size="sm" type="submit">
                Actualizar
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      {showConfirmDeleteModal &&
        ReactDOM.createPortal(
          <Modal
            isOpen={showConfirmDeleteModal}
            onClose={() => setShowConfirmDeleteModal(false)} // Permite cerrar el modal sin confirmar
            className="max-w-sm m-4"
          >
            <div className="p-6 text-center bg-white rounded-lg dark:bg-gray-900">
              <h4 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
                ¿Estás seguro?
              </h4>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                Esta acción no se puede deshacer. ¿Realmente deseas eliminar
                este registro?
              </p>
              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmDeleteModal(false)}
                >
                  No, Cancelar
                </Button>
                <Button variant="destructive" onClick={handleConfirmDelete}>
                  Sí, Eliminar
                </Button>
              </div>
            </div>
          </Modal>,
          document.body
        )}
    </>
  );
}
