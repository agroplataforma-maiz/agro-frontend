'use client'

import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

interface Props {
  lat?: number
  lng?: number
  onChange: (lat: number, lng: number) => void
}

export default function MapPicker({ lat, lng, onChange }: Props) {

  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markerRef = useRef<maplibregl.Marker | null>(null)

  // 🧠 INIT SOLO UNA VEZ
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://api.maptiler.com/maps/streets/style.json?key=Q65Ltx3kCG3wapbpAkFb',
      center: [lng ?? -99, lat ?? 22.1],
      zoom: 12,
    })

    map.addControl(new maplibregl.NavigationControl())

    map.on('click', (e) => {
      const { lng, lat } = e.lngLat

      onChange(lat, lng)

      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat])
      } else {
        markerRef.current = new maplibregl.Marker()
          .setLngLat([lng, lat])
          .addTo(map)
      }
    })

    mapRef.current = map

    return () => {
      map.remove() // 🔥 CRÍTICO (evita WebGL crash)
      mapRef.current = null
      markerRef.current = null
    }
  }, [])

  // 🧭 ACTUALIZAR SIN RECREAR MAPA
  useEffect(() => {
    if (!mapRef.current || lat == null || lng == null) return

    mapRef.current.flyTo({
      center: [lng, lat],
      zoom: 14
    })

    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat])
    } else {
      markerRef.current = new maplibregl.Marker()
        .setLngLat([lng, lat])
        .addTo(mapRef.current)
    }
  }, [lat, lng])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: 300,
        borderRadius: 8,
        overflow: 'hidden'
      }}
    />
  )
}