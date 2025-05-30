"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/app/utils/supabase/supabase"; // Ajusta la ruta si es necesario
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";

type Props = {
  className?: string;
};

// Interfaz para definir el tipo de producto
interface Product {
  stock: number;
}

export const EcommerceMetrics: React.FC<Props> = ({ className = "" }) => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalStock, setTotalStock] = useState(0);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Obtener el total de productos
        const { data: products, error: productsError } = await supabase
          .from("base_operativa") // Cambia "productos" por el nombre real de tu tabla
          .select("*", { count: "exact" });

        if (productsError) throw productsError;

        setTotalProducts(products?.length || 0);

        // Obtener el total del stock
        const { data: stockData, error: stockError } = await supabase
          .from("productos") // Cambia "productos" por el nombre real de tu tabla
          .select("stock");

        if (stockError) throw stockError;

        // Calcular el stock total asegurándonos de que los datos sean del tipo correcto
        const totalStockValue = (stockData as Product[])?.reduce(
          (total, product) => total + (product.stock || 0),
          0
        );

        setTotalStock(totalStockValue || 0);
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div
      className={`grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6 ${className}`}
    >
      {/* Metric Item: Total Products */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Nº Productos
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {totalProducts}
            </h4>
          </div>
        </div>
      </div>

      {/* <Badge color="success">
        <ArrowUpIcon />
        +5.00%
      </Badge> */}

      {/* Metric Item: Total Stock */}
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

      {/* Metric Item: Total Stock */}
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
