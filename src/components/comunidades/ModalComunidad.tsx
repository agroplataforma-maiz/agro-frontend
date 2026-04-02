'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { POST, PUT } from '@/lib/api'
import type { Comunidad } from '@/types'
import Modal from '@/components/ui/Modal'
import Field from '@/components/ui/Field'
import SelectField from '@/components/ui/SelectField'
import Button from '@/components/ui/Button'

interface Props {
  comunidad: Comunidad | null
  onClose: () => void
  onSaved: () => void
}

const EMPTY: Partial<Comunidad> = {
  nombre: '',
  municipio_id: undefined,
  localidad_id: undefined,
  lengua_indigena: '',
  poblacion: undefined,
  notas: '',
}

const LENGUAS = [
  '— Ninguna —',
  'Náhuatl',
  'Tének (Huasteco)',
  'Otomí (Hñähñu)',
  'Tepehua',
  'Otra',
]

export default function ModalComunidad({ comunidad, onClose, onSaved }: Props) {
  const municipios  = useAppStore(s => s.municipios)
  const localidades = useAppStore(s => s.localidades)

  const [form,    setForm]    = useState<Partial<Comunidad>>(comunidad ?? EMPTY)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => {
    setForm(comunidad ?? EMPTY)
    setError('')
  }, [comunidad])

  const update = (k: keyof Comunidad) =>
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
      if (comunidad?.id) {
        await PUT(`/social/comunidad/${comunidad.id}`, form)
      } else {
        await POST('/social/comunidad', form)
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
      titulo={comunidad ? 'Editar comunidad' : 'Nueva comunidad'}
      onClose={onClose}
      ancho="lg"
      footer={
        <>
          <Button variante="secundario" type="button" onClick={onClose}>Cancelar</Button>
          <Button variante="primario" type="submit" form="form-comunidad" cargando={loading}>
            {comunidad ? 'Guardar cambios' : 'Crear comunidad'}
          </Button>
        </>
      }
    >
      <form id="form-comunidad" onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field
              label="Nombre de la comunidad"
              name="nombre"
              value={form.nombre ?? ''}
              onChange={update('nombre')}
              required
            />
          </div>

          <SelectField
            label="Municipio"
            name="municipio_id"
            value={form.municipio_id ?? ''}
            onChange={update('municipio_id')}
            options={[
              { value: '', label: '— Selecciona —' },
              ...municipios.map(m => ({ value: m.id, label: m.nombre })),
            ]}
          />

          <SelectField
            label="Localidad"
            name="localidad_id"
            value={form.localidad_id ?? ''}
            onChange={update('localidad_id')}
            options={[
              { value: '', label: '— Selecciona —' },
              ...locsFiltradas.map(l => ({ value: l.id, label: l.nombre })),
            ]}
          />

          <SelectField
            label="Lengua indígena principal"
            name="lengua_indigena"
            value={form.lengua_indigena ?? ''}
            onChange={update('lengua_indigena')}
            options={LENGUAS.map(l => ({ value: l === '— Ninguna —' ? '' : l, label: l }))}
          />

          <Field
            label="Población aproximada"
            name="poblacion"
            type="number"
            value={form.poblacion ?? ''}
            onChange={update('poblacion')}
          />

          <Field
            label="Latitud"
            name="latitud"
            type="number"
            value={form.latitud ?? ''}
            onChange={update('latitud')}
          />

          <Field
            label="Longitud"
            name="longitud"
            type="number"
            value={form.longitud ?? ''}
            onChange={update('longitud')}
          />
        </div>

        {error && <p style={{ color: 'var(--rojo)', marginTop: 12 }}>{error}</p>}
      </form>
    </Modal>
  )
}
