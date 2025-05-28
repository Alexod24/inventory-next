"use client";

import { useState, useEffect, FormEvent } from "react";
import { supabase } from "@/app/utils/supabase/supabase";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";

import BotonEditar from "@/components/ui/boton/BotonEditar";
import BotonBorrar from "@/components/ui/boton/BotonBorrar";

import { Modal } from "@/components/ui/modalCrud";
import { useModal } from "@/hooks/useModal";

import Button from "../ui/boton/Boton";
import Input from "../form/input/Input";
import Label from "../form/Label";

type Salida = {
  id?: string;
  producto: string;
  productoNombre?: string;
  cantidad: string;
  precio: string;
  fecha: string;
  total?: string;
  descripcion?: string;
};

type Producto = {
  id: string;
  nombre: string;
  descripcion?: string;
  imagen_url?: string;
};

export default function SalidaTable() {
  const [salida, setSalida] = useState<Salida[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [form, setForm] = useState<Salida>({
    producto: "",
    cantidad: "0",
    precio: "0",
    total: "0",
    fecha: new Date().toISOString(),
    descripcion: "",
  });

  const { isOpen, openModal, closeModal } = useModal();
  const [salidaSeleccionada, setSalidaSeleccionada] = useState<Salida | null>(
    null
  );

  async function fetchSalida() {
    const { data, error } = await supabase.from("salidas").select(`
        id,
        cantidad,
        precio,
        fecha,
        total,
        productos (
          id, nombre, descripcion, imagen_url
        )
      `);

    if (error) {
      toast.error("Error al cargar salidas");
    } else {
      const formattedData =
        data?.map((salida) => ({
          ...salida,
          producto: salida.productos?.id || "",
          productoNombre: salida.productos?.nombre || "Producto desconocido",
        })) || [];
      setSalida(formattedData);
    }
  }

  async function fetchProductos() {
    const { data, error } = await supabase
      .from("productos")
      .select("id, nombre, precio_venta");
    if (error) {
      toast.error("Error al cargar productos");
    } else {
      setProductos(data || []);
    }
  }

  useEffect(() => {
    fetchSalida();
    fetchProductos();
  }, []);

  // Actualizar total automáticamente cuando cambie cantidad o precio
  useEffect(() => {
    const cantidadNum = parseFloat(form.cantidad) || 0;
    const precioNum = parseFloat(form.precio) || 0;
    const totalCalc = (cantidadNum * precioNum).toFixed(2);
    setForm((prev) => ({ ...prev, total: totalCalc }));
  }, [form.cantidad, form.precio]);

  async function handleBorrarSalida(id?: string) {
    if (!id) {
      toast.error("ID no válido para borrar");
      return;
    }

    const item = salida.find((sal) => sal.id === id); // Busca el registro para mostrar información adicional
    if (!item) {
      toast.error("Registro no encontrado");
      return;
    }
    const productoId = item.producto;
    const cantidad = Number(item.cantidad);

    if (
      !confirm(
        `¿Seguro quieres borrar el registro de "${item.productoNombre}"?`
      )
    )
      return;

    try {
      // Primero vamos a recuperar el producto para saber su stock mi king
      const { data: productoData, error: productoError } = await supabase
        .from("productos")
        .select("id, stock")
        .eq("id", productoId)
        .single();

      if (productoError) {
        toast.error(`Error al obtener producto para actualziar stock`);
        return;
      }

      // Actualizar el stock sumando la cantidad que se resta con esta salida
      const nuevoStock = (productoData.stock || 0) + cantidad;

      const { error: updateError } = await supabase
        .from("productos")
        .update({ stock: nuevoStock })
        .eq("id", productoId);

      if (updateError) {
        toast.error("Error al actualizar stock del producto");
        return;
      }

      // Finalmente borrar el registro de salida
      const { error: deleteError } = await supabase
        .from("salidas")
        .delete()
        .eq("id", id);

      if (deleteError) {
        toast.error("Error al borrar registro de salida");
        return;
      }

      toast.success(
        `Registro de "${item.productoNombre}" borrado y stock actualizado`
      );
      await fetchSalida();
    } catch (error) {
      console.error("Error en handleBorrarSalida:", error);
      toast.error("Error inesperado al intentar borrar");
    }
  }

  async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !form.producto ||
      Number(form.cantidad) <= 0 ||
      Number(form.precio) <= 0
    ) {
      toast.error("Completa correctamente todos los campos obligatorios");
      return;
    }

    try {
      if (salidaSeleccionada) {
        const { error } = await supabase
          .from("salidas")
          .update({
            producto: form.producto,
            cantidad: Number(form.cantidad),
            precio: Number(form.precio),
            fecha: form.fecha,
            total: (Number(form.cantidad) * Number(form.precio)).toFixed(2),
          })
          .eq("id", salidaSeleccionada.id);

        if (error) throw error;

        toast.success("Registro actualizado");
      } else {
        const { error } = await supabase.from("salidas").insert([
          {
            producto: form.producto,
            cantidad: Number(form.cantidad),
            precio: Number(form.precio),
            fecha: form.fecha,
            total: (Number(form.cantidad) * Number(form.precio)).toFixed(2),
          },
        ]);

        if (error) throw error;

        toast.success("Registro agregado");
      }

      fetchSalida();
      closeModal();
      resetForm();
      setSalidaSeleccionada(null);
    } catch (error: any) {
      toast.error(`Error: ${error.message || "Algo salió mal"}`);
    }
  }

  function resetForm() {
    setForm({
      producto: "",
      cantidad: "0",
      precio: "0",
      total: "0",
      fecha: new Date().toISOString(),
      descripcion: "",
    });
  }

  // -----------------------------------------------------------------------------

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <Toaster position="bottom-right" reverseOrder={false} />
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Salida de Productos
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              resetForm();
              setSalidaSeleccionada(null);
              openModal();
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-indigo-500 bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-600"
          >
            Agregar producto
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-400">
                Producto
              </th>

              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-400">
                Precio
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-400">
                Total
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-400">
                Fecha
              </th>

              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-400">
                Cantidad
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-400"></th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-400"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {salida.map((item) => (
              <tr key={item.id}>
                <td className="py-3 px-4 flex items-center gap-3">
                  {item.productos?.imagen_url ? (
                    <Image
                      src={item.productos.imagen_url}
                      alt={item.productos.nombre}
                      width={50}
                      height={50}
                      className="rounded-md object-cover block"
                      unoptimized={true}
                    />
                  ) : (
                    <div className="h-[50px] w-[50px] bg-gray-200 rounded-md dark:bg-gray-700 flex items-center justify-center text-gray-400 text-xs">
                      No Img
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white/90">
                      {item.productoNombre}
                    </p>
                    <span className="text-gray-500 text-xs dark:text-gray-400">
                      {item.descripcion}
                    </span>
                  </div>
                </td>

                <td className="py-3 px-4 text-gray-500 text-sm dark:text-gray-400">
                  S/. {(Number(item.precio) || 0).toFixed(2)}
                </td>
                <td className="py-3 px-4 text-gray-500 text-sm dark:text-gray-400">
                  S/. {(Number(item.total) || 0).toFixed(2)}
                </td>
                <td className="py-3 px-4 text-gray-500 text-sm dark:text-gray-400">
                  {item.fecha || "-"}
                </td>

                <td className="py-3 px-4 text-gray-500 text-sm dark:text-gray-400">
                  {item.cantidad || "-"}
                </td>
                <td className="py-3 px-4 gap-2">
                  <button
                    className="flex items-center justify-center"
                    onClick={() => {
                      setSalidaSeleccionada(item);
                      setForm({
                        producto: item.producto,
                        cantidad: item.cantidad || "0",
                        precio: item.precio || "0",
                        total: item.total || "0",
                        fecha: item.fecha || new Date().toISOString(),
                        descripcion: item.descripcion || "",
                      });
                      openModal();
                    }}
                  >
                    <BotonEditar />
                  </button>
                </td>
                <td className="py-3 px-4 gap-2">
                  <button
                    className="flex items-center justify-center"
                    onClick={() => handleBorrarSalida(item.id)}
                  >
                    <BotonBorrar />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          closeModal();
          setSalidaSeleccionada(null);
          resetForm();
        }}
        className="max-w-[700px] m-4"
      >
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {salidaSeleccionada ? "Editar Registro" : "Agregar Registro"}
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Llena los datos para {salidaSeleccionada ? "editar" : "agregar"}{" "}
              un producto
            </p>
          </div>
          <form className="flex flex-col" onSubmit={handleFormSubmit}>
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="producto">Producto</Label>
                  <select
                    id="producto"
                    value={form.producto}
                    onChange={(e) => {
                      const selectedProduct = productos.find(
                        (p) => p.id === e.target.value
                      );
                      setForm({
                        ...form,
                        producto: e.target.value,
                        precio: selectedProduct
                          ? selectedProduct.precio_venta.toString()
                          : "0",
                      });
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                    required
                  >
                    <option value="" disabled>
                      Selecciona un producto
                    </option>
                    {productos.map((producto) => (
                      <option key={producto.id} value={producto.id}>
                        {producto.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Input
                    id="descripcion"
                    value={form.descripcion || ""}
                    onChange={(e) =>
                      setForm({ ...form, descripcion: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="cantidad">Cantidad</Label>
                  <Input
                    type="number"
                    id="cantidad"
                    value={form.cantidad}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        cantidad: e.target.value === "" ? "0" : e.target.value,
                      })
                    }
                    min="0"
                  />
                </div>

                <div>
                  <Label htmlFor="precio">Precio</Label>
                  <Input
                    type="number"
                    id="precio"
                    value={form.precio}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        precio: e.target.value === "" ? "0" : e.target.value,
                      })
                    }
                    min="0"
                    disabled
                  />
                </div>

                <div>
                  <Label htmlFor="fecha">Fecha </Label>
                  <Input
                    type="date"
                    id="fecha"
                    value={form.fecha.split("T")[0]}
                    disabled
                    onChange={(e) =>
                      setForm({ ...form, fecha: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="total">Total</Label>
                  <Input type="number" id="total" value={form.total} readOnly />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  closeModal();
                  setSalidaSeleccionada(null);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {salidaSeleccionada ? "Actualizar" : "Agregar"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
