"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/app/utils/supabase/supabase"; // Ajusta la ruta si es necesario
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";

type Props = {
  className?: string;
};

// Interfaz para definir el tipo de datos que realmente obtienes de la consulta de stock
interface StockQuantity {
  cantidad: number; // La columna en tu tabla de Supabase que representa el stock
}

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
          .select("cantidad"); // <-- CAMBIO CLAVE AQUÍ: Selecciona 'cantidad'

        if (stockError) throw stockError;

        // Calcular el stock total sumando la propiedad 'cantidad'
        // Se realiza un casting a `StockQuantity[]` para asegurar el tipo correcto para TypeScript
        const totalStockValue = (stockData as StockQuantity[])?.reduce(
          (total, item) => total + (item.cantidad || 0), // Suma 'item.cantidad'
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

      {/* Metric Item: Leyenda del Estado Fisico */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Leyenda del Estado Fisico
          </span>
          <ul className="mt-2 space-y-2 text-gray-800 dark:text-white/90 text-sm">
            <li className="flex items-center">
              <span className="inline-block w-3 h-3 bg-green-400 rounded mr-2 shadow-sm"></span>
              Bueno: En buen estado, sin daños visibles.
            </li>
            <li className="flex items-center">
              <span className="inline-block w-3 h-3 bg-orange-400 rounded mr-2 shadow-sm"></span>
              Dañado: Tiene detalles o desgaste, pero sirve.
            </li>
            <li className="flex items-center">
              <span className="inline-block w-3 h-3 bg-red-600 rounded mr-2 shadow-sm"></span>
              Roto: No funciona o está inutilizable.
            </li>
          </ul>
        </div>
      </div>

      {/* Metric Item: Leyenda de la disponibilidad */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Leyenda de la disponibilidad
          </span>
          <ul className="mt-2 space-y-2 text-gray-800 dark:text-white/90 text-sm">
            <li className="flex items-center">
              <span className="inline-block w-3 h-3 bg-green-400 rounded mr-2 shadow-sm"></span>
              Ok: Está en su lugar y listo para usarse.
            </li>
            <li className="flex items-center">
              <span className="inline-block w-3 h-3 bg-orange-400 rounded mr-2 shadow-sm"></span>
              Pendiente: Por revisar si está o no disponible.
            </li>
            <li className="flex items-center">
              <span className="inline-block w-3 h-3 bg-red-600 rounded mr-2 shadow-sm"></span>
              Faltante: No se encontró en su sitio.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
