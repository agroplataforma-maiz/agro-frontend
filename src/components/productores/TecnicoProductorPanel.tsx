
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { GET } from '@/lib/api'

import Tabla, { type Columna } from '@/components/ui/Tabla'
import SearchInput from '@/components/ui/SearchInput'
import type { TecnicoProductor } from '@/types'
import styles from '@/app/productores/productores.module.css'

export default function TecnicoProductorPanel() {
  const [busqueda, setBusqueda] = useState('')

  const {
    data: asignaciones = [],
    isLoading,
  } = useQuery<TecnicoProductor[]>({
    queryKey: ['tecnico-productor'],
    queryFn: () => GET('/social/tecnico-productor'),
  })

  const asignacionesFiltradas = asignaciones.filter(asignacion => {
    const texto = [
      asignacion.id,
      asignacion.tecnico_campo_id,
      asignacion.productor_id,
      asignacion.estado,
      asignacion.notas,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return texto.includes(busqueda.toLowerCase())
  })

  const columnas: Columna<TecnicoProductor>[] = [
    {
      key: 'tecnico_campo_id',
      header: 'Técnico',
      render: asignacion => asignacion.tecnico_campo_id,
    },
    {
      key: 'productor_id',
      header: 'Productor',
      render: asignacion => asignacion.productor_id,
    },
    {
      key: 'estado',
      header: 'Estado',
      render: asignacion => asignacion.estado || '—',
    },
    {
      key: 'fecha_asignacion',
      header: 'Fecha de asignación',
      render: asignacion =>
        asignacion.fecha_asignacion
          ? new Date(asignacion.fecha_asignacion).toLocaleDateString(
              'es-MX',
            )
          : '—',
      hideOnMobile: true,
    },
    {
      key: 'fecha_finalizacion',
      header: 'Fecha de finalización',
      render: asignacion =>
        asignacion.fecha_finalizacion
          ? new Date(
              asignacion.fecha_finalizacion,
            ).toLocaleDateString('es-MX')
          : '—',
      hideOnMobile: true,
    },
    {
      key: 'notas',
      header: 'Notas',
      render: asignacion => asignacion.notas || '—',
      hideOnMobile: true,
    },
  ]

  return (
    <section className={styles.panel}>
      <header className={styles.panelHeader}>
        <div>
          <h2>Asignaciones técnico-productor</h2>
          <p>
            Relación entre técnicos de campo y productores.
          </p>
        </div>

        <SearchInput
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar asignación..."
        />
      </header>

      <Tabla
        datos={asignacionesFiltradas}
        columnas={columnas}
        cargando={isLoading}
        vacio="No hay asignaciones técnico-productor registradas"
      />
    </section>
  )
}
