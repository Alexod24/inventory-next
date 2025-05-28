import React from "react";
import Imagen from "@/components/ui/imagenes/ImagenResponsive";
import { Metricas } from "@/components/ecommerce/Metricas";
import { Payment, columns as paymentColumns } from "@/components/tabla/base-operativa/columns";
import { DataTable as PaymentTable } from "@/components/tabla/base-operativa/data-table";
import fs from "fs";
import path from "path";
import { DataTable as ExpenseTable } from "@/components/tabla/base-operativa/data-table";
import { columns as expenseColumns } from "@/components/tabla/base-operativa/columns";

export const metadata = {
  title: "Dashboard | Next.js Expense & Payment Tracker",
  description:
    "This page combines payment tracking and expense management for TailAdmin.",
};

// Simulamos fetch async para obtener pagos
async function getPaymentData(): Promise<Payment[]> {
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    // Otros datos simulados
  ];
}

// Función para obtener datos de gastos desde un archivo JSON
async function getExpenseData() {
  const filePath = path.join(
    process.cwd(),
    "src/app",
    "data.json"
  );
  const data = fs.readFileSync(filePath, "utf8");
  return JSON.parse(data);
}

export default async function CombinedPage() {
  const paymentData = await getPaymentData();
  const expenseData = await getExpenseData();

  return (
  <div className="container mx-auto py-10 space-y-10">
    {/* Sección grilla con imagen y métricas */}
    <div className="grid grid-cols-12 gap-6 md:gap-4">
      <div className="col-span-12 md:col-span-7 flex justify-center md:justify-start">
        <Metricas className="w-full max-w-none" />
      </div>

      <div className="col-span-12 md:col-span-5 flex justify-center md:justify-end">
        <Imagen
          src="/images/espacios/base-operativa.jpg"
          alt="Descripción personalizada"
          width={400}
          height={500}
          className="shadow-lg"
        />
      </div>
    </div>

    {/* Tabla de gastos */}
    <div>
      <h2 className="text-xl font-semibold mb-4">Base operativa</h2>
      <ExpenseTable data={expenseData} columns={expenseColumns} />
    </div>
  </div>
);

}
