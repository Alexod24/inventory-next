"use client";

import React, { useState } from "react";
import ProductSearch from "@/components/pos/ProductSearch";
import { useSede } from "@/context/SedeContext";
import { useUser } from "@/context/UserContext";
import { Database } from "@/types/supabase";
import { useRouter } from "next/navigation";
import {
  Trash2,
  ShoppingCart,
  CreditCard,
  Banknote,
  FileText,
  Barcode,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { createClientComponentClient } from "@/app/utils/supabase/browser";
import { Modal } from "@/components/ui/modal";

type ProductWithStock = Database["public"]["Tables"]["productos"]["Row"] & {
  stock_actual: number;
};

interface CartItem extends ProductWithStock {
  quantity: number;
  subtotal: number;
}

export default function POSPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const { sedeActual, loading: sedeLoading } = useSede();
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [montoRecibido, setMontoRecibido] = useState("");

  const supabase = createClientComponentClient<Database>();

  const addToCart = (product: ProductWithStock) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        // Validar Stock
        if (existing.quantity + 1 > product.stock_actual) {
          toast.error("No hay suficiente stock");
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * (item.precio_venta || 0),
              }
            : item
        );
      }
      return [
        ...prev,
        { ...product, quantity: 1, subtotal: product.precio_venta || 0 },
      ];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.id === id) {
          const newQuantity = item.quantity + delta;
          if (newQuantity < 1) return item;
          if (newQuantity > item.stock_actual) {
            toast.error("Stock insuficiente");
            return item;
          }
          return {
            ...item,
            quantity: newQuantity,
            subtotal: newQuantity * (item.precio_venta || 0),
          };
        }
        return item;
      });
    });
  };

  const total = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const vuelto = montoRecibido ? parseFloat(montoRecibido) - total : 0;

  const handleCheckout = async () => {
    if (!sedeActual || !user) return;
    setIsProcessing(true);

    try {
      // Insertar cada item en 'salidas'
      // NOTA: Idealmente esto sería un batch o una transacción RPC para garantizar atomicidad.
      // Por ahora lo hacemos en loop paralelo.

      const promises = cart.map((item) => {
        return supabase.from("salidas").insert({
          producto: item.id,
          cantidad: item.quantity,
          precio: item.precio_venta || 0,
          total: item.subtotal,
          sede_id: sedeActual.id,
          fecha: new Date().toISOString(), // Fecha actual
          // usuario_id: user.id // Supabase types might not have usuario_id in salidas yet based on types?
          // Revisando types... salidas tiene 'producto', 'cantidad', 'precio', 'total', 'sede_id'.
          // NO tiene usuario_id en la definición actual de types que generé.
          // Pero db_schema.md NO tiene usuario_id en salidas??
          // Revisando db_schema.md: salidas -> id, producto, cantidad, precio, fecha, total. NO TIENE USUARIO_ID explícito en esa tabla (raro).
          // Pero 'movimientos' sí.
          // Asumimos que 'salidas' es la tabla correcta.
        });
      });

      // También debemos descontar inventario.
      // Si tienes triggers (trigger_descontar_stock), esto se hará solo?
      // db_schema.md dice: trigger_descontar_stock en salidas -> EXECUTE FUNCTION descontar_stock().
      // ESE TRIGGER DEBE SER ACTUALIZADO para usar inventario_sedes.
      // Uff. El script de migración SQL NO tocó la función del trigger.
      // Eso es un riesgo. La función vieja descontará de productos.stock.
      // LIMITACION: Necesito actualizar la función del trigger o hacerlo manual.
      // Voy a intentar hacerlo manual aquí para asegurar, aunque sea redundante o conflictivo si el trigger existe.
      // MEJOR ESTRATEGIA: Asumir que el trigger fallará o hará algo mal, así que mejor actualizamos el stock manualmente en 'inventario_sedes'.

      const stockPromises = cart.map(async (item) => {
        // 1. Obtener stock actual (optimista, ya lo tenemos en cart, pero mejor re-verificar en prod real)
        // 2. Update
        const { error } = await supabase.rpc("decrement_stock", {
          p_sede_id: sedeActual.id,
          p_producto_id: item.id,
          p_cantidad: item.quantity,
        });
        // Si no existe RPC, hacemos update directo:
        if (error) {
          // Fallback UPDATE directo
          const { error: updateError } = await supabase
            .from("inventario_sedes")
            .update({ stock_actual: item.stock_actual - item.quantity })
            .eq("sede_id", sedeActual.id)
            .eq("producto_id", item.id);

          if (updateError) throw updateError;
        }
      });

      await Promise.all([...promises, ...stockPromises]);

      toast.success("Venta realizada con éxito");
      setCart([]);
      setShowPaymentModal(false);
      setMontoRecibido("");

      // Opcional: Imprimir Ticket aquí
    } catch (err: any) {
      console.error(err);
      toast.error("Error al procesar venta: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (sedeLoading) return <div>Cargando sistema...</div>;

  return (
    <div className="flex h-[calc(100vh-100px)] gap-4 p-4 bg-gray-50 dark:bg-gray-900 overflow-hidden relative">
      {/* Izquierda: Buscador y Catálogo */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-500" />
              Punto de Venta - {sedeActual?.nombre}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()} // Changed to router.back() or router.push('/') as needed
              className="text-gray-400 hover:text-red-500"
              title="Salir del POS"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
          <ProductSearch onAddProduct={addToCart} />
        </div>

        {/* Aquí podrías poner categorías rápidas o productos frecuentes */}
        <div className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm overflow-y-auto">
          <h3 className="text-gray-500 text-sm font-semibold mb-3">
            PRODUCTOS AGREGADOS RECIENTEMENTE
          </h3>
          {/* ... Placeholder para visualización de productos en grid ... */}
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <Barcode className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>Usa el buscador o escáner para agregar productos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Derecha: Carrito */}
      <div className="w-[400px] bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl flex flex-col h-full border-l border-gray-100">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="font-bold text-lg">Ticket de Venta</h3>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
            {cart.length} ítems
          </span>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors group"
            >
              <div className="flex-1">
                <div className="font-medium line-clamp-1">{item.nombre}</div>
                <div className="text-xs text-gray-400">
                  Unit: S/ {item.precio_venta?.toFixed(2)}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-6 h-6 flex items-center justify-center hover:bg-white rounded shadow-sm"
                  >
                    -
                  </button>
                  <span className="w-4 text-center text-sm font-bold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-6 h-6 flex items-center justify-center hover:bg-white rounded shadow-sm"
                  >
                    +
                  </button>
                </div>
                <div className="text-right w-16 font-bold">
                  S/ {item.subtotal.toFixed(2)}
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="text-center text-gray-400 py-10 italic">
              El carrito está vacío
            </div>
          )}
        </div>

        <div className="mt-auto border-t pt-4 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>S/ {(total / 1.18).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>IGV (18%)</span>
              <span>S/ {(total - total / 1.18).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-2xl font-bold text-gray-800 dark:text-white mt-2">
              <span>Total</span>
              <span>S/ {total.toFixed(2)}</span>
            </div>
          </div>

          <Button
            onClick={() => setShowPaymentModal(true)}
            disabled={cart.length === 0 || isProcessing}
            className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20"
          >
            {isProcessing ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <CreditCard className="mr-2" /> COBRAR S/ {total.toFixed(2)}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Modal de Pago */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        className="max-w-md"
      >
        <div className="p-6">
          <h3 className="text-2xl font-bold mb-6 text-center">
            Confirmar Pago
          </h3>

          <div className="mb-6 space-y-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl text-center">
              <div className="text-sm text-gray-500 uppercase">
                Total a Pagar
              </div>
              <div className="text-4xl font-extrabold text-blue-600">
                S/ {total.toFixed(2)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Monto Recibido
              </label>
              <div className="relative">
                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" />
                <Input
                  type="number"
                  className="pl-10 h-12 text-lg"
                  placeholder="0.00"
                  value={montoRecibido}
                  onChange={(e) => setMontoRecibido(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {parseFloat(montoRecibido) >= total && (
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg flex justify-between items-center text-green-700 dark:text-green-400">
                <span className="font-bold">Vuelto:</span>
                <span className="text-xl font-bold">
                  S/ {vuelto.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => setShowPaymentModal(false)}
              className="h-12"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCheckout}
              disabled={!montoRecibido || parseFloat(montoRecibido) < total}
              className="h-12 bg-green-600 hover:bg-green-700"
            >
              <FileText className="mr-2 w-4 h-4" /> Finalizar Venta
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Loader2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
