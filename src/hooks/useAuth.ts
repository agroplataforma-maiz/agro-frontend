// src/hooks/useAuth.ts
// Hook de sesión — encapsula login, logout, y sincronización de cookies para el middleware

'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { guardarSesion, cerrarSesion, getToken, getUsuario } from '@/lib/auth'
import { POST } from '@/lib/api'
import type { LoginPayload, AuthResponse } from '@/types'

export function useAuth() {
  const router  = useRouter()
  const setUsuario = useAppStore(s => s.setUsuario)
  const addToast   = useAppStore(s => s.addToast)

  // Sincroniza el token de localStorage a cookie para que el middleware lo lea
  function syncTokenCookie(token: string) {
    document.cookie = `agro_token=${token}; path=/; SameSite=Lax`
  }

  function clearTokenCookie() {
    document.cookie = 'agro_token=; path=/; max-age=0'
  }

  // Sincroniza el rol en cookie para que el middleware pueda verificar permisos
  function syncRolCookie(rol: string) {
    document.cookie = `agro_rol=${rol}; path=/; SameSite=Lax`
  }

  function clearRolCookie() {
    document.cookie = 'agro_rol=; path=/; max-age=0'
  }

  async function login(payload: LoginPayload) {
    const data = await POST<AuthResponse>('/auth/login', payload)
    guardarSesion(data.access_token, data.usuario)
    syncTokenCookie(data.access_token)
    syncRolCookie(data.usuario.rol)
    setUsuario(data.usuario)
    return data
  }

  function logout() {
    cerrarSesion()
    clearTokenCookie()
    clearRolCookie()
    setUsuario(null)
    router.push('/login')
  }

  // Inicializa el store desde localStorage al montar la app
  function inicializarSesion() {
    const usuario = getUsuario()
    const token   = getToken()
    if (usuario && token) {
      setUsuario(usuario)
      syncTokenCookie(token)
      syncRolCookie(usuario.rol)
    }
  }

  return { login, logout, inicializarSesion, addToast }
}
