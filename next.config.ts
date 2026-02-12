import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
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
