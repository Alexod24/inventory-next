"use client";

import { useState } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Table, Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDatePicker } from "@/components/calendar-date-picker";
import { DataTableViewOptions } from "@/components/common/data-table/data-table-opciones-superior";
import { Search } from "lucide-react";

// Generic Date Range Filter Function
export const filterDateRange = (
  row: Row<any>,
  columnId: string,
  value: [Date | undefined, Date | undefined] | undefined
) => {
  const [from, to] = value || [];
  if (!from && !to) return true;

  const rowValue = row.getValue(columnId);
  if (!rowValue) return false;

  const rowDate = new Date(rowValue as string); // or number

  if (from && rowDate < from) return false;

  if (to) {
    const endOfDay = new Date(to);
    endOfDay.setHours(23, 59, 59, 999);
    if (rowDate > endOfDay) return false;
  }

  return true;
};

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  filterColumn?: string; // Column to search by text
  dateColumn?: string; // Column to filter by date
  searchPlaceholder?: string;
  children?: React.ReactNode; // For extra filters like FacetedFilters
  actions?: React.ReactNode; // For extra buttons (Add, Export)
}

export function DataTableToolbar<TData>({
  table,
  filterColumn,
  dateColumn,
  searchPlaceholder = "Filtrar...",
  children,
  actions,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  // Local state for date picker visual
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });

  const handleDateSelect = ({ from, to }: { from?: Date; to?: Date }) => {
    setDateRange({ from, to });
    if (dateColumn) {
      table.getColumn(dateColumn)?.setFilterValue([from, to]);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-1 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
        {/* Text Filter */}
        {filterColumn && (
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={
                (table.getColumn(filterColumn)?.getFilterValue() as string) ??
                ""
              }
              onChange={(event) =>
                table
                  .getColumn(filterColumn)
                  ?.setFilterValue(event.target.value)
              }
              className="h-9 w-[150px] lg:w-[250px] pl-8"
            />
          </div>
        )}

        {/* Date Filter */}
        {dateColumn && table.getColumn(dateColumn) && (
          <CalendarDatePicker
            date={dateRange}
            onDateSelect={handleDateSelect}
            className="w-[260px] h-9"
            variant="outline"
            placeholder="Filtrar por fecha"
          />
        )}

        {/* Extra Filters (Facets) */}
        {children}

        {/* Reset Button */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters();
              setDateRange({ from: undefined, to: undefined });
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reiniciar
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {actions}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
