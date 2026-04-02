'use client'

import { useQuery } from '@tanstack/react-query'
import { GET } from '@/lib/api'
import { dash } from '@/lib/utils'
import type { Comunidad, Productor } from '@/types'
import styles from './PerfilComunidad.module.css'
import Button from '@/components/ui/Button'
import StateView from '@/components/ui/StateView'

interface Props {
  id: number
  onVolver: () => void
}

export default function PerfilComunidad({ id, onVolver }: Props) {
  const { data: comunidad, isLoading } = useQuery<Comunidad>({
    queryKey: ['comunidad', id],
    queryFn:  () => GET(`/social/comunidad/${id}`),
  })

  const { data: productores = [] } = useQuery<Productor[]>({
    queryKey: ['productores-comunidad', id],
    queryFn:  () => GET(`/social/productor?comunidad_id=${id}`),
    select: (d: unknown) => {
      const data = d as Productor[] | { items?: Productor[]; results?: Productor[] }
      return Array.isArray(data) ? data : data.items ?? data.results ?? []
    },
    enabled: !!id,
  })

  if (isLoading) return (
    <div className={styles.estadoCentro}>
      <StateView variant="loading" title="Cargando comunidad" message="Obteniendo la ficha territorial..." />
    </div>
  )
  if (!comunidad) return (
    <div className={styles.estadoCentro}>
      <StateView variant="empty" title="Comunidad no encontrada" message="No encontramos información para esta comunidad." />
    </div>
  )

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroBanner} />
        <div className={styles.heroBody}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatar}>🏘️</div>
          </div>
          <div className={styles.heroInfo}>
            <div className={styles.heroTop}>
              <h1 className={styles.nombre}>{comunidad.nombre}</h1>
              {comunidad.lengua_indigena && (
                <span className={styles.badge}>{comunidad.lengua_indigena}</span>
              )}
            </div>
            <div className={styles.meta}>
              {comunidad.municipio_nombre && (
                <span className={styles.metaItem}>📍 {comunidad.municipio_nombre}</span>
              )}
              {comunidad.localidad_nombre && (
                <span className={styles.metaItem}>🏠 {comunidad.localidad_nombre}</span>
              )}
              {comunidad.poblacion && (
                <span className={styles.metaItem}>👥 {comunidad.poblacion.toLocaleString()} hab.</span>
              )}
            </div>
          </div>
          <Button variante="ghost" tamaño="sm" onClick={onVolver} className={styles.btnVolver}>
            ← Volver
          </Button>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className={styles.statsGrid}>
        <StatPerfil emoji="🔢" label="ID"             valor={String(comunidad.id)} />
        <StatPerfil emoji="🧑‍🌾" label="Productores"  valor={comunidad.num_productores != null ? String(comunidad.num_productores) : (productores.length ? String(productores.length) : undefined)} />
        <StatPerfil emoji="🗣️" label="Lengua indígena" valor={comunidad.lengua_indigena} />
        <StatPerfil emoji="👥" label="Población"      valor={comunidad.poblacion?.toLocaleString()} />
      </div>

      {/* Coordenadas (si existen) */}
      {(comunidad.latitud || comunidad.longitud) && (
        <div className={styles.seccion}>
          <h2 className={styles.secTitulo}>📌 Ubicación geográfica</h2>
          <div className={styles.coordGrid}>
            <div className={styles.coordItem}>
              <span className={styles.coordLabel}>Latitud</span>
              <span className={styles.coordVal}>{dash(String(comunidad.latitud ?? ''))}</span>
            </div>
            <div className={styles.coordItem}>
              <span className={styles.coordLabel}>Longitud</span>
              <span className={styles.coordVal}>{dash(String(comunidad.longitud ?? ''))}</span>
            </div>
          </div>
        </div>
      )}

      {/* Lista de productores asociados */}
      <div className={styles.seccion}>
        <h2 className={styles.secTitulo}>🧑‍🌾 Productores de esta comunidad</h2>
        {productores.length === 0 ? (
          <StateView
            variant="empty"
            size="sm"
            title="Sin productores vinculados"
            message="Aún no hay productores registrados en esta comunidad."
          />
        ) : (
          <div className={styles.productoresGrid}>
            {productores.map(p => (
              <div key={p.id} className={styles.productorCard}>
                <div className={styles.productorNombre}>
                  {[p.nombres, p.apellido_paterno, p.apellido_materno].filter(Boolean).join(' ')}
                </div>
                {p.tipo_productor_nombre && (
                  <span className={styles.productorBadge}>{p.tipo_productor_nombre}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatPerfil({ emoji, label, valor }: { emoji: string; label: string; valor?: string }) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statIcono}>{emoji}</span>
      <span className={styles.statValor}>{dash(valor)}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  )
}
