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
// import Alert from "@/components/ui/alerta/Alerta"

import { Button } from "@/components/ui/button";
import { exportarToPDF } from "@/components/exportar/exportarPDF";
import { useState, useEffect, FormEvent } from "react";
import { Modal } from "../../ui/modal";
import { useModal } from "../../../hooks/useModal";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { MixerHorizontalIcon, PlusIcon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

// -------------------------------------------------------------------------------------
type Crear = {
  descripcion: string;
  proveedor: string;
  marca: string;
  cantidad: number;
  tamano: string;
  material: string;
  fecha: string;
  valor: number;
  estado: string;
  justificacion: string;
};

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
  viewOptions: { showHiddenColumns: boolean; customView: string };
  setViewOptions: React.Dispatch<
    React.SetStateAction<{ showHiddenColumns: boolean; customView: string }>
  >;
  fetchData: () => Promise<void>;
}
// -------------------------------------------------------------------------------------

export function DataTableViewOptions<TData>({
  table,
  fetchData,
}: DataTableViewOptionsProps<TData>) {
  const { isOpen, openModal, closeModal } = useModal();
  const [items, setItems] = useState<Crear[]>([]);
  const [marcas, setMarcas] = useState<{value: string; label: string}[]>([]);
  const [colores, setColores] = useState<{value: string; label: string}[]>([]);
  const [materiales, setMateriales] = useState<{value: string; label: string}[]>([]);
  const [proveedores, setProveedores] = useState<{value: string; label: string}[]>([]);
  const [estados, setEstados] = useState<{value: string; label: string}[]>([]);
  const [isMiniModalOpen, setMiniModalOpen] = useState(false);
  const [newMarca, setNewMarca] = useState("");
  const [newProveedor, setNewProveedor] = useState("");
  const [newMaterial, setNewMaterial] = useState("");
  const [newColor, setNewColor] = useState("");
  const [newEstado, setNewEstado] = useState("");
  

  const [alertaExito, setAlertaExito ] = useState(false);

  const loadData = async () => {
    const { data, error } = await supabase.from("base_operativa").select("*");
    if (!error) setItems(data || []);
    else console.error(error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const options = [
      { value: "marketing", label: "Marketing" },
      { value: "template", label: "Template" },
      { value: "development", label: "Development" },
    ];
  
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
  
    const handleSelectChange = (value: string) => {
      console.log("Selected value:", value);
    };
// -------------------------------------------------------------------------------------

useEffect(() => {
  const fetchOpciones = async () => {
    const { data: marcasData } = await supabase.from("marcas").select("nombre");
    if (marcasData) {
      setMarcas(marcasData.map(m => ({ value: m.nombre, label: m.nombre })));
    }
    const { data: coloresData } = await supabase.from("colores").select("nombre");
    if (coloresData) {
      setColores(coloresData.map(c => ({ value: c.nombre, label: c.nombre })));
    }
    const { data: materialesData } = await supabase.from("materiales").select("nombre");
    if (materialesData) {
      setMateriales(materialesData.map(m => ({ value: m.nombre, label: m.nombre })));
    }
    const { data: proveedoresData } = await supabase.from("proveedores").select("nombre");
    if (proveedoresData) {
      setProveedores(proveedoresData.map(c => ({ value: c.nombre, label: c.nombre })));
    }
    const { data: estadosData } = await supabase.from("estados").select("nombre");
    if (estadosData) {
      setEstados(estadosData.map(c => ({ value: c.nombre, label: c.nombre })));
    }
    
  };
  fetchOpciones();
}, []);


// -------------------------------------------------------------------------------------
  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();

    const formData = new FormData(event.target as HTMLFormElement);
    const productData = Object.fromEntries(formData);

    if (productData.fecha) {
      productData.fecha = new Date(productData.fecha as string).toISOString();
    }

    try {
      const { data, error } = await supabase.from("base_operativa").insert([productData]).select("*");
      if (error) {
        console.error("Error al crear producto:", error.message);
        return;
      }

      setItems((prevItems) => [...prevItems, ...data]);
      closeModal();
      setAlertaExito(true);

      setTimeout(() => {
        setAlertaExito(false); // Oculta la alerta después de 3 segundos
      }, 3000);

      await fetchData();
    } catch (err) {
      console.error("Error inesperado en handleCreate:", err);
    }
  };

// -------------------------------------------------------------------------------------
const fetchMarcas = async () => {
    const { data: marcasData, error } = await supabase.from("marcas").select("nombre");
    if (!error && marcasData) {
      setMarcas(marcasData.map((m) => ({ value: m.nombre, label: m.nombre })));
    } else {
      console.error("Error al cargar marcas:", error);
    }
  };

  useEffect(() => {
    fetchMarcas();
  }, []);

  const handleCreateMarca = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMarca.trim()) return;

    const { error } = await supabase.from("marcas").insert([{ nombre: newMarca }]);
    if (error) {
      console.error("Error al crear marca:", error);
    } else {
      await fetchMarcas();
      setMiniModalOpen(false);
      setNewMarca(""); // Limpia el campo
    }
  };
// -------------------------------------------------------------------------------------
const fetchProveedores = async () => {
    const { data: proveedoresData, error } = await supabase.from("proveedores").select("nombre");
    if (!error && proveedoresData) {
      setProveedores(proveedoresData.map((m) => ({ value: m.nombre, label: m.nombre })));
    } else {
      console.error("Error al cargar proveedores:", error);
    }
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  const handleCreateProveedor = async (e: FormEvent) => {
    e.preventDefault();
    if (!newProveedor.trim()) return;

    const { error } = await supabase.from("proveedores").insert([{ nombre: newProveedor }]);
    if (error) {
      console.error("Error al crear marca:", error);
    } else {
      await fetchProveedores();
      setMiniModalOpen(false);
      setNewProveedor(""); // Limpia el campo
    }
  };
// -------------------------------------------------------------------------------------
const fetchMateriales = async () => {
    const { data: materialesData, error } = await supabase.from("materiales").select("nombre");
    if (!error && materialesData) {
      setMateriales(materialesData.map((m) => ({ value: m.nombre, label: m.nombre })));
    } else {
      console.error("Error al cargar materiales:", error);
    }
  };

  useEffect(() => {
    fetchMateriales();
  }, []);

  const handleCreateMaterial = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMaterial.trim()) return;

    const { error } = await supabase.from("materiales").insert([{ nombre: newMaterial }]);
    if (error) {
      console.error("Error al crear material:", error);
    } else {
      await fetchMateriales();
      setMiniModalOpen(false);
      setNewMaterial(""); // Limpia el campo
    }
  };
// -------------------------------------------------------------------------------------
const fetchColores = async () => {
    const { data: coloresData, error } = await supabase.from("colores").select("nombre");
    if (!error && coloresData) {
      setColores(coloresData.map((m) => ({ value: m.nombre, label: m.nombre })));
    } else {
      console.error("Error al cargar colores:", error);
    }
  };

  useEffect(() => {
    fetchColores();
  }, []);

  const handleCreateColor = async (e: FormEvent) => {
    e.preventDefault();
    if (!newColor.trim()) return;

    const { error } = await supabase.from("colores").insert([{ nombre: newColor }]);
    if (error) {
      console.error("Error al crear color:", error);
    } else {
      await fetchColores();
      setMiniModalOpen(false);
      setNewColor(""); // Limpia el campo
    }
  };
// -------------------------------------------------------------------------------------

const fetchEstados = async () => {
    const { data: estadosData, error } = await supabase.from("estados").select("nombre");
    if (!error && estadosData) {
      setEstados(estadosData.map((m) => ({ value: m.nombre, label: m.nombre })));
    } else {
      console.error("Error al cargar estados:", error);
    }
  };

  useEffect(() => {
    fetchEstados();
  }, []);

  const handleCreateEstado = async (e: FormEvent) => {
    e.preventDefault();
    if (!newEstado.trim()) return;

    const { error } = await supabase.from("estados").insert([{ nombre: newEstado }]);
    if (error) {
      console.error("Error al crear estado:", error);
    } else {
      await fetchEstados();
      setMiniModalOpen(false);
      setNewEstado(""); // Limpia el campo
    }
  };
// -------------------------------------------------------------------------------------
  return (
    <div className="flex space-x-2 ml-auto">
      
      {/* Botón Vista */}
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

      {/* Botón Exportar */}
      <Button
        variant="outline"
        size="sm"
        className="hidden h-8 lg:flex items-center"
        onClick={() => exportarToPDF(table)}
      >
        Exportar
      </Button>

      {/* Botón Agregar */}
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
  <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11"
   style={{ maxHeight: "100vh" }}>
    <div className="px-2 pr-14">
      <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
        Crear Producto
      </h4>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
        Llena los campos para registrar un nuevo producto.
      </p>
    </div>
    <form 
      className="flex flex-col"
      onSubmit={handleCreate} // Aquí se gestiona la creación
    >
      <div className="px-2 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">

          <div className="lg:col-span-2">
            <Label>Descripción</Label>
            <Input type="text" name="descripcion" placeholder="Ej. Caja de herramientas" required />
          </div>

          <div>
            <Label>Proveedor</Label>
            <div className="flex items-center space-x-2">
              <Select
            name="proveedor"
            options={proveedores}
            placeholder="Selecciona un proveedor"
            onChange={handleSelectChange}
            className="dark:bg-dark-900"/>
            <Button size="sm" onClick={() => setMiniModalOpen(true)}>+</Button>
            </div>
          </div>

         <div>
            <Label>Marca</Label>
            <div className="flex items-center space-x-2">
              <Select
                name="marca"
                options={marcas}
                placeholder="Selecciona una marca"
                onChange={handleSelectChange}
                className="dark:bg-dark-900 flex-1"
              />
              <Button size="sm" onClick={() => setMiniModalOpen(true)}>+</Button>
            </div>
          </div>

          

          <div>
            <Label>Tamaño</Label>
            <Input type="text" name="tamano" placeholder="Ej. Grande" />
          </div>

        
          <div>
            <Label>Cantidad</Label>
            <Input type="number" name="cantidad" min="1" placeholder="Ej. 10" required />
          </div>

          <div>
            <Label>Material</Label>
            <div className="flex items-center space-x-2">
              <Select
                type="text"
                name="material"
                options={materiales}
                placeholder="Selecciona un material"
                onChange={handleSelectChange}
                className="dark:bg-dark-900 flex-1"
              />
              <Button size="sm" onClick={() => setMiniModalOpen(true)}>+</Button>
            </div>
          </div>

            <div>
            <Label>Color</Label>
            <div className="flex items-center space-x-2">
              <Select
            type="text"
            name="color"
            options={colores}
            placeholder="Selecciona un color"
            onChange={handleSelectChange}
            className="dark:bg-dark-900"
          />
          <Button size="sm" onClick={() => setMiniModalOpen(true)}>+</Button>
            </div>
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
            <Label>Valor</Label>
            <Input type="number" name="valor" step="0.01" placeholder="Ej. 250.00" required />
          </div>

          <div>
            <Label>Estado</Label>
            <div className="flex items-center space-x-2">
              <Select
            
            name="estado"
            options={estados}
            placeholder="Selecciona el estado"
            onChange={handleSelectChange}
            className="dark:bg-dark-900"
          />
            <Button size="sm" onClick={() => setMiniModalOpen(true)}>+</Button>
            </div>
          </div>

          <div >
            <Label>Disponibilidad</Label>
            <Input type="text" name="justificacion" placeholder="Razón de compra o ingreso" />
          </div>

        </div>
      </div>
      

      <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
        <Button size="sm" variant="outline" onClick={closeModal}>
          Cancelar
        </Button>

        
        <Button size="sm" type="submit">
          Crear Producto
        </Button>
      </div>
    </form>
  </div>
</Modal>

{/* ------------------------------------------------------------------------------------- */}

 {isMiniModalOpen && (
        <Modal isOpen={isMiniModalOpen} onClose={() => setMiniModalOpen(false)} className="max-w-[400px] m-4">
          <div className="w-full p-4 bg-white rounded-lg dark:bg-gray-900">
            <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">Agregar Nueva Marca</h4>
            <form onSubmit={handleCreateMarca}>
              <Label>Nombre de la Marca</Label>
              <Input
                type="text"
                name="newMarca"
                value={newMarca}
                onChange={(e) => setNewMarca(e.target.value)}
                placeholder="Ej. Nike"
                
              />
              <div className="flex justify-end mt-4 gap-2">
                <Button size="sm" variant="outline" onClick={() => setMiniModalOpen(false)}>
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

 {/* ------------------------------------------------------------------------------------- */}

 {isMiniModalOpen && (
        <Modal isOpen={isMiniModalOpen} onClose={() => setMiniModalOpen(false)} className="max-w-[400px] m-4">
          <div className="w-full p-4 bg-white rounded-lg dark:bg-gray-900">
            <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">Agregar Nuevo Proveedor</h4>
            <form onSubmit={handleCreateProveedor}>
              <Label>Nombre del proveedor</Label>
              <Input
                type="text"
                name="newProveedor"
                value={newProveedor}
                onChange={(e) => setNewProveedor(e.target.value)}
                placeholder="Ej. Nike"
                
              />
              <div className="flex justify-end mt-4 gap-2">
                <Button size="sm" variant="outline" onClick={() => setMiniModalOpen(false)}>
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

{/* ------------------------------------------------------------------------------------- */}

 {isMiniModalOpen && (
        <Modal isOpen={isMiniModalOpen} onClose={() => setMiniModalOpen(false)} className="max-w-[400px] m-4">
          <div className="w-full p-4 bg-white rounded-lg dark:bg-gray-900">
            <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">Agregar Nuevo Proveedor</h4>
            <form onSubmit={handleCreateMaterial}>
              <Label>Nombre del material</Label>
              <Input
                type="text"
                name="newMaterial"
                value={newMaterial}
                onChange={(e) => setNewMaterial(e.target.value)}
                placeholder="Ej. Nike"
                
              />
              <div className="flex justify-end mt-4 gap-2">
                <Button size="sm" variant="outline" onClick={() => setMiniModalOpen(false)}>
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

 {/* ------------------------------------------------------------------------------------- */}

 {isMiniModalOpen && (
        <Modal isOpen={isMiniModalOpen} onClose={() => setMiniModalOpen(false)} className="max-w-[400px] m-4">
          <div className="w-full p-4 bg-white rounded-lg dark:bg-gray-900">
            <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">Agregar Nuevo Proveedor</h4>
            <form onSubmit={handleCreateColor}>
              <Label>Nombre del color</Label>
              <Input
                type="text"
                name="newColor"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                placeholder="Ej. Nike"
                
              />
              <div className="flex justify-end mt-4 gap-2">
                <Button size="sm" variant="outline" onClick={() => setMiniModalOpen(false)}>
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
