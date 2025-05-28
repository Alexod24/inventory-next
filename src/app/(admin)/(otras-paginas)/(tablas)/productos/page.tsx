// import ComponentCard from "@/components/common/Tarjeta";
import PageBreadcrumb from "@/components/common/MigaPan";
import TablaProductos from "@/components/tabla/TablaProductos";
import { EcommerceMetrics } from "@/components/ecommerce/EcomerceMetrics";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "",
  description: "This is Next.js Basic Table  page for ",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Lista de Productos" />
      <EcommerceMetrics className="mb-6" />
      <div className="space-y-6">
        <TablaProductos />
      </div>
    </div>
  );
}
