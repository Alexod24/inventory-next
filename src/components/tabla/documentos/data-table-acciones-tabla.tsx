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

// Opciones de estado para documentos (ej. físico del documento o su validez)
const opcionesEstadoDocumento = [
  { value: "activo", label: "Activo" },
  { value: "archivado", label: "Archivado" },
  { value: "obsoleto", label: "Obsoleto" },
  { value: "en_revision", label: "En Revisión" },
];

interface OptionsState {
  usuarios: Option[];
  // Si tuvieras otras tablas relacionadas con documentos que necesitas añadir dinámicamente, irían aquí.
}

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  refreshData: (triggeredBy?: string) => Promise<void>;
}

export function DataTableRowActions<TData>({
  row,
  refreshData,
}: DataTableRowActionsProps<TData>) {
  const data: any = row.original; // Los datos de la fila actual (un documento)
  const { isOpen, openModal, closeModal } = useModal();
  const supabase = createClientComponentClient(); // Inicializa el cliente de Supabase para el navegador
  const { user, loading: userLoading } = useUser(); // <--- OBTENEMOS EL USUARIO Y SU ESTADO DE CARGA

  const [options, setOptions] = useState<OptionsState>({
    usuarios: [],
  });

  const [isMiniModalOpen, setMiniModalOpen] = useState(false);
  const [currentType, setCurrentType] = useState<string | null>(null);
  const [newValue, setNewValue] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false); // Nuevo estado para el modal de confirmación

  // Estados para los valores seleccionados en los Selects del modal de documentos
  const [selectedUsuario, setSelectedUsuario] = useState<string | undefined>(
    data.usuario_id || undefined
  );
  const [selectedEstadoDocumento, setSelectedEstadoDocumento] = useState<
    string | undefined
  >(data.estado || undefined);

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
      // Asegurar que los estados de los selects se inicialicen con los IDs de la data
      setSelectedUsuario(data.usuario_id || undefined);
      setSelectedEstadoDocumento(data.estado || undefined);
    }
  }, [data, isEditModalOpen]);

  // -----------------------------------------------------------------------------------------
  const handleOpenEdit = () => {
    console.log("Abriendo modal de edición de documento...");
    setIsEditModalOpen(true);
    openModal();
  };
  // ------------------------------------------------------------------------------------------
  const fetchOptions = async () => {
    console.log("Iniciando fetch de opciones para documentos...");
    try {
      // Solo necesitamos usuarios para los documentos
      const types = ["usuarios"];
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

  // -----------------------------------------------------------------------------------------

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

  const handleEdit = async (e: FormEvent<HTMLFormElement>, id: string) => {
    e.preventDefault();
    setCurrentAlert(null); // Limpia cualquier alerta anterior

    console.log("Procesando formulario de edición de documento...");
    console.log("ID del documento a actualizar:", id);

    const formData = new FormData(e.target as HTMLFormElement);
    console.log("Datos del formulario:", Array.from(formData.entries()));

    const updatedData = {
      nombre: formData.get("nombre")?.toString() || data.nombre,
      usuario_id: selectedUsuario || data.usuario_id,
      fecha_subida:
        formData.get("fecha_subida")?.toString() || data.fecha_subida, // Asumiendo 'fecha_subida'
      estado: selectedEstadoDocumento || data.estado, // Usar el estado controlado
      motivo: formData.get("motivo")?.toString() || data.motivo, // Asumiendo 'motivo' para observaciones
      // 'url' no se edita directamente desde aquí, se gestiona en la subida
      // 'cantidad' y 'valor' son campos de producto, no de documento, se eliminan
    };

    console.log("Datos actualizados para el documento:", updatedData);

    // Validación básica para campos de documento
    if (
      !updatedData.nombre ||
      !updatedData.usuario_id ||
      !updatedData.fecha_subida ||
      !updatedData.estado
    ) {
      console.error("Campos obligatorios faltantes para el documento.");
      setCurrentAlert({
        visible: true,
        variant: "warning",
        title: "Campos Incompletos",
        message:
          "Por favor, completa todos los campos obligatorios (Nombre, Responsable, Fecha de Subida, Estado).",
      });
      setTimeout(() => setCurrentAlert(null), 4000);
      return;
    }

    try {
      const { error } = await supabase
        .from("documentos") // <--- TABLA CORRECTA PARA EDITAR DOCUMENTOS
        .update(updatedData)
        .eq("id", id);

      if (error) throw error;

      console.log("Actualización de documento exitosa.");
      await refreshData("edit");
      closeModal();
      setCurrentAlert({
        visible: true,
        variant: "success",
        title: "¡Documento Actualizado!",
        message: "El registro del documento ha sido actualizado exitosamente.",
      });
      setTimeout(() => setCurrentAlert(null), 3000);
    } catch (err) {
      console.error("Error al actualizar el documento:", err);
      setCurrentAlert({
        visible: true,
        variant: "error",
        title: "Error al Actualizar",
        message: `Hubo un error al guardar los cambios del documento. Detalles: ${
          err instanceof Error ? err.message : String(err)
        }`,
      });
      setTimeout(() => setCurrentAlert(null), 5000);
    }
  };

  // -----------------------------------------------------------------------------------------
  // Mini modal para agregar nuevas opciones (solo usuarios en este contexto)
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
      // currentType es el nombre de la tabla (ej. 'usuarios')
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

      // Si el tipo actual es 'usuarios', selecciona el nuevo usuario automáticamente
      if (currentType === "usuarios") setSelectedUsuario(newEntry.id);

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

  const handleViewPdf = () => {
    console.log("Intentando abrir PDF...");
    if (!data.url) {
      console.error("No hay archivo PDF: data.url es undefined o vacío");
      setCurrentAlert({
        visible: true,
        variant: "warning",
        title: "Archivo No Disponible",
        message:
          "No hay un archivo PDF asociado a este documento para previsualizar.",
      });
      setTimeout(() => setCurrentAlert(null), 4000);
      return;
    }
    console.log("URL del PDF:", data.url);
    const newWindow = window.open(data.url, "_blank", "noopener,noreferrer");
    if (!newWindow) {
      console.error(
        "No se pudo abrir la nueva ventana. ¿Está bloqueado el popup?"
      );
      setCurrentAlert({
        visible: true,
        variant: "warning",
        title: "Bloqueador de Pop-ups",
        message:
          "No se pudo abrir la vista previa. Revisa tu bloqueador de ventanas emergentes.",
      });
      setTimeout(() => setCurrentAlert(null), 5000);
    } else {
      console.log("Ventana abierta con éxito.");
    }
  };

  const handleDownloadPdf = async () => {
    if (!data.url) {
      setCurrentAlert({
        visible: true,
        variant: "warning",
        title: "Archivo No Disponible",
        message:
          "No hay un archivo PDF asociado a este documento para descargar.",
      });
      setTimeout(() => setCurrentAlert(null), 4000);
      return;
    }

    try {
      const response = await fetch(data.url, { mode: "cors" });
      if (!response.ok) throw new Error("Error al descargar archivo");

      const blob = await response.blob();
      const urlBlob = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = urlBlob;
      const filename =
        data.url.split("/").pop()?.split("?")[0] || "documento.pdf"; // Nombre por defecto más apropiado
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(urlBlob);
      setCurrentAlert({
        visible: true,
        variant: "success",
        title: "Descarga Exitosa",
        message: "El documento se ha descargado correctamente.",
      });
      setTimeout(() => setCurrentAlert(null), 3000);
    } catch (error) {
      console.error("Error descargando archivo:", error);
      setCurrentAlert({
        visible: true,
        variant: "error",
        title: "Error de Descarga",
        message: `No se pudo descargar el archivo. Detalles: ${
          error instanceof Error ? error.message : String(error)
        }`,
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
            <DropdownMenuItem onClick={handleOpenEdit}>Editar</DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleViewPdf}>Ver PDF</DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownloadPdf}>
            Descargar PDF
          </DropdownMenuItem>

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
              Editar Documento
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Completa los campos para editar el registro del documento.
            </p>
          </div>
          <form
            className="flex flex-col"
            onSubmit={(e) => handleEdit(e, data.id)}
          >
            {/* Contenedor para las columnas */}
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                {/* Nombre del Documento */}
                <div className="lg:col-span-2">
                  <Label>Nombre del Documento</Label>
                  <Input
                    type="text"
                    name="nombre"
                    placeholder="Ej. Contrato de Arriendo"
                    defaultValue={data.nombre}
                    required
                  />
                </div>

                {/* Responsable (Usuario) */}
                <div>
                  <Label>Responsable</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      name="usuario_id" // Usar el nombre de la columna FK
                      options={options.usuarios}
                      placeholder="Selecciona un responsable"
                      value={selectedUsuario}
                      onChange={(value) => setSelectedUsuario(value)}
                      required
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

                {/* Fecha de Subida */}
                <div>
                  <Label>Fecha de Subida</Label>
                  <Input
                    type="date"
                    name="fecha_subida" // Asumiendo este nombre de columna
                    defaultValue={data.fecha_subida || ""}
                    required
                  />
                </div>

                {/* Estado del Documento */}
                <div>
                  <Label>Estado del Documento</Label>
                  <Select
                    name="estado" // Usar el nombre de la columna real en la BD
                    options={opcionesEstadoDocumento}
                    placeholder="Selecciona el estado"
                    className="dark:bg-dark-900"
                    value={selectedEstadoDocumento}
                    onChange={(value) => setSelectedEstadoDocumento(value)}
                    required
                  />
                </div>

                {/* Motivos / Observaciones */}
                <div className="lg:col-span-2">
                  <Label>Motivos / Observaciones</Label>
                  <textarea
                    name="motivo" // Asumiendo este nombre de columna
                    className="w-full p-2 border rounded-lg dark:bg-dark-900 dark:text-white"
                    placeholder="Notas adicionales sobre el documento..."
                    defaultValue={data.motivo}
                  ></textarea>
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

      {/* Mini modal para agregar nuevas opciones (solo usuarios en este contexto) */}
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
