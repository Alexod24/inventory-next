import type { Metadata } from "next";
// import { EcommerceMetrics } from "@/components/ecommerce/EcomerceMetrics";
import React from "react";
// import VentasMensuales from "@/components/ecommerce/VentasMensuales";
// import TarjetasMes from "@/components/ecommerce/TarjetasMes";
// import TablaProductos from "@/components/tabla/TablaProductos";
// import TablaIngreso from "@/components/tabla/TablaIngreso";
// import TablaSalida from "@/components/tabla/TablaSalida";
import Imagen from "@/components/ui/imagenes/ImagenResponsive";

// import GraficosStats from "@/components/ecommerce/GraficosStats"
// import TarjetaDemografica from "@/components/ecommerce/TarjetaDemografica"
// import OrdenesRecientes from "@/components/ecommerce/OrdenesRecientes"

export const metadata: Metadata = {
  title: "Sistema de inventario",
  description: "Este es el sistema de inventario",
};

export default function Home() {
  return (
    <div className="w-full">
      <Imagen
        src="/images/espacios/base-operativa.jpg"
        alt="Descripción personalizada"
        className="shadow-lg rounded-xl w-full h-[400px] object-cover"
      />
    </div>
  );
}
