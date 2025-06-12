"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Bienes } from "./schema";
import { DataTableColumnHeader } from "./data-table-column-header";
// import { DataTableRowActions } from "./data-table-acciones-tabla";
// import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const columns: ColumnDef<Bienes>[] = [
  {
    accessorKey: "codigo",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Codigo" />
    ),
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <span className="max-w-[500px] truncate capitalize font-medium">
          {row.getValue("codigo")}
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
    accessorKey: "categoria", // Ruta completa al nombre de la categoría
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Categoría" />
    ),
    cell: ({ row }) => {
      const categoriaNombre = row.original.categoria?.nombre || "Sin categoría";
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate capitalize font-medium">
            {categoriaNombre}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "subcategoria", // Ruta completa al nombre de la categoría
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sub Categoría" />
    ),
    cell: ({ row }) => {
      const subcategoriaNombre =
        row.original.subcategoria?.nombre || "Sin subcategoría";
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate capitalize font-medium">
            {subcategoriaNombre}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "proveedor", // Ruta completa al nombre de la categoría
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Proveedor" />
    ),
    cell: ({ row }) => {
      const proveedorNombre = row.original.proveedor?.nombre || "Sin proveedor";
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate capitalize font-medium">
            {proveedorNombre}
          </span>
        </div>
      );
    },
  },

  {
    accessorKey: "espacios", // Ruta completa al nombre de la categoría
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Espacio" />
    ),
    cell: ({ row }) => {
      const espacioNombre = row.original.espacio?.nombre || "Sin espacio";
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate capitalize font-medium">
            {espacioNombre}
          </span>
        </div>
      );
    },
  },
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
  {
    accessorKey: "fecha_adquisicion",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha Adquisicion" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("fecha_adquisicion"));
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
  {
    accessorKey: "disponibilidad",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Disponibilidad" />
    ),
    cell: ({ row }) => {
      let disponibilidadRaw = row.getValue("disponibilidad");

      // Si no es string, conviértelo a string con mapeo personalizado
      let disponibilidad =
        typeof disponibilidadRaw === "string"
          ? disponibilidadRaw
          : disponibilidadRaw === true
          ? "ok"
          : disponibilidadRaw === false
          ? "faltante"
          : "pendiente"; // o valor por defecto si es null/undefined

      disponibilidad = disponibilidad.toLowerCase();

      return (
        <div className="flex w-[100px] items-center">
          <span
            className={cn(
              "capitalize font-semibold",
              disponibilidad === "ok" && "text-green-600",
              disponibilidad === "faltante" && "text-red-500",
              disponibilidad === "pendiente" && "text-yellow-500"
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
  {
    accessorKey: "observaciones",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Observaciones" />
    ),
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <span className="max-w-[500px] truncate capitalize font-medium">
          {row.getValue("observaciones")}
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
    accessorKey: "usuario", // Ruta completa al nombre de la categoría
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Responsable" />
    ),
    cell: ({ row }) => {
      const usuarioNombre = row.original.usuario?.nombre || "Sin usuario";
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate capitalize font-medium">
            {usuarioNombre}
          </span>
        </div>
      );
    },
  },

  // ---------------------------------------------------------------------------------
  {
    accessorKey: "creado_en",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha creacion" />
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
    accessorKey: "actualizado_en",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha actualización" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("actualizado_en"));
      const formattedDate = date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const formattedTime = date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      return (
        <div className="flex w-[150px] items-center">
          <span className="capitalize">
            {formattedDate} {formattedTime}
          </span>
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
];
