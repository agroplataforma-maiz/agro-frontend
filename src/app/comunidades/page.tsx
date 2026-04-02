// src/app/comunidades/page.tsx
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { GET, DEL } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'
import { useCatalogos } from '@/hooks/useCatalogos'
import { dash } from '@/lib/utils'
import Tabla, { type Columna } from '@/components/ui/Tabla'
import ModalComunidad from '@/components/comunidades/ModalComunidad'
import PerfilComunidad from '../../components/comunidades/PerfilComunidad'

import type { Comunidad } from '@/types'
import styles from './comunidades.module.css'
import AdminShell from '@/components/dashboard/AdminShell'
import Button from '@/components/ui/Button'
import ModuleHero from '@/components/ui/ModuleHero'
import SearchInput from '@/components/ui/SearchInput'
import Modal from '@/components/ui/Modal'
import AccessGuardScreen from '@/components/ui/AccessGuardScreen'
import { useRolGuard } from '@/hooks/useRolGuard'

type Vista = 'lista' | 'perfil'

export default function ComunidadesPage() {
  const accesoPermitido = useRolGuard(['administrador', 'investigador', 'tecnico_campo'])

  useCatalogos()

  const usuario  = useAppStore(s => s.usuario)
  const addToast = useAppStore(s => s.addToast)
  const qc       = useQueryClient()

  const [vista,          setVista]          = useState<Vista>('lista')
  const [comunidadId,    setComunidadId]    = useState<number | null>(null)
  const [busqueda,       setBusqueda]       = useState('')
  const [modalAbierto,   setModalAbierto]   = useState(false)
  const [editando,       setEditando]       = useState<Comunidad | null>(null)
  const [confirmEliminar, setConfirmEliminar] = useState<Comunidad | null>(null)

  // ── Fetch lista ───────────────────────────────────────────────────────────
  const { data: comunidades = [], isLoading } = useQuery<Comunidad[]>({
    queryKey: ['comunidades'],
    queryFn:  () => GET('/social/comunidad'),
    enabled: accesoPermitido,
    select:   (d: unknown) => {
      const data = d as Comunidad[] | { items?: Comunidad[]; results?: Comunidad[] }
      return Array.isArray(data) ? data : data.items ?? data.results ?? []
    },
  })

  // ── Eliminar ──────────────────────────────────────────────────────────────
  const eliminar = useMutation({
    mutationFn: (id: number) => DEL(`/social/comunidad/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comunidades'] })
      addToast('Comunidad eliminada', 'ok')
    },
    onError: (e: Error) => addToast(e.message, 'err'),
  })

  if (!accesoPermitido) return <AccessGuardScreen message="Verificando permisos..." />
  if (!usuario) return <AccessGuardScreen message="Cargando comunidades..." />

  // ── Filtro ────────────────────────────────────────────────────────────────
  const filtradas = comunidades.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.municipio_nombre ?? '').toLowerCase().includes(busqueda.toLowerCase())
  )
  const municipiosCubiertos = new Set(comunidades.map(c => c.municipio_nombre).filter(Boolean)).size
  const totalProductores = comunidades.reduce((sum, c) => sum + (c.num_productores ?? 0), 0)

  // ── Columnas ──────────────────────────────────────────────────────────────
  const columnas: Columna<Comunidad>[] = [
    { key: 'id',     header: 'ID',        width: '60px', hideOnMobile: true, hideOnTablet: true },
    { key: 'nombre', header: 'Comunidad', render: c => c.nombre },
    {
      key: 'municipio_nombre',
      header: 'Municipio',
      render: c => dash(c.municipio_nombre),
    },
    {
      key: 'lengua_indigena',
      header: 'Lengua indígena',
      hideOnMobile: true,
      hideOnTablet: true,
      render: c => dash(c.lengua_indigena),
    },
    {
      key: 'poblacion',
      header: 'Población',
      width: '100px',
      hideOnMobile: true,
      hideOnTablet: true,
      render: c => c.poblacion ? c.poblacion.toLocaleString() : '—',
    },
    {
      key: 'num_productores',
      header: 'Productores',
      width: '110px',
      render: c => c.num_productores != null ? String(c.num_productores) : '—',
    },
  ]

  // ── Vista perfil ──────────────────────────────────────────────────────────
  if (vista === 'perfil' && comunidadId) {
    return (
      <AdminShell contentPadding="0">
        <PerfilComunidad
          id={comunidadId}
          onVolver={() => { setVista('lista'); setComunidadId(null) }}
        />
      </AdminShell>
    )
  }

  // ── Vista lista ───────────────────────────────────────────────────────────
  return (
    <AdminShell contentPadding="0">
      <div className={styles.page}>
        <ModuleHero
          eyebrow="Social · Territorio comunitario"
          title={<>Mapa de <em>Comunidades</em> 🏘️</>}
          description="Organiza comunidades, municipios y referencias territoriales para conectar productores, lengua y contexto local." 
          stats={[
            { label: 'comunidades', value: comunidades.length },
            { label: 'municipios', value: municipiosCubiertos || '—' },
            { label: 'productores', value: totalProductores || '—' },
          ]}
        />
        <header className={styles.header}>
          <div>
            <h1 className={styles.titulo}>Comunidades</h1>
            <p className={styles.subtitulo}>{filtradas.length} registros · Huasteca Potosina</p>
          </div>
          <div className={styles.headerActions}>
            <SearchInput
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar comunidad o municipio…"
            />
            <Button
              variante="primario"
              onClick={() => { setEditando(null); setModalAbierto(true) }}
            >
              + Nueva comunidad
            </Button>
          </div>
        </header>

        <div className={styles.kpiBand}>
          <div className={styles.kpiItem}>
            <span className={styles.kpiNum}>{comunidades.length}</span>
            <span className={styles.kpiLbl}>Comunidades registradas</span>
          </div>
          <div className={styles.kpiItem}>
            <span className={styles.kpiNum}>
              {comunidades.reduce((s, c) => s + (c.num_productores ?? 0), 0)}
            </span>
            <span className={styles.kpiLbl}>Productores totales</span>
          </div>
          <div className={styles.kpiItem}>
            <span className={styles.kpiNum}>
              {new Set(comunidades.map(c => c.municipio_nombre).filter(Boolean)).size || '—'}
            </span>
            <span className={styles.kpiLbl}>Municipios cubiertos</span>
          </div>
          <div className={styles.kpiItem}>
            <span className={styles.kpiNum}>
              {new Set(comunidades.map(c => c.lengua_indigena).filter(Boolean)).size || '—'}
            </span>
            <span className={styles.kpiLbl}>Lenguas indígenas</span>
          </div>
        </div>

        <div style={{ marginTop: 16 }} />
        <Tabla
          datos={filtradas}
          columnas={columnas}
          cargando={isLoading}
          vacio="No hay comunidades registradas"
          onRowClick={c => { setComunidadId(c.id); setVista('perfil') }}
          acciones={c => (
            <div className={styles.acciones}>
              <Button variante="ghost" tamaño="sm" onClick={e => { e.stopPropagation(); setEditando(c); setModalAbierto(true) }}>✏️</Button>
              <Button variante="peligro" tamaño="sm" onClick={e => { e.stopPropagation(); setConfirmEliminar(c) }}>🗑</Button>
            </div>
          )}
        />

        {modalAbierto && (
          <ModalComunidad
            comunidad={editando}
            onClose={() => setModalAbierto(false)}
            onSaved={() => {
              setModalAbierto(false)
              qc.invalidateQueries({ queryKey: ['comunidades'] })
              addToast(editando ? 'Comunidad actualizada' : 'Comunidad creada', 'ok')
            }}
          />
        )}

        {confirmEliminar && (
          <Modal
            titulo="Eliminar comunidad"
            ancho="sm"
            onClose={() => setConfirmEliminar(null)}
            footer={
              <>
                <Button variante="ghost" onClick={() => setConfirmEliminar(null)}>Cancelar</Button>
                <Button
                  variante="peligro"
                  onClick={() => { eliminar.mutate(confirmEliminar.id); setConfirmEliminar(null) }}
                >
                  Eliminar
                </Button>
              </>
            }
          >
            <p>¿Eliminar la comunidad <strong>{confirmEliminar.nombre}</strong>?</p>
            <p style={{ color: 'var(--rojo)', fontSize: '0.875rem' }}>Esta acción no se puede deshacer.</p>
          </Modal>
        )}
      </div>
    </AdminShell>
  )
}
