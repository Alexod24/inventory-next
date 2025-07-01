"use client";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { supabase } from "@/app/utils/supabase/supabase"; // Asegúrate de que esta importación sea correcta para el cliente de navegador
// Si estás usando createClientComponentClient, deberías importarlo así:
// import { createClientComponentClient } from "@/app/utils/supabase/browser";

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
import ReactDOM from "react-dom"; // Importar ReactDOM para createPortal

type Bienes = {
  codigo: string;
  nombre: string;
  categorias?: { nombre: string };
  subcategoria_id: number;
  proveedor_id?: number;
  espacio_id: number;
  cantidad: number;
  fecha_adquisicion?: string;
  valor: number;
  estado: string;
  disponibilidad: boolean;
  observaciones?: string;
  usuario_id: string;

  subcategorias?: { id: number; nombre: string };
  proveedores?: { id: number; nombre: string };
  espacios?: { id: number; nombre: string };
};

interface Option {
  value: string | number; // Asegúrate de que 'value' pueda ser string o number
  label: string;
}

const opcionesEstado: Option[] = [
  { value: "bueno", label: "Bueno" },
  { value: "dañado", label: "Dañado" },
  { value: "roto", label: "Roto" },
];

const opcionesDisponibilidad: Option[] = [
  { value: true, label: "Ok" },
  { value: false, label: "Faltante" },
];

// -----------------------------------------------------------------------------------------------
const generateCode = (
  categoriaNombre: string,
  subcategoriaNombre: string,
  nombre: string,
  suffix: string = "001" // Valor predeterminado
) => {
  const categoriaCode = categoriaNombre.slice(0, 3).toUpperCase(); // Primeras 3 letras
  const subcategoriaCode = subcategoriaNombre.slice(0, 3).toUpperCase(); // Primeras 3 letras
  // Asegúrate de que 'nombre' no sea undefined o null antes de usar split y map
  const nombreCode = nombre
    ? nombre
        .split(" ")
        .map((word) => word.slice(0, 3).toUpperCase())
        .join("-")
    : ""; // Une las iniciales con guiones

  return `${categoriaCode}-${subcategoriaCode}-${nombreCode}-${suffix}`;
};
// -----------------------------------------------------------------------------------------------
const fetchSimilarCodes = async (baseCode: string) => {
  const { data, error } = await supabase
    .from("bienes")
    .select("codigo")
    .like("codigo", `${baseCode}%`); // Busca códigos similares

  if (error) {
    console.error("Error al buscar códigos similares:", error);
    return [];
  }

  return data.map((item) => item.codigo);
};

const calculateNextSuffix = (existingCodes: string[], baseCode: string) => {
  const suffixes = existingCodes
    .map((code) => {
      const match = code.match(/-(\d{3})$/); // Extrae el sufijo numérico
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((num) => num !== null); // Filtra valores no válidos

  const nextSuffix = Math.max(0, ...suffixes) + 1; // Incrementa el mayor valor
  return nextSuffix.toString().padStart(3, "0"); // Formatea con ceros a la izquierda
};

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
    categorias: [] as Option[],
    // IMPORTANTE: 'subcategorias' ha sido eliminado de aquí, ya que se maneja con 'filteredSubcategories'
    proveedores: [] as Option[],
    espacios: [] as Option[],
    usuarios: [] as Option[],
  });

  // Nuevo estado para las subcategorías filtradas
  const [filteredSubcategories, setFilteredSubcategories] = useState<Option[]>(
    []
  );

  const [isMiniModalOpen, setMiniModalOpen] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [currentType, setCurrentType] = useState<string | null>(null); // Asegúrate de que sea string | null
  const [codigo, setCodigo] = useState("");
  // Cambiado a 'undefined' para consistencia con el warning de React Select
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<
    string | undefined
  >(undefined);
  // Cambiado a 'undefined' para consistencia con el warning de React Select
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState<
    string | undefined
  >(undefined);
  const [nombreBien, setNombreBien] = useState("");
  const [fechaPredeterminada, setFechaPredeterminada] = useState(
    new Date().toISOString().split("T")[0] // Fecha actual en formato "YYYY-MM-DD"
  );
  // Nuevo estado para manejar mensajes de error en el mini-modal
  const [miniModalError, setMiniModalError] = useState<string | null>(null);

  // -----------------------------------------------------------------------------------------------
  useEffect(() => {
    if (categoriaSeleccionada && subcategoriaSeleccionada && nombreBien) {
      const categoriaNombre = options.categorias.find(
        (cat) => cat.value.toString() === categoriaSeleccionada
      )?.label;
      const subcategoriaNombre = filteredSubcategories.find(
        // Usar filteredSubcategories
        (subcat) => subcat.value.toString() === subcategoriaSeleccionada
      )?.label;

      if (categoriaNombre && subcategoriaNombre) {
        const codigoGenerado = generateCode(
          categoriaNombre,
          subcategoriaNombre,
          nombreBien
        );
        setCodigo(codigoGenerado);
      }
    }
  }, [
    categoriaSeleccionada,
    subcategoriaSeleccionada,
    nombreBien,
    options.categorias,
    filteredSubcategories,
  ]);
  // -----------------------------------------------------------------------------------------------
  const loadData = async () => {
    const { data, error } = await supabase.from("bienes").select(`
    id,
    codigo,
    nombre,
    cantidad,
    estado,
    disponibilidad,
    categorias (
          nombre
        ),
    subcategorias:subcategoria_id (id, nombre),
    proveedores:proveedor_id (id, nombre),
    espacios:espacio_id (id, nombre)

    `);

    if (error) {
      console.error("Error cargando datos:", error);
    } else {
      setItems(data); // Guarda los datos en el estado para usarlos luego
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {}, [items]);

  // -----------------------------------------------------------------------------------------------

  const fetchOptions = async () => {
    const tables = [
      "categorias",
      "subcategorias",
      "proveedores",
      "espacios",
      "usuarios",
    ];
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

    // Captura y transforma los datos del formulario
    const formData = new FormData(e.target as HTMLFormElement);
    const productData = Object.fromEntries(formData);

    // Obtén los nombres de la categoría y subcategoría desde las opciones
    const categoriaNombre = options.categorias.find(
      (cat) => cat.value === parseInt(productData.categoria as string)
    )?.label;

    const subcategoriaNombre = options.subcategorias.find(
      (subcat) => subcat.value === parseInt(productData.subCategoria as string)
    )?.label;

    if (!categoriaNombre || !subcategoriaNombre || !nombreBien) {
      // Usar nombreBien del estado
      console.error("Faltan datos para generar el código o para la inserción.");
      // Aquí podrías mostrar una alerta al usuario
      return; // Detén la ejecución si no hay datos válidos
    }

    const baseCode = generateCode(
      categoriaNombre,
      subcategoriaNombre,
      productData.nombre,
      "" // Sin sufijo inicial
    );

    // Buscar códigos similares
    const existingCodes = await fetchSimilarCodes(baseCode);

    // Calcular el siguiente sufijo
    const nextSuffix = calculateNextSuffix(existingCodes, baseCode);
    // Generar el código automáticamente

    const codigoGenerado = generateCode(
      categoriaNombre,
      subcategoriaNombre,
      productData.nombre,
      nextSuffix
    );

    const isValidDate = (date: string) => !isNaN(new Date(date).getTime());
    // Ajustar nombres para coincidir con las columnas en la tabla
    const mappedData = {
      codigo: codigoGenerado,
      nombre: productData.nombre,
      categoria_id: parseInt(productData.categoria as string), // Mapeo correcto
      subcategoria_id: parseInt(productData.subCategoria as string), // Mapeo correcto
      usuario_id: productData.usuario_id, // Mapeo correcto
      espacio_id: parseInt(productData.espacio as string), // Mapeo correcto
      cantidad: parseInt(productData.cantidad as string), // Convertir a número
      fecha_adquisicion:
        productData.fecha && productData.fecha !== "Invalid Date"
          ? new Date(productData.fecha as string).toISOString()
          : new Date().toISOString(), // Asigna una fecha válida
      valor: parseFloat(productData.valor as string), // Convertir a número flotante
      proveedor_id: parseInt(productData.proveedor as string), // Mapeo correcto
      disponibilidad: productData.disponibilidad === "true", // Convertir a booleano
      estado: productData.estadoFisico, // Ya está correcto
      observaciones: productData.observaciones, // Ya está correcto
    };
    console.log("Datos mapeados para la base de datos:", mappedData);

    try {
      // Inserta los datos en la base de datos
      const { data, error } = await supabase
        .from("bienes")
        .insert([mappedData])
        .select("*");

      if (error) throw error;

      // Actualiza la lista de elementos y cierra el modal
      setItems((prev) => [...prev, ...data]);
      closeModal();
      await fetchData();
    } catch (err) {
      console.error("Error al crear bien:", err);
      // Aquí podrías mostrar una alerta de error
    }
  };

  // -----------------------------------------------------------------------------------------------
  const handleCreateOption = async (e: FormEvent) => {
    e.preventDefault();
    if (!newValue.trim() || !currentType) return;

    try {
      const { error } = await supabase
        .from(currentType)
        .insert([{ nombre: newValue }]);
      if (error) throw error;

      await fetchOptions();
      setMiniModalOpen(false);
      setNewValue("");
      setCurrentType(null);
    } catch (err) {
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
          <form className="flex flex-col" onSubmit={handleCreate}>
            {/* Contenedor para las columnas */}
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                {/* Código */}
                <div>
                  <Label>Código</Label>
                  <Input
                    type="text"
                    value={codigo}
                    name="codigo"
                    placeholder="Código generado automáticamente"
                    className="!bg-gray-200 cursor-not-allowed"
                  />
                </div>

                {/* Nombre */}
                <div>
                  <Label>Nombre</Label>
                  <Input
                    type="text"
                    name="nombre"
                    placeholder="Ej. Mesa plegable"
                    onChange={(e) => setNombreBien(e.target.value)}
                    placeholder="Nombre del bien"
                    required
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
                      onChange={(selectedOption) =>
                        setCategoriaSeleccionada(
                          selectedOption?.value.toString() || ""
                        )
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

                {/* Sub Categoría */}
                <div>
                  <Label>Sub Categoría</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      name="subCategoria"
                      options={options.subcategorias}
                      placeholder="Selecciona una subcategoría"
                      className="dark:bg-dark-900"
                      value={subcategoriaSeleccionada} // Ahora es un componente controlado
                      onChange={(selectedOption) =>
                        // Asegura que el valor sea string o undefined
                        setSubcategoriaSeleccionada(
                          selectedOption?.value.toString() || ""
                        )
                      }
                      disabled={!categoriaSeleccionada} // Deshabilita si no hay categoría seleccionada
                      required
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
                      required
                    />
                  </div>
                </div>

                {/* Espacio */}
                <div>
                  <Label>Espacio</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      name="espacio"
                      options={options.espacios}
                      placeholder="Ej. Oficina 3"
                      required
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        setCurrentType("espacios"); // Corregido a 'espacios'
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

                {/* Fecha Adquisición */}
                <div>
                  <Label>Fecha de Adquisición</Label>
                  <Input
                    type="date"
                    name="fecha"
                    value={fechaPredeterminada}
                    onChange={(e) => setFechaPredeterminada(e.target.value)}
                    required
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
                    required
                  />
                </div>

                {/* Proveedor */}
                <div>
                  <Label>Proveedor</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      name="proveedor"
                      options={options.proveedores}
                      placeholder="Selecciona un proveedor"
                      className="dark:bg-dark-900"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        setCurrentType("proveedores"); // Corregido a 'proveedores'
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
                    required
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
                    required
                  />
                </div>

                {/* Observaciones */}
                <div className="lg:col-span-2">
                  <Label>Observaciones</Label>
                  <textarea
                    name="observaciones"
                    rows="3"
                    className="w-full p-2 border rounded-lg dark:bg-dark-900 dark:text-white"
                    placeholder="Notas adicionales..."
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
