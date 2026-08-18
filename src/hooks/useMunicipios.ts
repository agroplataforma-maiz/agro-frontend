'use client'

import { useEffect, useState } from 'react'
import { GET } from '@/lib/api'

export interface Municipio {
  id: number
  nombre: string
}

interface MunicipioResponse {
  count: number
  results: Municipio[]
}

export function useMunicipios() {
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const res: Municipio[] | MunicipioResponse = await GET('/catalogo/municipio')

        if (Array.isArray(res)) {
          setMunicipios(res)
        } else {
          setMunicipios(res.results ?? [])
        }
      } catch {
        setMunicipios([])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return { municipios, loading }
}