// eslint-disable @typescript-eslint/no-unused-vars
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

type Movimiento = {
  bien_id?: { id: number; nombre: string };
  cantidad: number;
  tipo_movimiento: boolean;
  fecha?: string;
  motivo?: string;
  usuario_id: { id: number; nombre: string };
};
const opcionesTipo = [
  { value: true, label: "Ingreso" },
  { value: false, label: "Salida" },
];

const options = {
  bienes: [],
  usuarios: [],
};

// Función para validar si una fecha es válida
const isValidDate = (date: string): boolean => {
  return !isNaN(new Date(date).getTime());
};

// ---------------------------------------------------------------------------------------------
interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
  fetchData: () => Promise<void>;
}
// ---------------------------------------------------------------------------------------------
export function DataTableViewOptions<TData>({
  table,
  fetchData,
}: DataTableViewOptionsProps<TData>) {
  const { isOpen, openModal, closeModal } = useModal();
  const [items, setItems] = useState<Movimiento[]>([]);
  const [options, setOptions] = useState({
    bienes: [] as { value: number; label: string }[],
    usuarios: [] as { value: number; label: string }[],
  });
  const [isMiniModalOpen, setMiniModalOpen] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [currentType, setCurrentType] = useState<string | null>(null);
  const [tipoMovimiento, setTipoMovimiento] = useState("");
  const [usuarioSeleccionada, setUsuarioSeleccionada] = useState("");
  const [bienSeleccionado, setBienSeleccionado] = useState("");

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const tables = ["bienes", "usuarios"];
        const results = await Promise.all(
          tables.map(async (table) => {
            const { data, error } = await supabase
              .from(table)
              .select("id, nombre");
            if (error) {
              console.error(`Error al cargar ${table}:`, error);
              return { [table]: [] };
            }
            return {
              [table]: data.map((item) => ({
                value: item.id,
                label: item.nombre,
              })),
            };
          })
        );
        setOptions(Object.assign({}, ...results));
      } catch (err) {
        console.error("Error al obtener opciones:", err);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data, error } = await supabase.from("movimientos").select(`
          id,
          bien_id,
          cantidad,
          tipo_movimiento,
          fecha,
          motivo,
          bienes (
            nombre
          ),
          usuarios:usuario_id (id, nombre)
        `);
        if (error) {
          console.error("Error cargando datos:", error);
        } else {
          setItems(data || []);
        }
      } catch (err) {
        console.error("Error al cargar datos:", err);
      }
    };

    loadData();
  }, []);
  // -----------------------------------------------------------------------------------------------
  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = {
      bien_id: parseInt(form.bien.value, 10), // Cambiar "bien" por "bien_id"
      cantidad: parseInt(form.cantidad.value, 10),
      tipo: form.tipo.value === "true",
      observaciones: form.observaciones?.value || null,
      usuario_id: parseInt(form.usuario_id.value, 10),
    };

    if (
      !data.bien ||
      !data.cantidad ||
      data.tipo === null ||
      !data.usuario_id
    ) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    try {
      const { data: insertData, error } = await supabase
        .from("movimientos")
        .insert([data]);
      if (error) {
        console.error("Error al insertar datos:", error.message);
        alert("Hubo un error al crear el registro.");
      } else {
        console.log("Registro creado:", insertData);
        alert("Registro creado con éxito.");
        closeModal();
        fetchData();
      }
    } catch (err) {
      console.error("Error al crear registro:", err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value) console.log(value.toString());
  };

  const handleCreateOption = async (e: FormEvent) => {
    e.preventDefault();
    if (!newValue.trim() || !currentType) return;

    try {
      const { error } = await supabase
        .from(currentType)
        .insert([{ nombre: newValue }]);
      if (error) throw error;

      setNewValue("");
      setCurrentType(null);
      setMiniModalOpen(false);
      await fetchOptions();
    } catch (err) {
      console.error(`Error al crear ${currentType}:`, err);
    }
  };
  // -----------------------------------------------------------------------------------------------

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
              Crear Registro
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Completa los campos para registrar un nuevo bien interno.
            </p>
          </div>
          <form className="flex flex-col" onSubmit={handleCreate}>
            {/* Contenedor para las columnas */}
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                {/* Categoría */}
                <div>
                  <Label>Nombre del bien</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      name="bien"
                      value={bienSeleccionado}
                      options={options.bienes}
                      placeholder="Selecciona un bien"
                      className="dark:bg-dark-900"
                      onChange={(e) => setBienSeleccionado(e.target.value)} // Asegúrate de que 'value' existe
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
                  />
                </div>

                {/* Disponibilidad */}
                <div>
                  <Label>Tipo de Movimiento</Label>
                  <Select
                    name="tipo"
                    options={opcionesTipo}
                    value={tipoMovimiento}
                    onChange={(e) => setTipoMovimiento(e.target.value)}
                    placeholder="Selecciona el movimiento"
                    className="dark:bg-dark-900"
                    required
                  />
                </div>

                {/* Fecha de Creación */}
                <div>
                  <Label>Fecha de Creación</Label>
                  <Input type="date" name="fecha" className="!bg-gray-200 " />
                </div>

                {/* Observaciones */}
                <div className="lg:col-span-2">
                  <Label>Observaciones</Label>
                  <textarea
                    name="observaciones"
                    rows="3"
                    className="w-full p-2 border rounded-lg dark:bg-dark-900 dark:text-white"
                    placeholder="Notas adicionales..."
                  ></textarea>
                </div>

                {/* Responsable */}
                <div>
                  <Label>Responsable</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      type="text"
                      id="usuario"
                      name="usuario_id"
                      value={usuarioSeleccionada}
                      options={options.usuarios}
                      placeholder="Ej. Juan Pérez"
                      onChange={(e) => setUsuarioSeleccionada(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button size="sm" type="submit">
                Crear Registro
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

<Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
  <div
    className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11"
    style={{ maxHeight: "100vh" }}
  >
    <div className="px-2 pr-14">
      <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
        Crear Registro
      </h4>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
        Completa los campos para registrar un nuevo bien interno.
      </p>
    </div>
    <form className="flex flex-col" onSubmit={handleCreate}>
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
                onChange={(selectedOption) =>
                  setBienSeleccionada(selectedOption?.value.toString() || "")
                }
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
              required
            />
          </div>

          {/* Sub Categoría */}
          <div>
            <Label>Responsable</Label>
            <div className="flex items-center space-x-2">
              <Select
                name="usuario"
                options={options.usuarios}
                placeholder="Selecciona una subcategoría"
                className="dark:bg-dark-900"
                onChange={(selectedOption) =>
                  setUsuarioSeleccionada(selectedOption?.value.toString() || "")
                }
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
            <Label>Tipo de movimiento</Label>
            <Select
              name="tipo"
              options={opcionesMovimiento}
              placeholder="Selecciona la disponibilidad"
              className="dark:bg-dark-900"
              required
            />
          </div>

          {/* Observaciones */}
          <div className="lg:col-span-2">
            <Label>Motivos</Label>
            <textarea
              name="motivo"
              rows="3"
              className="w-full p-2 border rounded-lg dark:bg-dark-900 dark:text-white"
              placeholder="Notas adicionales..."
            ></textarea>
          </div>

          {/* Fecha de Creación */}
          <div>
            <Label>Fecha de Creación</Label>
            <Input
              type="date"
              name="fecha"
              defaultValue={new Date().toISOString().split("T")[0]}
              className="!bg-gray-200 cursor-not-allowed"
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
          Crear Registro
        </Button>
      </div>
    </form>
  </div>
</Modal>;
