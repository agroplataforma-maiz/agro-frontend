'use client'

import { useState, useEffect, FormEvent } from 'react'
import { GET } from '@/lib/api'
import { POST, PUT } from '@/lib/api'
import type { Comunidad } from '@/types'
import Modal from '@/components/ui/Modal'

// Hook para detectar si es móvil
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 700);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}
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

import React from 'react';


interface Municipio { id: number; nombre: string }
interface Localidad { id: number; nombre: string }
interface Lengua { id: number; nombre: string }
interface LenguaResponse { count: number; results: Lengua[] }
interface MunicipioResponse { count: number; results: Municipio[] }
interface LocalidadResponse { count: number; results: Localidad[] }

const ModalComunidad = ({ comunidad, onClose, onSaved }: Props) => {
  const [form, setForm] = useState<Partial<Comunidad>>(comunidad ?? EMPTY)
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [localidadesFiltradas, setLocalidadesFiltradas] = useState<Localidad[]>([])
  const [lenguas, setLenguas] = useState<Lengua[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // Cargar lenguas indígenas al montar
  useEffect(() => {
    (async () => {
      try {
        const data: LenguaResponse = await GET('/social/lengua');
        if (data && Array.isArray(data.results)) {
          setLenguas(data.results.filter((l): l is Lengua => l && typeof l.id === 'number' && typeof l.nombre === 'string'));
        } else {
          setLenguas([]);
        }
      } catch {
        setLenguas([]);
      }
    })();
  }, []);

  // Cargar municipios al montar
  useEffect(() => {
    (async () => {
      try {
        const muns: Municipio[] | MunicipioResponse = await GET('/geo/municipio');
        if (Array.isArray(muns)) {
          setMunicipios(muns.filter((m): m is Municipio => m && typeof m.id === 'number' && typeof m.nombre === 'string'));
        } else if (muns && Array.isArray((muns as MunicipioResponse).results)) {
          setMunicipios((muns as MunicipioResponse).results.filter((m): m is Municipio => m && typeof m.id === 'number' && typeof m.nombre === 'string'));
        } else {
          setMunicipios([]);
        }
      } catch {
        setMunicipios([]);
      }
    })();
  }, []);

  // Cuando cambia el municipio, limpiar localidad y cargar localidades del municipio
  const update = (k: keyof Comunidad) =>
    async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      if (k === 'municipio_id') {
        setForm(f => ({ ...f, municipio_id: value ? Number(value) : undefined, localidad_id: undefined }));
        if (value) {
          try {
            const locs: Localidad[] | LocalidadResponse = await GET(`/geo/localidad?municipio_id=${value}`);
            if (Array.isArray(locs)) {
              setLocalidadesFiltradas(locs.filter((l): l is Localidad => l && typeof l.id === 'number' && typeof l.nombre === 'string'));
            } else if (locs && Array.isArray((locs as LocalidadResponse).results)) {
              setLocalidadesFiltradas((locs as LocalidadResponse).results.filter((l): l is Localidad => l && typeof l.id === 'number' && typeof l.nombre === 'string'));
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
        setForm(f => ({ ...f, localidad_id: value ? Number(value) : undefined }));
      } else {
        setForm(f => ({ ...f, [k]: value }));
      }
    }

  // Cargar localidades al abrir modal si ya hay municipio seleccionado (edición)
  useEffect(() => {
    if (form.municipio_id) {
      (async () => {
        try {
          const locs: Localidad[] | LocalidadResponse = await GET(`/geo/localidad?municipio_id=${form.municipio_id}`);
          if (Array.isArray(locs)) {
            setLocalidadesFiltradas(locs.filter((l): l is Localidad => l && typeof l.id === 'number' && typeof l.nombre === 'string'));
          } else if (locs && Array.isArray((locs as LocalidadResponse).results)) {
            setLocalidadesFiltradas((locs as LocalidadResponse).results.filter((l): l is Localidad => l && typeof l.id === 'number' && typeof l.nombre === 'string'));
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

  const isMobile = useIsMobile();
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
      open={!isMobile}
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
            value={form.municipio_id !== undefined && form.municipio_id !== null ? String(form.municipio_id) : ''}
            onChange={update('municipio_id')}
            options={[
              { value: '', label: '— Selecciona —' },
              ...municipios.map(m => ({ value: String(m.id), label: m.nombre })),
            ]}
          />

          <SelectField
            label="Localidad"
            name="localidad_id"
            value={form.localidad_id !== undefined && form.localidad_id !== null ? String(form.localidad_id) : ''}
            onChange={update('localidad_id')}
            options={[
              { value: '', label: '— Selecciona —' },
              ...localidadesFiltradas.map(l => ({ value: String(l.id), label: l.nombre })),
            ]}
          />

          <SelectField
            label="Lengua indígena principal"
            name="lengua_indigena"
            value={form.lengua_indigena ?? ''}
            onChange={update('lengua_indigena')}
            options={[
              { value: '', label: '— Ninguna —' },
              ...lenguas.map(l => ({ value: l.nombre, label: l.nombre }))
            ]}
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

export default ModalComunidad;


