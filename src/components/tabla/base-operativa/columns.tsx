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
      <DataTableColumnHeader column={column} title="Descripcion del bien" />
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
  {
    accessorKey: "proveedor",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Proveedor" />
    ),
    cell: ({ row }) => (
      <div className="w-[150px] capitalize">{row.getValue("proveedor")}</div>
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "marca",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Marca" />
    ),
    cell: ({ row }) => (
      <div className="flex w-[100px] items-center">
        <span className="capitalize">{row.getValue("marca")}</span>
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
    accessorKey: "color",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Color" />
    ),
    cell: ({ row }) => (
      <div className="flex w-[100px] items-center">
        <span className="capitalize">{row.getValue("color")}</span>
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
  // ---------------------------------------------------------------------------------
  {
    accessorKey: "tamano",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tamaño" />
    ),
    cell: ({ row }) => (
      <div className="w-[150px] capitalize">{row.getValue("tamano")}</div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  // ---------------------------------------------------------------------------------
  {
    accessorKey: "material",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo de material" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate capitalize font-medium">
            {row.getValue("material")}
          </span>
        </div>
      );
    },
  },
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
  {
    accessorKey: "valor",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Valor" />
    ),
    cell: ({ row }) => {
      const valor = row.getValue("valor") as number;
      const isPositive = valor > 0;
      return (
        <div className="flex w-[100px] items-center">
          <span
            className={cn(
              "capitalize",
              isPositive ? "text-green-500" : "text-red-500"
            )}
          >
            {valor}
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return (value as string)
        .toLowerCase()
        .includes((row.getValue(id) as string).toLowerCase());
    },
  },
  // ---------------------------------------------------------------------------
  {
    accessorKey: "estado",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado Fisico" />
    ),
    cell: ({ row }) => {
      const estado = row.getValue("estado") as string;
      const isBueno = estado.toLowerCase() === "bueno";
      const isDañado = estado.toLowerCase() === "dañado";
      const isRoto = estado.toLowerCase() === "roto";

      return (
        <div className="flex w-[100px] items-center">
          <span
            className={cn(
              "capitalize font-semibold",
              isBueno ? "text-green-600" : "",
              isDañado ? "text-yellow-500" : "",
              isRoto ? "text-red-500" : ""
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
  // ---------------------------------------------------------------------------
  {
    accessorKey: "disponibilidad",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Disponibilidad" />
    ),
    cell: ({ row }) => {
      const disponibilidad = row.getValue("disponibilidad") as string;

      return (
        <div className="flex w-[100px] items-center">
          <span
            className={cn(
              "capitalize font-semibold",
              disponibilidad.toLowerCase() === "ok" && "text-green-600",
              disponibilidad.toLowerCase() === "faltante" && "text-red-500",
              disponibilidad.toLowerCase() === "pendiente" && "text-yellow-500"
            )}
          >
            {disponibilidad}
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
];
