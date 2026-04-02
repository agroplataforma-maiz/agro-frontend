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

  function mostrarOverlayTransicion(texto: string) {
    if (typeof document === 'undefined') return () => {}

    if (!document.getElementById('agro-auth-transition-style')) {
      const style = document.createElement('style')
      style.id = 'agro-auth-transition-style'
      style.textContent = `
        @keyframes agroMaizSpin { to { transform: rotate(360deg); } }
      `
      document.head.appendChild(style)
    }

    const overlay = document.createElement('div')
    overlay.setAttribute('data-auth-transition', 'true')
    overlay.style.position = 'fixed'
    overlay.style.inset = '0'
    overlay.style.zIndex = '11000'
    overlay.style.background = 'rgba(42, 27, 11, 0.78)'
    overlay.style.backdropFilter = 'blur(4px)'
    overlay.style.display = 'flex'
    overlay.style.flexDirection = 'column'
    overlay.style.alignItems = 'center'
    overlay.style.justifyContent = 'center'
    overlay.style.gap = '12px'
    overlay.style.color = '#fff'
    overlay.style.fontFamily = 'Nunito, sans-serif'

    const icono = document.createElement('div')
    icono.textContent = '🌽'
    icono.style.fontSize = '58px'
    icono.style.lineHeight = '1'
    icono.style.animation = 'agroMaizSpin 0.9s linear infinite'

    const label = document.createElement('div')
    label.textContent = texto
    label.style.fontSize = '15px'
    label.style.fontWeight = '700'
    label.style.letterSpacing = '0.02em'

    overlay.appendChild(icono)
    overlay.appendChild(label)
    document.body.appendChild(overlay)

    return () => {
      overlay.remove()
    }
  }

  async function login(payload: LoginPayload) {
    const data = await POST<AuthResponse>('/auth/login', payload)
    guardarSesion(data.access_token, data.usuario)
    syncTokenCookie(data.access_token)
    syncRolCookie(data.usuario.rol)
    setUsuario(data.usuario)
    return data
  }

  async function logout() {
    const limpiarOverlay = mostrarOverlayTransicion('Cerrando sesión...')
    cerrarSesion()
    clearTokenCookie()
    clearRolCookie()
    setUsuario(null)
    await new Promise(resolve => setTimeout(resolve, 2000))
    limpiarOverlay()
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
