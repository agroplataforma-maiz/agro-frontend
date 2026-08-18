// src/components/comunidades/TablaComunidades.tsx
'use client'

import Tabla, { Columna } from '@/components/ui/Tabla'
import type { Comunidad } from '@/types'


import Button from '@/components/ui/Button'
import { DEL } from '@/lib/api'

interface Props {
  comunidades: Comunidad[]
  onEdit?: (comunidad: Comunidad) => void
  onDelete?: (id: number) => void
}

export default function TablaComunidades({ comunidades, onEdit, onDelete }: Props) {
  const columnas: Columna<Comunidad>[] = [
    { key: 'nombre', header: 'Comunidad', width: '22%' },
    { key: 'municipio_nombre', header: 'Municipio', width: '18%' },
    { key: 'localidad_nombre', header: 'Localidad', width: '18%' },
    { key: 'lengua_indigena', header: 'Lengua', width: '12%' },
    { key: 'poblacion', header: 'Población', width: '12%', render: c => c.poblacion?.toLocaleString() ?? '—' },
    { key: 'num_productores', header: 'Productores', width: '10%', render: c => c.num_productores ?? '—' },
  ];

  return (
    <Tabla
      datos={comunidades}
      columnas={columnas}
      vacio="No hay comunidades registradas"
      acciones={row => (
        <div style={{ display: 'flex', gap: 6 }}>
          <Button
            variante="secundario"
            tamaño="sm"
            title="Editar"
            onClick={() => onEdit?.(row)}
          >
            ✏️
          </Button>
          <Button
            variante="peligro"
            tamaño="sm"
            title="Eliminar"
            onClick={async () => {
              if (window.confirm('¿Seguro que deseas eliminar esta comunidad?')) {
                await DEL(`/core/comunidad/${row.id}`)
                onDelete?.(row.id)
              }
            }}
          >
            🗑️
          </Button>
        </div>
      )}
    />
  )
}
