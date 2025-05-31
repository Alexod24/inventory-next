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
  cantidad: number;
  descripcion: string;
  fecha: string;
  usuario: string;
};
const opcionesMovimiento = [
  { value: "aumentar", label: "Aumentar" },
  { value: "reducir", label: "Reducir" },
  { value: "neutral", label: "Neutral" },
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
  const [options, setOptions] = useState<
    Record<string, { value: string; label: string }[]>
  >({
    producto: [],
    espacio: [],
    movimiento: [],
  });

  const [newValue, setNewValue] = useState("");
  const [currentType, setCurrentType] = useState("");

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
    try {
      // Consulta para obtener valores únicos de "movimientos_inventario"
      const { data: movimientosData, error: movimientosError } = await supabase
        .from("movimientos_inventario")
        .select("movimiento");

      if (movimientosError) {
        console.error(
          "Error al cargar opciones desde movimientos_inventario:",
          movimientosError
        );
        return;
      }

      const movimientos = [
        ...new Set(movimientosData.map((item) => item.movimiento)),
      ];

      // Consulta para obtener valores únicos de "espacios"
      const { data: espaciosData, error: espaciosError } = await supabase
        .from("espacios")
        .select("nombre");
      console.log("Opciones de espacios:", options.espacio);

      if (espaciosError) {
        console.error(
          "Error al cargar opciones desde espacios:",
          espaciosError
        );

        return;
      }

      const espacios = [...new Set(espaciosData.map((item) => item.nombre))];

      // Consulta para obtener valores únicos de "espacios"
      const { data: productosData, error: productosError } = await supabase
        .from("base_operativa")
        .select("descripcion");
      console.log("Opciones de espacios:", options.producto);

      if (productosError) {
        console.error(
          "Error al cargar opciones desde espacios:",
          productosError
        );

        return;
      }

      const productos = [
        ...new Set(productosData.map((item) => item.descripcion)),
      ];

      // Actualizar opciones en el estado
      setOptions({
        producto: productos.map((item) => ({ value: item, label: item })),
        movimiento: movimientos.map((item) => ({ value: item, label: item })),

        espacio: espacios.map((item) => ({ value: item, label: item })),
      });
    } catch (err) {
      console.error("Error al cargar opciones:", err);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  // -----------------------------------------------------------------------------------------------

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const productData = Object.fromEntries(formData);

    try {
      if (
        !productData.producto ||
        !productData.cantidad ||
        !productData.movimiento
      ) {
        throw new Error("Por favor, completa todos los campos obligatorios.");
      }

      // Validar y mapear producto
      const productoSeleccionado = options.producto.find(
        (opcion) => opcion.value === productData.producto
      );

      if (!productoSeleccionado) {
        throw new Error("El producto seleccionado no es válido.");
      }
      productData.producto = productoSeleccionado.value;

      const espacioSeleccionado = options.espacio.find(
        (opcion) => opcion.value === productData.espacio
      );
      if (!espacioSeleccionado) {
        throw new Error("El espacio seleccionado no es válido.");
      }
      productData.espacio = espacioSeleccionado.value;

      if (productData.fecha) {
        productData.fecha = new Date(productData.fecha as string).toISOString();
      }

      // Crear el registro en movimientos_inventario
      console.log("Datos a insertar en movimientos_inventario:", productData);
      const { data: registroCreado, error: registroError } = await supabase
        .from("movimientos_inventario")
        .insert([productData])
        .select("*");

      if (registroError) {
        console.error(
          "Error al insertar en movimientos_inventario:",
          registroError
        );
        throw registroError;
      }

      console.log("Registro creado en movimientos_inventario:", registroCreado);

      // Lógica para actualizar la cantidad en base_operativa
      const cantidad = parseInt(productData.cantidad as string, 10);
      if (!isNaN(cantidad)) {
        let cantidadActualizar = 0;

        if (productData.movimiento === "aumentar") {
          cantidadActualizar = cantidad;
        } else if (productData.movimiento === "reducir") {
          cantidadActualizar = -cantidad;
        }

        if (cantidadActualizar !== 0) {
          console.log(
            `Actualizando cantidad en base_operativa: ${cantidadActualizar} para producto ${productData.producto}`
          );

          // Ejecutar el RPC para incrementar o reducir el stock
          const { data: rpcResult, error: rpcError } = await supabase.rpc(
            "incrementar_stock",
            {
              p_producto_descripcion: productData.producto,
              p_cantidad: cantidadActualizar,
            }
          );

          if (rpcError) {
            console.error("Error al ejecutar RPC incrementar_stock:", rpcError);
            throw rpcError;
          }

          console.log("Resultado del RPC incrementar_stock:", rpcResult);
        }
      }

      setItems((prev) => [...prev, ...registroCreado]);
      closeModal();
      await fetchData();
    } catch (err) {
      console.error(
        "Error al crear producto o actualizar cantidad:",
        err.message || err
      );
      alert(`Error: ${err.message || "Ocurrió un problema desconocido."}`);
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
                <div>
                  <Label>Producto</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      name="producto"
                      options={options.producto}
                      placeholder="Selecciona un items"
                      onChange={(selectedOption) =>
                        console.log("Producto seleccionado:", selectedOption)
                      }
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
                      onChange={(selectedOption) =>
                        console.log("Producto seleccionado:", selectedOption)
                      }
                      className="dark:bg-dark-900"
                    />
                  </div>
                </div>
                <div>
                  <Label>Movimiento</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      name="movimiento"
                      options={opcionesMovimiento}
                      placeholder="Selecciona una marca"
                      onChange={(selectedOpciones) =>
                        console.log("Estado seleccionado:", selectedOpciones)
                      }
                      className="dark:bg-dark-900 flex-1"
                    />
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
                <div className="lg:col-span-2">
                  <Label>Descripción</Label>
                  <Input
                    type="text"
                    name="descripcion"
                    placeholder="Ej. Caja de herramientas"
                  />
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
    </div>
  );
}
