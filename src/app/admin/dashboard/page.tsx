// src/app/admin/dashboard/page.tsx
// Migración de dashboard.html + dashboard.js

'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { GET } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'
import { ROL_LABELS, ROL_COLOR } from '@/types'
import { iniciales } from '@/lib/auth'
import type { Usuario } from '@/types'

import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'
import { QuickAccessCard } from '@/components/dashboard/QuickAccessCard'
import { UserCard } from '@/components/dashboard/UserCard'
import StateView from '@/components/ui/StateView'
import AccessGuardScreen from '@/components/ui/AccessGuardScreen'
import styles from './dashboard.module.css'

// Tarjetas de acceso rápido — igual que en dashboard.js
const ACCESOS = [
  { href: '/productores', icon: '🌽', label: 'Productores',  desc: 'Gestionar registros' },
  { href: '/admin/catalogos',   icon: '📋', label: 'Catálogos',    desc: 'Geo, lenguas, tipos' },
  { href: '/admin/usuarios',    icon: '👥', label: 'Usuarios',     desc: 'Roles y permisos' },
  { href: '/productores',       icon: '🌍', label: 'Vista pública', desc: 'Como la ve el público' },
]

export default function DashboardPage() {
  const router  = useRouter()
  const usuario = useAppStore(s => s.usuario)
  const addToast = useAppStore(s => s.addToast)

  const { data: usuarios, isLoading: loadUsuarios } = useQuery<Usuario[]>({
    queryKey: ['usuarios-recientes'],
    queryFn: () => GET('/auth/usuarios?limit=6'),
  })

  if (!usuario) return <AccessGuardScreen message="Cargando panel admin..." />

  const ini   = iniciales(usuario.nombre_completo || usuario.username)
  const color = ROL_COLOR[usuario.rol] ?? '#888'

  // Handlers para navegación y logout
  const handleNavigate = (page: string) => {
    if (page.startsWith('/')) router.push(page)
    else router.push(`/admin/${page}`)
  }
  const handleLogout = () => {
    // Aquí puedes agregar lógica de cierre de sesión real
    addToast('Sesión cerrada', 'ok')
    router.push('/login')
  }

  // Ejemplo de widgets/secciones condicionales por rol
  const isAdmin = usuario.rol === 'administrador'
  const isInvestigador = usuario.rol === 'investigador'
  const isTecnico = usuario.rol === 'tecnico_campo'
  const isProductor = usuario.rol === 'productor'

  return (
    <div className={styles.page}>
      <Sidebar
        user={{ initials: ini, name: usuario.nombre_completo || usuario.username, role: ROL_LABELS[usuario.rol], color }}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />
      <div style={{ marginLeft: 270 }}>
        <Topbar
          user={{ initials: ini, name: (usuario.nombre_completo || usuario.username).split(' ')[0] }}
          onNavigate={handleNavigate}
        />

        {/* Accesos rápidos comunes */}
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>Acceso rápido</h2>
          <div className={styles.grid}>
            {ACCESOS.map(a => (
              <QuickAccessCard
                key={a.href}
                icon={a.icon}
                label={a.label}
                desc={a.desc}
                onClick={() => router.push(a.href)}
              />
            ))}
          </div>
        </section>

        {/* Widgets/secciones condicionales por rol */}
        {isAdmin && (
          <section className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>Panel de administración</h2>
            {/* Aquí puedes agregar KPIs, gestión de usuarios, etc. */}
          </section>
        )}

        {isInvestigador && (
          <section className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>Panel de investigación</h2>
            {/* Aquí puedes agregar widgets de avance de campo, reportes, etc. */}
          </section>
        )}

        {isTecnico && (
          <section className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>Panel técnico</h2>
            {/* Aquí puedes agregar accesos a reportes de campo, checklist, etc. */}
          </section>
        )}

        {isProductor && (
          <section className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>Panel productor</h2>
            {/* Aquí puedes agregar información relevante para productores */}
          </section>
        )}

        {/* Usuarios recientes solo para admin/investigador */}
        {(isAdmin || isInvestigador) && (
          <section className={styles.seccion}>
            <div className={styles.seccionHeader}>
              <h2 className={styles.seccionTitulo}>Usuarios recientes</h2>
              <button
                className={styles.btnVer}
                onClick={() => router.push('/admin/usuarios')}
              >
                Ver todos →
              </button>
            </div>
            {loadUsuarios ? ( 
              <StateView
                variant="loading"
                size="sm"
                title="Cargando usuarios"
                message="Recuperando actividad reciente del equipo."
              />
            ) : (
              <div className={styles.usuariosGrid}>
                {(usuarios ?? []).map(u => (
                  <UserCard
                    key={u.id}
                    initials={iniciales(u.nombre_completo || u.username)}
                    name={u.nombre_completo || u.username}
                    role={ROL_LABELS[u.rol]}
                    color={ROL_COLOR[u.rol] ?? '#888'}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
