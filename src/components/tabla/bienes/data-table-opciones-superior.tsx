"use client";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { supabase } from "@/app/utils/supabase/supabase";

import React from "react";
import Input from "../../form/input/Input";
import Label from "../../form/Label";
import Select from "../../form/Seleccionar";
import { Button } from "@/components/ui/button";
import { exportarToPDF } from "./exportar";
import { useState, useEffect, FormEvent } from "react";
import { Modal } from "../../ui/modal"; // Corrected import
import { useModal } from "../../../hooks/useModal"; // Corrected import
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { MixerHorizontalIcon, PlusIcon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";
import ReactDOM from "react-dom";

import { Option, opcionesEstado, opcionesDisponibilidad } from "@/lib/options";
import { Bienes } from "./schema";

// -----------------------------------------------------------------------------------------------
const generateCode = (
  categoriaNombre: string,
  subcategoriaNombre: string,
  nombre: string,
  suffix: string = "001"
) => {
  const categoriaCode = categoriaNombre.slice(0, 3).toUpperCase();
  const subcategoriaCode = subcategoriaNombre.slice(0, 3).toUpperCase();
  const nombreCode = nombre
    ? nombre
        .split(" ")
        .map((word) => word.slice(0, 3).toUpperCase())
        .join("-")
    : "";

  return `${categoriaCode}-${subcategoriaCode}-${nombreCode}-${suffix}`;
};
// -----------------------------------------------------------------------------------------------
const fetchSimilarCodes = async (baseCode: string) => {
  const { data, error } = await supabase
    .from("bienes")
    .select("codigo")
    .like("codigo", `${baseCode}%`);

  if (error) {
    console.error("Error al buscar códigos similares:", error);
    return [];
  }

  return data.map((item) => item.codigo);
};

const calculateNextSuffix = (existingCodes: string[], baseCode: string) => {
  const suffixes = existingCodes
    .map((code) => {
      const match = code.match(/-(\d{3})$/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((num) => num !== null);

  const nextSuffix = Math.max(0, ...suffixes) + 1;
  return nextSuffix.toString().padStart(3, "0");
};

// ---------------------------------------------------------------------------------------------
interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
  fetchData: () => Promise<void>;
  viewOptions: { showHiddenColumns: boolean; customView: string };
  setViewOptions: React.Dispatch<
    React.SetStateAction<{ showHiddenColumns: boolean; customView: string }>
  >;
}
// ---------------------------------------------------------------------------------------------
export function DataTableViewOptions<TData>({
  table,
  fetchData,
  viewOptions, // Added to destructuring
  setViewOptions, // Added to destructuring
}: DataTableViewOptionsProps<TData>) {
  const { isOpen, openModal, closeModal } = useModal();
  const [items, setItems] = useState<Bienes[]>([]);
  const [options, setOptions] = useState<{
    categorias: Option[];
    subcategorias: Option[];
    proveedores: Option[];
    espacios: Option[];
    usuarios: Option[];
  }>({
    categorias: [],
    subcategorias: [],
    proveedores: [],
    espacios: [],
    usuarios: [],
  });

  const [filteredSubcategories, setFilteredSubcategories] = useState<Option[]>(
    []
  );

  const [isMiniModalOpen, setMiniModalOpen] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [currentType, setCurrentType] = useState<string | null>(null);
  const [miniModalError, setMiniModalError] = useState<string | null>(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    React.useState(null);
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] =
    React.useState(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = React.useState(null);
  const [fechaPredeterminada, setFechaPredeterminada] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Estados para el nuevo bien (formulario del modal)
  const [newBien, setNewBien] = useState<Partial<Bienes>>({
    codigo: "",
    nombre: "",
    categoria: "", // Will store the label (name)
    subcategoriaNombre: "", // Will store the label (name)
    proveedorNombre: "", // Will store the label (name)
    espacioNombre: "", // Will store the label (name)
    cantidad: 0,
    adquisicion: new Date().toISOString().split("T")[0],
    valor: 0,
    estado: opcionesEstado[0]?.value as string,
    disponibilidad: Boolean(opcionesDisponibilidad[0]?.value),
    observaciones: "",
    usuario: "", // Will store the label (name)
  });

  // -----------------------------------------------------------------------------------------------
  // Effect to generate code based on selected names
  useEffect(() => {
    const categoriaLabel = options.categorias.find(
      (opt) => opt.label === newBien.categoria
    )?.label;
    const subcategoriaLabel = options.subcategorias.find(
      (opt) => opt.label === newBien.subcategoriaNombre
    )?.label;

    if (categoriaLabel && subcategoriaLabel && newBien.nombre) {
      const codigoGenerado = generateCode(
        categoriaLabel,
        subcategoriaLabel,
        newBien.nombre
      );
      setNewBien((prev) => ({ ...prev, codigo: codigoGenerado }));
    } else {
      setNewBien((prev) => ({ ...prev, codigo: "" }));
    }
  }, [
    newBien.categoria,
    newBien.subcategoriaNombre,
    newBien.nombre,
    options.categorias,
    options.subcategorias,
  ]);
  // -----------------------------------------------------------------------------------------------

  // Function to load main table data and options for Selects
  const loadDataAndOptions = async () => {
    try {
      // Cargar bienes con select específico y alias para coincidir con el schema Zod
      const { data: bienesRawData, error: bienesError } = await supabase.from(
        "bienes"
      ).select(`
          id,
          codigo,
          nombre,
          cantidad,
          valor,
          estado,
          disponibilidad,
          observaciones,
          fecha_adquisicion,
          creado_en,
          actualizado_en,
          categorias(nombre),
          subcategorias(nombre, categoria_id),
          proveedores(nombre),
          espacios(nombre),
          usuarios(nombre)
        `);

      if (bienesError) {
        console.error("Error cargando bienes:", bienesError);
      } else {
        // Mapear los datos crudos de Supabase a la interfaz Bienes
        const mappedBienes: Bienes[] = bienesRawData.map((b: any) => ({
          id: b.id,
          codigo: b.codigo,
          nombre: b.nombre,
          cantidad: b.cantidad,
          valor: b.valor,
          estado: b.estado,
          disponibilidad: b.disponibilidad,
          observaciones: b.observaciones,
          adquisicion: b.fecha_adquisicion,
          creado: b.creado_en,
          actualizado: b.actualizado_en,
          categoria: b.categorias?.nombre || "Sin categoría",
          subcategoriaNombre: b.subcategorias?.nombre || "Sin subcategoría",
          proveedorNombre: b.proveedores?.nombre || "Sin proveedor",
          espacioNombre: b.espacios?.nombre || "Sin espacio",
          usuario: b.usuarios?.nombre || "Sin usuario",
        }));
        setItems(mappedBienes);
      }

      // Cargar opciones para Selects
      const { data: categoriasData, error: catError } = await supabase
        .from("categorias")
        .select("id, nombre");
      const { data: subcategoriasData, error: subCatError } = await supabase
        .from("subcategorias")
        .select("id, nombre, categoria_id");
      const { data: proveedoresData, error: provError } = await supabase
        .from("proveedores")
        .select("id, nombre");
      const { data: espaciosData, error: espError } = await supabase
        .from("espacios")
        .select("id, nombre");
      const { data: usuariosData, error: userError } = await supabase
        .from("usuarios")
        .select("id, nombre");

      setOptions({
        categorias:
          categoriasData?.map((c) => ({ value: c.id, label: c.nombre })) || [],
        subcategorias:
          subcategoriasData?.map((s) => ({
            value: s.id,
            label: s.nombre,
            categoria_id: s.categoria_id,
          })) || [],
        proveedores:
          proveedoresData?.map((p) => ({ value: p.id, label: p.nombre })) || [],
        espacios:
          espaciosData?.map((e) => ({ value: e.id, label: e.nombre })) || [],
        usuarios:
          usuariosData?.map((u) => ({ value: u.id, label: u.nombre })) || [],
      });
    } catch (error) {
      console.error("Error en loadDataAndOptions:", error);
    }
  };

  // Initial data and options load
  useEffect(() => {
    loadDataAndOptions();
  }, []);

  // Effect to filter subcategories when category selection changes
  useEffect(() => {
    if (newBien.categoria) {
      const selectedCatOption = options.categorias.find(
        (opt) => opt.label === newBien.categoria
      );

      if (selectedCatOption) {
        const filtered = options.subcategorias.filter(
          (subcat: any) => subcat.categoria_id === selectedCatOption.value
        );
        setFilteredSubcategories(filtered);
      } else {
        setFilteredSubcategories([]);
      }
    } else {
      setFilteredSubcategories([]);
    }
  }, [newBien.categoria, options.categorias, options.subcategorias]);

  // Handle input changes for text and number fields
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setNewBien((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSelectChange = (
    name: string,
    value: string | number | boolean
  ) => {
    const mapping: Record<string, string> = {
      categoria: "categoria_id",
      subcategoriaNombre: "subcategoria_id",
      proveedorNombre: "proveedor_id",
      espacioNombre: "espacio_id",
      usuario: "usuario_id",
    };

    const idField = mapping[name];

    setNewBien((prev) => ({
      ...prev,
      [name]: value, // nombre
      ...(idField ? { [idField]: value } : {}), // id real
    }));
  };
  // ----------------------------------------------------------------
  const handleAddBien = async (e: FormEvent) => {
    e.preventDefault();
    console.log("🚀 handleAddBien llamado", newBien);

    // Tomar IDs directamente desde newBien
    const categoriaId = newBien.categoria_id;
    const subcategoriaId = newBien.subcategoria_id;
    const proveedorId = newBien.proveedor_id || null;
    const espacioId = newBien.espacio_id;
    const usuarioId = newBien.usuario_id;

    console.log({
      categoriaId,
      subcategoriaId,
      proveedorId,
      espacioId,
      usuarioId,
    });
    console.log("Datos del formulario antes de añadir:", newBien);

    // Validación básica
    if (
      !newBien.nombre?.trim() ||
      !categoriaId ||
      !subcategoriaId ||
      !espacioId ||
      !usuarioId ||
      newBien.cantidad === undefined ||
      isNaN(newBien.cantidad) ||
      newBien.valor === undefined ||
      isNaN(newBien.valor) ||
      !newBien.estado?.trim()
    ) {
      console.error(
        "❌ Faltan campos obligatorios para añadir el bien o IDs no encontrados."
      );
      return;
    }

    // Generar código único
    const baseCode = generateCode(
      newBien.categoria || "",
      newBien.subcategoriaNombre || "",
      newBien.nombre,
      ""
    );
    const similarCodes = await fetchSimilarCodes(baseCode);
    const nextSuffix = calculateNextSuffix(similarCodes, baseCode);
    const finalCode = generateCode(
      newBien.categoria || "",
      newBien.subcategoriaNombre || "",
      newBien.nombre,
      nextSuffix
    );
    console.log("🔑 Código generado:", finalCode);

    // Construir objeto a insertar
    const dataToInsert = {
      codigo: finalCode,
      nombre: newBien.nombre,
      cantidad: newBien.cantidad,
      valor: newBien.valor,
      estado: newBien.estado,
      disponibilidad: newBien.disponibilidad,
      observaciones: newBien.observaciones,
      fecha_adquisicion: newBien.adquisicion,
      categoria_id: categoriaId,
      subcategoria_id: subcategoriaId,
      proveedor_id: proveedorId,
      espacio_id: espacioId,
      usuario_id: usuarioId,
    };

    try {
      const { data, error } = await supabase
        .from("bienes")
        .insert([dataToInsert]).select(`
        id,
        codigo,
        nombre,
        cantidad,
        valor,
        estado,
        disponibilidad,
        observaciones,
        fecha_adquisicion,
        creado_en,
        actualizado_en,
        categorias(nombre),
        subcategorias(nombre, categoria_id),
        proveedores(nombre),
        espacios(nombre),
        usuarios(nombre)
      `);

      if (error) throw error;
      console.log("✅ Bien insertado:", data);

      // Mapear datos y agregarlos a la tabla
      const insertedBienMapped: Bienes[] = data.map((b: any) => ({
        id: b.id,
        codigo: b.codigo,
        nombre: b.nombre,
        cantidad: b.cantidad,
        valor: b.valor,
        estado: b.estado,
        disponibilidad: b.disponibilidad,
        observaciones: b.observaciones,
        adquisicion: b.fecha_adquisicion,
        creado: b.creado_en,
        actualizado: b.actualizado_en,
        categoria: b.categorias?.nombre || "Sin categoría",
        subcategoriaNombre: b.subcategorias?.nombre || "Sin subcategoría",
        proveedorNombre: b.proveedores?.nombre || "Sin proveedor",
        espacioNombre: b.espacios?.nombre || "Sin espacio",
        usuario: b.usuarios?.nombre || "Sin usuario",
      }));

      setItems((prev) => [...prev, ...insertedBienMapped]);
      closeModal();
      fetchData();

      // Resetear formulario
      setNewBien({
        codigo: "",
        nombre: "",
        categoria: "",
        categoria_id: "",
        subcategoriaNombre: "",
        subcategoria_id: "",
        proveedorNombre: "",
        proveedor_id: "",
        espacioNombre: "",
        espacio_id: "",
        cantidad: 0,
        adquisicion: new Date().toISOString().split("T")[0],
        valor: 0,
        estado: opcionesEstado[0]?.value as string,
        disponibilidad: opcionesDisponibilidad[0]?.value === "true",
        observaciones: "",
        usuario: "",
        usuario_id: "",
      });
    } catch (err: any) {
      console.error("❌ Error al añadir bien:", err);
    }
  };

  // -----------------------------------------------------------------------------------------------

  // Handle adding new options (e.g., new category, new supplier)
  const handleCreateOption = async (e: FormEvent) => {
    e.preventDefault();
    if (!newValue.trim() || !currentType) {
      setMiniModalError("El valor y el tipo no pueden estar vacíos.");
      return;
    }

    try {
      const { error } = await supabase
        .from(currentType)
        .insert([{ nombre: newValue }]);
      if (error) throw error;

      await loadDataAndOptions(); // Reload all data and options after adding a new one
      setMiniModalOpen(false);
      setNewValue("");
      setCurrentType(null);
      setMiniModalError(null);
    } catch (err: any) {
      console.error(`Error al crear ${currentType}:`, err);
      setMiniModalError(
        `Error al crear ${currentType}: ${err.message || "Error desconocido"}`
      );
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
          <form className="flex flex-col" onSubmit={handleAddBien}>
            {/* Contenedor para las columnas */}
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                {/* Código */}
                <div>
                  <Label>Código</Label>
                  <Input
                    type="text"
                    value={newBien.codigo}
                    name="codigo"
                    placeholder="Código generado automáticamente"
                    className="!bg-gray-200 cursor-not-allowed"
                    readOnly
                  />
                </div>

                {/* Nombre */}
                <div>
                  <Label>Nombre</Label>
                  <Input
                    type="text"
                    name="nombre"
                    placeholder="Ej. Mesa plegable"
                    onChange={(e) =>
                      setNewBien((prev) => ({
                        ...prev,
                        nombre: e.target.value,
                      }))
                    }
                  />
                </div>
                {/* Categoría */}
                <div>
                  <Label>Categoría</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      name="categoria"
                      options={options.categorias}
                      placeholder="Selecciona una categoría"
                      className="dark:bg-dark-900"
                      onChange={(value) =>
                        setNewBien((prev) => ({
                          ...prev,
                          categoria_id: value, // <-- EL QUE VA AL BACKEND
                          categoria: value, // <-- si quieres seguir mostrando el valor
                        }))
                      }
                      value={newBien.categoria}
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

                {/* Sub Categoría */}
                <div>
                  <Label>Sub Categoría</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      name="subCategoria"
                      options={options.subcategorias}
                      placeholder="Selecciona una subcategoría"
                      className="dark:bg-dark-900"
                      onChange={(value) =>
                        handleSelectChange("subcategoriaNombre", value)
                      }
                      value={newBien.subcategoriaNombre}
                      // disabled={!categoriaSeleccionada} // Deshabilita si no hay categoría seleccionada
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        setCurrentType("subcategorias"); // Corregido a 'subcategorias'
                        setMiniModalOpen(true);
                      }}
                      disabled={!categoriaSeleccionada} // Deshabilita si no hay categoría seleccionada
                    >
                      +
                    </Button>
                  </div>
                </div>
                {/* Responsable */}
                <div>
                  <Label>Responsable</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      id="usuario"
                      name="usuario_id"
                      options={options.usuarios}
                      placeholder="Ej. Juan Pérez"
                      onChange={(value) =>
                        setNewBien((prev) => ({
                          ...prev,
                          usuario_id: value, // <-- EL QUE VA AL BACKEND
                          usuario: value, // <-- si quieres seguir mostrando el valor
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Espacio */}
                <div>
                  <Label>Espacio</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      name="espacioNombre"
                      options={options.espacios}
                      placeholder="Selecciona un espacio"
                      value={newBien.espacioNombre}
                      onChange={(value) =>
                        handleSelectChange("espacioNombre", value)
                      }
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        setCurrentType("espacios");
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
                    value={newBien.cantidad}
                    onChange={(e) =>
                      setNewBien((prev) => ({
                        ...prev,
                        cantidad: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                  />
                </div>

                {/* Fecha Adquisición */}
                <div>
                  <Label>Fecha de Adquisición</Label>
                  <Input
                    type="date"
                    name="fecha"
                    onChange={(e) => setFechaPredeterminada(e.target.value)}
                  />
                </div>

                {/* Valor */}
                <div>
                  <Label>Valor Unitario</Label>
                  <Input
                    type="number"
                    name="valor"
                    step="0.01"
                    placeholder="Ej. 250.00"
                    value={newBien.valor || ""}
                    onChange={(e) =>
                      setNewBien((prev) => ({
                        ...prev,
                        valor: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>

                {/* Proveedor */}
                <div>
                  <Label>Proveedor</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      name="proveedorNombre"
                      options={options.proveedores}
                      placeholder="Selecciona un proveedor"
                      className="dark:bg-dark-900"
                      value={newBien.proveedorNombre}
                      onChange={(value) =>
                        handleSelectChange("proveedorNombre", value)
                      }
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

                {/* Disponibilidad */}
                <div>
                  <Label>Disponibilidad</Label>
                  <Select
                    name="disponibilidad"
                    options={opcionesDisponibilidad}
                    placeholder="Selecciona la disponibilidad"
                    className="dark:bg-dark-900"
                  />
                </div>

                {/* Estado Físico */}
                <div>
                  <Label>Estado Físico</Label>
                  <Select
                    name="estadoFisico"
                    options={opcionesEstado}
                    placeholder="Selecciona el estado físico"
                    className="dark:bg-dark-900"
                  />
                </div>

                {/* Observaciones */}
                <div className="lg:col-span-2">
                  <Label>Observaciones</Label>
                  <textarea
                    name="observaciones"
                    className="w-full p-2 border rounded-lg dark:bg-dark-900 dark:text-white"
                    placeholder="Notas adicionales..."
                    value={newBien.observaciones || ""}
                    onChange={(e) =>
                      setNewBien((prev) => ({
                        ...prev,
                        observaciones: e.target.value,
                      }))
                    }
                  ></textarea>
                </div>

                {/* Fecha de Creación (deshabilitado) */}
                <div>
                  <Label>Fecha de Creación</Label>
                  <Input
                    type="date"
                    name="fechaCreacion"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    className="!bg-gray-200 cursor-not-allowed"
                    disabled
                  />
                </div>

                {/* Fecha de Actualización (deshabilitado) */}
                <div>
                  <Label>Fecha de Actualización</Label>
                  <Input
                    type="date"
                    name="fechaActualizacion"
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
      </Modal>

      {/* Mini Modal para agregar nuevas opciones (categorías, subcategorías, etc.) */}
      {isMiniModalOpen &&
        currentType &&
        ReactDOM.createPortal(
          <Modal
            isOpen={isMiniModalOpen}
            onClose={() => {
              setMiniModalOpen(false);
              setCurrentType(null);
              setNewValue("");
              setMiniModalError(null); // Limpiar error al cerrar
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
                {miniModalError && ( // Mostrar el mensaje de error del mini-modal
                  <p className="text-red-500 text-sm mt-2">{miniModalError}</p>
                )}
                <div className="flex justify-end mt-4 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setMiniModalOpen(false);
                      setCurrentType(null);
                      setNewValue("");
                      setMiniModalError(null); // Limpiar error al cancelar
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
          </Modal>,
          document.body
        )}
    </div>
  );
}
