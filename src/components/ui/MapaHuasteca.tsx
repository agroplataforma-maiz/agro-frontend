
'use client'

import dynamic from 'next/dynamic'

export interface PuntoMapaHuasteca {
  id: number | string
  comunidad: string
  municipio: string
  latitud: number
  longitud: number
  imagenUrl?: string | null;
}

interface MapaHuastecaProps {
  puntos?: PuntoMapaHuasteca[]
  height?: number
  selectedId?: number | string | null
  onSelectPoint?: (id: number | string) => void
  isMobile?: boolean
}

const MapaHuastecaMaplibreClient = dynamic(
  () => import('./MapaHuastecaMaplibreClient').then(mod => mod.default),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          minHeight: 420,
          display: 'grid',
          borderRadius: 14,
          border: '1px solid rgba(61,34,8,.10)',
          background: 'linear-gradient(135deg, rgba(232,244,236,.9), rgba(254,243,220,.82))',
          color: 'var(--cafe)',
          fontWeight: 700,
        }}
      >
        Cargando mapa SIG…
      </div>
    ),
  }
)

export default function MapaHuasteca({ puntos = [], height = 560, selectedId = null, onSelectPoint, isMobile = false }: MapaHuastecaProps) {
  return <MapaHuastecaMaplibreClient puntos={puntos} height={height} selectedId={selectedId} onSelectPoint={onSelectPoint} isMobile={isMobile} />
}