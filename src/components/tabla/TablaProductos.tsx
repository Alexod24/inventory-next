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

import { useNotifications } from "@/context/NotificacionContext";

import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";

registerLocale("es", es);


type Producto = {
  id?: string;
  nombre: string;
  descripcion: string;
  precio_compra: number;
  precio_venta: number;
  stock: number;
  fecha_c?: string;
  categoria?: string;
  fecha_v?: string | null ; //YYYY-MM-DD
  imagen_url?: string;
};

// -------------------------------------------------------------------

export default function ProductosTable() {
  const [categorias, setCategorias] = useState<string[]>([]);
  const { isOpen: isCategoryModalOpen, openModal: openCategoryModal, closeModal: closeCategoryModal } = useModal(); // Modal para agregar categoría
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  

  const [productos, setProductos] = useState<Producto[]>([]);

  const [form, setForm] = useState<Producto>({
    nombre: "",
    descripcion: "",
    precio_compra: 0,
    precio_venta: 0,
    stock: 0,
    categoria: "",
    fecha_v: "",
    fecha_c: "",
    imagen_url: "",
  });

  const { isOpen, openModal, closeModal } = useModal();
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);

  // Estado para controlar si la imagen está subida
  const [uploading, setUploading] = useState(false);
  const { notifications, addNotification, removeNotification } = useNotifications();


  // -------------------------------------------------------------------

  // Gestionar notificaciones
function gestionarNotificaciones(productos, notifications, addNotification, removeNotification) {
  // Filtrar productos con stock 1 y no nuevos
  const productosBajoStock = productos.filter(
    (producto) => producto.stock === 1 && !producto.nuevo
  );

  // Crear mensajes actuales de alerta
  const mensajesActuales = productosBajoStock.map(
    (producto) => `El producto "${producto.nombre}" tiene solo 1 unidad en stock.`
  );

  // Agregar notificaciones nuevas (sin repetir)
  mensajesActuales.forEach((msg) => {
    if (!notifications.includes(msg)) {
      addNotification(msg);
    }
  });

  // Eliminar notificaciones que ya no aplican
  notifications.forEach((msg) => {
    if (!mensajesActuales.includes(msg)) {
      removeNotification(msg);
    }
  });

  // Marcar productos nuevos como no nuevos
  const actualizados = productos.map((producto) =>
    producto.stock === 0 && producto.nuevo ? { ...producto, nuevo: false } : producto
  );

  return actualizados;
}


// -------------------------------------------------------------------

 // Funcion para cargar productos
  async function fetchProductos() {
  const { data, error } = await supabase.from("productos").select("*");
  if (error) {
    toast.error("Error al cargar productos");
    console.error(error.message);
    return [];
  }
  return data || [];
}

// -------------------------------------------------------------------


useEffect(() => {
  async function cargarProductos() {
    const productos = await fetchProductos();
    if (productos) {
      const productosActualizados = gestionarNotificaciones(productos, notifications, addNotification, removeNotification);
      setProductos(productosActualizados);
    }
  }

  cargarProductos();

   // Ejecuta al montar el componente

  // Escucha actualizaciones en tiempo real
  const channel = supabase
    .channel('productos-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'productos' }, (payload) => {
      console.log('Cambio detectado:', payload);
      cargarProductos();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
// -------------------------------------------------------------------

  async function fetchCategorias() {
    const { data, error } = await supabase.from("categorias").select("*");
    if (error) {
      toast.error("Error al cargar categorías");
    } else {
      setCategorias(data.map((cat: { nombre: string }) => cat.nombre));
    }
  }

  useEffect(() => {
    fetchCategorias();
  }, []);

// -------------------------------------------------------------------

  async function agregarCategoria() {
    if (!nuevaCategoria.trim()) {
      toast.error("La categoría no puede estar vacía.");
      return;
    }

    const { error } = await supabase.from("categorias").insert([{ nombre: nuevaCategoria.trim() }]);
    if (error) {
      toast.error("Error al agregar categoría: " + error.message);
    } else {
      toast.success("Categoría agregada.");
      fetchCategorias(); // Vuelve a cargar las categorías para actualizar el select
      setNuevaCategoria("");
      closeCategoryModal();
    }
  }

// -------------------------------------------------------------------

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const allowedExtensions = ["jpg", "jpeg", "png", "gif"];

    if (!allowedExtensions.includes(fileExt || "")) {
      toast.error("Formato de archivo no permitido. Usa JPG, PNG o GIF.");
      return;
    }

    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `productos/${fileName}`;

    setUploading(true);

    // const file = e.target.files[0];
    // const fileExt = file.name.split(".").pop()?.toLowerCase();
    // const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    // const filePath = `productos/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("productos")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError; // Lanza el error para que sea capturado por el catch
      }

      const { data, error: storageError } = supabase.storage.from("productos").getPublicUrl(filePath);

      if (storageError) {
        throw storageError; // Lanza el error para que sea capturado por el catch
      }

      if (data?.publicUrl) {
        setForm((prev) => ({
          ...prev,
          imagen_url: data.publicUrl,
        }));
        toast.success("¡Imagen subida exitosamente!");
      } else {
        toast.error("No se pudo obtener la URL pública de la imagen.");
      }
    } catch (error: any) {
      console.error("Error al subir/obtener imagen:", error);
      toast.error("Error al subir imagen: " + (error.message || "Error desconocido."));
    } finally {
      setUploading(false); // La carga termina, ya sea éxito o error
    }
  }


// -------------------------------------------------------------------

  function handleEditarProducto(producto: Producto) {
    setProductoSeleccionado(producto);
    setForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio_venta: producto.precio_venta,
      precio_compra: producto.precio_compra,
      stock: producto.stock,
      categoria: producto.categoria || "",
      fecha_v: producto.fecha_v || "",
      fecha_c: producto.fecha_c || "",
      imagen_url: producto.imagen_url || "",
      id: producto.id,
    });
    openModal();
  }
// -------------------------------------------------------------------

  async function handleBorrarProducto(id?: string) {
    if (!id) return;
    if (!confirm("¿Seguro quieres borrar este producto?")) return;
    const { error } = await supabase.from("productos").delete().eq("id", id);
    if (error) {
      toast.error("Error al borrar producto");
    } else {
      toast.success("Producto borrado");
      fetchProductos();
    }
  }

  // -------------------------------------------------------------------

  async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Validación rápida
    if (!form.nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (isNaN(form.precio_venta) || form.precio_venta <= 0) {
      toast.error("Precio venta debe ser mayor que 0");
      return;
    }
    if (isNaN(form.precio_compra) || form.precio_compra <= 0) {
      toast.error("Precio compra debe ser mayor que 0");
      return;
    }
    if (isNaN(form.stock) || form.stock < 0) {
      toast.error("Stock no puede ser negativo");
      return;
    }
    if (!form.categoria) {
      toast.error("Debes seleccionar una categoría.");
      return;
    }

    const productoData = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      precio_venta: form.precio_venta,
      precio_compra: form.precio_compra,
      stock: form.stock, // Habilitado para crear y editar
      categoria: form.categoria.trim(),
      fecha_v: form.fecha_v ? new Date(form.fecha_v).toISOString().split("T")[0] : null,
      fecha_c: form.fecha_c ? form.fecha_c.split("T")[0] : null,
      imagen_url: form.imagen_url.trim() || null,
    };

    if (productoSeleccionado && productoSeleccionado.id) {
      // Editar
      const { error } = await supabase
        .from("productos")
        .update(productoData)
        .eq("id", productoSeleccionado.id);
      if (error) {
        toast.error("Error al actualizar producto: " + error.message);
      } else {
        toast.success("Producto actualizado");
        fetchProductos();
        setProductoSeleccionado(null);
        resetForm();
        closeModal();
      }
    } else {
      // Crear
      const { error } = await supabase.from("productos").insert([productoData]);
      if (error) {
        toast.error("Error al crear producto: " + error.message);
      } else {
        toast.success("Producto creado");
        fetchProductos();
        resetForm();
        closeModal();
      }
    }
  }

  function resetForm() {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0]; // Formatea como YYYY-MM-DD

    setForm({
      nombre: "",
      descripcion: "",
      precio_venta: 0,
      precio_compra: 0,
      stock: 0,
      categoria: "",
      fecha_v: "",
      fecha_c: formattedDate, // Rellena automáticamente con la fecha actual
      imagen_url: "",
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <Toaster />
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Lista de Productos</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              resetForm();
              setProductoSeleccionado(null);
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
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-400">Categoría</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-400">
                Precio Compra
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-400">
                Precio Venta
              </th>
              
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-400">
                Fecha Vencimiento
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-400">
                Fecha Creacion
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-400">Stock</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-400"></th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-400"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {productos.map((producto) => (
              <tr key={producto.id}>
                <td className="py-3 px-4 flex items-center gap-3">
                  {producto.imagen_url ? (
                    <Image
                      src={producto.imagen_url}
                      alt={producto.nombre}
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
                    <p className="font-medium text-gray-800 dark:text-white/90">{producto.nombre}</p>
                    <span className="text-gray-500 text-xs dark:text-gray-400">{producto.descripcion}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-500 text-sm dark:text-gray-400">
                  {producto.categoria || "-"}
                </td>
                <td className="py-3 px-4 text-gray-500 text-sm dark:text-gray-400">
                  S/. {(producto.precio_compra || 0).toFixed(2)}
                </td>
                <td className="py-3 px-4 text-gray-500 text-sm dark:text-gray-400">
                  S/. {(producto.precio_venta || 0).toFixed(2)}
                </td>
                
                <td className="py-3 px-4 text-gray-500 text-sm dark:text-gray-400">
                  {producto.fecha_v || "-"}
                </td>
                <td className="py-3 px-4 text-gray-500 text-sm dark:text-gray-400">
                  {producto.fecha_c ? producto.fecha_c.split("T")[0] : "-"}
                </td>
                <td className="py-3 px-4 text-gray-500 text-sm dark:text-gray-400 text-center align-middle">{producto.stock}</td>
                <td className="py-3 px-4 gap-2">
                  <button
                    className="flex items-center justify-center"
                    onClick={() => handleEditarProducto(producto)}
                  >
                    <BotonEditar />
                  </button>
                </td>
                <td className="py-3 px-4 gap-2">
                  <button
                    className="flex items-center justify-center"
                    onClick={() => handleBorrarProducto(producto.id)}
                  >
                    <BotonBorrar />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para crear/editar producto */}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          closeModal();
          setProductoSeleccionado(null);
          resetForm();
        }}
        className="max-w-[700px] m-4"
      >
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {productoSeleccionado ? "Editar Producto" : "Agregar Producto"}
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Llena los datos para {productoSeleccionado ? "editar" : "agregar"} un producto
            </p>
          </div>
          <form className="flex flex-col" onSubmit={handleFormSubmit}>
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    
                  />
                </div>
                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Input
                    id="descripcion"
                    value={form.descripcion}
                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="precio_compra">Precio Compra</Label>
                  <Input
                    type="number"
                    id="precio_compra"
                    value={form.precio_compra}
                    onChange={(e) =>
                      setForm({ ...form, precio_compra: e.target.value === "" ? 0 : parseFloat(e.target.value) })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="precio_venta">Precio Venta</Label>
                  <Input
                    type="number"
                    id="precio_venta"
                    value={form.precio_venta}
                    onChange={(e) =>
                      setForm({ ...form, precio_venta: e.target.value === "" ? 0 : parseFloat(e.target.value) })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    type="number"
                    min="0"
                    id="stock"
                    disabled 
                    value={form.stock} // Permite editar el stock
                    onChange={(e) =>
                      setForm({ ...form, stock: e.target.value === "" ? 0 : parseInt(e.target.value) })
                      
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="categoria">Categoría</Label>
                  <div className="flex items-center gap-2">
                    <select
                      id="categoria"
                      value={form.categoria}
                      onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                      className="w-full rounded border border-gray-300 p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      required
                    >
                      <option value=""> Selecciona una categoría </option>
                      {categorias.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={openCategoryModal} // Abre el modal de categoría
                      className="rounded bg-indigo-500 px-3 py-1 text-white hover:bg-indigo-600"
                      title="Agregar nueva categoría"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="fecha_v">Fecha de Vencimiento</Label>
                  <div className="relative"> {/* Contenedor relativo para posicionar el icono */}
                    <DatePicker
                      id="fecha_v"
                      selected={form.fecha_v ? new Date(form.fecha_v) : null} // Convierte el string a objeto Date
                      onChange={(date: Date | null) =>
                        setForm({
                          ...form,
                          fecha_v: date ? date.toISOString().split('T')[0] : "", // Guarda como YYYY-MM-DD
                        })
                      }
                      dateFormat="yyyy-MM-dd" // Formato de visualización
                      className="w-full rounded border border-gray-300 p-2 pr-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white" // Añade pr-10 para el icono
                      placeholderText="Selecciona una fecha"
                      isClearable // Permite borrar la fecha seleccionada
                      showYearDropdown // Muestra un selector de año
                      scrollableYearDropdown // Hace que el selector de año sea scrollable
                      yearDropdownItemNumber={15} // Cantidad de años en el dropdown
                      locale="es"
                    />
                    
                  </div>
                </div>


                <div>
                  <Label htmlFor="fecha_c">Fecha de Creación</Label>
                  <Input
                    type="date"
                    id="fecha_c"
                    value={form.fecha_c}
                    onChange={(e) => setForm({ ...form, fecha_c: e.target.value })}
                    disabled // Mantener deshabilitado si siempre es la fecha actual
                  />
                </div>

                <div>
                  <Label htmlFor="imagen">Imagen del producto</Label>
                  <input
                    id="imagen"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="block w-full text-sm text-gray-900 bg-gray-50 rounded border border-gray-300 cursor-pointer dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  />

                  {uploading ? (
                    <div className="mt-2 flex items-center justify-center h-32 w-full bg-gray-100 rounded-md dark:bg-gray-700">
                      <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-t-transparent border-indigo-500"></div>
                      <p className="ml-3 text-gray-600 dark:text-gray-300">Subiendo imagen...</p>
                    </div>
                  ) : form.imagen_url ? (
                    <img
                      src={form.imagen_url}
                      alt="Imagen del producto"
                      className="mt-2 max-h-32 rounded-md object-cover w-full"
                    />
                  ) : (
                    <div className="mt-2 h-32 w-full bg-gray-100 rounded-md dark:bg-gray-700 flex items-center justify-center text-gray-400 text-xs">
                      Vista previa de imagen
                    </div>
                  )}

                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                color="secondary"
                onClick={() => {
                  closeModal();
                  setProductoSeleccionado(null);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">{productoSeleccionado ? "Actualizar" : "Agregar"}</Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal para agregar nueva categoría */}
      <Modal isOpen={isCategoryModalOpen} onClose={closeCategoryModal} className="max-w-md m-4">
        <div className="relative w-full p-6 bg-white rounded-3xl dark:bg-gray-900">
          <h4 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">Agregar Nueva Categoría</h4>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              agregarCategoria();
            }}
          >
            <Label htmlFor="nuevaCategoria">Nombre de la Categoría</Label>
            <Input
              id="nuevaCategoria"
              value={nuevaCategoria}
              onChange={(e) => setNuevaCategoria(e.target.value)}
              required
              placeholder="Ej. Electrónica, Ropa, Alimentos"
            />
            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" color="secondary" onClick={closeCategoryModal}>
                Cancelar
              </Button>
              <Button type="submit">Agregar</Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}