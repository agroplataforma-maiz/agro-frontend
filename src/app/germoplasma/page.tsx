'use client'

import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'

import type { FormularioGermoplasma, RazaMaiz } from '@/components/germoplasma/GermoplasmaFormModal'
import GermoplasmaFormModal from '@/components/germoplasma/GermoplasmaFormModal'

import { useRouter } from 'next/navigation'
import { GET, POST } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'
import styles from './germoplasma.module.css'

import ModuleHero from '@/components/ui/ModuleHero'
import Tabla, { type Columna } from '@/components/ui/Tabla'
import Paginacion from '@/components/ui/Paginacion'
import SearchInput from '@/components/ui/SearchInput'

import AdminShell from '@/components/dashboard/AdminShell'
import AccessGuardScreen from '@/components/ui/AccessGuardScreen'
import { useRolGuard } from '@/hooks/useRolGuard'

import type {
    Comunidad,
    Germoplasma,
    Ubicacion,
    UsuarioGermoplasma,
} from '@/types'

const ITEMS_POR_PAGINA = 10

//const ORIGENES_MUESTRA = Array.from({ length: 8 }, (_, i) => i + 1)

function toArray<T>(data: unknown): T[] {
    if (Array.isArray(data)) return data as T[]

    if (!data || typeof data !== 'object') return []

    const d = data as Record<string, unknown>

    if (Array.isArray(d.items)) return d.items as T[]
    if (Array.isArray(d.results)) return d.results as T[]
    if (Array.isArray(d.resultados)) return d.resultados as T[]

    return []
}

export default function GermoplasmaPage() {
    const router = useRouter()

    const accesoPermitido = useRolGuard([
        'administrador',
        'investigador',
        'tecnico_campo',
    ])

    const usuario = useAppStore((state) => state.usuario)

    const rol = usuario?.rol

    const puedeCrear =
        rol === 'administrador' ||
        rol === 'investigador' ||
        rol === 'tecnico_campo'

    const [germoplasmas, setGermoplasmas] = useState<Germoplasma[]>([])
    const [razas, setRazas] = useState<RazaMaiz[]>([])
    const [comunidades, setComunidades] = useState<Comunidad[]>([])
    //const [tecnicos, setTecnicos] = useState<TecnicoCampo[]>([])
    //const [productores, setProductores] = useState<Productor[]>([])
    const [tecnicos, setTecnicos] = useState<UsuarioGermoplasma[]>([])
    const [productores, setProductores] = useState<UsuarioGermoplasma[]>([])
    const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [busqueda, setBusqueda] = useState('')
    const [pagina, setPagina] = useState(1)

    const [mostrarFormulario, setMostrarFormulario] = useState(false)
    const [guardando, setGuardando] = useState(false)
    const [errorFormulario, setErrorFormulario] = useState<string | null>(null)

    const [lat, setLat] = useState<number | null>(null)
    const [lng, setLng] = useState<number | null>(null)


    const [formulario, setFormulario] = useState<FormularioGermoplasma>({
        identificador: '',
        codigo_accesion: '',
        nombre_local: '',
        nombre_asignado_productor: '',
        nombre_lengua_orig: '',
        raza_id: '',
        color_grano_id: '',
        ciclo_vegetativo: '',
        duracion_dias: '',
        estado_conservacion_id: '',
        origen_muestra_id: '',
        comunidad_id: '',
        tecnico_id: '',
        productor_id: '',
        fuente_id: '',
        notas: '',
        fecha_registro: new Date().toISOString().slice(0, 10),
    })


    const comunidadesPorId = useMemo(() => {
        return new Map(
            comunidades.map((comunidad) => [
                comunidad.id,
                comunidad,
            ])
        )
    }, [comunidades])

    const ubicacionesPorId = useMemo(() => {
        return new Map(
            ubicaciones.map((ubicacion) => [
                ubicacion.id,
                ubicacion,
            ])
        )
    }, [ubicaciones])

    const tecnicosPorUserId = useMemo(() => {
        return new Map(
            tecnicos.map((tecnico) => [
                tecnico.id,
                tecnico,
            ])
        )
    }, [tecnicos])

    const productoresPorId = useMemo(() => {
        return new Map(
            productores.map((productor) => [
                productor.id,
                productor,
            ])
        )
    }, [productores])


    // ─────────────────────────────────────────────
    // Cargar germoplasma
    // ─────────────────────────────────────────────

    const cargarGermoplasma = async () => {
        try {
            setCargando(true)
            setError(null)

            const data = await GET('/agro/germoplasma')

            setGermoplasmas(toArray<Germoplasma>(data))
        } catch (err) {
            console.error('Error cargando germoplasma:', err)

            setError(
                err instanceof Error
                    ? err.message
                    : 'No fue posible cargar el germoplasma.'
            )
        } finally {
            setCargando(false)
        }
    }

    const cargarRazas = async () => {
        try {
            const data = await GET('/agro/raza_maiz')

            setRazas(toArray<RazaMaiz>(data))
        } catch (err) {
            console.error('Error cargando razas de maíz:', err)
        }
    }

    const cargarComunidades = async () => {
        try {
            const data = await GET('/core/comunidades')

            setComunidades(toArray<Comunidad>(data))
        } catch (err) {
            console.error('Error cargando comunidades:', err)
        }
    }

    const cargarUbicaciones = async () => {
        try {
            const data = await GET('/ubicaciones')

            setUbicaciones(toArray<Ubicacion>(data))
        } catch (err) {
            console.error('Error cargando ubicaciones:', err)
        }
    }
    /*
        const cargarTecnicos = async () => {
            try {
                const data = await GET('/social/tecnicos')
    
                setTecnicos(toArray<TecnicoCampo>(data))
            } catch (err) {
                console.error('Error cargando técnicos:', err)
            }
        }
    
        const cargarProductores = async () => {
            try {
                const data = await GET('/productores/lista')
    
                setProductores(toArray<Productor>(data))
            } catch (err) {
                console.error('Error cargando productores:', err)
            }
        }
    */

    const cargarUsuariosGermoplasma = async () => {
        const respuesta = await GET<UsuarioGermoplasma[]>('/auth/usuarios')

        const usuariosActivos = toArray<UsuarioGermoplasma>(respuesta)
            .filter((usuario) => usuario.activo)

        setTecnicos(
            usuariosActivos.filter(
                (usuario) => usuario.rol === 'tecnico_campo'
            )
        )

        setProductores(
            usuariosActivos.filter(
                (usuario) => usuario.rol === 'productor'
            )
        )
    }

    useEffect(() => {
        cargarGermoplasma()
        cargarComunidades()
        cargarUbicaciones()
        //cargarTecnicos()
        //cargarProductores()
        cargarRazas()
        cargarUsuariosGermoplasma()
    }, [])

    // ─────────────────────────────────────────────
    // Búsqueda
    // ─────────────────────────────────────────────

    const resultados = useMemo(() => {
        const termino = busqueda.trim().toLowerCase()

        if (!termino) return germoplasmas

        return germoplasmas.filter((item) => {
            const comunidad = item.comunidad_id
                ? comunidadesPorId.get(item.comunidad_id)
                : undefined

            const colector = item.tecnico_id
                ? tecnicosPorUserId.get(item.tecnico_id)
                : undefined

            const productor = item.productor_id
                ? productoresPorId.get(item.productor_id)
                : undefined

            return [
                item.codigo_accesion,
                item.nombre_local,
                item.nombre_lengua_orig,
                item.ciclo_vegetativo,
                item.notas,
                comunidad?.nombre,
                colector?.nombre_completo,
                colector?.username,
                productor?.nombre_completo,
                productor?.username,
                productor?.email,
            ]
                .filter(Boolean)
                .some((valor) =>
                    String(valor)
                        .toLowerCase()
                        .includes(termino)
                )
        })

    }, [
        germoplasmas,
        busqueda,
        comunidadesPorId,
        tecnicosPorUserId,
        productoresPorId,
    ])

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
    // Formulario
    // ─────────────────────────────────────────────

    const cambiarCampo = (
        campo: keyof typeof formulario,
        valor: string
    ) => {
        setFormulario((actual) => ({
            ...actual,
            [campo]: valor,
        }))
    }

    const cambiarComunidad = (comunidadId: string) => {
        setFormulario((actual) => ({
            ...actual,
            comunidad_id: comunidadId,
        }))
    }



    const limpiarFormulario = () => {
        setFormulario({
            identificador: '',
            codigo_accesion: '',
            nombre_local: '',
            nombre_asignado_productor: '',
            nombre_lengua_orig: '',
            raza_id: '',
            color_grano_id: '',
            ciclo_vegetativo: '',
            duracion_dias: '',
            estado_conservacion_id: '',
            origen_muestra_id: '',
            comunidad_id: '',
            tecnico_id: '',
            productor_id: '',
            fuente_id: '',
            notas: '',
            fecha_registro: new Date().toISOString().slice(0, 10),
        })

        setLat(null)
        setLng(null)
        setErrorFormulario(null)
    }

    const cerrarFormulario = () => {
        if (guardando) return

        setMostrarFormulario(false)
        limpiarFormulario()
    }



    const guardarGermoplasma = async (
        e: FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault()

        if (!puedeCrear) return

        setErrorFormulario(null)

        if (!formulario.identificador.trim()) {
            setErrorFormulario('El identificador único es obligatorio.')
            return
        }

        if (!formulario.codigo_accesion.trim()) {
            setErrorFormulario('El código de acceso es obligatorio.')
            return
        }

        if (!formulario.nombre_local.trim()) {
            setErrorFormulario('El nombre local es obligatorio.')
            return
        }

        if (!formulario.comunidad_id) {
            setErrorFormulario('Selecciona una comunidad.')
            return
        }

        if (!formulario.nombre_asignado_productor.trim()) {
            setErrorFormulario(
                'El nombre asignado por el productor es obligatorio.'
            )
            return
        }

        if (lat == null || lng == null) {
            setErrorFormulario('Selecciona una ubicación en el mapa.')
            return
        }

        try {
            setGuardando(true)

            // 1. Crear una ubicación nueva a partir del punto seleccionado.

            const ubicacion = await POST<{ id: string }>('/ubicaciones', {
                nombre: formulario.nombre_local.trim(),
                tipo_ubicacion: 'germoplasma',
                descripcion: `Ubicación de colecta del germoplasma ${formulario.nombre_local.trim()}`,
                latitud: lat,
                longitud: lng,
                altitud_m: null,
                altitud_fuente: null,
                precision_gps: null,
                municipio_id: null,
                sistema_referencia: 'WGS84',
                fuente_captura_id: null,
                tags: ['germoplasma'],
            })

            if (!ubicacion?.id) {
                throw new Error(
                    'La ubicación se creó sin devolver un identificador.'
                )
            }

            // 2. Registrar el germoplasma con la ubicación recién creada.



            const payload = {
                identificador: formulario.identificador.trim(),

                codigo_accesion: formulario.codigo_accesion.trim(),
                nombre_local: formulario.nombre_local.trim(),

                nombre_asignado_productor:
                    formulario.nombre_asignado_productor.trim() || null,

                nombre_lengua_orig:
                    formulario.nombre_lengua_orig.trim() || null,

                raza_id: formulario.raza_id
                    ? Number(formulario.raza_id)
                    : null,

                color_grano_id: formulario.color_grano_id
                    ? Number(formulario.color_grano_id)
                    : null,

                ciclo_vegetativo:
                    formulario.ciclo_vegetativo.trim() || null,

                duracion_dias: formulario.duracion_dias
                    ? Number(formulario.duracion_dias)
                    : null,

                estado_conservacion_id: formulario.estado_conservacion_id
                    ? Number(formulario.estado_conservacion_id)
                    : null,

                origen_muestra_id: formulario.origen_muestra_id
                    ? Number(formulario.origen_muestra_id)
                    : null,

                comunidad_id: formulario.comunidad_id,
                ubicacion_id: ubicacion.id,

                tecnico_id: formulario.tecnico_id || null,
                productor_id: formulario.productor_id || null,

                fuente_id: formulario.fuente_id
                    ? Number(formulario.fuente_id)
                    : null,

                notas: formulario.notas.trim(),
                estado: 'activo',
                fecha_registro: formulario.fecha_registro || null,
            }


            await POST('/agro/germoplasma', payload)

            await Promise.all([
                cargarGermoplasma(),
                cargarUbicaciones(),
            ])

            setMostrarFormulario(false)
            limpiarFormulario()

            setMostrarFormulario(false)
            limpiarFormulario()
        } catch (err) {
            console.error('Error creando germoplasma:', err)

            setErrorFormulario(
                err instanceof Error
                    ? err.message
                    : 'No fue posible registrar el germoplasma.'
            )
        } finally {
            setGuardando(false)
        }
    }

    // ─────────────────────────────────────────────
    // Columnas
    // ─────────────────────────────────────────────

    const columnas: Columna<Germoplasma>[] = [
        {
            key: 'codigo_accesion',
            header: 'Código de acceso',
            width: '170px',
            nowrap: true,
        },
        {
            key: 'nombre_local',
            header: 'Nombre local',
            width: '220px',
        },
        /*{
            key: 'nombre_lengua_orig',
            header: 'Nombre en lengua originaria',
            width: '220px',
            hideOnTablet: true,
        }*/,
        /*{
            key: 'ciclo_vegetativo',
            header: 'Ciclo vegetativo',
            width: '150px',
        }*/,
        /*{
            key: 'duracion_dias',
            header: 'Duración',
            width: '110px',
            nowrap: true,
            render: (row) =>
                row.duracion_dias != null
                    ? `${row.duracion_dias} días`
                    : '—',
        }*/,
        /*{
            key: 'origen_muestra_id',
            header: 'Origen',
            width: '90px',
            nowrap: true,
            render: (row) =>
                row.origen_muestra_id != null
                    ? String(row.origen_muestra_id)
                    : '—',
        }*/,
        {
            key: 'comunidad_id',
            header: 'Comunidad',
            width: '180px',
            render: (row) => {
                if (!row.comunidad_id) return '—'

                return (
                    comunidadesPorId.get(row.comunidad_id)?.nombre ||
                    'Comunidad no encontrada'
                )
            },
        },
        {
            key: 'ubicacion_id',
            header: 'Ubicación',
            width: '210px',
            hideOnTablet: true,
            render: (row) => {
                if (!row.ubicacion_id) return '—'

                const ubicacion =
                    ubicacionesPorId.get(row.ubicacion_id)

                if (!ubicacion) {
                    return 'Ubicación no encontrada'
                }

                return (
                    <span>
                        {ubicacion.nombre ||
                            'Ubicación sin nombre'}
                        {ubicacion.latitud != null &&
                            ubicacion.longitud != null
                            ? ` (${ubicacion.latitud.toFixed(4)}, ${ubicacion.longitud.toFixed(4)})`
                            : ''}
                    </span>
                )
            },
        },
        {
            key: 'tecnico_id',
            header: 'Técnico responsable',
            width: '180px',
            hideOnTablet: true,
            render: (row) => {
                if (!row.tecnico_id) return '—'

                const tecnico =
                    tecnicosPorUserId.get(row.tecnico_id)

                return (
                    tecnico?.nombre_completo ||
                    'No encontrado'
                )
            },
        },
        {
            key: 'fecha_registro',
            header: 'Registro',
            width: '120px',
            nowrap: true,
            render: (row) =>
                row.fecha_registro
                    ? row.fecha_registro.slice(0, 10)
                    : '—',
        },
        {
            key: 'id',
            header: 'Ficha digital',
            width: '150px',
            nowrap: true,
            render: (row) => (
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/germoplasma/${row.id}`)
                    }}
                >
                    Ver ficha digital </button>
            ),
        },

    ]

    if (!usuario) return null

    if (!accesoPermitido) {
        return <AccessGuardScreen message="Verificando permisos..." />
    }

    // ─────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────

    return (
        <AdminShell contentPadding="0">
            <main className={styles.page}>
                <ModuleHero
                    eyebrow="🌽 Germoplasma"
                    title={
                        <>
                            Ficha digital de <em>germoplasma</em>
                        </>
                    }
                    description="Consulta y registra accesiones de germoplasma de maíz nativo de la Huasteca Potosina."
                    stats={[
                        {
                            label: 'Accesiones',
                            value: germoplasmas.length,
                        },
                    ]}
                    actions={
                        puedeCrear ? (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => {
                                    limpiarFormulario()
                                    setMostrarFormulario(true)
                                }}
                            >
                                + Nuevo germoplasma
                            </button>
                        ) : null
                    }
                />

                {error && (
                    <div className={styles.mensaje}>
                        {error}
                    </div>
                )}

                <section className={styles.barraBusqueda}>
                    <div className={styles.busqueda}>
                        <SearchInput
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar por código, nombre, comunidad, colector..."
                        />
                    </div>

                    <div className={styles.resultados}>
                        {resultados.length}{' '}
                        {resultados.length === 1 ? 'resultado' : 'resultados'}
                    </div>
                </section>

                <Tabla
                    datos={resultadosPagina}
                    columnas={columnas}
                    cargando={cargando}
                    vacio={
                        busqueda
                            ? 'No se encontraron accesiones que coincidan con la búsqueda.'
                            : 'Todavía no hay accesiones de germoplasma registradas.'
                    }
                    infoText={
                        cargando
                            ? undefined
                            : `${resultados.length} accesiones encontradas`
                    }
                    onRowClick={(row) => {
                        router.push(`/germoplasma/${row.id}`)
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

                {/* ─────────────────────────────────────────
          Formulario de alta
      ────────────────────────────────────────── */}

                {mostrarFormulario && puedeCrear && (
                    <GermoplasmaFormModal
                        formulario={formulario}
                        comunidades={comunidades}
                        tecnicos={tecnicos}
                        productores={productores}
                        razas={razas}
                        lat={lat}
                        lng={lng}
                        guardando={guardando}
                        error={errorFormulario}
                        onCerrar={cerrarFormulario}
                        onGuardar={guardarGermoplasma}
                        onCambiarCampo={cambiarCampo}
                        onCambiarComunidad={cambiarComunidad}
                        onCambiarUbicacion={(nuevaLat, nuevaLng) => {
                            setLat(nuevaLat)
                            setLng(nuevaLng)
                            setErrorFormulario(null)
                        }}
                    />
                )}
            </main>
        </AdminShell>
    )
}