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

type Crear = {
  producto: string;
  espacio: string;
  movimiento: string;
  operacion: string;
  cantidad: number;
  descripcion: string;
  fecha: string;
  usuario: string;
};

const opcionesMovimiento = [
  { value: "bueno", label: "Bueno" },
  { value: "dañado", label: "Dañado" },
  { value: "roto", label: "Roto" },
];

const opcionesOperacion = [
  { value: "ok", label: "Ok" },
  { value: "faltante", label: "Faltante" },
  { value: "pendiente", label: "Pendiente" },
  // { value: "reparacion", label: "Reparación" },
  // { value: "baja", label: "Baja" },
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
  const [items, setItems] = useState<Crear[]>([]);
  const [options, setOptions] = useState({
    producto: [],
    espacio: [],
  });

  const [isMiniModalOpen, setMiniModalOpen] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [currentType, setCurrentType] = useState("");
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [selectedEspacio, setSelectedEspacio] = useState(null);
  const [selectedMovimiento, setSelectedMovimiento] = useState(null);
  const [selectedOperacion, setSelectedOperacion] = useState(null);

  const loadData = async () => {
    const { data, error } = await supabase
      .from("movimientos_inventario")
      .select("*");
    if (!error) setItems(data || []);
    else console.error(error);
    console.log(items);
  };

  useEffect(() => {
    loadData();
  }, []);

  // -----------------------------------------------------------------------------------------------

  const fetchOptions = async () => {
    // Define las tablas y sus respectivos campos
    const types = [
      { table: "base_operativa", field: "descripcion" }, // Para productos
      { table: "espacios", field: "nombre" }, // Para espacios
    ];

    // Realiza consultas a cada tabla
    const promises = types.map(async ({ table, field }) => {
      const { data, error } = await supabase.from(table).select(field);
      if (error) {
        console.error(`Error al cargar ${table}:`, error);
        return { producto: [], espacio: [] };
      }
      return {
        [table === "base_operativa" ? "producto" : "espacio"]: data.map(
          (item) => ({
            value: item[field],
            label: item[field],
          })
        ),
      };
    });

    // Espera a que todas las consultas se completen
    const results = await Promise.all(promises);

    // Combina los resultados y actualiza el estado
    setOptions(Object.assign({}, ...results));
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  // -----------------------------------------------------------------------------------------------

  const handleCreate = async (e: FormEvent) => {
    if (
      !selectedProducto ||
      !selectedEspacio ||
      !selectedMovimiento ||
      !selectedOperacion
    ) {
      alert("¡Completa todos los campos obligatorios! 🛑");
      console.error("ERROR: Algún campo select no está seleccionado.");
      return;
    }
    e.preventDefault();

    console.log("selectedProducto:", selectedProducto);

    if (!selectedProducto || !selectedProducto.value) {
      alert("Selecciona un producto antes de enviar.");
      return;
    }

    // Captura todo lo que envía el form
    const formData = new FormData(e.target as HTMLFormElement);

    // Para debug: lista todas las keys y valores recibidos
    console.log("Datos recibidos del form:");
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }

    // Extraer valores normales (inputs)
    const descripcion = formData.get("descripcion")?.toString() || "";
    const cantidadStr = formData.get("cantidad")?.toString() || "0";
    const usuario = formData.get("usuario")?.toString() || "";
    const fechaInput = formData.get("fecha")?.toString() || "";

    // Convertir cantidad a número
    const cantidad = Number(cantidadStr);
    if (isNaN(cantidad) || cantidad < 1) {
      console.warn("Cantidad inválida:", cantidadStr);
    }

    // Convertir fecha
    const fecha = fechaInput
      ? new Date(fechaInput).toISOString()
      : new Date().toISOString();

    // Revisar selects que no vienen en formData (porque react-select no usa inputs nativos)
    console.log("Valores seleccionados (de estado o variables):");
    console.log("Producto:", selectedProducto);
    console.log("Espacio:", selectedEspacio);
    console.log("Movimiento:", selectedMovimiento);
    console.log("Operacion:", selectedOperacion);

    if (
      !selectedProducto ||
      !selectedEspacio ||
      !selectedMovimiento ||
      !selectedOperacion
    ) {
      console.error("ERROR: Algún campo select no está seleccionado.");
      return;
    }

    // Armar objeto para insertar
    const productData: Crear = {
      producto: selectedProducto.value,
      espacio: selectedEspacio.value,
      movimiento: selectedMovimiento.value,
      operacion: selectedOperacion.value,
      cantidad,
      descripcion,
      fecha,
      usuario,
    };

    console.log("Objeto final a insertar:", productData);

    try {
      const { data, error } = await supabase
        .from("movimientos_inventario")
        .insert([productData])
        .select("*");

      if (error) {
        console.error(
          "Error al insertar movimiento (detallado):",
          JSON.stringify(error, null, 2)
        );
        return;
      }

      console.log("Registro insertado con éxito:", data);

      setItems((prev) => [...prev, ...data]);
      closeModal();
      await fetchData();
    } catch (err) {
      console.error("Error en try-catch al crear producto:", err);
    }
  };

  const handleCreateOption = async (e: FormEvent) => {
    e.preventDefault();
    if (!newValue.trim() || !currentType) return;

    try {
      const columnName =
        currentType === "base_operativa" ? "descripcion" : "nombre";

      const { error } = await supabase
        .from(currentType)
        .insert([{ [columnName]: newValue }]);
      if (error) throw error;

      await fetchOptions();
      setMiniModalOpen(false);
      setNewValue("");
      setCurrentType("");
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
              Crear Registro
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Llena los campos para crear el registro.
            </p>
          </div>
          <form className="flex flex-col" onSubmit={handleCreate}>
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="lg:col-span-2">
                  <Label>Producto</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      name="producto"
                      options={options.producto}
                      placeholder="Selecciona un proveedor"
                      value={selectedProducto || ""}
                      onChange={(option) => setSelectedProducto(option)}
                      className="dark:bg-dark-900"
                    />
                  </div>
                </div>
                <div>
                  <Label>Espacio</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      name="espacio"
                      options={options.espacio}
                      placeholder="Selecciona un Espacio"
                      value={selectedEspacio || ""}
                      onChange={setSelectedEspacio}
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
                  <Label>Movimiento</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      name="movimiento"
                      options={opcionesMovimiento}
                      placeholder="Selecciona una marca"
                      value={selectedMovimiento || ""}
                      onChange={setSelectedMovimiento}
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
                  <Label>Operacion</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      name="operacion"
                      options={opcionesOperacion}
                      placeholder="Selecciona una operacion"
                      value={selectedOperacion || ""}
                      onChange={setSelectedOperacion}
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
                  <Label>Cantidad</Label>
                  <Input
                    type="number"
                    name="cantidad"
                    min="1"
                    placeholder="Ej. 10"
                  />
                </div>
                <div className="lg:col-span-2">
                  <Label>Descripción</Label>
                  <Input
                    type="text"
                    name="descripcion"
                    placeholder="Ej. Caja de herramientas"
                  />
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
                  <Label>Usuario</Label>
                  <Input type="text" name="usuario" placeholder="Ej. Dania" />
                </div>
              </div>
            </div>

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
