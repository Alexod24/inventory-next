"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/common/data-table/data-table";
import { columns } from "./columns";
import { createClientComponentClient } from "@/app/utils/supabase/browser";
import { Database } from "@/types/supabase";
import { useSede } from "@/context/SedeContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { SalesToolbar } from "./data-table-herramientas";
import POSModal from "@/components/pos/POSModal";
import { Ventas } from "./schema";

export default function VentasClient() {
  const [data, setData] = useState<Ventas[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPosOpen, setIsPosOpen] = useState(false);
  const { sedeActual } = useSede();
  const supabase = createClientComponentClient<Database>();

  const fetchData = useCallback(async () => {
    if (!sedeActual) return;
    setLoading(true);

    try {
      // Necesitamos JOIN con bienes para obtener el nombre del producto
      const { data: sales, error } = await supabase
        .from("ventas")
        .select(
          `
            *,
            usuario:usuarios(nombre),
            detalles:salidas!venta_id (
                id,
                cantidad,
                precio,
                total,
                producto:productos!producto(nombre)
            )
        `
        )
        .eq("sede_id", sedeActual.id)
        .order("fecha", { ascending: false });

      if (error) {
        console.error("Error fetching sales:", error);
      } else {
        console.log("Ventas loaded:", sales); // DEBUG LOG
        setData(sales as any);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [sedeActual, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Ventas</h2>
          <p className="text-muted-foreground">
            Historial de ventas de la sede {sedeActual?.nombre}
          </p>
        </div>

        <Button
          onClick={() => setIsPosOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Nueva Venta (POS)
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        fetchData={fetchData}
        toolbar={SalesToolbar}
        renderSubComponent={({ row }) => {
          const detalles = row.original.detalles || [];
          return (
            <div className="p-4 bg-muted/30 rounded-lg m-2 border shadow-inner">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Detalle de Productos
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground uppercase text-xs">
                      <th className="py-2 px-3">Producto</th>
                      <th className="py-2 px-3 text-right">Cantidad</th>
                      <th className="py-2 px-3 text-right">Precio Unit.</th>
                      <th className="py-2 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalles.map((d: any) => (
                      <tr
                        key={d.id}
                        className="border-b last:border-0 hover:bg-muted/50"
                      >
                        <td className="py-2 px-3 font-medium">
                          {d.producto?.nombre}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-bold">
                            {d.cantidad}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums">
                          {new Intl.NumberFormat("es-PE", {
                            style: "currency",
                            currency: "PEN",
                          }).format(d.precio)}
                        </td>
                        <td className="py-2 px-3 text-right font-bold tabular-nums">
                          {new Intl.NumberFormat("es-PE", {
                            style: "currency",
                            currency: "PEN",
                          }).format(d.total)}
                        </td>
                      </tr>
                    ))}
                    {detalles.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-4 text-center text-muted-foreground"
                        >
                          No hay detalles disponibles
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }}
      />

      <POSModal
        isOpen={isPosOpen}
        onClose={() => {
          setIsPosOpen(false);
          fetchData(); // Refrescar tabla al cerrar el modal (asumiendo que se hizo venta)
        }}
      />
    </div>
  );
}
