import { Metadata } from "next";
import ProveedoresClient from "@/components/tabla/proveedores/client";

export const metadata: Metadata = {
  title: "Proveedores | Sistema de Inventario",
  description: "Gestión de proveedores",
};

export default function ProveedoresPage() {
  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
      <ProveedoresClient />
    </div>
  );
}
