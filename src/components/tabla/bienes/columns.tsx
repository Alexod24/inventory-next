"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Bienes } from "./schema"; // Asegúrate de que tu interfaz Bienes está correctamente definida aquí
import { DataTableColumnHeader } from "./data-table-column-header";
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
    filterFn: (row, id, filterValue) => {
      const value = row.getValue(id) as string;
      return value
        .toLowerCase()
        .includes((filterValue as string).toLowerCase());
    },
  },
  {
    accessorKey: "categoria", // AccesorKey coincide con schema.ts
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Categoría" />
    ),
    cell: ({ row }) => {
      // Acceso directo a la propiedad 'categoria' como string
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
    accessorKey: "subcategorias", // AccesorKey coincide con schema.ts
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sub Categoría" />
    ),
    cell: ({ row }) => {
      // Acceso directo a la propiedad 'subcategoriaNombre' como string
      const subcategoria = row.original.subcategorias || "Sin subcategoría";
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate capitalize font-medium">
            {subcategoria}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "proveedorNombre", // AccesorKey coincide con schema.ts
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Proveedor" />
    ),
    cell: ({ row }) => {
      // Acceso directo a la propiedad 'proveedorNombre' como string
      const proveedorNombre =
        row.original.proveedorNombre?.nombre || "Sin proveedor";
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
    accessorKey: "espacioNombre", // AccesorKey coincide con schema.ts
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Espacio" />
    ),
    cell: ({ row }) => {
      // Acceso directo a la propiedad 'espacioNombre' como string
      const espacioNombre = row.original.espacioNombre?.nombre || "Sin espacio";
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
    accessorKey: "adquisicion", // AccesorKey coincide con schema.ts
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha Adquisicion" />
    ),
    cell: ({ row }) => {
      const dateString = row.getValue("adquisicion") as string;
      if (!dateString)
        return (
          <div className="flex w-[100px] items-center">
            <span className="capitalize">N/A</span>
          </div>
        );

      const date = new Date(dateString);
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

      // Ajuste para manejar booleanos como en el esquema Zod
      let disponibilidad =
        typeof disponibilidadRaw === "boolean"
          ? disponibilidadRaw === true
            ? "ok"
            : "faltante"
          : typeof disponibilidadRaw === "string"
          ? disponibilidadRaw
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
    filterFn: (row, id, filterValue) => {
      const value = row.getValue(id) as string;
      return value
        .toLowerCase()
        .includes((filterValue as string).toLowerCase());
    },
  },

  {
    accessorKey: "usuario", // AccesorKey coincide con schema.ts
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Responsable" />
    ),
    cell: ({ row }) => {
      // Acceso directo a la propiedad 'usuario' como string
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
    accessorKey: "creado", // AccesorKey coincide con schema.ts
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha creacion" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("creado"));
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
    accessorKey: "actualizado", // AccesorKey coincide con schema.ts
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha actualización" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("actualizado"));
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
