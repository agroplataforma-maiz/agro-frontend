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

interface AdminShellProps {
  children: React.ReactNode
  /** Padding interior del área de contenido (default: '32px 24px') */
  contentPadding?: string
  defaultSidebarCollapsed?: boolean
  breadcrumb?: string
  forceShowShell?: boolean // Evita redirect si true
}

export default function AdminShell({ children, contentPadding = '32px 40px', defaultSidebarCollapsed = false, breadcrumb, forceShowShell = false }: AdminShellProps) {
  const router = useRouter()
  const { logout } = useAuth()
  const usuario = useAppStore(s => s.usuario)
  const addToast = useAppStore(s => s.addToast)
  const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768
  const [collapsed, setCollapsed] = useState(defaultSidebarCollapsed)

  // En pantallas pequeñas inicia colapsado
  useEffect(() => {
    if (isMobile()) setCollapsed(true)
    const onResize = () => {
      if (isMobile()) setCollapsed(true)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [defaultSidebarCollapsed])

  // Mantiene --sidebar-w sincronizado para que Topbar (position:fixed) se reposicione
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-w', collapsed ? '64px' : '260px')
  }, [collapsed])

  // Si no hay usuario, redirige a inicio (evita pantalla de carga infinita tras logout),
  // EXCEPTO en la página not-found para permitir mostrar el 404 con shell

  let userSidebar, rolActual;
  if (!usuario) {
    if (!forceShowShell) {
      if (typeof window !== 'undefined') {
        router.replace('/')
      }
      return null
    }
    // Shell genérica para not-found o uso forzado
    userSidebar = {
      initials: '?',
      name: 'Desconocido',
      role: 'Desconocido',
      color: '#888',
    };
    rolActual = 'visualizador';
  } else {
    const ini = iniciales(usuario.nombre_completo || usuario.username)
    const color = ROL_COLOR[usuario.rol] ?? '#888'
    userSidebar = {
      initials: ini,
      name: usuario.nombre_completo || usuario.username,
      role: ROL_LABELS[usuario.rol] ?? usuario.rol,
      color,
    }
    rolActual = usuario.rol as Rol
  }

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
          user={{ initials: userSidebar.initials, name: userSidebar.name.split(' ')[0], color: userSidebar.color }}
          breadcrumb={breadcrumb}
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
