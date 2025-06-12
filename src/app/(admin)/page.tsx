// admin/page.tsx
import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Bienvenido - Sistema de inventario",
  description: "Landing page para iniciar sesión o registrarse",
};

export default function AdminLanding() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-gray-50">
      <h1 className="text-4xl font-bold">
        Bienvenido al Sistema de Inventario
      </h1>
      <p className="text-lg">
        Por favor, inicia sesión o regístrate para continuar
      </p>

      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/register"
          className="px-6 py-3 border border-blue-600 text-blue-600 rounded hover:bg-blue-100 transition"
        >
          Registrarse
        </Link>
      </div>
    </div>
  );
}
