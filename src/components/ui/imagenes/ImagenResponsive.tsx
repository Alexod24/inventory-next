"use client";

import Image from "next/image";
import React from "react";

type ImagenProps = {
  src: string; // URL de la imagen personalizada
  alt?: string; // Texto alternativo para la imagen
  className?: string; // Clases adicionales para estilos
  width?: number; // Ancho de la imagen
  height?: number; // Altura de la imagen
};

export default function ImagenResponsive({
  src,
  alt = "Imagen",
  className = "",
  width = 1054,
  height = 600,
}: ImagenProps) {
  return (
    <div className="relative">
      <div className="overflow-hidden">
        <Image
          src={src}
          alt={alt}
          className={`w-full border border-gray-200 rounded-xl dark:border-gray-800 ${className}`}
          width={width}
          height={height}
        />
      </div>
    </div>
  );
}
