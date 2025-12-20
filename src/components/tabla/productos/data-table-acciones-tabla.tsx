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

import { Option, opcionesEstado, opcionesDisponibilidad } from "@/lib/options";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface OptionsState {
  categorias: Option[];
  subcategorias: Option[];
  usuarios: Option[];
  espacios: Option[];
  proveedores: Option[];
}

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  refreshData: (triggeredBy?: string) => Promise<void>;
}

// -----------------------------------------------------------------------------------------

export function DataTableRowActions<TData>({
  row,
  refreshData,
}: DataTableRowActionsProps<TData>) {
  const data: any = row.original;
  const { isOpen, openModal, closeModal } = useModal();
  const supabase = createClientComponentClient(); // Inicializa el cliente de Supabase para el navegador
  const { user, loading: userLoading } = useUser(); // <--- OBTENEMOS EL USUARIO Y SU ESTADO DE CARGA

  const [options, setOptions] = useState<OptionsState>({
    categorias: [],
    subcategorias: [],
    usuarios: [],
    espacios: [],
    proveedores: [],
  });

  const [isMiniModalOpen, setMiniModalOpen] = useState(false);
  const [currentType, setCurrentType] = useState<string | null>(null);
  const [newValue, setNewValue] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false); // Nuevo estado para el modal de confirmación

  // Estados para los valores seleccionados en los Selects
  const [selectedProveedor, setSelectedProveedor] = useState<
    string | undefined
  >(data.proveedor_id || undefined);
  const [selectedCategoria, setSelectedCategoria] = useState<
    string | undefined
  >(data.categoria_id || undefined);
  const [selectedSubCategoria, setSelectedSubCategoria] = useState<
    string | undefined
  >(data.subcategoria_id || undefined);
  const [selectedEspacio, setSelectedEspacio] = useState<string | undefined>(
    data.espacio_id || undefined
  );
  const [selectedUsuario, setSelectedUsuario] = useState<string | undefined>(
    data.usuario_id || undefined
  );

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
      setSelectedProveedor(data.proveedor_id || undefined);
      setSelectedCategoria(data.categoria_id || undefined);
      setSelectedSubCategoria(data.subcategoria_id || undefined);
      setSelectedEspacio(data.espacio_id || undefined);
      setSelectedUsuario(data.usuario_id || undefined);
    }
  }, [data, isEditModalOpen]);

  // -----------------------------------------------------------------------------------------
  const handleOpenEdit = () => {
    setIsEditModalOpen(true);
    openModal();
  };
  // ------------------------------------------------------------------------------------------
  const fetchOptions = async () => {
    try {
      const types = [
        "categorias",
        "espacios",
        "subcategorias",
        "proveedores",
        "usuarios",
      ];
      const promises = types.map(async (type) => {
        const { data, error } = await supabase.from(type).select("id, nombre");
        if (error) {
          console.warn(
            `Advertencia: No se pudo cargar la tabla '${type}'. Error: ${error.message}`
          );
          return { [type]: [] }; // Retorna un array vacío para este tipo si hay error
        }
        return {
          [type]: data.map((item) => ({
            value: item.id, // Asegúrate de usar el ID como valor
            label: item.nombre,
          })),
        };
      });

      const results = await Promise.all(promises);
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
  // Función para iniciar el proceso de eliminación (abre el modal de confirmación)
  const handleInitiateDelete = () => {
    setShowConfirmDeleteModal(true);
  };

  // Función que se llama cuando el usuario CONFIRMA la eliminación
  const handleConfirmDelete = async () => {
    setShowConfirmDeleteModal(false); // Cierra el modal de confirmación
    try {
      const { error } = await supabase
        .from("productos")
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

  // Función para manejar la edición de un registro
  const handleEdit = async (e: FormEvent<HTMLFormElement>, id: string) => {
    e.preventDefault();
    setCurrentAlert(null); // Limpia cualquier alerta anterior

    const formData = new FormData(e.target as HTMLFormElement);

    // Mapea los datos del formulario a un objeto para la base de datos
    const updatedData = {
      nombre: formData.get("nombre")?.toString() || data.nombre,
      cantidad: Number(formData.get("cantidad")) || data.cantidad,
      valor: Number(formData.get("valor")) || data.valor,
      // CORRECCIÓN CLAVE: Asegura que el nombre del campo coincida con el de la BD y el Select.
      // Si tu columna en Supabase es 'estado', esto es correcto.
      estado: formData.get("estado")?.toString() || data.estado,
      disponibilidad: formData.get("disponibilidad") === "true", // Convierte a booleano
      // Usa los estados de los selects para los IDs de clave foránea
      proveedor_id: selectedProveedor || data.proveedor_id,
      espacio_id: selectedEspacio || data.espacio_id,
      usuario_id: selectedUsuario || data.usuario_id,
      subcategoria_id: selectedSubCategoria || data.subcategoria_id,
      categoria_id: selectedCategoria || data.categoria_id,
      observaciones:
        formData.get("observaciones")?.toString() || data.observaciones,
      fecha_adquisicion:
        formData.get("fecha_adquisicion")?.toString() || data.fecha_adquisicion,
      creado_en: formData.get("creado_en")?.toString() || data.creado_en,
      actualizado_en:
        formData.get("actualizado_en")?.toString() || data.actualizado_en,
      // Las fechas de creación y actualización no se actualizan directamente desde el formulario
    };

    // Validación básica de campos obligatorios
    if (
      !updatedData.nombre ||
      !updatedData.cantidad ||
      !updatedData.valor ||
      !updatedData.proveedor_id ||
      !updatedData.categoria_id ||
      !updatedData.espacio_id ||
      !updatedData.usuario_id ||
      !updatedData.fecha_adquisicion
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
      // Realiza la actualización en Supabase
      const { error } = await supabase
        .from("productos")
        .update(updatedData)
        .eq("id", id); // Actualiza el registro por su ID

      if (error) throw error;

      await refreshData("edit"); // Refresca los datos de la tabla después de la edición
      closeModal(); // Cierra el modal de edición
      setCurrentAlert({
        visible: true,
        variant: "success",
        title: "¡Actualizado!",
        message: "El registro ha sido actualizado exitosamente.",
      });
      setTimeout(() => setCurrentAlert(null), 3000);
    } catch (err) {
      console.error("Error al editar el producto:", err);
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
      // currentType es el nombre de la tabla (ej. 'proveedores', 'categorias')
      const { data: newEntry, error } = await supabase
        .from(currentType)
        .insert([{ nombre: newValue.trim() }])
        .select("id, nombre") // Selecciona el ID y nombre para actualizar las opciones
        .single(); // Espera un solo resultado

      if (error) throw error;

      // Actualiza el estado de las opciones con el nuevo elemento
      setOptions((prevOptions) => ({
        ...prevOptions,
        [currentType]: [
          ...prevOptions[currentType as keyof OptionsState],
          { value: newEntry.id, label: newEntry.nombre },
        ],
      }));

      // Si el tipo actual es una de las opciones seleccionadas, actualiza el estado
      // para que el nuevo elemento se seleccione automáticamente si es el caso
      if (currentType === "proveedores") setSelectedProveedor(newEntry.id);
      if (currentType === "categorias") setSelectedCategoria(newEntry.id);
      if (currentType === "subcategorias") setSelectedSubCategoria(newEntry.id);
      if (currentType === "espacios") setSelectedEspacio(newEntry.id);
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
                {/* Código */}
                <div>
                  <Label>Código</Label>
                  <Input
                    type="text"
                    name="codigo"
                    placeholder="Código generado automáticamente"
                    defaultValue={data.codigo} // Asegúrate de que 'data.codigo' existe
                    readOnly // Evita que el usuario escriba
                    autoComplete="off" // Deshabilita las sugerencias del navegador
                    className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white cursor-not-allowed"
                  />
                </div>

                {/* Nombre */}
                <div>
                  <Label>Nombre</Label>
                  <Input
                    type="text"
                    name="nombre"
                    placeholder="Ej. Mesa plegable"
                    defaultValue={data.nombre}
                    required
                  />
                </div>

                {/* Categoría */}
                <div>
                  <Label>Categoría</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      name="categoria_id" // Usar el nombre de la columna FK
                      options={options.categorias}
                      placeholder="Selecciona una categoría"
                      className="dark:bg-dark-900"
                      value={selectedCategoria}
                      onChange={(value) => setSelectedCategoria(value)}
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

                {/* Sub Categoría */}
                <div>
                  <Label>Sub Categoría</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      name="subcategoria_id" // Usar el nombre de la columna FK
                      options={options.subcategorias}
                      placeholder="Selecciona una subcategoría"
                      className="dark:bg-dark-900"
                      value={selectedSubCategoria}
                      onChange={(value) => setSelectedSubCategoria(value)}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        setCurrentType("subcategorias"); // Corregido a 'subcategorias'
                        setMiniModalOpen(true);
                      }}
                    >
                      +
                    </Button>
                  </div>
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
                  </div>
                </div>

                {/* Espacio */}
                <div>
                  <Label>Espacio</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      name="espacio_id" // Usar el nombre de la columna FK
                      options={options.espacios}
                      placeholder="Ej. Oficina 3"
                      value={selectedEspacio}
                      onChange={(value) => setSelectedEspacio(value)}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        setCurrentType("espacios"); // Corregido a 'espacios'
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

                {/* Fecha Adquisición */}
                <div>
                  <Label>Fecha de Adquisición</Label>
                  <Input
                    type="date"
                    name="fecha_adquisicion"
                    defaultValue={data.fecha_adquisicion}
                    required
                  />
                </div>

                {/* Valor */}
                <div>
                  <Label>Valor</Label>
                  <Input
                    type="number"
                    name="valor"
                    placeholder="Ej. 250.00"
                    min="0"
                    defaultValue={data.valor}
                    required
                  />
                </div>

                {/* Proveedor */}
                <div>
                  <Label>Proveedor</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      name="proveedor_id" // Usar el nombre de la columna FK
                      options={options.proveedores}
                      placeholder="Selecciona un proveedor"
                      className="dark:bg-dark-900"
                      value={selectedProveedor}
                      onChange={(value) => setSelectedProveedor(value)}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        setCurrentType("proveedores"); // Corregido a 'proveedores'
                        setMiniModalOpen(true);
                      }}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Disponibilidad */}
                <div>
                  <Label>Disponibilidad</Label>
                  <Select
                    name="disponibilidad"
                    options={opcionesDisponibilidad}
                    placeholder="Selecciona la disponibilidad"
                    className="dark:bg-dark-900"
                    // Asegúrate de que defaultValue maneje booleanos correctamente
                    defaultValue={data.disponibilidad ? "true" : "false"}
                    onChange={(value) =>
                      console.log("Disponibilidad seleccionada:", value)
                    } // Puedes añadir lógica si necesitas controlar este estado
                  />
                </div>

                {/* Estado Físico */}
                <div>
                  <Label>Estado Físico</Label>
                  <Select
                    name="estado" // Usar el nombre de la columna real en la BD
                    options={opcionesEstado}
                    placeholder="Selecciona el estado físico"
                    className="dark:bg-dark-900"
                    defaultValue={data.estado}
                    onChange={(value) =>
                      console.log("Estado físico seleccionado:", value)
                    } // Puedes añadir lógica si necesitas controlar este estado
                  />
                </div>

                {/* Observaciones */}
                <div className="lg:col-span-2">
                  <Label>Observaciones</Label>
                  <textarea
                    name="observaciones"
                    className="w-full p-2 border rounded-lg dark:bg-dark-900 dark:text-white"
                    placeholder="Notas adicionales..."
                    defaultValue={data.observaciones}
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

      {/* Mini modal para agregar nuevas opciones (categorías, proveedores, etc.) */}
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
