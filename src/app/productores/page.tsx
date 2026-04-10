// src/app/productores/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { GET, DEL } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'
import { useCatalogos } from '@/hooks/useCatalogos'
import { calcularEdad, dash, nombreCompleto } from '@/lib/utils'
import Tabla, { type Columna } from '@/components/ui/Tabla'
import ModalProductor from '@/components/productores/ModalProductor'
import PerfilProductor from '@/components/productores/PerfilProductor'

import type { Productor } from '@/types'
import styles from './productores.module.css'
import AdminShell from '@/components/dashboard/AdminShell'
import Button from '@/components/ui/Button'
import ModuleHero from '@/components/ui/ModuleHero'
import SearchInput from '@/components/ui/SearchInput'
import Modal from '@/components/ui/Modal'
import AccessGuardScreen from '@/components/ui/AccessGuardScreen'
import { useRolGuard } from '@/hooks/useRolGuard'


type Vista = 'lista' | 'perfil'


import { useRouter } from 'next/navigation'

export default function ProductoresPage() {
  // ── Hooks y stores al inicio ──
  const router = useRouter()
  const accesoPermitido = useRolGuard(['administrador', 'investigador', 'tecnico_campo'])
  useCatalogos(accesoPermitido)
  const usuario = useAppStore(s => s.usuario)
  const addToast = useAppStore(s => s.addToast)
  const qc = useQueryClient()
  const municipios = useAppStore(s => s.municipios)

  // Redirección automática si no hay usuario
  useEffect(() => {
    if (usuario === null) {
      router.replace('/')
    }
  }, [usuario, router])

  const [vista, setVista] = useState<Vista>('lista')
  const [productorId, setProductorId] = useState<number | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Productor | null>(null)
  const [confirmEliminar, setConfirmEliminar] = useState<Productor | null>(null)

  const { data: productores = [], isLoading } = useQuery<Productor[]>({
    queryKey: ['productores'],
    queryFn:  () => GET('/social/productor'),
    enabled: accesoPermitido,
    select:   (d: unknown) => {
      const data = d as Productor[] | { items?: Productor[]; results?: Productor[] }
      return Array.isArray(data) ? data : data.items ?? data.results ?? []
    },
  })

  const eliminar = useMutation({
    mutationFn: (id: number) => DEL(`/social/productor/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['productores'] })
      addToast('Productor eliminado', 'ok')
    },
    onError: (e: Error) => addToast(e.message, 'err'),
  })

  // ── Returns condicionales después de los hooks ──
  if (!usuario) return null
  if (!accesoPermitido) return <AccessGuardScreen message="Verificando permisos..." />

  const esAdmin = usuario.rol === 'administrador'
  const puedeCrear = !esAdmin

  function confirmarEliminar(p: Productor) {
    setConfirmEliminar(p)
  }

  // ── Filtro ────────────────────────────────────────────────────────────────
  const filtrados = productores.filter(p => {
    const nombre = nombreCompleto(p.nombres, p.apellido_paterno, p.apellido_materno)
    return nombre.toLowerCase().includes(busqueda.toLowerCase())
  })
  const municipiosCubiertos = new Set(filtrados.map(p => p.municipio_id).filter(Boolean)).size

  // ── Columnas de la tabla ──────────────────────────────────────────────────
  const columnas: Columna<Productor>[] = [
    { key: 'id', header: 'ID', width: '60px', hideOnMobile: true, hideOnTablet: true },
    {
      key: 'nombres',
      header: 'Nombre',
      render: p => nombreCompleto(p.nombres, p.apellido_paterno, p.apellido_materno),
    },
    {
      key: 'fecha_nacimiento',
      header: 'Edad',
      width: '70px',
      hideOnMobile: true,
      hideOnTablet: true,
      render: p => p.fecha_nacimiento ? String(calcularEdad(p.fecha_nacimiento)) : '—',
    },
    { key: 'genero',           header: 'Género',      hideOnMobile: true, hideOnTablet: true, render: p => dash(p.genero) },
    { key: 'anios_experiencia', header: 'Experiencia', hideOnMobile: true, hideOnTablet: true, render: p => p.anios_experiencia ? `${p.anios_experiencia} ${p.anios_experiencia === 1 ? 'año' : 'años'}` : '—' },
    {
      key: 'municipio_id',
      header: 'Municipio',
      render: p => {
        if (p.municipio_nombre) return p.municipio_nombre
        if (p.municipio_id) return municipios.find(m => m.id === p.municipio_id)?.nombre ?? '—'
        return '—'
      },
    },
  ]

  // ── Vista perfil ──────────────────────────────────────────────────────────
  if (vista === 'perfil' && productorId) {
    return (
      <AdminShell contentPadding="24px 24px 32px">
        <PerfilProductor
          id={productorId}
          onVolver={() => { setVista('lista'); setProductorId(null) }}
        />
      </AdminShell>
    )
  }

  // ── Vista lista ───────────────────────────────────────────────────────────
  return (
    <AdminShell contentPadding="0">
      <div className={styles.page}>
          <ModuleHero
            eyebrow="Social · Módulo de productores"
            title={<>Gestión de <em>Productores</em> 🌽</>}
            description={esAdmin
              ? 'Consulta, actualiza o depura productores existentes. Las altas iniciales están reservadas para investigadores y técnicos de campo.'
              : 'Consulta, crea y administra productores vinculados al registro territorial y sociocultural de la plataforma.'}
            stats={[
              { label: 'visibles', value: filtrados.length },
              { label: 'municipios', value: municipiosCubiertos || '—' },
            ]}
          />
          <header className={styles.header}>
            <div>
              <h1 className={styles.titulo}>Productores</h1>
              <p className={styles.subtitulo}>
                {filtrados.length} registros{esAdmin ? ' · altas bloqueadas para administrador' : ''}
              </p>
            </div>
            <div className={styles.headerActions}>
              <SearchInput
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre…"
              />
              {puedeCrear && (
                <Button
                  variante="primario"
                  onClick={() => { setEditando(null); setModalAbierto(true) }}
                >
                  + Nuevo productor
                </Button>
              )}
            </div>
          </header>

          <div style={{ marginTop: 16 }} />
          <Tabla
            datos={filtrados}
            columnas={columnas}
            cargando={isLoading}
            vacio="No hay productores registrados"
            onRowClick={p => { setProductorId(p.id); setVista('perfil') }}
            acciones={p => (
              <div className={styles.acciones}>
                <Button variante="ghost" tamaño="sm" onClick={() => { setEditando(p); setModalAbierto(true) }}>✏️</Button>
                <Button variante="peligro" tamaño="sm" onClick={() => confirmarEliminar(p)}>🗑</Button>
              </div>
            )}
          />

          {modalAbierto && (puedeCrear || Boolean(editando)) && (
            <ModalProductor
              productor={editando}
              onClose={() => setModalAbierto(false)}
              onSaved={() => {
                setModalAbierto(false)
                qc.invalidateQueries({ queryKey: ['productores'] })
                addToast(editando ? 'Productor actualizado' : 'Productor creado', 'ok')
              }}
            />
          )}

          {confirmEliminar && (
            <Modal
              titulo="Eliminar productor"
              ancho="sm"
              onClose={() => setConfirmEliminar(null)}
              footer={
                <>
                  <Button variante="ghost" onClick={() => setConfirmEliminar(null)}>Cancelar</Button>
                  <Button variante="peligro" onClick={() => { eliminar.mutate(confirmEliminar.id); setConfirmEliminar(null) }}>
                    Eliminar
                  </Button>
                </>
              }
            >
              <p>¿Eliminar a <strong>{nombreCompleto(confirmEliminar.nombres, confirmEliminar.apellido_paterno, confirmEliminar.apellido_materno)}</strong>?</p>
              <p style={{ color: 'var(--rojo)', fontSize: '0.875rem' }}>Esta acción no se puede deshacer.</p>
            </Modal>
          )}
        </div>
      </AdminShell>
  )
}
