"use client";

import { useEffect } from "react";
import Alert from "@/components/ui/alerta/AlertaExito";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-herramientas";
import { supabase } from "@/app/utils/supabase/supabase";
import { DataTableRowActions } from "./data-table-acciones-tabla";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading: boolean;
}

export function DataTable<TData, TValue>({
  columns,
}: DataTableProps<TData, TValue>) {
  const [data, setData] = React.useState<TData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [alertaExito, setAlertaExito] = React.useState(false);
  const [alertaBorrado, setAlertaBorrado] = React.useState(false);
  const [alertaEditar, setAlertaEditar] = React.useState(false);
  // -------------------------------------------------------------------------------------
  const renderAlerta = alertaExito && (
    <Alert
      variant="success"
      title="¡Operación exitosa!"
      message="Los datos han sido actualizados correctamente."
      showLink={false}
    />
  );
  // -------------------------------------------------------------------------------------
  const renderAlertaBorrado = alertaBorrado && (
    <Alert
      variant="success"
      title="¡Operación exitosa!"
      message="El registro ha sido borrado correctamente."
      showLink={false}
    />
  );
  // -------------------------------------------------------------------------------------
  const renderAlertaEditar = alertaEditar && (
    <Alert
      variant="warning"
      title="¡Operación exitosa!"
      message="El registro ha sido actualizado correctamente."
      showLink={false}
    />
  );
  // -------------------------------------------------------------------------------------
  const [viewOptions, setViewOptions] = React.useState({
    showHiddenColumns: false,
    customView: "default",
  });

  // -------------------------------------------------------------------------------------

  const fetchData = async (triggeredBy?: string) => {
    setLoading(true);

    const { data: fetchedData, error } = await supabase.from("ingresos")
      .select(`
    *,
    bien:bienes(nombre),
    usuario:usuarios(nombre)
  `);

    if (error) {
      console.error("Supabase error:", error.message);
    } else {
      console.log("Fetched data:", data);
    }

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setData(fetchedData || []);

    if (triggeredBy === "view-options") {
      setAlertaExito(true);
      setTimeout(() => setAlertaExito(false), 3000);
    }

    if (triggeredBy === "delete") {
      setAlertaBorrado(true);
      setTimeout(() => setAlertaBorrado(false), 3000);
    }

    if (triggeredBy === "edit") {
      setAlertaEditar(true);
      setTimeout(() => setAlertaEditar(false), 3000);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);
  // -------------------------------------------------------------------------------------
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  if (loading) {
    return <div>Cargando datos...</div>;
  }

  return (
    <div className="space-y-4">
      {renderAlerta}
      {renderAlertaBorrado}
      {renderAlertaEditar}
      <DataTableToolbar
        table={table}
        viewOptions={viewOptions}
        setViewOptions={setViewOptions}
        fetchData={() => fetchData("view-options")}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                  {/* Pasa la función fetchData al componente DataTableRowActions */}
                  <TableCell>
                    <DataTableRowActions row={row} refreshData={fetchData} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
