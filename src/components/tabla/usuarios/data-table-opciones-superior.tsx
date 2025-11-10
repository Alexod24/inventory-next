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
import { createClientComponentClient } from "@/app/utils/supabase/browser"; // <--- Ruta actualizada

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

// --- ¡¡CAMBIO CLAVE!! ---
// Importamos la nueva Server Action de Admin en lugar de 'signUp'
import { createUserAsAdmin } from "@/app/actions/admin-atuh"; // <--- ¡NUEVA IMPORTACIÓN!
import Alert from "@/components/ui/alerta/AlertaExito";
import ReactDOM from "react-dom";

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
  const [currentAlert, setCurrentAlert] = useState<{
    visible: boolean;
    variant: "success" | "error" | "warning";
    title: string;
    message: string;
  } | null>(null);

  // Inicializa el cliente de Supabase para el navegador aquí
  const supabase = createClientComponentClient();

  const loadData = async () => {
    // Usa la instancia de Supabase creada
    const { data, error } = await supabase.from("usuarios").select("*");
    if (!error) setItems(data || []);
    else console.error("Error al cargar datos de usuarios:", error);
    // console.log("Datos de usuarios cargados:", data); // Este log ya lo tienes
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    console.log("handleCreate: Formulario enviado.");
    setCurrentAlert(null); // Limpia cualquier alerta anterior

    const formData = new FormData(e.target as HTMLFormElement);

    // --- NUEVO CONSOLE.LOG ---
    // Útil para ver exactamente qué datos se están enviando
    console.log(
      "handleCreate: Datos del FormData:",
      Object.fromEntries(formData.entries())
    );

    try {
      // --- ¡¡CAMBIO CLAVE!! ---
      // Llamamos a la nueva acción de admin
      console.log(
        "DataTableViewOptions: Llamando a 'createUserAsAdmin' con formData..."
      );
      await createUserAsAdmin(formData); // <--- ¡ACCIÓN CORREGIDA!

      console.log(
        "Usuario registrado exitosamente. Cerrando modal y actualizando tabla."
      );
      closeModal();
      await fetchData(); // Actualiza la tabla en el cliente
      setCurrentAlert({
        visible: true,
        variant: "success",
        title: "¡Usuario Creado!",
        message: "El nuevo usuario ha sido registrado exitosamente.",
      });
      setTimeout(() => setCurrentAlert(null), 3000);
    } catch (err: any) {
      // --- NUEVO CONSOLE.LOG ---
      console.error(
        "DataTableViewOptions: Error CRÍTICO en handleCreate (recibido del servidor):",
        err
      );
      console.error(
        "DataTableViewOptions: Mensaje de error específico:",
        err.message
      );

      setCurrentAlert({
        visible: true,
        variant: "error",
        title: "Error al Registrar",
        // Mostramos el mensaje de error exacto que viene de nuestra Server Action
        message: err.message || "Ocurrió un error al registrar el usuario.",
      });
      setTimeout(() => setCurrentAlert(null), 5000); // Más tiempo para leer el error
    }
  };

  // -----------------------------------------------------------------------------------------------
  // ... (EL RESTO DE TU CÓDIGO JSX NO CAMBIA)
  // ... (Tu <DropdownMenu>, <Button>, <Modal>, <form>, <Input>, <Select>...)
  // ... (Tu ReactDOM.createPortal para las alertas...)
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
                    required // <-- Añadido 'required'
                  />
                </div>

                <div>
                  <Label>Repetir Contraseña</Label>
                  <Input
                    type="password"
                    name="repeatPassword"
                    placeholder="Repetir Contraseña"
                    required // <-- Añadido 'required'
                    // Nota: Deberías añadir lógica para validar que las contraseñas coinciden
                  />
                </div>

                <div>
                  <Label>Nombre</Label>
                  <Input
                    type="text"
                    name="nombre"
                    placeholder="Nombre de usuario"
                    required // <-- Añadido 'required'
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
              showLink={false}
            />
          </div>,
          document.body // Renderiza directamente en el body
        )}
    </div>
  );
}
