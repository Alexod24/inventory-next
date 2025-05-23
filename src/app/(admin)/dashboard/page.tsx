import type { Metadata } from "next"
import {EcommerceMetrics} from "@/components/ecommerce/EcomerceMetrics"
import React from "react"
import VentasMensuales from "@/components/ecommerce/VentasMensuales"
import TarjetasMes from "@/components/ecommerce/TarjetasMes"
import TablaProductos from "@/components/tabla/TablaProductos"
// import GraficosStats from "@/components/ecommerce/GraficosStats"
// import TarjetaDemografica from "@/components/ecommerce/TarjetaDemografica"
import OrdenesRecientes from "@/components/ecommerce/OrdenesRecientes"

export const metadata: Metadata = {
    title:
    "Sistema de inventario",
    description:
    "Este es el sistema de inventario",

}

export default function Home() {
  
    return (
        <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 space-y-6 xl:col-span-7">
                <EcommerceMetrics />

                <VentasMensuales />
                
            </div>

      <div className="col-span-12 xl:col-span-5">
        <TarjetasMes />
      </div>
      
      <div className="col-span-12">
        <TablaProductos/>
      </div>

      {/* <div className="col-span-12">
        <GraficosStats/>
      </div>

      <div className="col-span-12 xl:col-span-5">
        <TarjetaDemografica/>
      </div>

      <div className="col-span-12 xl:col-span-7">
        <OrdenesRecientes/>
      </div> */}

      
    </div>
    )
};

