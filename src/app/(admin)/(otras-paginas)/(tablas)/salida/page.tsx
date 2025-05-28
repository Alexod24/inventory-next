import ComponentCard from "@/components/common/Tarjeta";
import PageBreadcrumb from "@/components/common/MigaPan";
import TablaSalida from "@/components/tabla/TablaSalida";
import { EcommerceMetrics } from "@/components/ecommerce/EcomerceMetrics";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Basic Table | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Basic Table  page for TailAdmin  Tailwind CSS Admin Dashboard Template",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="" />
      <EcommerceMetrics className="mb-6" />
      <div className="space-y-6">
        <TablaSalida />
      </div>
    </div>
  );
}
