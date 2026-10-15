
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MapaUbicacion from '@/components/mapa/MapaUbicacion'
import { GET } from '@/lib/api'
import AdminShell from '@/components/dashboard/AdminShell'
import AccessGuardScreen from '@/components/ui/AccessGuardScreen'
import { useRolGuard } from '@/hooks/useRolGuard'
import { useAppStore } from '@/store/useAppStore'
import type { FeatureCollection, Polygon, MultiPolygon } from 'geojson'
import styles from './ficha.module.css'

interface Parcela {
    id: string
    nombre?: string | null
    superficie_ha?: number | string | null
    sistema_manejo_id?: string | number | null
    tenencia?: string | null
    topografia?: string | null
    productor_id?: string | null
    ubicacion_id?: string | null
    poligono?: string | null
    densidad_plantas_ha?: number | string | null
    observaciones_sitio?: string | null
    creado_en?: string | null
    actualizado_en?: string | null
}

interface Ubicacion {
    id: string
    latitud?: number | string | null
    longitud?: number | string | null
    altitud_m?: number | string | null
    precision_gps?: number | string | null
    nombre?: string | null
    municipio?: string | null
}

interface MedioParcela {
    id: string
    parcela_id: string
    ubicacion_id?: string | null
    ubicacion?: {
        latitud?: number | string | null
        longitud?: number | string | null
        altitud_m?: number | string | null
    } | null
    tipo_medio?: string | null
    subtipo?: string | null
    nombre_archivo?: string | null
    formato?: string | null
    descripcion?: string | null
    fecha_captura?: string | null
    url_temporal?: string | null
}

interface Siembra {
    id: string
    parcela_id?: string | null
    germoplasma_id?: string | null
    fecha_siembra?: string | null
    fecha_corte?: string | null
    fecha_cosecha?: string | null
    densidad?: number | string | null
    rendimiento_kg_ha?: number | string | null
    ciclo_agricola?: string | null
    [key: string]: unknown
}

interface Germoplasma {
    id: string
    nombre_local?: string | null
    codigo_accesion?: string | null
    identificador?: string | null
}

type RegistroFlexible = Record<string, unknown>

/**
 * Convierte valores desconocidos a un tipo compatible con Dato.
 * No intenta representar objetos ni arreglos como texto.
 */
function valorTextoSeguro(valor: unknown): string | null {
    if (typeof valor === 'string' || typeof valor === 'number') {
        return String(valor)
    }

    return null
}

/**
 * Convierte valores desconocidos a un tipo aceptado por numero().
 */
function valorNumeroSeguro(
    valor: unknown
): string | number | null {
    if (typeof valor === 'string' || typeof valor === 'number') {
        return valor
    }

    return null
}

function toArray<T>(data: unknown): T[] {
    if (Array.isArray(data)) return data as T[]

    if (data && typeof data === 'object') {
        const obj = data as Record<string, unknown>

        if (obj.data !== undefined) return toArray<T>(obj.data)

        for (const key of ['items', 'results', 'resultados']) {
            if (Array.isArray(obj[key])) return obj[key] as T[]
        }
    }

    return []
}

function unwrap<T>(data: unknown): T | null {
    if (!data || typeof data !== 'object') return null

    const obj = data as Record<string, unknown>
    const value =
        obj.data && typeof obj.data === 'object'
            ? obj.data
            : obj

    return value as T
}

function texto(valor: unknown): string {
    if (valor === null || valor === undefined || valor === '') {
        return 'No disponible'
    }

    return String(valor)
}

function fechaTexto(valor?: string | null): string {
    if (!valor) return 'Sin fecha registrada'

    const fecha = new Date(valor)

    if (Number.isNaN(fecha.getTime())) return valor

    return fecha.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

function numero(
    valor?: string | number | null,
    decimales = 2
): string {
    if (valor === null || valor === undefined || valor === '') {
        return 'No disponible'
    }

    const n = Number(valor)

    return Number.isFinite(n)
        ? n.toLocaleString('es-MX', {
            maximumFractionDigits: decimales,
        })
        : String(valor)
}

/**
 * Convierte POLYGON y MULTIPOLYGON WKT a GeoJSON.
 * Las coordenadas WKT se interpretan como longitud latitud (X Y).
 */
function wktAGeoJSON(
    wkt?: string | null
): FeatureCollection<Polygon | MultiPolygon> | null {
    if (!wkt) return null

    try {
        const limpio = wkt.trim()
        const esMulti = /^MULTIPOLYGON\s*\(/i.test(limpio)
        const esPolygon = /^POLYGON\s*\(/i.test(limpio)

        if (!esMulti && !esPolygon) return null

        const contenido = limpio
            .replace(/^MULTIPOLYGON\s*/i, '')
            .replace(/^POLYGON\s*/i, '')
            .trim()

        const anillos: number[][][][] = []
        let profundidad = 0
        let inicio = -1
        let anilloActual: number[][][] = []

        for (let i = 0; i < contenido.length; i++) {
            const c = contenido[i]

            if (c === '(') {
                profundidad++

                if (profundidad === (esMulti ? 3 : 2)) {
                    inicio = i + 1
                }
            } else if (c === ')') {
                if (
                    profundidad === (esMulti ? 3 : 2) &&
                    inicio >= 0
                ) {
                    const textoAnillo = contenido.slice(inicio, i)

                    const puntos = textoAnillo
                        .split(',')
                        .map((par) =>
                            par.trim().split(/\s+/).map(Number)
                        )
                        .filter(
                            (p) =>
                                p.length >= 2 &&
                                Number.isFinite(p[0]) &&
                                Number.isFinite(p[1])
                        )

                    if (puntos.length >= 3) {
                        anilloActual.push(puntos)
                    }

                    inicio = -1
                }

                profundidad--

                if (
                    esMulti &&
                    profundidad === 1 &&
                    anilloActual.length
                ) {
                    anillos.push(anilloActual)
                    anilloActual = []
                }
            }
        }

        let geometria: Polygon | MultiPolygon

        if (esMulti) {
            if (!anillos.length) return null

            geometria = {
                type: 'MultiPolygon',
                coordinates: anillos,
            }
        } else {
            if (!anilloActual.length) {
                const coincidencias = [
                    ...contenido.matchAll(/\(([^()]+)\)/g),
                ]

                const anillosPolygon = coincidencias
                    .map((match) =>
                        match[1]
                            .split(',')
                            .map((par) =>
                                par.trim().split(/\s+/).map(Number)
                            )
                    )
                    .filter(
                        (ring) =>
                            ring.length >= 3 &&
                            ring.every(
                                (p) =>
                                    Number.isFinite(p[0]) &&
                                    Number.isFinite(p[1])
                            )
                    )

                if (!anillosPolygon.length) return null

                geometria = {
                    type: 'Polygon',
                    coordinates: anillosPolygon,
                }
            } else {
                geometria = {
                    type: 'Polygon',
                    coordinates: anilloActual,
                }
            }
        }

        return {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: {},
                    geometry: geometria,
                },
            ],
        }
    } catch {
        return null
    }
}

function centroDesdePoligono(
    geojson: FeatureCollection<Polygon | MultiPolygon> | null
): [number, number] | null {
    const puntos: number[][] = []

    geojson?.features.forEach((feature) => {
        const geometria = feature.geometry

        if (geometria.type === 'Polygon') {
            geometria.coordinates.forEach((ring) =>
                puntos.push(...ring)
            )
        } else {
            geometria.coordinates.forEach((polygon) =>
                polygon.forEach((ring) => puntos.push(...ring))
            )
        }
    })

    if (!puntos.length) return null

    const validos = puntos.filter(
        (p) =>
            Number.isFinite(p[0]) &&
            Number.isFinite(p[1])
    )

    if (!validos.length) return null

    return [
        validos.reduce((s, p) => s + p[0], 0) / validos.length,
        validos.reduce((s, p) => s + p[1], 0) / validos.length,
    ]
}

export default function FichaParcelaPage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const usuario = useAppStore((state) => state.usuario)

    const accesoPermitido = useRolGuard([
        'administrador',
        'investigador',
        'tecnico_campo',
    ])

    const [parcela, setParcela] = useState<Parcela | null>(null)
    const [superficie, setSuperficie] =
        useState<RegistroFlexible | null>(null)
    const [historial, setHistorial] =
        useState<RegistroFlexible | null>(null)
    const [siembras, setSiembras] = useState<Siembra[]>([])
    const [germoplasmas, setGermoplasmas] =
        useState<Record<string, Germoplasma>>({})
    const [medios, setMedios] = useState<MedioParcela[]>([])
    const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([])
    const [indiceImagen, setIndiceImagen] = useState(0)
    const [imagenAmpliada, setImagenAmpliada] = useState(false)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!id) return

        let cancelado = false

        async function cargarFicha() {
            setCargando(true)
            setError('')

            try {
                const [
                    parcelasData,
                    superficieData,
                    historialData,
                    siembrasData,
                    mediosData,
                    ubicacionesData,
                ] = await Promise.all([
                    GET('/parcelas'),
                    GET(`/parcelas/${id}/superficie`).catch(() => null),
                    GET(`/parcelas/${id}/historial`).catch(() => null),
                    GET('/agro/siembra').catch(() => []),
                    GET('/medios-parcela').catch(() => []),
                    GET('/ubicaciones').catch(() => []),
                ])

                if (cancelado) return

                const listaParcelas = toArray<Parcela>(parcelasData)
                const encontrada = listaParcelas.find(
                    (p) => p.id === id
                )

                if (!encontrada) {
                    throw new Error(
                        'No se encontró la parcela solicitada.'
                    )
                }

                setParcela(encontrada)
                setSuperficie(
                    unwrap<RegistroFlexible>(superficieData)
                )

                const historialNormalizado =
                    unwrap<RegistroFlexible>(historialData)

                setHistorial(historialNormalizado)

                const listaSiembras = toArray<Siembra>(siembrasData)
                    .filter((s) => s.parcela_id === id)

                setSiembras(listaSiembras)

                setMedios(
                    toArray<MedioParcela>(mediosData)
                        .filter(
                            (m) =>
                                m.parcela_id === id &&
                                m.tipo_medio === 'foto'
                        )
                        .sort(
                            (a, b) =>
                                new Date(
                                    b.fecha_captura || ''
                                ).getTime() -
                                new Date(
                                    a.fecha_captura || ''
                                ).getTime()
                        )
                )

                setUbicaciones(
                    toArray<Ubicacion>(ubicacionesData)
                )

                const idsGermoplasma = [
                    ...new Set(
                        listaSiembras
                            .map((s) => s.germoplasma_id)
                            .filter(
                                (value): value is string =>
                                    Boolean(value)
                            )
                    ),
                ]

                const entradasGermoplasma = await Promise.all(
                    idsGermoplasma.map(async (germoplasmaId) => {
                        try {
                            const respuesta = await GET(
                                `/agro/germoplasma/${germoplasmaId}`
                            )

                            const ficha =
                                unwrap<Germoplasma>(respuesta)

                            return ficha
                                ? [germoplasmaId, ficha] as const
                                : null
                        } catch {
                            return null
                        }
                    })
                )

                if (cancelado) return

                const mapa: Record<string, Germoplasma> = {}

                entradasGermoplasma.forEach((entrada) => {
                    if (entrada) {
                        mapa[entrada[0]] = entrada[1]
                    }
                })

                setGermoplasmas(mapa)
            } catch (err) {
                if (!cancelado) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : 'No fue posible cargar la ficha de parcela.'
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

    const geojson = useMemo(
        () => wktAGeoJSON(parcela?.poligono),
        [parcela?.poligono]
    )

    const centroPoligono = useMemo(
        () => centroDesdePoligono(geojson),
        [geojson]
    )

    const ubicacion = ubicaciones.find(
        (u) => u.id === parcela?.ubicacion_id
    )

    const coordenadas = useMemo(() => {
        if (centroPoligono) return centroPoligono

        if (
            ubicacion?.latitud != null &&
            ubicacion?.longitud != null
        ) {
            return [
                Number(ubicacion.longitud),
                Number(ubicacion.latitud),
            ] as [number, number]
        }

        const medioConCoordenadas = medios.find(
            (m) =>
                m.ubicacion?.latitud != null &&
                m.ubicacion?.longitud != null
        )

        if (medioConCoordenadas?.ubicacion) {
            return [
                Number(medioConCoordenadas.ubicacion.longitud),
                Number(medioConCoordenadas.ubicacion.latitud),
            ] as [number, number]
        }

        return null
    }, [centroPoligono, ubicacion, medios])

    if (!usuario) return null

    if (!accesoPermitido) {
        return (
            <AccessGuardScreen message="Verificando permisos..." />
        )
    }

    if (cargando) {
        return (
            <AdminShell contentPadding="0">
                <main className={styles.page}>
                    <p className={styles.estado}>
                        Cargando ficha de parcela…
                    </p>
                </main>
            </AdminShell>
        )
    }

    if (error || !parcela) {
        return (
            <AdminShell contentPadding="0">
                <main className={styles.page}>
                    <button
                        type="button"
                        className={styles.volver}
                        onClick={() => router.push('/parcelas')}
                    >
                        ← Volver al listado
                    </button>

                    <section className={styles.error}>
                        <h1>No se pudo abrir la ficha</h1>
                        <p>
                            {error ||
                                'No se encontró la parcela solicitada.'}
                        </p>
                    </section>
                </main>
            </AdminShell>
        )
    }

    // superficie_ha proviene de un objeto de valores desconocidos.
    // Se normaliza antes de enviarlo a numero().
    const superficieCalculada = valorNumeroSeguro(
        superficie?.superficie_ha
    )

    const superficieRegistrada = parcela.superficie_ha
    const fotos = medios.filter((m) => Boolean(m.url_temporal))
    const imagenActual = fotos[indiceImagen]

    const abrirMapa = () => {
        if (coordenadas) {
            const [lng, lat] = coordenadas

            window.open(
                `https://www.google.com/maps?q=${lat},${lng}`,
                '_blank',
                'noopener,noreferrer'
            )
        }
    }

    return (
        <AdminShell contentPadding="0">
            <main className={styles.page}>
                <header className={styles.header}>
                    <button
                        type="button"
                        className={styles.volver}
                        onClick={() => router.push('/parcelas')}
                    >
                        ← Volver al listado
                    </button>

                    <span className={styles.etiqueta}>
                        FICHA DIGITAL DE PARCELA
                    </span>

                    <h1>{parcela.nombre || 'Parcela sin nombre'}</h1>

                    <p className={styles.subtitulo}>
                        ID: {parcela.id}
                    </p>
                </header>

                <nav
                    className={styles.navegacion}
                    aria-label="Secciones de la ficha"
                >
                    <a href="#resumen">Resumen</a>
                    <a href="#ubicacion">Ubicación</a>
                    <a href="#historial">Historial</a>
                    <a href="#siembras">Siembras</a>
                    <a href="#medios">Fotografías</a>
                </nav>

                <div className={styles.gridFicha}>
                    <section
                        id="resumen"
                        className={`${styles.panel} ${styles.panelPrincipal}`}
                    >
                        <div className={styles.panelTitulo}>
                            <div>
                                <span className={styles.etiqueta}>
                                    IDENTIFICACIÓN
                                </span>
                                <h2>Datos generales</h2>
                            </div>
                        </div>

                        <div className={styles.datosGrid}>
                            <Dato
                                etiqueta="Nombre"
                                valor={parcela.nombre}
                            />

                            <Dato
                                etiqueta="Superficie calculada"
                                valor={
                                    superficieCalculada != null
                                        ? `${numero(superficieCalculada, 4)} ha`
                                        : null
                                }
                            />

                            <Dato
                                etiqueta="Superficie registrada"
                                valor={
                                    superficieRegistrada != null
                                        ? `${numero(superficieRegistrada, 4)} ha`
                                        : null
                                }
                            />

                            <Dato
                                etiqueta="Tenencia"
                                valor={parcela.tenencia}
                            />

                            <Dato
                                etiqueta="Topografía"
                                valor={parcela.topografia}
                            />

                            <Dato
                                etiqueta="Densidad de plantas"
                                valor={
                                    parcela.densidad_plantas_ha != null
                                        ? `${numero(parcela.densidad_plantas_ha, 0)} plantas/ha`
                                        : null
                                }
                            />

                            <Dato
                                etiqueta="Sistema de manejo (ID)"
                                valor={parcela.sistema_manejo_id}
                            />

                            <Dato
                                etiqueta="Productor (ID)"
                                valor={parcela.productor_id}
                            />

                            <Dato
                                etiqueta="Fecha de registro"
                                valor={fechaTexto(parcela.creado_en)}
                            />

                            <Dato
                                etiqueta="Última actualización"
                                valor={fechaTexto(parcela.actualizado_en)}
                            />
                        </div>

                        {parcela.observaciones_sitio && (
                            <div className={styles.observaciones}>
                                <h3>Observaciones del sitio</h3>
                                <p>{parcela.observaciones_sitio}</p>
                            </div>
                        )}
                    </section>

                    <section
                        id="ubicacion"
                        className={`${styles.panel} ${styles.panelUbicacion}`}
                    >
                        <div className={styles.panelTitulo}>
                            <div>
                                <span className={styles.etiqueta}>
                                    LOCALIZACIÓN
                                </span>
                                <h2>Ubicación de la parcela</h2>
                            </div>
                        </div>

                        {coordenadas ? (
                            <>
                                <div className={styles.datosGrid}>
                                    <Dato
                                        etiqueta="Longitud"
                                        valor={numero(coordenadas[0], 7)}
                                    />

                                    <Dato
                                        etiqueta="Latitud"
                                        valor={numero(coordenadas[1], 7)}
                                    />

                                    <Dato
                                        etiqueta="Altitud"
                                        valor={
                                            ubicacion?.altitud_m != null
                                                ? `${numero(ubicacion.altitud_m)} m`
                                                : null
                                        }
                                    />

                                    <Dato
                                        etiqueta="ID de ubicación"
                                        valor={parcela.ubicacion_id}
                                    />
                                </div>

                                <div className={styles.mapa}>
                                    ```tsx
                                    <div className={styles.mapa}>
                                        <MapaUbicacion
                                            lat={coordenadas[1]}
                                            lng={coordenadas[0]}
                                            poligono={geojson}
                                            interactive
                                            zoom={geojson ? 15 : 13}
                                        />
                                    </div>
                                    ```
                                </div>

                                <button
                                    type="button"
                                    className={styles.botonSecundario}
                                    onClick={abrirMapa}
                                >
                                    Abrir ubicación en Google Maps ↗
                                </button>
                            </>
                        ) : (
                            <div className={styles.vacio}>
                                <strong>
                                    Sin ubicación geográfica disponible
                                </strong>
                                <p>
                                    No se encontró un polígono WKT,
                                    coordenadas asociadas ni coordenadas
                                    en los medios de esta parcela.
                                </p>
                            </div>
                        )}

                        {!geojson && parcela.poligono && (
                            <p className={styles.nota}>
                                Se recibió un polígono, pero no fue posible
                                interpretarlo. Se muestra la ubicación
                                puntual cuando está disponible.
                            </p>
                        )}
                    </section>

                    <section
                        id="historial"
                        className={styles.panel}
                    >
                        <div className={styles.panelTitulo}>
                            <div>
                                <span className={styles.etiqueta}>
                                    ANTECEDENTES
                                </span>
                                <h2>Historial de cultivo</h2>
                            </div>
                        </div>

                        {historial ? (
                            <div className={styles.datosGrid}>
                                <Dato
                                    etiqueta="Años cultivando"
                                    valor={valorTextoSeguro(
                                        historial.anios_cultivando
                                    )}
                                />

                                <Dato
                                    etiqueta="Siempre maíz nativo"
                                    valor={
                                        historial.siempre_maiz_nativo === true
                                            ? 'Sí'
                                            : historial.siempre_maiz_nativo === false
                                                ? 'No'
                                                : null
                                    }
                                />

                                <Dato
                                    etiqueta="Cultivos anteriores"
                                    valor={valorTextoSeguro(
                                        historial.cultivos_anteriores
                                    )}
                                />

                                <Dato
                                    etiqueta="Uso histórico de fertilizantes"
                                    valor={
                                        historial.uso_fertilizantes_hist === true
                                            ? 'Sí'
                                            : historial.uso_fertilizantes_hist === false
                                                ? 'No'
                                                : null
                                    }
                                />

                                <Dato
                                    etiqueta="Detalle de fertilizantes"
                                    valor={valorTextoSeguro(
                                        historial.detalle_fertilizantes
                                    )}
                                />

                                <Dato
                                    etiqueta="Fecha de registro"
                                    valor={fechaTexto(
                                        valorTextoSeguro(
                                            historial.fecha_registro
                                        )
                                    )}
                                />
                            </div>
                        ) : (
                            <div className={styles.vacio}>
                                <strong>
                                    Sin historial disponible
                                </strong>
                                <p>
                                    El servicio no devolvió información
                                    de historial para esta parcela.
                                </p>
                            </div>
                        )}
                    </section>

                    <section
                        id="siembras"
                        className={`${styles.panel} ${styles.panelCompleto}`}
                    >
                        <div className={styles.panelTitulo}>
                            <div>
                                <span className={styles.etiqueta}>
                                    CICLOS AGRÍCOLAS
                                </span>
                                <h2>Siembras registradas</h2>
                            </div>

                            <span className={styles.contador}>
                                {siembras.length} registro(s)
                            </span>
                        </div>

                        {siembras.length ? (
                            <div className={styles.listaSiembras}>
                                {siembras.map((siembra) => {
                                    const germoplasma =
                                        siembra.germoplasma_id
                                            ? germoplasmas[
                                            siembra.germoplasma_id
                                            ]
                                            : undefined

                                    const nombreGermoplasma =
                                        germoplasma?.nombre_local ||
                                        germoplasma?.codigo_accesion ||
                                        germoplasma?.identificador ||
                                        siembra.germoplasma_id

                                    return (
                                        <article
                                            className={styles.siembra}
                                            key={siembra.id}
                                        >
                                            <div className={styles.siembraTitulo}>
                                                <div>
                                                    <span className={styles.etiqueta}>
                                                        GERMOPLASMA
                                                    </span>
                                                    <h3>
                                                        {texto(nombreGermoplasma)}
                                                    </h3>
                                                </div>

                                                {siembra.germoplasma_id && (
                                                    <button
                                                        type="button"
                                                        className={styles.botonSecundario}
                                                        onClick={() =>
                                                            router.push(
                                                                `/germoplasma/${siembra.germoplasma_id}`
                                                            )
                                                        }
                                                    >
                                                        Ver ficha de germoplasma →
                                                    </button>
                                                )}
                                            </div>

                                            <div className={styles.datosGrid}>
                                                <Dato
                                                    etiqueta="Ciclo agrícola"
                                                    valor={siembra.ciclo_agricola}
                                                />

                                                <Dato
                                                    etiqueta="Fecha de siembra"
                                                    valor={fechaTexto(
                                                        siembra.fecha_siembra
                                                    )}
                                                />

                                                <Dato
                                                    etiqueta="Fecha de corte"
                                                    valor={fechaTexto(
                                                        siembra.fecha_corte
                                                    )}
                                                />

                                                <Dato
                                                    etiqueta="Fecha de cosecha"
                                                    valor={fechaTexto(
                                                        siembra.fecha_cosecha
                                                    )}
                                                />

                                                <Dato
                                                    etiqueta="Densidad"
                                                    valor={
                                                        siembra.densidad != null
                                                            ? numero(siembra.densidad, 2)
                                                            : null
                                                    }
                                                />

                                                <Dato
                                                    etiqueta="Rendimiento"
                                                    valor={
                                                        siembra.rendimiento_kg_ha != null
                                                            ? `${numero(siembra.rendimiento_kg_ha, 2)} kg/ha`
                                                            : null
                                                    }
                                                />
                                            </div>
                                        </article>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className={styles.vacio}>
                                <strong>Sin siembras registradas</strong>
                                <p>
                                    No se encontraron siembras asociadas
                                    a esta parcela.
                                </p>
                            </div>
                        )}
                    </section>

                    <section
                        id="medios"
                        className={`${styles.panel} ${styles.panelCompleto}`}
                    >
                        <div className={styles.panelTitulo}>
                            <div>
                                <span className={styles.etiqueta}>
                                    REGISTRO FOTOGRÁFICO
                                </span>
                                <h2>Fotografías de la parcela</h2>
                            </div>

                            <span className={styles.contador}>
                                {fotos.length} fotografía(s)
                            </span>
                        </div>

                        {fotos.length ? (
                            <div className={styles.galeria}>
                                {fotos.map((medio) => (
                                    <button
                                        type="button"
                                        className={styles.tarjetaImagen}
                                        key={medio.id}
                                        onClick={() => {
                                            const index = fotos.findIndex(
                                                (f) => f.id === medio.id
                                            )

                                            setIndiceImagen(index)
                                            setImagenAmpliada(true)
                                        }}
                                    >
                                        <img
                                            src={medio.url_temporal!}
                                            alt={
                                                medio.descripcion ||
                                                medio.nombre_archivo ||
                                                'Fotografía de la parcela'
                                            }
                                            loading="lazy"
                                        />

                                        <span className={styles.subtipo}>
                                            {medio.subtipo?.replaceAll('_', ' ') ||
                                                'Fotografía'}
                                        </span>

                                        <strong>
                                            {medio.descripcion ||
                                                medio.nombre_archivo ||
                                                'Sin descripción'}
                                        </strong>

                                        <small>
                                            {fechaTexto(medio.fecha_captura)}
                                        </small>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.vacio}>
                                <strong>
                                    Sin fotografías disponibles
                                </strong>
                                <p>
                                    No se encontraron fotografías con URL
                                    temporal para esta parcela.
                                </p>
                            </div>
                        )}
                    </section>
                </div>

                <footer className={styles.pie}>
                    <span>
                        Agroplataforma Maíz Nativo Huasteca Potosina
                    </span>
                    <span>
                        Ficha de parcela · {parcela.nombre || parcela.id}
                    </span>
                </footer>

                {imagenAmpliada && imagenActual?.url_temporal && (
                    <div
                        className={styles.modalImagen}
                        onClick={() => setImagenAmpliada(false)}
                    >
                        <div
                            className={styles.contenidoImagenAmpliada}
                            role="dialog"
                            aria-modal="true"
                            aria-label="Fotografía ampliada de la parcela"
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
                                src={imagenActual.url_temporal}
                                alt={
                                    imagenActual.descripcion ||
                                    'Fotografía de la parcela'
                                }
                                className={styles.imagenAmpliada}
                            />

                            <p>
                                {imagenActual.descripcion ||
                                    imagenActual.nombre_archivo ||
                                    'Sin descripción'}
                            </p>

                            <small>
                                {fechaTexto(imagenActual.fecha_captura)}
                            </small>

                            {fotos.length > 1 && (
                                <div className={styles.controlesGaleria}>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIndiceImagen(
                                                (indiceImagen - 1 + fotos.length) %
                                                fotos.length
                                            )
                                        }
                                    >
                                        ← Anterior
                                    </button>

                                    <span>
                                        {indiceImagen + 1} / {fotos.length}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIndiceImagen(
                                                (indiceImagen + 1) % fotos.length
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
                    ? String(valor)
                    : 'No disponible'}
            </strong>
        </div>
    )
}