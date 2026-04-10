// PerfilSociocultural: perfil simple para admin/sociocultural
import React from 'react'
import Button from '@/components/ui/Button'
import type { RegistroSociocultural } from '@/hooks/useSociocultural'

interface Props {
  onVolver: () => void
  onEdit?: (id: number) => void
  registro?: RegistroSociocultural | null
}

export default function PerfilSociocultural({ onVolver, onEdit, registro }: Props) {
  if (!registro) return null
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 1px 4px rgba(61,34,8,0.07)' }}>
      <h2>Perfil Sociocultural</h2>
      <p><b>Comunidad:</b> {registro.territorio.comunidad}</p>
      <p><b>Productor:</b> {registro.productor.productor_id}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button variante="ghost" tamaño="sm" onClick={onVolver}>← Volver</Button>
        <Button variante="secundario" tamaño="sm" onClick={() => onEdit?.(1)}>✏️ Editar</Button>
      </div>
    </div>
  )
}
