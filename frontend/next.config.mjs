/** @type {import('next').NextConfig} */

/**
 * Configuração do Next.js
 * O frontend consome a API do backend em localhost:3001
 */
const nextConfig = {
  // Redireciona chamadas /api/* para o backend Express, evitando CORS em desenvolvimento
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
