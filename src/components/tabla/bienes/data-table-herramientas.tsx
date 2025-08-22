"use client";

import { useState, useEffect } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import {
  Table,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  Row, // Importa Row para tipar el parámetro 'row'
  ColumnFiltersState, // Importa ColumnFiltersState para tipar el estado
  ColumnFilter,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableFacetedFilter } from "./data-table-filtros";
import { CalendarDatePicker } from "@/components/calendar-date-picker";
import { DataTableViewOptions } from "./data-table-opciones-superior";
import { Option, opcionesEstado, opcionesDisponibilidad } from "@/lib/options";

// Filtro personalizado rango fecha
// Se añaden tipos explícitos a los parámetros para resolver el error 'implicitly has an any type'.
const filterDateRange = (
  row: Row<any>,
  columnId: string,
  value: [Date, Date] | undefined
) => {
  const [from, to] = value || [];
  const rowDate = new Date(row.getValue(columnId));

  // El rowDate debe estar entre from y to si estos existen
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

  // Corrección clave aquí: dateRange siempre será un objeto con 'from' y 'to' definidos,
  // pero sus valores pueden ser 'Date | undefined'.
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  // ------------------------------------------------------------------------------------------------------
  const handleDateSelect = ({ from, to }: { from?: Date; to?: Date }) => {
    // Cuando se selecciona una fecha, actualizamos el estado dateRange
    // Aseguramos que 'from' y 'to' siempre estén presentes en el objeto, incluso si son undefined
    setDateRange({ from: from, to: to });
    // Asegúrate de que la columna 'creado_en' existe en tu tabla real
    // El filtro espera un array de dos elementos, donde cada uno puede ser Date o undefined
    table.getColumn("creado_en")?.setFilterValue([from, to]);
  };

  useEffect(() => {
    // Este useEffect está vacío, considera si necesitas alguna lógica aquí
  }, [table]);

  return (
    <div className="flex flex-wrap items-center justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Filtrar nombre..."
          value={(table.getColumn("nombre")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            table.getColumn("nombre")?.setFilterValue(event.target.value);
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
              setDateRange({ from: undefined, to: undefined }); // Reinicia a un objeto con propiedades definidas como undefined
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reiniciar
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}

        <CalendarDatePicker
          date={dateRange} // Ahora dateRange es siempre un objeto con 'from' y 'to' definidos
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

// Definición columnas (asegúrate de que estas columnas coincidan con tus datos reales)
// Si este archivo es solo para la barra de herramientas, esta definición de columnas podría no ser necesaria aquí.
// Sin embargo, si es parte de un ejemplo o test, la mantendremos.
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
    accessorKey: "fechaCreacion", // Asegúrate de que esta accessorKey coincide con tu columna de fecha en los datos
    header: "Fecha",
    filterFn: filterDateRange,
  },
];

export default function App() {
  const [data, setData] = useState([
    {
      descripcion: "Producto 1",
      disponibilidad: "Disponible",
      estado: "bueno",
      fechaCreacion: "2023-05-01", // Asegúrate de que el nombre de la propiedad aquí coincide con accessorKey
    },
    {
      descripcion: "Producto 2",
      disponibilidad: "No disponible",
      estado: "bueno",
      fechaCreacion: "2023-05-02", // Asegúrate de que el nombre de la propiedad aquí coincide con accessorKey
    },
    // ... más datos
  ]);

  // Corrección clave aquí: tipa explícitamente el estado columnFilters
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters, // Ahora los tipos son compatibles
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
            {columns.map(
              (
                col: any // Casting a any para col si ColumnDef no es suficiente aquí
              ) => (
                <th
                  key={col.accessorKey}
                  className="border border-gray-300 px-2 py-1 text-left"
                >
                  {col.header}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border border-gray-200">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="border border-gray-300 px-2 py-1">
                  {cell.getValue() as React.ReactNode}{" "}
                  {/* Casting a React.ReactNode */}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
