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
  productos: Option[];
  espacios: Option[];
}

// ---------------------------------------------------------------------------------------------
interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  refreshData: (triggeredBy?: string) => Promise<void>;
  fetchData: () => Promise<void>;
}

const opcionesMovimiento = [
  { value: "aumentar", label: "Aumentar" },
  { value: "reducir", label: "Reducir" },
  { value: "neutral", label: "Neutral" },
];

// ---------------------------------------------------------------------------------------------
export function DataTableRowActions<TData>({
  row,
  refreshData,
  fetchData,
}: DataTableRowActionsProps<TData>) {
  const data: any = row.original;

  const [items, setItems] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const [options, setOptions] = useState<OptionsState>({
    productos: [],
    espacios: [],
  });

  const [selectedProducto, setSelectedProducto] = useState<Option | null>(null);
  const [selectedEspacio, setSelectedEspacio] = useState<Option | null>(null);
  const [movimiento, setMovimiento] = useState<string>("");
  const [cantidad, setCantidad] = useState<string>("");
  const [descripcion, setDescripcion] = useState<string>("");
  const [fecha, setFecha] = useState<string>("");
  const [usuario, setUsuario] = useState<string>("");

  const { isOpen, openModal, closeModal } = useModal();

  useEffect(() => {
    if (isEditModalOpen && selectedItem) {
      // Busca el objeto completo en opciones para mantener consistencia
      const productoSeleccionado =
        options.productos.find((p) => p.value === selectedItem.producto) ||
        null;
      const espacioSeleccionado =
        options.espacios.find((e) => e.value === selectedItem.espacio) || null;

      setSelectedProducto(productoSeleccionado);
      setSelectedEspacio(espacioSeleccionado);

      setMovimiento(selectedItem.movimiento || "");
      setCantidad(selectedItem.cantidad?.toString() || "");
      setDescripcion(selectedItem.descripcion || "");
      setFecha(selectedItem.fecha || "");
      setUsuario(selectedItem.usuario || "");
    }
  }, [isEditModalOpen, selectedItem, options]);

  const fetchOptions = async () => {
    try {
      const [productosRes, espaciosRes] = await Promise.all([
        supabase.from("base_operativa").select("descripcion"),
        supabase.from("espacios").select("nombre"),
      ]);

      if (productosRes.error) throw productosRes.error;
      if (espaciosRes.error) throw espaciosRes.error;

      const productos = productosRes.data.map((item) => ({
        value: item.descripcion,
        label: item.descripcion,
      }));

      const espacios = espaciosRes.data.map((item) => ({
        value: item.nombre,
        label: item.nombre,
      }));

      setOptions({ productos, espacios });

      return { productos, espacios };
    } catch (err) {
      console.error("Error fetching options:", err);
      return { productos: [], espacios: [] };
    }
  };

  const handleOpenEdit = async (item: any) => {
    setSelectedItem(item);

    const { productos, espacios } = await fetchOptions();

    const productoSeleccionado =
      productos.find((p) => p.value === item.producto) || null;
    const espacioSeleccionado =
      espacios.find((e) => e.value === item.espacio) || null;

    setOptions({ productos, espacios }); // Actualiza opciones para selects

    setSelectedProducto(productoSeleccionado);
    setSelectedEspacio(espacioSeleccionado);
    setMovimiento(item.movimiento || "");
    setCantidad(item.cantidad?.toString() || "");
    setDescripcion(item.descripcion || "");
    setFecha(item.fecha || "");
    setUsuario(item.usuario || "");

    setIsEditModalOpen(true);
    openModal();
  };
  const handleEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedItem) {
      toast.error("No se ha seleccionado un registro para editar.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const updatedData = Object.fromEntries(formData.entries());

    const {
      producto,
      espacio,
      movimiento,
      cantidad,
      descripcion,
      fecha,
      usuario,
    } = updatedData;

    if (
      !producto ||
      !espacio ||
      !movimiento ||
      !cantidad ||
      !descripcion ||
      !fecha ||
      !usuario
    ) {
      toast.error("Por favor, completa todos los campos.");
      return;
    }

    try {
      const { error } = await supabase
        .from("movimientos_inventario")
        .update({
          producto: producto.toString(),
          espacio: espacio.toString(),
          movimiento: movimiento.toString(),
          cantidad: parseInt(cantidad.toString(), 10),
          descripcion: descripcion.toString(),
          fecha: fecha.toString(),
          usuario: usuario.toString(),
        })
        .eq("id", selectedItem.id);

      if (error) throw error;

      await refreshData("edit");
      closeModal();
      toast.success("Registro actualizado correctamente.");
    } catch (err) {
      toast.error("No se pudo actualizar el registro.");
      console.error("Error updating record:", err);
    }
  };

  const handleDelete = async () => {
    try {
      const { data: registro, error: fetchError } = await supabase
        .from("movimientos_inventario")
        .select("producto, cantidad, movimiento")
        .eq("id", data.id)
        .single();

      if (fetchError) throw fetchError;
      if (!registro) throw new Error("Registro no encontrado");

      let cantidadActualizar = 0;
      const cantidad = parseInt(registro.cantidad, 10);

      if (registro.movimiento === "aumentar") {
        cantidadActualizar = -cantidad;
      } else if (registro.movimiento === "reducir") {
        cantidadActualizar = cantidad;
      }

      if (cantidadActualizar !== 0) {
        const { error: rpcError } = await supabase.rpc("incrementar_stock", {
          p_producto_descripcion: registro.producto,
          p_cantidad: cantidadActualizar,
        });
        if (rpcError) throw rpcError;
      }

      const { error: deleteError } = await supabase
        .from("movimientos_inventario")
        .delete()
        .eq("id", data.id);
      if (deleteError) throw deleteError;

      await refreshData("delete");
      toast.success("Registro eliminado y stock actualizado.");
    } catch (err) {
      toast.error("Error al eliminar el registro.");
      console.error("Error deleting record:", err);
    }
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
              Crear Registro
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Llena los campos para crear el registro.
            </p>
          </div>
          <form onSubmit={handleEdit}>
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Producto</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      name="producto"
                      options={options.productos}
                      placeholder="Selecciona un Item"
                      defaultValue={selectedProducto}
                      onChange={(option) => setSelectedProducto(option)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Espacio</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      name="producto"
                      options={options.espacios}
                      placeholder="Selecciona un Item"
                      defaultValue={selectedEspacio} // aquí va defaultValue, no value
                      onChange={(option) => setSelectedEspacio(option)} // para actualizar estado local si quieres
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
                      defaultValue={
                        opcionesMovimiento.find(
                          (o) => o.value === movimiento
                        ) || null
                      }
                      onChange={(option) => setMovimiento(option?.value || "")}
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
                    defaultValue={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
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
                  <Input
                    type="text"
                    name="usuario"
                    defaultValue={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    placeholder="Ej. Dania"
                  />
                </div>
                <div className="lg:col-span-2">
                  <Label>Descripcion</Label>
                  <Input
                    type="text"
                    name="descripcion"
                    defaultValue={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Ej. Descripción"
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
    </>
  );
}
