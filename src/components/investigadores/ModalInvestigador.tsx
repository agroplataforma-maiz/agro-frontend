'use client'

import { useState, useEffect, FormEvent } from 'react'
import { POST } from '@/lib/api'
import type { Investigador } from '@/types'

import Modal from '@/components/ui/Modal'
import Field from '@/components/ui/Field'
import Button from '@/components/ui/Button'

interface Props {
  investigador: Investigador | null
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
interface InvestigadorForm {
  username: string
  email: string
  password: string
  confirmar_password: string
  nombre_completo: string
  institucion?: string
  especialidad?: string
  notas?: string
}

const EMPTY: InvestigadorForm = {
  username: '',
  email: '',
  password: '',
  confirmar_password: '',
  nombre_completo: '',
  institucion: '',
  especialidad: '',
  notas: ''
}

export default function ModalInvestigador({
  investigador,
  onClose,
  onSaved,
}: Props) {
  const [form, setForm] = useState<InvestigadorForm>(() => ({
    ...EMPTY,

    /*
     * Si en el futuro se abre este formulario para edición, estos valores
     * pueden utilizarse como base.
     *
     * Actualmente el backend no tiene PUT /productores/:id, por lo que
     * la edición permanece pendiente.
     */
    nombre_completo: investigador?.nombre_completo ?? ''
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
      nombre_completo: investigador?.nombre_completo ?? ''
    })
  }, [investigador])

  const update =
    (campo: keyof InvestigadorForm) =>
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
      !form.username.trim() ||
      !form.email.trim() ||
      !form.password.trim() ||
      !form.confirmar_password.trim() ||
      !form.nombre_completo.trim() ||
      !form.institucion?.trim() ||
      !form.especialidad?.trim() ||
      !form.notas.trim()
    ) {
      setError('Completa todos los campos requeridos.')
      return
    }

    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    if (form.password !== form.confirmar_password) {
      setError('Las contraseñas no coinciden.')
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
      await POST('/social/investigadores', {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password.trim(),
        nombre_completo: form.nombre_completo.trim(),
        institucion: form.institucion?.trim(),
        especialidad: form.especialidad?.trim(),
        notas: form.notas.trim(),
      })

      onSaved()
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al registrar el investigador'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      titulo={investigador ? 'Editar investigador' : 'Nuevo investigador'}
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
            form="form-investigador"
            cargando={loading}
          >
            {investigador ? 'Guardar cambios' : 'Crear investigador'}
          </Button>
        </>
      }
    >
      <form
        id="form-investigador"
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
            label="username"
            name="username"
            value={form.username}
            onChange={update('username')}
            required
          />

          <Field
            label="email"
            name="email"
            value={form.email}
            onChange={update('email')}
            required
          />

          <Field
            label="Contraseña"
            name="password"
            type="password"
            value={form.password}
            onChange={update('password')}
            required
          />

          <Field
            label="Confirmar contraseña"
            name="confirmar_password"
            type="password"
            value={form.confirmar_password}
            onChange={update('confirmar_password')}
            required
          />

          <Field
            label="Nombre completo"
            name="nombre_completo"
            value={form.nombre_completo}
            onChange={update('nombre_completo')}
            required
          />

          <Field
            label="institucion"
            name="institucion"
            value={form.institucion}
            onChange={update('institucion')}
          />

          <Field
            label="especialidad"
            name="especialidad"
            value={form.especialidad}
            onChange={update('especialidad')}
          />

          <Field
            label="notas"
            name="notas"
            value={form.notas}
            onChange={update('notas')}
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
    </Modal>
  )
}