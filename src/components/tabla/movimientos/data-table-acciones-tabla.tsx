"use client";

import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
// import { toast } from "react-hot-toast"; // Eliminamos toast ya que usaremos alertas personalizadas
// import { supabase } from "@/app/utils/supabase/supabase"; // Eliminamos esta importación duplicada/incorrecta
import { createClientComponentClient } from "@/app/utils/supabase/browser"; // Cliente de Supabase para el navegador
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
  usuarios: Option[];
  // Las siguientes no son necesarias para movimientos, pero se mantienen si tu BD las tiene y las usas en el mini-modal
  categorias?: Option[];
  subcategorias?: Option[];
  espacios?: Option[];
  proveedores?: Option[];
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
  { value: "Ingreso", label: "Ingreso" }, // Cambiado a string para consistencia
  { value: "Salida", label: "Salida" }, // Cambiado a string para consistencia
];

// -----------------------------------------------------------------------------------------

export function DataTableRowActions<TData>({
  row,
  refreshData,
}: DataTableRowActionsProps<TData>) {
  const data: any = row.original;
  const { isOpen, openModal, closeModal } = useModal();
  const supabase = createClientComponentClient(); // Inicializa el cliente de Supabase para el navegador
  const { user, loading: userLoading } = useUser(); // <--- OBTENEMOS EL USUARIO Y SU ESTADO DE CARGA
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false); // Nuevo estado para el modal de confirmación

  const [options, setOptions] = useState<OptionsState>({
    bienes: [],
    usuarios: [],
    // Inicializa las otras opciones como arrays vacíos si las vas a usar en el mini-modal
    categorias: [],
    subcategorias: [],
    espacios: [],
    proveedores: [],
  });

  const [isMiniModalOpen, setMiniModalOpen] = useState(false);
  const [currentType, setCurrentType] = useState<string | null>(null);
  const [newValue, setNewValue] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [setSelectedCategoria] = useState<string | null>(null);
  const [setSelectedSubCategoria] = useState<string | null>(null);
  const [setSelectedEspacio] = useState<string | null>(null);
  const [setSelectedProveedor] = useState<string | null>(null);

  // Estados para los valores seleccionados en los Selects
  const [selectedBien, setSelectedBien] = useState<string | undefined>(
    data.bien_id || undefined
  );
  const [selectedUsuario, setSelectedUsuario] = useState<string | undefined>(
    data.usuario_id || undefined
  );
  const [selectedTipoMovimiento, setSelectedTipoMovimiento] = useState<
    string | undefined
  >(data.tipo_movimiento || undefined); // Nuevo estado para tipo_movimiento
  const [selectedEstado, setSelectedEstado] = useState<string | undefined>(
    data.estado || undefined
  ); // Nuevo estado para estado

  // Nuevo estado para controlar la alerta personalizada
  const [currentAlert, setCurrentAlert] = useState<{
    visible: boolean;
    variant: "success" | "error" | "warning";
    title: string;
    message: string;
  } | null>(null);

  // -----------------------------------------------------------------------------------------

  useEffect(() => {
    if (isEditModalOpen) {
      // Usamos los IDs directamente si ya los tienes en `data`
      setSelectedBien(data.bien_id || undefined);
      setSelectedUsuario(data.usuario_id || undefined);
      setSelectedTipoMovimiento(data.tipo_movimiento || undefined);
      setSelectedEstado(data.estado || undefined);
    }
  }, [data, isEditModalOpen]);

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
      // Incluimos todas las tablas que podrían ser opciones para el mini-modal
      const types = [
        "bienes",
        "usuarios",
        "categorias", // Añadido para el mini-modal si se usa
        "subcategorias", // Añadido para el mini-modal si se usa
        "espacios", // Añadido para el mini-modal si se usa
        "proveedores", // Añadido para el mini-modal si se usa
      ];
      const promises = types.map(async (type) => {
        const { data, error } = await supabase.from(type).select("id, nombre");
        if (error) {
          console.warn(
            `Advertencia: No se pudo cargar la tabla '${type}'. Error: ${error.message}`
          );
          return { [type]: [] }; // Retorna un array vacío para este tipo si hay error
        }
        console.log(`Datos obtenidos para ${type}:`, data);
        return {
          [type]: data.map((item) => ({
            value: item.id, // Asegúrate de usar el ID como valor
            label: item.nombre,
          })),
        };
      });

      const results = await Promise.all(promises);
      console.log("Opciones cargadas exitosamente:", results);
      setOptions(Object.assign({}, ...results));
    } catch (err) {
      console.error("Error fetching options:", err);
      setCurrentAlert({
        visible: true,
        variant: "error",
        title: "Error de Carga",
        message:
          "No se pudieron cargar las opciones para los campos. Inténtalo de nuevo.",
      });
      setTimeout(() => setCurrentAlert(null), 5000);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  const handleInitiateDelete = () => {
    setShowConfirmDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirmDeleteModal(false); // Cierra el modal de confirmación
    try {
      const { error } = await supabase
        .from("documentos") // <--- TABLA CORRECTA PARA ELIMINAR DOCUMENTOS
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
  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("movimientos")
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

    console.log("Procesando formulario de edición...");
    console.log("ID del movimiento a actualizar:", id);

    const formData = new FormData(e.target as HTMLFormElement);
    console.log("Datos del formulario:", Array.from(formData.entries()));

    const updatedData = {
      cantidad: Number(formData.get("cantidad")) || data.cantidad,
      // Usamos el estado controlado para tipo_movimiento
      tipo_movimiento: selectedTipoMovimiento || data.tipo_movimiento,
      usuario_id: selectedUsuario || data.usuario_id,
      bien_id: selectedBien || data.bien_id,
      motivo: formData.get("motivo")?.toString() || data.motivo,
      fecha: formData.get("fecha")?.toString() || data.fecha,
      // Si 'estado' es un campo de la tabla movimientos y se usa en el modal
      estado: selectedEstado || data.estado,
    };

    console.log("Datos actualizados para el movimiento:", updatedData);

    // Validación básica
    if (
      !updatedData.cantidad ||
      !updatedData.tipo_movimiento ||
      !updatedData.usuario_id ||
      !updatedData.bien_id ||
      !updatedData.motivo ||
      !updatedData.fecha
    ) {
      console.error("Campos obligatorios faltantes.");
      setCurrentAlert({
        visible: true,
        variant: "warning",
        title: "Campos Incompletos",
        message: "Por favor, completa todos los campos obligatorios.",
      });
      setTimeout(() => setCurrentAlert(null), 4000);
      return;
    }

    try {
      const { error } = await supabase
        .from("movimientos")
        .update(updatedData)
        .eq("id", id);

      if (error) throw error;

      console.log("Actualización exitosa.");
      await refreshData("edit");
      closeModal();
      setCurrentAlert({
        visible: true,
        variant: "success",
        title: "¡Actualizado!",
        message: "El registro ha sido actualizado exitosamente.",
      });
      setTimeout(() => setCurrentAlert(null), 3000);
    } catch (err) {
      console.error("Error al actualizar:", err);
      setCurrentAlert({
        visible: true,
        variant: "error",
        title: "Error al Actualizar",
        message: `Hubo un error al guardar los cambios. Detalles: ${
          err instanceof Error ? err.message : String(err)
        }`,
      });
      setTimeout(() => setCurrentAlert(null), 5000);
    }
  };

  // -----------------------------------------------------------------------------------------
  // Mini modal para agregar nuevas opciones (proveedores, categorías, etc.)
  const handleCreateOption = async (e: FormEvent) => {
    e.preventDefault();
    setCurrentAlert(null); // Limpia cualquier alerta anterior

    if (!newValue.trim() || !currentType) {
      setCurrentAlert({
        visible: true,
        variant: "warning",
        title: "Campo Vacío",
        message: "Por favor, ingresa un valor para la nueva opción.",
      });
      setTimeout(() => setCurrentAlert(null), 3000);
      return;
    }

    try {
      // currentType es el nombre de la tabla (ej. 'bienes', 'usuarios', 'categorias')
      const { data: newEntry, error } = await supabase
        .from(currentType)
        .insert([{ nombre: newValue.trim() }])
        .select("id, nombre") // Selecciona el ID y nombre para actualizar las opciones
        .single(); // Espera un solo resultado

      if (error) throw error;

      // Actualiza el estado de las opciones con el nuevo elemento
      setOptions((prevOptions) => {
        const updatedTypeOptions = [
          ...(prevOptions[currentType as keyof OptionsState] || []),
          { value: newEntry.id, label: newEntry.nombre },
        ];
        return {
          ...prevOptions,
          [currentType]: updatedTypeOptions,
        };
      });

      // Si el tipo actual es una de las opciones seleccionadas, actualiza el estado
      // para que el nuevo elemento se seleccione automáticamente si es el caso
      if (currentType === "bienes") setSelectedBien(newEntry.id);
      if (currentType === "usuarios") setSelectedUsuario(newEntry.id);
      // Añade aquí las asignaciones para otras tablas si las usas en el mini-modal
      // if (currentType === "categorias" && "categorias" in options)
      //   setSelectedCategoria(newEntry.id);
      // if (currentType === "subcategorias" && "subcategorias" in options)
      //   setSelectedSubCategoria(newEntry.id);
      // if (currentType === "espacios" && "espacios" in options)
      //   setSelectedEspacio(newEntry.id);
      // if (currentType === "proveedores" && "proveedores" in options)
      //   setSelectedProveedor(newEntry.id);

      setMiniModalOpen(false);
      setNewValue("");
      setCurrentType(null);
      setCurrentAlert({
        visible: true,
        variant: "success",
        title: "¡Opción Creada!",
        message: `Nueva opción de ${currentType.slice(
          0,
          -1
        )} agregada exitosamente.`,
      });
      setTimeout(() => setCurrentAlert(null), 3000);
    } catch (err) {
      console.error(`Error al crear ${currentType}:`, err);
      setCurrentAlert({
        visible: true,
        variant: "error",
        title: "Error al Crear Opción",
        message: `Ocurrió un error al agregar la opción de ${currentType.slice(
          0,
          -1
        )}. Detalles: ${err instanceof Error ? err.message : String(err)}`,
      });
      setTimeout(() => setCurrentAlert(null), 5000);
    }
  };

  // Determinar si el usuario actual es 'admin'
  const isAdmin = user && user.rol === "admin";
  const canEditOrDelete = isAdmin && !userLoading; // Solo puede editar/eliminar si es admin y los datos del usuario han cargado

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
          {/* Renderizar "Editar" solo si el usuario es admin */}
          {canEditOrDelete && (
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                handleOpenEdit();
              }}
            >
              Editar
            </DropdownMenuItem>
          )}

          {/* Renderizar "Eliminar" solo si el usuario es admin */}
          {canEditOrDelete && <DropdownMenuSeparator />}
          {canEditOrDelete && (
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                handleInitiateDelete(); // Llama a la función para abrir el modal de confirmación
              }}
            >
              Eliminar
              <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
          {!canEditOrDelete && (
            <DropdownMenuItem disabled className="text-gray-500">
              No autorizado
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div
          className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11"
          style={{ maxHeight: "100vh" }}
        >
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Editar Registro de Movimiento
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Completa los campos para editar el registro del movimiento.
            </p>
          </div>
          <form
            className="flex flex-col"
            onSubmit={(e) => handleEdit(e, data.id)}
          >
            {/* Contenedor para las columnas */}
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                {/* Nombre del Bien (ahora Bien) */}
                <div>
                  <Label>Bien</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      name="bien_id" // Usar el nombre de la columna FK
                      options={options.bienes}
                      placeholder="Selecciona un bien"
                      className="dark:bg-dark-900"
                      value={selectedBien}
                      onChange={(value) => setSelectedBien(value)}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        setCurrentType("bienes"); // <--- Corregido a 'bienes'
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
                    required
                  />
                </div>

                {/* Tipo de Movimiento */}
                <div>
                  <Label>Tipo de Movimiento</Label>
                  <Select
                    name="tipo_movimiento" // Nombre de la columna FK
                    options={opcionesMovimiento}
                    placeholder="Selecciona el tipo de movimiento"
                    className="dark:bg-dark-900"
                    value={selectedTipoMovimiento} // Usar estado controlado
                    onChange={(value) => setSelectedTipoMovimiento(value)} // Actualizar estado
                  />
                </div>

                {/* Motivos (Observaciones) */}
                <div>
                  <Label>Motivos</Label>
                  <textarea
                    name="motivo"
                    className="w-full p-2 border rounded-lg dark:bg-dark-900 dark:text-white"
                    placeholder="Notas adicionales..."
                    defaultValue={data.motivo}
                  ></textarea>
                </div>

                {/* Responsable (Usuario) */}
                <div>
                  <Label>Responsable</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      name="usuario_id" // Usar el nombre de la columna FK
                      options={options.usuarios}
                      placeholder="Ej. Juan Pérez"
                      value={selectedUsuario}
                      onChange={(value) => setSelectedUsuario(value)}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        setCurrentType("usuarios"); // <--- Corregido a 'usuarios'
                        setMiniModalOpen(true);
                      }}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Fecha de Movimiento */}
                <div>
                  <Label>Fecha de Movimiento</Label>
                  <Input
                    type="date"
                    name="fecha"
                    defaultValue={data.fecha || ""}
                    required
                  />
                </div>

                {/* Estado Físico (Si aplica a movimientos, si no, se puede quitar) */}
                <div>
                  <Label>Estado Físico</Label>
                  <Select
                    name="estado" // Usar el nombre de la columna real en la BD
                    options={opcionesEstado}
                    placeholder="Selecciona el estado físico"
                    className="dark:bg-dark-900"
                    value={selectedEstado} // Usar estado controlado
                    onChange={(value) => setSelectedEstado(value)} // Actualizar estado
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

      {/* Mini modal para agregar nuevas opciones (bienes, usuarios, etc.) */}
      {isMiniModalOpen &&
        currentType &&
        ReactDOM.createPortal(
          <Modal
            isOpen={isMiniModalOpen}
            onClose={() => {
              setMiniModalOpen(false);
              setCurrentType(null);
              setNewValue("");
            }}
            className="max-w-[400px] m-4"
          >
            <div className="w-full p-4 bg-white rounded-lg dark:bg-gray-900">
              <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">
                Agregar Nuevo{" "}
                {currentType.charAt(0).toUpperCase() + currentType.slice(0, -1)}{" "}
                {/* Ajuste para singular */}
              </h4>
              <form onSubmit={handleCreateOption}>
                <Label>Nombre del {currentType.slice(0, -1)}</Label>
                <Input
                  type="text"
                  name="newValue"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder={`Ej. Nombre de ${currentType.slice(0, -1)}`}
                  required
                />
                <div className="flex justify-end mt-4 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setMiniModalOpen(false);
                      setCurrentType(null);
                      setNewValue("");
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button size="sm" type="submit">
                    Crear
                  </Button>
                </div>
              </form>
            </div>
          </Modal>,
          document.body // Renderiza directamente en el body
        )}

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
