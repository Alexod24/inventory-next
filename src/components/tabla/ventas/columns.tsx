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
import { DataTableRowActions } from "./data-table-acciones-tabla";

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
  // HIDDEN COLUMN FOR SEARCHING: This allows the toolbar to filter by "productos" even if not visible
  {
    accessorKey: "productos",
    accessorFn: (row) =>
      row.detalles?.map((d: any) => d.producto?.nombre).join(", ") || "",
    header: () => <span className="hidden">Productos</span>,
    cell: ({ row }) => (
      <span className="hidden">{row.getValue("productos") as string}</span>
    ),
    enableSorting: false,
    enableHiding: true, // Allow it to be hidden? It is hidden by class, but this helps table logic.
  },
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
  {
    id: "actions",
    cell: ({ row, table }) => {
      const meta = table.options.meta as any;
      // Assuming meta.refreshData exists if we passed it.
      // If not, we might need to adjust how we pass refresh function or just reload page.
      // However, DataTable usually doesn't pass refreshData to columns by default unless configured.
      // Let's check how Products does it or just pass a dummy/reload function if needed.
      // Actually, in `data-table.tsx` or `client.tsx`, we might need to pass meta.
      // For now, let's look at `products/columns.tsx` to see how they did it.
      // Wait, `DataTableRowActions` expects `refreshData`.
      return (
        <DataTableRowActions
          row={row}
          refreshData={meta?.refreshData || (() => window.location.reload())}
        />
      );
    },
  },
];
