"use client";

import { useState, useEffect, FormEvent } from "react";
import {supabase} from "@/app/utils/supabase/supabase"
import toast, {Toaster} from "react-hot-toast";


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
  cantidad: string;
  precio: string;
  fecha: string;
  productoNombre?: string;
};

type Producto = {
  id: string;
  nombre: string;
};

export default function SalidaTable() {
  // Obtenemos los productos
  const [salida, setSalida] = useState<Salida[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [form, setForm] = useState<Salida>({
    producto:"",
    cantidad: "",
    precio: "",
    fecha: new Date().toISOString(),
  })
  
  const { isOpen, openModal, closeModal } = useModal();

  const [salidaSeleccionado, setSalidaSeleccionado] = useState<Salida | null>(null);

  // Cargamos productos

  async function fetchSalida(){
    const {data,error} = await supabase.from("salidas").select(`
      id,
      cantidad,
      precio,
      fecha,
      productos (
        id,nombre
      )
    `);

    if(error){
      toast.error("Ha fallado en leer los datos de salida ")
    } else {
    // Transformamos los datos para incluir el nombre del producto directamente en la lista de salidas
    const formattedData = data.map((salida) => ({
      ...salida,
      id: salida.id,
      cantidad: salida.cantidad,
      precio: salida.precio,
      fecha: salida.fecha,
      producto: salida.productos?.id || "", 
      productoNombre: salida.productos?.nombre || "Producto desconocido",
        }));
    setSalida(formattedData || []);
    }
  }

  // Fetch productos
  async function fetchProductos() {
    const { data, error } = await supabase.from("productos").select("id, nombre");
    if (error) {
      toast.error("Error al cargar los productos");
    } else {
      setProductos(data || []);
    }
  }

  useEffect(() =>{
    fetchSalida();
    fetchProductos();
  },[])

  // Editar salida

   function handleEditarSalida(salida: Salida) {
    setSalidaSeleccionado(salida);
    setForm({
      producto: salida.producto,
      cantidad: salida.cantidad,
      precio: salida.precio,
      fecha: salida.fecha,
      id: salida.id,
    });
    openModal();
  }
  
  // Borramos Producto

  async function handleBorrarSalida(id?: string) {
    if (!id) return;

    if (!id || !confirm("¿Seguro quieres borrar este registro?")) return;

    const { error } = await supabase.from("salidas").delete().eq("id", id);
    if (error) {
      toast.error("Error al borrar el registro");
    } else {
      toast.success("Registro borrado");
      fetchSalida();
    }
  }

   // Crear o editar salida
  async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.producto || !form.cantidad || !form.precio) {
      toast.error("Pofavor amigo completa todos los datos");
      return;
    }

    if (salidaSeleccionado) {
      const { error } = await supabase
        .from("salidas")
        .update({
          producto: form.producto,
          cantidad: form.cantidad,
          precio: form.precio,
          fecha: form.fecha,
        })
        .eq("id", salidaSeleccionado.id);

      if (error) {
        toast.error("Error al actualizar la salida" + error.message);
      } else {
        toast.success("Salida actualizada");
        fetchSalida();
        setSalidaSeleccionado(null);
        setForm({ 
          producto: "",
           cantidad: "",
            precio: "",
             fecha: new Date().toISOString() 
            });
        closeModal();
      }
    } else {

      // Creamos la salida
      const { error } = await supabase.from("salidas").insert([
        {
          producto: form.producto,
          cantidad: form.cantidad,
          precio: form.precio,
          fecha: form.fecha,
        },
      ]);

      if (error) {
        toast.error("Error al crear la salida" + error.message);
      } else {
        toast.success("Salida creada");
        fetchSalida();
        setForm({ producto: "", cantidad: "", precio: "", fecha: new Date().toISOString() });
        closeModal();
      }
    }
    
  }

  return (
    <div className="bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <div className="bg-gray-900 py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-base font-semibold text-white">Salidas</h1>
                <p className="mt-2 text-sm text-gray-300">
                  Lista de salida de todos los productos
                </p>
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                <button
                  type="button"
                  onClick={openModal}
                  className="block rounded-md bg-indigo-500 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  Agregar nuevo
                </button>
              </div>
            </div>
            <div className="mt-8 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                      <tr>
                        <th className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-white sm:pl-0">
                          Producto
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                          Cantidad
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                          Precio
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                          Fecha de Creación
                        </th>
                        <th className="relative py-3.5 pr-4 pl-3 sm:pr-0">
                          <span className="sr-only">Acciones</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {salida.map((salida) => (
                        <tr key={salida.id}>
                          <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-white sm:pl-0">
                            {salida.productoNombre}
                          </td>
                          <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-300">
                            {salida.cantidad}
                          </td>
                          <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-300">
                            S/. {salida.precio}
                          </td>
                          
                          <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-300">
                            {new Date(salida.fecha).toLocaleDateString()}
                          </td>
                          <td className="relative py-5 pr-4 pl-3 text-left text-sm font-medium whitespace-nowrap sm:pr-0 flex gap-2">
                             <button onClick={() => handleEditarSalida(salida)}>
                              <BotonEditar />
                            </button>

                            <button onClick={() => handleBorrarSalida(salida.id)}>
                              <BotonBorrar />
                            </button>

                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal para agregar o editar */}
      <Modal isOpen={isOpen} onClose={() => { closeModal(); setSalidaSeleccionado(null);}} className="max-w-[700px] m-4">

    <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
    <Toaster/>
    <div className="px-2 pr-14">
      <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
        {salidaSeleccionado ? "Editar Producto": "Agregar Producto"}
      </h4>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
        Llena los datos para {salidaSeleccionado ? "editar" : "agregar"} un  producto
      </p>
    </div>
    <form className="flex flex-col" onSubmit={ handleFormSubmit }>
      <div className="px-2 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
          <div>
            <Label className="form-label">Producto</Label>
            <select
            value={form.productoNombre}
            onChange={(event) => setForm({ ...form, producto: event.target.value })}
            className="form-control"
          >
            <option value="">Seleccione un producto</option>
            {productos.map((producto) => (
              <option key={producto.id} value={producto.id}>
                {producto.nombre}
              </option>
            ))}
          </select>

          </div>

          <div>
            <Label>Cantidad</Label>
            <Input type="text" value={form.cantidad} onChange={(event) => setForm({
              ...form,
              cantidad: event.target.value
             })} className="form-control" />
          </div>

          <div>
            <Label>Precio</Label>
            <Input type="text" value={form.precio} onChange={(event) => setForm({
              ...form,
              precio: event.target.value
             })}  className="form-control" />
          </div>

        </div>
      </div>
      <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
        <Button variant="outline" onClick={() => { closeModal(); setSalidaSeleccionado(null); }}>
                Cerrar
              </Button>
              <Button type="submit">{salidaSeleccionado ? "Guardar Cambios" : "Agregar"}</Button>
      </div>
    </form>
  </div>
</Modal>


    </div>
  );
}
