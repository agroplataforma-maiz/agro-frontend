// TablaFenotipo: tabla simple para admin/fenotipo
import Tabla, { Columna } from '@/components/ui/Tabla'
import Button from '@/components/ui/Button'
type Fenotipo = {
  id: number
  nombre: string
  comunidad_nombre?: string
  num_productores?: number
}

interface Props {
  fenotipos: Fenotipo[]
  onEdit?: (fenotipo: Fenotipo) => void
  onDelete?: (id: number) => void
  vacio?: string
}

export default function TablaFenotipo({ fenotipos, onEdit, onDelete, vacio }: Props) {
  const columnas: Columna<Fenotipo>[] = [
    { key: 'id', header: 'ID', width: '15%' },
    { key: 'nombre', header: 'Nombre', width: '55%' },
  ]
  return (
    <Tabla
      datos={fenotipos}
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
