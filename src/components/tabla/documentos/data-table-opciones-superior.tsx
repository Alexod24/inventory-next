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
  nombre: string;
  url: string;
  creado_por: string;
  fecha_reporte: string; // Cambiado a string para manejar fechas ISO
  creado_en: string; // Cambiado a string para manejar fechas ISO
  descripcion: string;
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
  const [items, setItems] = useState<Crear[]>([]);

  const loadData = async () => {
    const { data, error } = await supabase.from("documentos").select("*");
    if (!error) setItems(data || []);
    else console.error(error);
    console.log(items);
  };

  useEffect(() => {
    loadData();
  }, []);
  // -----------------------------------------------------------------------------------------------

  const validateData = (data: any) => {
    if (
      !data.nombre ||
      !data.creado_por ||
      !data.fecha_reporte ||
      !data.creado_en
    ) {
      return false;
    }
    return true;
  };

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Obtenemos los datos del formulario
    const nombre = formData.get("nombre") as string;
    const creado_por = formData.get("creado_por") as string;
    const fecha_reporte = formData.get("fecha_reporte") as string;
    const creado_en = formData.get("creado_en") as string;
    const descripcion = formData.get("descripcion") as string;

    // Obtenemos el archivo (pdf) que se subirá al bucket
    const file = formData.get("archivo") as File | null;
    console.log("Archivo recibido", file);
    console.log({ nombre, creado_por, fecha_reporte, creado_en, descripcion });

    // Validación básica
    if (!nombre || !creado_por || !fecha_reporte || !creado_en || !file) {
      console.error("Datos incompletos o archivo no seleccionado");
      return;
    }

    try {
      // Subir archivo al bucket 'documentos'
      // Para evitar sobreescribir, podemos usar un nombre único, por ejemplo con timestamp:
      const filePath = `documentos/${Date.now()}_${file.name}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documentos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Error subiendo archivo:", uploadError);
        return;
      }

      // Obtener la URL pública del archivo (opcional, si quieres mostrar después)
      const {
        data: { publicUrl },
        error: urlError,
      } = supabase.storage.from("documentos").getPublicUrl(filePath);

      if (urlError) {
        console.warn("No se pudo obtener URL pública:", urlError);
      }

      // Insertar datos en tabla documentos con la ruta o URL del archivo
      const { data, error } = await supabase
        .from("documentos")
        .insert([
          {
            nombre,
            url: publicUrl || filePath,
            creado_por,
            fecha_reporte,
            creado_en,
            descripcion,
          },
        ])
        .select("*");

      if (error) {
        console.error("Error al crear documento en la tabla:", error);
        return;
      }

      setItems((prev) => [...prev, ...data]);
      closeModal();
      await fetchData();
    } catch (err) {
      console.error("Error en handleCreate:", err);
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
              Crear
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Llena los campos para almacenar un documento.
            </p>
          </div>
          <form
            className="flex flex-col"
            onSubmit={handleCreate}
            encType="multipart/form-data"
          >
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="lg:col-span-2">
                  <Label>Nombre</Label>
                  <Input
                    type="text"
                    name="nombre"
                    placeholder="Nombre del documento"
                  />
                </div>
                <div className="lg:col-span-2">
                  <Label>URL</Label>
                  <div>
                    <Input
                      type="file"
                      name="archivo"
                      accept="application/pdf"
                      required
                    />
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <Label>Creador</Label>
                  <Input
                    type="text"
                    name="creado_por"
                    placeholder="Ej. Dania"
                  />
                </div>
                <div>
                  <Label>Fecha Inventario</Label>
                  <Input
                    type="date"
                    name="fecha_reporte"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    readOnly
                  />
                </div>
                <div>
                  <Label>Fecha Creacion</Label>
                  <Input
                    type="date"
                    name="creado_en"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    readOnly
                  />
                </div>
                <div className="lg:col-span-2">
                  <Label>Descripcion</Label>
                  <Input
                    type="text"
                    name="descripcion"
                    placeholder="Ej. Reporte semanal"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>

              <Button size="sm" type="submit">
                Crear
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
