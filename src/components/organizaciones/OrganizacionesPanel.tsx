"use client";

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DEL, GET, POST } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';

import type {
    Organizacion,
    OrganizacionPropietario,
    OrganizacionMiembro,
    Investigador,
} from '@/types';

import Paginacion from '@/components/ui/Paginacion';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import SelectField from '@/components/ui/SelectField';
import SearchInput from '@/components/ui/SearchInput';
import StatCard from '@/components/ui/StatCard';
import Tabla from '@/components/ui/Tabla';

import styles from '@/app/admin/organizaciones/organizaciones.module.css';

export default function OrganizacionesPanel() {
    const qc = useQueryClient();
    const addToast = useAppStore(s => s.addToast);
    const usuarioActual = useAppStore(s => s.usuario);
    const esAdministrador = usuarioActual?.rol === 'administrador';
    const esInvestigador = usuarioActual?.rol === 'investigador';
    const queryClient = useQueryClient();

    // ─────────────────────────────────────────────────────────────
    // Filtros y paginación
    // ─────────────────────────────────────────────────────────────

    const [search, setSearch] = useState('');
    const [estado, setEstado] = useState('');
    const [pagina, setPagina] = useState(1);

    const PAG = 15;

    // ─────────────────────────────────────────────────────────────
    // Confirmación de desactivación
    // ─────────────────────────────────────────────────────────────

    const [modalConfirm, setModalConfirm] = useState<{
        open: boolean;
        id?: string;
        nombre?: string;
    }>({ open: false });

    const [crearOpen, setCrearOpen] = useState(false);

    const [nuevoNombre, setNuevoNombre] = useState('');
    const [nuevaDescripcion, setNuevaDescripcion] = useState('');
    const [nuevoPropietarioId, setNuevoPropietarioId] = useState('');
    const [miembrosOpen, setMiembrosOpen] = useState(false);
    const [organizacionMiembros, setOrganizacionMiembros] =
        useState<Organizacion | null>(null);
    const [nuevoMiembroId, setNuevoMiembroId] = useState('');

    const abrirModalConfirm = (organizacion: Organizacion) => {
        setModalConfirm({
            open: true,
            id: organizacion.id,
            nombre: organizacion.nombre,
        });
    };

    const cerrarModalConfirm = () => {
        setModalConfirm({ open: false });
    };

    // ─────────────────────────────────────────────────────────────
    // Queries
    // ─────────────────────────────────────────────────────────────

    const {
        data: organizaciones = [],
        isLoading,
        isError,
        error,
        refetch: refetchOrganizaciones,
    } = useQuery<Organizacion[]>({
        queryKey: ['organizaciones'],
        queryFn: () => GET('/core/organizaciones'),
        retry: 1,
        select: (d: unknown) => {
            const data = d as
                | Organizacion[]
                | {
                    count?: number;
                    items?: Organizacion[];
                    results?: Organizacion[];
                };

            return Array.isArray(data)
                ? data
                : data.results ?? data.items ?? [];
        },
    });

    const {
        data: propietarios = [],
        isLoading: isLoadingPropietarios,
        refetch: refetchPropietarios,
    } = useQuery<OrganizacionPropietario[]>({
        queryKey: ['organizaciones-propietarios'],
        queryFn: () => GET('/core/organizaciones/propietarios'),
        retry: 1,
        select: (d: unknown) => {
            const data = d as
                | OrganizacionPropietario[]
                | {
                    count?: number;
                    items?: OrganizacionPropietario[];
                    results?: OrganizacionPropietario[];
                };

            return Array.isArray(data)
                ? data
                : data.results ?? data.items ?? [];
        },
    });

    const {
        data: investigadores = [],
        isLoading: isLoadingInvestigadores,
        refetch: refetchInvestigadores,
    } = useQuery<Investigador[]>({
        queryKey: ['investigadores'],
        queryFn: () => GET('/social/investigadores'),
        retry: 1,
        select: (d: unknown) => {
            const data = d as Investigador[] | {
                count?: number;
                items?: Investigador[];
                results?: Investigador[];
            };

            return Array.isArray(data)
                ? data
                : data.results ?? data.items ?? [];
        },
    });

    // ─────────────────────────────────────────────────────────────
    // Propietarios
    // ─────────────────────────────────────────────────────────────

    const propietariosMap = useMemo(() => {
        const mapa = new Map<string, OrganizacionPropietario>();

        propietarios.forEach(propietario => {
            mapa.set(propietario.propietario_id, propietario);
        });

        return mapa;
    }, [propietarios]);

    const obtenerPropietario = (organizacion: Organizacion) => {
        return propietariosMap.get(organizacion.propietario_id);
    };

    // ─────────────────────────────────────────────────────────────
    // Desactivar organización
    // ─────────────────────────────────────────────────────────────

    const desactivarOrganizacion = useMutation({
        mutationFn: (id: string) =>
            DEL(`/core/organizaciones/${id}`),

        onSuccess: () => {
            cerrarModalConfirm();

            qc.invalidateQueries({
                queryKey: ['organizaciones'],
            });

            qc.invalidateQueries({
                queryKey: ['organizaciones-propietarios'],
            });

            addToast('Organización desactivada', 'ok');
        },

        onError: (e: Error) => {
            addToast(
                e.message || 'Error al desactivar organización',
                'err'
            );
        },
    });

    const crearOrganizacion = () => {
        if (!nuevoNombre.trim()) {
            addToast(
                'El nombre de la organización es obligatorio',
                'err'
            );
            return;
        }

        if (!nuevoPropietarioId) {
            addToast(
                'Debes seleccionar un propietario',
                'err'
            );
            return;
        }

        crearMutation.mutate();
    };

    const agregarMiembro = () => {
        if (!nuevoMiembroId) {
            addToast('Debes seleccionar un usuario', 'err');
            return;
        }

        agregarMiembroMutation.mutate();
    };

    const abrirMiembros = (organizacion: Organizacion) => {
        setOrganizacionMiembros(organizacion);
        setMiembrosOpen(true);
    };

    const cerrarMiembros = () => {
        if (agregarMiembroMutation.isPending) return;

        setMiembrosOpen(false);
        setOrganizacionMiembros(null);
        setNuevoMiembroId('');
    };

    const crearMutation = useMutation({
        mutationFn: () =>
            POST('/core/organizaciones', {
                nombre: nuevoNombre.trim(),
                descripcion: nuevaDescripcion.trim(),
                propietario_id: nuevoPropietarioId,
            }),

        onSuccess: async () => {
            setCrearOpen(false);

            setNuevoNombre('');
            setNuevaDescripcion('');
            setNuevoPropietarioId('');

            await queryClient.invalidateQueries({
                queryKey: ['organizaciones'],
            });

            await queryClient.invalidateQueries({
                queryKey: ['organizaciones-propietarios'],
            });

            addToast(
                'Organización creada correctamente',
                'ok'
            );
        },

        onError: (e: Error) => {
            addToast(
                e.message || 'No se pudo crear la organización',
                'err'
            );
        },
    });

    const agregarMiembroMutation = useMutation({
        mutationFn: () => {
            if (!organizacionMiembros?.id) {
                throw new Error('No hay una organización seleccionada');
            }

            return POST(
                `/core/organizaciones/${organizacionMiembros.id}/miembros`,
                {
                    usuario_id: nuevoMiembroId,
                }
            );
        },

        onSuccess: async () => {
            setNuevoMiembroId('');

            await queryClient.invalidateQueries({
                queryKey: [
                    'organizacion-miembros',
                    organizacionMiembros?.id,
                ],
            });

            addToast('Miembro agregado correctamente', 'ok');
        },

        onError: (e: Error) => {
            addToast(
                e.message || 'No se pudo agregar el miembro',
                'err'
            );
        },
    });

    const {
        data: miembros = [],
        isLoading: isLoadingMiembros,
        isError: isErrorMiembros,
        error: errorMiembros,
    } = useQuery<OrganizacionMiembro[]>({
        queryKey: ['organizacion-miembros', organizacionMiembros?.id],
        queryFn: () =>
            GET(
                `/core/organizaciones/${organizacionMiembros!.id}/miembros`
            ),
        enabled: !!organizacionMiembros?.id && miembrosOpen || esAdministrador,
        retry: 1,
        select: (d: unknown) => {
            const data = d as OrganizacionMiembro[] | {
                count?: number;
                items?: OrganizacionMiembro[];
                results?: OrganizacionMiembro[];
            };

            return Array.isArray(data)
                ? data
                : data.results ?? data.items ?? [];
        },
    });

    const {
        data: usuarios = [],
        isLoading: isLoadingUsuarios,
        refetch: refetchUsuarios,
    } = useQuery({
        queryKey: ['usuarios'],
        queryFn: () => GET('/auth/usuarios'),
        retry: 1,
        select: (d: unknown) => {
            const data = d as any[] | {
                count?: number;
                items?: any[];
                results?: any[];
            };

            return Array.isArray(data)
                ? data
                : data.results ?? data.items ?? [];
        },
    });

    // ─────────────────────────────────────────────────────────────
    // Ordenamiento
    // ─────────────────────────────────────────────────────────────

    const [sortCol, setSortCol] = useState<string>('nombre');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    const handleSort = (col: string) => {
        if (sortCol === col) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortCol(col);
            setSortDir('asc');
        }
    };

    const organizacionesVisibles = useMemo(() => {
        if (esInvestigador) {
            return organizaciones.filter(
                organizacion =>
                    organizacion.propietario_id === usuarioActual?.id
            );
        }

        return organizaciones;
    }, [organizaciones, esInvestigador, usuarioActual?.id]);

    // ─────────────────────────────────────────────────────────────
    // Filtrado
    // ─────────────────────────────────────────────────────────────

    const filtrados = useMemo(() => {
        let f = organizacionesVisibles;

        if (search) {
            const termino = search.toLowerCase();

            f = f.filter(organizacion => {
                const propietario = obtenerPropietario(organizacion);

                return [
                    organizacion.nombre,
                    organizacion.descripcion,
                    propietario?.propietario_nombre,
                    propietario?.propietario_email,
                ].some(v =>
                    (v || '').toLowerCase().includes(termino)
                );
            });
        }

        if (estado) {
            f = f.filter(
                organizacion =>
                    estado === 'activo'
                        ? organizacion.activo
                        : !organizacion.activo
            );
        }

        // Ordenamiento
        f = [...f].sort((a, b) => {
            let av = '';
            let bv = '';

            if (sortCol === 'propietario') {
                av = obtenerPropietario(a)?.propietario_nombre ?? '';
                bv = obtenerPropietario(b)?.propietario_nombre ?? '';
            } else {
                av = String(
                    (a as unknown as Record<string, unknown>)[sortCol] ?? ''
                );

                bv = String(
                    (b as unknown as Record<string, unknown>)[sortCol] ?? ''
                );
            }

            const cmp = av.localeCompare(bv, 'es', {
                numeric: true,
                sensitivity: 'base',
            });

            return sortDir === 'asc' ? cmp : -cmp;
        });

        return f;
    }, [
        organizacionesVisibles,
        search,
        estado,
        sortCol,
        sortDir,
        propietariosMap,
    ]);
    // ─────────────────────────────────────────────────────────────
    // Paginación
    // ─────────────────────────────────────────────────────────────

    const totalPaginas = Math.ceil(filtrados.length / PAG) || 1;

    useEffect(() => {
        setPagina(1);
    }, [search, estado]);

    const paginados = useMemo(
        () =>
            filtrados.slice(
                (pagina - 1) * PAG,
                pagina * PAG
            ),
        [filtrados, pagina]
    );

    // ─────────────────────────────────────────────────────────────
    // Estadísticas
    // ─────────────────────────────────────────────────────────────

    const organizacionesActivas = filtrados.filter(
        organizacion => organizacion.activo
    ).length;

    const organizacionesInactivas = filtrados.filter(
        organizacion => !organizacion.activo
    ).length;

    return (
        <div
            style={{
                width: '100%',
                maxWidth: 1200,
                margin: '0 auto',
            }}
        >
            {/* ────────────────────────────────────────────────────────
          Hero
      ──────────────────────────────────────────────────────── */}

            <div className={styles['mod-hero']}>
                <div className={styles['mod-hero-txt']}>
                    <div className={styles['mod-hero-label']}>
                        Administración · Módulo de organizaciones
                    </div>

                    <h1 className={styles['mod-hero-title']}>
                        Gestión de <em>Organizaciones</em> 🏢
                    </h1>

                    <p className={styles['mod-hero-desc']}>
                        Administra las organizaciones de la plataforma,
                        sus propietarios y posteriormente sus miembros.
                    </p>
                </div>

                <div className={styles['mod-hero-right']}>
                    <div className={styles['mod-hero-stats']}>
                        <div className={styles['mod-hero-stat']}>
                            <span className={styles['mod-hero-stat-val']}>
                                {organizacionesActivas}
                            </span>

                            <span className={styles['mod-hero-stat-lbl']}>
                                Activas
                            </span>
                        </div>

                        <div className={styles['mod-hero-stat-sep']} />

                        <div className={styles['mod-hero-stat']}>
                            <span className={styles['mod-hero-stat-val']}>
                                {filtrados.length}
                            </span>

                            <span className={styles['mod-hero-stat-lbl']}>
                                Total
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ────────────────────────────────────────────────────────
          Stats
      ──────────────────────────────────────────────────────── */}

            <div className={styles['stats-row']}>
                <StatCard
                    value={organizacionesActivas}
                    label="Organizaciones activas"
                    colorClass="verde"
                />

                <StatCard
                    value={filtrados.length}
                    label="Total organizaciones"
                />

                <StatCard
                    value={organizacionesInactivas}
                    label="Organizaciones inactivas"
                    colorClass="rojo"
                />
            </div>

            {/* ────────────────────────────────────────────────────────
          Encabezado
      ──────────────────────────────────────────────────────── */}

            <div className={styles['sec-header']}>
                <div>
                    <h2 className={styles['sec-titulo']}>
                        Organizaciones
                    </h2>

                    <p className={styles['sec-sub']}>
                        Gestión de organizaciones y propietarios
                    </p>
                </div>

                <div className={styles['sec-acciones']}>
                    {esAdministrador && (
                        <Button
                            variante="primario"
                            onClick={() => setCrearOpen(true)}
                        >
                            + Nueva organización
                        </Button>
                    )}

                    <Button
                        variante="ghost"
                        tamaño="sm"
                        onClick={() => {
                            void refetchOrganizaciones();
                            void refetchPropietarios();
                            void refetchInvestigadores();
                            void refetchUsuarios();
                        }}
                    >
                        ↻ Recargar
                    </Button>
                </div>
            </div>

            {/* ────────────────────────────────────────────────────────
          Filtros
      ──────────────────────────────────────────────────────── */}

            <div className={styles.filtros}>
                <SearchInput
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar por organización o propietario..."
                    className={styles['search-wrap']}
                />

                <SelectField
                    className={styles['filtro-sel']}
                    value={estado}
                    onChange={e => setEstado(e.target.value)}
                    label=""
                    name=""
                    options={[
                        {
                            value: '',
                            label: 'Todas',
                        },
                        {
                            value: 'activo',
                            label: '✓ Activas',
                        },
                        {
                            value: 'inactivo',
                            label: '✗ Inactivas',
                        },
                    ]}
                />

                <div className={styles['filtros-right']}>
                    <Button
                        variante="ghost"
                        tamaño="sm"
                        onClick={() => {
                            setSearch('');
                            setEstado('');
                        }}
                    >
                        ✕ Limpiar
                    </Button>
                </div>
            </div>

            {/* ────────────────────────────────────────────────────────
          Tabla
      ──────────────────────────────────────────────────────── */}

            <div className={styles['table-wrap']}>
                {isLoading ? (
                    <div className={styles['estado-centro']}>
                        <div className={styles.spinner} />
                        Cargando…
                    </div>
                ) : isError ? (
                    <div
                        className={styles['estado-centro']}
                        style={{
                            color: 'var(--rojo, #c0392b)',
                        }}
                    >
                        ⚠️ Error al cargar organizaciones:{' '}
                        {(error as Error)?.message ?? 'Error desconocido'}

                        <br />

                        <Button
                            variante="ghost"
                            tamaño="sm"
                            onClick={() => refetchOrganizaciones()}
                            style={{ marginTop: 12 }}
                        >
                            ↺ Reintentar
                        </Button>
                    </div>
                ) : (
                    <Tabla
                        datos={paginados}
                        sortCol={sortCol}
                        sortDir={sortDir}
                        onSort={handleSort}
                        infoText={`${filtrados.length} organización${filtrados.length !== 1 ? 'es' : ''
                            }`}
                        columnas={[
                            {
                                key: 'index',
                                header: '#',
                                nowrap: true,
                                sortable: false,
                                hideOnMobile: true,
                                render: (
                                    _: Organizacion,
                                    index?: number
                                ) => {
                                    const page = Number(pagina) || 1;
                                    const perPage = Number(PAG) || 10;
                                    const i = index ?? 0;

                                    return i + 1 + (page - 1) * perPage;
                                },
                            },

                            {
                                key: 'nombre',
                                header: 'Organización',
                                width: '220px',
                                sortable: true,
                                render: (organizacion: Organizacion) => {
                                    const iniciales = organizacion.nombre
                                        .split(' ')
                                        .filter(Boolean)
                                        .map(nombre => nombre[0])
                                        .join('')
                                        .slice(0, 2)
                                        .toUpperCase();

                                    return (
                                        <div className={styles['td-nombre']}>
                                            <div
                                                className={styles['td-avatar']}
                                            >
                                                {iniciales || 'O'}
                                            </div>

                                            <div className={styles['td-nombre-txt']}>
                                                <strong>
                                                    {organizacion.nombre}
                                                </strong>
                                                {/*
                                                <span>
                                                    ID: {organizacion.id.slice(0, 8)}…
                                                </span>*/}
                                            </div>
                                        </div>
                                    );
                                },
                            },

                            {
                                key: 'descripcion',
                                header: 'Descripción',
                                width: '280px',
                                sortable: true,
                                hideOnMobile: true,
                                render: (organizacion: Organizacion) => (
                                    <span className={styles['td-descripcion']}>
                                        {organizacion.descripcion || '—'}
                                    </span>
                                ),
                            },

                            {
                                key: 'propietario',
                                header: 'Propietario',
                                width: '220px',
                                sortable: true,
                                render: (organizacion: Organizacion) => {
                                    const propietario =
                                        obtenerPropietario(organizacion);

                                    if (isLoadingPropietarios) {
                                        return 'Cargando…';
                                    }

                                    return (
                                        <div className={styles['td-propietario']}>
                                            <strong>
                                                {propietario?.propietario_nombre || '—'}
                                            </strong>

                                            {propietario?.propietario_email && (
                                                <span>
                                                    {propietario.propietario_email}
                                                </span>
                                            )}
                                        </div>
                                    );
                                },
                            },

                            {
                                key: 'activo',
                                header: 'Estado',
                                width: '110px',
                                sortable: true,
                                render: (organizacion: Organizacion) => (
                                    <span
                                        className={`${styles.badge} ${styles[
                                            organizacion.activo
                                                ? 'b-activo'
                                                : 'b-inactivo'
                                        ]
                                            } ${styles['td-estado']}`}
                                    >
                                        {organizacion.activo ? '✓' : '✗'}{' '}
                                        {organizacion.activo
                                            ? 'Activa'
                                            : 'Inactiva'}
                                    </span>
                                ),
                            },
                        ]}
                        acciones={(organizacion: Organizacion) => (
                            <div className={styles['td-acciones']}>
                                <Button
                                    variante="ghost"
                                    tamaño="sm"
                                    onClick={() => abrirMiembros(organizacion)}
                                >
                                    👥 Miembros
                                </Button>
                                {esAdministrador && organizacion.activo && (
                                    <Button
                                        variante="peligro"
                                        tamaño="sm"
                                        onClick={e => {
                                            e.stopPropagation();
                                            abrirModalConfirm(organizacion);
                                        }}
                                        title="Desactivar organización"
                                    >
                                        🚫
                                    </Button>
                                )}
                            </div>
                        )}
                    />
                )}
            </div>

            {/* ────────────────────────────────────────────────────────
          Paginación
      ──────────────────────────────────────────────────────── */}

            <Paginacion
                paginaActual={pagina}
                totalPaginas={totalPaginas}
                onCambiar={setPagina}
                totalItems={filtrados.length}
                itemsPorPagina={PAG}
            />

            {/* ────────────────────────────────────────────────────────
          Modal de confirmación
      ──────────────────────────────────────────────────────── */}

            <Modal
                open={modalConfirm.open}
                onClose={cerrarModalConfirm}
                titulo={null}
                ancho="sm"
                footer={
                    <>
                        <Button
                            variante="ghost"
                            onClick={cerrarModalConfirm}
                        >
                            Cancelar
                        </Button>

                        <Button
                            variante="peligro"
                            onClick={() => {
                                if (modalConfirm.id) {
                                    desactivarOrganizacion.mutate(
                                        modalConfirm.id
                                    );
                                }
                            }}
                        >
                            Confirmar
                        </Button>
                    </>
                }
            >
                <div
                    style={{
                        textAlign: 'center',
                        padding: '8px 0',
                    }}
                >
                    <div
                        style={{
                            fontSize: 36,
                            marginBottom: 12,
                        }}
                    >
                        ⚠️
                    </div>

                    <div
                        style={{
                            fontSize: 14,
                            color: 'var(--cafe)',
                            lineHeight: 1.6,
                        }}
                    >
                        ¿Estás seguro que deseas desactivar la
                        organización{' '}
                        <strong>
                            {modalConfirm.nombre ?? ''}
                        </strong>
                        ?
                    </div>
                </div>
            </Modal>

            <Modal
                open={miembrosOpen}
                onClose={cerrarMiembros}
                titulo={
                    organizacionMiembros
                        ? `Miembros — ${organizacionMiembros.nombre}`
                        : 'Miembros'
                }
                ancho="lg"
                footer={
                    <Button
                        variante="ghost"
                        onClick={cerrarMiembros}
                        disabled={agregarMiembroMutation.isPending}
                    >
                        Cerrar
                    </Button>
                }
            >
                <div style={{ display: 'grid', gap: 18 }}>

                    {/* Agregar miembro */}
                    <div
                        style={{
                            display: 'grid',
                            gap: 10,
                            paddingBottom: 16,
                            borderBottom: '1px solid var(--borde)',
                        }}
                    >
                        <SelectField
                            label="Agregar miembro"
                            name="organizacion-miembro"
                            value={nuevoMiembroId}
                            onChange={e => setNuevoMiembroId(e.target.value)}
                            options={[
                                {
                                    value: '',
                                    label: isLoadingUsuarios
                                        ? 'Cargando usuarios...'
                                        : 'Selecciona un usuario',
                                },
                                ...usuarios
                                    .filter(
                                        (usuario: any) =>
                                            usuario.activo &&
                                            !miembros.some(
                                                miembro => miembro.usuario_id === usuario.id
                                            )
                                    )
                                    .map((usuario: any) => ({
                                        value: usuario.id,
                                        label: `${usuario.nombre_completo} — ${usuario.email}`,
                                    })),
                            ]}
                            disabled={
                                isLoadingUsuarios ||
                                agregarMiembroMutation.isPending
                            }
                        />

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                            }}
                        >
                            <Button
                                variante="primario"
                                tamaño="sm"
                                onClick={agregarMiembro}
                                disabled={
                                    agregarMiembroMutation.isPending ||
                                    !nuevoMiembroId ||
                                    isLoadingUsuarios
                                }
                            >
                                {agregarMiembroMutation.isPending
                                    ? 'Agregando...'
                                    : '+ Agregar miembro'}
                            </Button>
                        </div>
                    </div>

                    {/* Miembros actuales */}
                    {isLoadingMiembros ? (
                        <div className={styles.loader}>
                            <div className={styles.spinner} />
                            <span>Cargando miembros...</span>
                        </div>
                    ) : isErrorMiembros ? (
                        <div className={styles.empty}>
                            <strong>
                                No se pudieron cargar los miembros.
                            </strong>

                            <span>
                                {errorMiembros instanceof Error
                                    ? errorMiembros.message
                                    : 'Ocurrió un error al consultar la organización.'}
                            </span>
                        </div>
                    ) : miembros.length === 0 ? (
                        <div className={styles.empty}>
                            <strong>
                                Esta organización no tiene miembros. </strong>

                            <span>
                                Selecciona un usuario arriba para agregar el
                                primero.
                            </span>
                        </div>
                    ) : (
                        <div className={styles['table-wrap']}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Usuario</th>
                                        <th>Fecha de ingreso</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {miembros.map(miembro => (
                                        <tr key={miembro.id}>
                                            <td className={styles.tdMiembroUsuario}>
                                                {usuarios.find(
                                                    (usuario: any) => usuario.id === miembro.usuario_id
                                                )?.nombre_completo ?? miembro.usuario_id}
                                            </td>

                                            <td>
                                                {new Date(
                                                    miembro.fecha_ingreso
                                                ).toLocaleString('es-MX')}
                                            </td>

                                            <td>
                                                <span
                                                    className={`${styles.badge} ${miembro.activo
                                                        ? styles['b-activo']
                                                        : styles['b-inactivo']
                                                        }`}
                                                >
                                                    {miembro.activo
                                                        ? 'Activo'
                                                        : 'Inactivo'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Modal>

            <Modal
                open={crearOpen}
                onClose={() => {
                    if (!crearMutation.isPending) {
                        setCrearOpen(false);
                    }
                }}
                titulo="Nueva organización"
                ancho="md"
                footer={
                    <>
                        <Button
                            variante="ghost"
                            onClick={() => setCrearOpen(false)}
                            disabled={crearMutation.isPending}
                        >
                            Cancelar
                        </Button>

                        <Button
                            variante="primario"
                            onClick={crearOrganizacion}
                            disabled={
                                crearMutation.isPending ||
                                !nuevoNombre.trim() ||
                                !nuevoPropietarioId
                            }
                        >
                            {crearMutation.isPending
                                ? 'Creando...'
                                : 'Crear organización'}
                        </Button>
                    </>
                }
            >

                <div style={{ display: 'grid', gap: 16 }}>
                    <div>
                        <label
                            htmlFor="organizacion-nombre"
                            style={{
                                display: 'block',
                                marginBottom: 6,
                                fontSize: 13,
                                fontWeight: 700,
                            }}
                        >
                            Nombre
                        </label>

                        <input
                            id="organizacion-nombre"
                            value={nuevoNombre}
                            onChange={e => setNuevoNombre(e.target.value)}
                            placeholder="Nombre de la organización"
                            disabled={crearMutation.isPending}
                            style={{
                                width: '100%',
                                padding: '9px 11px',
                                border: '1px solid var(--borde)',
                                borderRadius: 7,
                                background: 'var(--crema)',
                                color: 'var(--tierra)',
                                fontFamily: 'Nunito, sans-serif',
                                fontSize: 13,
                                outline: 'none',
                            }}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="organizacion-descripcion"
                            style={{
                                display: 'block',
                                marginBottom: 6,
                                fontSize: 13,
                                fontWeight: 700,
                            }}
                        >
                            Descripción
                        </label>

                        <textarea
                            id="organizacion-descripcion"
                            value={nuevaDescripcion}
                            onChange={e => setNuevaDescripcion(e.target.value)}
                            placeholder="Descripción de la organización"
                            rows={4}
                            disabled={crearMutation.isPending}
                            style={{
                                width: '100%',
                                padding: '9px 11px',
                                border: '1px solid var(--borde)',
                                borderRadius: 7,
                                background: 'var(--crema)',
                                color: 'var(--tierra)',
                                fontFamily: 'Nunito, sans-serif',
                                fontSize: 13,
                                outline: 'none',
                                resize: 'vertical',
                            }}
                        />
                    </div>

                    <SelectField
                        label="Propietario"
                        name="organizacion-propietario"
                        value={nuevoPropietarioId}
                        onChange={e => setNuevoPropietarioId(e.target.value)}
                        options={[
                            {
                                value: '',
                                label: 'Selecciona un investigador',
                            },
                            ...investigadores.map(investigador => ({
                                value: investigador.user_id,
                                label: `${investigador.nombre_completo} — ${investigador.email}`,
                            })),
                        ]}
                        disabled={crearMutation.isPending || isLoadingInvestigadores}
                    />
                </div>
            </Modal>

        </div>
    );
}