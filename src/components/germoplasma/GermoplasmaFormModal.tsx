
'use client'

import type { FormEvent } from 'react'

import MapPicker from '@/components/mapa/MapPicker'
import Modal from '@/components/ui/Modal'
import Field from '@/components/ui/Field'
import Button from '@/components/ui/Button'

import type {
    Comunidad,
    //TecnicoCampo,
    //Productor,
    UsuarioGermoplasma,
} from '@/types'

import styles from './GermoplasmaFormModal.module.css'

export interface RazaMaiz {
    id: number
    nombre: string
    descripcion: string | null
    tipo_ciclo: string | null
    region_origen: string | null
    codigo: string
    es_nativa: boolean
}

export interface FormularioGermoplasma {
    identificador: string
    codigo_accesion: string
    nombre_local: string
    nombre_asignado_productor: string
    nombre_lengua_orig: string
    raza_id: string
    color_grano_id: string
    ciclo_vegetativo: string
    duracion_dias: string
    estado_conservacion_id: string
    origen_muestra_id: string
    comunidad_id: string
    tecnico_id: string
    productor_id: string
    fuente_id: string
    notas: string
    fecha_registro: string
}

interface GermoplasmaFormModalProps {
    formulario: FormularioGermoplasma
    comunidades: Comunidad[]
    tecnicos: UsuarioGermoplasma[]
    productores: UsuarioGermoplasma[]
    razas: RazaMaiz[]
    lat: number | null
    lng: number | null
    guardando: boolean
    error: string | null
    onCerrar: () => void
    onGuardar: (e: FormEvent<HTMLFormElement>) => void
    onCambiarCampo: (
        campo: keyof FormularioGermoplasma,
        valor: string
    ) => void
    onCambiarComunidad: (id: string) => void
    onCambiarUbicacion: (lat: number, lng: number) => void
}

const ORIGENES_MUESTRA = Array.from(
    { length: 8 },
    (_, i) => i + 1
)

export default function GermoplasmaFormModal({
    formulario,
    comunidades,
    tecnicos,
    productores,
    razas,
    lat,
    lng,
    guardando,
    error,
    onCerrar,
    onGuardar,
    onCambiarCampo,
    onCambiarComunidad,
    onCambiarUbicacion,
}: GermoplasmaFormModalProps) {
    const campo = (
        nombre: keyof FormularioGermoplasma,
        valor: string
    ) => onCambiarCampo(nombre, valor)

    return (
        <Modal
            titulo="Registrar germoplasma"
            onClose={onCerrar}
            ancho="lg"
            footer={
                <>
                    <Button
                        variante="secundario"
                        type="button"
                        onClick={onCerrar}
                        disabled={guardando}
                    >
                        Cancelar
                    </Button>

                    <Button
                        variante="primario"
                        type="submit"
                        form="form-germoplasma"
                        cargando={guardando}
                    >
                        Registrar germoplasma
                    </Button>
                </>
            }
        >
            <form
                id="form-germoplasma"
                onSubmit={onGuardar}
                className={styles.formulario}
            >
                {error && (
                    <p className={styles.error} role="alert">
                        {error}
                    </p>
                )}

                <Field
                    label="Identificador único"
                    name="identificador"
                    value={formulario.identificador}
                    onChange={(e) =>
                        campo('identificador', e.target.value)
                    }
                    placeholder="AMX-AQS-000123"
                    required
                />

                <Field
                    label="Nombre asignado por el productor"
                    name="nombre_asignado_productor"
                    value={formulario.nombre_asignado_productor}
                    onChange={(e) =>
                        campo('nombre_asignado_productor', e.target.value)
                    }
                />

                <div className={styles.formGrid}>
                    <Field
                        label="Código de accesión"
                        name="codigo_accesion"
                        value={formulario.codigo_accesion}
                        onChange={(e) =>
                            campo('codigo_accesion', e.target.value)
                        }
                        required
                    />

                    <Field
                        label="Nombre local"
                        name="nombre_local"
                        value={formulario.nombre_local}
                        onChange={(e) =>
                            campo('nombre_local', e.target.value)
                        }
                        required
                    />

                    <Field
                        label="Nombre en lengua originaria"
                        name="nombre_lengua_orig"
                        value={formulario.nombre_lengua_orig}
                        onChange={(e) =>
                            campo('nombre_lengua_orig', e.target.value)
                        }
                    />

                    <Field
                        label="Ciclo vegetativo"
                        name="ciclo_vegetativo"
                        value={formulario.ciclo_vegetativo}
                        onChange={(e) =>
                            campo('ciclo_vegetativo', e.target.value)
                        }
                    />

                    <Field
                        label="Duración (días)"
                        name="duracion_dias"
                        type="number"
                        value={formulario.duracion_dias}
                        onChange={(e) =>
                            campo('duracion_dias', e.target.value)
                        }
                    />

                    <div className={`form-group ${styles.selectField}`}>
                        <label htmlFor="raza_id">Raza del maíz</label>

                        <select
                            id="raza_id"
                            name="raza_id"
                            className={styles.selectControl}
                            value={formulario.raza_id}
                            onChange={(e) =>
                                onCambiarCampo('raza_id', e.target.value)
                            }
                        >
                            <option value="">Seleccionar raza</option>

                            {razas.map((raza) => (
                                <option key={raza.id} value={String(raza.id)}>
                                    {raza.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Field
                        label="Color de grano (ID de catálogo)"
                        name="color_grano_id"
                        type="number"
                        value={formulario.color_grano_id}
                        onChange={(e) =>
                            campo('color_grano_id', e.target.value)
                        }
                    />

                    <Field
                        label="Estado de conservación (ID)"
                        name="estado_conservacion_id"
                        type="number"
                        value={formulario.estado_conservacion_id}
                        onChange={(e) =>
                            campo('estado_conservacion_id', e.target.value)
                        }
                    />

                    {/* Origen de muestra */}
                    <div className={`form-group ${styles.selectField}`}>
                        <label htmlFor="origen_muestra_id">
                            Origen de muestra
                        </label>

                        <select
                            id="origen_muestra_id"
                            name="origen_muestra_id"
                            className={styles.selectControl}
                            value={formulario.origen_muestra_id}
                            onChange={(e) =>
                                campo('origen_muestra_id', e.target.value)
                            }
                        >
                            <option value="">Seleccionar...</option>

                            {ORIGENES_MUESTRA.map((numero) => (
                                <option key={numero} value={numero}>
                                    {numero}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Comunidad */}
                    <div className={`form-group ${styles.selectField}`}>
                        <label htmlFor="comunidad_id">
                            Comunidad *
                        </label>

                        <select
                            id="comunidad_id"
                            name="comunidad_id"
                            className={styles.selectControl}
                            value={formulario.comunidad_id}
                            onChange={(e) =>
                                onCambiarComunidad(e.target.value)
                            }
                            required
                        >
                            <option value="">
                                Seleccionar comunidad...
                            </option>

                            {comunidades.map((comunidad) => (
                                <option
                                    key={comunidad.id}
                                    value={comunidad.id}
                                >
                                    {comunidad.nombre}
                                    {comunidad.municipio_nombre
                                        ? ` — ${comunidad.municipio_nombre}`
                                        : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Ubicación de colecta */}
                    <section className={styles.seccionUbicacion}>
                        <div className="form-group">
                            <label>
                                Ubicación de colecta *
                            </label>

                            <p className={styles.ayudaUbicacion}>
                                Selecciona en el mapa el punto donde se
                                recolectó el germoplasma.
                            </p>
                        </div>

                        <div className={styles.mapa}>
                            <MapPicker
                                lat={lat ?? undefined}
                                lng={lng ?? undefined}
                                onChange={onCambiarUbicacion}
                            />
                        </div>

                        <div className={styles.coordenadas}>
                            {lat != null && lng != null ? (
                                <>
                                    <strong>Punto seleccionado</strong>
                                    <p>
                                        Latitud: {lat.toFixed(6)}
                                        {' · '}
                                        Longitud: {lng.toFixed(6)}
                                    </p>
                                </>
                            ) : (
                                <span className={styles.sinPunto}>
                                    Todavía no has seleccionado un punto.
                                </span>
                            )}
                        </div>
                    </section>

                    {/* Técnico responsable */}
                    <div className={`form-group ${styles.selectField}`}>
                        <label htmlFor="tecnico_id">
                            Técnico responsable
                        </label>

                        <select
                            id="tecnico_id"
                            name="tecnico_id"
                            className={styles.selectControl}
                            value={formulario.tecnico_id}
                            onChange={(e) =>
                                campo('tecnico_id', e.target.value)
                            }
                        >
                            <option value="">
                                Sin técnico asignado
                            </option>

                            {tecnicos
                                .filter(
                                    (tecnico) =>
                                        tecnico.activo &&
                                        tecnico.rol === 'tecnico_campo'
                                )
                                .map((tecnico) => (
                                    <option
                                        key={tecnico.id}
                                        value={tecnico.id}
                                    >
                                        {tecnico.nombre_completo}
                                        {tecnico.username
                                            ? ` — ${tecnico.username}`
                                            : ''}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* Productor asociado */}
                    <div className={`form-group ${styles.selectField}`}>
                        <label htmlFor="productor_id">
                            Productor asociado
                        </label>

                        <select
                            id="productor_id"
                            name="productor_id"
                            className={styles.selectControl}
                            value={formulario.productor_id}
                            onChange={(e) =>
                                campo('productor_id', e.target.value)
                            }
                        >
                            <option value="">
                                Sin productor asociado
                            </option>

                            {productores
                                .filter(
                                    (productor) =>
                                        productor.activo &&
                                        productor.rol === 'productor'
                                )
                                .map((productor) => (
                                    <option
                                        key={productor.id}
                                        value={productor.id}
                                    >
                                        {productor.nombre_completo}
                                        {productor.username
                                            ? ` — ${productor.username}`
                                            : ''}
                                        {productor.email
                                            ? ` (${productor.email})`
                                            : ''}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <Field
                        label="Fecha de registro"
                        name="fecha_registro"
                        type="date"
                        value={formulario.fecha_registro}
                        onChange={(e) =>
                            campo('fecha_registro', e.target.value)
                        }
                    />

                    {/* Notas */}
                    <div className={styles.anchoCompleto}>
                        <Field
                            label="Notas"
                            name="notas"
                            as="textarea"
                            rows={4}
                            value={formulario.notas}
                            onChange={(e) =>
                                campo('notas', e.target.value)
                            }
                        />
                    </div>
                </div>
            </form>
        </Modal>
    )
}

