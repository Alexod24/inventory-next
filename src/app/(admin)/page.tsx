// admin/page.tsx
import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Bienvenido - Sistema de inventario",
  description: "Landing page para iniciar sesión o registrarse",
};

export default function AdminLanding() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-black-50">
      <h1 className="text-4xl font-bold">
        Bienvenido al Sistema de Inventario
      </h1>
      <p className="text-lg">Por favor, inicia sesión para continuar</p>

      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-3 bg-amber-500 text-white rounded hover:bg-amber-600 transition"
        >
          Iniciar sesión
        </Link>
      </div>
    </div>
  );
}
