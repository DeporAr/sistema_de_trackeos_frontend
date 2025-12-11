/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para evitar prerenderizado estático en páginas que usan autenticación
  // La opción appDir ya no es necesaria en Next.js 15+ pues ya viene habilitada por defecto
  experimental: {
    // Opciones experimentales actualizadas para Next.js 15
  },
  // La configuración de runtime ahora se maneja de otra manera en Next.js 15+
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "incredible-charm-production.up.railway.app",
      },
    ],
  },
};

export default nextConfig;
