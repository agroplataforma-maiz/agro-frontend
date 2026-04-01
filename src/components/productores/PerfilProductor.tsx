// src/components/productores/PerfilProductor.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { GET } from '@/lib/api'
import { calcularEdad, dash, nombreCompleto } from '@/lib/utils'
import type { Productor } from '@/types'
import styles from './PerfilProductor.module.css'
import Button from '@/components/ui/Button'

interface Props {
  id: number
  onVolver: () => void
}

function iniciales(nombre: string) {
  return nombre.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('')
}

// Secciones del perfil — cada una consume su propio endpoint
const SECCIONES: { key: string; emoji: string; label: string; path: (id: number) => string }[] = [
  { key: 'lenguas',     emoji: '🗣️',  label: 'Lenguas',                path: id => `/social/lengua/?productor_id=${id}` },
  { key: 'geo',         emoji: '🌐',  label: 'Geografía',              path: id => `/social/geo/?productor_id=${id}` },
  { key: 'socio',       emoji: '👥',  label: 'Datos socioeconómicos',  path: id => `/social/socioeconomico/?productor_id=${id}` },
  { key: 'practicas',   emoji: '🌱',  label: 'Prácticas agrícolas',    path: id => `/social/practica_agricola/?productor_id=${id}` },
  { key: 'elcsa',       emoji: '🍽️',  label: 'ELCSA',                  path: id => `/social/elcsa/?productor_id=${id}` },
  { key: 'climatica',   emoji: '🌧️',  label: 'Adaptación climática',   path: id => `/social/climatica/?productor_id=${id}` },
  { key: 'red',         emoji: '🌳',  label: 'Red de intercambio',     path: id => `/social/red_intercambio/?productor_id=${id}` },
  { key: 'identidad',   emoji: '🏗️',  label: 'Identidad cultural',     path: id => `/cultural/identidad/?productor_id=${id}` },
  { key: 'transmision', emoji: '📚',  label: 'Transmisión de saberes', path: id => `/cultural/transmision/?productor_id=${id}` },
  { key: 'saberes',     emoji: '🌽',  label: 'Saberes del maíz',       path: id => `/cultural/saber_maiz/?productor_id=${id}` },
  { key: 'narrativas',  emoji: '📜',  label: 'Narrativas',             path: id => `/cultural/narrativa/?productor_id=${id}` },
  { key: 'gastronomia', emoji: '👨‍🍳',  label: 'Gastronomía',            path: id => `/cultural/gastronomia/?productor_id=${id}` },
]

export default function PerfilProductor({ id, onVolver }: Props) {
  const { data: productor, isLoading } = useQuery<Productor>({
    queryKey: ['productor', id],
    queryFn:  () => GET(`/social/productor/${id}/`),
  })

  if (isLoading) return (
    <div className={styles.estadoCentro}>
      <div className={styles.spinner} />
      <span>Cargando perfil…</span>
    </div>
  )
  if (!productor) return (
    <div className={styles.estadoCentro}>Productor no encontrado</div>
  )

  const nombre = nombreCompleto(productor.nombres, productor.apellido_paterno, productor.apellido_materno)
  const edad   = productor.fecha_nacimiento ? calcularEdad(productor.fecha_nacimiento) : null
  const ini    = iniciales(nombre)

  return (
    <div className={styles.page}>

      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroBanner} />
        <div className={styles.heroBody}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatar}>{ini}</div>
          </div>
          <div className={styles.heroInfo}>
            <div className={styles.heroTop}>
              <h1 className={styles.nombre}>{nombre}</h1>
              {productor.tipo_productor_nombre && (
                <span className={styles.badge}>{productor.tipo_productor_nombre}</span>
              )}
            </div>
            <div className={styles.meta}>
              {edad              && <span className={styles.metaItem}>🎂 {edad} años</span>}
              {productor.genero  && <span className={styles.metaItem}>👤 {productor.genero}</span>}
              {productor.municipio_nombre && <span className={styles.metaItem}>📍 {productor.municipio_nombre}</span>}
              {productor.localidad_nombre && <span className={styles.metaItem}>🏠 {productor.localidad_nombre}</span>}
            </div>
          </div>
          <Button variante="ghost" tamaño="sm" onClick={onVolver} className={styles.btnVolver}>
            ← Volver
          </Button>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className={styles.statsGrid}>
        <StatPerfil emoji="🩺" label="ID"          valor={String(productor.id)} />
        <StatPerfil emoji="🌽" label="Experiencia"
          valor={productor.anios_experiencia
            ? `${productor.anios_experiencia} ${productor.anios_experiencia === 1 ? 'año' : 'años'}`
            : undefined} />
        <StatPerfil emoji="📍" label="Comunidad"   valor={productor.comunidad_nombre} />
        <StatPerfil emoji="📅" label="Fecha nac." valor={productor.fecha_nacimiento ?? undefined} />
      </div>

      {/* Secciones de saberes */}
      <div className={styles.secciones}>
        {SECCIONES.map(s => (
          <SeccionDatos key={s.key} emoji={s.emoji} label={s.label} path={s.path(id)} />
        ))}
      </div>
    </div>
  )
}

// ── Stat rápida ──────────────────────────────────────────────────────────────
function StatPerfil({ emoji, label, valor }: { emoji: string; label: string; valor?: string }) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statIcono}>{emoji}</span>
      <span className={styles.statValor}>{dash(valor)}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  )
}

// ── Sección individual (lazy fetch) ──────────────────────────────────────────
function SeccionDatos({ emoji, label, path }: { emoji: string; label: string; path: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['seccion', path],
    queryFn:  () => GET(path),
  })

  const items = Array.isArray(data) ? data : (data as Record<string, unknown>)?.items ?? []
  const tieneData = !isLoading && !isError && (items as unknown[]).length > 0

  return (
    <details className={styles.seccion}>
      <summary className={styles.seccionTitulo}>
        <span className={styles.seccionTituloInner}>{emoji} {label}</span>
        ›
      </summary>
      <div className={styles.seccionBody}>
        {isLoading && <p className={styles.estado}>⏳ Cargando…</p>}
        {isError   && <p className={`${styles.estado} ${styles.estadoError}`}>⚠️ Error al cargar</p>}
        {!isLoading && !isError && (items as unknown[]).length === 0 && (
          <p className={styles.estado}>Sin datos registrados</p>
        )}
        {tieneData && (items as Record<string, unknown>[]).map((item, i) => (
          <div key={i} className={styles.seccionItem}>
            {Object.entries(item)
              .filter(([k]) => !['id', 'productor_id', 'created_at', 'updated_at'].includes(k))
              .map(([k, v]) => {
                let display: string
                if (v === null || v === undefined) display = ''
                else if (typeof v === 'object') {
                  const obj = v as Record<string, unknown>
                  display = String(obj.nombre ?? obj.name ?? obj.label ?? obj.descripcion ?? JSON.stringify(v))
                } else display = String(v)
                return <DatoItem key={k} label={k.replace(/_/g, ' ')} valor={display} />
              })}
          </div>
        ))}
      </div>
    </details>
  )
}

// ── Dato individual ───────────────────────────────────────────────────────────
function DatoItem({ label, valor }: { label: string; valor?: string }) {
  return (
    <div className={styles.datoItem}>
      <span className={styles.datoLabel}>{label}</span>
      <span className={styles.datoValor}>{dash(valor)}</span>
    </div>
  )
}
