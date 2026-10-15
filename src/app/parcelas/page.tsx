
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { GET } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'
import { useRolGuard } from '@/hooks/useRolGuard'

import AdminShell from '@/components/dashboard/AdminShell'
import AccessGuardScreen from '@/components/ui/AccessGuardScreen'
import ModuleHero from '@/components/ui/ModuleHero'
import Tabla, { type Columna } from '@/components/ui/Tabla'
import Paginacion from '@/components/ui/Paginacion'
import SearchInput from '@/components/ui/SearchInput'

import styles from './parcelas.module.css'

const ITEMS_POR_PAGINA = 10

interface Parcela {
    id: string
    nombre: string
    superficie_ha: string | number | null
    sistema_manejo_id: number | string | null
    tenencia: string | null
    topografia: string | null
    productor_id: string | null
    ubicacion_id: string | null
    poligono: string | null
    densidad_plantas_ha: number | null
    observaciones_sitio: string | null
    creado_en: string | null
    actualizado_en: string | null
}

function toArray<T>(data: unknown): T[] {
    if (Array.isArray(data)) return data as T[]

    if (!data || typeof data !== 'object') return []

    const d = data as Record<string, unknown>

    if (Array.isArray(d.items)) return d.items as T[]
    if (Array.isArray(d.results)) return d.results as T[]
    if (Array.isArray(d.resultados)) return d.resultados as T[]

    return []
}

function formatearSuperficie(
    superficie: Parcela['superficie_ha']
): string {
    if (superficie == null || superficie === '') return '—'

    const valor = Number(superficie)

    if (!Number.isFinite(valor)) return '—'

    return `${valor.toLocaleString('es-MX', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
    })} ha`
}

function formatearDensidad(
    densidad: Parcela['densidad_plantas_ha']
): string {
    if (densidad == null) return '—'

    return `${densidad.toLocaleString('es-MX')} plantas/ha`
}

function normalizarTexto(valor: string | null | undefined): string {
    return (valor ?? '').trim().toLocaleLowerCase('es-MX')
}

export default function ParcelasPage() {
    const router = useRouter()

    const accesoPermitido = useRolGuard([
        'administrador',
        'investigador',
        'tecnico_campo',
    ])

    const usuario = useAppStore((state) => state.usuario)

    const [parcelas, setParcelas] = useState<Parcela[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [busqueda, setBusqueda] = useState('')
    const [pagina, setPagina] = useState(1)

    // ─────────────────────────────────────────────
    // Cargar parcelas
    // ─────────────────────────────────────────────

    useEffect(() => {
        let activa = true

        const cargarParcelas = async () => {
            try {
                setCargando(true)
                setError(null)

                const data = await GET('/parcelas')

                if (!activa) return

                setParcelas(toArray<Parcela>(data))
            } catch (err) {
                console.error('Error cargando parcelas:', err)

                if (!activa) return

                setError(
                    err instanceof Error
                        ? err.message
                        : 'No fue posible cargar las parcelas.'
                )
            } finally {
                if (activa) {
                    setCargando(false)
                }
            }
        }

        cargarParcelas()

        return () => {
            activa = false
        }
    }, [])

    // ─────────────────────────────────────────────
    // Búsqueda
    // ─────────────────────────────────────────────

    const resultados = useMemo(() => {
        const termino = normalizarTexto(busqueda)

        if (!termino) return parcelas

        return parcelas.filter((parcela) => {
            const valores = [
                parcela.id,
                parcela.nombre,
                parcela.tenencia,
                parcela.topografia,
                parcela.superficie_ha,
                parcela.densidad_plantas_ha,
                parcela.productor_id,
                parcela.ubicacion_id,
                parcela.observaciones_sitio,
            ]

            return valores.some((valor) =>
                normalizarTexto(String(valor ?? '')).includes(termino)
            )
        })
    }, [parcelas, busqueda])

    // ─────────────────────────────────────────────
    // Paginación
    // ─────────────────────────────────────────────

    const totalPaginas = Math.max(
        1,
        Math.ceil(resultados.length / ITEMS_POR_PAGINA)
    )

    const resultadosPagina = useMemo(() => {
        const inicio = (pagina - 1) * ITEMS_POR_PAGINA

        return resultados.slice(
            inicio,
            inicio + ITEMS_POR_PAGINA
        )
    }, [resultados, pagina])

    useEffect(() => {
        setPagina(1)
    }, [busqueda])

    useEffect(() => {
        if (pagina > totalPaginas) {
            setPagina(totalPaginas)
        }
    }, [pagina, totalPaginas])

    // ─────────────────────────────────────────────
    // Columnas
    // ─────────────────────────────────────────────

    const columnas: Columna<Parcela>[] = [
        {
            key: 'nombre',
            header: 'Parcela',
            width: '260px',
            render: (row) => (
                <span className={styles.nombreParcela}>
                    {row.nombre || 'Parcela sin nombre'}
                </span>
            ),
        },
        {
            key: 'superficie_ha',
            header: 'Superficie registrada',
            width: '175px',
            nowrap: true,
            render: (row) => formatearSuperficie(row.superficie_ha),
        },
        {
            key: 'tenencia',
            header: 'Tenencia',
            width: '130px',
            render: (row) => row.tenencia || '—',
        },
        {
            key: 'topografia',
            header: 'Topografía',
            width: '140px',
            render: (row) => row.topografia || '—',
        },
        {
            key: 'densidad_plantas_ha',
            header: 'Densidad',
            width: '175px',
            render: (row) => formatearDensidad(
                row.densidad_plantas_ha
            ),
        },
        {
            key: 'id',
            header: 'Ficha',
            width: '130px',
            nowrap: true,
            render: (row) => (
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/parcelas/${row.id}`)
                    }}
                >
                    Ver parcela
                </button>
            ),
        },
    ]

    // ─────────────────────────────────────────────
    // Acceso
    // ─────────────────────────────────────────────

    if (!usuario) return null

    if (!accesoPermitido) {
        return (
            <AccessGuardScreen message="Verificando permisos..." />
        )
    }

    // ─────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────

    return (
        <AdminShell contentPadding="0">
            <main className={styles.page}>
                <ModuleHero
                    eyebrow="🌽 Territorio agrícola"
                    title={
                        <>
                            Registro de <em>parcelas</em>
                        </>
                    }
                    description="Consulta las parcelas agrícolas registradas en la plataforma y accede a su información territorial, historial de cultivo y siembras."
                    stats={[
                        {
                            label: 'Parcelas registradas',
                            value: parcelas.length,
                        },
                    ]}
                />

                {error && (
                    <div className={styles.mensaje} role="alert">
                        <p>{error}</p>

                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => window.location.reload()}
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                <section
                    className={styles.barraBusqueda}
                    aria-label="Buscar parcelas"
                >
                    <div className={styles.busqueda}>
                        <SearchInput
                            value={busqueda}
                            onChange={(e) =>
                                setBusqueda(e.target.value)
                            }
                            placeholder="Buscar por nombre, ID, tenencia o topografía..."
                        />
                    </div>

                    <div className={styles.resultados}>
                        {resultados.length}{' '}
                        {resultados.length === 1
                            ? 'resultado'
                            : 'resultados'}
                    </div>
                </section>

                <Tabla
                    datos={resultadosPagina}
                    columnas={columnas}
                    cargando={cargando}
                    vacio={
                        busqueda
                            ? 'No se encontraron parcelas que coincidan con la búsqueda.'
                            : 'Todavía no hay parcelas registradas.'
                    }
                    infoText={
                        cargando
                            ? undefined
                            : `${resultados.length} parcelas encontradas`
                    }
                    onRowClick={(row) => {
                        router.push(`/parcelas/${row.id}`)
                    }}
                />

                {!cargando && resultados.length > 0 && (
                    <Paginacion
                        paginaActual={pagina}
                        totalPaginas={totalPaginas}
                        onCambiar={setPagina}
                        totalItems={resultados.length}
                        itemsPorPagina={ITEMS_POR_PAGINA}
                    />
                )}
            </main>
        </AdminShell>
    )
}