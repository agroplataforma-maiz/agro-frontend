
'use client'

import { useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import '@/lib/maplibre'
import styles from './MapaUbicacion.module.css'

interface Props {
    lat: number
    lng: number
}

export default function MapaUbicacion({ lat, lng }: Props) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const mapRef = useRef<maplibregl.Map | null>(null)
    const markerRef = useRef<maplibregl.Marker | null>(null)

    // Crear el mapa una sola vez.
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return

        const map = new maplibregl.Map({
            container: containerRef.current,
            style: 'https://api.maptiler.com/maps/streets/style.json?key=Q65Ltx3kCG3wapbpAkFb',
            center: [lng, lat],
            zoom: 11,
        })

        // Mapa de consulta: no permite modificar la ubicación.
        map.scrollZoom.disable()
        map.dragPan.disable()
        map.doubleClickZoom.disable()
        map.boxZoom.disable()
        map.keyboard.disable()
        map.dragRotate.disable()
        map.touchZoomRotate.disable()

        markerRef.current = new maplibregl.Marker({
            color: '#2A5C3F',
        })
            .setLngLat([lng, lat])
            .addTo(map)

        mapRef.current = map

        return () => {
            map.remove()
            mapRef.current = null
            markerRef.current = null
        }
    }, [])

    // Actualizar el punto sin recrear el mapa.
    useEffect(() => {
        const map = mapRef.current

        if (!map) return

        map.flyTo({
            center: [lng, lat],
            zoom: 11,
            essential: true,
        })

        markerRef.current?.setLngLat([lng, lat])
    }, [lat, lng])

    return (
        <div
            ref={containerRef}
            className={styles.mapaUbicacion}
            role="img"
            aria-label={`Mapa de ubicación: latitud ${lat.toFixed(2)}, longitud ${lng.toFixed(2)}`}
        />
    )
}
