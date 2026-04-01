'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { POST, PUT } from '@/lib/api'
import type { Productor } from '@/types'
import Modal from '@/components/ui/Modal'
import Field from '@/components/ui/Field'
import SelectField from '@/components/ui/SelectField'
import Button from '@/components/ui/Button'

interface Props {
  productor: Productor | null
  onClose: () => void
  onSaved: () => void
}

const EMPTY: Partial<Productor> = {
  nombres: '', apellido_paterno: '', apellido_materno: '',
  fecha_nacimiento: '', genero: '', anios_experiencia: undefined,
  municipio_id: undefined, localidad_id: undefined,
  tipo_productor_id: undefined, comunidad_id: undefined,
}

export default function ModalProductor({ productor, onClose, onSaved }: Props) {
  const municipios     = useAppStore(s => s.municipios)
  const localidades    = useAppStore(s => s.localidades)
  const tiposProductor = useAppStore(s => s.tiposProductor)

  const [form,    setForm]    = useState<Partial<Productor>>(productor ?? EMPTY)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => {
    setForm(productor ?? EMPTY)
  }, [productor])

  const update = (k: keyof Productor) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  const locsFiltradas = localidades.filter(l =>
    !form.municipio_id || l.municipio_id === Number(form.municipio_id)
  )

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (productor?.id) {
        await PUT(`/social/productor/${productor.id}/`, form)
      } else {
        await POST('/social/productor/', form)
      }
      onSaved()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      titulo={productor ? 'Editar productor' : 'Nuevo productor'}
      onClose={onClose}
      ancho="lg"
      footer={
        <>
          <Button variante="secundario" type="button" onClick={onClose}>Cancelar</Button>
          <Button variante="primario" type="submit" form="form-productor" cargando={loading}>
            {productor ? 'Guardar cambios' : 'Crear productor'}
          </Button>
        </>
      }
    >
      <form id="form-productor" onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field label="Nombres" name="nombres" value={form.nombres ?? ''} onChange={update('nombres')} required />
          <Field label="Apellido paterno" name="apellido_paterno" value={form.apellido_paterno ?? ''} onChange={update('apellido_paterno')} required />
          <Field label="Apellido materno" name="apellido_materno" value={form.apellido_materno ?? ''} onChange={update('apellido_materno')} />
          <Field label="Fecha de nacimiento" name="fecha_nacimiento" type="date" value={form.fecha_nacimiento ?? ''} onChange={update('fecha_nacimiento')} />
          <SelectField
            label="Género" name="genero"
            value={form.genero ?? ''}
            onChange={update('genero')}
            options={[
              { value: '', label: '— Selecciona —' },
              { value: 'Masculino', label: 'Masculino' },
              { value: 'Femenino', label: 'Femenino' },
              { value: 'No binario', label: 'No binario' },
              { value: 'Prefiero no decir', label: 'Prefiero no decir' },
            ]}
          />
          <Field label="Años de experiencia" name="anios_experiencia" type="number" value={form.anios_experiencia ?? ''} onChange={update('anios_experiencia')} />
          <SelectField
            label="Tipo de productor" name="tipo_productor_id"
            value={form.tipo_productor_id ?? ''}
            onChange={update('tipo_productor_id')}
            options={[
              { value: '', label: '— Selecciona —' },
              ...tiposProductor.map(t => ({ value: t.id, label: t.nombre })),
            ]}
          />
          <SelectField
            label="Municipio" name="municipio_id"
            value={form.municipio_id ?? ''}
            onChange={update('municipio_id')}
            options={[
              { value: '', label: '— Selecciona —' },
              ...municipios.map(m => ({ value: m.id, label: m.nombre })),
            ]}
          />
          <SelectField
            label="Localidad" name="localidad_id"
            value={form.localidad_id ?? ''}
            onChange={update('localidad_id')}
            options={[
              { value: '', label: '— Selecciona —' },
              ...locsFiltradas.map(l => ({ value: l.id, label: l.nombre })),
            ]}
          />
        </div>
        {error && <p style={{ color: 'var(--rojo)', marginTop: 12 }}>{error}</p>}
      </form>
    </Modal>
  )
}
