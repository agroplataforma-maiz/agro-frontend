'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { GET } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'
import { nombreCompleto, calcularEdad, dash } from '@/lib/utils'

import Tabla, { type Columna } from '@/components/ui/Tabla'
import Button from '@/components/ui/Button'
import SearchInput from '@/components/ui/SearchInput'

import type { Productor } from '@/types'
import styles from '@/app/productores/productores.module.css'

import ModalAsignarTecnico from './ModalAsignarTecnico'

interface Props {
  puedeCrear: boolean
  onNuevo: () => void
  onEditar: (productor: Productor) => void
  onEliminar: (productor: Productor) => void
  onVerPerfil: (id: string) => void
}

export default function ProductoresPanel({
  puedeCrear,
  onNuevo,
  onEditar,
  onEliminar,
  onVerPerfil,
}: Props) {
  const municipios = useAppStore(s => s.municipios)

  const [busqueda, setBusqueda] = useState('')

  const [productorAsignacion, setProductorAsignacion] =
    useState<Productor | null>(null)

  const [modalAsignacionAbierto, setModalAsignacionAbierto] =
    useState(false)

  // ── Productores ───────────────────────────────────────────────────────────
  const {
    data: productores = [],
    isLoading,
  } = useQuery<Productor[]>({
    queryKey: ['productores'],
    queryFn: () => GET('/productores/lista'),
  })

  // ── Filtro de productores ─────────────────────────────────────────────────
  const filtrados = productores.filter(p => {
    const nombre = nombreCompleto(
      p.nombres,
      p.apellido_paterno,
      p.apellido_materno
    )

    const texto = [
      nombre,
      p.telefono,
      p.correo_electronico,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return texto.includes(busqueda.toLowerCase())
  })

  function abrirAsignacion(productor: Productor) {
    setProductorAsignacion(productor)
    setModalAsignacionAbierto(true)
  }

  function cerrarAsignacion() {
    setModalAsignacionAbierto(false)
    setProductorAsignacion(null)
  }

  // ── Columnas de productores ───────────────────────────────────────────────
  const columnas: Columna<Productor>[] = [
    /*
    {
      key: 'id',
      header: 'ID',
      width: '60px',
      hideOnMobile: true,
      hideOnTablet: true,
    },
    */
    {
      key: 'nombres',
      header: 'Nombre',
      render: p =>
        nombreCompleto(
          p.nombres,
          p.apellido_paterno,
          p.apellido_materno
        ),
    },
    {
      key: 'telefono',
      header: 'Teléfono',
      render: p => p.telefono || '—',
      hideOnMobile: true,
    },
    {
      key: 'correo_electronico',
      header: 'Correo',
      render: p => p.correo_electronico || '—',
      hideOnMobile: true,
    },
  ]

  return (
    <>
      <header className={styles.header}>
        <div>
          <h1 className={styles.titulo}>
            Productores
          </h1>

          <p className={styles.subtitulo}>
            {filtrados.length} registros
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
              onClick={onNuevo}
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
        onRowClick={p => onVerPerfil(p.id)}
        acciones={p => (
          <div className={styles.acciones}>
            <Button
              variante="ghost"
              tamaño="sm"
              onClick={() => abrirAsignacion(p)}
            >
              Asignar técnico
            </Button>

            {/* TODO BACKEND:
                Habilitar edición cuando exista PUT /productores/{id}. */}
            <Button
              variante="ghost"
              tamaño="sm"
              onClick={() => onEditar(p)}
            >
              ✏️
            </Button>

            {/* TODO BACKEND:
                Habilitar eliminación cuando exista DELETE /productores/{id}. */}
            <Button
              variante="peligro"
              tamaño="sm"
              onClick={() => onEliminar(p)}
            >
              🗑
            </Button>
          </div>
        )}
      />

      <ModalAsignarTecnico
        productor={productorAsignacion}
        abierto={modalAsignacionAbierto}
        onClose={cerrarAsignacion}
      />
    </>
  )
}