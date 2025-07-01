// src/components/ThemeBodyApplicator.tsx
"use client"; // Marca este componente como un Client Component

import { useTheme } from "@/context/ThemeContext"; // Importa tu hook de tema
import { useEffect } from "react";

/**
 * Componente que aplica las clases de tema al elemento <body> del DOM.
 * Este componente debe ser un Client Component.
 */
export default function ThemeBodyApplicator() {
  const { theme } = useTheme(); // Usa el hook de tema, que solo funciona en Client Components

  useEffect(() => {
    // Asegurarse de que estamos en el navegador antes de manipular el DOM
    if (typeof window !== "undefined") {
      const body = document.body;

      // Remover clases de tema anteriores para evitar conflictos
      body.classList.remove("bg-gray-900", "bg-white"); // Ajusta estas clases si tienes otras

      // Aplicar la clase de tema actual
      if (theme === "dark") {
        body.classList.add("bg-gray-900");
      } else {
        body.classList.add("bg-white");
      }
    }
  }, [theme]); // Re-ejecutar este efecto cada vez que el tema cambie

  // Este componente no renderiza ningún HTML propio, solo manipula el <body>.
  // Retornar null o un fragmento vacío es común para componentes que solo tienen efectos secundarios.
  return null;
}
