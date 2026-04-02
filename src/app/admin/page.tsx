// Redirige automáticamente a /admin/dashboard
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AccessGuardScreen from '@/components/ui/AccessGuardScreen'

export default function AdminRootRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/admin/dashboard')
  }, [router])
  return <AccessGuardScreen message="Entrando a admin..." />
}
