"use client";

// ENCABEZADO DE LA TABLA
import { useState, useEffect } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { incomeType, categories } from "./data";
import { DataTableFacetedFilter } from "./data-table-filtros";
import { CalendarDatePicker } from "@/components/calendar-date-picker";

import { DataTableViewOptions } from "./data-table-opciones-superior";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  viewOptions: { showHiddenColumns: boolean; customView: string };
  setViewOptions: React.Dispatch<
    React.SetStateAction<{ showHiddenColumns: boolean; customView: string }>
  >;
  fetchData: () => Promise<void>;  // Agrega esta prop
}

export function DataTableToolbar<TData>({
  table, viewOptions, setViewOptions, fetchData
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null);

  useEffect(() => {
    setDateRange({
      from: new Date(new Date().getFullYear(), 0, 1),
      to: new Date(),
    });
  }, []);

  const handleDateSelect = ({ from, to }: { from: Date; to: Date }) => {
    setDateRange({ from, to });
    // Filtrar la tabla según el rango de fechas seleccionado
    table.getColumn("date")?.setFilterValue([from, to]);
  };

  return (
    <div className="flex flex-wrap items-center justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Filtrar descripción..."
          value={(table.getColumn("descripcion")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            table.getColumn("descripcion")?.setFilterValue(event.target.value);
          }}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("marca") && (
          <DataTableFacetedFilter
            column={table.getColumn("marca")}
            title="Marca"
            options={categories}
          />
        )}
        {table.getColumn("estado") && (
          <DataTableFacetedFilter
            column={table.getColumn("estado")}
            title="Estado"
            options={incomeType}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
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
      fetchData={fetchData}   // PASA esta función que tuvieras definida para recargar datos
      viewOptions={viewOptions}
      setViewOptions={setViewOptions}
/>
    </div>
  );
}