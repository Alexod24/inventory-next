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

const opcionesEstado = [
  { value: "bueno", label: "Bueno" },
  { value: "dañado", label: "Dañado" },
  { value: "roto", label: "Roto" },
];

const opcionesDisponibilidad = [
  { value: true, label: "Disponible" },
  { value: false, label: "No disponible" },
];

// -----------------------------------------------------------------------------------------

export function DataTableRowActions<TData>({
  row,
  refreshData,
}: DataTableRowActionsProps<TData>) {
  const data: any = row.original;
  const { isOpen, openModal, closeModal } = useModal();

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

  const [selectedProveedor, setSelectedProveedor] = useState<
    string | undefined
  >(data.proveedor || undefined);

  const [selectedCategoria, setSelectedCategoria] = useState<
    string | undefined
  >(data.categoria || undefined);

  const [selectedSubCategoria, setSelectedSubCategoria] = useState<
    string | undefined
  >(data.subcategoria || undefined);

  const [selectedEspacio, setSelectedEspacio] = useState<string | undefined>(
    data.espacio || undefined
  );

  const [selectedUsuario, setSelectedUsuario] = useState<string | undefined>(
    data.usuario || undefined
  );

  // Manejadores onChange

  const handleSubCategoriaChange = (selectedOption: Option | null) => {
    setSelectedSubCategoria(selectedOption?.value || undefined);
  };

  const handleProveedorChange = (selectedOption: Option | null) => {
    setSelectedProveedor(selectedOption?.value || undefined);
  };

  const handleEspacioChange = (selectedOption: Option | null) => {
    setSelectedEspacio(selectedOption?.value || undefined);
  };

  const handleUsuarioChange = (selectedOption: Option | null) => {
    setSelectedUsuario(selectedOption?.value || undefined);
  };

  // -----------------------------------------------------------------------------------------

  useEffect(() => {
    if (isEditModalOpen) {
      // Asegurar que las opciones estén cargadas antes de buscar valores
      if (options.proveedores?.length > 0) {
        const proveedor = options.proveedores.find(
          (opt) => opt.label === data.proveedor
        );
        setSelectedProveedor(proveedor?.value || data.proveedor_id);
      } else {
        setSelectedProveedor(data.proveedor_id); // Fallback si las opciones no están listas
      }

      if (options.categorias?.length > 0) {
        const categoria = options.categorias.find(
          (opt) => opt.label === data.categoria
        );
        setSelectedCategoria(categoria?.value || data.categoria_id);
      } else {
        setSelectedCategoria(data.categoria_id);
      }

      if (options.subcategorias?.length > 0) {
        const subcategoria = options.subcategorias.find(
          (opt) => opt.label === data.subcategoria
        );
        setSelectedSubCategoria(subcategoria?.value || data.subcategoria_id);
      } else {
        setSelectedSubCategoria(data.subcategoria_id);
      }

      if (options.espacios?.length > 0) {
        const espacio = options.espacios.find(
          (opt) => opt.label === data.espacio
        );
        setSelectedEspacio(espacio?.value || data.espacio_id);
      } else {
        setSelectedEspacio(data.espacio_id);
      }

      if (options.usuarios?.length > 0) {
        const usuario = options.usuarios.find(
          (opt) => opt.label === data.usuario
        );
        setSelectedUsuario(usuario?.value || data.usuario_id);
      } else {
        setSelectedUsuario(data.usuario_id);
      }
    }
  }, [options, data, isEditModalOpen]);

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
        if (error) throw error;
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
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  // -----------------------------------------------------------------------------------------
  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("bienes")
        .delete()
        .eq("id", data.id);
      if (error) throw error;
      await refreshData("delete");
    } catch (err) {
      toast.error("Error al eliminar el registro");
      console.error("Error eliminando el registro:", err);
    }
  };
  // -----------------------------------------------------------------------------------------

  const handleEdit = async (e: FormEvent<HTMLFormElement>, id: string) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);

    const updatedData = {
      nombre: formData.get("nombre")?.toString() || data.nombre,
      cantidad: Number(formData.get("cantidad")) || data.cantidad,
      valor: Number(formData.get("valor")) || data.valor,
      estado: formData.get("estado")?.toString() || data.estado,
      disponibilidad: formData.get("disponibilidad") === "true",
      proveedor_id: selectedProveedor || data.proveedor_id,
      espacio_id: selectedEspacio || data.espacio_id,
      usuario_id: selectedUsuario || data.usuario_id,
      subcategoria_id: selectedSubCategoria || data.subcategoria_id,
      categoria_id: selectedCategoria || data.categoria_id,
      observaciones:
        formData.get("observaciones")?.toString() || data.observaciones,
      fecha_adquisicion:
        formData.get("fecha_adquisicion")?.toString() || data.fecha_adquisicion,
    };

    try {
      const { error } = await supabase
        .from("bienes")
        .update(updatedData)
        .eq("id", id);

      if (error) throw error;

      await refreshData("edit");
      closeModal();
    } catch (err) {}
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
                  />
                </div>

                {/* Nombre */}
                <div>
                  <Label>Nombre</Label>

                  {/* Input toma todo el espacio restante */}
                  <Input
                    type="text"
                    name="nombre"
                    placeholder="Ej. Mesa plegable"
                    defaultValue={data.nombre}
                  />
                </div>

                {/* Categoría */}
                <div>
                  <Label>Categoría</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      type="text"
                      name="categoria"
                      options={options.categorias}
                      placeholder="Selecciona una categoría"
                      className="dark:bg-dark-900"
                      value={options.categorias.find(
                        (opt) => opt.value === selectedCategoria
                      )}
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
                      type="text"
                      name="subcategoria"
                      options={options.subcategorias}
                      placeholder="Selecciona una subcategoría"
                      className="dark:bg-dark-900"
                      defaultValue={data.subcategoria}
                      value={options.subcategorias.find(
                        (opt) => opt.value === selectedSubCategoria
                      )}
                      onChange={(value) => setSelectedSubCategoria(value)}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        setCurrentType("subcategoria");
                        setMiniModalOpen(true);
                      }}
                    >
                      +
                    </Button>
                  </div>
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
                      value={options.usuarios.find(
                        (opt) => opt.value === selectedUsuario
                      )}
                      onChange={(value) => setSelectedUsuario(value)}
                    />
                  </div>
                </div>

                {/* Espacio */}
                <div>
                  <Label>Espacio</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      type="text"
                      name="espacio"
                      options={options.espacios}
                      placeholder="Ej. Oficina 3"
                      defaultValue={data.espacio}
                      value={options.espacios.find(
                        (opt) => opt.value === selectedEspacio
                      )}
                      onChange={(value) => setSelectedEspacio(value)}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        setCurrentType("colores");
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

                {/* Fecha Adquisición */}
                <div>
                  <Label>Fecha de Adquisición</Label>
                  <Input
                    type="date"
                    name="fecha_adquisicion"
                    defaultValue={data.fecha_adquisicion || ""}
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
                    step="0.01"
                    defaultValue={data.valor}
                  />
                </div>

                {/* Proveedor */}
                <div>
                  <Label>Proveedor</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      type="text"
                      name="proveedor_id"
                      options={options.proveedores}
                      placeholder="Selecciona un proveedor"
                      className="dark:bg-dark-900"
                      defaultValue={data.proveedor}
                      value={options.proveedores.find(
                        (opt) => opt.value === selectedProveedor
                      )}
                      onChange={(value) => setSelectedProveedor(value)}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        setCurrentType("colores");
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
                    defaultValue={data.disponibilidad}
                  />
                </div>

                {/* Estado Físico */}
                <div>
                  <Label>Estado Físico</Label>
                  <Select
                    name="estadoFisico"
                    options={opcionesEstado}
                    placeholder="Selecciona el estado físico"
                    className="dark:bg-dark-900"
                    defaultValue={data.estado}
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

                {/* Fecha de Creación */}
                <div>
                  <Label>Fecha de Creación</Label>
                  <Input
                    type="date"
                    name="fechaCreacion"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    disabled
                  />
                </div>

                {/* Fecha de Actualización */}
                <div>
                  <Label>Fecha de Actualización</Label>
                  <Input
                    type="date"
                    name="fechaActualizacion"
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

      {/* ------------------------------------------------------------------------------------- */}

      {/* {isMiniModalOpen && currentType && (
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
              {currentType.charAt(0).toUpperCase() + currentType.slice(1, -1)}
            </h4>
            <form onSubmit={handleCreateOption}>
              <Label>Nombre del {currentType.slice(0, -1)}</Label>
              <Input
                type="text"
                name="newValue"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder={`Ej. Nombre de ${currentType.slice(0, -1)}`}
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
        </Modal>
      )} */}
    </>
  );
}
