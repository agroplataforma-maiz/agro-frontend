'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { GET } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'
import { calcularEdad, dash, nombreCompleto } from '@/lib/utils'

import Tabla, { type Columna } from '@/components/ui/Tabla'
import Button from '@/components/ui/Button'
import SearchInput from '@/components/ui/SearchInput'

import type { Productor } from '@/types'
import styles from '@/app/productores/productores.module.css'

interface Props {
  onEditar: (productor: Productor) => void
  onEliminar: (productor: Productor) => void
  onVerPerfil: (id: string) => void
}

export default function ProductoresPanel({
  onEditar,
  onEliminar,
  onVerPerfil,
}: Props) {
  const municipios = useAppStore(s => s.municipios)
  const [busqueda, setBusqueda] = useState('')

  // ── Productores ───────────────────────────────────────────────────────────
  // El backend todavía no expone GET /productores.
  //
  // Se conserva esta consulta deshabilitada para documentar que la tabla
  // de productores queda pendiente de integración.
  //
  // TODO BACKEND:
  // Implementar GET /productores para poder cargar la lista de productores.
  const {
    data: productores = [],
    isLoading,
  } = useQuery<Productor[]>({
    queryKey: ['productores'],
    queryFn: async () => [],
    enabled: false,
  })

  // ── Filtro de productores ─────────────────────────────────────────────────
  const filtrados = productores.filter(p => {
    const nombre = nombreCompleto(
      p.nombres,
      p.apellido_paterno,
      p.apellido_materno
    )

    return nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  })

  // ── Columnas de productores ───────────────────────────────────────────────
  const columnas: Columna<Productor>[] = [
    {
      key: 'id',
      header: 'ID',
      width: '60px',
      hideOnMobile: true,
      hideOnTablet: true,
    },
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
      key: 'fecha_nacimiento',
      header: 'Edad',
      width: '70px',
      hideOnMobile: true,
      hideOnTablet: true,
      render: p =>
        p.fecha_nacimiento
          ? String(calcularEdad(p.fecha_nacimiento))
          : '—',
    },
    {
      key: 'genero',
      header: 'Género',
      hideOnMobile: true,
      hideOnTablet: true,
      render: p => dash(p.genero),
    },
    {
      key: 'anios_experiencia',
      header: 'Experiencia',
      hideOnMobile: true,
      hideOnTablet: true,
      render: p =>
        p.anios_experiencia
          ? `${p.anios_experiencia} ${
              p.anios_experiencia === 1 ? 'año' : 'años'
            }`
          : '—',
    },
    {
      key: 'municipio_id',
      header: 'Municipio',
      render: p => {
        if (p.municipio_nombre) return p.municipio_nombre

        if (p.municipio_id) {
          return (
            municipios.find(m => m.id === p.municipio_id)?.nombre ?? '—'
          )
        }

        return '—'
      },
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
    </>
  )
}