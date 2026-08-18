'use client'

import { useEffect, useState } from 'react'
import { GET } from '@/lib/api'

export interface Lengua {
  id: number
  nombre: string
}

interface LenguaResponse {
  count: number
  results: Lengua[]
}

export function useLenguas() {
  const [lenguas, setLenguas] = useState<Lengua[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const res: LenguaResponse = await GET('/catalogo/lengua')
        setLenguas(res?.results ?? [])
      } catch {
        setLenguas([])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return { lenguas, loading }
}