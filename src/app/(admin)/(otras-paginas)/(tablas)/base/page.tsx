import React from "react";
import Imagen from "@/components/ui/imagenes/ImagenResponsive";
import { EcommerceMetrics } from "@/components/ecommerce/Metricas";
import MonthlySalesChart from "@/components/ecommerce/TarjetasMes";
// import { Payment } from "@/components/tabla/base-operativa/columns";
// import { DataTable as PaymentTable } from "@/components/tabla/base-operativa/data-table";
import fs from "fs";
import path from "path";
import { DataTable as ExpenseTable } from "@/components/tabla/bienes/data-table";
import { columns as expenseColumns } from "@/components/tabla/bienes/columns";

export const metadata = {
  title: "Bienvenido - Sistema de inventario",
  description: "Landing page para iniciar sesión o registrarse",
};

// Función para obtener datos de gastos desde un archivo JSON
async function getExpenseData() {
  const filePath = path.join(process.cwd(), "src/app", "data.json");
  const data = fs.readFileSync(filePath, "utf8");
  return JSON.parse(data);
}

export default async function CombinedPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const paymentData = await getPaymentData();
  const expenseData = await getExpenseData();

  return (
    // <div className="container mx-auto py-4 space-y-4 overflow-x-hidden">
    //   {/* Imagen principal ocupando todo el ancho */}
    //   <div className="w-full">
    //     <Imagen
    //       src="/images/espacios/lobby1.jpg"
    //       alt="Descripción personalizada"
    //       className="shadow-lg rounded-xl w-full h-[400px] object-cover"
    //     />
    //   </div>

    //   {/* Métricas en una sola fila */}
    //   {/* <div className="grid grid-cols-12 gap-4 items-center">
    //     <div className="col-span-12 flex flex-row space-x-4">
    //       <EcommerceMetrics className="flex-1" />
    //     </div>
    //   </div> */}
    //   <div className="col-span-12 space-y-6 xl:col-span-7">
    //     <EcommerceMetrics />

    //     <MonthlySalesChart />
    //   </div>

    //   {/* Tabla de gastos con scroll horizontal solo ahí */}
    //   <div className="overflow-x-auto max-w-full">
    //     <h2 className="text-xl font-semibold mb-4">
    //       Base operativa (Lista de items)
    //     </h2>
    //     <ExpenseTable
    //       data={expenseData}
    //       columns={expenseColumns}
    //       loading={false}
    //     />
    //   </div>
    // </div>
    <div className="container mx-auto py-4 space-y-4 overflow-x-hidden">
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics />

          <MonthlySalesChart />
        </div>
        <div className="col-span-12 xl:col-span-5">
          <Imagen
            src="/images/espacios/bienes.jpg"
            alt="Descripción personalizada"
            className="shadow-lg rounded-xl w-full h-[465px] object-cover"
          />
        </div>
      </div>
      <div className="overflow-x-auto max-w-full">
        <h2 className="text-xl font-semibold mb-4">Lista De Productos</h2>
        <ExpenseTable
          data={expenseData}
          columns={expenseColumns}
          loading={false}
        />
      </div>
    </div>
  );
}
