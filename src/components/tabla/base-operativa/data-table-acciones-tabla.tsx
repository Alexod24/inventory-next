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
  marcas: Option[];
  colores: Option[];
  materiales: Option[];
  proveedores: Option[];
  estados: Option[];
}

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  refreshData: (triggeredBy?: string) => Promise<void>;
  // Nueva prop para refrescar datos
}
interface MarcaOption {
  value: string;
  label: string;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const options = {
  marcas: [
    { value: "marca1", label: "Marca 1" },
    { value: "marca2", label: "Marca 2" },
  ] as MarcaOption[],
};

const opcionesEstado = [
  { value: "bueno", label: "Bueno" },
  { value: "dañado", label: "Dañado" },
  { value: "roto", label: "Roto" },
];

const opcionesDisponibilidad = [
  { value: "ok", label: "OK" },
  { value: "pendiente", label: "Pendiente" },
  { value: "faltante", label: "Faltante" },
];

export function DataTableRowActions<TData>({
  row,
  refreshData,
}: DataTableRowActionsProps<TData>) {
  const data: any = row.original;
  const { isOpen, openModal, closeModal } = useModal();

  const [options, setOptions] = useState<OptionsState>({
    marcas: [],
    colores: [],
    materiales: [],
    proveedores: [],
    estados: [],
  });

  const [isMiniModalOpen, setMiniModalOpen] = useState(false);
  const [currentType, setCurrentType] = useState<string | null>(null);
  const [newValue, setNewValue] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedProveedor, setSelectedProveedor] = useState<
    string | undefined
  >(data.proveedor || undefined);
  const [selectedMarca, setSelectedMarca] = useState<string | undefined>(
    data.marca || undefined
  );
  const [selectedMaterial, setSelectedMaterial] = useState<string | undefined>(
    data.material || undefined
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    data.color || undefined
  );

  useEffect(() => {
    if (isEditModalOpen) {
      if (options.proveedores.length > 0) {
        setSelectedProveedor(
          options.proveedores.find((opt) => opt.value === data.proveedor)?.value
        );
      }
      if (options.marcas.length > 0) {
        setSelectedMarca(
          options.marcas.find((opt) => opt.value === data.marca)?.value
        );
      }
      if (options.materiales.length > 0) {
        setSelectedMaterial(
          options.materiales.find((opt) => opt.value === data.material)?.value
        );
      }
      if (options.colores.length > 0) {
        setSelectedColor(
          options.colores.find((opt) => opt.value === data.color)?.value
        );
      }
      // Repite para otros selects si los tienes (colores, materiales, estados, etc.)
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
      const types = ["marcas", "colores", "materiales", "proveedores"];
      const promises = types.map(async (type) => {
        const { data, error } = await supabase.from(type).select("nombre");
        if (error) throw error;
        return {
          [type]: data.map((item) => ({
            value: item.nombre,
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
        .from("base_operativa")
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
      descripcion: formData.get("descripcion")?.toString() || "",
      tamano: formData.get("tamano")?.toString() || "",
      cantidad: Number(formData.get("cantidad")) || 0,
      valor: Number(formData.get("valor")) || 0,
      proveedor: selectedProveedor || "",
      marca: selectedMarca || "",
      material: selectedMaterial || "",
      color: selectedColor || "",
      estado: formData.get("estado")?.toString() || "bueno", // default si es obligatorio
      disponibilidad: formData.get("disponibilidad")?.toString() || "ok", // default
    };

    // Validación básica
    if (
      !updatedData.descripcion ||
      !updatedData.cantidad ||
      !updatedData.valor ||
      !updatedData.proveedor
    ) {
      console.error("Campos obligatorios faltantes.");
      return;
    }

    try {
      const { error } = await supabase
        .from("base_operativa")
        .update(updatedData)
        .eq("id", id);

      if (error) throw error;

      // Refrescar datos de la tabla
      await refreshData();

      // Cerrar modal
      closeModal();
    } catch (err) {
      console.error("Error al editar el producto:", err);
      alert("Hubo un error al guardar los cambios. Inténtalo de nuevo.");
    }
  };

  const handleCreateOption = async (e: FormEvent) => {
    e.preventDefault();

    if (!newValue.trim() || !currentType) return;

    try {
      const { error } = await supabase
        .from(currentType)
        .insert([{ nombre: newValue }]);
      if (error) throw error;

      await fetchOptions(); // Actualiza las opciones dinámicamente
      setMiniModalOpen(false);
      setNewValue("");
      setCurrentType(null);
    } catch (err) {
      console.error(`Error al crear ${currentType}:`, err);
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
              Crear Producto
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Llena los campos para registrar un nuevo producto.
            </p>
          </div>
          <form
            className="flex flex-col"
            onSubmit={(e) => handleEdit(e, data.id)}
          >
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="lg:col-span-2">
                  <Label>Descripción</Label>
                  <Input
                    type="text"
                    name="descripcion"
                    placeholder="Ej. Caja de herramientas"
                    defaultValue={data.descripcion}
                  />
                </div>
                <div>
                  <Label>Proveedor</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      value={selectedProveedor} // Valor actual
                      onChange={(selectedOption) =>
                        setSelectedProveedor(selectedOption)
                      }
                      options={options.proveedores} // Opciones dinámicas
                    />

                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Evita la propagación del evento.
                        setCurrentType("proveedores");
                        setMiniModalOpen(true);
                      }}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Marca</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      value={selectedMarca} // Valor actual
                      onChange={(selectedOption) =>
                        setSelectedMarca(selectedOption)
                      }
                      options={options.marcas} // Opciones dinámicas
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        setCurrentType("marcas");
                        setMiniModalOpen(true);
                      }}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Tamaño</Label>
                  <Input
                    type="text"
                    name="tamano"
                    placeholder="Ej. Grande"
                    defaultValue={data.tamano}
                  />
                </div>

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

                <div>
                  <Label>Material</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      value={selectedMaterial} // Valor actual
                      onChange={(selectedOption) =>
                        setSelectedMaterial(selectedOption)
                      }
                      options={options.materiales} // Opciones dinámicas
                    />

                    <Button
                      size="sm"
                      onClick={() => {
                        setCurrentType("materiales");
                        setMiniModalOpen(true);
                      }}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Color</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      value={selectedColor} // Valor actual
                      onChange={(selectedOption) =>
                        setSelectedColor(selectedOption)
                      }
                      options={options.colores} // Opciones dinámicas
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

                <div>
                  <Label>Fecha</Label>
                  <Input
                    type="date"
                    name="fecha"
                    disabled
                    defaultValue={data.fecha}
                  />
                </div>

                <div>
                  <Label>Valor</Label>
                  <Input
                    type="number"
                    name="valor"
                    placeholder="Ej. 250.00"
                    defaultValue={data.valor}
                  />
                </div>

                <div>
                  <Label>Estado</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      name="estado"
                      options={opcionesEstado}
                      placeholder="Selecciona el estado"
                      onChange={(selectedOpciones) =>
                        console.log("Estado seleccionado:", selectedOpciones)
                      }
                      className="dark:bg-dark-900"
                      defaultValue={data.estado}
                    />
                  </div>
                </div>

                <div>
                  <Label>Disponibilidad</Label>
                  <Select
                    name="disponibilidad"
                    options={opcionesDisponibilidad}
                    placeholder="Selecciona la disponibilidad"
                    onChange={(selectedOpciones) =>
                      console.log("Estado seleccionado:", selectedOpciones)
                    }
                    className="dark:bg-dark-900"
                    defaultValue={data.disponibilidad}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>

              <Button size="sm" type="submit">
                Editar Registro
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* ------------------------------------------------------------------------------------- */}

      {isMiniModalOpen && currentType && (
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
      )}
    </>
  );
}
