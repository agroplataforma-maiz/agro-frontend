'use client'
// src/components/dashboard/AdminShell.tsx
// Shell reutilizable con Sidebar + Topbar para todas las páginas admin/dashboard.
// Maneja el estado colapso, marginLeft y datos de usuario desde el store.

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { ROL_LABELS, ROL_COLOR } from '@/types'
import type { Rol } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { iniciales } from '@/lib/auth'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import StateView from '@/components/ui/StateView'

interface AdminShellProps {
  children: React.ReactNode
  /** Padding interior del área de contenido (default: '32px 24px') */
  contentPadding?: string
}

export default function AdminShell({ children, contentPadding = '32px 40px' }: AdminShellProps) {
  const router = useRouter()
  const { logout } = useAuth()
  const usuario = useAppStore(s => s.usuario)
  const addToast = useAppStore(s => s.addToast)
  const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768
  const [collapsed, setCollapsed] = useState(false)

  // En pantallas pequeñas inicia colapsado
  useEffect(() => {
    if (isMobile()) setCollapsed(true)
    const onResize = () => {
      if (isMobile()) setCollapsed(true)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Mantiene --sidebar-w sincronizado para que Topbar (position:fixed) se reposicione
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-w', collapsed ? '64px' : '260px')
  }, [collapsed])

  if (!usuario) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <StateView
          variant="loading"
          title="Cargando usuario"
          message="Verificando tu sesión en Maíz Nativo..."
        />
      </div>
    )
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
    addToast('Sesión cerrada', 'ok')
    logout()
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
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
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
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
          width: '100%',
          padding: contentPadding,
          boxSizing: 'border-box',
        }} className="admin-main">
          {children}
        </main>
      </div>
    </div>
  )
}
