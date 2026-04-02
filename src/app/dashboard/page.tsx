// src/app/dashboard/page.tsx
'use client'
import { useAppStore } from '@/store/useAppStore'
import styles from './dashboard.module.css'
import { useRouter } from 'next/navigation'
import React from 'react';
import AdminShell from '@/components/dashboard/AdminShell';
import { useQuery } from '@tanstack/react-query'
import { GET } from '@/lib/api'
import AccessGuardScreen from '@/components/ui/AccessGuardScreen'
import type { Productor, Usuario } from '@/types'


export default function DashboardPage() {
  const router = useRouter();
  const usuario = useAppStore(s => s.usuario);

  const handleNavigate = (page: string) => {
    if (page.startsWith('/')) router.push(page)
    else router.push(`/${page}`)
  }

  // Queries para KPIs
  const { data: productores = [] } = useQuery<Productor[]>({
    queryKey: ['productores-count'],
    queryFn:  () => GET('/social/productor/') as Promise<Productor[]>,
    select:   (d: unknown) => {
      const data = d as Productor[] | { items?: Productor[]; results?: Productor[] }
      return Array.isArray(data) ? data : (data.items ?? data.results ?? [])
    },
  })
  const { data: usuarios = [] } = useQuery<Usuario[]>({
    queryKey: ['usuarios-count'],
    queryFn:  () => GET('/auth/usuarios') as Promise<Usuario[]>,
    select:   (d: unknown) => {
      const data = d as Usuario[] | { items?: Usuario[]; results?: Usuario[] }
      return Array.isArray(data) ? data : (data.items ?? data.results ?? [])
    },
  })

  // Días transcurridos desde inicio del proyecto
  const diasProyecto = Math.floor((Date.now() - new Date('2025-12-09').getTime()) / 86400000)

  if (!usuario) return <AccessGuardScreen message="Cargando dashboard..." />

  // Nombre para saludo
  const NOMBRE_ROL: Record<string, string> = {
    administrador:  'administrador/a',
    investigador:   'investigador/a',
    tecnico_campo:  'técnico/a de campo',
    visualizador:   'visualizador/a',
    productor:      'productor/a',
    invitado:       'invitado/a',
  }
  const nombreRol = NOMBRE_ROL[usuario.rol] ?? usuario.rol

  // Permisos de navegación según rol
  const puedeCapturar     = ['administrador', 'investigador', 'tecnico_campo'].includes(usuario.rol)
  const puedeVerCatalogos = ['administrador', 'investigador'].includes(usuario.rol)
  const puedeVerUsuarios  = usuario.rol === 'administrador'
  const esInvitado        = usuario.rol === 'invitado'
  const esVisualizador    = usuario.rol === 'visualizador'

  return (
    <AdminShell>
        {/* Contenido principal */}
        <main id="contenido-principal" tabIndex={-1}>
          {/* Hero bienvenida */}
          <div className={styles['dash-hero']} role="region" aria-label="Bienvenida">
            <div className={styles['dash-hero-txt']}>
              <div className={styles['dash-hero-saludo']}>Panel de trabajo · Etapa 1 en curso</div>
              <h1 className={styles['dash-hero-nombre']}>Bienvenido/a, <em>{nombreRol}</em> 🌽</h1>
              <p className={styles['dash-hero-desc']}>Desde aquí puedes acceder a todos los módulos de la plataforma, registrar productores, consultar catálogos y monitorear el avance del proyecto.</p>
            </div>
            <div className={styles['dash-hero-right']}>
              <div className={styles['dash-etapa-pill']} role="status" aria-label="Etapa 1 activa">
                <span className={styles['etapa-pulse']} aria-hidden="true"></span>
                Etapa 1 · En curso
              </div>
              {!esVisualizador && (
              <div className={styles['dash-prog-wrap']} aria-label="Progreso de la etapa 1">
                <div className={styles['dash-prog-label']}>Progreso Etapa 1</div>
                <div className={styles['dash-prog-track']} role="progressbar" aria-valuenow={38} aria-valuemin={0} aria-valuemax={100} aria-label="38% completado">
                  <div className={styles['dash-prog-fill']} style={{ width: '38%' }}></div>
                </div>
                <div className={styles['dash-prog-pct']}>38%</div>
              </div>
              )}
            </div>
          </div>
          {/* Banner bienvenida invitado */}
          {esInvitado && (
            <div style={{
              background: 'linear-gradient(135deg, var(--verde-pal) 0%, var(--crema) 100%)',
              border: '1.5px solid var(--verde)',
              borderRadius: 16,
              padding: '28px 32px',
              marginBottom: 28,
              display: 'flex',
              gap: 24,
              alignItems: 'flex-start',
              flexWrap: 'wrap',
            }}>
              <div style={{ fontSize: 44, lineHeight: 1 }}>👁️</div>
              <div style={{ flex: 1, minWidth: 240 }}>
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, fontWeight: 700, color: 'var(--verde)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 6px' }}>
                  Acceso de demostración
                </p>
                <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.35rem', color: 'var(--tierra)', margin: '0 0 10px', fontWeight: 700 }}>
                  Bienvenido/a a AgroPlataforma Maíz 🌽
                </h2>
                <p style={{ fontSize: 13.5, color: 'var(--cafe)', lineHeight: 1.65, margin: '0 0 16px' }}>
                  Esta plataforma documenta la diversidad del maíz nativo en la Huasteca Veracruzana. Registra productores,
                  variedades criollas, saberes tradicionales, datos culturales y evaluaciones fenotípicas de 30+ variedades.
                  En este modo de invitado puedes explorar la estructura del proyecto y sus estadísticas generales.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {[
                    { ico: '🌍', txt: 'Huasteca Veracruzana' },
                    { ico: '🧑‍🌾', txt: 'Productores & comunidades' },
                    { ico: '🔬', txt: 'Análisis fenotípico' },
                    { ico: '📖', txt: 'Saberes tradicionales' },
                    { ico: '📋', txt: '15+ catálogos territoriales' },
                  ].map(({ ico, txt }) => (
                    <span key={txt} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      background: 'rgba(255,255,255,0.7)', border: '1px solid var(--borde-dark)',
                      borderRadius: 99, padding: '5px 12px', fontSize: 12,
                      fontWeight: 600, color: 'var(--tierra)',
                    }}>
                      {ico} {txt}
                    </span>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: 'var(--gris)', marginTop: 14, fontFamily: 'DM Mono, monospace' }}>
                  ¿Quieres acceso completo?{' '}
                  <a href="mailto:contacto@agroplataforma.mx" style={{ color: 'var(--verde)', fontWeight: 700, textDecoration: 'none' }}>
                    Contacta al equipo →
                  </a>
                </p>
              </div>
            </div>
          )}
          {/* KPI Stats */}
          <div className={styles['kpi-grid']} role="region" aria-label="Estadísticas generales">
            <div className={`${styles['kpi-card']} ${styles['verde']}`} tabIndex={0} aria-label="Productores registrados">
              <div className={styles['kpi-n']}>{productores.length > 0 ? productores.length : '—'}</div>
              <div className={styles['kpi-label']}>Productores<br/>registrados</div>
              <div className={`${styles['kpi-trend']} ${styles['trend-up']}`} aria-label="En aumento">↑ Creciendo</div>
            </div>
            <div className={`${styles['kpi-card']} ${styles['maiz']}`} tabIndex={0} aria-label="Comunidades visitadas">
              <div className={styles['kpi-n']}>5</div>
              <div className={styles['kpi-label']}>Comunidades<br/>visitadas</div>
              <div className={`${styles['kpi-trend']} ${styles['trend-up']}`} aria-label="De 15 planificadas">de 15 plan.</div>
            </div>
            <div className={`${styles['kpi-card']} ${styles['tierra']}`} tabIndex={0} aria-label="Saberes tradicionales documentados">
              <div className={styles['kpi-n']}>22</div>
              <div className={styles['kpi-label']}>Variedades<br/>nativas</div>
              <div className={`${styles['kpi-trend']} ${styles['trend-up']}`} aria-label="En relevamiento">↑ Relevando</div>
            </div>
            <div className={`${styles['kpi-card']} ${styles['azul']}`} tabIndex={0} aria-label="Variedades de maíz registradas">
              <div className={styles['kpi-n']}>3</div>
              <div className={styles['kpi-label']}>Etnias<br/>documentadas</div>
              <div className={`${styles['kpi-trend']} ${styles['trend-eq']}`}>Náhuatl · Tének · Otomí</div>
            </div>
            <div className={`${styles['kpi-card']} ${styles['verde']}`} tabIndex={0} aria-label="Usuarios activos en el sistema">
              <div className={styles['kpi-n']}>{usuarios.length > 0 ? usuarios.length : '—'}</div>
              <div className={styles['kpi-label']}>Usuarios<br/>activos</div>
              <div className={`${styles['kpi-trend']} ${styles['trend-eq']}`}>en plataforma</div>
            </div>
            <div className={`${styles['kpi-card']} ${styles['maiz']}`} tabIndex={0} aria-label="Días del proyecto">
              <div className={styles['kpi-n']}>{diasProyecto}</div>
              <div className={styles['kpi-label']}>Días del<br/>proyecto</div>
              <div className={`${styles['kpi-trend']} ${styles['trend-up']}`} aria-label="De 150 días en etapa 1">de 150 E1</div>
            </div>
          </div>
          {/* Módulos */}
          <div role="region" aria-labelledby="titulo-modulos">
            <h2 className={styles['seccion-titulo']} id="titulo-modulos">📦 Módulos disponibles</h2>
            <p className={styles['seccion-sub']}>Accede a los módulos activos o conoce los que están en construcción</p>
            <div className={styles['modulos-grid']} role="list">
              {puedeCapturar ? (
              <button className={styles['modulo-card']} role="listitem" onClick={() => handleNavigate('productores')} aria-label="Módulo Productores - Activo">
                <span className={styles['mod-badge-nuevo']} aria-label="Módulo nuevo">Nuevo</span>
                <div className={`${styles['mod-ico-wrap']} ${styles['mod-ico-verde']}`} aria-hidden="true">🧑‍🌾</div>
                <div className={styles['mod-nombre']}>Productores</div>
                <p className={styles['mod-desc']}>Registro y perfil completo: datos personales, socioeconómicos, cultural, seguridad alimentaria y consentimiento.</p>
                <div className={styles['mod-footer']}>
                  <span className={styles['mod-estado-activo']}>● Activo</span>
                  <span className={styles['mod-arrow']} aria-hidden="true">→</span>
                </div>
              </button>
              ) : (
              <div className={`${styles['modulo-card']} ${styles['disabled']}`} role="listitem" aria-label="Módulo Productores - Sin acceso">
                <div className={`${styles['mod-ico-wrap']} ${styles['mod-ico-gris']}`} aria-hidden="true">🧑‍🌾</div>
                <div className={styles['mod-nombre']}>Productores</div>
                <p className={styles['mod-desc']}>Registro y perfil completo: datos personales, socioeconómicos, cultural, seguridad alimentaria y consentimiento.</p>
                <div className={styles['mod-footer']}>
                  <span className={styles['mod-estado-pronto']}>🔒 Sin acceso</span>
                </div>
              </div>
              )}
              {puedeCapturar ? (
              <button className={styles['modulo-card']} role="listitem" onClick={() => handleNavigate('comunidades')} aria-label="Módulo Comunidades - Activo">
                <span className={styles['mod-badge-nuevo']} aria-label="Módulo nuevo">Nuevo</span>
                <div className={`${styles['mod-ico-wrap']} ${styles['mod-ico-maiz']}`} aria-hidden="true">🏘️</div>
                <div className={styles['mod-nombre']}>Comunidades</div>
                <p className={styles['mod-desc']}>Gestión de las 15+ comunidades de la Huasteca: lengua indígena, población, municipio y productores asociados.</p>
                <div className={styles['mod-footer']}>
                  <span className={styles['mod-estado-activo']}>● Activo</span>
                  <span className={styles['mod-arrow']} aria-hidden="true">→</span>
                </div>
              </button>
              ) : (
              <div className={`${styles['modulo-card']} ${styles['disabled']}`} role="listitem" aria-label="Módulo Comunidades - Sin acceso">
                <div className={`${styles['mod-ico-wrap']} ${styles['mod-ico-gris']}`} aria-hidden="true">🏘️</div>
                <div className={styles['mod-nombre']}>Comunidades</div>
                <p className={styles['mod-desc']}>Gestión de las 15+ comunidades de la Huasteca: lengua indígena, población, municipio y productores asociados.</p>
                <div className={styles['mod-footer']}>
                  <span className={styles['mod-estado-pronto']}>🔒 Sin acceso</span>
                </div>
              </div>
              )}
              {puedeCapturar ? (
              <button className={styles['modulo-card']} role="listitem" onClick={() => handleNavigate('sociocultural')} aria-label="Módulo Social y Cultural - Activo">
                <span className={styles['mod-badge-beta']} aria-label="Versión beta">Beta</span>
                <div className={`${styles['mod-ico-wrap']} ${styles['mod-ico-tierra']}`} aria-hidden="true">🎭</div>
                <div className={styles['mod-nombre']}>Social y Cultural</div>
                <p className={styles['mod-desc']}>Saberes, rituales, narrativas orales, gastronomía, identidad cultural, transmisión del conocimiento y ELCSA.</p>
                <div className={styles['mod-footer']}>
                  <span className={styles['mod-estado-activo']}>● Activo</span>
                  <span className={styles['mod-arrow']} aria-hidden="true">→</span>
                </div>
              </button>
              ) : (
              <div className={`${styles['modulo-card']} ${styles['disabled']}`} role="listitem" aria-label="Módulo Social y Cultural - Sin acceso">
                <div className={`${styles['mod-ico-wrap']} ${styles['mod-ico-gris']}`} aria-hidden="true">🎭</div>
                <div className={styles['mod-nombre']}>Social y Cultural</div>
                <p className={styles['mod-desc']}>Saberes, rituales, narrativas orales, gastronomía, identidad cultural, transmisión del conocimiento y ELCSA.</p>
                <div className={styles['mod-footer']}>
                  <span className={styles['mod-estado-pronto']}>🔒 Sin acceso</span>
                </div>
              </div>
              )}

              {puedeCapturar ? (
              <button className={styles['modulo-card']} role="listitem" onClick={() => handleNavigate('fenotipo')} aria-label="Módulo Fenotípico - Activo">
                <span className={styles['mod-badge-beta']} aria-label="Versión beta">Beta</span>
                <div className={`${styles['mod-ico-wrap']} ${styles['mod-ico-verde']}`} aria-hidden="true">🔬</div>
                <div className={styles['mod-nombre']}>Fenotípico</div>
                <p className={styles['mod-desc']}>Evaluaciones morfológicas, análisis nutrimentales de 30+ variedades y evidencia fotográfica de mazorca y grano.</p>
                <div className={styles['mod-footer']}>
                  <span className={styles['mod-estado-activo']}>● Activo</span>
                  <span className={styles['mod-arrow']} aria-hidden="true">→</span>
                </div>
              </button>
              ) : (
              <div className={`${styles['modulo-card']} ${styles['disabled']}`} role="listitem" aria-label="Módulo Fenotípico - Sin acceso">
                <div className={`${styles['mod-ico-wrap']} ${styles['mod-ico-gris']}`} aria-hidden="true">🔬</div>
                <div className={styles['mod-nombre']}>Fenotípico</div>
                <p className={styles['mod-desc']}>Evaluaciones morfológicas, análisis nutrimentales de 30+ variedades y evidencia fotográfica de mazorca y grano.</p>
                <div className={styles['mod-footer']}>
                  <span className={styles['mod-estado-pronto']}>🔒 Sin acceso</span>
                </div>
              </div>
              )}

              <div className={`${styles['modulo-card']} ${styles['disabled']}`} role="listitem" aria-label="Módulo Mapas y SIG - Próximamente">
                <span className={styles['mod-badge-pronto']} aria-label="Próximamente">Próximamente</span>
                <div className={`${styles['mod-ico-wrap']} ${styles['mod-ico-gris']}`} aria-hidden="true">🗺️</div>
                <div className={styles['mod-nombre']}>Mapas y SIG</div>
                <p className={styles['mod-desc']}>Visualización geoespacial de parcelas, hotspots de diversidad genética y zonas prioritarias de conservación.</p>
                <div className={styles['mod-footer']}>
                  <span className={styles['mod-estado-pronto']}>○ Próximamente</span>
                </div>
              </div>
              
              <div className={`${styles['modulo-card']} ${styles['disabled']}`} role="listitem" aria-label="Módulo Agronómico - Próximamente">
                <span className={styles['mod-badge-pronto']} aria-label="Próximamente">Próximamente</span>
                <div className={`${styles['mod-ico-wrap']} ${styles['mod-ico-gris']}`} aria-hidden="true">🌱</div>
                <div className={styles['mod-nombre']}>Agronómico</div>
                <p className={styles['mod-desc']}>Germoplasma nativo, ciclos agrícolas, sistemas de semilla y economía del cultivo de maíz nativo.</p>
                <div className={styles['mod-footer']}>
                  <span className={styles['mod-estado-pronto']}>○ Próximamente</span>
                </div>
              </div>
              <div className={`${styles['modulo-card']} ${styles['disabled']}`} role="listitem" aria-label="Módulo Ambiental - Próximamente">
                <span className={styles['mod-badge-pronto']} aria-label="Próximamente">Próximamente</span>
                <div className={`${styles['mod-ico-wrap']} ${styles['mod-ico-azul']}`} aria-hidden="true">☁️</div>
                <div className={styles['mod-nombre']}>Ambiental</div>
                <p className={styles['mod-desc']}>Mediciones meteorológicas, índices NDVI/NDWI/EVI, condiciones edáficas y amenazas ambientales activas.</p>
                <div className={styles['mod-footer']}>
                  <span className={styles['mod-estado-pronto']}>○ Próximamente</span>
                </div>
              </div>
              {puedeVerCatalogos ? (
              <button className={styles['modulo-card']} role="listitem" onClick={() => handleNavigate('admin/catalogos')} aria-label="Módulo Catálogos - Activo">
                <div className={`${styles['mod-ico-wrap']} ${styles['mod-ico-maiz']}`} aria-hidden="true">📋</div>
                <div className={styles['mod-nombre']}>Gestión de catálogos</div>
                <p className={styles['mod-desc']}>Razas de maíz, municipios, comunidades, localidades, lenguas, pueblos originarios y más de 15 catálogos con CRUD.</p>
                <div className={styles['mod-footer']}>
                  <span className={styles['mod-estado-activo']}>● Activo</span>
                  <span className={styles['mod-arrow']} aria-hidden="true">→</span>
                </div>
              </button>
              ) : (
              <div className={`${styles['modulo-card']} ${styles['disabled']}`} role="listitem" aria-label="Módulo Catálogos - Sin acceso">
                <div className={`${styles['mod-ico-wrap']} ${styles['mod-ico-gris']}`} aria-hidden="true">📋</div>
                <div className={styles['mod-nombre']}>Gestión de catálogos</div>
                <p className={styles['mod-desc']}>Razas de maíz, municipios, comunidades, localidades, lenguas, pueblos originarios y más de 15 catálogos con CRUD.</p>
                <div className={styles['mod-footer']}>
                  <span className={styles['mod-estado-pronto']}>🔒 Sin acceso</span>
                </div>
              </div>
              )}
              {puedeVerUsuarios ? (
              <button className={styles['modulo-card']} role="listitem" onClick={() => handleNavigate('admin/usuarios')} aria-label="Módulo Gestión de Usuarios">
                <div className={`${styles['mod-ico-wrap']} ${styles['mod-ico-verde']}`} aria-hidden="true">👥</div>
                <div className={styles['mod-nombre']}>Gestión de usuarios</div>
                <p className={styles['mod-desc']}>Inventario de cuentas, cambio de roles, activar/desactivar y log de actividad del equipo de investigación.</p>
                <div className={styles['mod-footer']}>
                  <span className={styles['mod-estado-activo']}>● Activo</span>
                  <span className={styles['mod-arrow']} aria-hidden="true">→</span>
                </div>
              </button>
              ) : (
              <div className={`${styles['modulo-card']} ${styles['disabled']}`} role="listitem" aria-label="Módulo Gestión de Usuarios - Sin acceso">
                <div className={`${styles['mod-ico-wrap']} ${styles['mod-ico-gris']}`} aria-hidden="true">👥</div>
                <div className={styles['mod-nombre']}>Gestión de usuarios</div>
                <p className={styles['mod-desc']}>Inventario de cuentas, cambio de roles, activar/desactivar y log de actividad del equipo de investigación.</p>
                <div className={styles['mod-footer']}>
                  <span className={styles['mod-estado-pronto']}>🔒 Sin acceso</span>
                </div>
              </div>
              )}
            </div>
          </div>
          {/* Actividad + Etapas */}
          <div className={styles['actividad-wrap']}>
            {/* Actividad reciente */}
            <div className={styles['card-panel']} role="region" aria-labelledby="titulo-actividad">
              <div className={styles['card-panel-header']}>
                <h2 className={styles['card-panel-titulo']} id="titulo-actividad">Actividad reciente</h2>
                <a className={styles['card-panel-link']} href="#" aria-label="Ver todo el historial">Ver todo →</a>
              </div>
              <div role="list" aria-label="Lista de actividades recientes">
                <div className={styles['act-item']} role="listitem">
                  <div className={styles['act-ico-wrap']} style={{ background: 'var(--verde-pal)' }} aria-hidden="true">🌽</div>
                  <div className={styles['act-txt']}>
                    <strong>Base de datos construida</strong>
                    <span>7 esquemas · 40+ tablas · PostGIS</span>
                  </div>
                  <time className={styles['act-tiempo']} dateTime="2025-03">Mar 2025</time>
                </div>
                <div className={styles['act-item']} role="listitem">
                  <div className={styles['act-ico-wrap']} style={{ background: 'var(--maiz-pal)' }} aria-hidden="true">🧑‍🌾</div>
                  <div className={styles['act-txt']}>
                    <strong>Módulo Productores listo</strong>
                    <span>Perfil social y cultural completo</span>
                  </div>
                  <time className={styles['act-tiempo']} dateTime="2025-03">Mar 2025</time>
                </div>
                <div className={styles['act-item']} role="listitem">
                  <div className={styles['act-ico-wrap']} style={{ background: 'var(--azul-pal)' }} aria-hidden="true">🔐</div>
                  <div className={styles['act-txt']}>
                    <strong>Autenticación JWT implementada</strong>
                    <span>5 roles · Login/registro activo</span>
                  </div>
                  <time className={styles['act-tiempo']} dateTime="2025-03">Mar 2025</time>
                </div>
                <div className={styles['act-item']} role="listitem">
                  <div className={styles['act-ico-wrap']} style={{ background: 'var(--verde-pal)' }} aria-hidden="true">📋</div>
                  <div className={styles['act-txt']}>
                    <strong>Catálogos territoriales cargados</strong>
                    <span>Municipios, comunidades, lenguas</span>
                  </div>
                  <time className={styles['act-tiempo']} dateTime="2025-02">Feb 2025</time>
                </div>
                <div className={styles['act-item']} role="listitem">
                  <div className={styles['act-ico-wrap']} style={{ background: 'var(--crema-dark)' }} aria-hidden="true">🗺️</div>
                  <div className={styles['act-txt']}>
                    <strong>Visitas de campo iniciadas</strong>
                    <span>5 comunidades · GPS D-RTK 2</span>
                  </div>
                  <time className={styles['act-tiempo']} dateTime="2025-04">Abr 2025</time>
                </div>
              </div>
            </div>
            {/* Estado de etapas */}
            <div className={styles['card-panel']} role="region" aria-labelledby="titulo-etapas">
              <div className={styles['card-panel-header']}>
                <h2 className={styles['card-panel-titulo']} id="titulo-etapas">Estado del proyecto</h2>
              </div>
              <div className={styles['etapa-mini']}>
                <div className={styles['etapa-mini-header']}>
                  <span className={styles['etapa-mini-nombre']}>Etapa 1 · Diagnóstico</span>
                  <span className={`${styles['etapa-mini-estado']} ${styles['est-activa']}`} role="status">En curso</span>
                </div>
                <div className={styles['prog-bar-track']} role="progressbar" aria-valuenow={38} aria-valuemin={0} aria-valuemax={100} aria-label="Etapa 1: 38% completado">
                  <div className={`${styles['prog-bar-fill']} ${styles['fill-maiz']}`} style={{ width: '38%' }}></div>
                </div>
                <div className={styles['prog-meta']} aria-hidden="true">
                  <span>0%</span><span>38% completado</span><span>100%</span>
                </div>
              </div>
              <div className={styles['etapa-mini']}>
                <div className={styles['etapa-mini-header']}>
                  <span className={styles['etapa-mini-nombre']}>Etapa 2 · Desarrollo</span>
                  <span className={`${styles['etapa-mini-estado']} ${styles['est-pronto']}`} role="status">Próxima</span>
                </div>
                <div className={styles['prog-bar-track']} role="progressbar" aria-valuenow={0} aria-valuemin={0} aria-valuemax={100} aria-label="Etapa 2: aún no iniciada">
                  <div className={`${styles['prog-bar-fill']} ${styles['fill-gris']}`} style={{ width: '0%' }}></div>
                </div>
                <div className={styles['prog-meta']} aria-hidden="true">
                  <span>Pendiente</span><span>11 meses</span>
                </div>
              </div>
              <div style={{ padding: '14px 20px' }}>
                <h3 style={{ fontSize: 12, fontWeight: 800, color: 'var(--tierra)', marginBottom: 10, fontFamily: 'DM Mono,monospace', letterSpacing: '.06em', textTransform: 'uppercase' }}>Avances Etapa 1</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--cafe)' }}>
                    <span style={{ color: 'var(--verde)', fontSize: 14 }} aria-hidden="true">✅</span> Base de datos PostgreSQL/PostGIS
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--cafe)' }}>
                    <span style={{ color: 'var(--verde)', fontSize: 14 }} aria-hidden="true">✅</span> Módulos de captura frontend
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--cafe)' }}>
                    <span style={{ color: 'var(--verde)', fontSize: 14 }} aria-hidden="true">✅</span> Sistema de autenticación JWT
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--maiz)' }}>
                    <span style={{ color: 'var(--maiz)', fontSize: 14 }} aria-hidden="true">🔄</span> Visitas de campo en curso
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--gris-cl)' }}>
                    <span style={{ color: 'var(--gris-cl)', fontSize: 14 }} aria-hidden="true">⏳</span> Vuelos de dron Mavic 3
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--gris-cl)' }}>
                    <span style={{ color: 'var(--gris-cl)', fontSize: 14 }} aria-hidden="true">⏳</span> Informe de diagnóstico final
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
    </AdminShell>
  );
}
