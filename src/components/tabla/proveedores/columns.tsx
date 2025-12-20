"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Proveedor } from "./schema";
import { DataTableColumnHeader } from "@/components/common/data-table/data-table-column-header";
import { DataTableRowActions } from "./data-table-acciones-tabla";

export const getColumns = (
  refreshData: (triggeredBy?: string) => Promise<void>
): ColumnDef<Proveedor>[] => [
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
    accessorKey: "ruc",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="RUC" />
    ),
    cell: ({ row }) => {
      return (
        <span className="max-w-[150px] truncate">
          {row.getValue("ruc") || "---"}
        </span>
      );
    },
  },
  {
    accessorKey: "telefono",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Teléfono" />
    ),
    cell: ({ row }) => {
      return (
        <span className="max-w-[150px] truncate">
          {row.getValue("telefono") || "---"}
        </span>
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
