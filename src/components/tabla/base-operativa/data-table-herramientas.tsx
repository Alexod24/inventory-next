"use client";

import { useState, useEffect } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import {
  Table,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableFacetedFilter } from "./data-table-filtros";
import { CalendarDatePicker } from "@/components/calendar-date-picker";
import { DataTableViewOptions } from "./data-table-opciones-superior";

const opcionesEstado = [
  { value: "nuevo", label: "Nuevo" },
  { value: "bueno", label: "Bueno" },
  { value: "dañado", label: "Dañado" },
  { value: "roto", label: "Roto" },
];

const opcionesDisponibilidad = [
  { value: "ok", label: "OK" },
  { value: "faltante", label: "Faltante" },
  { value: "pendiente", label: "Pendiente" },
  { value: "reparacion", label: "Reparación" },
  { value: "baja", label: "Baja" },
];

// Filtro personalizado rango fecha
const filterDateRange = (row, columnId, value) => {
  const [from, to] = value || [];
  const rowDate = new Date(row.getValue(columnId));
  return (
    (!from || rowDate >= new Date(from)) && (!to || rowDate <= new Date(to))
  );
};

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  viewOptions: { showHiddenColumns: boolean; customView: string };
  setViewOptions: React.Dispatch<
    React.SetStateAction<{ showHiddenColumns: boolean; customView: string }>
  >;
  fetchData: () => Promise<void>;
}

export function DataTableToolbar<TData>({
  table,
  viewOptions,
  setViewOptions,
  fetchData,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(
    null
  );
  // ------------------------------------------------------------------------------------------------------
  const handleDateSelect = ({ from, to }: { from: Date; to: Date }) => {
    setDateRange({ from, to });
    table.getColumn("fecha")?.setFilterValue([from, to]);
  };

  useEffect(() => {
    console.log("Filtros activos:", table.getState().columnFilters);
    console.log("Datos filtrados:", table.getRowModel().rows);
  }, [table.getState().columnFilters]);

  return (
    <div className="flex flex-wrap items-center justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Filtrar descripción..."
          value={
            (table.getColumn("descripcion")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) => {
            table.getColumn("descripcion")?.setFilterValue(event.target.value);
          }}
          className="h-8 w-[150px] lg:w-[250px]"
        />

        {table.getColumn("disponibilidad") && (
          <DataTableFacetedFilter
            column={table.getColumn("disponibilidad")}
            title="Disponibilidad"
            options={opcionesDisponibilidad}
          />
        )}

        {table.getColumn("estado") && (
          <DataTableFacetedFilter
            column={table.getColumn("estado")}
            title="Estado"
            options={opcionesEstado}
          />
        )}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters();
              setDateRange(null);
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reiniciar
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}

        <CalendarDatePicker
          date={dateRange}
          onDateSelect={handleDateSelect}
          className="w-[250px] h-8"
          variant="outline"
        />
      </div>

      <DataTableViewOptions
        table={table}
        fetchData={fetchData}
        viewOptions={viewOptions}
        setViewOptions={setViewOptions}
      />
    </div>
  );
}

// Definición columnas
const columns = [
  {
    accessorKey: "descripcion",
    header: "Descripción",
  },
  {
    accessorKey: "disponibilidad",
    header: "Disponibilidad",
  },
  {
    accessorKey: "estado",
    header: "Estado",
  },
  {
    accessorKey: "fecha",
    header: "Fecha",
    filterFn: filterDateRange,
  },
];

export default function App() {
  const [data, setData] = useState([
    {
      descripcion: "Producto 1",
      disponibilidad: "ok",
      estado: "nuevo",
      date: "2023-05-01",
    },
    {
      descripcion: "Producto 2",
      disponibilidad: "faltante",
      estado: "bueno",
      fecha: "2023-05-02",
    },
  ]);

  // Este es el secreto para que los filtros funcionen y la tabla se actualice
  const [columnFilters, setColumnFilters] = useState([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div>
      <DataTableToolbar
        table={table}
        viewOptions={{ showHiddenColumns: false, customView: "" }}
        setViewOptions={() => {}}
        fetchData={async () => {
          // Simula una recarga de datos
          setData(data);
        }}
      />

      {/* Tabla simple para mostrar datos filtrados */}
      <table className="w-full mt-4 border-collapse border border-gray-300">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.accessorKey}
                className="border border-gray-300 px-2 py-1 text-left"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border border-gray-200">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="border border-gray-300 px-2 py-1">
                  {cell.getValue()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
