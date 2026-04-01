// src/app/sin-acceso/page.tsx
// Página mostrada cuando un usuario intenta acceder a una ruta
// para la que no tiene permisos según su rol.

'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { ROL_HOME, ROL_LABELS } from '@/types'

export default function SinAccesoPage() {
  const router  = useRouter()
  const usuario = useAppStore(s => s.usuario)

  const destino = usuario ? (ROL_HOME[usuario.rol] ?? '/dashboard') : '/dashboard'
  const rolLabel = usuario ? (ROL_LABELS[usuario.rol] ?? usuario.rol) : ''

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--crema, #FAF7F2)',
      gap: 16,
      padding: '40px 20px',
      textAlign: 'center',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      <div style={{ fontSize: 56 }}>🔒</div>
      <h1 style={{
        fontFamily: 'Fraunces, serif',
        fontSize: '2rem',
        fontWeight: 900,
        color: 'var(--tierra, #5C3D1E)',
        margin: 0,
      }}>
        Sin acceso
      </h1>
      <p style={{ fontSize: '1rem', color: 'var(--cafe, #6B4226)', maxWidth: 420, margin: 0, lineHeight: 1.6 }}>
        Tu rol <strong>{rolLabel}</strong> no tiene permisos para ver esta sección.
        Si crees que es un error, contacta al administrador.
      </p>
      <button
        onClick={() => router.push(destino)}
        style={{
          marginTop: 8,
          padding: '10px 28px',
          background: 'var(--verde, #2A5C3F)',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontFamily: 'DM Mono, monospace',
          fontWeight: 700,
          fontSize: '0.875rem',
          cursor: 'pointer',
          letterSpacing: '.04em',
        }}
      >
        Volver al Dashboard →
      </button>
    </div>
  )
}
