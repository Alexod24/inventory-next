// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // <--- Esto para saltar eslint en build
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  // === BUSCA ESTAS SECCIONES ===
  async redirects() {
    return [
      // Ejemplo: Si tienes una redirección que afecta a /images/ o /test-image.jpg
      // {
      //   source: '/images/:path*',
      //   destination: '/otra-ruta-de-imagenes/:path*',
      //   permanent: false,
      // },
      // {
      //   source: '/test-image.jpg',
      //   destination: '/otra-ubicacion/test-image.jpg',
      //   permanent: false,
      // },
    ];
  },
  async rewrites() {
    return [
      // Ejemplo: Si tienes una reescritura que afecta a /images/ o /test-image.jpg
      // {
      //   source: '/images/:path*',
      //   destination: '/public/images/:path*', // Esto es un ejemplo, no es común para archivos public
      // },
    ];
  },
  // === FIN DE LAS SECCIONES A BUSCAR ===

  // Si en algún momento quieres volver a usar next/image con dominios externos,
  // necesitarías esta configuración (pero no es la causa del 307 actual)
  images: {
    domains: [], // Si no tienes dominios externos, déjalo vacío o quita esta línea
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: 'example.com', // Reemplaza con el dominio de tu imagen externa
    //     port: '',
    //     pathname: '/**',
    //   },
    // ],
  },
};

export default nextConfig;
