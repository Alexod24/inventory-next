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

export const columns: ColumnDef<any>[] = [
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
  {
    id: "productos",
    header: "Productos Vendidos",
    cell: ({ row }) => {
      const detalles = row.original.detalles || [];
      const count = detalles.length;

      return (
        <Select>
          <SelectTrigger className="w-[200px] h-8 text-xs">
            <SelectValue placeholder={`${count} Productos`} />
          </SelectTrigger>
          <SelectContent>
            {detalles.map((d: any) => (
              <SelectItem
                key={d.id}
                value={d.id}
                disabled
                className="opacity-100"
              >
                <span className="font-bold">{d.cantidad}x</span>{" "}
                {d.producto?.nombre} - S/{d.total}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
    filterFn: (row, id, value) => {
      const detalles = row.original.detalles || [];
      const search = String(value).toLowerCase();
      return detalles.some((d: any) =>
        d.producto?.nombre?.toLowerCase().includes(search)
      );
    },
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
];
