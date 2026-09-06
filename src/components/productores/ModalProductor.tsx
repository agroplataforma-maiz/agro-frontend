'use client'

import { useState, useEffect, FormEvent } from 'react'
import { POST } from '@/lib/api'
import type { Productor } from '@/types'

import Modal from '@/components/ui/Modal'
import Field from '@/components/ui/Field'
import Button from '@/components/ui/Button'

interface Props {
  productor: Productor | null
  onClose: () => void
  onSaved: () => void
}

/*
 * ─────────────────────────────────────────────────────────────────────────
 * FORMULARIO MÍNIMO DE PRODUCTOR
 *
 * El backend actualmente define el alta mediante:
 *
 *   POST /productores
 *
 * Payload mínimo:
 *
 * {
 *   "nombres": "...",
 *   "apellido_paterno": "...",
 *   "apellido_materno": "...",
 *   "telefono": "...",
 *   "correo_electronico": "..."
 * }
 *
 * Estos campos de contacto todavía no forman parte del tipo Productor
 * general de src/types/index.ts, por eso utilizamos un tipo específico
 * para el formulario.
 * ─────────────────────────────────────────────────────────────────────────
 */
interface ProductorForm {
  nombres: string
  apellido_paterno: string
  apellido_materno: string
  telefono: string
  correo_electronico: string
}

const EMPTY: ProductorForm = {
  nombres: '',
  apellido_paterno: '',
  apellido_materno: '',
  telefono: '',
  correo_electronico: '',
}

export default function ModalProductor({
  productor,
  onClose,
  onSaved,
}: Props) {
  const [form, setForm] = useState<ProductorForm>(() => ({
    ...EMPTY,

    /*
     * Si en el futuro se abre este formulario para edición, estos valores
     * pueden utilizarse como base.
     *
     * Actualmente el backend no tiene PUT /productores/:id, por lo que
     * la edición permanece pendiente.
     */
    nombres: productor?.nombres ?? '',
    apellido_paterno: productor?.apellido_paterno ?? '',
    apellido_materno: productor?.apellido_materno ?? '',
  }))

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  /*
   * Actualizar el formulario cuando cambia el productor seleccionado.
   *
   * Actualmente solamente se utiliza la creación, pero conservamos este
   * comportamiento porque el componente seguirá siendo reutilizable cuando
   * exista la edición en backend.
   */
  useEffect(() => {
    setForm({
      ...EMPTY,
      nombres: productor?.nombres ?? '',
      apellido_paterno: productor?.apellido_paterno ?? '',
      apellido_materno: productor?.apellido_materno ?? '',
    })
  }, [productor])

  const update =
    (campo: keyof ProductorForm) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement |
        HTMLSelectElement |
        HTMLTextAreaElement
      >
    ) => {
      const value = e.target.value

      setForm(actual => ({
        ...actual,
        [campo]: value,
      }))
    }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    setError('')

    /*
     * Validación mínima en frontend.
     *
     * Nombres y ambos apellidos forman parte del registro mínimo definido.
     */
    if (
      !form.nombres.trim() ||
      !form.apellido_paterno.trim() ||
      !form.apellido_materno.trim() ||
      !form.telefono.trim() ||
      !form.correo_electronico.trim()
    ) {
      setError('Completa todos los campos requeridos.')
      return
    }

    setLoading(true)

    try {
      /*
       * ── ALTA FUNCIONAL ───────────────────────────────────────────────────
       *
       * Endpoint confirmado por el backend:
       *
       *   POST /productores
       *
       * Se envía únicamente el JSON mínimo requerido.
       *
       * No se envían:
       * - contraseña
       * - rol
       * - usuario
       * - municipio
       * - localidad
       * - parcela
       * - fecha de nacimiento
       * - género
       * - experiencia
       * - tipo de productor
       *
       * Esos datos podrán incorporarse posteriormente cuando formen parte
       * del flujo correspondiente.
       */
      await POST('/productores', {
        nombres: form.nombres.trim(),
        apellido_paterno: form.apellido_paterno.trim(),
        apellido_materno: form.apellido_materno.trim(),
        telefono: form.telefono.trim(),
        correo_electronico: form.correo_electronico.trim(),
      })

      onSaved()
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al registrar el productor'
      )
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
          <Button
            variante="secundario"
            type="button"
            onClick={onClose}
          >
            Cancelar
          </Button>

          <Button
            variante="primario"
            type="submit"
            form="form-productor"
            cargando={loading}
          >
            {productor ? 'Guardar cambios' : 'Crear productor'}
          </Button>
        </>
      }
    >
      <form
        id="form-productor"
        onSubmit={handleSubmit}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
          }}
        >
          <Field
            label="Nombres"
            name="nombres"
            value={form.nombres}
            onChange={update('nombres')}
            required
          />

          <Field
            label="Apellido paterno"
            name="apellido_paterno"
            value={form.apellido_paterno}
            onChange={update('apellido_paterno')}
            required
          />

          <Field
            label="Apellido materno"
            name="apellido_materno"
            value={form.apellido_materno}
            onChange={update('apellido_materno')}
            required
          />

          <Field
            label="Teléfono"
            name="telefono"
            type="tel"
            value={form.telefono}
            onChange={update('telefono')}
            required
          />

          <Field
            label="Correo electrónico"
            name="correo_electronico"
            type="email"
            value={form.correo_electronico}
            onChange={update('correo_electronico')}
            required
          />
        </div>

        {error && (
          <p
            style={{
              color: 'var(--rojo)',
              marginTop: 12,
            }}
          >
            {error}
          </p>
        )}
      </form>

      {/*
        ───────────────────────────────────────────────────────────────────
        FUNCIONALIDADES FUTURAS — NO ELIMINAR

        El componente original permitía editar productores mediante:

          PUT /core/productor/:id

        Ese endpoint no está disponible actualmente.

        Por eso, en esta etapa el componente solamente implementa:

          POST /productores

        Cuando exista el endpoint de edición, se deberá restaurar la
        bifurcación del submit:

          if (productor?.id) {
            await PUT(`/productores/${productor.id}`, form)
          } else {
            await POST('/productores', form)
          }

        También se conservan conceptualmente los campos adicionales que
        existían anteriormente (fecha de nacimiento, género, experiencia,
        municipio, localidad, tipo de productor, comunidad), pero no se
        muestran porque NO forman parte del JSON mínimo actual de alta.

        Esto es intencional: primero implementamos el contrato actual del
        backend y posteriormente ampliamos el formulario cuando esos datos
        estén definidos para este flujo.
        ───────────────────────────────────────────────────────────────────
      */}
    </Modal>
  )
}