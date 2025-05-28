"use client";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { supabase } from "@/app/utils/supabase/supabase";

import Input from "../../form/input/Input";
import Label from "../../form/Label";
import Select from "../../form/Seleccionar";
import { Button } from "@/components/ui/button";
import { exportarToPDF } from "@/components/exportar/exportarPDF";
import { useState, useEffect, FormEvent } from "react";
import { Modal } from "../../ui/modal";
import { useModal } from "../../../hooks/useModal";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { MixerHorizontalIcon, PlusIcon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

type Crear = {
  descripcion: string;
  proveedor: string;
  marca: string;
  cantidad: number;
  tamano: string;
  material: string;
  fecha: string;
  valor: number;
  estado: string;
  disponibilidad: string;
};

const opcionesEstado = [
  { value: "nuevo", label: "Nuevo" },
  { value: "bueno", label: "Bueno" },
  { value: "dañado", label: "Dañado" },
  { value: "roto", label: "Roto" },
];

const opcionesDisponibilidad = [
  { value: "ok", label: "OK" },
  { value: "faltante", label: "Faltante" },
  { value: "pendiente", label: "Pendiente" },
  { value: "reparacion", label: "Reparación" },
  { value: "baja", label: "Baja" },
];

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
  fetchData: () => Promise<void>;
}

export function DataTableViewOptions<TData>({
  table,
  fetchData,
}: DataTableViewOptionsProps<TData>) {
  const { isOpen, openModal, closeModal } = useModal();
  const [items, setItems] = useState<Crear[]>([]);
  const [options, setOptions] = useState({
    marcas: [],
    colores: [],
    materiales: [],
    proveedores: [],
    estados: [],
  });
  const [isMiniModalOpen, setMiniModalOpen] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [currentType, setCurrentType] = useState("");

  const loadData = async () => {
    const { data, error } = await supabase.from("base_operativa").select("*");
    if (!error) setItems(data || []);
    else console.error(error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const fetchOptions = async () => {
    const types = ["marcas", "colores", "materiales", "proveedores", "estados"];
    const promises = types.map(async (type) => {
      const { data, error } = await supabase.from(type).select("nombre");
      if (error) {
        console.error(`Error al cargar ${type}:`, error);
        return { [type]: [] };
      }
      return {
        [type]: data.map((item) => ({
          value: item.nombre,
          label: item.nombre,
        })),
      };
    });

    const results = await Promise.all(promises);
    setOptions(Object.assign({}, ...results));
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const productData = Object.fromEntries(formData);

    if (productData.fecha) {
      productData.fecha = new Date(productData.fecha as string).toISOString();
    }

    try {
      const { data, error } = await supabase
        .from("base_operativa")
        .insert([productData])
        .select("*");
      if (error) throw error;

      setItems((prev) => [...prev, ...data]);
      closeModal();
      await fetchData();
    } catch (err) {
      console.log("Error al crear producto:", err);
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

      await fetchOptions();
      setMiniModalOpen(false);
      setNewValue("");
      setCurrentType(null);
    } catch (err) {
      console.error(`Error al crear ${currentType}:`, err);
    }
  };

  return (
    <div className="flex space-x-2 ml-auto">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="hidden h-8 lg:flex items-center"
          >
            <MixerHorizontalIcon className="mr-2 h-4 w-4" />
            Vista
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[150px]">
          <DropdownMenuLabel>Mostrar columnas</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {table
            .getAllColumns()
            .filter(
              (column) =>
                typeof column.accessorFn !== "undefined" && column.getCanHide()
            )
            .map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        size="sm"
        className="hidden h-8 lg:flex items-center"
        onClick={() => exportarToPDF(table)}
      >
        Exportar
      </Button>

      <Button
        variant="solid"
        size="sm"
        className="hidden h-8 lg:flex items-center"
        style={{ backgroundColor: "#e9a20c", color: "white" }}
        onClick={openModal}
      >
        <PlusIcon className="mr-2 h-4 w-4" />
        Agregar
      </Button>

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
          <form className="flex flex-col" onSubmit={handleCreate}>
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="lg:col-span-2">
                  <Label>Descripción</Label>
                  <Input
                    type="text"
                    name="descripcion"
                    placeholder="Ej. Caja de herramientas"
                  />
                </div>
                <div>
                  <Label>Proveedor</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      name="proveedor"
                      options={options.proveedores}
                      placeholder="Selecciona un proveedor"
                      onChange={(selectedOption) =>
                        console.log("Producto seleccionado:", selectedOption)
                      }
                      className="dark:bg-dark-900"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
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
                      name="marca"
                      options={options.marcas}
                      placeholder="Selecciona una marca"
                      onChange={(selectedOption) =>
                        console.log("Marca seleccionado:", selectedOption)
                      }
                      className="dark:bg-dark-900 flex-1"
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
                  <Input type="text" name="tamano" placeholder="Ej. Grande" />
                </div>

                <div>
                  <Label>Cantidad</Label>
                  <Input
                    type="number"
                    name="cantidad"
                    min="1"
                    placeholder="Ej. 10"
                  />
                </div>

                <div>
                  <Label>Material</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      type="text"
                      name="material"
                      options={options.materiales}
                      placeholder="Selecciona un material"
                      onChange={(selectedOption) =>
                        console.log("Material seleccionado:", selectedOption)
                      }
                      className="dark:bg-dark-900 flex-1"
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
                      type="text"
                      name="color"
                      options={options.colores}
                      placeholder="Selecciona un color"
                      onChange={(selectedOption) =>
                        console.log("Material seleccionado:", selectedOption)
                      }
                      className="dark:bg-dark-900"
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
                    defaultValue={new Date().toISOString().split("T")[0]}
                    disabled
                  />
                </div>

                <div>
                  <Label>Valor</Label>
                  <Input type="number" name="valor" placeholder="Ej. 250.00" />
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
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        setCurrentType("estados");
                        setMiniModalOpen(true);
                      }}
                    >
                      +
                    </Button>
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
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>

              <Button size="sm" type="submit">
                Crear Producto
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
    </div>
  );
}
