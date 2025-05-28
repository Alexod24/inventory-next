"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BaseOperativa } from "./schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-acciones-tabla";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const columns: ColumnDef<BaseOperativa>[] = [
  {
    accessorKey: "proveedor",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Proveedor" />
    ),
    cell: ({ row }) => (
      <div className="w-[150px] capitalize">{row.getValue("proveedor")}</div>
    ),
    enableSorting: false,
    enableHiding: false
  },
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
      return value.toLowerCase().includes((filterValue as string).toLowerCase());
    },
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
      return value.toLowerCase().includes((filterValue as string).toLowerCase());
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
      return value.toLowerCase().includes((filterValue as string).toLowerCase());
    },
  },
 

 
  {
    accessorKey: "cantidad",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cantidad" />
    ),
    cell: ({ row }) => {
      const type = row.getValue("estado");
      return (
        <div className="flex w-[100px] items-center">
          <span
            className={cn(
              "capitalize",
              type === "income" ? "text-green-500" : "text-red-500"
            )}
          >
            {" "}
            {row.getValue("cantidad")}
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    }
  },
  {
    accessorKey: "tamano",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tamaño" />
    ),
    cell: ({ row }) => (
      <div className="w-[150px] capitalize">{row.getValue("tamano")}</div>
    ),
    enableSorting: false,
    enableHiding: false
  },
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
    }
  },

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

  {
  accessorKey: "valor",
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Valor" />
  ),
  cell: ({ row }) => {
    const type = row.getValue("estado"); // <- Cambié aquí
    return (
      <div className="flex w-[100px] items-center">
        <span
          className={cn(
            "capitalize",
            type === "income" ? "text-green-500" : "text-red-500"
          )}
        >
          {row.getValue("valor")}
        </span>
      </div>
    );
  },
  filterFn: (row, id, value) => {
    return (value as string).toLowerCase().includes((row.getValue(id) as string).toLowerCase());
  }
},


   {
    accessorKey: "estado",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado Fisico" />
    ),
    cell: ({ row }) => {
      const type = row.getValue("estado");
      return (
        <div className="flex w-[100px] items-center">
          {type === "income" ? (
            <TrendingUp size={20} className="mr-2 text-green-500" />
          ) : (
            <TrendingDown size={20} className="mr-2 text-red-500" />
          )}
          <span className="capitalize"> {row.getValue("estado")}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    }
  },
  {
    accessorKey: "justificacion",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Justificacion" />
    ),
    cell: ({ row }) => {
      const type = row.getValue("justificacion");
      return (
        <div className="flex w-[100px] items-center">
          {type === "income" ? (
            <TrendingUp size={20} className="mr-2 text-green-500" />
          ) : (
            <TrendingDown size={20} className="mr-2 text-red-500" />
          )}
          <span className="capitalize"> {row.getValue("justificacion")}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    }
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />
  }
];
