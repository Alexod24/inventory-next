"use client";

import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/common/data-table/data-table-opciones-superior";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  onOpenCaja: () => void;
  canOpen: boolean;
}

export function DataTableToolbar<TData>({
  table,
  onOpenCaja,
  canOpen,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filtrar..."
          className="h-8 w-[150px] lg:w-[250px]"
          // Add filter logic if needed, e.g. by date or ID
        />
      </div>
      <div className="flex items-center gap-2">
        {canOpen && (
          <Button
            onClick={onOpenCaja}
            className="h-8 bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Abrir Caja
          </Button>
        )}

        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
