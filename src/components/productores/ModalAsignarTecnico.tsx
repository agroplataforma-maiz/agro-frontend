'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { GET, POST } from '@/lib/api'

import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

import type { Productor, TecnicoCampo } from '@/types'
import styles from './ModalAsignarTecnico.module.css'

interface Props {
  productor: Productor | null
  abierto: boolean
  onClose: () => void
}

interface AsignacionForm {
  tecnico_campo_id: string
  notas: string
}

const FORM_INICIAL: AsignacionForm = {
  tecnico_campo_id: '',
  notas: '',
}

export default function ModalAsignarTecnico({
  productor,
  abierto,
  onClose,
}: Props) {
  const qc = useQueryClient()
  const [datos, setDatos] = useState<AsignacionForm>(FORM_INICIAL)

  const {
    data: tecnicos = [],
    isLoading: cargandoTecnicos,
  } = useQuery<TecnicoCampo[]>({
    queryKey: ['tecnicos'],
    queryFn: () => GET('/social/tecnicos'),
    enabled: abierto,
  })

  const asignarTecnico = useMutation({
    mutationFn: async () => {
      if (!productor) {
        throw new Error('No se seleccionó ningún productor')
      }

      return POST('/social/tecnico-productor', {
        tecnico_campo_id: datos.tecnico_campo_id,
        productor_id: String(productor.id),
        estado: 'activo',
        notas: datos.notas.trim() || null,
      })
    },

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ['tecnico-productor'],
      })

      cerrarFormulario()
    },

    onError: (err: Error) => {
      window.alert(
        err.message || 'Error al asignar el técnico de campo'
      )
    },
  })

  useEffect(() => {
    if (abierto) {
      setDatos(FORM_INICIAL)
    }
  }, [abierto, productor])

  function cerrarFormulario() {
    setDatos(FORM_INICIAL)
    onClose()
  }

  function actualizarCampo(
    campo: keyof AsignacionForm,
    valor: string
  ) {
    setDatos(prev => ({
      ...prev,
      [campo]: valor,
    }))
  }

  function guardarAsignacion() {
    if (!datos.tecnico_campo_id) {
      window.alert('Selecciona un técnico de campo')
      return
    }

    asignarTecnico.mutate()
  }

  const tecnicosActivos = tecnicos.filter(
    tecnico => tecnico.activo !== false
  )

  if (!productor) {
    return null
  }

  const nombreProductor = [
    productor.nombres,
    productor.apellido_paterno,
    productor.apellido_materno,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Modal
      titulo="Asignar técnico de campo"
      ancho="md"
      onClose={cerrarFormulario}
      footer={
        <>
          <Button
            variante="ghost"
            onClick={cerrarFormulario}
            disabled={asignarTecnico.isPending}
          >
            Cancelar
          </Button>

          <Button
            variante="primario"
            onClick={guardarAsignacion}
            disabled={
              asignarTecnico.isPending ||
              cargandoTecnicos ||
              !datos.tecnico_campo_id
            }
          >
            {asignarTecnico.isPending
              ? 'Asignando...'
              : 'Asignar técnico'}
          </Button>
        </>
      }
    >
      <div className={styles.form}>
        <div className={styles.productorSeleccionado}>
          <div className={styles.productorTitulo}>
            Productor seleccionado
          </div>

          <p className={styles.productorNombre}>
            {nombreProductor || 'Sin nombre'}
          </p>
        </div>

        <div className={styles.campo}>
          <label htmlFor="tecnico-campo">
            Técnico de campo
          </label>

          <select
            id="tecnico-campo"
            value={datos.tecnico_campo_id}
            onChange={e =>
              actualizarCampo(
                'tecnico_campo_id',
                e.target.value
              )
            }
            disabled={cargandoTecnicos || asignarTecnico.isPending}
          >
            <option value="">
              {cargandoTecnicos
                ? 'Cargando técnicos...'
                : 'Seleccionar técnico'}
            </option>

            {tecnicosActivos.map(tecnico => (
              <option
                key={String(tecnico.id)}
                value={String(tecnico.id)}
              >
                {tecnico.nombre_completo}
                {tecnico.username
                  ? ` — ${tecnico.username}`
                  : ''}
              </option>
            ))}
          </select>

          {!cargandoTecnicos && tecnicosActivos.length === 0 && (
            <p className={styles.nota}>
              No hay técnicos de campo activos disponibles.
            </p>
          )}
        </div>

        <div className={styles.campo}>
          <label htmlFor="notas-asignacion">
            Notas de la asignación
          </label>

          <textarea
            id="notas-asignacion"
            value={datos.notas}
            onChange={e =>
              actualizarCampo('notas', e.target.value)
            }
            placeholder="Agrega información relevante sobre esta asignación..."
            disabled={asignarTecnico.isPending}
            rows={4}
          />

          <p className={styles.nota}>
            Este campo es opcional. Puedes indicar el motivo de la asignación,
            actividades de seguimiento u otra información relevante.
          </p>
        </div>
      </div>
    </Modal>
  )
}