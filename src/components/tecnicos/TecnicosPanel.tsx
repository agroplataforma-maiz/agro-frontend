'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { GET, DEL } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'
import { calcularEdad, dash, nombreCompleto } from '@/lib/utils'

import Tabla, { type Columna } from '@/components/ui/Tabla'
import Button from '@/components/ui/Button'
import SearchInput from '@/components/ui/SearchInput'

import type { TecnicoCampo } from '@/types'
import styles from '@/app/tecnicos/tecnicos.module.css'

interface Props {
  puedeCrear: boolean
  onNuevo: () => void
  onEditar: (tecnico: TecnicoCampo) => void
  onEliminar: (tecnico: TecnicoCampo) => void
  onVerPerfil: (id: string) => void
}

export default function TecnicosPanel({
  puedeCrear,
  onNuevo,
  onEditar,
  onEliminar,
  onVerPerfil,
}: Props) {
  const municipios = useAppStore(s => s.municipios)
  const [busqueda, setBusqueda] = useState('')

  // ── Técnicos ───────────────────────────────────────────────────────────
  const {
    data: tecnicos = [],
    isLoading,
  } = useQuery<TecnicoCampo[]>({
    queryKey: ['tecnicos'],
    queryFn: () => GET('/social/tecnicos'),
  })

  // ── Filtro de técnicos ─────────────────────────────────────────────────
  const filtrados = tecnicos.filter(p => {
    const nombre = nombreCompleto(
      p.nombre_completo
    )

    const texto = [
      nombre,
      p.email
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return texto.includes(busqueda.toLowerCase())
  })

  // ── Columnas de técnicos ───────────────────────────────────────────────
  const columnas: Columna<TecnicoCampo>[] = [  
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
      render: p => (p.activo ? 'Sí' : 'No'),
      hideOnMobile: true,
    },
    {
      key: 'institucion',
      header: 'Institución',
      render: p => p.institucion || '—',
      hideOnMobile: true,
    },
    {
      key: 'especialidad',
      header: 'Especialidad',
      render: p => p.especialidad || '—',
      hideOnMobile: true,
    }
  ]

  return (
    <>
      <header className={styles.header}>
        <div>
          <h1 className={styles.titulo}>
            Técnicos
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
              + Nuevo técnico
            </Button>
          )}
        </div>
      </header>

      <div style={{ marginTop: 16 }} />

      <Tabla
        datos={filtrados}
        columnas={columnas}
        cargando={isLoading}
        vacio="No hay técnicos registrados"
        onRowClick={p => onVerPerfil(p.id)}
        acciones={p => (
          <div className={styles.acciones}>
            {/* TODO BACKEND:
                Habilitar edición cuando exista PUT /tecnicos/{id}. */}
            <Button
              variante="ghost"
              tamaño="sm"
              onClick={() => onEditar(p)}
            >
              ✏️
            </Button>

            {/* TODO BACKEND:
                Habilitar eliminación cuando exista DELETE /tecnicos/{id}. */}
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