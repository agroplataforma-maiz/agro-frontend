// PerfilFenotipo: perfil simple para admin/fenotipo
import React from 'react'
import Button from '@/components/ui/Button'
type Fenotipo = {
  id: number
  nombre: string
  comunidad_nombre?: string
  num_productores?: number
}

interface Props {
  onVolver: () => void
  onEdit?: (id: number) => void
}

// Simulación de datos (en real, fetch por id)
const FAKE: Fenotipo = { id: 1, nombre: 'Ejemplo de fenotipo' }

export default function PerfilFenotipo({ onVolver, onEdit }: Props) {
  // Aquí deberías cargar el fenotipo real por id
  const fenotipo = FAKE // (en real, buscar por id)
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 1px 4px rgba(61,34,8,0.07)' }}>
      <h2>Perfil de Fenotipo</h2>
      <p><b>ID:</b> {fenotipo.id}</p>
      <p><b>Nombre:</b> {fenotipo.nombre}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button variante="ghost" tamaño="sm" onClick={onVolver}>← Volver</Button>
        <Button variante="secundario" tamaño="sm" onClick={() => onEdit?.(fenotipo.id)}>✏️ Editar</Button>
      </div>
    </div>
  )
}
