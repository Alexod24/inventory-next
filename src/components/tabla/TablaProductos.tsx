"use client";

import { useState} from "react";
import BotonEditar from "@/components/ui/boton/BotonEditar";
import BotonBorrar from "@/components/ui/boton/BotonBorrar";

import React from "react";

import { Modal } from "@/components/ui/modalCrud";
import { useModal } from "@/hooks/useModal";
import Button from "../ui/boton/Boton";
import Input from "../form/input/Input";
import Label from "../form/Label";

type Producto = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  unidad: number;
  fechaCreacion: number;
};

export default function ProductosTable() {
  const [productos] = useState<Producto[]>([]);
  const { isOpen, openModal, closeModal } = useModal();
  const handleSave = () => {
    // Handle save logic here
    console.log("Saving changes...");
    closeModal();
  };

  // Ejemplo de fetch comentado
  // useEffect(() => {
  //   const fetchProductos = async () => {
  //     try {
  //       const data = await getProductos();
  //       setProductos(data || []);
  //     } catch (error) {
  //       console.error("Error al cargar productos:", error);
  //     }
  //   };
  //   fetchProductos();
  // }, []);

  return (
    <div className="bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <div className="bg-gray-900 py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-base font-semibold text-white">Productos</h1>
                <p className="mt-2 text-sm text-gray-300">
                  Lista de todos los productos disponibles en tu sistema.
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
                          Nombre
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                          Descripción
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                          Precio
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                          Stock
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                          Unidad
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
                      {productos.map((producto) => (
                        <tr key={producto.id}>
                          <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-white sm:pl-0">
                            {producto.nombre}
                          </td>
                          <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-300">
                            {producto.descripcion}
                          </td>
                          <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-300">
                            S/. {producto.precio}
                          </td>
                          <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-300">
                            {producto.stock}
                          </td>
                          <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-300">
                            {producto.unidad || "N/A"}
                          </td>
                          <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-300">
                            {new Date(producto.fechaCreacion).toLocaleDateString()}
                          </td>
                          <td className="relative py-5 pr-4 pl-3 text-left text-sm font-medium whitespace-nowrap sm:pr-0 flex gap-2">
                            <button >
                              {/* onClick={() => handleEditarProducto(producto)} */}
                              <BotonEditar />
                            </button>
                            <BotonBorrar />
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
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
  <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
    <div className="px-2 pr-14">
      <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
        Agregar Producto
      </h4>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
        Llena los datos para agregar un nuevo producto
      </p>
    </div>
    <form className="flex flex-col" onSubmit={e => e.preventDefault()}>
      <div className="px-2 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
          <div>
            <Label>Nombre</Label>
            <Input type="text" defaultValue="" />
          </div>

          <div>
            <Label>Descripción</Label>
            <Input type="text" defaultValue="" />
          </div>

          <div>
            <Label>Precio</Label>
            <Input type="text"  defaultValue="0" />
          </div>

          <div>
            <Label>Stock</Label>
            <Input type="text"  defaultValue="0" />
          </div>

          <div>
            <Label>Unidad</Label>
            <Input type="text" defaultValue="0" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
        <Button size="sm" variant="outline" onClick={closeModal}>
          Cerrar
        </Button>
        <Button size="sm" onClick={handleSave}>
          Guardar Cambios
        </Button>
      </div>
    </form>
  </div>
</Modal>


    </div>
  );
}
