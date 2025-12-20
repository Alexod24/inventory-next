import React from "react";
import Imagen from "@/components/ui/imagenes/ImagenResponsive";
import { EcommerceMetrics } from "@/components/ecommerce/Metricas";
import ProductosClient from "@/components/tabla/productos/client";

export const metadata = {
  title: "Productos - Sistema de inventario",
  description: "Gestión de productos e inventario",
};

export default function ProductosPage() {
  return (
    <div className="container mx-auto py-4 space-y-4 overflow-x-hidden">
      {/* Imagen principal ocupando todo el ancho */}
      {/* <div className="w-full">
        <Imagen
          src="/images/espacios/bienes1.jpg"
          alt="Descripción personalizada"
          className="shadow-lg rounded-xl w-full h-[400px] object-cover"
        />
      </div> */}

      {/* Métricas en una sola fila */}
      <div className="grid grid-cols-12 gap-4 items-center">
        <div className="col-span-12 flex flex-row space-x-4">
          <EcommerceMetrics className="flex-1" />
        </div>
      </div>

      {/* Tabla Gestionada por el Cliente */}
      <div className="overflow-x-auto max-w-full">
        <h2 className="text-xl font-semibold mb-4">Lista de Productos</h2>
        <ProductosClient />
      </div>
    </div>
  );
}
