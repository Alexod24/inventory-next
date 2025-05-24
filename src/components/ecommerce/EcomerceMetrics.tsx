"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/app/utils/supabase/supabase"; // Ajusta la ruta si es necesario
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";

type Props = {
  className?: string;
};

export const EcommerceMetrics: React.FC<Props> = ({ className = "" }) => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalStock, setTotalStock] = useState(0);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Obtener el total de productos
        const { data: products, error: productsError } = await supabase
          .from("productos") // Cambia "products" por el nombre real de tu tabla
          .select("*", { count: "exact" });

        if (productsError) throw productsError;

        setTotalProducts(products?.length || 0);

        // Obtener el total del stock
        const { data: stockData, error: stockError } = await supabase
          .from("productos") // Cambia "products" por el nombre real de tu tabla
          .select("stock"); // Cambia "stock" por el nombre real de la columna de tu tabla

        if (stockError) throw stockError;

        const totalStockValue = stockData?.reduce(
          (total: number, product: any) => total + (product.stock || 0),
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
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 ${className}`}>
      {/* Metric Item: Total Products */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Nº Productos</span>
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

      {/* Metric Item: Total Stock */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Stock</span>
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
    </div>
  );
};
