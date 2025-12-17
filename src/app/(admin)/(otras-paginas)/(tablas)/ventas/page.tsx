import React from "react";
import VentasClient from "@/components/tabla/ventas/client";

export default function VentasPage() {
  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <VentasClient />
    </div>
  );
}
