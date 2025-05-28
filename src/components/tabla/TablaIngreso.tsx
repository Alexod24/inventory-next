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

type Ingreso = {
  id?: string;
  producto: string;
  productoNombre?: string;
  cantidad: string;
  fecha: string;
  descripcion?: string;
};

type Producto = {
  id: string;
  nombre: string;
  descripcion?: string;
  imagen_url?: string;
  stock?: number;
};

export default function IngresoTable() {
  const [ingreso, setIngreso] = useState<Ingreso[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [form, setForm] = useState<Ingreso>({
    producto: "",
    cantidad: "0",
    fecha: new Date().toISOString(),
    descripcion: "",
  });

  const { isOpen, openModal, closeModal } = useModal();
  const [ingresoSeleccionado, setIngresoSeleccionado] = useState<Ingreso | null>(null);

  // Cargar ingresos
 async function fetchIngreso() {
  try {
    const { data, error } = await supabase
      .from("ingresos")
      .select(`
        id,
        cantidad,
        fecha,
        descripcion,
        producto,
        productos (
          id, nombre, descripcion, imagen_url
        )
      `);

    if (error) {
      throw new Error(`Error al obtener datos de ingresos: ${error.message}`);
    }

    console.log("Datos recuperados de ingresos:", data); // Verificar datos recuperados
    const formattedData =
      data?.map((ing) => ({
        ...ing,
        productoNombre: ing.productos?.nombre || "Producto desconocido",
      })) || [];
    setIngreso(formattedData);
  } catch (err: any) {
    console.error("Error en fetchIngreso:", err.message || err);
    toast.error(`Error al cargar ingresos: ${err.message || "Desconocido"}`);
  }
}

  // Cargar productos
  async function fetchProductos() {
    const { data, error } = await supabase.from("productos").select("id, nombre, descripcion, imagen_url, stock");
    if (error) {
      toast.error("Error al cargar productos");
    } else {
      setProductos(data || []);
    }
  }

  useEffect(() => {
    fetchIngreso();
    fetchProductos();
  }, []);

  // Actualizar stock sumando cantidad del ingreso
  async function actualizarStock(productoId: string, cantidadCambio: number) {
    const producto = productos.find((p) => p.id === productoId);
    if (!producto) {
      toast.error("Producto no encontrado para actualizar stock");
      return false;
    }
    const nuevoStock = (producto.stock || 0) + cantidadCambio;

    const { error } = await supabase
      .from("productos")
      .update({ stock: nuevoStock })
      .eq("id", productoId);

    if (error) {
      toast.error("Error al actualizar stock");
      return false;
    }

    setProductos((prev) =>
      prev.map((p) => (p.id === productoId ? { ...p, stock: nuevoStock } : p))
    );
    return true;
  }

  async function handleBorrarIngreso(id?: string) {
    if (!id) return;
    if (!confirm("¿Seguro quieres borrar este ingreso?")) return;

    const ingresoABorrar = ingreso.find((ing) => ing.id === id);
    if (!ingresoABorrar) {
      toast.error("Ingreso no encontrado");
      return;
    }

    const cantidadABorrar = parseFloat(ingresoABorrar.cantidad) || 0;
    const productoId = ingresoABorrar.producto;

    const { error: errorDelete } = await supabase.from("ingresos").delete().eq("id", id);
    if (errorDelete) {
      toast.error("Error al borrar el ingreso");
      return;
    }

    // Al borrar el ingreso, restamos la cantidad al stock
    await actualizarStock(productoId, -cantidadABorrar);

    toast.success("Ingreso borrado y stock actualizado");
    fetchIngreso();
  }

  async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.producto || Number(form.cantidad) <= 0) {
      toast.error("Completa todos los campos obligatorios correctamente");
      return;
    }

    const cantidadNum = Number(form.cantidad);

    try {
      if (ingresoSeleccionado) {
        // Actualizar ingreso existente: calcular diferencia para ajustar stock
        const cantidadVieja = parseFloat(ingresoSeleccionado.cantidad) || 0;
        const diferenciaCantidad = cantidadNum - cantidadVieja;

        const { error } = await supabase
          .from("ingresos")
          .update({
            producto: form.producto,
            cantidad: cantidadNum,
            fecha: form.fecha,
            descripcion: form.descripcion,
          })
          .eq("id", ingresoSeleccionado.id);

        if (error) throw error;

        if (diferenciaCantidad !== 0) {
          const stockOk = await actualizarStock(form.producto, diferenciaCantidad);
          if (!stockOk) throw new Error("No se pudo actualizar stock");
        }

        toast.success("Ingreso actualizado");
      } else {
        // Crear nuevo ingreso y sumar stock
        const { error } = await supabase.from("ingresos").insert([
          {
            producto: form.producto,
            cantidad: cantidadNum,
            fecha: form.fecha,
            descripcion: form.descripcion,
          },
        ]);

        if (error) throw error;

        const stockOk = await actualizarStock(form.producto, cantidadNum);
        if (!stockOk) throw new Error("No se pudo actualizar stock");

        toast.success("Ingreso agregado");
      }

      fetchIngreso();
      fetchProductos();
      closeModal();
      resetForm();
      setIngresoSeleccionado(null);
    } catch (error: any) {
      toast.error(`Error: ${error.message || "Algo salió mal"}`);
      console.error("Error handleFormSubmit:", error);
    }

  }

  function resetForm() {
    setForm({
      producto: "",
      cantidad: "0",
      fecha: new Date().toISOString(),
      descripcion: "",
    });
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <Toaster />
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Ingreso de Productos</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              resetForm();
              setIngresoSeleccionado(null);
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
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-400">Producto</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-400">Cantidad</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-400">Fecha</th>
              
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-400"></th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-400"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {ingreso.map((item) => (
              <tr key={item.id}>
                <td className="py-3 px-4 flex items-center gap-3">
                  {item.productos?.imagen_url ? (
                    <Image
                      src={item.productos.imagen_url}
                      alt={item.productos.nombre}
                      width={50}
                      height={50}
                      className="rounded-md object-cover block"
                      unoptimized={true} // opcional si usas imágenes externas
                    />
                  ) : (
                    <div className="h-[50px] w-[50px] bg-gray-200 rounded-md dark:bg-gray-700 flex items-center justify-center text-gray-400 text-xs">
                      No Img
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white/90">
                      {item.productoNombre || "Producto desconocido"}
                    </p>
                    <span className="text-gray-500 text-xs dark:text-gray-400">
                      {item.descripcion || "Sin descripción"}
                    </span>
                  </div>
                  
                </td>
                <td className="py-3 px-4 text-gray-500 text-sm dark:text-gray-400">{item.cantidad || "-"}</td>
                
                <td className="py-3 px-4 text-gray-500 text-sm dark:text-gray-400">{item.fecha || "-"}</td>
                
                <td className="py-3 px-4 gap-2">
                  <button
                    className="flex items-center justify-center"
                    onClick={() => {
                      setIngresoSeleccionado(item);
                      setForm({
                        producto: item.producto,
                        cantidad: item.cantidad || "0",
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
                  <button className="flex items-center justify-center" onClick={() => handleBorrarIngreso(item.id)}>
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
          setIngresoSeleccionado(null);
          resetForm();
        }}
        className="max-w-[700px] m-4"
      >
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {ingresoSeleccionado ? "Editar Registro" : "Agregar Registro"}
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Llena los datos para {ingresoSeleccionado ? "editar" : "agregar"} un producto
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
                    onChange={(e) => setForm({ ...form, producto: e.target.value })}
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
                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="cantidad">Cantidad</Label>
                  <Input
                    type="number"
                    id="cantidad"
                    value={form.cantidad}
                    onChange={(e) =>
                      setForm({ ...form, cantidad: e.target.value === "" ? "0" : e.target.value })
                    }
                    min="0"
                  />
                </div>

                

                <div>
                  <Label htmlFor="fecha">Fecha </Label>
                  <Input
                    type="date"
                    id="fecha"
                    value={form.fecha.split("T")[0]}
                    disabled
                    onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                  />
                </div>

                
                
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                color="secondary"
                onClick={() => {
                  closeModal();
                  setIngresoSeleccionado(null);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">{ingresoSeleccionado ? "Actualizar" : "Agregar"}</Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
