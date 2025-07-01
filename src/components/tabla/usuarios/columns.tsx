"use client";

import { ColumnDef } from "@tanstack/react-table";
// IMPORTANTE: Cambiamos 'BaseOperativa' a 'UsuarioConEmail'
// Asegúrate de definir esta interfaz en un archivo como 'schema.ts' o directamente aquí
// y que coincida exactamente con lo que devuelve tu función RPC de Supabase.
import { DataTableColumnHeader } from "./data-table-column-header";
import { cn } from "@/lib/utils"; // Asegúrate de que la ruta sea correcta para tu utilidad 'cn'

// Definición de la interfaz UsuarioConEmail
// Esta interfaz representa la estructura de los datos que tu función RPC devuelve.
interface UsuarioConEmail {
  id: string; // UUID de Supabase Auth
  nombre: string;
  rol: string;
  email: string; // Este campo viene de auth.users a través de la RPC
  created_at: string; // Este campo viene de tu tabla 'usuarios'
  // Si tu función RPC retorna más campos, añádelos aquí.
}

export const columns: ColumnDef<UsuarioConEmail>[] = [
  {
    accessorKey: "rowIndex", // Un nombre clave para esta columna que no existe en tus datos
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nº" />
    ),
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <span className="font-bold">
          {row.index + 1} {/* Muestra el número de fila empezando desde 1 */}
        </span>
        {/*
          IMPORTANTE: Eliminamos 'row.getValue("descripcion")' de aquí
          porque tu función RPC ya no devuelve una columna llamada 'descripcion'.
          Si necesitas una descripción, debería ser un campo real en tu tabla 'usuarios'
          o devuelto por tu RPC. Por ahora, solo mostramos el número de fila.
        */}
      </div>
    ),
    enableSorting: false, // Las filas numeradas no se ordenan
    enableColumnFilter: false, // No se filtra por el número de fila
  },

  {
    accessorKey: "nombre",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) => (
      <div className="w-[150px] capitalize">{row.getValue("nombre")}</div>
    ),
    filterFn: (row, id, filterValue) => {
      const value = row.getValue(id) as string;
      return value
        .toLowerCase()
        .includes((filterValue as string).toLowerCase());
    },
  },

  {
    accessorKey: "email", // El campo 'email' ahora viene de la RPC
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Correo" />
    ),
    cell: ({ row }) => (
      <div className="flex w-[200px] items-center">
        {" "}
        {/* Aumentamos el ancho para el correo */}
        <span className="truncate">{row.getValue("email")}</span>{" "}
        {/* 'truncate' útil para correos largos */}
      </div>
    ),
    filterFn: (row, id, filterValue) => {
      const value = row.getValue(id) as string;
      return value
        .toLowerCase()
        .includes((filterValue as string).toLowerCase());
    },
  },

  // --- ¡COLUMNA 'contraseña' ELIMINADA POR RAZONES DE SEGURIDAD! ---
  // Esta columna fue eliminada completamente. No debe aparecer en tu código.
  // Es la mejor práctica no mostrar ni almacenar contraseñas visibles.
  // -----------------------------------------------------------------

  {
    accessorKey: "rol",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rol" />
    ),
    cell: ({ row }) => {
      const rolValue = row.getValue("rol") as string; // 'rol' es un string (ej. "usuario", "admin")
      // Eliminamos la lógica de 'cantidad' y 'isPositive' ya que 'rol' no es un número.
      // Si quieres estilos condicionales basados en el rol string, puedes hacerlo aquí:
      // Ejemplo: const textColor = rolValue === 'admin' ? 'text-red-500' : 'text-blue-500';
      return (
        <div className="flex w-[100px] items-center">
          <span className="capitalize">{rolValue}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      // Filtro simple de texto para el 'rol' (que es un string)
      const rowValue = row.getValue(id) as string;
      return rowValue.toLowerCase().includes((value as string).toLowerCase());
    },
  },

  {
    accessorKey: "created_at", // Cambiado de "fecha" a "created_at" para coincidir con la RPC
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha de Registro" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      // Formato de fecha para Perú
      const formattedDate = date.toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      return (
        <div className="flex w-[120px] items-center">
          {" "}
          {/* Ajusta el ancho si es necesario */}
          <span>{formattedDate}</span>
        </div>
      );
    },
    filterFn: (row, id, filterValue) => {
      const rowDate = new Date(row.getValue(id));
      if (
        !filterValue ||
        !(filterValue instanceof Array) ||
        filterValue.length !== 2
      )
        return true;
      const [startDate, endDate] = filterValue as [Date, Date];
      return rowDate >= startDate && rowDate <= endDate;
    },
  },
  // Opcional: Columna para el ID UUID del usuario, útil para depuración o si necesitas mostrarlo
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID (Auth)" />
    ),
    cell: ({ row }) => (
      <div className="text-sm text-gray-500 truncate">{row.getValue("id")}</div>
    ),
    enableSorting: false,
    enableColumnFilter: false,
    enableHiding: true, // Permite ocultar esta columna si es muy larga
  },
  // Opcional: Columna de acciones (editar, eliminar, etc.)
  // Descomenta y ajusta si tienes un componente DataTableRowActions
  // {
  //   id: "actions",
  //   cell: ({ row }) => <DataTableRowActions row={row} />,
  // },
];
