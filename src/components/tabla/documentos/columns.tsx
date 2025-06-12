"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BaseOperativa } from "./schema";
import { DataTableColumnHeader } from "./data-table-column-header";
// import { DataTableRowActions } from "./data-table-acciones-tabla";
// import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const columns: ColumnDef<BaseOperativa>[] = [
  {
    accessorKey: "nombre",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <span className="max-w-[500px] truncate capitalize font-medium">
          {row.getValue("nombre")}
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
    accessorKey: "url",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="URL" />
    ),
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <span className="max-w-[500px] truncate capitalize font-medium">
          {row.getValue("url")}
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
    accessorKey: "creado_por",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Creador" />
    ),
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <span className="max-w-[500px] truncate capitalize font-medium">
          {row.getValue("creado_por")}
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
    accessorKey: "fecha_reporte",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha Inventario" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("fecha_reporte"));
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
  {
    accessorKey: "creado_en",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha Creacion" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("creado_en"));
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
  {
    accessorKey: "descripcion",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripcion" />
    ),
    cell: ({ row }) => (
      <div className="flex space-x-2">
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
];
