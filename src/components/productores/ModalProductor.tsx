'use client'

import { useState, useEffect, FormEvent } from 'react'
import { GET } from '@/lib/api'
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

type LocalidadesResponse = { items?: { id: number; nombre: string }[]; results?: { id: number; nombre: string }[] };

export default function ModalProductor({ productor, onClose, onSaved }: Props) {
  const municipios     = useAppStore(s => s.municipios)
  const [localidadesFiltradas, setLocalidadesFiltradas] = useState([])
  const tiposProductor = useAppStore(s => s.tiposProductor)

  const [form,    setForm]    = useState<Partial<Productor>>(productor ?? EMPTY)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => {
    setForm(productor ?? EMPTY)
  }, [productor])


  // Cuando cambia el municipio, limpiar localidad y cargar localidades del municipio
  const update = (k: keyof Productor) =>
    async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      if (k === 'municipio_id') {
        setForm(f => ({ ...f, municipio_id: Number(value), localidad_id: 0 }));
        if (value) {
          try {
            const locs = await GET(`/geo/localidad?municipio_id=${value}`);
            if (Array.isArray(locs)) {
              setLocalidadesFiltradas(locs);
            } else if (typeof locs === 'object' && locs !== null) {
              const l = locs as LocalidadesResponse;
              if (Array.isArray(l.items)) {
                setLocalidadesFiltradas(l.items);
              } else if (Array.isArray(l.results)) {
                setLocalidadesFiltradas(l.results);
              } else {
                setLocalidadesFiltradas([]);
              }
            } else {
              setLocalidadesFiltradas([]);
            }
          } catch {
            setLocalidadesFiltradas([]);
          }
        } else {
          setLocalidadesFiltradas([]);
        }
      } else if (k === 'localidad_id') {
        setForm(f => ({ ...f, localidad_id: Number(value) }));
      } else if (k === 'tipo_productor_id') {
        setForm(f => ({ ...f, tipo_productor_id: Number(value) }));
      } else {
        setForm(f => ({ ...f, [k]: value }));
      }
    }

  // Cargar localidades al abrir modal si ya hay municipio seleccionado (edición)
  useEffect(() => {
    if (form.municipio_id) {
      (async () => {
        try {
          const locs = await GET(`/geo/localidad?municipio_id=${form.municipio_id}`);
          if (Array.isArray(locs)) {
            setLocalidadesFiltradas(locs);
          } else if (typeof locs === 'object' && locs !== null) {
            const l = locs as LocalidadesResponse;
            if (Array.isArray(l.items)) {
              setLocalidadesFiltradas(l.items);
            } else if (Array.isArray(l.results)) {
              setLocalidadesFiltradas(l.results);
            } else {
              setLocalidadesFiltradas([]);
            }
          } else {
            setLocalidadesFiltradas([]);
          }
        } catch {
          setLocalidadesFiltradas([]);
        }
      })();
    } else {
      setLocalidadesFiltradas([]);
    }
  }, [form.municipio_id]);






  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (productor?.id) {
        await PUT(`/social/productor/${productor.id}`, form)
      } else {
        await POST('/social/productor', form)
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
            value={form.municipio_id !== undefined && form.municipio_id !== null ? String(form.municipio_id) : ''}
            onChange={update('municipio_id')}
            options={[
              { value: '', label: '— Selecciona —' },
              ...municipios.map(m => ({ value: String(m.id), label: m.nombre })),
            ]}
          />
          <SelectField
            label="Localidad" name="localidad_id"
            value={form.localidad_id !== undefined && form.localidad_id !== null ? String(form.localidad_id) : ''}
            onChange={update('localidad_id')}
            options={[
              { value: '', label: '— Selecciona —' },
              ...localidadesFiltradas.map(l => ({ value: String(l.id), label: l.nombre })),
            ]}
          />
        </div>
        {error && <p style={{ color: 'var(--rojo)', marginTop: 12 }}>{error}</p>}
      </form>
    </Modal>
  )
}
