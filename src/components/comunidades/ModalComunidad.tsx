'use client'

import React, { useState } from 'react'
import { POST, PUT } from '@/lib/api'
import type { Comunidad } from '@/types'

import Modal from '@/components/ui/Modal'
import Field from '@/components/ui/Field'
import SelectField from '@/components/ui/SelectField'
import Button from '@/components/ui/Button'
import MapPicker from '@/components/mapa/MapPicker'

import { useMunicipios } from '@/hooks/useMunicipios'
import { useLenguas } from '@/hooks/useLenguas'

interface Props {
  comunidad: Comunidad | null
  onClose: () => void
  onSaved: () => void
}

const STEPS = [
  'Identidad',
  'Sociocultural',
  'Agroecología',
  'Ubicación',
  'Confirmación'
] as const

export default function ModalComunidad({ comunidad, onClose, onSaved }: Props) {

  const { municipios } = useMunicipios()
  const { lenguas } = useLenguas()

  const [step, setStep] = useState(0)

  const [form, setForm] = useState<Partial<Comunidad>>({
    nombre: '',
    nombre_lengua_orig: '',
    tipo: '',
    municipio_id: undefined,

    presencia_maiz_nativo: false,
    presencia_historica_maiz: false,

    diversidad_ecologica_score: 3,
    riqueza_cultural_score: 3,
    prioridad_muestreo: 'media',

    poblacion_total: undefined,
    num_localidades: undefined,

    fuente: 'INEGI 2020',
    activo: true,
  })

  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const back = () => setStep(s => Math.max(s - 1, 0))

  // =========================
  // UPDATE SEGURO (NO OBJETOS)
  // =========================
  const update =
    (k: keyof Comunidad) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {

      let value: any = e.target.value

      if (
        k === 'municipio_id' ||
        k === 'poblacion_total' ||
        k === 'num_localidades' ||
        k === 'diversidad_ecologica_score' ||
        k === 'riqueza_cultural_score'
      ) {
        value = value === '' ? undefined : Number(value)
      }

      if (typeof value === 'object') return

      setForm(prev => ({
        ...prev,
        [k]: value
      }))
    }

  // =========================
  // SUBMIT REAL (SOLO FINAL)
  // =========================
  const handleSubmitFinal = async () => {

    const payload = {
      ...form,
      latitud: lat,
      longitud: lng,
    }

    setLoading(true)
    setError('')

    try {
      if (comunidad?.id) {
        await PUT(`/core/comunidad/${comunidad.id}`, payload)
      } else {
        await POST(`/core/comunidad`, payload)
      }

      onSaved()
    } catch (err: any) {
      setError(err?.message ?? 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  const municipioNombre =
    municipios.find(m => m.id === form.municipio_id)?.nombre ?? ''

  const lenguaNombre = form.nombre_lengua_orig ?? ''

  return (
    <Modal
      titulo={comunidad ? 'Editar comunidad' : 'Nueva comunidad'}
      onClose={onClose}
      ancho="lg"
      open={true}
      footer={null}
    >

      {/* HEADER WIZARD */}
      <div style={{ marginBottom: 16 }}>
        <strong>Paso {step + 1} de {STEPS.length}</strong>
        <div style={{ fontSize: 14, opacity: 0.7 }}>
          {STEPS[step]}
        </div>
      </div>

      {/* 🚨 IMPORTANTE: NO submit HTML */}
      <form onSubmit={(e) => e.preventDefault()}>

        {/* ================= STEP 1 ================= */}
        {step === 0 && (
          <>
            <Field
              label="Nombre"
              value={form.nombre ?? ''}
              onChange={update('nombre')}
            />

            <SelectField
              label="Tipo"
              value={form.tipo ?? ''}
              onChange={update('tipo')}
              options={[
                { value: '', label: '— Selecciona —' },
                { value: 'indigena', label: 'Indígena' },
                { value: 'campesina', label: 'Campesina' },
                { value: 'ejidal', label: 'Ejidal' },
                { value: 'mixta', label: 'Mixta' },
                { value: 'urbana', label: 'Urbana' },
                { value: 'otro', label: 'Otro' },
              ]}
            />
          </>
        )}

        {/* ================= STEP 2 ================= */}
        {step === 1 && (
          <>
            <SelectField
              label="Lengua originaria"
              value={form.nombre_lengua_orig ?? ''}
              onChange={update('nombre_lengua_orig')}
              options={[
                { value: '', label: '— Selecciona —' },
                ...lenguas.map(l => ({
                  value: l.nombre,
                  label: l.nombre
                }))
              ]}
            />

            <Field
              label="Población"
              type="number"
              value={form.poblacion_total ?? ''}
              onChange={update('poblacion_total')}
            />

            <Field
              label="Localidades"
              type="number"
              value={form.num_localidades ?? ''}
              onChange={update('num_localidades')}
            />
          </>
        )}

        {/* ================= STEP 3 ================= */}
        {step === 2 && (
          <>
            <label>
              <input
                type="checkbox"
                checked={form.presencia_maiz_nativo ?? false}
                onChange={e =>
                  setForm(f => ({
                    ...f,
                    presencia_maiz_nativo: e.target.checked
                  }))
                }
              />
              Maíz nativo
            </label>

            <label>
              <input
                type="checkbox"
                checked={form.presencia_historica_maiz ?? false}
                onChange={e =>
                  setForm(f => ({
                    ...f,
                    presencia_historica_maiz: e.target.checked
                  }))
                }
              />
              Histórica
            </label>

            <SelectField
              label="Diversidad"
              value={String(form.diversidad_ecologica_score ?? 3)}
              onChange={update('diversidad_ecologica_score')}
              options={[1,2,3,4,5].map(n => ({
                value: String(n),
                label: String(n)
              }))}
            />

            <SelectField
              label="Riqueza cultural"
              value={String(form.riqueza_cultural_score ?? 3)}
              onChange={update('riqueza_cultural_score')}
              options={[1,2,3,4,5].map(n => ({
                value: String(n),
                label: String(n)
              }))}
            />
          </>
        )}

        {/* ================= STEP 4 ================= */}
        {step === 3 && (
          <>
            <Button
              type="button"
              variante="secundario"
              onClick={() => {
                navigator.geolocation.getCurrentPosition(pos => {
                  setLat(pos.coords.latitude)
                  setLng(pos.coords.longitude)
                })
              }}
            >
              📡 Ubicación actual
            </Button>

            <MapPicker
              lat={lat ?? undefined}
              lng={lng ?? undefined}
              onChange={(lat, lng) => {
                setLat(lat)
                setLng(lng)
              }}
            />
          </>
        )}

        {/* ================= STEP 5 ================= */}
        {step === 4 && (
          <div style={{ fontSize: 14 }}>
            <p><b>Nombre:</b> {form.nombre}</p>
            <p><b>Tipo:</b> {form.tipo}</p>

            {/* 🚨 FIX OBJETO */}
            <p><b>Municipio:</b> {municipioNombre}</p>

            <p><b>Lengua:</b> {lenguaNombre}</p>

            <p><b>Población:</b> {form.poblacion_total}</p>
            <p><b>Maíz:</b> {form.presencia_maiz_nativo ? 'Sí' : 'No'}</p>
            <p><b>Ubicación:</b> {lat}, {lng}</p>
          </div>
        )}

        {/* ================= NAV ================= */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>

          <Button
            type="button"
            variante="secundario"
            onClick={back}
            disabled={step === 0}
          >
            Atrás
          </Button>

          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={next}>
              Siguiente
            </Button>
          ) : (
            <Button
              type="button"
              variante="primario"
              cargando={loading}
              onClick={handleSubmitFinal}
            >
              Guardar comunidad
            </Button>
          )}

        </div>

      </form>

      {error && (
        <p style={{ color: 'red', marginTop: 10 }}>
          {error}
        </p>
      )}

    </Modal>
  )
}