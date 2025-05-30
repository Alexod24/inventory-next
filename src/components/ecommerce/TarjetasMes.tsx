// "use client";

// import { ApexOptions } from "apexcharts";
// import dynamic from "next/dynamic";
// import { Desplegable } from "../ui/desplegable/Desplegable";
// import { MoreDotIcon } from "@/icons";
// import { useState, useEffect, useCallback } from "react";
// import { DesplegableItem } from "../ui/desplegable/DesplegableItem";
// import { supabase } from "@/app/utils/supabase/supabase";

// const ReactApexChart = dynamic(() => import("react-apexcharts"), {
//   ssr: false,
// });

// interface Producto {
//   nombre: string;
//   ganancia: number;
//   perdida: number;
// }

// export default function TarjetasMes() {
//   const [productos, setProductos] = useState<Producto[]>([]);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchDatos = async () => {
//       try {
//         const { data, error } = await supabase.from("salidas").select(`
//           cantidad,
//           precio,
//           productos (
//             nombre
//           )
//         `);

//         if (error) throw new Error("Error cargando datos de ventas");
//         if (!data) return;

//         const productosMap: Record<string, Producto> = {};
//         data.forEach((salida) => {
//           const nombre = salida.productos?.nombre || "Sin nombre";
//           const cantidad = Number(salida.cantidad);
//           const precio = Number(salida.precio);
//           const ganancia = cantidad * precio;
//           const perdida = 0;

//           if (productosMap[nombre]) {
//             productosMap[nombre].ganancia += ganancia;
//             productosMap[nombre].perdida += perdida;
//           } else {
//             productosMap[nombre] = { nombre, ganancia, perdida };
//           }
//         });

//         setProductos(Object.values(productosMap));
//       } catch (err) {
//         setError((err as Error).message);
//       }
//     };

//     fetchDatos();
//   }, []);

//   const totalGanancia = productos.reduce((acc, p) => acc + p.ganancia, 0);
//   const totalPerdida = productos.reduce((acc, p) => acc + p.perdida, 0);
//   const totalNeto = totalGanancia - totalPerdida;

//   const porcentajeMeta = totalNeto > 0 ? (totalGanancia / totalNeto) * 100 : 0;
//   const series = [totalNeto];

//   const options: ApexOptions = {
//     colors: ["#465FFF"],
//     chart: {
//       fontFamily: "Outfit, sans-serif",
//       type: "radialBar",
//       height: 330,
//       sparkline: {
//         enabled: true,
//       },
//     },
//     plotOptions: {
//       radialBar: {
//         startAngle: -85,
//         endAngle: 85,
//         hollow: {
//           size: "80%",
//         },
//         track: {
//           background: "#E4E7EC",
//           strokeWidth: "100%",
//           margin: 5,
//         },
//         dataLabels: {
//           name: {
//             show: false,
//           },
//           value: {
//             fontSize: "36px",
//             fontWeight: "600",
//             offsetY: -40,
//             color: "#1D2939",
//             formatter: (val) =>
//               typeof val === "number"
//                 ? `s/ ${val.toLocaleString(undefined, {
//                     minimumFractionDigits: 2,
//                     maximumFractionDigits: 2,
//                   })}`
//                 : "s/ 0.00",
//           },
//         },
//       },
//     },
//     fill: {
//       type: "solid",
//       colors: ["#465FFF"],
//     },
//     stroke: {
//       lineCap: "round",
//     },
//     labels: ["Progreso"],
//   };

//   const [isOpen, setIsOpen] = useState(false);
//   const toggleDropdown = useCallback(() => setIsOpen((prev) => !prev), []);
//   const closeDropdown = useCallback(() => setIsOpen(false), []);

//   if (error) {
//     return (
//       <div className="p-4 text-center text-red-500 font-semibold">{error}</div>
//     );
//   }

//   return (
//     <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
//       <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
//         <div className="flex justify-between">
//           <div>
//             <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
//               Meta semanal
//             </h3>
//             <p className="mt-1 font-normal text-gray-500 text-theme-sm dark:text-gray-400">
//               Meta que te has puesto para esta semana : s/ 100.00
//             </p>
//           </div>
//           <div className="relative inline-block">
//             <button onClick={toggleDropdown} className="dropdown-toggle">
//               <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
//             </button>
//             <Desplegable
//               isOpen={isOpen}
//               onClose={closeDropdown}
//               className="w-40 p-2"
//             >
//               <DesplegableItem
//                 tag="a"
//                 onItemClick={closeDropdown}
//                 className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
//               >
//                 View More
//               </DesplegableItem>
//               <DesplegableItem
//                 tag="a"
//                 onItemClick={closeDropdown}
//                 className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
//               >
//                 Delete
//               </DesplegableItem>
//             </Desplegable>
//           </div>
//         </div>

//         <div className="relative">
//           <div className="max-h-[330px]">
//             {series.length > 0 ? (
//               <ReactApexChart
//                 options={options}
//                 series={series}
//                 type="radialBar"
//                 height={330}
//               />
//             ) : (
//               <p className="text-center text-gray-500">
//                 No hay datos para mostrar el gráfico.
//               </p>
//             )}
//           </div>
//           <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
//             +{(porcentajeMeta - 100 || 0).toFixed(2)}%
//           </span>
//         </div>

//         <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
//           Ganaste s/ {totalGanancia.toLocaleString()} hasta ahora, nos falta
//           poco para llegar a la meta.
//         </p>
//       </div>

//       <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
//         <div>
//           <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
//             Pérdida
//           </p>
//           <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
//             s/ {totalPerdida.toLocaleString()}
//           </p>
//         </div>

//         <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

//         <div>
//           <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
//             Ganancia
//           </p>
//           <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
//             s/ {totalGanancia.toLocaleString()}
//           </p>
//         </div>

//         <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

//         <div>
//           <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
//             Total
//           </p>
//           <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
//             s/ {totalNeto.toLocaleString()}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
