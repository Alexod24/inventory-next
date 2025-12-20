"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Categoria } from "./schema";
import { DataTableColumnHeader } from "@/components/common/data-table/data-table-column-header";
import { DataTableRowActions } from "./data-table-acciones-tabla";

export const getColumns = (
  refreshData: (triggeredBy?: string) => Promise<void>
): ColumnDef<Categoria>[] => [
  {
    accessorKey: "nombre",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <span className="max-w-[500px] truncate font-medium">
          {row.getValue("nombre")}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "descripcion",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
    cell: ({ row }) => {
      const descripcion = row.getValue("descripcion") as string | null;
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate text-gray-500">
            {descripcion || "Sin descripción"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "fecha_creacion",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha Creación" />
    ),
    cell: ({ row }) => {
      const rawValue = row.getValue("fecha_creacion") as string;
      if (!rawValue) return <span>N/A</span>;

      const date = new Date(rawValue);
      if (isNaN(date.getTime())) return <span>Invalid Date</span>;

      const formattedDate = date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      return <span className="capitalize">{formattedDate}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions row={row} refreshData={refreshData} />
    ),
  },
];
