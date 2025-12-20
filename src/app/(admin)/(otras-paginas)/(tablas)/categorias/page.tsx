import React from "react";
import CategoriasClient from "@/components/tabla/categorias/client";

export const metadata = {
  title: "Categorías - Sistema de inventario",
  description: "Gestión de categorías de productos",
};

export default function CategoriasPage() {
  return (
    <div className="container mx-auto py-4">
      <CategoriasClient />
    </div>
  );
}
