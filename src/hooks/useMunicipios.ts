'use client'

import { useEffect, useState } from 'react'
import { GET } from '@/lib/api'
import type { Municipio } from '@/types'

export function useMunicipios() {
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let activo = true

    async function cargarMunicipios() {
      try {
        const res = await GET<Municipio[]>('/core/comunidades/municipios')

        if (activo) {
          setMunicipios(Array.isArray(res) ? res : [])
        }
      } catch {
        if (activo) {
          setMunicipios([])
        }
      } finally {
        if (activo) {
          setLoading(false)
        }
      }
    }

    cargarMunicipios()

    return () => {
      activo = false
    }
  }, [])

  return { municipios, loading }
}