"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Plus, Barcode } from "lucide-react";
import { createClientComponentClient } from "@/app/utils/supabase/browser";
import { Database } from "@/types/supabase";
import { useSede } from "@/context/SedeContext";
import { toast } from "react-hot-toast";

type ProductWithStock = Database["public"]["Tables"]["productos"]["Row"] & {
  stock_actual: number;
};

interface ProductSearchProps {
  onAddProduct: (product: ProductWithStock) => void;
}

export default function ProductSearch({ onAddProduct }: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductWithStock[]>([]);
  const [loading, setLoading] = useState(false);
  const { sedeActual } = useSede();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClientComponentClient<Database>();

  // Auto-focus al montar
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleSearch = async (term: string) => {
    setQuery(term);
    console.log("🔍 Buscando:", term, "Sede:", sedeActual);

    if (!sedeActual) {
      console.warn("⚠️ No hay sede seleccionada");
      setResults([]);
      return;
    }

    if (term.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      console.log("📡 Enviando query a Supabase (productos)...");
      const { data: products, error } = await supabase
        .from("productos")
        .select("id, nombre, precio_venta, codigo")
        .ilike("nombre", `%${term}%`)
        .order("nombre")
        .limit(50);

      console.log("📦 Respuesta Supabase:", { products, error });

      if (error) {
        console.error("❌ Error Supabase:", error);
        throw error;
      }

      if (!products || products.length === 0) {
        setResults([]);
        setLoading(false);
        return;
      }

      // 2. Obtener stock SOLO para esos productos en la sede actual
      const productIds = products.map((p) => p.id);
      console.log("🔍 Buscando stock para IDs:", productIds);

      const { data: stockData, error: stockError } = await supabase
        .from("inventario_sedes")
        .select("producto_id, stock_actual")
        .eq("sede_id", sedeActual.id)
        .in("producto_id", productIds);

      console.log("📦 Respuesta Stock:", { stockData, stockError });

      if (stockError) throw stockError;

      // 3. Cruzar datos
      const formattedProducts = products.map((p) => {
        const stockRecord = stockData?.find((s) => s.producto_id === p.id);
        return {
          ...p,
          stock_actual: stockRecord?.stock_actual || 0, // Si no hay registro, es 0
          // Mantener compatibilidad con tipos
          precio_compra: 0,
          fecha_c: "",
          descripcion: null,
          categoria: null,
          fecha_v: null,
        } as ProductWithStock;
      });

      console.log("✅ Productos formateados finales:", formattedProducts);
      setResults(formattedProducts);

      // Si hay una coincidencia EXACTA de código, agregar automáticamente (Modo Escaner)
      const exactMatch = formattedProducts.find((p) => p.codigo === term);
      if (exactMatch) {
        console.log("🎯 Coincidencia exacta encontrada:", exactMatch);
        onAddProduct(exactMatch);
        setQuery(""); // Limpiar para siguiente escaneo
        setResults([]);
        toast.success(`Agregado: ${exactMatch.nombre}`);
      }
    } catch (error: any) {
      console.error("Error searching products raw:", error);
      console.error("Error details:", {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
      });
      toast.error(`Error buscando: ${error?.message || "Desconocido"}`);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
  };

  return (
    <div className="w-full space-y-4 relative z-50">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            ref={searchInputRef}
            placeholder="Escanear código o buscar nombre..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 pr-10 h-12 text-lg" // pr-10 para espacio del botón X
          />
          {/* DEBUG BUTTON */}
          {/* DEBUG BUTTON REMOVED */}
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-blue-500" />
          )}
          {!loading && query && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Plus className="w-5 h-5 rotate-45" /> {/* Icono X */}
            </button>
          )}
        </div>
      </div>

      {/* Resultados Grid */}
      {results.length > 0 && (
        <div className="absolute top-14 left-0 w-full bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-100 dark:border-gray-700 max-h-[60vh] overflow-y-auto p-2 z-50">
          <div className="flex justify-between items-center px-2 py-2 mb-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-xs font-semibold text-gray-500">
              RESULTADOS ({results.length})
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setResults([])}
              className="h-6 text-xs text-red-500 hover:text-red-600"
            >
              Cerrar Resultados
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {results.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  onAddProduct(product);
                  setQuery("");
                  setResults([]);
                  searchInputRef.current?.focus();
                }}
                className="cursor-pointer border border-gray-200 dark:border-gray-700 p-4 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex flex-col gap-2 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 line-clamp-2">
                    {product.nombre}
                  </h4>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      product.stock_actual > 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    Stock: {product.stock_actual}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-auto">
                  <span className="font-bold text-lg text-blue-600">
                    S/ {product.precio_venta?.toFixed(2)}
                  </span>

                  {product.codigo && (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Barcode className="w-3 h-3" />
                      {product.codigo}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {query.length > 2 && results.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-8">
          No se encontraron productos probables.
        </div>
      )}
    </div>
  );
}
