import { Metadata } from "next";
import CajaClient from "@/components/tabla/caja/client";

export const metadata: Metadata = {
  title: "Caja | Sistema de Inventario",
  description: "Gestión de turnos y cortes de caja",
};

export default function CajaPage() {
  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
      <CajaClient />
    </div>
  );
}
