"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Check, X, AlertCircle } from "lucide-react";
import { DataTableColumnHeader } from "@/components/common/data-table/data-table-column-header";
import { CajaSesion } from "./schema";

export const columns: ColumnDef<CajaSesion>[] = [
  {
    accessorKey: "fecha_apertura",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Apertura" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("fecha_apertura"));
      return (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {date.toLocaleDateString("es-PE")}
          </span>
          <span className="text-xs text-gray-500">
            {date.toLocaleTimeString("es-PE", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "estado",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const estado = row.getValue("estado") as string;
      return (
        <div className="flex items-center">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
              ${
                estado === "abierta"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
              }`}
          >
            {estado}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "monto_apertura",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Monto Inicial" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("monto_apertura"));
      return (
        <div className="font-mono">
          {new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency: "PEN",
          }).format(amount)}
        </div>
      );
    },
  },
  {
    accessorKey: "monto_cierre_real",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cierre Real" />
    ),
    cell: ({ row }) => {
      const amount = row.getValue("monto_cierre_real");
      if (amount === null) return <span className="text-gray-400">-</span>;
      return (
        <div className="font-mono">
          {new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency: "PEN",
          }).format(Number(amount))}
        </div>
      );
    },
  },
  {
    accessorKey: "diferencia",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Diferencia" />
    ),
    cell: ({ row }) => {
      const diff = row.getValue("diferencia");
      if (diff === null) return <span className="text-gray-400">-</span>;

      const numDiff = Number(diff);
      let colorClass = "text-gray-500";
      if (numDiff > 0) colorClass = "text-green-600";
      if (numDiff < 0) colorClass = "text-red-600";

      return (
        <div className={`font-mono font-medium ${colorClass}`}>
          {new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency: "PEN",
            signDisplay: "always",
          }).format(numDiff)}
        </div>
      );
    },
  },
];
