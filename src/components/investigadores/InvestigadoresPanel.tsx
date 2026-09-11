'use client'

import { useState } from 'react'

import Tabla, {
  type Columna,
} from '@/components/ui/Tabla'
import Button from '@/components/ui/Button'
import SearchInput from '@/components/ui/SearchInput'

import type { Investigador } from '@/types'
import { nombreCompleto } from '@/lib/utils'

import styles from '@/app/investigadores/investigadores.module.css'

interface Props {
  investigadores: Investigador[]
  cargando: boolean
  puedeCrear: boolean
  onNuevo: () => void
  onEditar: (investigador: Investigador) => void
  onEliminar: (investigador: Investigador) => void
  onVerPerfil: (id: string) => void
}

export default function InvestigadoresPanel({
  investigadores,
  cargando,
  puedeCrear,
  onNuevo,
  onEditar,
  onEliminar,
  onVerPerfil,
}: Props) {
  const [busqueda, setBusqueda] = useState('')

  // ── Filtro de investigadores ─────────────────────────────────────────────────
  const filtrados = investigadores.filter(p => {
    const nombre = nombreCompleto(
      p.nombre_completo
    )

    const texto = [
      nombre,
      p.username,
      p.email,
      p.pais,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return texto.includes(
      busqueda.toLowerCase()
    )
  })

  // ── Columnas de investigadores ───────────────────────────────────────────────
  const columnas: Columna<Investigador>[] = [
    {
      key: 'username',
      header: 'username',
      render: p => p.username || '—',
      hideOnMobile: true,
    },
    {
      key: 'email',
      header: 'Correo',
      render: p => p.email || '—',
      hideOnMobile: true,
    },
    {
      key: 'nombres',
      header: 'Nombre',
      render: p =>
        nombreCompleto(
          p.nombre_completo
        ),
    },
    {
      key: 'activo',
      header: 'Activo',
      render: p =>
        p.activo ? 'Sí' : 'No',
      hideOnMobile: true,
    },
    {
      key: 'institucion',
      header: 'Institución',
      render: p =>
        p.institucion || '—',
      hideOnMobile: true,
    },
    {
      key: 'especialidad',
      header: 'Especialidad',
      render: p =>
        p.especialidad || '—',
      hideOnMobile: true,
    },
  ]

  return (
    <>
      <header className={styles.header}>
        <div>
          <h1 className={styles.titulo}>
            Investigadores
          </h1>

          <p className={styles.subtitulo}>
            {filtrados.length} registros
          </p>
        </div>

        <div className={styles.headerActions}>
          <SearchInput
            value={busqueda}
            onChange={e =>
              setBusqueda(e.target.value)
            }
            placeholder="Buscar por nombre…"
          />

          {puedeCrear && (
            <Button
              variante="primario"
              onClick={onNuevo}
            >
              + Nuevo investigador
            </Button>
          )}
        </div>
      </header>

      <div style={{ marginTop: 16 }} />

      <Tabla
        datos={filtrados}
        columnas={columnas}
        cargando={cargando}
        vacio="No hay investigadores registrados"
        onRowClick={p =>
          onVerPerfil(p.id)
        }
        acciones={p => (
          <div className={styles.acciones}>
            <Button
              variante="ghost"
              tamaño="sm"
              onClick={() => onEditar(p)}
            >
              ✏️
            </Button>

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
    </>
  )
}