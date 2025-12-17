"use client";

import React, { useState, useEffect } from "react";
import ProductSearch from "@/components/pos/ProductSearch";
import { useSede } from "@/context/SedeContext";
import { useUser } from "@/context/UserContext";
import { Database } from "@/types/supabase";
import {
  Trash2,
  ShoppingCart,
  CreditCard,
  Banknote,
  FileText,
  Barcode,
  X,
  Loader2,
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

interface POSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function POSModal({ isOpen, onClose }: POSModalProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { sedeActual, loading: sedeLoading } = useSede();
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false); // Inner modal state
  const [montoRecibido, setMontoRecibido] = useState("");

  const supabase = createClientComponentClient<Database>();

  // Reset states when modal opens/closes if needed, or keep persistent?
  // For now, let's keep it simple. If we want to reset on close:
  useEffect(() => {
    if (!isOpen) {
      // Optional: Clean up state when closed
      // setCart([]);
      // setShowPaymentConfirm(false);
      // setMontoRecibido("");
    }
  }, [isOpen]);

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
      // 1. Crear Cabecera de Venta (Tabla 'ventas')
      const { data: ventaData, error: ventaError } = await supabase
        .from("ventas")
        .insert({
          sede_id: sedeActual.id,
          usuario_id: user.id || null, // Assuming user context has id. Adjust if needed.
          total: total,
          // cliente_nombre: "Cliente General", // Could come from input
          metodo_pago: "efectivo", // Could come from state
        })
        .select()
        .single();

      if (ventaError)
        throw new Error("Error al crear la venta: " + ventaError.message);

      const ventaId = ventaData.id;

      // 2. Registrar Detalles (Tabla 'salidas')
      for (const item of cart) {
        const { error: insertError } = await supabase.from("salidas").insert({
          producto: item.id,
          cantidad: item.quantity,
          precio: item.precio_venta || 0,
          total: item.subtotal,
          sede_id: sedeActual.id,
          fecha: new Date().toISOString(),
          venta_id: ventaId, // <-- LINK TO HEADER
        });

        if (insertError) {
          console.error("Error inserting sale item:", item, insertError);
          throw new Error(
            `Fallo al registrar producto ${item.nombre}: ${insertError.message}`
          );
        }
      }

      // 2. Stock Update is handled by DB Trigger (tr_control_stock_salida)
      // No manual update needed here across network.

      toast.success("Venta realizada con éxito");
      setCart([]);
      setShowPaymentConfirm(false);
      setMontoRecibido("");
      onClose(); // Close the main modal after success

      // Opcional: Imprimir Ticket aquí
    } catch (err: any) {
      console.error(err);
      toast.error("Error al procesar venta: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
      {/* Container Full Screenish */}
      <div className="bg-gray-50 dark:bg-gray-900 w-[95vw] h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex relative">
        {/* Close Button Absolute */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-50 text-gray-400 hover:text-red-500 hover:bg-white/50"
        >
          <X className="w-8 h-8" />
        </Button>

        {/* Content Layout (Same as Page) */}
        <div className="flex-1 flex gap-4 p-6 h-full w-full">
          {/* Izquierda: Buscador y Catálogo */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm relative">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <ShoppingCart className="w-6 h-6 text-blue-500" />
                  Punto de Venta - {sedeActual?.nombre}
                </h2>
              </div>
              <ProductSearch onAddProduct={addToCart} />
            </div>

            <div className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm overflow-y-auto">
              <h3 className="text-gray-500 text-sm font-semibold mb-3">
                PRODUCTOS AGREGADOS RECIENTEMENTE
              </h3>
              {/* ... Placeholder para visualización de productos en grid ... */}
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <Barcode className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg">
                    Usa el buscador o escáner para agregar productos
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Derecha: Carrito */}
          <div className="w-[450px] bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl flex flex-col h-full border-l border-gray-100">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="font-bold text-xl">Ticket de Venta</h3>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                {cart.length} ítems
              </span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors group"
                >
                  <div className="flex-1">
                    <div className="font-medium line-clamp-1">
                      {item.nombre}
                    </div>
                    <div className="text-xs text-gray-400">
                      Unit: S/ {item.precio_venta?.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md shadow-sm transition-all"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-sm font-bold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md shadow-sm transition-all"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right w-20 font-bold text-lg">
                      S/ {item.subtotal.toFixed(2)}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="text-center text-gray-400 py-20 italic flex flex-col items-center">
                  <ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
                  El carrito está vacío
                </div>
              )}
            </div>

            <div className="mt-auto border-t pt-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>S/ {(total / 1.18).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>IGV (18%)</span>
                  <span>S/ {(total - total / 1.18).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-3xl font-bold text-gray-800 dark:text-white mt-4">
                  <span>Total</span>
                  <span>S/ {total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={() => setShowPaymentConfirm(true)}
                disabled={cart.length === 0 || isProcessing}
                className="w-full h-16 text-xl font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin w-6 h-6" />
                ) : (
                  <>
                    <CreditCard className="mr-3 w-6 h-6" /> COBRAR S/{" "}
                    {total.toFixed(2)}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación de Pago (Inner Modal) */}
      <Modal
        isOpen={showPaymentConfirm}
        onClose={() => setShowPaymentConfirm(false)}
        className="max-w-md z-[110]" // Z-index higher than main modal
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
              onClick={() => setShowPaymentConfirm(false)}
              className="h-12"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCheckout}
              disabled={!montoRecibido || parseFloat(montoRecibido) < total}
              className="h-12 bg-green-600 hover:bg-green-700 font-bold"
            >
              <FileText className="mr-2 w-4 h-4" /> CONFIRMAR
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
