"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { MoreDotIcon } from "@/icons";
import { DesplegableItem } from "../ui/desplegable/DesplegableItem";
import { useEffect, useState } from "react";
import { Desplegable } from "../ui/desplegable/Desplegable";
import { supabase } from "@/app/utils/supabase/supabase"; // Ajusta esta ruta según tu proyecto

// Importa ApexCharts dinámicamente
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function MonthlySalesChart() {
  const [productData, setProductData] = useState<{ name: string; stock: number }[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Función para cargar los productos desde Supabase
  async function fetchProductos() {
    const { data, error } = await supabase.from("productos").select("nombre, stock");
    if (error) {
      console.error("Error al obtener los productos:", error.message);
      return [];
    }
    return data.map((producto) => ({
      name: producto.nombre,
      stock: producto.stock,
    }));
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    async function loadData() {
      const data = await fetchProductos();
      setProductData(data);
    }

    loadData();
  }, []);

  // Opciones para ApexCharts
  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: productData.map((item) => item.name), // Nombres de productos
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: "Stock",
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        show: true,
      },
      y: {
        formatter: (val: number) => `${val}`,
      },
    },
  };

  // Series para el gráfico
  const series = [
    {
      name: "Stock",
      data: productData.map((item) => item.stock), // Valores de stock
    },
  ];

  // Funciones para el desplegable
  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Stock de Productos
        </h3>

        <div className="relative inline-block">
          <button onClick={toggleDropdown} className="dropdown-toggle">
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Desplegable
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-40 p-2"
          >
            <DesplegableItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Ver más
            </DesplegableItem>
            <DesplegableItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Eliminar
            </DesplegableItem>
          </Desplegable>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={180}
          />
        </div>
      </div>
    </div>
  );
}
