'use client';

import React, { useRef, useState, useEffect, useMemo, Fragment } from 'react';
import Map, { Marker, Popup, Source, Layer, MapRef } from 'react-map-gl/maplibre';
import type { MapLayerMouseEvent } from 'react-map-gl/maplibre';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface PuntoMapaHuasteca {
  id: number | string;
  comunidad: string;
  municipio: string;
  latitud: number;
  longitud: number;
}

interface PopupInfo extends PuntoMapaHuasteca {
  idx: number;
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

// ─── Constantes ───────────────────────────────────────────────────────────────

const DEFAULT_CENTER: [number, number] = [-99.0, 21.8];
const DEFAULT_ZOOM = 9;

const BASE_STYLES = [
  {
  id: 'minimal',
  name: 'Agroplataforma',
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
  '#E76F51', '#2A9D8F', '#E9C46A', '#264653', '#F4A261',
  '#A8DADC', '#457B9D', '#1D3557', '#6A994E', '#BC4749',
  '#A7C957', '#386641', '#6C584C', '#ADC178', '#DDE5B6',
];

const ENVOLVENTE_COORDS: [number, number][] = [
  [-99.63, 22.34], [-99.34, 22.37], [-98.96, 22.36], [-98.60, 22.31],
  [-98.36, 22.18], [-98.27, 21.98], [-98.29, 21.74], [-98.40, 21.50],
  [-98.58, 21.25], [-98.79, 21.08], [-99.06, 21.10], [-99.28, 21.19],
  [-99.48, 21.35], [-99.60, 21.58], [-99.66, 21.86], [-99.66, 22.12],
  [-99.63, 22.34],
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Mapeo para nombres alternativos de municipios
const MUNICIPIO_EQUIVALENCIAS: Record<string, string> = {
  'tancanhuitz de santos': 'tancanhuitz',
};

function normalizeMunicipioKey(municipio: string | null | undefined): string {
  if (!municipio) return '';
  let key = municipio
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');
  // Aplica equivalencias
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
    const res = await fetch('/data/huasteca-potosina-municipios.geojson', {
      cache: 'force-cache',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return (await res.json()) as MunicipiosGeoJson;
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

// ─── Componente principal ─────────────────────────────────────────────────────

const MapaHuastecaMaplibreClient: React.FC<MapaHuastecaMaplibreClientProps> = ({
  puntos = [],
  isMobile = false,
  selectedId = null,
  onSelectPoint,
}) => {
  useInjectMaplibreCSS();

  const mapRef = useRef<MapRef | null>(null);

  // Estado del mapa
  const [municipiosGeoJson, setMunicipiosGeoJson] = useState<MunicipiosGeoJson | null>(null);
  const [geoJsonLoading, setGeoJsonLoading] = useState(true);
  const [activeId, setActiveId] = useState<number | string | null>(selectedId);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [styleReady, setStyleReady] = useState(false);

  // Controles de capas
  const defaultStyle = BASE_STYLES.find((s) => s.terrain) ?? BASE_STYLES[0];
  const [baseStyle, setBaseStyle] = useState(defaultStyle.url);
  const [terrainEnabled, setTerrainEnabled] = useState(defaultStyle.terrain);
  const [showOutline, setShowOutline] = useState(true);
  const [showMunicipios, setShowMunicipios] = useState(true);
  const [showRoads, setShowRoads] = useState(false);
  const [panelCapasAbierto, setPanelCapasAbierto] = useState(false);

  // Puntos válidos
  const puntosValidos = useMemo(
    () => puntos.filter((p) => Number.isFinite(p.latitud) && Number.isFinite(p.longitud)),
    [puntos],
  );

  // Municipio activo (para highlight en el mapa)
  const municipioActivo =
    popupInfo?.municipio ??
    puntosValidos.find((p) => p.id === activeId)?.municipio ??
    null;
  const municipioActivoKey = normalizeMunicipioKey(municipioActivo);

  // Colores por municipio
  const colorMunicipio = useMemo(() => {
    const uniqueMunicipios = [...new Set(puntosValidos.map((p) => normalizeMunicipioKey(p.municipio)))];
    return Object.fromEntries(
      uniqueMunicipios.map((key, i) => [key, MUNICIPIO_COLORS[i % MUNICIPIO_COLORS.length]]),
    );
  }, [puntosValidos]);

  // Cargar GeoJSON
  useEffect(() => {
    setGeoJsonLoading(true);
    fetchGeoJson().then((geojson) => {
      if (geojson) {
        geojson.features.forEach((f) => {
          if (f.properties?.municipio) {
            f.properties.municipio_key = normalizeMunicipioKey(f.properties.municipio as string);
          }
        });
        setMunicipiosGeoJson(geojson);
      }
      setGeoJsonLoading(false);
    });
  }, []);

  // Sincronizar selectedId externo
  useEffect(() => {
    setActiveId(selectedId ?? null);
  }, [selectedId]);

  // Activar terreno 3D cuando cambia el estilo o la opción
  useEffect(() => {
    const map = mapRef.current?.getMap?.();
    if (!map || !terrainEnabled) return;

    const applyTerrain = () => {
      if (!map.getSource('maptiler-dem')) {
        map.addSource('maptiler-dem', {
          type: 'raster-dem',
          url: 'https://api.maptiler.com/tiles/terrain-rgb/tiles.json?key=Q65Ltx3kCG3wapbpAkFb',
          tileSize: 512,
          maxzoom: 12,
        });
      }
      map.setTerrain({ source: 'maptiler-dem', exaggeration: 1.8 });
      map.easeTo({ pitch: 45, bearing: -17, duration: 800 });
    };

    if (map.isStyleLoaded()) {
      applyTerrain();
    } else {
      map.once('styledata', applyTerrain);
    }

    return () => {
      const m = mapRef.current?.getMap?.();
      if (m?.getTerrain()) m.setTerrain(null);
    };
  }, [terrainEnabled, baseStyle]);

  // Reset styleReady al cambiar estilo base
  useEffect(() => {
    setStyleReady(false);
  }, [baseStyle]);

  // Handler: estilo listo
  const handleStyleData = () => {
    setStyleReady(true);
    const map = mapRef.current?.getMap?.();
    if (!map || !terrainEnabled) return;
    if (!map.getSource('maptiler-dem')) {
      map.addSource('maptiler-dem', {
        type: 'raster-dem',
        url: 'https://api.maptiler.com/tiles/terrain-rgb/tiles.json?key=Q65Ltx3kCG3wapbpAkFb',
        tileSize: 512,
        maxzoom: 12,
      });
    }
    map.setTerrain({ source: 'maptiler-dem', exaggeration: 1.8 });
  };

  useEffect(() => {
  const map = mapRef.current?.getMap?.();
  if (!map || !styleReady) return;

  const visibility = showRoads ? 'visible' : 'none';

  ['roads-trunk', 'roads-primary', 'roads-secondary'].forEach((layerId) => {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, 'visibility', visibility);
    }
  });
}, [showRoads, styleReady]);

  // Handler: clic en el mapa (municipios)
  const handleMapClick = (e: MapLayerMouseEvent) => {
    if (!municipiosGeoJson || !showMunicipios) return;

    const municipioFeature = (e.features ?? []).find((f) => f.source === 'municipios');
    if (!municipioFeature?.properties || !municipioFeature.geometry) return;

    const geom = municipioFeature.geometry as MunicipiosGeoJson['features'][0]['geometry'];
    let coords: [number, number][] | undefined;

    if (geom.type === 'Polygon') {
      coords = geom.coordinates[0] as [number, number][];
    } else if (geom.type === 'MultiPolygon') {
      coords = (geom.coordinates as number[][][][])[0]?.[0] as [number, number][];
    }

    if (!coords?.length) return;

    const sumLng = coords.reduce((acc, c) => acc + c[0], 0);
    const sumLat = coords.reduce((acc, c) => acc + c[1], 0);
    const lng = sumLng / coords.length;
    const lat = sumLat / coords.length;

    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return;

    setPopupInfo(null);

    const map = mapRef.current?.getMap?.();
    const openPopup = () =>
      setPopupInfo({
        id: String(municipioFeature.properties?.municipio_key ?? municipioFeature.properties?.municipio ?? 'municipio'),
        comunidad: '',
        municipio: String(municipioFeature.properties?.municipio ?? ''),
        latitud: lat,
        longitud: lng,
        idx: 0,
      });

    if (map) {
      map.once('moveend', openPopup);
      map.easeTo({ center: [lng, lat], duration: 400, zoom: Math.max(map.getZoom(), 11) });
    } else {
      openPopup();
    }
  };

  // ─── Capas de mapa ──────────────────────────────────────────────────────────

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
                ['==', ['get', 'municipio_key'], municipioActivoKey],
                '#FFD600',
                '#D1D5DB',
              ] as maplibregl.ExpressionSpecification,
              'fill-opacity': 0.15,
            },
          }
        : null,
    [municipiosGeoJson, municipioActivoKey],
  );

  const municipiosLineLayer = useMemo(
    () =>
      municipiosGeoJson
        ? {
            id: 'municipios-outline',
            type: 'line' as const,
            source: 'municipios',
            paint: {
              'line-color': '#166534',
              'line-width': 1.5,
            },
          }
        : null,
    [municipiosGeoJson],
  );

  // ─── Tamaño de marcadores según zoom ────────────────────────────────────────

  const getMarkerSize = (isActive: boolean) => {
    const minZ = 8, maxZ = 14;
    const t = Math.max(0, Math.min(1, (zoom - minZ) / (maxZ - minZ)));
    // Aumentar tamaño en móvil
    const base = isActive ? (isMobile ? 32 : 26) : (isMobile ? 22 : 16);
    const max = isActive ? (isMobile ? 52 : 44) : (isMobile ? 34 : 28);
    return Math.round(base + (max - base) * t);
  };

  // ─── Popup compartido ────────────────────────────────────────────────────────

  const PopupContent = ({ info }: { info: PopupInfo }) => (
    <div
      style={{
        minWidth: 220,
        maxWidth: 320,
        fontFamily: 'Nunito, sans-serif',
        background: 'rgba(255,255,255,0.98)',
        borderRadius: 16,
        border: '1.5px solid #FFD600',
        padding: '18px 18px 14px',
        position: 'relative',
      }}
    >
      <button
        onClick={() => setPopupInfo(null)}
        aria-label="Cerrar"
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          background: 'none',
          border: 'none',
          fontSize: 22,
          color: '#C8820A',
          cursor: 'pointer',
          fontWeight: 900,
          lineHeight: 1,
          padding: 0,
        }}
        onMouseOver={(e) => (e.currentTarget.style.color = '#B91C1C')}
        onMouseOut={(e) => (e.currentTarget.style.color = '#C8820A')}
      >
        ×
      </button>

      {info.comunidad ? (
        <>
          <div style={{ fontSize: 12, color: '#C8820A', fontWeight: 800, textTransform: 'uppercase', marginBottom: 2 }}>
            Proyecto territorial
          </div>
          <strong style={{ fontSize: 18, color: '#3D2208', fontWeight: 900 }}>{info.comunidad}</strong>
          <br />
          <span style={{ color: '#6B3D1E', fontSize: 13, fontWeight: 600 }}>{info.municipio}</span>
          <div
            style={{
              marginTop: 10,
              padding: '10px 12px',
              borderRadius: 10,
              background: '#FBF6EE',
              border: '1.5px solid #FFD600',
              fontFamily: 'DM Mono, monospace',
              fontSize: 13,
              color: '#3D2208',
              marginBottom: 6,
            }}
          >
            <span style={{ fontWeight: 700 }}>Lat:</span> {info.latitud.toFixed(6)}
            <br />
            <span style={{ fontWeight: 700 }}>Lon:</span> {info.longitud.toFixed(6)}
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: '#6b7280', fontWeight: 600 }}>
            Punto #{info.idx + 1} · cobertura comunitaria en la Huasteca Potosina
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 13, color: '#C8820A', fontWeight: 800, textTransform: 'uppercase', marginBottom: 2 }}>
            Municipio
          </div>
          <strong style={{ fontSize: 20, color: '#3D2208', fontWeight: 900 }}>{info.municipio}</strong>
        </>
      )}
    </div>
  );

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      className="mapa-huasteca-maplibre-container"
      style={{
        position: 'fixed',
        top: 'var(--topbar-h, 64px)',
        left: 0,
        width: '100vw',
        height: isMobile ? 'calc(100dvh - var(--topbar-h, 64px))' : '100vh',
        zIndex: 1,
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
        background: '#f8fafc',
      }}
    >
      {/* CSS global mínimo */}
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
          
          z-index: 3002 !important;
          pointer-events: auto !important;
        }
        .maplibregl-ctrl-top-right { z-index: 500 !important; }
        .maplibregl-ctrl-bottom-left { z-index: 500 !important; }
        .maplibregl-popup-close-button {
          font-size: 20px !important;
          color: #C8820A !important;
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
            background: 'rgba(255,255,255,0.85)',
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: '18px 28px',
              fontWeight: 700,
              color: '#C8820A',
              fontSize: 18,
              textAlign: 'center',
            }}
          >
            Cargando mapa SIG…
            <br />
            <span style={{ fontWeight: 400, fontSize: 14, color: '#6B7280' }}>Por favor espera…</span>
          </div>
        </div>
      )}

      {/* Botón hamburguesa */}
      <button
        className="btn-capas"
        aria-label={panelCapasAbierto ? 'Cerrar panel de capas' : 'Abrir panel de capas'}
        onClick={() => {
  console.log('BOTÓN CAPAS CLICKEADO');
  setPanelCapasAbierto((v) => !v);
}}
        style={{
          position: 'fixed',
          top: isMobile ? 'calc(var(--topbar-h,64px) + 12px)' : 'calc(var(--topbar-h,64px) + 18px)',
          right: isMobile ? 'auto' : '24px',
          left: isMobile ? '12px' : 'auto',
          width: 48,
          height: 48,
          borderRadius: 14,
          background: '#fff',
          border: '2.5px solid #FFD600',
          boxShadow: '0 4px 16px rgba(61,34,8,.13)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0,
          zIndex: 3002,
          pointerEvents: 'auto',
        }}
      >
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <rect y="5" width="26" height="3.5" rx="1.5" fill="#C8820A" />
          <rect y="11.5" width="26" height="3.5" rx="1.5" fill="#C8820A" />
          <rect y="18" width="26" height="3.5" rx="1.5" fill="#C8820A" />
        </svg>
      </button>

      {/* Panel de capas */}
      {panelCapasAbierto && (
        <div
          style={{
            position: 'absolute',
            top: '90px',
            left: 'auto',
            right: '24px',
            zIndex: 99999,
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 6px 24px rgba(61,34,8,.16)',
            padding: '16px 18px 12px',
            fontSize: 14,
            minWidth: 220,
            maxWidth: 'min(420px, 100vw - 32px)',
            width: 'auto',
            border: '1.5px solid #E2E8F0',
            margin: 0,
            ...(isMobile
              ? {
                  left: 0,
                  right: 0,
                  top: 'calc(var(--topbar-h) + 8px)',
                  maxWidth: '100vw',
                  minWidth: 0,
                  borderRadius: 0,
                  boxShadow: '0 2px 12px rgba(61,34,8,.10)',
                }
              : {}),
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Capas base</div>
          {BASE_STYLES.map((style) => (
            <label key={style.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, cursor: 'pointer' }}>
              <input
                type="radio"
                name="baseStyle"
                checked={baseStyle === style.url}
                onChange={() => {
                  setBaseStyle(style.url);
                  setTerrainEnabled(!!style.terrain);
                }}
              />
              {style.name}
              {style.terrain && (
                <span style={{ color: '#0F766E', fontWeight: 600, fontSize: 12 }}>(3D)</span>
              )}
            </label>
          ))}

          <div style={{ fontWeight: 700, margin: '12px 0 6px' }}>Capas SIG</div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showMunicipios}
              onChange={() => setShowMunicipios((v) => !v)}
            />
            Municipios
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showOutline}
              onChange={() => setShowOutline((v) => !v)}
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
    onChange={() => setShowRoads((v) => !v)}
  />
  Carreteras principales
</label>
        </div>
      )}

      {/* Mapa principal */}
      <Map
        key={baseStyle}
        ref={mapRef}
        initialViewState={{
          longitude: DEFAULT_CENTER[0],
          latitude: DEFAULT_CENTER[1],
          zoom: DEFAULT_ZOOM,
          pitch: terrainEnabled ? 45 : 0,
          bearing: terrainEnabled ? -17 : 0,
        }}
        mapStyle={baseStyle}
        style={{ width: '100vw', height: '100vh' }}
        attributionControl={{ compact: true }}
        dragRotate
        touchPitch
        interactiveLayerIds={showMunicipios ? ['municipios'] : []}
        onLoad={(e) => {
          const map = e.target;
          if (!terrainEnabled) return;
          if (!map.getSource('maptiler-dem')) {
            map.addSource('maptiler-dem', {
              type: 'raster-dem',
              url: 'https://api.maptiler.com/tiles/terrain-rgb/tiles.json?key=Q65Ltx3kCG3wapbpAkFb',
              tileSize: 512,
              maxzoom: 12,
            });
          }
          map.setTerrain({ source: 'maptiler-dem', exaggeration: 1.8 });
        }}
        onStyleData={handleStyleData}
        onClick={handleMapClick}
        onZoom={(e) => setZoom(e.viewState.zoom)}
      >

        

        {/* Capa agua */}
        {styleReady && (
          <Source id="osm-water" type="vector" url="https://api.maptiler.com/tiles/v3/tiles.json?key=Q65Ltx3kCG3wapbpAkFb">
            <Layer
              id="osm-water-fill"
              source-layer="water"
              type="fill"
              paint={{ 'fill-color': '#3B82F6', 'fill-opacity': 0.35 }}
            />
            <Layer
              id="osm-water-line"
              source-layer="water"
              type="line"
              paint={{ 'line-color': '#2563EB', 'line-width': 1.2, 'line-opacity': 0.7 }}
            />
          </Source>
        )}

        {/* Capa municipios */}
        {styleReady && municipiosGeoJson && showMunicipios && (
          <Source id="municipios" type="geojson" data={municipiosGeoJson as GeoJSON.FeatureCollection}>
            {municipiosLayer && <Layer {...municipiosLayer} />}
            {municipiosLineLayer && <Layer {...municipiosLineLayer} />}
          </Source>
        )}

        {/* Envolvente regional */}
        {styleReady && showOutline && (
          <Source
            id="envolvente"
            type="geojson"
            data={{
              type: 'Feature',
              geometry: { type: 'Polygon', coordinates: [ENVOLVENTE_COORDS] },
              properties: {},
            }}
          >
            <Layer
              id="envolvente-outline"
              type="line"
              paint={{ 'line-color': '#2A5C3F', 'line-width': 2.4, 'line-dasharray': [5, 4] }}
            />
            <Layer
              id="envolvente-fill"
              type="fill"
              paint={{ 'fill-color': '#2A5C3F', 'fill-opacity': 0.06 }}
            />
          </Source>
        )}

        {/* Marcadores */}
        {!geoJsonLoading &&
          puntosValidos.map((punto, idx) => {
            // No renderizar marcador si hay popup abierto para este punto
            if (popupInfo && punto.id === popupInfo.id && punto.comunidad) return null;

            const municipioKey = normalizeMunicipioKey(punto.municipio);
            const isActive = punto.id === activeId;
            const size = getMarkerSize(isActive);

            return (
              <Marker
                key={punto.id}
                longitude={punto.longitud}
                latitude={punto.latitud}
                anchor="center"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setPopupInfo({ ...punto, idx });
                  onSelectPoint?.(punto.id);
                }}
                style={{ cursor: 'pointer', zIndex: isActive ? 10 : 5 }}
              >
                <div
                  title={`${punto.comunidad} (${punto.municipio})`}
                  style={{
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    background: colorMunicipio[municipioKey] ?? '#FFD600',
                    border: isActive ? '2.5px solid #FFD600' : '1.5px solid rgba(255,255,255,0.8)',
                    boxShadow: isActive
                      ? '0 0 0 3px rgba(200,130,10,0.35)'
                      : '0 1px 4px rgba(0,0,0,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}
                >
                  {/* Ícono grano de maíz */}
                  <svg
                    width={Math.round(size * 0.5)}
                    height={Math.round(size * 0.6)}
                    viewBox="0 0 12 16"
                    fill="none"
                  >
                    <ellipse cx="6" cy="8" rx="5" ry="7" fill="#FFD600" stroke="#C8820A" strokeWidth="1.5" />
                  </svg>
                </div>
              </Marker>
            );
          })}

        {/* Popup escritorio */}
        {popupInfo && !isMobile && (
          <div style={{ position: 'relative', zIndex: 3005 }}>
            <Popup
              longitude={popupInfo.longitud}
              latitude={popupInfo.latitud}
              anchor="top"
              closeOnClick={false}
              onClose={() => setPopupInfo(null)}
              maxWidth="340px"
              offset={[0, -10]}
              closeButton={false}
              style={{ zIndex: 3005 }}
            >
              <PopupContent info={popupInfo} />
            </Popup>
          </div>
        )}
      </Map>

      {/* Popup móvil (fullscreen overlay) */}
      {popupInfo && isMobile && (
        <div
          style={{
            position: 'fixed',
            top: 'var(--topbar-h, 64px)',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setPopupInfo(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'calc(90vw - var(--sidebar-w, 64px) - 24px)',
              maxWidth: 420,
              minWidth: 220,
              zIndex: 10000,
              position: 'fixed',
              left: 'calc(var(--sidebar-w, 64px) + 12px)',
              top: '50%',
              transform: 'translateY(-50%)',
              margin: 0,
              right: 0,
              background: 'none',
              pointerEvents: 'auto',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: '100%' }}>
              <PopupContent info={popupInfo} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapaHuastecaMaplibreClient;