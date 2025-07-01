"use client"; // Marca este componente como un Client Component

import AlternadorTemas from "@/components/common/AlternadorTemas";
import { ThemeProvider } from "@/context/ThemeContext";
import Link from "next/link";
import React from "react";
import Image from "next/image"; // Asegúrate de que este import esté aquí para el logo, si lo usas

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Log para confirmar que AuthLayout se está renderizando (lado del cliente)
  console.log("AuthLayout se está renderizando (lado del cliente).");

  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col dark:bg-gray-900 sm:p-0">
          {/* Lado Izquierdo: Formulario de Login - Centrado */}
          {/* Este div contiene el formulario de inicio de sesión y lo centra */}
          <div className="flex flex-1 lg:w-1/2 w-full flex-col items-center justify-center">
            {children}
          </div>

          {/* Lado Derecho: Fondo de Imagen */}
          {/* Este div actúa como el contenedor para la imagen de fondo */}
          <div className="hidden lg:flex lg:w-1/2 w-full h-full relative items-center justify-center overflow-hidden">
            {/* Usamos una etiqueta <img> HTML estándar para el fondo */}
            {/* Esto bypassa el optimizador de imágenes de Next.js para esta imagen */}
            <img
              src="/images/espacios/login.png"
              alt="Imagen de fondo para autenticación"
              style={{
                position: "absolute",
                height: "100%",
                width: "100%",
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                objectFit: "cover",
                opacity: 10, // Asegura que la imagen sea completamente visible
                zIndex: 0, // Asegura que esté en la capa de fondo
              }}
              // No hay 'quality' ni 'sizes' para una etiqueta <img> estándar
              // No hay 'onError' para este tipo de depuración, pero puedes añadirlo si necesitas logs específicos
            />

            {/* Mensaje de fallback eliminado, ya que el <img> estándar no tiene onError directo */}
            {/* Si la imagen no se muestra, el problema será la ruta o el archivo */}

            {/* Overlay semi-transparente para mejorar la legibilidad del texto */}
            {/* Se ha restaurado la opacidad a 'opacity-40' */}
            <div className="absolute inset-0 bg-black opacity-40 z-10"></div>

            {/* Contenido (Logo y texto) encima de la imagen y el overlay */}
            {/* 'z-20' asegura que este contenido esté en la capa más alta */}
            <div className="relative z-20 flex flex-col items-center max-w-xs text-white">
              <Link href="/" className="block mb-4">
                <Image
                  width={231}
                  height={48}
                  src="/images/logo/labase.png" // Ajusta esta ruta si es necesario para tu logo
                  alt="Logo de tu Empresa"
                />
              </Link>
              <p className="text-center text-white/80 text-lg">
                Bienvenido al sistema de invetnario de Bienes de La Base Cowork.
              </p>
            </div>
          </div>

          {/* Alternador de Temas */}
          {/* Se mantiene en su posición fija en la esquina inferior derecha */}
          <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <AlternadorTemas />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
