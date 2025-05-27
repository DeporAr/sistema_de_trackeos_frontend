/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para evitar prerenderizado estático en páginas que usan autenticación
  experimental: {
    // Esto es para Next.js 13+
    appDir: true,
  },
  // Deshabilitar prerenderizado estático para rutas específicas
  // que dependen de la autenticación del cliente
  unstable_runtimeJS: true,
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
