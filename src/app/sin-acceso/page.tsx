// src/app/sin-acceso/page.tsx
// Página mostrada cuando un usuario intenta acceder a una ruta
// para la que no tiene permisos según su rol.

'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { ROL_HOME, ROL_LABELS } from '@/types'
import AdminShell from '@/components/dashboard/AdminShell'

export default function SinAccesoPage() {
  const router  = useRouter()
  const usuario = useAppStore(s => s.usuario)
  const destino = usuario ? (ROL_HOME[usuario.rol] ?? '/dashboard') : '/dashboard'
  const rolLabel = usuario ? (ROL_LABELS[usuario.rol] ?? usuario.rol) : ''

  return (
    <AdminShell contentPadding="0" breadcrumb="Sin acceso">
      <div
        style={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--crema)',
          gap: 16,
          padding: '40px 20px',
          textAlign: 'center',
          fontFamily: 'DM Sans, sans-serif',
          transition: 'background 0.2s',
        }}
      >
        <div style={{ fontSize: 56 }}>🔒</div>
        <h1
          style={{
            fontFamily: 'Fraunces, serif',
            fontSize: '2rem',
            fontWeight: 900,
            color: 'var(--tierra)',
            margin: 0,
            transition: 'color 0.2s',
          }}
        >
          Sin acceso
        </h1>
        <p
          style={{
            fontSize: '1rem',
            color: 'var(--cafe)',
            maxWidth: 420,
            margin: 0,
            lineHeight: 1.6,
            transition: 'color 0.2s',
          }}
        >
          Tu rol <strong>{rolLabel}</strong> no tiene permisos para ver esta sección.
          Si crees que es un error, contacta al administrador.
        </p>
        <button
          onClick={() => router.push(destino)}
          style={{
            marginTop: 8,
            padding: '10px 28px',
            background: 'var(--verde)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontFamily: 'DM Mono, monospace',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            letterSpacing: '.04em',
            transition: 'background 0.2s',
          }}
        >
          Ir al inicio
        </button>
      </div>
    </AdminShell>
  )
}
