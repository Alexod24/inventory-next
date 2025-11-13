"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Movimientos } from "./schema"; // Asegúrate que tu schema incluya 'total_venta' y las relaciones 'bien' y 'usuario'
import { DataTableColumnHeader } from "./data-table-column-header";
// import { DataTableRowActions } from "./data-table-acciones-tabla";
import { cn } from "@/lib/utils";

// --- Formateador de Moneda ---
const formatCurrency = (value: number) => {
  // Puedes cambiar 'es-PE' y 'PEN' a tu moneda local
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(value || 0); // (value || 0) para evitar errores si es null
};
// ---------------------------------

export const columns: ColumnDef<Movimientos>[] = [
  {
    // --- COLUMNA DE PRODUCTO (ACTIVA) ---
    accessorKey: "bien_id", // Mantenemos el ID como accessor
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Producto" />
    ),
    cell: ({ row }) => {
      // Asumimos que tu 'schema.ts' define 'bien' como un objeto opcional
      const bienNombre = row.original.bien?.nombre || "Sin producto";
      return (
        <div className="flex space-x-2">
          <span className="max-w-[400px] truncate capitalize font-medium">
            {bienNombre}
          </span>
        </div>
      );
    },
    // Filtro básico por si acaso
    filterFn: (row, id, value) => {
      const bienNombre = row.original.bien?.nombre || "";
      return bienNombre.toLowerCase().includes((value as string).toLowerCase());
    },
  },
  {
    // --- COLUMNA DE VENDEDOR (ACTIVA) ---
    accessorKey: "usuario_id", // Mantenemos el ID como accessor
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vendedor" />
    ),
    cell: ({ row }) => {
      // Asumimos que tu 'schema.ts' define 'usuario' como un objeto opcional
      const usuarioNombre = row.original.usuario?.nombre || "Sin vendedor";
      return (
        <div className="flex space-x-2">
          <span className="max-w-[300px] truncate capitalize font-medium">
            {usuarioNombre}
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const usuarioNombre = row.original.usuario?.nombre || "";
      return usuarioNombre
        .toLowerCase()
        .includes((value as string).toLowerCase());
    },
  },
  {
    accessorKey: "cantidad",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cantidad" />
    ),
    cell: ({ row }) => {
      const cantidad = row.getValue("cantidad") as number;
      return (
        <div className="flex w-[80px] items-center justify-center">
          {/* Ya no se necesita color, todas son ventas/salidas */}
          <span className="font-medium">{cantidad}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      // Filtro para números
      const cantidad = String(row.getValue(id));
      return cantidad.includes(String(value));
    },
  },
  {
    // --- ¡NUEVA COLUMNA CALCULADA! ---
    // Usamos un ID virtual
    accessorKey: "precio_unitario",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Precio Unit." />
    ),
    cell: ({ row }) => {
      const total = (row.original.total_venta as number) || 0;
      const cantidad = (row.original.cantidad as number) || 1; // Evita división por cero
      const unitPrice = total / cantidad;

      return (
        <div className="flex w-[100px] items-center">
          <span className="text-gray-700 dark:text-gray-300">
            {formatCurrency(unitPrice)}
          </span>
        </div>
      );
    },
  },
  {
    // --- ¡NUEVA COLUMNA ESENCIAL! ---
    accessorKey: "total_venta",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Venta" />
    ),
    cell: ({ row }) => {
      const total = row.getValue("total_venta") as number;
      const isPositive = total > 0;
      return (
        <div className="flex w-[100px] items-center">
          <span
            className={cn(
              "font-semibold",
              isPositive ? "text-green-600" : "text-gray-500"
            )}
          >
            {formatCurrency(total)}
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      // Filtro para números
      const total = String(row.getValue(id));
      return total.includes(String(value));
    },
  },
  {
    accessorKey: "fecha",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha de Venta" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("fecha"));
      // Corregimos el offset de zona horaria
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
    // Dejamos tu filtro de rango de fechas
    filterFn: (row, id, filterValue) => {
      const rowDate = new Date(row.getValue(id));
      if (!filterValue || filterValue.length !== 2) return true;
      const [startDate, endDate] = filterValue as [Date, Date];
      return rowDate >= startDate && rowDate <= endDate;
    },
  },

  // --- COLUMNAS REDUNDANTES ELIMINADAS ---
  // (tipo_movimiento y motivo)
];
