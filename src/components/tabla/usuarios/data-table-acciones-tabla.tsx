"use client";

import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@/app/utils/supabase/browser"; // Cliente de Supabase para el navegador
import { Modal } from "../../ui/modal";
import { useModal } from "../../../hooks/useModal";
import { useState, useEffect, FormEvent } from "react";
import Input from "../../form/input/Input";
import Label from "../../form/Label";
import Select from "../../form/Seleccionar";
import Alert from "@/components/ui/alerta/AlertaExito"; // <--- IMPORTACIÓN DE TU COMPONENTE ALERT
import ReactDOM from "react-dom"; // <--- IMPORTACIÓN NECESARIA PARA REACT PORTALS

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// No necesitamos interfaces de opciones de producto si solo editamos usuarios
// interface Option { value: string; label: string; }
// interface OptionsState { marcas: Option[]; colores: Option[]; materiales: Option[]; proveedores: Option[]; estados: Option[]; }
// interface MarcaOption { value: string; label: string; }

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  refreshData: (triggeredBy?: string) => Promise<void>;
}

// Opciones estáticas para el rol de usuario
const opcionesRol = [
  { value: "empleado", label: "Empleado" },
  { value: "admin", label: "Admin" },
];

// Las opciones de estado y disponibilidad son para productos, no para usuarios.
// Se eliminan si esta tabla es solo para usuarios.
// const opcionesEstado = [
//   { value: "bueno", label: "Bueno" },
//   { value: "dañado", label: "Dañado" },
//   { value: "roto", label: "Roto" },
// ];
// const opcionesDisponibilidad = [
//   { value: "ok", label: "OK" },
//   { value: "pendiente", label: "Pendiente" },
//   { value: "faltante", label: "Faltante" },
// ];

export function DataTableRowActions<TData>({
  row,
  refreshData,
}: DataTableRowActionsProps<TData>) {
  const data: any = row.original; // Los datos de la fila actual (un usuario)
  const { isOpen, openModal, closeModal } = useModal();
  const supabase = createClientComponentClient(); // Inicializa el cliente de Supabase para el navegador

  // Eliminamos todos los estados relacionados con opciones dinámicas de productos y el mini-modal
  // const [options, setOptions] = useState<OptionsState>({ ... });
  // const [isMiniModalOpen, setMiniModalOpen] = useState(false);
  // const [currentType, setCurrentType] = useState<string | null>(null);
  // const [newValue, setNewValue] = useState("");
  // const [selectedProveedor, setSelectedProveedor] = useState<string | undefined>(data.proveedor || undefined);
  // const [selectedMarca, setSelectedMarca] = useState<string | undefined>(data.marca || undefined);
  // const [selectedMaterial, setSelectedMaterial] = useState<string | undefined>(data.material || undefined);
  // const [selectedColor, setSelectedColor] = useState<string | undefined>(data.color || undefined);

  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // Nuevo estado para controlar la alerta personalizada
  const [currentAlert, setCurrentAlert] = useState<{
    visible: boolean;
    variant: "success" | "error" | "warning";
    title: string;
    message: string;
  } | null>(null);

  // Eliminamos fetchOptions y su useEffect ya que no son relevantes para la edición de usuarios
  // const fetchOptions = async () => { ... };
  // useEffect(() => { fetchOptions(); }, []);

  // El useEffect para pre-seleccionar valores en los selects (ahora solo para rol)
  // No es estrictamente necesario si `defaultValue` ya maneja la pre-selección,
  // pero lo mantenemos por si se añade lógica compleja en el futuro.
  useEffect(() => {
    if (isEditModalOpen) {
      // Lógica para pre-seleccionar el rol si es necesario, aunque `defaultValue` en <Select> debería bastar
    }
  }, [data, isEditModalOpen]);

  // -----------------------------------------------------------------------------------------
  const handleOpenEdit = () => {
    setIsEditModalOpen(true);
    openModal();
  };

  // -----------------------------------------------------------------------------------------
  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("usuarios") // <--- TABLA CORRECTA PARA ELIMINAR USUARIOS
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
    setCurrentAlert(null); // Limpia cualquier alerta anterior

    const formData = new FormData(e.target as HTMLFormElement);

    // <--- CAMPOS ACTUALIZADOS PARA LA TABLA 'USUARIOS' ---
    const updatedData = {
      email: formData.get("email")?.toString().trim() || "",
      nombre: formData.get("nombre")?.toString().trim() || "",
      rol: formData.get("rol")?.toString() || "usuario", // Asegúrate de que 'usuario' sea un valor por defecto válido si el rol es opcional
    };

    // Validación básica para campos de usuario
    if (!updatedData.email || !updatedData.nombre || !updatedData.rol) {
      console.error("Campos obligatorios faltantes para el usuario.");
      setCurrentAlert({
        visible: true,
        variant: "warning",
        title: "Campos Incompletos",
        message:
          "Por favor, completa todos los campos obligatorios (Correo, Nombre, Rol).",
      });
      setTimeout(() => setCurrentAlert(null), 4000);
      return;
    }

    try {
      const { error } = await supabase
        .from("usuarios") // <--- TABLA CORRECTA PARA EDITAR USUARIOS
        .update(updatedData)
        .eq("id", id);

      if (error) throw error;

      await refreshData(); // Refrescar datos de la tabla
      closeModal(); // Cerrar modal
      setCurrentAlert({
        visible: true,
        variant: "success",
        title: "¡Usuario Actualizado!",
        message: "El registro del usuario ha sido actualizado exitosamente.",
      });
      setTimeout(() => setCurrentAlert(null), 3000);
    } catch (err) {
      console.error("Error al editar el usuario:", err);
      setCurrentAlert({
        visible: true,
        variant: "error",
        title: "Error al Actualizar",
        message: `Hubo un error al guardar los cambios del usuario. Detalles: ${
          err instanceof Error ? err.message : String(err)
        }`,
      });
      setTimeout(() => setCurrentAlert(null), 5000);
    }
  };
  // -----------------------------------------------------------------------------------------
  // Eliminamos handleCreateOption y el mini-modal ya que no son relevantes para la edición de usuarios
  // const handleCreateOption = async (e: FormEvent) => { ... };

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
          <DropdownMenuItem onClick={handleOpenEdit}>Editar</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
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
              Editar Usuario {/* <--- TÍTULO ACTUALIZADO */}
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Edita los campos del usuario. {/* <--- DESCRIPCIÓN ACTUALIZADA */}
            </p>
          </div>
          <form
            className="flex flex-col"
            onSubmit={(e) => handleEdit(e, data.id)}
          >
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                {/* <--- CAMPOS DE USUARIO --- */}
                <div className="lg:col-span-2">
                  <Label>Correo</Label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Correo electrónico"
                    defaultValue={data.email}
                    required
                  />
                </div>

                <div>
                  <Label>Nombre</Label>
                  <Input
                    type="text"
                    name="nombre"
                    placeholder="Nombre de usuario"
                    defaultValue={data.nombre}
                    required
                  />
                </div>

                <div>
                  <Label>Rol</Label>
                  <Select
                    name="rol"
                    options={opcionesRol}
                    placeholder="Selecciona el rol"
                    className="dark:bg-dark-900"
                    defaultValue={data.rol}
                  />
                </div>
                {/* <--- FIN CAMPOS DE USUARIO --- */}

                {/* Eliminamos los campos de producto que ya no son relevantes */}
                {/* <div><Label>Proveedor</Label>...</div> */}
                {/* ... y así sucesivamente para todos los campos de producto ... */}
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>

              <Button size="sm" type="submit">
                Guardar Cambios {/* <--- TEXTO DEL BOTÓN ACTUALIZADO */}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Eliminamos el mini-modal completo ya que no es relevante para la edición de usuarios */}
      {/* {isMiniModalOpen && currentType && ( <Modal> ... </Modal> )} */}

      {/* Renderiza la alerta personalizada usando un Portal */}
      {currentAlert &&
        currentAlert.visible &&
        typeof document !== "undefined" &&
        ReactDOM.createPortal(
          <div className="fixed top-4 right-4 z-[99999]">
            {" "}
            {/* Z-index muy alto */}
            <Alert
              variant={currentAlert.variant}
              title={currentAlert.title}
              message={currentAlert.message}
              showLink={false}
            />
          </div>,
          document.body // Renderiza directamente en el body
        )}
    </>
  );
}
