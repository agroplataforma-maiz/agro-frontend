
'use client'

import MapaUbicacion from '@/components/mapa/MapaUbicacion'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { GET } from '@/lib/api'
import type {
    Germoplasma,
    Comunidad,
    Ubicacion,
    UsuarioGermoplasma,
} from '@/types'

import styles from './ficha.module.css'
import AdminShell from '@/components/dashboard/AdminShell'
import AccessGuardScreen from '@/components/ui/AccessGuardScreen'
import { useRolGuard } from '@/hooks/useRolGuard'
import { useAppStore } from '@/store/useAppStore'

interface RazaMaiz {
    id: number
    nombre: string
    descripcion?: string
    tipo_ciclo?: string
    region_origen?: string
    codigo?: string
    es_nativa?: boolean
}


interface ImagenGermoplasma {
    id: string
    germoplasma_id: string
    codigo_accesion?: string
    nombre_local?: string
    tipo_medio?: string
    subtipo?: string
    nombre_archivo?: string
    nombre_guardado?: string
    formato?: string
    descripcion?: string | null
    url_temporal?: string | null
}

function toArray<T>(data: unknown): T[] {
    if (Array.isArray(data)) return data as T[]

    if (data && typeof data === 'object') {
        const objeto = data as Record<string, unknown>

        for (const clave of ['items', 'results', 'resultados']) {
            if (Array.isArray(objeto[clave])) {
                return objeto[clave] as T[]
            }
        }
    }

    return []
}

export default function FichaGermoplasmaPage() {
    const params = useParams<{ id: string }>()
    const router = useRouter()
    const id = params.id

    const accesoPermitido = useRolGuard([
        'administrador',
        'investigador',
        'tecnico_campo',
    ])

    const [registro, setRegistro] = useState<Germoplasma | null>(null)
    const [comunidades, setComunidades] = useState<Comunidad[]>([])
    const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([])
    const [usuarios, setUsuarios] = useState<UsuarioGermoplasma[]>([])
    const [razas, setRazas] = useState<RazaMaiz[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')


    const [imagenes, setImagenes] = useState<ImagenGermoplasma[]>([])
    const [indiceImagen, setIndiceImagen] = useState(0)
    const [imagenAmpliada, setImagenAmpliada] = useState(false)
    const usuario = useAppStore((state) => state.usuario)

    useEffect(() => {
        if (!id) return

        let cancelado = false

        async function cargarFicha() {
            setCargando(true)
            setError('')

            try {
                const [
                    germoplasmaData,
                    comunidadesData,
                    ubicacionesData,
                    usuariosData,
                    razasData,
                    imagenesData,
                ] = await Promise.all([
                    GET(`/agro/germoplasma/${id}`),
                    GET('/core/comunidades').catch(() => []),
                    GET('/ubicaciones').catch(() => []),
                    GET('/auth/usuarios').catch(() => []),
                    GET('/agro/raza_maiz').catch(() => []),
                    GET(`/germoplasma/${id}/imagenes`).catch(() => []),
                ])

                if (cancelado) return

                // El endpoint individual normalmente devuelve un objeto.
                // También se admite una respuesta envuelta en "data".
                const respuesta = germoplasmaData as
                    | Germoplasma
                    | { data?: Germoplasma }

                const ficha =
                    respuesta &&
                        typeof respuesta === 'object' &&
                        'data' in respuesta &&
                        respuesta.data
                        ? respuesta.data
                        : respuesta as Germoplasma

                if (!ficha?.id) {
                    throw new Error('La respuesta no contiene un registro válido.')
                }

                setRegistro(ficha)
                setComunidades(toArray<Comunidad>(comunidadesData))
                setUbicaciones(toArray<Ubicacion>(ubicacionesData))
                setUsuarios(
                    toArray<UsuarioGermoplasma>(usuariosData).filter(
                        (usuario) => usuario.activo
                    )
                )


                const listaImagenes = toArray<ImagenGermoplasma>(imagenesData)
                    .filter(
                        (imagen) =>
                            imagen.tipo_medio === 'imagen' &&
                            Boolean(imagen.url_temporal)
                    )

                setImagenes(listaImagenes)
                setIndiceImagen(0)

                const razasLista = toArray<RazaMaiz>(razasData)
                setRazas(
                    razasLista.length
                        ? razasLista
                        : toArray<RazaMaiz>(
                            (razasData as { resultados?: RazaMaiz[] })?.resultados
                        )
                )
            } catch (err) {
                if (!cancelado) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : 'No fue posible cargar la ficha digital.'
                    )
                }
            } finally {
                if (!cancelado) setCargando(false)
            }
        }

        cargarFicha()

        return () => {
            cancelado = true
        }
    }, [id])

    if (!usuario) return null

    if (!accesoPermitido) {
        return <AccessGuardScreen message="Verificando permisos..." />
    }

    if (cargando) {
        return (
            <AdminShell contentPadding="0">
                <main className={styles.page}>
                    <p className={styles.estado}>
                        Cargando ficha digital…
                    </p>
                </main>
            </AdminShell>
        )
    }

    if (error || !registro) {
        return (
            <AdminShell contentPadding="0">
                <main className={styles.page}>
                    <button
                        type="button"
                        className={styles.volver}
                        onClick={() => router.push('/germoplasma')}
                    >
                        ← Volver al listado
                    </button>

                    <section className={styles.error}>
                        <h1>No se pudo abrir la ficha</h1>
                        <p>
                            {error || 'No se encontró el registro solicitado.'}
                        </p>
                    </section>
                </main>
            </AdminShell>
        )
    }

    const comunidad = comunidades.find(
        (item) => item.id === registro.comunidad_id
    )

    const ubicacion = ubicaciones.find(
        (item) => item.id === registro.ubicacion_id
    )

    const raza = razas.find(
        (item) => item.id === registro.raza_id
    )

    const tecnico = usuarios.find(
        (item) => item.id === registro.tecnico_id
    )

    const productor = usuarios.find(
        (item) => item.id === registro.productor_id
    )

    const fecha = registro.fecha_registro
        ? new Date(registro.fecha_registro).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
        : 'Sin fecha registrada'

    const coordenadas =
        ubicacion?.latitud != null && ubicacion?.longitud != null
            ? `${ubicacion.latitud}, ${ubicacion.longitud}`
            : 'Sin coordenadas registradas'

    return (
        <AdminShell contentPadding="0">
            <main className={styles.page}>
                <header className={styles.header}>
                    <button
                        type="button"
                        className={styles.volver}
                        onClick={() => router.push('/germoplasma')}
                    >
                        ← Volver al listado
                    </button>

                    <span className={styles.etiqueta}>FICHA DIGITAL</span>

                    <h1>{registro.nombre_local || 'Germoplasma sin nombre'}</h1>

                    <p className={styles.subtitulo}>
                        Identificador: {registro.identificador || 'No disponible'}
                        {' · '}
                        Accesión: {registro.codigo_accesion}
                    </p>
                </header>

                <nav className={styles.navegacion} aria-label="Secciones de la ficha">
                    <a href="#resumen">Resumen</a>
                    <a href="#localizacion">Localización</a>
                    <a href="#caracterizacion">Caracterización</a>
                    <a href="#responsables">Responsables</a>
                </nav>


                <div className={styles.gridFicha}>
                    {/* TARJETA PRINCIPAL: IDENTIDAD BIOLÓGICA */}
                    <section
                        id="resumen"
                        className={`${styles.panel} ${styles.panelIdentidad}`}
                    >

                        <div className={styles.visualMuestra}>
                            <div className={styles.encabezadoMuestra}>
                                <span className={styles.etiqueta}>IDENTIFICADOR</span>
                                <strong className={styles.identificadorMuestra}>
                                    {registro.identificador || 'Sin identificador'}
                                </strong>
                            </div>

                            <div className={styles.galeriaImagenes}>
                                {imagenes.length > 0 ? (
                                    <>
                                        <button
                                            type="button"
                                            className={styles.botonImagen}
                                            onClick={() => setImagenAmpliada(true)}
                                            aria-label="Ampliar fotografía"
                                        >
                                            <img
                                                src={imagenes[indiceImagen].url_temporal!}
                                                /*alt={
                                                    imagenes[indiceImagen].descripcion ||
                                                    `Fotografía de ${registro.nombre_local}`
                                                }*/
                                                className={styles.imagenPrincipal}
                                            />{/*
                                            <span className={styles.indicadorAmpliar}>
                                                Ampliar imagen ↗
                                            </span>*/}
                                        </button>

                                        {imagenes.length > 1 && (
                                            <div className={styles.controlesGaleria}>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setIndiceImagen(
                                                            (indiceImagen - 1 + imagenes.length) %
                                                            imagenes.length
                                                        )
                                                    }
                                                    aria-label="Fotografía anterior"
                                                >
                                                    ← Anterior
                                                </button>

                                                <span>
                                                    {indiceImagen + 1} / {imagenes.length}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setIndiceImagen(
                                                            (indiceImagen + 1) % imagenes.length
                                                        )
                                                    }
                                                    aria-label="Fotografía siguiente"
                                                >
                                                    Siguiente →
                                                </button>
                                            </div>
                                        )}

                                        {/*imagenes[indiceImagen].descripcion && (
                                            <p className={styles.descripcionImagen}>
                                                {imagenes[indiceImagen].descripcion}
                                            </p>
                                        )*/}
                                    </>
                                ) : (
                                    <div className={styles.sinImagen}>
                                        <span aria-hidden="true">🌽</span>
                                        {/*<p>Sin fotografías disponibles</p>*/}
                                    </div>
                                )}
                            </div>

                            <div className={styles.pieMuestra}>
                                <span className={styles.etiqueta}>CÓDIGO DE ACCESIÓN</span>
                                <strong>
                                    {registro.codigo_accesion || 'Sin código de accesión'}
                                </strong>
                            </div>
                        </div>


                        <div className={styles.identidadContenido}>
                            <div className={styles.panelTitulo}>
                                <div>
                                    <span className={styles.etiqueta}>
                                        IDENTIDAD BIOLÓGICA
                                    </span>
                                    <h2>Información general</h2>
                                </div>
                            </div>

                            <div className={styles.datosGrid}>
                                <Dato
                                    etiqueta="Nombre local"
                                    valor={registro.nombre_local}
                                />
                                <Dato
                                    etiqueta="Nombre asignado por el productor"
                                    valor={registro.nombre_asignado_productor}
                                />
                                {
                                    <Dato
                                        etiqueta="Nombre en lengua originaria"
                                        valor={registro.nombre_lengua_orig}
                                    />}
                                <Dato
                                    etiqueta="Raza de maíz"
                                    valor={
                                        raza?.nombre ??
                                        (registro.raza_id != null
                                            ? `Raza ID ${registro.raza_id}`
                                            : null)
                                    }
                                />
                                <Dato
                                    etiqueta="Ciclo vegetativo"
                                    valor={registro.ciclo_vegetativo}
                                />
                                <Dato
                                    etiqueta="Duración"
                                    valor={
                                        registro.duracion_dias != null
                                            ? `${registro.duracion_dias} días`
                                            : null
                                    }
                                />
                                <Dato
                                    etiqueta="Fecha de registro"
                                    valor={fecha}
                                />
                            </div>
                        </div>
                    </section>

                    {/* COLUMNA DERECHA */}
                    <div className={styles.columnaDerecha}>
                        <section
                            id="localizacion"
                            className={styles.panel}
                        >
                            <span className={styles.etiqueta}>PROCEDENCIA</span>

                            <div className={styles.datosGrid}>
                                <Dato
                                    etiqueta="Comunidad"
                                    valor={comunidad?.nombre}
                                />

                                <Dato
                                    etiqueta="Latitud y longitud"
                                    valor={
                                        ubicacion?.latitud != null &&
                                            ubicacion?.longitud != null
                                            ? `${Number(ubicacion.latitud).toFixed(2)}, ${Number(ubicacion.longitud).toFixed(2)}`
                                            : null
                                    }
                                />
                            </div>

                            {ubicacion?.latitud != null &&
                                ubicacion?.longitud != null ? (
                                <>
                                    <div className={styles.minimapa}>
                                        <MapaUbicacion
                                            lat={Number(ubicacion.latitud)}
                                            lng={Number(ubicacion.longitud)}
                                        />
                                    </div>
                                    {/*
                                    <a
                                        className={styles.enlaceMapa}
                                        href={`https://www.google.com/maps?q=${ubicacion.latitud},${ubicacion.longitud}`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Abrir mapa completo ↗
                                    </a>*/}
                                </>
                            ) : (
                                <div className={styles.minimapaVacio}>
                                    <span>Sin ubicación geográfica</span>
                                    <p>
                                        Este registro todavía no tiene coordenadas
                                        para mostrar en el mapa.
                                    </p>
                                </div>
                            )}
                        </section>

                        {/* RESUMEN DE REGISTRO */}
                        <section className={styles.panel}>
                            <span className={styles.etiqueta}>REGISTRO</span>
                            <h2>Datos de la accesión</h2>

                            <div className={styles.datosGrid}>
                                <Dato
                                    etiqueta="Código de accesión"
                                    valor={registro.codigo_accesion}
                                />
                                <Dato
                                    etiqueta="Identificador"
                                    valor={registro.identificador}
                                />
                                <Dato
                                    etiqueta="Estado de conservación"
                                    valor={
                                        registro.estado_conservacion_id != null
                                            ? `ID de catálogo: ${registro.estado_conservacion_id}`
                                            : null
                                    }
                                />
                                <Dato
                                    etiqueta="Estado"
                                    valor={
                                        registro.estado
                                            ? registro.estado.charAt(0).toUpperCase() +
                                            registro.estado.slice(1)
                                            : null
                                    }
                                />
                            </div>
                        </section>
                    </div>

                    {/* CARACTERIZACIÓN */}
                    <section
                        id="caracterizacion"
                        className={`${styles.panel} ${styles.panelMitad}`}
                    >
                        <span className={styles.etiqueta}>CARACTERIZACIÓN</span>
                        <h2>Características registradas</h2>

                        <div className={styles.datosGrid}>
                            <Dato
                                etiqueta="Color del grano"
                                valor={
                                    registro.color_grano_id != null
                                        ? `ID de catálogo: ${registro.color_grano_id}`
                                        : null
                                }
                            />
                            <Dato
                                etiqueta="Origen de la muestra"
                                valor={
                                    registro.origen_muestra_id != null
                                        ? `ID de catálogo: ${registro.origen_muestra_id}`
                                        : null
                                }
                            />
                            <Dato
                                etiqueta="Fuente"
                                valor={
                                    registro.fuente_id != null
                                        ? `ID de catálogo: ${registro.fuente_id}`
                                        : null
                                }
                            />
                        </div>

                        <p className={styles.nota}>
                            Las características fenotípicas y agronómicas adicionales
                            se mostrarán cuando estén disponibles en los servicios
                            correspondientes.
                        </p>
                    </section>

                    {/* RESPONSABLES */}
                    <section
                        id="responsables"
                        className={`${styles.panel} ${styles.panelMitad}`}
                    >
                        <span className={styles.etiqueta}>CUSTODIA Y REGISTRO</span>
                        <h2>Personas responsables</h2>

                        <div className={styles.datosGrid}>
                            <Dato
                                etiqueta="Productor o custodio"
                                valor={productor?.nombre_completo}
                            />
                            <Dato
                                etiqueta="Técnico responsable"
                                valor={tecnico?.nombre_completo}
                            />
                        </div>
                    </section>
                </div>

                <footer className={styles.pie}>
                    <span>Agroplataforma Maíz Nativo Huasteca Potosina</span>
                    <span>Ficha de accesión · {registro.codigo_accesion}</span>
                </footer>


                {imagenAmpliada && imagenes[indiceImagen] && (
                    <div
                        className={styles.modalImagen}
                        onClick={() => setImagenAmpliada(false)}
                    >
                        <div
                            className={styles.contenidoImagenAmpliada}
                            role="dialog"
                            aria-modal="true"
                            aria-label="Fotografía ampliada del germoplasma"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                className={styles.cerrarImagen}
                                onClick={() => setImagenAmpliada(false)}
                                aria-label="Cerrar fotografía"
                            >
                                ✕
                            </button>

                            <img
                                src={imagenes[indiceImagen].url_temporal!}/*
                                alt={
                                    imagenes[indiceImagen].descripcion ||
                                    `Fotografía de ${registro.nombre_local}`
                                }*/
                                className={styles.imagenAmpliada}
                            />

                            {/*imagenes[indiceImagen].descripcion && (
                                <p>{imagenes[indiceImagen].descripcion}</p>
                            )*/}

                            {imagenes.length > 1 && (
                                <div className={styles.controlesGaleria}>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIndiceImagen(
                                                (indiceImagen - 1 + imagenes.length) %
                                                imagenes.length
                                            )
                                        }
                                    >
                                        ← Anterior
                                    </button>
                                    <span>
                                        {indiceImagen + 1} / {imagenes.length}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIndiceImagen(
                                                (indiceImagen + 1) % imagenes.length
                                            )
                                        }
                                    >
                                        Siguiente →
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </main>
        </AdminShell>
    )
}

function Dato({
    etiqueta,
    valor,
}: {
    etiqueta: string
    valor?: string | number | null
}) {
    return (
        <div className={styles.dato}>
            <span>{etiqueta}</span>
            <strong>
                {valor !== undefined && valor !== null && valor !== ''
                    ? valor
                    : 'No disponible'}
            </strong>
        </div>
    )
}