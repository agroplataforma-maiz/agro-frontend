// src/components/productores/PerfilProductor.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { GET } from '@/lib/api'
import { calcularEdad, dash, nombreCompleto } from '@/lib/utils'
import type { Productor } from '@/types'
import styles from './PerfilProductor.module.css'
import Button from '@/components/ui/Button'
import StateView from '@/components/ui/StateView'

interface Props {
  id: number
  onVolver: () => void
}

function iniciales(nombre: string) {
  return nombre.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('')
}

// Secciones del perfil — cada una consume su propio endpoint
const SECCIONES: { key: string; emoji: string; label: string; path: (id: number) => string }[] = [
  { key: 'lenguas',     emoji: '🗣️',  label: 'Lenguas',                path: id => `/social/lengua?productor_id=${id}` },
  { key: 'geo',         emoji: '🌐',  label: 'Geografía',              path: id => `/social/geo?productor_id=${id}` },
  { key: 'socio',       emoji: '👥',  label: 'Datos socioeconómicos',  path: id => `/social/socioeconomico?productor_id=${id}` },
  { key: 'practicas',   emoji: '🌱',  label: 'Prácticas agrícolas',    path: id => `/social/practica_agricola?productor_id=${id}` },
  { key: 'elcsa',       emoji: '🍽️',  label: 'ELCSA',                  path: id => `/social/elcsa?productor_id=${id}` },
  { key: 'climatica',   emoji: '🌧️',  label: 'Adaptación climática',   path: id => `/social/climatica?productor_id=${id}` },
  { key: 'red',         emoji: '🌳',  label: 'Red de intercambio',     path: id => `/social/red_intercambio?productor_id=${id}` },
  { key: 'identidad',   emoji: '🏗️',  label: 'Identidad cultural',     path: id => `/cultural/identidad?productor_id=${id}` },
  { key: 'transmision', emoji: '📚',  label: 'Transmisión de saberes', path: id => `/cultural/transmision?productor_id=${id}` },
  { key: 'saberes',     emoji: '🌽',  label: 'Saberes del maíz',       path: id => `/cultural/saber_maiz?productor_id=${id}` },
  { key: 'narrativas',  emoji: '📜',  label: 'Narrativas',             path: id => `/cultural/narrativa?productor_id=${id}` },
  { key: 'gastronomia', emoji: '👨‍🍳',  label: 'Gastronomía',            path: id => `/cultural/gastronomia?productor_id=${id}` },
]

export default function PerfilProductor({ id, onVolver }: Props) {
  const { data: productor, isLoading } = useQuery<Productor>({
    queryKey: ['productor', id],
    queryFn:  () => GET(`/social/productor/${id}`),
  })

  if (isLoading) return (
    <div className={styles.estadoCentro}>
      <StateView variant="loading" title="Cargando perfil" message="Preparando la ficha del productor..." />
    </div>
  )
  if (!productor) return (
    <div className={styles.estadoCentro}>
      <StateView variant="empty" title="Productor no encontrado" message="No encontramos información para este productor." />
    </div>
  )

  const nombre = nombreCompleto(productor.nombres, productor.apellido_paterno, productor.apellido_materno)
  const edad   = productor.fecha_nacimiento ? calcularEdad(productor.fecha_nacimiento) : null
  const ini    = iniciales(nombre)

  const irASeccion = (key: string) => {
    const el = document.getElementById(`sec-${key}`) as HTMLDetailsElement | null
    if (!el) return
    el.open = true
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={styles.page}>

      <div className={styles.topNav}>
        <div className={styles.topActions}>
          <Button variante="secundario" tamaño="sm" onClick={onVolver} className={styles.topBackBtn}>
            ← Volver a productores
          </Button>
          <Button
            variante="ghost"
            tamaño="sm"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={styles.topBackBtn}
          >
            ↑ Ir arriba
          </Button>
        </div>
        <span className={styles.topHint}>Navegación rápida del perfil</span>
      </div>

      <div className={styles.quickNav}>
        {SECCIONES.map((s) => (
          <button
            key={s.key}
            type="button"
            className={styles.quickNavBtn}
            onClick={() => irASeccion(s.key)}
          >
            <span aria-hidden="true">{s.emoji}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

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
          <SeccionDatos key={s.key} sectionKey={s.key} emoji={s.emoji} label={s.label} path={s.path(id)} />
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
function SeccionDatos({ sectionKey, emoji, label, path }: { sectionKey: string; emoji: string; label: string; path: string }) {
  const { data, isLoading, isError } = useQuery<unknown>({
    queryKey: ['seccion', path],
    queryFn:  () => GET(path),
  });

  type Lengua = {
    id: number;
    nombre: string;
    nombre_original?: string;
    familia_linguistica?: string;
    variante?: string;
    clave_inali?: string;
    [key: string]: unknown;
  };

  let items: Record<string, unknown>[] = [];
  if (sectionKey === 'lenguas') {
    if (
      data &&
      typeof data === 'object' &&
      'results' in (data as Record<string, unknown>) &&
      Array.isArray((data as { results?: unknown }).results)
    ) {
      items = (data as { results: Lengua[] }).results;
    }
  } else {
    if (Array.isArray(data)) {
      items = data as Record<string, unknown>[];
    } else if (
      data &&
      typeof data === 'object' &&
      'items' in data &&
      Array.isArray((data as { items?: unknown }).items)
    ) {
      items = (data as { items: Record<string, unknown>[] }).items;
    } else {
      items = [];
    }
  }
  const tieneData = !isLoading && !isError && items.length > 0;

  return (
    <details id={`sec-${sectionKey}`} className={styles.seccion}>
      <summary className={styles.seccionTitulo}>
        <span className={styles.seccionTituloInner}>{emoji} {label}</span>
        ›
      </summary>
      <div className={styles.seccionBody}>
        {isLoading && <StateView variant="loading" size="sm" title="Cargando" message="Consultando datos de la sección..." />}
        {isError   && <StateView variant="error" size="sm" title="Error al cargar" message="No pudimos obtener esta sección por ahora." />}
        {!isLoading && !isError && items.length === 0 && (
          <StateView variant="empty" size="sm" title="Sin datos registrados" message="Todavía no hay información capturada en esta sección." />
        )}
        {tieneData && sectionKey === 'lenguas' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(items as Lengua[]).map((l, i) => (
              <div key={String(l.id) || i} style={{
                background: '#fffbe6',
                border: '1px solid #ffe066',
                borderRadius: 10,
                padding: '12px 18px',
                marginBottom: 4,
                boxShadow: '0 1px 4px #ffe06633',
                fontSize: 15
              }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#C8820A' }}>{String(l.nombre_original || l.nombre)}</div>
                <div style={{ color: '#7c5c1a', fontSize: 13, marginBottom: 2 }}>{String(l.nombre)}</div>
                <div style={{ fontSize: 12, color: '#8d7b4a' }}>
                  {l.familia_linguistica && <span><b>Familia:</b> {String(l.familia_linguistica)} &nbsp; </span>}
                  {l.variante && <span><b>Variante:</b> {String(l.variante)} &nbsp; </span>}
                  {l.clave_inali && <span><b>Clave INALI:</b> {String(l.clave_inali)}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
        {tieneData && sectionKey !== 'lenguas' && (items as Record<string, unknown>[]).map((item, i) => (
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
