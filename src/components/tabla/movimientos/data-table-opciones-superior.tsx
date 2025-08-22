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
import { exportarToPDF } from "./exportar";
import { useState, useEffect, FormEvent } from "react";
import { Modal } from "../../ui/modal";
import { useModal } from "../../../hooks/useModal";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { MixerHorizontalIcon, PlusIcon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

type Bienes = {
  bien_id?: { nombre: string };
  cantidad: number;
  tipo_movimiento: boolean;
  fecha?: string;
  motivo?: string;
  usuario_id: { nombre: string };
};

const opcionesMovimiento = [
  { value: "Ingreso", label: "Ingreso" },
  { value: "Salida", label: "Salida" },
];

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
  const [items, setItems] = useState<Bienes[]>([]);
  const [options, setOptions] = useState({
    bienes: [] as { value: number; label: string }[],
    usuarios: [] as { value: number; label: string }[],
  });
  const [isMiniModalOpen, setMiniModalOpen] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [currentType, setCurrentType] = useState<string | null>(null);
  const [codigo, setCodigo] = useState("");
  const [bienSeleccionada, setBienSeleccionada] = useState<string | null>(null);
  const [usuarioSeleccionada, setUsuarioSeleccionada] = useState("");
  const [TipoMovimiento, setTipoMovimiento] = useState("");
  const [nombreBien, setNombreBien] = useState("");
  const [fechaPredeterminada, setFechaPredeterminada] = useState(
    new Date().toISOString().split("T")[0] // Fecha actual en formato "YYYY-MM-DD"
  );
  // -----------------------------------------------------------------------------------------------

  // -----------------------------------------------------------------------------------------------
  const loadData = async () => {
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
    usuarios (
          nombre
        ),
  `);

    if (error || !Array.isArray(data)) {
      console.error("Error cargando datos:", error);
      setItems([]);
      return;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {}, [items]);

  // -----------------------------------------------------------------------------------------------

  const fetchOptions = async () => {
    const tables = ["bienes", "usuarios"];
    const promises = tables.map(async (table) => {
      const { data, error } = await supabase.from(table).select("id, nombre");
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
    });

    const results = await Promise.all(promises);
    setOptions(Object.assign({}, ...results));
  };

  // Llama a la función en el useEffect
  useEffect(() => {
    fetchOptions();
  }, []);
  // -----------------------------------------------------------------------------------------------
  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);

    // Captura y valida los datos del formulario
    const bien_id = parseInt(formData.get("bien_id") as string, 10);
    const usuario_id = formData.get("usuario_id") as string; // UUID válido o null
    const cantidad = parseInt(formData.get("cantidad") as string, 10);
    const tipo_movimiento = formData.get("tipo_movimiento") as string; // "Ingreso" o "Salida"
    const fecha = formData.get("fecha") as string;
    const motivo = formData.get("motivo") as string;

    // Validaciones
    if (isNaN(bien_id) || bien_id <= 0) {
      console.error("Error: ID de bien inválido.");
      return;
    }

    if (usuario_id && !/^[0-9a-fA-F-]{36}$/.test(usuario_id)) {
      console.error("Error: ID de usuario no es un UUID válido.");
      return;
    }

    if (isNaN(cantidad) || cantidad <= 0) {
      console.error("Error: Cantidad inválida.");
      return;
    }

    if (!["Ingreso", "Salida"].includes(tipo_movimiento)) {
      console.error("Error: Tipo de movimiento inválido.");
      return;
    }

    if (!fecha || isNaN(new Date(fecha).getTime())) {
      console.error("Error: Fecha no proporcionada o inválida.");
      return;
    }

    // Datos mapeados para la inserción
    const newMovement = {
      bien_id,
      usuario_id: usuario_id || null, // Permite `null` si no se selecciona usuario
      cantidad,
      tipo_movimiento,
      fecha: new Date(fecha).toISOString(), // Asegura el formato ISO
      motivo: motivo || null, // Permite `null` si no se proporciona motivo
    };

    console.log("Datos a insertar en movimientos:", newMovement);

    try {
      const { data, error } = await supabase
        .from("movimientos")
        .insert([newMovement]).select(`
        id,
        bien_id,
        cantidad,
        tipo_movimiento,
        fecha,
        motivo,
        usuario_id,
        bienes ( nombre ),
        usuarios ( nombre )
      `);

      if (error) throw error;

      console.log("Movimiento creado:", data);

      // Actualiza la lista de elementos
      setItems((prev) => [...prev, ...(data || [])]);
      closeModal();
      await fetchData();
    } catch (err) {
      console.error("Error al crear movimiento:", err);
    }
  };

  const handleCreateOption = async (e: FormEvent) => {
    e.preventDefault();

    if (!newValue.trim() || !currentType) {
      console.error("Error: El valor o tipo actual es inválido.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from(currentType)
        .insert([{ nombre: newValue.trim() }])
        .select("id, nombre");

      if (error) throw error;

      console.log(`Nuevo ${currentType} creado:`, data);

      // Actualiza las opciones
      await fetchOptions();
      setMiniModalOpen(false);
      setNewValue("");
      setCurrentType("");
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
                  <Label>Nombre</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      name="bien_id"
                      options={options.bienes}
                      placeholder="Selecciona el bien"
                      className="dark:bg-dark-900"
                      onChange={(selectedValue) =>
                        setBienSeleccionada(selectedValue || "")
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
                      name="usuario_id"
                      options={options.usuarios}
                      placeholder="Selecciona una subcategoría"
                      className="dark:bg-dark-900"
                      onChange={(selectedValue) =>
                        setUsuarioSeleccionada(selectedValue || "")
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
                    name="tipo_movimiento"
                    options={opcionesMovimiento}
                    placeholder="Selecciona la disponibilidad"
                    className="dark:bg-dark-900"
                    onChange={(selectedValue) =>
                      setTipoMovimiento(selectedValue || "")
                    }
                  />
                </div>

                {/* Observaciones */}
                <div className="lg:col-span-2">
                  <Label>Motivos</Label>
                  <textarea
                    name="motivo"
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
                    readOnly
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
