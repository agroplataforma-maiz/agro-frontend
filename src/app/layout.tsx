// src/app/layout.tsx
// Layout raíz — configura fuentes, providers de React Query y Zustand

import type { Metadata } from 'next'
import '@/styles/globals.css'
import Providers from './providers'

export const metadata: Metadata = {
  title: {
    template: '%s · Agroplataforma',
    default: 'Agroplataforma — Maíz Nativo Huasteca Potosina',
  },
  description:
    'Plataforma digital que combina inteligencia geoespacial, saberes comunitarios y ciencia de datos para proteger la biodiversidad del maíz nativo en la Huasteca Potosina.',
  keywords: ['maíz nativo', 'Huasteca Potosina', 'biodiversidad', 'agroplataforma'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,900;1,700&family=Nunito:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" type="image/png" href="/favicon.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
