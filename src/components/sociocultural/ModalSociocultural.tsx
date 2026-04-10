// ModalSociocultural: modal simple para admin/sociocultural
import React from 'react'
import Button from '@/components/ui/Button'

import type { RegistroSociocultural } from '@/hooks/useSociocultural'


interface Props {
  registro?: RegistroSociocultural | null
  onClose: () => void
  onSaved: () => void
}

export default function ModalSociocultural({ registro, onClose, onSaved }: Props) {
  // Aquí iría el formulario real
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 320 }}>
        <h3>{registro ? 'Editar registro' : 'Nuevo registro'}</h3>
        <p>Formulario aquí...</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <Button variante="ghost" tamaño="sm" onClick={onClose}>Cancelar</Button>
          <Button variante="primario" tamaño="sm" onClick={onSaved}>Guardar</Button>
        </div>
      </div>
    </div>
  )
}
