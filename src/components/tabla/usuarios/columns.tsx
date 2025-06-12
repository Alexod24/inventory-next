"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BaseOperativa } from "./schema";
import { DataTableColumnHeader } from "./data-table-column-header";
// import { DataTableRowActions } from "./data-table-acciones-tabla";
// import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const columns: ColumnDef<BaseOperativa>[] = [
  {
    accessorKey: "descripcion",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nº" />
    ),
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <span className="font-bold">
          {/* Índice de la fila +1 para que empiece desde 1 */}
          {row.index + 1}
        </span>
        <span className="max-w-[500px] truncate capitalize font-medium">
          {row.getValue("descripcion")}
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
    accessorKey: "nombre",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) => (
      <div className="w-[150px] capitalize">{row.getValue("nombre")}</div>
    ),
  },

  {
    accessorKey: "correo",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Correo" />
    ),
    cell: ({ row }) => (
      <div className="flex w-[100px] items-center">
        <span className="capitalize">{row.getValue("correo")}</span>
      </div>
    ),
    filterFn: (row, id, filterValue) => {
      // filtro simple de texto, no includes de array
      const value = row.getValue(id) as string;
      return value
        .toLowerCase()
        .includes((filterValue as string).toLowerCase());
    },
  },

  // Igual para color
  {
    accessorKey: "contraseña",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contraseña" />
    ),
    cell: ({ row }) => (
      <div className="flex w-[100px] items-center">
        <span className="capitalize">{row.getValue("contraseña")}</span>
      </div>
    ),
    filterFn: (row, id, filterValue) => {
      const value = row.getValue(id) as string;
      return value
        .toLowerCase()
        .includes((filterValue as string).toLowerCase());
    },
  },
  // ---------------------------------------------------------------------------------
  {
    accessorKey: "rol",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rol" />
    ),
    cell: ({ row }) => {
      const cantidad = row.getValue("rol") as number;
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
  // ---------------------------------------------------------------------------------

  // ---------------------------------------------------------------------------------
  {
    accessorKey: "fecha",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("fecha"));
      const formattedDate = date.toLocaleDateString("es-ES", {
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
];
