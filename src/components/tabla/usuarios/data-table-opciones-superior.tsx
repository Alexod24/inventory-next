// eslint-disable @typescript-eslint/no-unused-vars
"use client";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// CAMBIO IMPORTANTE: Usar el cliente de Supabase para el navegador
import { createClientComponentClient } from "@/app/utils/supabase/browser"; // <--- Nueva ruta y nombre

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

import { signUp } from "@/app/actions/auth";
import Alert from "@/components/ui/alerta/AlertaExito"; // <--- IMPORTACIÓN DE TU COMPONENTE ALERT
import ReactDOM from "react-dom"; // <--- IMPORTACIÓN NECESARIA PARA REACT PORTALS

// ---------------------------------------------------------------------------------------------
interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
  fetchData: () => Promise<void>;
}
interface Crear {
  descripcion: string;
  proveedor: string;
  cantidad: number;
  tamano: string;
  material: string;
  fecha: string;
  valor: number;
  estado: string;
  disponibilidad: string;
}

const opcionesRol = [
  { value: "empleado", label: "Empleado" },
  { value: "admin", label: "Admin" },
];
// ---------------------------------------------------------------------------------------------
export function DataTableViewOptions<TData>({
  table,
  fetchData,
}: DataTableViewOptionsProps<TData>) {
  const { isOpen, openModal, closeModal } = useModal();
  const [items, setItems] = useState<Crear[]>([]);
  // Nuevo estado para controlar la alerta personalizada
  const [currentAlert, setCurrentAlert] = useState<{
    visible: boolean;
    variant: "success" | "error" | "warning"; // Asume que 'error' es un variant válido en tu componente Alert
    title: string;
    message: string;
  } | null>(null);

  // Inicializa el cliente de Supabase para el navegador aquí
  const supabase = createClientComponentClient(); // <--- Inicialización del cliente de navegador

  const loadData = async () => {
    // Usa la instancia de Supabase creada
    const { data, error } = await supabase.from("usuarios").select("*");
    if (!error) setItems(data || []);
    else console.error("Error al cargar datos de usuarios:", error);
    console.log("Datos de usuarios cargados:", data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setCurrentAlert(null); // Limpia cualquier alerta anterior al intentar crear

    const formData = new FormData(e.target as HTMLFormElement);

    try {
      console.log("DataTableViewOptions: Llamando a signUp con formData...");
      const result = await signUp(formData); // Usa la función `signUp` del archivo `auth`.

      if (result.success) {
        console.log(
          "DataTableViewOptions: Usuario registrado exitosamente. Cerrando modal y actualizando tabla."
        );
        closeModal(); // Cierra el modal si se usa uno.
        await fetchData(); // Actualiza la tabla.
        setCurrentAlert({
          visible: true,
          variant: "success",
          title: "¡Usuario Creado!",
          message: "El nuevo usuario ha sido registrado exitosamente.",
        });
        // Opcional: Ocultar la alerta después de un tiempo
        setTimeout(() => setCurrentAlert(null), 3000);
      } else {
        // Muestra el error específico que viene de la Server Action
        console.error(
          "DataTableViewOptions: Tienes que colocar un correo válido"
        );
        setCurrentAlert({
          visible: true,
          variant: "error", // O "warning" si tu componente Alert no tiene el tipo 'error'
          title: "Error al Registrar",
          message:
            result.error ||
            "Ocurrió un error desconocido al registrar el usuario.",
        });
        // Opcional: Ocultar la alerta después de un tiempo
        setTimeout(() => setCurrentAlert(null), 5000);
      }
    } catch (err: any) {
      console.error(
        "DataTableViewOptions: Error CRÍTICO en handleCreate:",
        err
      );
      // Aquí podrías mostrar un mensaje de error genérico al usuario
      setCurrentAlert({
        visible: true,
        variant: "error",
        title: "Error Inesperado",
        message:
          "Ocurrió un error inesperado al intentar registrar el usuario.",
      });
      setTimeout(() => setCurrentAlert(null), 5000);
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
              Crear Usuario
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Llena los campos para registrar un nuevo usuario.
            </p>
          </div>
          <form className="flex flex-col" onSubmit={handleCreate}>
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="lg:col-span-2">
                  <Label>Correo</Label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="Correo electrónico"
                    required
                  />
                </div>

                <div className="relative">
                  <Label>Contraseña</Label>
                  <Input
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                  />
                </div>

                <div>
                  <Label>Repetir Contraseña</Label>
                  <Input
                    type="password"
                    name="repeatPassword"
                    placeholder="Repetir Contraseña"
                  />
                </div>

                <div>
                  <Label>Nombre</Label>
                  <Input
                    type="text"
                    name="nombre"
                    placeholder="Nombre de usuario"
                  />
                </div>

                {/* Disponibilidad */}
                <div>
                  <Label>Rol</Label>
                  <Select
                    name="rol"
                    options={opcionesRol}
                    placeholder="Selecciona el rol"
                    className="dark:bg-dark-900"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>

              <Button size="sm" type="submit">
                Crear Usuario
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Renderiza la alerta personalizada usando un Portal */}
      {currentAlert &&
        currentAlert.visible &&
        typeof document !== "undefined" &&
        ReactDOM.createPortal(
          <div className="fixed top-4 right-4 z-[99999]">
            {" "}
            {/* Z-index muy alto */}
            <Alert
              variant={currentAlert.variant}
              title={currentAlert.title}
              message={currentAlert.message}
              showLink={false} // Ajusta esto según si quieres enlaces en tus alertas
            />
          </div>,
          document.body // Renderiza directamente en el body
        )}
    </div>
  );
}
