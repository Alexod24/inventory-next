"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Ventas } from "./schema";
import { DataTableColumnHeader } from "@/components/common/data-table/data-table-column-header";
import { filterDateRange } from "@/components/common/data-table/data-table-toolbar";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ChevronDown, ChevronRight } from "lucide-react";

export const columns: ColumnDef<any>[] = [
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => {
      // Show expander only if there are details
      const hasDetails =
        row.original.detalles && row.original.detalles.length > 0;
      return hasDetails ? (
        <button
          onClick={() => row.toggleExpanded()}
          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
        >
          {row.getIsExpanded() ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      ) : null;
    },
  },
  {
    accessorKey: "numero",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="N° Ticket" />
    ),
    cell: ({ row }) => {
      const num = row.getValue("numero") as number;
      const formatted = num ? `V-${String(num).padStart(4, "0")}` : "---";
      return <span className="font-bold font-mono">{formatted}</span>;
    },
    enableSorting: true,
  },
  {
    accessorKey: "fecha",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha" />
    ),
    cell: ({ row }) => {
      const dateStr = row.getValue("fecha") as string;
      const date = new Date(dateStr);
      return <span>{date.toLocaleString("es-PE")}</span>;
    },
    filterFn: filterDateRange,
  },
  {
    accessorKey: "usuario",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Responsable" />
    ),
    cell: ({ row }) => {
      const usuario = row.original.usuario;
      return <span>{usuario?.nombre || "N/A"}</span>;
    },
  },
  // Removed "productos" column as it is now in the detail view
  {
    accessorKey: "total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Venta" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total"));
      const formatted = new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN",
      }).format(amount);
      return <div className="font-bold text-green-600">{formatted}</div>;
    },
  },
];
