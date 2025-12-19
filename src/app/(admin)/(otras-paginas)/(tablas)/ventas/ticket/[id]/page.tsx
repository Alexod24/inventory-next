"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClientComponentClient } from "@/app/utils/supabase/browser";
import { Database } from "@/types/supabase";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type VentaWithDetails = Database["public"]["Tables"]["ventas"]["Row"] & {
  sedes: Database["public"]["Tables"]["sedes"]["Row"] | null;
  usuario: { nombre: string } | null;
  salidas: (Database["public"]["Tables"]["salidas"]["Row"] & {
    productos: { nombre: string; codigo: string } | null;
  })[];
};

export default function TicketPage() {
  const params = useParams();
  const id = params.id as string;
  const [venta, setVenta] = useState<VentaWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchVenta = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("ventas")
        .select(
          `
          *,
          sedes (*),
          usuario:usuarios(nombre),
          salidas (
            *,
            productos (nombre, codigo)
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching ticket:", error);
      } else {
        setVenta(data as any);
      }
      setLoading(false);
    };

    fetchVenta();
  }, [id, supabase]);

  useEffect(() => {
    if (venta) {
      document.title = `Ticket-${venta.numero}`;
      // Auto-print disabled for dev, user can click button.
      // setTimeout(() => window.print(), 500);
    }
  }, [venta]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!venta) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-red-500 bg-gray-100">
        Ticket no encontrado
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 print:p-0 print:bg-white">
      {/* TICKET CONTAINER */}
      <div className="bg-white p-6 shadow-xl print:shadow-none print:p-0 w-full max-w-[80mm] mx-auto text-[12px] font-mono leading-tight text-black">
        {/* HEADER */}
        <div className="text-center">
          {/* Logo */}
          <div className="flex justify-center mb-2">
            <img
              src="/images/logo/logo-lider.png"
              alt="Logo"
              className="h-16 object-contain grayscale"
            />
          </div>

          <h1 className="text-xl font-bold uppercase mb-2">
            {venta.sedes?.nombre || "TIENDA GENERAL"}
          </h1>
          <p className="mb-1">
            {venta.sedes?.direccion || "Dirección Principal"}
          </p>
          <p className="mb-1">Tel: {venta.sedes?.telefono || "---"}</p>
          <p className="mb-1">RUC: 20600000001</p>
        </div>

        {/* INFO VENTA */}
        <div className="border-t-2 border-dashed border-black my-3 pt-2">
          <div className="flex justify-between">
            <span>Ticket:</span>
            <span className="font-bold">
              {venta.numero
                ? `V-${String(venta.numero).padStart(6, "0")}`
                : "---"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Fecha:</span>
            <span>
              {format(new Date(venta.fecha || new Date()), "dd/MM/yyyy HH:mm")}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Cajero:</span>
            <span className="uppercase">
              {venta.usuario?.nombre || "Admin"}
            </span>
          </div>
        </div>

        {/* TABLE HEADERS */}
        <div className="border-b-2 border-dashed border-black mb-2 pb-1 flex font-bold uppercase">
          <div className="w-[15%]">Cant</div>
          <div className="w-[55%]">Descripción</div>
          <div className="w-[30%] text-right">Total</div>
        </div>

        {/* ITEMS */}
        <div className="flex flex-col gap-2 mb-3">
          {venta.salidas.map((item) => (
            <div key={item.id} className="flex">
              <div className="w-[15%] text-left align-top">{item.cantidad}</div>
              <div className="w-[55%] align-top uppercase text-[11px]">
                {item.productos?.nombre || "Producto desconocido"}
              </div>
              <div className="w-[30%] text-right align-top">
                {Number(item.total).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* TOTALS */}
        <div className="border-t-2 border-dashed border-black pt-2 mb-4">
          {/* Subtotals if needed (ignored for simple ticket) */}

          <div className="flex justify-between text-base font-bold my-1">
            <span>TOTAL</span>
            <span>S/ {Number(venta.total).toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-[11px] mt-1">
            <span>Efec. / Tarjeta:</span>
            <span>S/ {Number(venta.total).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span>Cambio:</span>
            <span>S/ 0.00</span>
          </div>
        </div>

        {/* FOOTER */}
        <div className="text-center mt-6 border-t border-black pt-4">
          <p className="font-bold mb-1">¡GRACIAS POR SU COMPRA!</p>
          <p className="text-[10px]">
            No se aceptan devoluciones después de 7 días.
          </p>
          <p className="text-[10px] mt-4">Sistema: Antigravity POS</p>
        </div>
      </div>

      {/* FLOAT PRINT BUTTON (Screen Only) */}
      <div className="fixed bottom-8 right-8 print:hidden flex flex-col gap-2">
        <button
          onClick={() => window.print()}
          className="bg-black text-white px-6 py-4 rounded-full shadow-2xl hover:bg-gray-800 font-bold flex items-center gap-2 transition-transform hover:scale-105"
        >
          IMPRIMIR
        </button>
      </div>

      {/* GLOBAL PRINT STYLES */}
      <style jsx global>{`
        @media print {
          /* Hide everything that is NOT the ticket container */
          body > *:not(.print\\:p-0) {
            display: none !important;
          }
          /* Ensure ticket container is visible and full width */
          .print\\:p-0 {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            box-shadow: none !important;
          }
          /* Remove default browser margins */
          @page {
            margin: 0;
            size: auto;
          }
          /* Hide sidebar/header artifacts from Layout */
          nav,
          header,
          aside,
          .sidebar {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
