import type { NextConfig } from 'next'

const config: NextConfig = {
  // ── Seguridad: cabeceras HTTP ─────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',  value: 'nosniff' },
          { key: 'X-Frame-Options',          value: 'DENY' },
          { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',       value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },

  // ── Imágenes externas permitidas ──────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'agromaiz.mx',
      },
    ],
  },

  // ── Compilación ──────────────────────────────────────────────────
  // Silencia warnings de paquetes de terceros en producción
  typescript: { ignoreBuildErrors: false },
  eslint:     { ignoreDuringBuilds: false },
}

export default config
