"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/app/utils/supabase/supabase"; // Ajusta la ruta si es necesario
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";

type Props = {
  className?: string;
};

// Interfaz para definir el tipo de datos que realmente obtienes de la consulta de stock
// Esta interfaz coincide con el resultado de .select("cantidad")
interface StockQuantity {
  cantidad: number; // La columna en tu tabla de Supabase que representa el stock
}

// La interfaz 'Product' anterior que esperaba 'stock' ha sido eliminada
// para evitar el conflicto de tipos, ya que tus datos devuelven 'cantidad'.

export const EcommerceMetrics: React.FC<Props> = ({ className = "" }) => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalStock, setTotalStock] = useState(0);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Obtener el total de productos
        const { data: products, error: productsError } = await supabase
          .from("bienes") // Cambia "bienes" por el nombre real de tu tabla si es diferente
          .select("*", { count: "exact" });

        if (productsError) throw productsError;

        setTotalProducts(products?.length || 0);

        // Obtener el total del stock
        // Se selecciona la columna 'cantidad' para que coincida con la interfaz StockQuantity
        const { data: stockData, error: stockError } = await supabase
          .from("bienes") // Cambia "bienes" por el nombre real de tu tabla si es diferente
          .select("cantidad"); // <-- Asegúrate de que esta es la columna correcta para el stock

        if (stockError) throw stockError;

        // Calcular el stock total sumando la propiedad 'cantidad'
        // Se realiza un casting a `StockQuantity[]` y se suma 'item.cantidad'
        const totalStockValue = (stockData as StockQuantity[])?.reduce(
          (total, item) => total + (item.cantidad || 0), // <-- Suma 'item.cantidad'
          0
        );

        setTotalStock(totalStockValue || 0);
      } catch (error) {
        console.error("Error fetching metrics:", error);
        // Aquí podrías añadir un estado de error visible en la UI si lo necesitas
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div
      className={`grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6 ${className}`}
    >
      {/* Metric Item: Nº de Bienes */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Nº de Bienes
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {totalProducts}
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            {/* Este porcentaje puede ser dinámico si tienes un historial */}
            +5.00%
          </Badge>
        </div>
      </div>

      {/* Metric Item: Nº de Espacios (Total Stock) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Nº de Espacios
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {totalStock}
            </h4>
          </div>
          <Badge color="error">
            <ArrowDownIcon />
            {/* Este porcentaje también puede ser dinámico */}
            -3.00%
          </Badge>
        </div>
      </div>

      {/* Metric Item: Cantidad Total (Este parece ser un duplicado de Nº de Bienes, considera si es intencional) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Cantidad Total
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {totalProducts} {/* Esto es totalProducts, no totalStock */}
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            {/* Este porcentaje puede ser dinámico si tienes un historial */}
            +5.00%
          </Badge>
        </div>
      </div>

    </div>
  );
};
