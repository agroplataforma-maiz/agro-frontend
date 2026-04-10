// TablaSociocultural: tabla simple para admin/sociocultural
import Tabla, { Columna } from '@/components/ui/Tabla'
import Button from '@/components/ui/Button'

import type { RegistroSociocultural } from '@/hooks/useSociocultural'

interface Props {
  registros: (RegistroSociocultural & { id: number })[]
  onEdit?: (registro: RegistroSociocultural & { id: number }) => void
  onDelete?: (id: number) => void
  vacio?: string
}

export default function TablaSociocultural({ registros, onEdit, onDelete, vacio }: Props) {
  const columnas: Columna<RegistroSociocultural & { id: number }>[] = [
    { key: 'id', header: 'ID', width: '10%' },
    { key: 'territorio.comunidad', header: 'Comunidad', width: '55%', render: row => row.territorio.comunidad },
    { key: 'productor.productor_id', header: 'Productor', width: '35%', render: row => row.productor.productor_id },
  ]
  return (
    <Tabla
      datos={registros}
      columnas={columnas}
      vacio={vacio || 'No hay comunidades registradas'}
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
            onClick={() => onDelete?.(row.id)}
          >
            🗑️
          </Button>
        </div>
      )}
    />
  )
}
