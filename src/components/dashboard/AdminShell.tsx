'use client'
// src/components/dashboard/AdminShell.tsx
// Shell reutilizable con Sidebar + Topbar para todas las páginas admin/dashboard.
// Maneja el estado colapso, marginLeft y datos de usuario desde el store.

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { ROL_LABELS, ROL_COLOR } from '@/types'
import type { Rol } from '@/types'
import { iniciales } from '@/lib/auth'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

interface AdminShellProps {
  children: React.ReactNode
  /** Padding interior del área de contenido (default: '32px 24px') */
  contentPadding?: string
}

export default function AdminShell({ children, contentPadding = '32px 40px' }: AdminShellProps) {
  const router = useRouter()
  const usuario = useAppStore(s => s.usuario)
  const addToast = useAppStore(s => s.addToast)
  const [collapsed, setCollapsed] = useState(false)

  // Mantiene --sidebar-w sincronizado para que Topbar (position:fixed) se reposicione
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-w', collapsed ? '64px' : '260px')
  }, [collapsed])

  if (!usuario) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Cargando usuario…</div>
  }

  const ini = iniciales(usuario.nombre_completo || usuario.username)
  const color = ROL_COLOR[usuario.rol] ?? '#888'

  const userSidebar = {
    initials: ini,
    name: usuario.nombre_completo || usuario.username,
    role: ROL_LABELS[usuario.rol] ?? usuario.rol,
    color,
  }

  const rolActual = usuario.rol as Rol

  const handleNavigate = (page: string) => {
    if (page.startsWith('/')) router.push(page)
    else router.push('/' + page)
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
    }
    addToast('Sesión cerrada', 'ok')
    router.push('/login')
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Sidebar
        user={userSidebar}
        rol={rolActual}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        onCollapseToggle={() => setCollapsed(v => !v)}
        collapsed={collapsed}
      />
      <div
        style={{
          marginLeft: collapsed ? 64 : 260,
          transition: 'margin-left 0.2s',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Topbar
          user={{ initials: ini, name: userSidebar.name.split(' ')[0], color }}
          onNavigate={handleNavigate}
          onSidebarToggle={() => setCollapsed(v => !v)}
          onLogout={handleLogout}
        />
        {/* Espaciador para compensar la Topbar fija (64px = --topbar-h) */}
        <div style={{ height: 64, flexShrink: 0 }} />
        <main style={{
          flex: 1,
          width: '100%',
          padding: '32px 40px',
          boxSizing: 'border-box',
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}
