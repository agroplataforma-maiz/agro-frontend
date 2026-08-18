'use client'

import { useEffect, useState } from 'react'
import { GET } from '@/lib/api'

export interface Localidad {
  id: number
  nombre: string
}

interface LocalidadResponse {
  count: number
  results: Localidad[]
}

export function useLocalidades(municipioId?: number) {
  const [localidades, setLocalidades] = useState<Localidad[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!municipioId) {
      setLocalidades([])
      return
    }

    (async () => {
      setLoading(true)
      try {
        const res: Localidad[] | LocalidadResponse =
          await GET(`/catalogo/localidad?municipio_id=${municipioId}`)

        if (Array.isArray(res)) {
          setLocalidades(res)
        } else {
          setLocalidades(res.results ?? [])
        }
      } catch {
        setLocalidades([])
      } finally {
        setLoading(false)
      }
    })()
  }, [municipioId])

  return { localidades, loading }
}