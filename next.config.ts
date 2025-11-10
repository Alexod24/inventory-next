// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // Mantén esto activado si lo necesitas
  devIndicators: false,
  eslint: {
    ignoreDuringBuilds: true, // Ignora ESLint durante el build
  },
  webpack(config, { dev }) {
    // Desactiva React Refresh Overlay si estás en desarrollo
    if (dev) {
      config.plugins = config.plugins.filter(
        // Aquí se añade el tipo 'any' explícitamente al parámetro 'plugin'
        (plugin: any) => plugin.constructor.name !== "ReactRefreshWebpackPlugin"
      );
    }

    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
  async redirects() {
    return [];
  },
  async rewrites() {
    return [];
  },
  images: {
    domains: ["images.unsplash.com", "img.freepik.com"],
  },
};

export default nextConfig;
