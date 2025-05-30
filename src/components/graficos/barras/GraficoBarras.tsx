// "use client";

// import React, { useEffect, useState } from "react";
// import { ApexOptions } from "apexcharts";
// import dynamic from "next/dynamic";
// import { supabase } from "@/app/utils/supabase/supabase"; // Ajusta la ruta según tu proyecto

// // Importa ApexCharts dinámicamente
// const ReactApexChart = dynamic(() => import("react-apexcharts"), {
//   ssr: false,
// });

// export default function BarChartOne() {
//   const [productData, setProductData] = useState<{ name: string; stock: number }[]>([]);

//   // Función para cargar los productos
//   async function fetchProductos() {
//     const { data, error } = await supabase.from("productos").select("nombre, stock");

//     if (error) {
//       console.error("Error fetching productos:", error.message);
//       return [];
//     }

//     return data.map((producto) => ({
//       name: producto.nombre,
//       stock: producto.stock,
//     }));
//   }

//   // Cargar datos al montar el componente y agregar suscripción
//   useEffect(() => {
//     async function loadData() {
//       const data = await fetchProductos();
//       setProductData(data);
//     }

//     loadData();

//     const subscription = supabase
//       .from("productos")
//       .on("*", async () => {
//         const data = await fetchProductos();
//         setProductData(data);
//       })
//       .subscribe();

//     return () => {
//       supabase.removeSubscription(subscription);
//     };
//   }, []);

//   // Opciones del gráfico
//   const options: ApexOptions = {
//     colors: ["#465fff"],
//     chart: {
//       fontFamily: "Outfit, sans-serif",
//       type: "bar",
//       height: 180,
//       toolbar: { show: false },
//     },
//     plotOptions: {
//       bar: {
//         horizontal: false,
//         columnWidth: "39%",
//         borderRadius: 5,
//         borderRadiusApplication: "end",
//       },
//     },
//     dataLabels: { enabled: false },
//     stroke: { show: true, width: 4, colors: ["transparent"] },
//     xaxis: {
//       categories: productData.map((item) => item.name), // Nombres de productos
//       axisBorder: { show: false },
//       axisTicks: { show: false },
//     },
//     legend: {
//       show: true,
//       position: "top",
//       horizontalAlign: "left",
//       fontFamily: "Outfit",
//     },
//     yaxis: { title: { text: "Stock" } },
//     grid: { yaxis: { lines: { show: true } } },
//     fill: { opacity: 1 },
//     tooltip: {
//       x: { show: true },
//       y: { formatter: (val: number) => `${val}` },
//     },
//   };

//   // Series del gráfico
//   const series = [
//     {
//       name: "Stock",
//       data: productData.map((item) => item.stock), // Valores de stock
//     },
//   ];

//   return (
//     <div className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition duration-300">
//       <h2 className="text-xl font-bold mb-4">Stock por Producto</h2>
//       <ReactApexChart
//         options={options}
//         series={series}
//         type="bar"
//         height={180}
//       />
//     </div>
//   );
// }
