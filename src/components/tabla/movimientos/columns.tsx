"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Bienes } from "./schema";
import { DataTableColumnHeader } from "./data-table-column-header";
// import { DataTableRowActions } from "./data-table-acciones-tabla";
// import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const columns: ColumnDef<Bienes>[] = [
  {
    accessorKey: "bien_id", // Ruta completa al nombre de la categoría
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre del bien" />
    ),
    cell: ({ row }) => {
      const bienNombre = row.original.bien?.nombre || "Sin usuario";
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate capitalize font-medium">
            {bienNombre}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "cantidad",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cantidad" />
    ),
    cell: ({ row }) => {
      const cantidad = row.getValue("cantidad") as number;
      const isPositive = cantidad > 0;
      return (
        <div className="flex w-[100px] items-center">
          <span
            className={cn(
              "capitalize",
              isPositive ? "text-green-500" : "text-red-500"
            )}
          >
            {cantidad}
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "tipo_movimiento",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo de movimiento" />
    ),
    cell: ({ row }) => {
      const estado = row.getValue("tipo_movimiento") as string;
      const isIngreso = estado.toLowerCase() === "ingreso";
      const isSalida = estado.toLowerCase() === "salida";

      return (
        <div className="flex w-[100px] items-center">
          <span
            className={cn(
              "capitalize font-semibold",
              isIngreso ? "text-green-600" : "",
              isSalida ? "text-red-500" : ""
            )}
          >
            {estado}
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },

  {
    accessorKey: "fecha",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha de Creacion" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("fecha"));
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
  // ---------------------------------------------------------------------------------

  {
    accessorKey: "motivo",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Motivos" />
    ),
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <span className="max-w-[500px] truncate capitalize font-medium">
          {row.getValue("motivo")}
        </span>
      </div>
    ),
    // Agregamos filtro de texto simple para que funcione con input tipo string
    filterFn: (row, id, filterValue) => {
      const value = row.getValue(id) as string;
      return value
        .toLowerCase()
        .includes((filterValue as string).toLowerCase());
    },
  },

  {
    accessorKey: "usuario_id", // Ruta completa al nombre de la categoría
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Responsable" />
    ),
    cell: ({ row }) => {
      const usuarioNombre = row.original.usuario?.nombre || "Sin usuario";
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate capitalize font-medium">
            {usuarioNombre}
          </span>
        </div>
      );
    },
  },
];
