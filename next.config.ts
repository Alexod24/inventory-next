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
        (plugin) => plugin.constructor.name !== "ReactRefreshWebpackPlugin"
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
    domains: [],
  },
};

export default nextConfig;
