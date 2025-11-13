"use client";

import { ColumnDef } from "@tanstack/react-table";
// 1. Asegúrate de importar el schema de 'Ingresos'
import { Ingresos } from "./schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { cn } from "@/lib/utils";

// 2. Ya no necesitamos 'formatCurrency' aquí
// const formatCurrency = ... (ELIMINADO)

export const columns: ColumnDef<Ingresos>[] = [
  {
    // --- COLUMNA DE PRODUCTO ---
    // El accessorKey es 'producto' (como en tu DB)
    accessorKey: "producto",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Producto" />
    ),
    cell: ({ row }) => {
      // Usamos la relación 'bienes' (el nombre de la tabla)
      const bienNombre = row.original.bienes?.nombre || "Sin producto";
      return (
        <div className="flex space-x-2">
          <span className="max-w-[400px] truncate capitalize font-medium">
            {bienNombre}
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const bienNombre = row.original.bienes?.nombre || "";
      return bienNombre.toLowerCase().includes((value as string).toLowerCase());
    },
  },
  {
    // --- COLUMNA DE VENDEDOR (ACTIVA) ---
    accessorKey: "usuario_id", // La columna que creamos
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Registrado por" />
    ),
    cell: ({ row }) => {
      // Usamos la relación 'usuarios' (el nombre de la tabla)
      const usuarioNombre = row.original.usuarios?.nombre || "Sin usuario";
      return (
        <div className="flex space-x-2">
          <span className="max-w-[300px] truncate capitalize font-medium">
            {usuarioNombre}
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const usuarioNombre = row.original.usuarios?.nombre || "";
      return usuarioNombre
        .toLowerCase()
        .includes((value as string).toLowerCase());
    },
  },
  {
    accessorKey: "cantidad",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cantidad" />
    ),
    cell: ({ row }) => {
      const cantidad = row.getValue("cantidad") as number;
      return (
        <div className="flex w-[80px] items-center justify-center">
          {/* Como es un INGRESO, lo ponemos en verde */}
          <span className="font-medium text-green-600">+{cantidad}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const cantidad = String(row.getValue(id));
      return cantidad.includes(String(value));
    },
  },
  {
    // --- COLUMNA DE DESCRIPCIÓN ---
    accessorKey: "descripcion",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
    cell: ({ row }) => {
      const descripcion = row.getValue("descripcion") as string;
      return (
        <div className="flex w-[200px] items-center">
          <span className="truncate capitalize">{descripcion}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const descripcion = row.getValue(id) as string;
      return descripcion
        .toLowerCase()
        .includes((value as string).toLowerCase());
    },
  },
  {
    accessorKey: "fecha",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha de Ingreso" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("fecha"));
      // Corregimos el offset de zona horaria
      const offsetDate = new Date(
        date.getTime() + date.getTimezoneOffset() * 60 * 1000
      );
      const formattedDate = offsetDate.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      return (
        <div className="flex w-[100px] items-center">
          <span className="capitalize">{formattedDate}</span>
        </div>
      );
    },
    filterFn: (row, id, filterValue) => {
      const rowDate = new Date(row.getValue(id));
      if (!filterValue || filterValue.length !== 2) return true;
      const [startDate, endDate] = filterValue as [Date, Date];
      return rowDate >= startDate && rowDate <= endDate;
    },
  },

  // --- COLUMNAS DE VENTA ELIMINADAS ---
  // (total_venta y precio_unitario no existen en 'ingresos')
];
