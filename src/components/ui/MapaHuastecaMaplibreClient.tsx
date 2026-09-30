'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import Map, { Marker, Popup, Source, Layer, MapRef } from 'react-map-gl/maplibre';
import type { MapLayerMouseEvent } from 'react-map-gl/maplibre';
import { useMedioParcela, type MedioParcela } from '@/hooks/useMedioParcela';
import styles from './MapaHuastecaMapLibreClient.module.css';
import PopupParcela from "./PopupParcela";
import PopupMedio from './PopupMedio';
import ListaPuntosCercanos from './ListaPuntosCercanos';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface PuntoMapaHuasteca {
  id: number | string;
  comunidad: string;
  municipio: string;
  latitud: number;
  longitud: number;
  imagenUrl?: string | null;
  poligono?: string | null;
}

interface PopupInfo extends PuntoMapaHuasteca {
  idx: number;
}

export interface ElementoMapa {
  key: string;
  id: number | string;
  tipo: 'parcela' | 'medio';
  nombre: string;
  latitud: number;
  longitud: number;
  punto?: PuntoMapaHuasteca;
  medio?: MedioParcela;
}

interface MunicipiosGeoJson {
  type: 'FeatureCollection';
  features: {
    type: 'Feature';
    geometry: {
      type: 'Polygon' | 'MultiPolygon';
      coordinates: number[][][] | number[][][][];
    };
    properties: Record<string, string | number | null> & {
      municipio?: string;
      municipio_key?: string;
    };
  }[];
}

interface MapaHuastecaMaplibreClientProps {
  puntos?: PuntoMapaHuasteca[];
  height?: number;
  isMobile?: boolean;
  selectedId?: number | string | null;
  onSelectPoint?: (id: number | string) => void;
}

// ─── Conversión de las coordenadas del polígono ────────────────────────────────

function wktPolygonToGeoJSON(
  wkt: string | null | undefined
): GeoJSON.Feature<GeoJSON.Polygon> | null {
  if (!wkt) return null;

  const match = wkt.match(
    /^\s*POLYGON\s*\(\((.*)\)\)\s*$/i
  );

  if (!match) {
    return null;
  }

  const coordinates = match[1]
    .split(',')
    .map((pair) => {
      const [lng, lat] = pair.trim().split(/\s+/).map(Number);

      if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
        return null;
      }

      return [lng, lat] as [number, number];
    })
    .filter(
      (coord): coord is [number, number] => coord !== null
    );

  if (coordinates.length < 4) {
    return null;
  }

  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [coordinates],
    },
  };
}

function fitMapToPolygon(
  mapRef: React.MutableRefObject<MapRef | null>,
  polygon: GeoJSON.Feature<GeoJSON.Polygon>
) {
  const coordinates = polygon.geometry.coordinates[0];

  if (!coordinates.length) {
    return;
  }

  const bounds = coordinates.reduce(
    (acc, coordinate) => {
      const [lng, lat] = coordinate;

      return [
        [
          Math.min(acc[0][0], lng),
          Math.min(acc[0][1], lat),
        ],
        [
          Math.max(acc[1][0], lng),
          Math.max(acc[1][1], lat),
        ],
      ] as [[number, number], [number, number]];
    },
    [
      [coordinates[0][0], coordinates[0][1]],
      [coordinates[0][0], coordinates[0][1]],
    ] as [[number, number], [number, number]]
  );

  mapRef.current?.fitBounds(bounds, {
    padding: 80,
    maxZoom: 18,
    duration: 900,
  });
}

function fitMapToMedio(
  mapRef: React.MutableRefObject<MapRef | null>,
  medio: MedioParcela
) {
  const lat = medio.ubicacion?.latitud;
  const lng = medio.ubicacion?.longitud;

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng)
  ) {
    return;
  }

  mapRef.current?.flyTo({
    center: [lng, lat],
    zoom: 18,
    duration: 800,
  });
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const DEFAULT_CENTER: [number, number] = [-99.0, 21.8];
const DEFAULT_ZOOM = 9;
const RADIO_SELECCION = 14;
const RADIO_PROXIMIDAD = 28;

const BASE_STYLES = [
  {
    id: 'minimal',
    name: 'Básico',
    url: '/maps/minStyle.json',
    terrain: false,
  },
  {
    id: 'streets',
    name: 'Calles',
    url: 'https://api.maptiler.com/maps/streets-v2/style.json?key=Q65Ltx3kCG3wapbpAkFb',
    terrain: false,
  },
  {
    id: 'outdoor-3d',
    name: 'Relieve 3D',
    url: 'https://api.maptiler.com/maps/outdoor-v2/style.json?key=Q65Ltx3kCG3wapbpAkFb',
    terrain: false,
  },
  {
    id: 'topo',
    name: 'Topográfico',
    url: 'https://api.maptiler.com/maps/topo-v2/style.json?key=Q65Ltx3kCG3wapbpAkFb',
    terrain: false,
  },
  {
    id: 'satellite',
    name: 'Satélite',
    url: 'https://api.maptiler.com/maps/hybrid/style.json?key=Q65Ltx3kCG3wapbpAkFb',
    terrain: false,
  },
];

const MUNICIPIO_COLORS = [
  '#E76F51',
  '#2A9D8F',
  '#E9C46A',
  '#264653',
  '#F4A261',
  '#A8DADC',
  '#457B9D',
  '#1D3557',
  '#6A994E',
  '#BC4749',
  '#A7C957',
  '#386641',
  '#6C584C',
  '#ADC178',
  '#DDE5B6',
];

const ENVOLVENTE_COORDS: [number, number][] = [
  [-99.63, 22.34],
  [-99.34, 22.37],
  [-98.96, 22.36],
  [-98.60, 22.31],
  [-98.36, 22.18],
  [-98.27, 21.98],
  [-98.29, 21.74],
  [-98.40, 21.50],
  [-98.58, 21.25],
  [-98.79, 21.08],
  [-99.06, 21.10],
  [-99.28, 21.19],
  [-99.48, 21.35],
  [-99.60, 21.58],
  [-99.66, 21.86],
  [-99.66, 22.12],
  [-99.63, 22.34],
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MUNICIPIO_EQUIVALENCIAS: Record<string, string> = {
  'tancanhuitz de santos': 'tancanhuitz',
};

function normalizeMunicipioKey(
  municipio: string | null | undefined
): string {
  if (!municipio) return '';

  let key = municipio
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');

  if (MUNICIPIO_EQUIVALENCIAS[key]) {
    key = MUNICIPIO_EQUIVALENCIAS[key];
  }

  return key;
}

function useInjectMaplibreCSS() {
  useEffect(() => {
    const id = 'maplibre-gl-css';

    if (document.getElementById(id)) return;

    const link = document.createElement('link');

    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/maplibre-gl@3/dist/maplibre-gl.css';

    document.head.appendChild(link);
  }, []);
}

async function fetchGeoJson(): Promise<MunicipiosGeoJson | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(
      '/data/huasteca-potosina-municipios.geojson',
      {
        cache: 'force-cache',
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!res.ok) return null;

    return (await res.json()) as MunicipiosGeoJson;
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

// ─── Componente principal ─────────────────────────────────────────────────────

const MapaHuastecaMaplibreClient: React.FC<
  MapaHuastecaMaplibreClientProps
> = ({
  puntos = [],
  isMobile = false,
  selectedId = null,
  onSelectPoint,
}) => {
    useInjectMaplibreCSS();

    const mapRef = useRef<MapRef | null>(null);

    // ─── Estado del mapa ────────────────────────────────────────────────────────

    const {
      data: mediosParcela = [],
    } = useMedioParcela();

    const [municipiosGeoJson, setMunicipiosGeoJson] =
      useState<MunicipiosGeoJson | null>(null);

    const [geoJsonLoading, setGeoJsonLoading] = useState(true);

    // Selección externa/interna del punto.
    // Se conserva porque el sidebar utiliza selectedId.
    const [activeId, setActiveId] =
      useState<number | string | null>(selectedId);

    // Popup de parcelas.
    const [popupInfo, setPopupInfo] =
      useState<PopupInfo | null>(null);

    const [elementosCercanos, setElementosCercanos] = useState<ElementoMapa[]>([]);
    const [listaCercanosAbierta, setListaCercanosAbierta] = useState(false);

    const [circuloSeleccion, setCirculoSeleccion] = useState<{
      longitud: number;
      latitud: number;
      radio: number;
    } | null>(null);

    const [zoom, setZoom] = useState(DEFAULT_ZOOM);
    const [styleReady, setStyleReady] = useState(false);

    // ─── Ubicación actual del dispositivo ───────────────────────────────────────

    const [ubicacionUsuario, setUbicacionUsuario] = useState<{
      latitud: number;
      longitud: number;
      precision?: number;
    } | null>(null);

    const [ubicacionCargando, setUbicacionCargando] = useState(false);

    const ubicacionInicialCentrada = useRef(false);

    // ─── Controles de capas ─────────────────────────────────────────────────────

    const defaultStyle =
      BASE_STYLES.find((s) => s.terrain) ?? BASE_STYLES[0];

    const [baseStyle, setBaseStyle] =
      useState(defaultStyle.url);

    const [terrainEnabled, setTerrainEnabled] =
      useState(false);

    const [showOutline, setShowOutline] =
      useState(true);

    const [showMunicipios, setShowMunicipios] =
      useState(true);

    const [showRoads, setShowRoads] =
      useState(false);

    const [showMediosParcela, setShowMediosParcela] =
      useState(false);

    const [panelCapasAbierto, setPanelCapasAbierto] =
      useState(false);

    const [medioPopup, setMedioPopup] =
      useState<MedioParcela | null>(null);

    // ─── Puntos válidos ─────────────────────────────────────────────────────────

    const puntosValidos = useMemo(
      () =>
        puntos.filter(
          (p) =>
            Number.isFinite(p.latitud) &&
            Number.isFinite(p.longitud)
        ),
      [puntos]
    );

    const elementosMapa = useMemo<ElementoMapa[]>(() => {
      const elementos: ElementoMapa[] = [];

      puntosValidos.forEach((punto) => {
        elementos.push({
          key: `parcela-${punto.id}`,
          id: punto.id,
          tipo: 'parcela',
          nombre: punto.comunidad || 'Parcela',
          latitud: punto.latitud,
          longitud: punto.longitud,
          punto,
        });
      });

      if (showMediosParcela) {
        mediosParcela.forEach((medio) => {
          const latitud = medio.ubicacion?.latitud;
          const longitud = medio.ubicacion?.longitud;

          if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) {
            return;
          }

          elementos.push({
            key: `medio-${medio.id}`,
            id: medio.id,
            tipo: 'medio',
            nombre:
              medio.descripcion ||
              medio.nombre_archivo ||
              medio.subtipo ||
              medio.tipo_medio ||
              'Medio de parcela',
            latitud,
            longitud,
            medio,
          });
        });
      }

      return elementos;
    }, [puntosValidos, mediosParcela, showMediosParcela]);

    // ─── Medios de parcela como GeoJSON ─────────────────────────────────────────

    const mediosParcelaGeoJson = useMemo(
      () => ({
        type: 'FeatureCollection' as const,
        features: mediosParcela
          .filter((medio) => {
            const lat = medio.ubicacion?.latitud;
            const lng = medio.ubicacion?.longitud;

            return (
              Number.isFinite(lat) &&
              Number.isFinite(lng)
            );
          })
          .map((medio) => ({
            type: 'Feature' as const,
            properties: {
              id: medio.id,
              parcela_id: medio.parcela_id,
              ubicacion_id: medio.ubicacion_id,
              tipo_medio: medio.tipo_medio,
              subtipo: medio.subtipo,
              nombre_archivo: medio.nombre_archivo,
              descripcion: medio.descripcion,
              fecha_captura: medio.fecha_captura,
              url_temporal: medio.url_temporal,
            },
            geometry: {
              type: 'Point' as const,
              coordinates: [
                medio.ubicacion.longitud,
                medio.ubicacion.latitud,
              ],
            },
          })),
      }),
      [mediosParcela]
    );

    // ─── Polígono seleccionado ──────────────────────────────────────────────────

    const poligonoSeleccionado = useMemo(() => {
      if (
        selectedId === null ||
        selectedId === undefined
      ) {
        return null;
      }

      const puntoSeleccionado = puntosValidos.find(
        (punto) => punto.id === selectedId
      );

      if (!puntoSeleccionado?.poligono) {
        return null;
      }

      return wktPolygonToGeoJSON(
        puntoSeleccionado.poligono
      );
    }, [puntosValidos, selectedId]);

    // ─── Municipio activo ───────────────────────────────────────────────────────

    const municipioActivo =
      popupInfo?.municipio ??
      puntosValidos.find(
        (p) => p.id === activeId
      )?.municipio ??
      null;

    const municipioActivoKey =
      normalizeMunicipioKey(municipioActivo);

    // ─── Colores por municipio ──────────────────────────────────────────────────

    const colorMunicipio = useMemo(() => {
      const uniqueMunicipios = [
        ...new Set(
          puntosValidos.map((p) =>
            normalizeMunicipioKey(p.municipio)
          )
        ),
      ];

      return Object.fromEntries(
        uniqueMunicipios.map((key, i) => [
          key,
          MUNICIPIO_COLORS[
          i % MUNICIPIO_COLORS.length
          ],
        ])
      );
    }, [puntosValidos]);

    // ─── Cargar GeoJSON ─────────────────────────────────────────────────────────

    useEffect(() => {
      setGeoJsonLoading(true);

      fetchGeoJson().then((geojson) => {
        if (geojson) {
          geojson.features.forEach((f) => {
            if (f.properties?.municipio) {
              f.properties.municipio_key =
                normalizeMunicipioKey(
                  f.properties.municipio as string
                );
            }
          });

          setMunicipiosGeoJson(geojson);
        }

        setGeoJsonLoading(false);
      });
    }, []);

    // ─── Obtener ubicación automáticamente ──────────────────────────────────────

    useEffect(() => {
      obtenerUbicacionUsuario();
    }, []);

    // ─── Sincronizar selectedId externo ─────────────────────────────────────────

    useEffect(() => {
      setActiveId(selectedId ?? null);

      if (selectedId === null || selectedId === undefined) {
        setPopupInfo(null);
        setElementosCercanos([]);
        setListaCercanosAbierta(false);
        setCirculoSeleccion(null);
        return;
      }

      const punto = puntosValidos.find(
        (p) => p.id === selectedId
      );

      if (!punto) {
        return;
      }

      const idx = puntosValidos.findIndex(
        (p) => p.id === selectedId
      );

      setElementosCercanos([]);
      setListaCercanosAbierta(false);

      setCirculoSeleccion({
        longitud: punto.longitud,
        latitud: punto.latitud,
        radio: RADIO_SELECCION,
      });

      setPopupInfo({
        ...punto,
        idx,
      });
    }, [selectedId, puntosValidos]);

    // ─── Aplicar terreno 3D ─────────────────────────────────────────────────────

    useEffect(() => {
      applyTerrain();
    }, [terrainEnabled, baseStyle]);

    // ─── Reset de styleReady ────────────────────────────────────────────────────

    useEffect(() => {
      setStyleReady(false);
    }, [baseStyle]);

    const applyTerrain = () => {
      const map = mapRef.current?.getMap?.();

      if (!map) return;

      if (!terrainEnabled) {
        if (map.getTerrain()) {
          map.setTerrain(null);
        }

        return;
      }

      if (!map.isStyleLoaded()) return;

      if (!map.getSource('maptiler-dem')) {
        map.addSource('maptiler-dem', {
          type: 'raster-dem',
          url: 'https://api.maptiler.com/tiles/terrain-rgb/tiles.json?key=Q65Ltx3kCG3wapbpAkFb',
          tileSize: 512,
          maxzoom: 12,
        });
      }

      map.setTerrain({
        source: 'maptiler-dem',
        exaggeration: 1.8,
      });

      map.easeTo({
        pitch: 45,
        bearing: -17,
        duration: 800,
      });
    };

    // ─── Handler: estilo listo ──────────────────────────────────────────────────

    const handleStyleData = () => {
      setStyleReady(true);
      applyTerrain();
    };

    // ─── Visibilidad de carreteras ──────────────────────────────────────────────

    useEffect(() => {
      const map = mapRef.current?.getMap?.();

      if (!map || !styleReady) return;

      const visibility =
        showRoads ? 'visible' : 'none';

      [
        'roads-trunk',
        'roads-primary',
        'roads-secondary',
      ].forEach((layerId) => {
        if (map.getLayer(layerId)) {
          map.setLayoutProperty(
            layerId,
            'visibility',
            visibility
          );
        }
      });
    }, [showRoads, styleReady]);

    // ─── Handler: clic en municipios ────────────────────────────────────────────

    const handleMapClick = (
      e: MapLayerMouseEvent
    ) => {
      if (
        !municipiosGeoJson ||
        !showMunicipios
      ) {
        return;
      }

      const municipioFeature = (
        e.features ?? []
      ).find(
        (f) => f.source === 'municipios'
      );

      if (
        !municipioFeature?.properties ||
        !municipioFeature.geometry
      ) {
        return;
      }

      const geom =
        municipioFeature.geometry as
        MunicipiosGeoJson['features'][0]['geometry'];

      let coords:
        | [number, number][]
        | undefined;

      if (geom.type === 'Polygon') {
        coords =
          geom.coordinates[0] as [
            number,
            number
          ][];
      } else if (
        geom.type === 'MultiPolygon'
      ) {
        coords =
          (
            geom.coordinates as number[][][][]
          )[0]?.[0] as [
            number,
            number
          ][];
      }

      if (!coords?.length) return;

      const sumLng = coords.reduce(
        (acc, c) => acc + c[0],
        0
      );

      const sumLat = coords.reduce(
        (acc, c) => acc + c[1],
        0
      );

      const lng =
        sumLng / coords.length;

      const lat =
        sumLat / coords.length;

      if (
        !Number.isFinite(lng) ||
        !Number.isFinite(lat)
      ) {
        return;
      }

      setPopupInfo(null);

      const map =
        mapRef.current?.getMap?.();

      const openPopup = () =>
        setPopupInfo({
          id: String(
            municipioFeature.properties
              ?.municipio_key ??
            municipioFeature.properties
              ?.municipio ??
            'municipio'
          ),
          comunidad: '',
          municipio: String(
            municipioFeature.properties
              ?.municipio ?? ''
          ),
          latitud: lat,
          longitud: lng,
          idx: 0,
        });

      if (map) {
        map.once(
          'moveend',
          openPopup
        );

        map.easeTo({
          center: [lng, lat],
          duration: 400,
          zoom: Math.max(
            map.getZoom(),
            11
          ),
        });
      } else {
        openPopup();
      }
    };

    // ─── Handler: medios de parcela ─────────────────────────────────────────────

    const handleMedioClick = (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];

      if (!feature) return;

      const medio = mediosParcela.find(
        (item) => item.id === feature.properties?.id
      );

      if (!medio) return;

      const elemento = elementosMapa.find(
        (item) =>
          item.tipo === 'medio' &&
          item.id === medio.id
      );

      if (!elemento) return;

      seleccionarElementoContextual(
        elemento,
        {
          x: event.point.x,
          y: event.point.y,
        }
      );
    };

    const limpiarSeleccionContextual = () => {
      setElementosCercanos([]);
      setListaCercanosAbierta(false);
      setCirculoSeleccion(null);
      setPopupInfo(null);
      setActiveId(null);
    };

    const abrirPopupDeElemento = (
      elemento: ElementoMapa,
      idx = 0
    ) => {
      setElementosCercanos([]);
      setListaCercanosAbierta(false);

      setCirculoSeleccion({
        longitud: elemento.longitud,
        latitud: elemento.latitud,
        radio: RADIO_SELECCION,
      });

      if (elemento.tipo === 'parcela' && elemento.punto) {
        setMedioPopup(null);
        setActiveId(elemento.punto.id);

        setPopupInfo({
          ...elemento.punto,
          idx,
        });

        onSelectPoint?.(elemento.punto.id);

        return;
      }

      if (elemento.tipo === 'medio' && elemento.medio) {
        setPopupInfo(null);
        setActiveId(null);
        setMedioPopup(elemento.medio);
      }
    };

    const seleccionarElementoContextual = (
      elementoInicial: ElementoMapa,
      puntoPantalla?: { x: number; y: number }
    ) => {
      const map = mapRef.current?.getMap?.();

      if (!map) return;

      const puntoReferencia = puntoPantalla ?? {
        x: map.project([
          elementoInicial.longitud,
          elementoInicial.latitud,
        ]).x,
        y: map.project([
          elementoInicial.longitud,
          elementoInicial.latitud,
        ]).y,
      };

      const elementosCercanosCalculados = elementosMapa.filter((elemento) => {
        const punto = map.project([
          elemento.longitud,
          elemento.latitud,
        ]);

        const dx = punto.x - puntoReferencia.x;
        const dy = punto.y - puntoReferencia.y;

        return Math.sqrt(dx * dx + dy * dy) <= RADIO_PROXIMIDAD;
      });

      if (elementosCercanosCalculados.length <= 1) {
        abrirPopupDeElemento(elementoInicial);
        return;
      }

      setPopupInfo(null);
      setActiveId(null);

      setElementosCercanos(elementosCercanosCalculados);
      setListaCercanosAbierta(true);

      const centro = map.unproject([
        puntoReferencia.x,
        puntoReferencia.y,
      ]);

      setCirculoSeleccion({
        longitud: centro.lng,
        latitud: centro.lat,
        radio: RADIO_PROXIMIDAD,
      });
    };

    // ─── Seleccionar parcela ────────────────────────────────────────────────────

    const seleccionarPunto = (
      punto: PuntoMapaHuasteca
    ) => {
      const elemento = elementosMapa.find(
        (elemento) =>
          elemento.tipo === 'parcela' &&
          elemento.id === punto.id
      );

      if (!elemento) return;

      const map = mapRef.current?.getMap?.();

      if (!map) return;

      const puntoPantalla = map.project([
        punto.longitud,
        punto.latitud,
      ]);

      seleccionarElementoContextual(
        elemento,
        {
          x: puntoPantalla.x,
          y: puntoPantalla.y,
        }
      );
    };

    // ─── Geolocalización del usuario ────────────────────────────────────────────

    const obtenerUbicacionUsuario = (
      forzarCentrado = false
    ) => {
      if (
        typeof navigator === 'undefined' ||
        !navigator.geolocation
      ) {
        return;
      }

      setUbicacionCargando(true);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitud =
            position.coords.latitude;

          const longitud =
            position.coords.longitude;

          const precision =
            position.coords.accuracy;

          if (
            !Number.isFinite(latitud) ||
            !Number.isFinite(longitud)
          ) {
            setUbicacionCargando(false);
            return;
          }

          const nuevaUbicacion = {
            latitud,
            longitud,
            precision,
          };

          setUbicacionUsuario(
            nuevaUbicacion
          );

          setUbicacionCargando(false);

          const map =
            mapRef.current?.getMap?.();

          if (
            map &&
            (
              forzarCentrado ||
              !ubicacionInicialCentrada.current
            )
          ) {
            map.flyTo({
              center: [
                longitud,
                latitud,
              ],
              zoom: 10,
              duration: 1200,
            });

            ubicacionInicialCentrada.current =
              true;
          }
        },
        () => {
          setUbicacionCargando(false);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000,
        }
      );
    };

    // ─── Capas del mapa ─────────────────────────────────────────────────────────

    const municipiosLayer = useMemo(
      () =>
        municipiosGeoJson
          ? {
            id: 'municipios',
            type: 'fill' as const,
            source: 'municipios',
            paint: {
              'fill-color': [
                'case',
                [
                  '==',
                  [
                    'get',
                    'municipio_key',
                  ],
                  municipioActivoKey,
                ],
                '#FFD600',
                '#D1D5DB',
              ] as maplibregl.ExpressionSpecification,
              'fill-opacity': 0.15,
            },
          }
          : null,
      [
        municipiosGeoJson,
        municipioActivoKey,
      ]
    );

    const municipiosLineLayer = useMemo(
      () =>
        municipiosGeoJson
          ? {
            id: 'municipios-outline',
            type: 'line' as const,
            source: 'municipios',
            paint: {
              'line-color':
                '#166534',
              'line-width': 1.5,
            },
          }
          : null,
      [municipiosGeoJson]
    );

    // ─── Tamaño de marcadores según zoom ────────────────────────────────────────

    const getMarkerSize = () => {
      const minZ = 8;
      const maxZ = 14;

      const t = Math.max(
        0,
        Math.min(
          1,
          (zoom - minZ) /
          (maxZ - minZ)
        )
      );

      const base = isMobile ? 22 : 16;
      const max = isMobile ? 34 : 28;

      return Math.round(
        base + (max - base) * t
      );
    };

    return (
      <div
        className="mapa-huasteca-maplibre-container"
        style={{
          position: 'fixed',
          top: 'var(--topbar-h, 64px)',
          left: 0,
          width: '100vw',
          height: isMobile
            ? 'calc(100dvh - var(--topbar-h, 64px))'
            : '100vh',
          zIndex: 1,
          overflow: 'hidden',
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
          background: '#f8fafc',
        }}
      >
        <style>{`
        html, body, #__next {
          margin: 0 !important;
          padding: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          overflow: hidden !important;
        }

        .mapa-huasteca-maplibre-container {
          margin: 0 !important;
          padding: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          overflow: visible !important;
        }

        .btn-capas {
          position: fixed !important;
          background: #fff !important;
          z-index: 3002 !important;
          pointer-events: auto !important;
        }

        html.dark .btn-capas {
          background: #1F2937 !important;
        }

        .maplibregl-ctrl-top-right {
          z-index: 500 !important;
        }

        .maplibregl-ctrl-bottom-left {
          z-index: 500 !important;
        }

        .maplibregl-popup-close-button {
          font-size: 20px !important;
          color: #C8820A !important;
        }

        .panel-capas {
          background: #fff !important;
          color: #1F2937;
        }

        html.dark .panel-capas {
          background: #1F2937 !important;
          color: #fff;
        }
      `}</style>

        {/* Loader */}
        {geoJsonLoading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background:
                'rgba(255,255,255,0.85)',
              zIndex: 999,
            }}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: 12,
                padding:
                  '18px 28px',
                fontWeight: 700,
                color: '#C8820A',
                fontSize: 18,
                textAlign: 'center',
              }}
            >
              Cargando mapa SIG…
              <br />

              <span
                style={{
                  fontWeight: 400,
                  fontSize: 14,
                  color: '#6B7280',
                }}
              >
                Por favor espera…
              </span>
            </div>
          </div>
        )}

        {/* Botón de capas */}
        <button
          className="btn-capas"
          aria-label={
            panelCapasAbierto
              ? 'Cerrar panel de capas'
              : 'Abrir panel de capas'
          }
          title={
            panelCapasAbierto
              ? 'Cerrar capas'
              : 'Mostrar capas'
          }
          onClick={() =>
            setPanelCapasAbierto(
              (v) => !v
            )
          }
          style={{
            position: 'fixed',
            top: isMobile
              ? 'calc(var(--topbar-h,64px) + 12px)'
              : 'calc(var(--topbar-h,64px) + 77px)',
            right: isMobile
              ? 'auto'
              : '24px',
            left: isMobile
              ? '12px'
              : 'auto',
            width: 48,
            height: 48,
            borderRadius: 14,
            border:
              '2.5px solid #FFD600',
            background: '#fff',
            boxShadow:
              '0 4px 16px rgba(61,34,8,.13)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
            zIndex: 3002,
            pointerEvents: 'auto',
          }}
        >
          {panelCapasAbierto ? (
            <span
              style={{
                fontSize: 28,
                lineHeight: 1,
                fontWeight: 800,
                color: '#C8820A',
              }}
            >
              ×
            </span>
          ) : (
            <img
              src="/img/layers_icon3.png"
              alt="layerIcon"
              height={36}
            />
          )}
        </button>

        {/* Botón de ubicación actual */}
        <button
          type="button"
          aria-label="Mostrar mi ubicación"
          title={
            ubicacionCargando
              ? 'Obteniendo ubicación…'
              : ubicacionUsuario
                ? 'Volver a mi ubicación'
                : 'Mostrar mi ubicación'
          }
          onClick={() =>
            obtenerUbicacionUsuario(true)
          }
          style={{
            position: 'fixed',
            top: isMobile
              ? 'calc(var(--topbar-h,64px) + 72px)'
              : 'calc(var(--topbar-h,64px) + 18px)',
            right: isMobile
              ? '12px'
              : '24px',
            left: 'auto',
            width: 48,
            height: 48,
            borderRadius: 14,
            border:
              '2.5px solid #FFD600',
            background: '#fff',
            boxShadow:
              '0 4px 16px rgba(61,34,8,.13)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: ubicacionCargando
              ? 'wait'
              : 'pointer',
            padding: 0,
            zIndex: 3002,
            pointerEvents: 'auto',
            opacity:
              ubicacionCargando
                ? 0.7
                : 1,
          }}
        >
          <img
            src={
              ubicacionCargando
                ? '/img/cargando6.png'
                : '/img/miUbicacion.png'
            }
            className={
              ubicacionCargando
                ? styles['loading-steps']
                : undefined
            }
            alt={
              ubicacionCargando
                ? 'Cargando...'
                : 'Ubicación'
            }
            width={36}
            height={36}
            style={{
              display: 'block',
              objectFit: 'contain',
            }}
          />
        </button>

        {/* Panel de capas */}
        {panelCapasAbierto && (
          <div
            className="panel-capas"
            style={{
              position: 'absolute',
              top: '128px',
              left: 'auto',
              right: '24px',
              zIndex: 99999,
              borderRadius: 12,
              boxShadow:
                '0 6px 24px rgba(61,34,8,.16)',
              padding:
                '16px 18px 12px',
              fontSize: 14,
              minWidth: 220,
              maxWidth:
                'min(420px, 100vw - 32px)',
              width: 'auto',
              border:
                '1.5px solid #E2E8F0',
              margin: 0,
              ...(isMobile
                ? {
                  left: 0,
                  right: 0,
                  top: 'calc(var(--topbar-h) + 8px)',
                  maxWidth: '100vw',
                  minWidth: 0,
                  borderRadius: 0,
                  boxShadow:
                    '0 2px 12px rgba(61,34,8,.10)',
                }
                : {}),
            }}
          >
            <div
              style={{
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Capas base
            </div>

            {BASE_STYLES.map(
              (style) => (
                <label
                  key={style.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 4,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="baseStyle"
                    checked={
                      baseStyle ===
                      style.url
                    }
                    onChange={() =>
                      setBaseStyle(
                        style.url
                      )
                    }
                  />

                  {style.name}
                </label>
              )
            )}

            <div
              style={{
                fontWeight: 700,
                margin:
                  '12px 0 6px',
              }}
            >
              Capas SIG
            </div>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: 4,
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={
                  showMunicipios
                }
                onChange={() =>
                  setShowMunicipios(
                    (v) => !v
                  )
                }
              />

              Municipios
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={showOutline}
                onChange={() =>
                  setShowOutline(
                    (v) => !v
                  )
                }
              />

              Envolvente regional
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: 4,
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={showRoads}
                onChange={() =>
                  setShowRoads(
                    (v) => !v
                  )
                }
              />

              Carreteras principales
            </label>

            <label>
              <input
                type="checkbox"
                checked={
                  showMediosParcela
                }
                onChange={(e) =>
                  setShowMediosParcela(
                    e.target.checked
                  )
                }
              />

              Fotos y medios de parcela
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 4,
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={
                  terrainEnabled
                }
                onChange={() =>
                  setTerrainEnabled(
                    (v) => !v
                  )
                }
              />

              Terreno 3D
            </label>
          </div>
        )}

        {/* Mapa principal */}
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: DEFAULT_CENTER[0],
            latitude: DEFAULT_CENTER[1],
            zoom: DEFAULT_ZOOM,
            pitch: terrainEnabled ? 45 : 0,
            bearing: terrainEnabled ? -17 : 0,
          }}
          mapStyle={baseStyle}
          style={{
            width: '100vw',
            height: '100vh',
          }}
          attributionControl={{
            compact: true,
          }}
          dragRotate
          touchPitch
          interactiveLayerIds={[
            ...(showMunicipios
              ? ['municipios']
              : []),
            ...(showMediosParcela
              ? [
                'medios-parcela-puntos',
              ]
              : []),
          ]}
          onLoad={() => {
            applyTerrain();

            if (
              ubicacionUsuario &&
              !ubicacionInicialCentrada.current
            ) {
              mapRef.current
                ?.getMap?.()
                .flyTo({
                  center: [
                    ubicacionUsuario.longitud,
                    ubicacionUsuario.latitud,
                  ],
                  zoom: 15,
                  duration: 1200,
                });

              ubicacionInicialCentrada.current =
                true;
            }
          }}
          onStyleData={
            handleStyleData
          }
          onClick={(event) => {
            const clickedLayer = event.features?.[0]?.layer?.id;

            if (clickedLayer === 'medios-parcela-puntos') {
              handleMedioClick(event);
              return;
            }

            const municipioFeature = (event.features ?? []).find(
              (feature) =>
                feature.layer?.id === 'municipios'
            );

            if (municipioFeature) {
              handleMapClick(event);
              return;
            }

            limpiarSeleccionContextual();
          }}
          onZoom={(e) =>
            setZoom(
              e.viewState.zoom
            )
          }
          onMouseMove={(event) => {
            const canvas =
              event.target.getCanvas();

            const isMedioParcela =
              event.features?.some(
                (feature) =>
                  feature.layer?.id ===
                  'medios-parcela-puntos'
              );

            canvas.style.cursor =
              isMedioParcela
                ? 'pointer'
                : '';
          }}
        >
          {/* Capa agua */}
          {styleReady && (
            <Source
              id="osm-water"
              type="vector"
              url="https://api.maptiler.com/tiles/v3/tiles.json?key=Q65Ltx3kCG3wapbpAkFb"
            >
              <Layer
                id="osm-water-fill"
                source-layer="water"
                type="fill"
                paint={{
                  'fill-color':
                    '#3B82F6',
                  'fill-opacity':
                    0.35,
                }}
              />

              <Layer
                id="osm-water-line"
                source-layer="water"
                type="line"
                paint={{
                  'line-color':
                    '#2563EB',
                  'line-width': 1.2,
                  'line-opacity':
                    0.7,
                }}
              />
            </Source>
          )}

          {/* Capa municipios */}
          {styleReady &&
            municipiosGeoJson &&
            showMunicipios && (
              <Source
                id="municipios"
                type="geojson"
                data={
                  municipiosGeoJson as GeoJSON.FeatureCollection
                }
              >
                {municipiosLayer && (
                  <Layer
                    {...municipiosLayer}
                  />
                )}

                {municipiosLineLayer && (
                  <Layer
                    {...municipiosLineLayer}
                  />
                )}
              </Source>
            )}

          {/* Envolvente regional */}
          {styleReady &&
            showOutline && (
              <Source
                id="envolvente"
                type="geojson"
                data={{
                  type: 'Feature',
                  geometry: {
                    type: 'Polygon',
                    coordinates: [
                      ENVOLVENTE_COORDS,
                    ],
                  },
                  properties: {},
                }}
              >
                <Layer
                  id="envolvente-outline"
                  type="line"
                  paint={{
                    'line-color':
                      '#2A5C3F',
                    'line-width': 2.4,
                    'line-dasharray': [
                      5,
                      4,
                    ],
                  }}
                />

                <Layer
                  id="envolvente-fill"
                  type="fill"
                  paint={{
                    'fill-color':
                      '#2A5C3F',
                    'fill-opacity':
                      0.06,
                  }}
                />
              </Source>
            )}

          {circuloSeleccion && (
            <Source
              id="circulo-seleccion"
              type="geojson"
              data={{
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Point',
                  coordinates: [
                    circuloSeleccion.longitud,
                    circuloSeleccion.latitud,
                  ],
                },
              }}
            >
              <Layer
                id="circulo-seleccion-fill"
                type="circle"
                paint={{
                  'circle-radius': circuloSeleccion.radio,
                  'circle-color': '#C8820A',
                  'circle-opacity': 0.10,
                  'circle-stroke-color': '#C8820A',
                  'circle-stroke-width': 2,
                  'circle-stroke-opacity': 0.9,
                }}
              />
            </Source>
          )}

          {/* Polígono seleccionado */}
          {poligonoSeleccionado && (
            <Source
              id="parcela-seleccionada"
              type="geojson"
              data={
                poligonoSeleccionado
              }
            >
              <Layer
                id="parcela-seleccionada-fill"
                type="fill"
                paint={{
                  'fill-color':
                    '#C8820A',
                  'fill-opacity':
                    0.22,
                }}
              />

              <Layer
                id="parcela-seleccionada-outline"
                type="line"
                paint={{
                  'line-color':
                    '#8B5A08',
                  'line-width': 3,
                  'line-opacity':
                    0.95,
                }}
              />
            </Source>
          )}

          {/* Medios de parcela */}
          {showMediosParcela &&
            mediosParcelaGeoJson
              .features.length >
            0 && (
              <Source
                id="medios-parcela"
                type="geojson"
                data={
                  mediosParcelaGeoJson
                }
              >
                <Layer
                  id="medios-parcela-puntos"
                  type="circle"
                  paint={{
                    'circle-radius': 8,
                    'circle-color':
                      '#C8820A',
                    'circle-stroke-color':
                      '#FFFFFF',
                    'circle-stroke-width': 2,
                    'circle-opacity':
                      0.95,
                  }}
                />
              </Source>
            )}

          {/* Ubicación actual del usuario */}
          {ubicacionUsuario && (
            <Marker
              longitude={
                ubicacionUsuario.longitud
              }
              latitude={
                ubicacionUsuario.latitud
              }
              anchor="center"
              style={{
                zIndex: 50,
                pointerEvents:
                  'none',
              }}
            >
              <div
                title="Mi ubicación"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background:
                    '#2563EB',
                  border:
                    '3px solid #FFFFFF',
                  boxShadow:
                    '0 0 0 5px rgba(37,99,235,0.25), 0 2px 8px rgba(0,0,0,0.35)',
                  display: 'flex',
                  alignItems:
                    'center',
                  justifyContent:
                    'center',
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius:
                      '50%',
                    background:
                      '#FFFFFF',
                  }}
                />
              </div>
            </Marker>
          )}

          {/* Marcadores de parcelas */}
          {!geoJsonLoading &&
            puntosValidos.map(
              (punto, idx) => {
                if (
                  popupInfo &&
                  punto.id ===
                  popupInfo.id &&
                  popupInfo.comunidad
                ) {
                  return null;
                }

                const municipioKey = normalizeMunicipioKey(punto.municipio);
                const size = getMarkerSize();

                return (
                  <Marker
                    key={punto.id}
                    longitude={
                      punto.longitud
                    }
                    latitude={
                      punto.latitud
                    }
                    anchor="center"
                    onClick={(e) => {
                      e.originalEvent.stopPropagation();
                      seleccionarPunto(punto);
                    }}
                    style={{
                      cursor:
                        'pointer',
                      zIndex: 5,
                    }}
                  >
                    <div
                      title={`${punto.comunidad} (${punto.municipio})`}
                      style={{
                        width: size,
                        height: size,
                        borderRadius:
                          '50%',
                        background:
                          colorMunicipio[
                          municipioKey
                          ] ??
                          '#FFD600',
                        border:
                          '1.5px solid rgba(255,255,255,0.8)',
                        boxShadow:
                          '0 1px 4px rgba(0,0,0,0.25)',
                        display:
                          'flex',
                        alignItems:
                          'center',
                        justifyContent:
                          'center',
                        transition:
                          'all 0.15s',
                      }}
                    >
                      {/* Ícono grano de maíz */}
                      <svg
                        width={Math.round(
                          size * 0.5
                        )}
                        height={Math.round(
                          size * 0.6
                        )}
                        viewBox="0 0 12 16"
                        fill="none"
                      >
                        <ellipse
                          cx="6"
                          cy="8"
                          rx="5"
                          ry="7"
                          fill="#FFD600"
                          stroke="#C8820A"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </div>
                  </Marker>
                );
              }
            )}

          {/* Popup escritorio */}
          {popupInfo && !isMobile && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(var(--topbar-h, 64px) + 72px)',
                right: 230,
                width: 340,
                maxWidth: 'calc(100vw - 48px)',
                zIndex: 3005,
              }}
            >
              <PopupParcela
                info={popupInfo}
                onClose={() => setPopupInfo(null)}
                onAcercar={() => {
                  const polygon =
                    wktPolygonToGeoJSON(
                      popupInfo.poligono!
                    );

                  if (polygon) {
                    fitMapToPolygon(
                      mapRef,
                      polygon
                    );
                  }
                }}
              />
            </div>
          )}

          {/* Popup de medios */}
          {medioPopup && (
            <div
              style={{
                position: 'absolute',

                top: isMobile
                  ? 'auto'
                  : 'calc(var(--topbar-h, 64px) + 68px)',

                bottom: isMobile
                  ? 'calc(var(--topbar-h, 64px) + 144px)'
                  : 'auto',

                right: isMobile
                  ? 'auto'
                  : 248,

                left: isMobile
                  ? '50%'
                  : 'auto',

                transform: isMobile
                  ? 'translateX(-50%)'
                  : 'none',

                width: isMobile
                  ? 'min(340px, calc(100vw - 24px))'
                  : 340,

                maxWidth: 'calc(100vw - 48px)',
                zIndex: 3005,
              }}
            >
              <PopupMedio
                medio={medioPopup}
                isMobile={isMobile}
                onClose={() => setMedioPopup(null)}
                onAcercar={() => {
                  fitMapToMedio(mapRef, medioPopup);
                }}
              />
            </div>
          )}
        </Map>

        {/* Popup móvil */}
        {popupInfo &&
          isMobile && (
            <div
              style={{
                position: 'fixed',
                top: 'var(--topbar-h, 64px)',
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  'rgba(0,0,0,0.5)',
                zIndex: 9999,
                display: 'flex',
                alignItems:
                  'center',
                justifyContent:
                  'center',
                padding: '1rem',
              }}
              onClick={() =>
                setPopupInfo(null)
              }
            >
              <div
                onClick={(e) =>
                  e.stopPropagation()
                }
                style={{
                  width:
                    'calc(90vw - var(--sidebar-w, 64px) - 24px)',
                  maxWidth: 420,
                  minWidth: 220,
                  zIndex: 10000,
                  position: 'fixed',
                  left:
                    'calc(var(--sidebar-w, 64px) + 12px)',
                  top: '50%',
                  transform:
                    'translateY(-50%)',
                  margin: 0,
                  right: 0,
                  background: 'none',
                  pointerEvents:
                    'auto',
                  display: 'flex',
                  justifyContent:
                    'center',
                }}
              >
                <div
                  style={{
                    width: '100%',
                  }}
                >
                  <PopupParcela
                    info={popupInfo}
                    onClose={() => setPopupInfo(null)}
                    onAcercar={() => {
                      const polygon =
                        wktPolygonToGeoJSON(
                          popupInfo.poligono!
                        );

                      if (polygon) {
                        fitMapToPolygon(
                          mapRef,
                          polygon
                        );
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}

        {listaCercanosAbierta && elementosCercanos.length > 1 && (
          <ListaPuntosCercanos
            elementos={elementosCercanos}
            isMobile={isMobile}
            onSeleccionar={abrirPopupDeElemento}
            onCerrar={() => {
              setListaCercanosAbierta(false);
              setPopupInfo(null);
            }}
          />
        )}

      </div>
    );
  };

export default MapaHuastecaMaplibreClient;