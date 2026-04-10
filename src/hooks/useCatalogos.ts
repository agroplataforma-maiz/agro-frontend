// src/hooks/useCatalogos.ts
// Reemplaza los 3 fetchs al top-level de productores.js que cargaban
// municipios, localidades y tipos de productor en window.*

'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/store/useAppStore'
import { GET } from '@/lib/api'
import type { Municipio, Localidad, TipoProductor } from '@/types'

function toArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  const d = data as Record<string, unknown>
  return (d?.items ?? d?.results ?? []) as T[]
}

export function useCatalogos(enabled = true) {
  const setMunicipios     = useAppStore(s => s.setMunicipios)
  const setLocalidades    = useAppStore(s => s.setLocalidades)
  const setTiposProductor = useAppStore(s => s.setTiposProductor)

  const municipios = useQuery({
    queryKey: ['municipios'],
    queryFn:  () => GET('/geo/municipio'),
    staleTime: Infinity,  // catálogos no cambian frecuentemente
    enabled,
  })

  const localidades = useQuery({
    queryKey: ['localidades'],
    queryFn:  () => GET('/geo/localidad'),
    staleTime: Infinity,
    enabled,
  })

  const tiposProductor = useQuery({
    queryKey: ['tipos-productor'],
    queryFn:  () => GET('/social/tipo_productor'),
    staleTime: Infinity,
    enabled,
  })

  // Sincroniza al store cuando cargan
  useEffect(() => {
    if (municipios.data) setMunicipios(toArray<Municipio>(municipios.data))
  }, [municipios.data, setMunicipios])

  useEffect(() => {
    if (localidades.data) setLocalidades(toArray<Localidad>(localidades.data))
  }, [localidades.data, setLocalidades])

  useEffect(() => {
    if (tiposProductor.data) setTiposProductor(toArray<TipoProductor>(tiposProductor.data))
  }, [tiposProductor.data, setTiposProductor])

  return {
    cargando: municipios.isLoading || localidades.isLoading || tiposProductor.isLoading,
  }
}
