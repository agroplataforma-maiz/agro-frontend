// src/app/admin/dashboard/page.tsx
// Dashboard administrativo con diseño alineado a los módulos activos

'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import AdminShell from '@/components/dashboard/AdminShell'
import { UserCard } from '@/components/dashboard/UserCard'
import ModuleHero from '@/components/ui/ModuleHero'
import StateView from '@/components/ui/StateView'
import { GET } from '@/lib/api'
import { iniciales } from '@/lib/auth'
// import { iniciales } from '@/lib/auth'
import { useAppStore } from '@/store/useAppStore'
import { ROL_COLOR, ROL_LABELS } from '@/types'
import type { Comunidad, Productor, Usuario } from '@/types'
import styles from './dashboard.module.css'

type Acceso = {
  href: string
  icon: string
  label: string
  desc: string
  tone: 'verde' | 'maiz' | 'tierra' | 'azul'
}

const ACCESOS_ADMIN: Acceso[] = [
  { href: '/productores', icon: '🧑‍🌾', label: 'Consulta de registros de productores', desc: 'Ver, editar o depurar expedientes existentes', tone: 'verde' },
  { href: '/comunidades', icon: '🏘️', label: 'Consulta de registros de comunidades', desc: 'Revisión territorial, lengua y cobertura', tone: 'maiz' },
  { href: '/sociocultural', icon: '🎭', label: 'Consulta de registros socioculturales', desc: 'Saberes, prácticas y patrimonio ya capturado', tone: 'tierra' },
  { href: '/fenotipo', icon: '🔬', label: 'Consulta de registros fenotípicos', desc: 'Seguimiento técnico y evaluación morfológica', tone: 'azul' },
  { href: '/admin/catalogos', icon: '📋', label: 'Catálogos', desc: 'Listas maestras y configuración territorial', tone: 'maiz' },
  { href: '/admin/usuarios', icon: '👥', label: 'Usuarios del sistema', desc: 'Roles, permisos y control de accesos', tone: 'verde' },
]

const ACCESOS_CAMPO: Acceso[] = [
  { href: '/productores', icon: '🌽', label: 'Productores', desc: 'Captura y actualización de datos en campo', tone: 'verde' },
  { href: '/comunidades', icon: '🏘️', label: 'Comunidades', desc: 'Consulta territorial y contexto local', tone: 'maiz' },
  { href: '/sociocultural', icon: '🎭', label: 'Sociocultural', desc: 'Registro de saberes y prácticas comunitarias', tone: 'tierra' },
  { href: '/fenotipo', icon: '🔬', label: 'Fenotipo', desc: 'Evaluación morfológica y evidencia técnica', tone: 'azul' },
]

// const ACCESOS_BASE: Acceso[] = [
//   { href: '/mi-perfil', icon: '👤', label: 'Mi perfil', desc: 'Consulta de datos y ajustes de cuenta', tone: 'verde' },
//   { href: '/productores', icon: '🌍', label: 'Vista pública', desc: 'Explora la información visible en plataforma', tone: 'maiz' },
// ]

// function toArray<T>(data: unknown): T[] {
//   if (Array.isArray(data)) return data as T[]
//   const parsed = data as { items?: T[]; results?: T[] }
//   return parsed.items ?? parsed.results ?? []
// }


export default function DashboardPage() {

  const loadUsuarios = false;
  const router = useRouter();
  const usuario = useAppStore(s => s.usuario);
  const rol = usuario?.rol;
  const isAdmin = rol === 'administrador';
  const isInvestigador = rol === 'investigador';
  const accesos = isAdmin ? ACCESOS_ADMIN : ACCESOS_CAMPO;

  // Obtener usuarios desde el backend
  const { data: usuarios = [] } = useQuery<Usuario[]>({
    queryKey: ['usuarios'],
    queryFn: () => GET('/auth/usuarios'),
    select: (d: unknown) => {
      if (Array.isArray(d)) return d as Usuario[];
      if (d && typeof d === 'object' && 'items' in d) return (d as { items: Usuario[] }).items;
      if (d && typeof d === 'object' && 'results' in d) return (d as { results: Usuario[] }).results;
      return [];
    },
  });
  // Obtener comunidades desde el backend
  const { data: comunidades = [] } = useQuery<Comunidad[]>({
    queryKey: ['comunidades'],
    queryFn: () => GET('/core/comunidad'),
    select: (d: unknown) => {
      if (Array.isArray(d)) return d as Comunidad[];
      if (d && typeof d === 'object' && 'items' in d) return (d as { items: Comunidad[] }).items;
      if (d && typeof d === 'object' && 'results' in d) return (d as { results: Comunidad[] }).results;
      return [];
    },
  });
  // Obtener productores desde el backend
  const { data: productores = [] } = useQuery<Productor[]>({
    queryKey: ['productores'],
    queryFn: () => GET('/core/productor'),
    select: (d: unknown) => {
      if (Array.isArray(d)) return d as Productor[];
      if (d && typeof d === 'object' && 'items' in d) return (d as { items: Productor[] }).items;
      if (d && typeof d === 'object' && 'results' in d) return (d as { results: Productor[] }).results;
      return [];
    },
  });

  // Redirigir si no es admin
  useEffect(() => {
    if (usuario && !isAdmin) {
      router.replace('/sin-acceso');
    }
    if (!usuario) {
      router.replace('/login');
    }
  }, [usuario, isAdmin, router]);

  if (!usuario) return null;
  if (usuario && !isAdmin) return null;

  const usuariosRecientes = usuarios.slice(0, 6)
  const municipiosCubiertos = new Set(comunidades.map(c => c.municipio_nombre).filter(Boolean)).size
  const totalProductores = productores?.length ?? 0
  const resumenRol = isAdmin
    ? {
        eyebrow: 'Administración · Centro de control',
        title: <>Centro de <em>consulta</em> ⚙️</>,
        description: 'Supervisa usuarios, catálogos y módulos operativos desde un tablero enfocado en la consulta de registros y la gestión administrativa.',
        primaryAction: { label: 'Administrar usuarios', href: '/admin/usuarios' },
        checks: [
          'Consulta registros de productores, comunidades, sociocultural y fenotipo desde Gestión.',
          'Controla roles y permisos del equipo desde el módulo de usuarios.',
          'Mantén actualizados catálogos y realiza revisión o depuración sin generar altas nuevas.',
        ],
      }
    : {
        eyebrow: 'Operación · Trabajo de campo',
        title: <>Centro de <em>trabajo</em> 🌽</>,
        description: 'Accede a los módulos activos y da seguimiento a la captura de información territorial, cultural y fenotípica.',
        primaryAction: { label: 'Abrir módulo principal', href: accesos[0]?.href ?? '/dashboard' },
        checks: [
          'Consulta únicamente los módulos activos para investigación y captura.',
          'Da seguimiento a productores, comunidades y registros de campo.',
          'Mantén trazabilidad del levantamiento y revisión de datos.',
        ],
      }

  return (
    <AdminShell contentPadding="0">
      <div className={styles.page}>
        <ModuleHero
          eyebrow={resumenRol.eyebrow}
          title={resumenRol.title}
          description={resumenRol.description}
          stats={[
            { label: 'módulos', value: accesos.length },
            { label: 'productores', value: totalProductores || '—' },
            { label: 'comunidades', value: comunidades.length || '—' },
          ]}
          actions={
            <button
              type="button"
              className={styles.primaryAction}
              onClick={() => router.push(resumenRol.primaryAction.href)}
            >
              {resumenRol.primaryAction.label}
            </button>
          }
        />

        <header className={styles.header}>
          <div>
            <h1 className={styles.titulo}>{isAdmin ? 'Consulta y gestión del sistema' : 'Módulos habilitados'}</h1>
            <p className={styles.subtitulo}>
              Sesión activa como {ROL_LABELS[usuario.rol]} · navega con la misma experiencia visual del resto de módulos.
            </p>
          </div>
          <div className={styles.headerActions}>
            <button type="button" className={styles.ghostAction} onClick={() => router.push('/mi-perfil')}>
              Ver mi perfil
            </button>
            <button
              type="button"
              className={styles.primaryAction}
              onClick={() => router.push(isAdmin ? '/admin/catalogos' : accesos[0]?.href ?? '/dashboard')}
            >
              {isAdmin ? 'Abrir catálogos' : 'Ir al trabajo'}
            </button>
          </div>
        </header>

        <div className={styles.kpiBand}>
          <div className={styles.kpiItem}>
            <span className={styles.kpiNum}>{totalProductores || '—'}</span>
            <span className={styles.kpiLbl}>Productores registrados</span>
          </div>
          <div className={styles.kpiItem}>
            <span className={styles.kpiNum}>{comunidades.length || '—'}</span>
            <span className={styles.kpiLbl}>Comunidades activas</span>
          </div>
          <div className={styles.kpiItem}>
            <span className={styles.kpiNum}>{municipiosCubiertos || '—'}</span>
            <span className={styles.kpiLbl}>Municipios cubiertos</span>
          </div>
          <div className={styles.kpiItem}>
            <span className={styles.kpiNum}>{isAdmin || isInvestigador ? (usuarios.length || '—') : accesos.length}</span>
            <span className={styles.kpiLbl}>{isAdmin || isInvestigador ? 'Usuarios del sistema' : 'Módulos disponibles'}</span>
          </div>
        </div>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>{isAdmin ? 'Áreas de consulta activas' : 'Áreas de trabajo activas'}</h2>
              <p className={styles.sectionText}>
                {isAdmin
                  ? 'Consulta los registros clave de la plataforma con accesos directos a revisión, edición, depuración y configuración del sistema.'
                  : 'Accede rápidamente a los módulos habilitados para levantamiento, revisión y consulta de información.'}
              </p>
            </div>
          </div>

          <div className={styles.cardsGrid}>
            {accesos.map(acceso => {
              const isBeta = ['fenotipo', 'sociocultural'].some(key => acceso.href.includes(key));
              return (
                <button
                  key={acceso.href}
                  type="button"
                  className={styles.actionCard}
                  data-tone={acceso.tone}
                  onClick={() => router.push(acceso.href)}
                >
                  <div className={styles.actionCardTop}>
                    <span className={styles.actionIcon} aria-hidden="true">{acceso.icon}</span>
                    <span className={styles.actionPill}>{isAdmin ? 'Consulta' : 'Activo'}</span>
                    {isBeta && (
                      <span
                        style={{
                          marginLeft: 8,
                          background: 'var(--maiz-pal)',
                          color: 'var(--maiz)',
                          border: '1px solid rgba(200,130,10,.2)',
                          fontFamily: 'DM Mono, monospace',
                          fontSize: 10,
                          padding: '3px 10px',
                          borderRadius: 100,
                          letterSpacing: '.06em',
                          fontWeight: 700,
                          display: 'inline-block',
                          verticalAlign: 'middle',
                        }}
                        aria-label="Módulo en beta"
                      >
                        Beta
                      </span>
                    )}
                  </div>
                  <div className={styles.actionTitle}>{acceso.label}</div>
                  <p className={styles.actionDesc}>{acceso.desc}</p>
                  <div className={styles.actionFooter}>
                    <span>{isAdmin ? 'Abrir consulta' : 'Continuar'}</span>
                    <span aria-hidden="true">→</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <div className={styles.overviewGrid}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Resumen de tu alcance</h2>
            </div>
            <p className={styles.panelText}>
              Este tablero prioriza lo que puedes gestionar según tu rol actual y mantiene la navegación consistente con módulos como `Comunidades` y `Fenotipo`.
            </p>
            <div className={styles.checkList}>
              {resumenRol.checks.map(item => (
                <div key={item} className={styles.checkItem}>
                  <span aria-hidden="true">✅</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>{isAdmin || isInvestigador ? 'Usuarios recientes' : 'Siguiente paso sugerido'}</h2>
            </div>

            {isAdmin || isInvestigador ? (
              loadUsuarios ? (
                <StateView
                  variant="loading"
                  size="sm"
                  title="Cargando usuarios"
                  message="Recuperando actividad reciente del equipo."
                />
              ) : usuariosRecientes.length > 0 ? (
                <div className={styles.usersGrid}>
                  {usuariosRecientes.map(u => (
                    <UserCard
                      key={u.id}
                      initials={iniciales(u.nombre_completo || u.username)}
                      name={u.nombre_completo || u.username}
                      role={ROL_LABELS[u.rol]}
                      color={ROL_COLOR[u.rol] ?? '#888'}
                    />
                  ))}
                </div>
              ) : (
                <p className={styles.emptyUsers}>Aún no hay usuarios para mostrar en este resumen.</p>
              )
            ) : (
              <div className={styles.checkList}>
                <div className={styles.checkItem}><span aria-hidden="true">🌾</span><span>Inicia por el módulo con mayor prioridad de captura.</span></div>
                <div className={styles.checkItem}><span aria-hidden="true">🗂️</span><span>Verifica consistencia entre productor, comunidad y contexto sociocultural.</span></div>
                <div className={styles.checkItem}><span aria-hidden="true">🔎</span><span>Usa tu perfil para revisar estado de sesión y permisos asignados.</span></div>
              </div>
            )}
          </section>
        </div>
      </div>
    </AdminShell>
  )
}
