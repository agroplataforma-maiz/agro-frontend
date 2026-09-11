'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PATCH } from '@/lib/api'
import type { Usuario } from '@/types'

import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import styles from './ModalVisualizador.module.css'

interface Props {
  usuario: Usuario
  abierto: boolean
  onClose: () => void
}

interface FormProductor {
  apellido_paterno: string
  apellido_materno: string
  fecha_nacimiento: string
  genero: string
  estado_civil: string
  anios_experiencia: string
  telefono: string
  tipo_productor_id: string
  municipio_id: string
}

const FORM_INICIAL: FormProductor = {
  apellido_paterno: '',
  apellido_materno: '',
  fecha_nacimiento: '',
  genero: '',
  estado_civil: '',
  anios_experiencia: '',
  telefono: '',
  tipo_productor_id: '',
  municipio_id: '',
}

export default function ModalVisualizador({
  usuario,
  abierto,
  onClose,
}: Props) {
  const qc = useQueryClient()

  const [datos, setDatos] = useState<FormProductor>(FORM_INICIAL)

  const altaProductor = useMutation({
    mutationFn: async () => {
      return PATCH(
        `/productores/usuarios-visualizadores/${String(usuario.id)}`,
        {
          apellido_paterno: datos.apellido_paterno.trim(),
          apellido_materno: datos.apellido_materno.trim(),
          fecha_nacimiento: datos.fecha_nacimiento || null,
          genero: datos.genero || null,
          estado_civil: datos.estado_civil || null,
          anios_experiencia:
            datos.anios_experiencia === ''
              ? null
              : Number(datos.anios_experiencia),
          telefono: datos.telefono.trim() || null,
          tipo_productor_id:
            datos.tipo_productor_id === ''
              ? null
              : Number(datos.tipo_productor_id),
          comunidad_id: null,
          municipio_id:
            datos.municipio_id === ''
              ? null
              : Number(datos.municipio_id),
          localidad_id: null,
          ubicacion_id: null,
        },
      )
    },

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ['usuarios-visualizadores'],
      })

      qc.invalidateQueries({
        queryKey: ['productores'],
      })

      cerrarFormulario()
    },

    onError: (err: Error) => {
      window.alert(
        err.message ||
          'Error al dar de alta al usuario como productor',
      )
    },
  })

  function cerrarFormulario() {
    setDatos(FORM_INICIAL)
    onClose()
  }

  function actualizarCampo(
    campo: keyof FormProductor,
    valor: string,
  ) {
    setDatos(prev => ({
      ...prev,
      [campo]: valor,
    }))
  }

  function guardarProductor() {
    if (!datos.apellido_paterno.trim()) {
      window.alert('El apellido paterno es obligatorio')
      return
    }

    if (!datos.apellido_materno.trim()) {
      window.alert('El apellido materno es obligatorio')
      return
    }

    if (!datos.fecha_nacimiento) {
      window.alert('La fecha de nacimiento es obligatoria')
      return
    }

    if (!datos.genero) {
      window.alert('El género es obligatorio')
      return
    }

    if (!datos.estado_civil) {
      window.alert('El estado civil es obligatorio')
      return
    }

    if (!datos.tipo_productor_id) {
      window.alert('El tipo de productor es obligatorio')
      return
    }

    if (!datos.municipio_id) {
      window.alert('El municipio es obligatorio')
      return
    }

    altaProductor.mutate()
  }

  return (
    <Modal
      titulo="Dar de alta como productor"
      ancho="md"
      onClose={cerrarFormulario}
      footer={
        <>
          <Button
            variante="ghost"
            onClick={cerrarFormulario}
            disabled={altaProductor.isPending}
          >
            Cancelar
          </Button>

          <Button
            variante="primario"
            onClick={guardarProductor}
            disabled={altaProductor.isPending}
          >
            {altaProductor.isPending
              ? 'Guardando...'
              : 'Dar de alta'}
          </Button>
        </>
      }
    >
      <div className={styles.form}>
        {/* Usuario seleccionado */}
        <div className={styles.usuarioSeleccionado}>
          <div className={styles.usuarioTitulo}>
            Usuario seleccionado
          </div>

          <p className={styles.usuarioDato}>
            {usuario.nombre_completo || usuario.username}
          </p>

          <p className={styles.usuarioDato}>
            Usuario: {usuario.username}
          </p>

        </div>

        {/* Datos del productor */}
        <div>
          <h3 className={styles.seccionTitulo}>
            Datos del productor
          </h3>

          <div className={styles.grid2}>
            <div className={styles.campo}>
              <label htmlFor="apellido_paterno">
                Apellido paterno
              </label>

              <input
                id="apellido_paterno"
                type="text"
                value={datos.apellido_paterno}
                onChange={e =>
                  actualizarCampo(
                    'apellido_paterno',
                    e.target.value,
                  )
                }
              />
            </div>

            <div className={styles.campo}>
              <label htmlFor="apellido_materno">
                Apellido materno
              </label>

              <input
                id="apellido_materno"
                type="text"
                value={datos.apellido_materno}
                onChange={e =>
                  actualizarCampo(
                    'apellido_materno',
                    e.target.value,
                  )
                }
              />
            </div>

            <div className={styles.campo}>
              <label htmlFor="fecha_nacimiento">
                Fecha de nacimiento
              </label>

              <input
                id="fecha_nacimiento"
                type="date"
                value={datos.fecha_nacimiento}
                onChange={e =>
                  actualizarCampo(
                    'fecha_nacimiento',
                    e.target.value,
                  )
                }
              />
            </div>

            <div className={styles.campo}>
              <label htmlFor="genero">
                Género
              </label>

              <select
                id="genero"
                value={datos.genero}
                onChange={e =>
                  actualizarCampo(
                    'genero',
                    e.target.value,
                  )
                }
              >
                <option value="">Selecciona...</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div className={styles.campo}>
              <label htmlFor="estado_civil">
                Estado civil
              </label>

              <select
                id="estado_civil"
                value={datos.estado_civil}
                onChange={e =>
                  actualizarCampo(
                    'estado_civil',
                    e.target.value,
                  )
                }
              >
                <option value="">Selecciona...</option>
                <option value="soltero">Soltero/a</option>
                <option value="casado">Casado/a</option>
                <option value="divorciado">
                  Divorciado/a
                </option>
                <option value="viudo">Viudo/a</option>
                <option value="concubinato">
                  Concubinato
                </option>
              </select>
            </div>

            <div className={styles.campo}>
              <label htmlFor="anios_experiencia">
                Años de experiencia
              </label>

              <input
                id="anios_experiencia"
                type="number"
                min="0"
                value={datos.anios_experiencia}
                onChange={e =>
                  actualizarCampo(
                    'anios_experiencia',
                    e.target.value,
                  )
                }
              />
            </div>

            <div className={styles.campo}>
              <label htmlFor="telefono">
                Teléfono
              </label>

              <input
                id="telefono"
                type="tel"
                value={datos.telefono}
                onChange={e =>
                  actualizarCampo(
                    'telefono',
                    e.target.value,
                  )
                }
              />
            </div>

            <div className={styles.campo}>
              <label htmlFor="tipo_productor_id">
                Tipo de productor
              </label>

              <input
                id="tipo_productor_id"
                type="number"
                min="1"
                value={datos.tipo_productor_id}
                onChange={e =>
                  actualizarCampo(
                    'tipo_productor_id',
                    e.target.value,
                  )
                }
              />
            </div>

            <div className={styles.campo}>
              <label htmlFor="municipio_id">
                Municipio
              </label>

              <input
                id="municipio_id"
                type="number"
                min="1"
                value={datos.municipio_id}
                onChange={e =>
                  actualizarCampo(
                    'municipio_id',
                    e.target.value,
                  )
                }
              />
            </div>
          </div>
        </div>

        <p className={styles.nota}>
          Comunidad, localidad y ubicación todavía no están
          disponibles, por lo que se enviarán como valores nulos.
        </p>
      </div>
    </Modal>
  )
}

