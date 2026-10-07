// src/app/comunidades/page.tsx
'use client'

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { GET } from '@/lib/api';
import ModalComunidad from '@/components/comunidades/ModalComunidad';

import AdminShell from '@/components/dashboard/AdminShell';
import SidebarComunidades from '@/components/comunidades/SidebarComunidades';

import MapaHuasteca, { type PuntoMapaHuasteca } from '@/components/ui/MapaHuasteca';
import TablaComunidades from '@/components/comunidades/TablaComunidades';
import PerfilComunidad from '@/components/comunidades/PerfilComunidad';
import type { Comunidad, Municipio } from '@/types';

import '@/components/comunidades/hide-modals-mobile.css'

const COMUNIDADES_HUASTECA: PuntoMapaHuasteca[] = [
  { id: 1, comunidad: 'Ébano', municipio: 'Ébano', latitud: 22.265697, longitud: -98.625804 },
  { id: 2, comunidad: 'San José el Viejo', municipio: 'Tamasopo', latitud: 21.7018753, longitud: -99.228642 },
  { id: 3, comunidad: 'Nuevo Jomté', municipio: 'San Vicente Tancuayalab', latitud: 21.855922, longitud: -98.576321 },
  { id: 4, comunidad: 'Ponciano Arriaga', municipio: 'Ébano', latitud: 22.2386708, longitud: -98.5673783 },
  { id: 5, comunidad: 'Tanluche', municipio: 'Ciudad Valles', latitud: 22.143333, longitud: -99.115833 },
  { id: 6, comunidad: 'Ponciano Arriaga', municipio: 'Ébano', latitud: 22.2386708, longitud: -98.5673783 },
  { id: 7, comunidad: 'Ejido La Lima', municipio: 'Ciudad Valles', latitud: 21.927849, longitud: -99.100947 },
  { id: 8, comunidad: 'Ejido Palo de Arco', municipio: 'Aquismón', latitud: 21.925571, longitud: -99.191220 },
  { id: 9, comunidad: 'Ojo de Agua', municipio: 'Ciudad Valles', latitud: 21.991583, longitud: -99.123659 },
  { id: 10, comunidad: 'Ejido La Lima', municipio: 'Ciudad Valles', latitud: 21.9244445, longitud: -99.099959 },
  { id: 11, comunidad: 'Zopope', municipio: 'Aquismón', latitud: 21.57856, longitud: -99.0818169 },
  { id: 12, comunidad: 'Puerto Rancho Nuevo', municipio: 'Tamasopo', latitud: 21.783778, longitud: -99.490611 },
  { id: 13, comunidad: 'Puerto Rancho Nuevo', municipio: 'Tamasopo', latitud: 21.7829745, longitud: -99.4894382 },
  { id: 14, comunidad: 'Puerto Rancho Nuevo', municipio: 'Tamasopo', latitud: 21.7834602, longitud: -99.4901064 },
  { id: 15, comunidad: 'Agua Puerca', municipio: 'Tamasopo', latitud: 21.762768, longitud: -99.481854 },
  { id: 16, comunidad: 'Cuéchod', municipio: 'San Antonio', latitud: 21.6240087, longitud: -98.9107526 },
  { id: 17, comunidad: 'El Chuche', municipio: 'Tanlajás', latitud: 21.6836592, longitud: -98.9109448 },
  { id: 18, comunidad: 'Aldzulup', municipio: 'Tancanhuitz', latitud: 21.6169203, longitud: -98.927553 },
  { id: 19, comunidad: 'El Chuche', municipio: 'Tanlajás', latitud: 21.6864942, longitud: -98.9120133 },
  { id: 20, comunidad: 'Río Verdito', municipio: 'Ciudad Valles', latitud: 22.214776, longitud: -99.260781 },
  { id: 21, comunidad: 'Ejido Santa Rosa', municipio: 'Tanlajás', latitud: 21.73898688, longitud: -98.8701427 },
  { id: 22, comunidad: 'Coromohom', municipio: 'Tanlajás', latitud: 21.6770912, longitud: -98.8884554 },
];

type ComunidadMock = {
  id: string;
  nombre: string;
  municipio_nombre: string;
  localidad_nombre: string;
  lengua_indigena: string;
  poblacion?: number;
  num_productores?: number;
  latitud: number;
  longitud: number;
};

interface UbicacionApi {
  id: string;
  nombre?: string | null;
  tipo_ubicacion?: string | null;
  descripcion?: string | null;
  latitud: number;
  longitud: number;
  altitud_m?: number | null;
  precision_gps?: number | null;
  municipio_id?: number | null;
  sistema_referencia?: string | null;
  geom?: string | null;
}

interface ApiLista<T> {
  count: number;
  results: T[];
}

interface ParcelaApi {
  id: string;
  nombre?: string | null;
  superficie_ha?: number | string | null;
  sistema_manejo_id?: number | null;
  tenencia?: string | null;
  topografia?: string | null;
  productor_id?: string | null;
  ubicacion_id?: string | null;
  poligono?: string | null;
  densidad_plantas_ha?: number | null;
  observaciones_sitio?: string | null;
}

interface ComunidadApi extends Comunidad {
  ubicacion_id?: string | null;
}

interface MunicipiosGeoJson {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    properties?: {
      municipio?: string | null;
      municipio_key?: string | null;
      [key: string]: unknown;
    };
    geometry: {
      type: 'Polygon' | 'MultiPolygon';
      coordinates: number[][][] | number[][][][];
    };
  }>;
}

// Hook para detectar si es móvil
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 700);
    check();
    window.addEventListener('resize', check);

    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
}

function puntoEnPoligono(
  longitud: number,
  latitud: number,
  coordenadas: number[][]
): boolean {
  let dentro = false;

  for (
    let i = 0, j = coordenadas.length - 1;
    i < coordenadas.length;
    j = i++
  ) {
    const xi = coordenadas[i][0];
    const yi = coordenadas[i][1];
    const xj = coordenadas[j][0];
    const yj = coordenadas[j][1];

    const intersecta =
      yi > latitud !== yj > latitud &&
      longitud <
      ((xj - xi) * (latitud - yi)) / (yj - yi) + xi;

    if (intersecta) {
      dentro = !dentro;
    }
  }

  return dentro;
}

function puntoEnMunicipio(
  longitud: number,
  latitud: number,
  feature: MunicipiosGeoJson['features'][number]
): boolean {
  const geometry = feature.geometry;

  if (geometry.type === 'Polygon') {
    const anillos = geometry.coordinates as number[][][];

    if (anillos.length === 0) {
      return false;
    }

    const dentroDelExterior = puntoEnPoligono(
      longitud,
      latitud,
      anillos[0]
    );

    if (!dentroDelExterior) {
      return false;
    }

    // Si el polígono tiene huecos, comprobamos que el punto
    // no esté dentro de alguno de ellos.
    for (const hueco of anillos.slice(1)) {
      if (puntoEnPoligono(longitud, latitud, hueco)) {
        return false;
      }
    }

    return true;
  }

  if (geometry.type === 'MultiPolygon') {
    const multipoligonos = geometry.coordinates as number[][][][];

    return multipoligonos.some(poligono => {
      if (poligono.length === 0) {
        return false;
      }

      const dentroDelExterior = puntoEnPoligono(
        longitud,
        latitud,
        poligono[0]
      );

      if (!dentroDelExterior) {
        return false;
      }

      for (const hueco of poligono.slice(1)) {
        if (puntoEnPoligono(longitud, latitud, hueco)) {
          return false;
        }
      }

      return true;
    });
  }

  return false;
}

function obtenerMunicipioPorCoordenadas(
  longitud: number,
  latitud: number,
  geojson: MunicipiosGeoJson | null
): string {
  if (!geojson) {
    return '';
  }

  const feature = geojson.features.find(feature =>
    puntoEnMunicipio(longitud, latitud, feature)
  );

  return String(feature?.properties?.municipio ?? '');
}

export default function ComunidadesPage() {
  const isMobile = useIsMobile();

  // Usuario y protección de ruta
  const usuario = useAppStore(s => s.usuario);
  const rol = usuario?.rol;
  const [mounted, setMounted] = useState(false);
  const setMunicipios = useAppStore(s => s.setMunicipios);
  const municipiosStore = useAppStore(s => s.municipios);

  const municipiosPorId = useMemo(
    () =>
      new Map(
        municipiosStore.map(municipio => [
          municipio.id,
          municipio.nombre,
        ])
      ),
    [municipiosStore]
  );


  const router = useRouter();

  // Ubicaciones reales provenientes del backend
  const [ubicacionesParcela, setUbicacionesParcela] = useState<UbicacionApi[]>([]);
  const [ubicacionesLoading, setUbicacionesLoading] = useState(true);
  const [parcelas, setParcelas] = useState<ParcelaApi[]>([]);
  const [parcelasLoading, setParcelasLoading] = useState(true);
  const [municipiosGeoJson, setMunicipiosGeoJson] =
    useState<MunicipiosGeoJson | null>(null);

  const [comunidadesApi, setComunidadesApi] = useState<ComunidadApi[]>([]);
  const [comunidadesLoading, setComunidadesLoading] = useState(true);
  const [ubicacionesComunidad, setUbicacionesComunidad] = useState<UbicacionApi[]>([]);
  const [recargaComunidades, setRecargaComunidades] = useState(0);

  // Obtener únicamente las ubicaciones que representan parcelas
  useEffect(() => {
    let activo = true;

    const cargarUbicaciones = async () => {
      setUbicacionesLoading(true);

      try {
        const data = await GET('/ubicaciones');

        let lista: UbicacionApi[] = [];

        if (Array.isArray(data)) {
          lista = data as UbicacionApi[];
        } else if (typeof data === 'object' && data !== null) {
          const respuesta = data as Partial<ApiLista<UbicacionApi>>;
          lista = Array.isArray(respuesta.results)
            ? respuesta.results
            : [];
        }

        const parcelas = lista.filter(
          ubicacion =>
            (
              ubicacion.tipo_ubicacion === 'parcela' ||
              ubicacion.tipo_ubicacion === 'muestreo'
            ) &&
            Number.isFinite(Number(ubicacion.latitud)) &&
            Number.isFinite(Number(ubicacion.longitud))
        );

        if (activo) {
          setUbicacionesParcela(parcelas);
        }
      } catch (error) {
        console.error('Error al cargar ubicaciones:', error);

        if (activo) {
          setUbicacionesParcela([]);
        }
      } finally {
        if (activo) {
          setUbicacionesLoading(false);
        }
      }
    };

    cargarUbicaciones();

    return () => {
      activo = false;
    };
  }, []);

  // Obtener las ubicaciones asociadas a comunidades
  useEffect(() => {
    let activo = true;

    const cargarUbicacionesComunidad = async () => {
      try {
        const data = await GET('/ubicaciones');

        let lista: UbicacionApi[] = [];

        if (Array.isArray(data)) {
          lista = data as UbicacionApi[];
        } else if (typeof data === 'object' && data !== null) {
          const respuesta = data as Partial<ApiLista<UbicacionApi>>;

          lista = Array.isArray(respuesta.results)
            ? respuesta.results
            : [];
        }

        const comunidades = lista.filter(
          ubicacion =>
            ubicacion.tipo_ubicacion === 'comunidad' &&
            Number.isFinite(Number(ubicacion.latitud)) &&
            Number.isFinite(Number(ubicacion.longitud))
        );

        if (activo) {
          setUbicacionesComunidad(comunidades);
        }
      } catch (error) {
        console.error(
          'Error al cargar ubicaciones de comunidades:',
          error
        );

        if (activo) {
          setUbicacionesComunidad([]);
        }
      }
    };

    cargarUbicacionesComunidad();

    return () => {
      activo = false;
    };
  }, [recargaComunidades]);

  // Obtener comunidades reales desde el backend
  useEffect(() => {
    let activo = true;

    const cargarComunidades = async () => {
      setComunidadesLoading(true);

      try {
        const data = await GET('/core/comunidades');

        let lista: ComunidadApi[] = [];

        if (Array.isArray(data)) {
          lista = data as ComunidadApi[];
        } else if (typeof data === 'object' && data !== null) {
          const respuesta = data as Partial<ApiLista<ComunidadApi>>;

          lista = Array.isArray(respuesta.results)
            ? respuesta.results
            : [];
        }

        if (activo) {
          setComunidadesApi(lista);
        }
      } catch (error) {
        console.error('Error al cargar comunidades:', error);

        if (activo) {
          setComunidadesApi([]);
        }
      } finally {
        if (activo) {
          setComunidadesLoading(false);
        }
      }
    };

    cargarComunidades();

    return () => {
      activo = false;
    };
  }, [recargaComunidades]);

  useEffect(() => {
    // Esperamos a que el usuario esté hidratado antes de
    // decidir qué endpoint de parcelas utilizar.
    if (!usuario) {
      return;
    }

    let activo = true;

    setParcelasLoading(true);

    const endpointParcelas =
      usuario.rol === 'productor'
        ? '/parcelas/mis-parcelas'
        : usuario.rol === 'tecnico_campo'
          ? '/parcelas/asignadas'
          : '/parcelas';

    GET(endpointParcelas)
      .then((data: unknown) => {
        if (!activo) return;

        let lista: ParcelaApi[] = [];

        if (Array.isArray(data)) {
          lista = data as ParcelaApi[];
        } else if (typeof data === 'object' && data !== null) {
          const d = data as ApiLista<ParcelaApi>;
          lista = d.results ?? [];
        }

        setParcelas(lista);
      })
      .catch(() => {
        if (activo) {
          setParcelas([]);
        }
      })
      .finally(() => {
        if (activo) {
          setParcelasLoading(false);
        }
      });

    return () => {
      activo = false;
    };
  }, [usuario]);

  useEffect(() => {
    let activo = true;

    fetch('/data/huasteca-potosina-municipios.geojson')
      .then(response => {
        if (!response.ok) {
          throw new Error('No se pudo cargar el GeoJSON municipal');
        }

        return response.json();
      })
      .then((data: MunicipiosGeoJson) => {
        if (activo) {
          setMunicipiosGeoJson(data);
        }
      })
      .catch(error => {
        console.error('Error al cargar GeoJSON municipal:', error);

        if (activo) {
          setMunicipiosGeoJson(null);
        }
      });

    return () => {
      activo = false;
    };
  }, []);

  // Cargar municipios reales de comunidades si todavía no están
  if (municipiosStore.length === 0) {
    GET('/core/comunidades/municipios')
      .then((data: unknown) => {
        if (!Array.isArray(data)) {
          return;
        }

        const municipiosValidos = data.filter(
          (municipio): municipio is Municipio =>
            typeof municipio === 'object' &&
            municipio !== null &&
            'id' in municipio &&
            typeof (municipio as { id?: unknown }).id === 'number' &&
            'nombre' in municipio &&
            typeof (municipio as { nombre?: unknown }).nombre === 'string'
        );

        setMunicipios(municipiosValidos);
      })
      .catch(error => {
        console.error(
          'Error al cargar municipios de comunidades:',
          error
        );
      });
  }

  // Adaptar temporalmente las ubicaciones reales al formato
  // que actualmente utiliza MapaHuasteca.
  const puntosParcela = useMemo<PuntoMapaHuasteca[]>(() => {
    const puntos: PuntoMapaHuasteca[] = [];

    parcelas.forEach((parcela) => {
      if (!parcela.ubicacion_id) {
        return;
      }

      const ubicacion = ubicacionesParcela.find(
        (u) => u.id === parcela.ubicacion_id
      );

      if (!ubicacion) {
        return;
      }

      const latitud = Number(ubicacion.latitud);
      const longitud = Number(ubicacion.longitud);

      if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) {
        return;
      }

      const municipio = obtenerMunicipioPorCoordenadas(
        longitud,
        latitud,
        municipiosGeoJson
      );

      puntos.push({
        id: parcela.id,
        tipo: 'parcela',
        comunidad: parcela.nombre || 'Parcela',
        municipio,
        latitud,
        longitud,
        imagenUrl: null,
        poligono: parcela.poligono ?? null,

        superficie_ha: parcela.superficie_ha,
        tenencia: parcela.tenencia,
        topografia: parcela.topografia,
        densidad_plantas_ha: parcela.densidad_plantas_ha,
      });
    });

    return puntos;
  }, [parcelas, ubicacionesParcela, municipiosGeoJson]);

  const puntosComunidad = useMemo<PuntoMapaHuasteca[]>(() => {
    const puntos: PuntoMapaHuasteca[] = [];

    comunidadesApi.forEach((comunidad) => {
      if (!comunidad.ubicacion_id) {
        return;
      }

      const ubicacion = ubicacionesComunidad.find(
        (u) => u.id === comunidad.ubicacion_id
      );

      if (!ubicacion) {
        return;
      }

      const latitud = Number(ubicacion.latitud);
      const longitud = Number(ubicacion.longitud);

      if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) {
        return;
      }

      const municipio =
        comunidad.municipio_nombre ||
        municipiosPorId.get(comunidad.municipio_id) ||
        obtenerMunicipioPorCoordenadas(
          longitud,
          latitud,
          municipiosGeoJson
        ) ||
        'Sin municipio';

      puntos.push({
        id: comunidad.id,
        tipo: 'comunidad',
        comunidad: comunidad.nombre,
        municipio,
        latitud,
        longitud,
        imagenUrl: null,
        poligono: null,
      });
    });

    return puntos;
  }, [
    comunidadesApi,
    ubicacionesComunidad,
    municipiosPorId,
    municipiosGeoJson,
  ]);

  // Todos los puntos que pueden aparecer en el mapa/sidebar.
  const puntosMapa = useMemo(
    () => [
      ...puntosParcela,
      ...puntosComunidad,
    ],
    [puntosParcela, puntosComunidad]
  );


  const municipiosMapa = useMemo(
    () =>
      municipiosStore
        .map(municipio => municipio.nombre)
        .filter(
          (nombre): nombre is string =>
            typeof nombre === 'string' &&
            nombre.trim().length > 0
        )
        .sort((a, b) => a.localeCompare(b)),
    [municipiosStore]
  );

  // Estados y lógica para filtros y selección
  const [busqueda, setBusqueda] = useState('');
  const [municipioFiltro, setMunicipioFiltro] = useState('todos');

  // Modal de nueva comunidad o edición
  const [modalNuevaOpen, setModalNuevaOpen] = useState(false);
  const [comunidadEdit, setComunidadEdit] = useState<ComunidadMock | null>(null);
  // const [comunidadEdit, setComunidadEdit] = useState<Comunidad | null>(null);

  const [comunidadPerfilId, setComunidadPerfilId] = useState<string | null>(null);

  const [comunidades, setComunidades] = useState<ComunidadMock[]>(
    COMUNIDADES_HUASTECA.map(c => ({
      id: String(c.id),
      nombre: c.comunidad,
      municipio_nombre: c.municipio,
      localidad_nombre: '',
      lengua_indigena: '',
      poblacion: undefined,
      num_productores: undefined,
      latitud: c.latitud,
      longitud: c.longitud,
    }))
  );

  const [puntoActivoId, setPuntoActivoId] = useState<number | string | null>(null);

  // Cierra el panel de perfil si se entra a móvil
  useEffect(() => {
    if (isMobile && comunidadPerfilId) {
      setComunidadPerfilId(null);
    }
  }, [isMobile, comunidadPerfilId]);

  useEffect(() => {
    setMounted(true);

    // Guardar la última ruta visitada
    if (typeof window !== 'undefined') {
      localStorage.setItem('agro_last_path', window.location.pathname);
    }

    // Esperar 80ms para permitir la hidratación del usuario desde localStorage
    if (!usuario) {
      const timeout = setTimeout(() => {
        if (!useAppStore.getState().usuario) {
          router.replace('/login');
        }
      }, 80);

      return () => clearTimeout(timeout);
    }

    // Cargar municipios reales de comunidades si todavía no están
    if (municipiosStore.length === 0) {
      GET('/core/comunidades/municipios')
        .then((data: unknown) => {
          if (!Array.isArray(data)) {
            return;
          }

          const municipiosValidos = data.filter(
            (municipio): municipio is Municipio =>
              typeof municipio === 'object' &&
              municipio !== null &&
              'id' in municipio &&
              typeof (municipio as { id?: unknown }).id === 'number' &&
              'nombre' in municipio &&
              typeof (municipio as { nombre?: unknown }).nombre === 'string'
          );

          setMunicipios(municipiosValidos);
        })
        .catch(error => {
          console.error(
            'Error al cargar municipios de comunidades:',
            error
          );
        });
    }
  }, [usuario, router, municipiosStore.length, setMunicipios]);

  // Si no hay usuario, no renderizar nada
  if (!usuario) return null;
  if (!mounted) return null;

  // Filtrar comunidades según búsqueda y municipio.

  const ubicacionesFiltradas = puntosMapa.filter(p => {
    const termino = busqueda.toLowerCase();

    const coincideBusqueda =
      p.comunidad.toLowerCase().includes(termino) ||
      p.municipio.toLowerCase().includes(termino);

    const coincideMunicipio =
      municipioFiltro === 'todos' ||
      p.municipio === municipioFiltro;

    return coincideBusqueda && coincideMunicipio;
  });

  // Municipios únicos para los filtros del sidebar.
  // Se conserva temporalmente porque SidebarComunidades todavía utiliza
  // los datos mock.


  // Adaptar datos para la tabla (admin)
  const comunidadesTabla = comunidades;

  const mostrarSidebarComunidades = [
    'investigador',
    'tecnico_campo',
    'administrador',
  ].includes(rol ?? '');

  return (
    <AdminShell contentPadding="0" defaultSidebarCollapsed={true}>

      {/* Vista para administrador: tabla */}
      {rol === 'administrador' ? (
        <div
          style={{
            padding: 32,
            maxWidth: 1200,
            margin: '0 auto',
          }}
        >
          <h2
            style={{
              fontFamily: 'Fraunces,Georgia,serif',
              fontSize: 22,
              fontWeight: 900,
              color: '#C8820A',
              marginBottom: 18,
            }}
          >
            Comunidades registradas
          </h2>

          {comunidadPerfilId ? (
            <>
              {!isMobile && (
                <PerfilComunidad
                  id={comunidadPerfilId}
                  onVolver={() => setComunidadPerfilId(null)}
                  onEdit={id => {
                    setComunidadEdit(
                      comunidades.find(c => c.id === id) ?? null
                    );
                    setModalNuevaOpen(true);
                  }}
                />
              )}

              {modalNuevaOpen && !isMobile && (
                <ModalComunidad
                  comunidad={comunidadEdit}
                  onClose={() => {
                    setModalNuevaOpen(false);
                    setComunidadEdit(null);
                  }}
                  onSaved={() => {
                    setModalNuevaOpen(false);
                    setComunidadEdit(null);
                    setRecargaComunidades(prev => prev + 1);
                  }}
                />
              )}
            </>
          ) : (
            <TablaComunidades
              comunidades={comunidadesTabla}
              onEdit={comunidad => {
                setComunidadPerfilId(comunidad.id);
              }}
              onDelete={id => {
                setComunidades(prev =>
                  prev.filter(c => c.id !== id)
                );
              }}
            />
          )}
        </div>
      ) : (
        // Vista para otros roles: mapa y sidebar
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: isMobile
              ? 'calc(100dvh - var(--topbar-h,64px))'
              : 'calc(100vh - 64px)',
            minHeight: 0,
            margin: 0,
            padding: 0,
            background: '#f8fafc',
            overflow: 'hidden',
            boxSizing: 'border-box',
          }}
        >

          {/* Mapa ocupa todo el fondo */}
          <div
            style={{
              width: '100%',
              height: '100%',
              minHeight: 320,
              margin: 0,
              padding: 0,
              position: 'relative',
              zIndex: 1,
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
            }}
          >

            <MapaHuasteca
              puntos={ubicacionesFiltradas}
              height={undefined}
              selectedId={puntoActivoId}
              onSelectPoint={setPuntoActivoId}
              isMobile={isMobile}
            />

            {ubicacionesLoading && (
              <div
                style={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  zIndex: 10,
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.92)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Cargando ubicaciones…
              </div>
            )}

          </div>

          {/* Panel lateral flotante (sidebar de comunidades) */}
          {mostrarSidebarComunidades && (
            <SidebarComunidades
              rol={rol}
              busqueda={busqueda}
              setBusqueda={setBusqueda}
              municipioFiltro={municipioFiltro}
              setMunicipioFiltro={setMunicipioFiltro}
              municipiosMapa={municipiosMapa}
              ubicacionesFiltradas={ubicacionesFiltradas}

              puntoActivoId={puntoActivoId}
              setPuntoActivoId={setPuntoActivoId}
              setModalNuevaOpen={setModalNuevaOpen}
            />
          )}
        </div>
      )}

      {/* Modal para nueva comunidad (no admin) */}
      {modalNuevaOpen && rol !== 'administrador' && !isMobile && (
        <ModalComunidad
          comunidad={null}
          onClose={() => setModalNuevaOpen(false)}
          onSaved={() => {
            setModalNuevaOpen(false);
            setRecargaComunidades(prev => prev + 1);
          }}
        />
      )}

    </AdminShell>
  );
}