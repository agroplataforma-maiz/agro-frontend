
'use client'

import { useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import type { FeatureCollection, Polygon, MultiPolygon } from 'geojson'
import 'maplibre-gl/dist/maplibre-gl.css'
import '@/lib/maplibre'
import styles from './MapaUbicacion.module.css'

interface Props {
    lat: number
    lng: number
    poligono?: FeatureCollection<Polygon | MultiPolygon> | null
    interactive?: boolean
    zoom?: number
}

const ESTILO_MAPA =
    //'https://api.maptiler.com/maps/streets/style.json?key=Q65Ltx3kCG3wapbpAkFb'
    'https://api.maptiler.com/maps/topo-v2/style.json?key=Q65Ltx3kCG3wapbpAkFb'

const ID_FUENTE = 'ubicacion-poligono'
const ID_RELLENO = 'ubicacion-poligono-relleno'
const ID_BORDE = 'ubicacion-poligono-borde'

function sincronizarPoligono(
    map: maplibregl.Map,
    poligono: FeatureCollection<Polygon | MultiPolygon> | null
) {
    const fuente = map.getSource(ID_FUENTE) as
        | maplibregl.GeoJSONSource
        | undefined

    if (!poligono) {
        if (map.getLayer(ID_BORDE)) {
            map.removeLayer(ID_BORDE)
        }

        if (map.getLayer(ID_RELLENO)) {
            map.removeLayer(ID_RELLENO)
        }

        if (map.getSource(ID_FUENTE)) {
            map.removeSource(ID_FUENTE)
        }

        return
    }

    if (fuente) {
        fuente.setData(poligono)
        return
    }

    map.addSource(ID_FUENTE, {
        type: 'geojson',
        data: poligono,
    })

    map.addLayer({
        id: ID_RELLENO,
        type: 'fill',
        source: ID_FUENTE,
        paint: {
            'fill-color': '#2A5C3F',
            'fill-opacity': 0.28,
        },
    })

    map.addLayer({
        id: ID_BORDE,
        type: 'line',
        source: ID_FUENTE,
        paint: {
            'line-color': '#2A5C3F',
            'line-width': 3,
        },
    })
}

export default function MapaUbicacion({
    lat,
    lng,
    poligono = null,
    interactive = false,
    zoom = 11,
}: Props) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const mapRef = useRef<maplibregl.Map | null>(null)
    const markerRef = useRef<maplibregl.Marker | null>(null)
    const poligonoRef = useRef(poligono)

    // Mantener disponible el polígono más reciente para el evento load.
    poligonoRef.current = poligono

    // Crear el mapa una sola vez.
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return

        const map = new maplibregl.Map({
            container: containerRef.current,
            style: ESTILO_MAPA,
            center: [lng, lat],
            zoom,
            attributionControl: {
                compact: true,
            },
            ...(!interactive ? { interactive: false } : {}),
        })

        mapRef.current = map

        const alCargar = () => {
            sincronizarPoligono(map, poligonoRef.current)
        }

        map.on('load', alCargar)

        if (interactive) {
            map.addControl(
                new maplibregl.NavigationControl(),
                'top-right'
            )
        }

        return () => {
            map.off('load', alCargar)
            map.remove()
            mapRef.current = null
            markerRef.current = null
        }
    }, [interactive]) // La modalidad de interacción no cambia durante la vida del mapa.

    // Actualizar coordenadas, marcador y polígono sin recrear el mapa.
    useEffect(() => {
        const map = mapRef.current
        if (!map) return

        if (poligono) {
            markerRef.current?.remove()
            markerRef.current = null
        } else {
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                return
            }

            if (!markerRef.current) {
                markerRef.current = new maplibregl.Marker({
                    color: '#2A5C3F',
                })
                    .setLngLat([lng, lat])
                    .addTo(map)
            } else {
                markerRef.current.setLngLat([lng, lat])
            }
        }

        map.flyTo({
            center: [lng, lat],
            zoom,
            essential: true,
        })

        const actualizarPoligono = () => {
            sincronizarPoligono(map, poligono)
        }

        if (map.isStyleLoaded()) {
            actualizarPoligono()
        } else {
            map.once('load', actualizarPoligono)
        }

        return () => {
            map.off('load', actualizarPoligono)
        }
    }, [lat, lng, poligono, zoom])

    return (
        <div
            ref={containerRef}
            className={styles.mapaUbicacion}
            role="img"
            aria-label={
                poligono
                    ? `Mapa topográfico de la parcela, latitud ${lat.toFixed(5)}, longitud ${lng.toFixed(5)}`
                    : `Mapa de ubicación: latitud ${lat.toFixed(2)}, longitud ${lng.toFixed(2)}`
            }
        />
    )
}
