// src/app/providers.tsx
// Wrapper de providers — React Query + inicialización de sesión

'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import ToastContainer from '@/components/ui/ToastContainer'

function SessionInit() {
  const { inicializarSesion } = useAuth()
  useEffect(() => { inicializarSesion() }, [])
  return null
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 min por defecto
        retry: 1,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <SessionInit />
      {children}
      <ToastContainer />
    </QueryClientProvider>
  )
}
