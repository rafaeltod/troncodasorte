import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3000',
      },
    ],
  },
  async headers() {
    return [
      {
        // Desabilitar cache na página de detalhes do lote
        source: '/lotes/:id',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ]
  },
  async rewrites() {
    return {
      fallback: [
        // Redireciona /uploads/* para /api/uploads/*
        {
          source: '/uploads/:filename',
          destination: '/api/uploads/:filename',
        },
      ],
    }
  },
};

export default nextConfig;
