// src/hooks/useAuth.ts
// Hook de sesión — encapsula login, logout, y sincronización de cookies para el middleware

'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { guardarSesion, cerrarSesion, getToken, getUsuario } from '@/lib/auth'
import { POST } from '@/lib/api'
import type { LoginPayload, AuthResponse, Rol, Usuario } from '@/types'

const ROLES_VALIDOS: Rol[] = [
  'administrador',
  'investigador',
  'tecnico_campo',
  'visualizador',
  'productor',
  'invitado',
]

function normalizarRol(rol: string): Rol {
  const base = rol
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, '_')

  if (base === 'tecnico_de_campo') return 'tecnico_campo'
  if (base === 'tecnico') return 'tecnico_campo'

  if ((ROLES_VALIDOS as string[]).includes(base)) {
    return base as Rol
  }

  // Si no es válido, regresa 'visualizador' como fallback
  return 'visualizador'
}

function normalizarUsuario(usuario: Usuario): Usuario {
  return {
    ...usuario,
    rol: normalizarRol(String(usuario.rol)),
  }
}

export function useAuth() {
  const router  = useRouter()
  const setUsuario = useAppStore(s => s.setUsuario)
  const addToast   = useAppStore(s => s.addToast)

  // Sincroniza el token de localStorage a cookie para que el middleware lo lea
  function syncTokenCookie(token: string) {
    document.cookie = `agro_token=${encodeURIComponent(token)}; path=/; SameSite=Lax`
  }

  function clearTokenCookie() {
    document.cookie = 'agro_token=; path=/; max-age=0'
  }

  // Sincroniza el rol en cookie para que el middleware pueda verificar permisos
  function syncRolCookie(rol: string) {
    const rolNormalizado = normalizarRol(rol)
    document.cookie = `agro_rol=${encodeURIComponent(rolNormalizado)}; path=/; SameSite=Lax`
  }

  function clearRolCookie() {
    document.cookie = 'agro_rol=; path=/; max-age=0'
  }

  function mostrarOverlayTransicion(texto: string) {
    if (typeof document === 'undefined') return () => {}

    // Elimina estilos previos si existen
    const prevStyle = document.getElementById('agro-auth-transition-style')
    if (prevStyle) prevStyle.remove()

    // Estilos globales para animación y brillo
    const style = document.createElement('style')
    style.id = 'agro-auth-transition-style'
    style.textContent = `
      @keyframes agroMaizSpin { to { transform: rotate(360deg); } }
      @keyframes agroMaizGlow {
        0% { filter: drop-shadow(0 0 8px #ffe066) drop-shadow(0 0 2px #fffbe8); }
        100% { filter: drop-shadow(0 0 32px #ffe066) drop-shadow(0 0 12px #fffbe8); }
      }
    `
    document.head.appendChild(style)

    const overlay = document.createElement('div')
    overlay.setAttribute('data-auth-transition', 'true')
    overlay.style.position = 'fixed'
    overlay.style.inset = '0'
    overlay.style.zIndex = '11000'
    overlay.style.background = 'rgba(32,33,31,0.93)'
    overlay.style.backdropFilter = 'blur(4px)'
    overlay.style.display = 'flex'
    overlay.style.flexDirection = 'column'
    overlay.style.alignItems = 'center'
    overlay.style.justifyContent = 'center'
    overlay.style.gap = '24px'
    overlay.style.color = '#fffbe8'
    overlay.style.fontFamily = 'Nunito, Fraunces, Arial, sans-serif'

    const icono = document.createElement('div')
    icono.textContent = '🌽'
    icono.style.fontSize = '54px'
    icono.style.lineHeight = '1'
    icono.style.animation = 'agroMaizSpin 1.1s linear infinite, agroMaizGlow 1.2s ease-in-out infinite alternate'
    icono.style.filter = 'drop-shadow(0 0 32px #ffe066) drop-shadow(0 0 12px #fffbe8)'
    icono.style.marginBottom = '24px'

    const label = document.createElement('div')
    label.textContent = texto
    label.style.fontSize = '22px'
    label.style.fontWeight = '800'
    label.style.letterSpacing = '.04em'
    label.style.textAlign = 'center'
    label.style.fontFamily = 'Nunito, Fraunces, Arial, sans-serif'
    label.style.textShadow = '0 2px 12px #000, 0 0 24px #ffe066'

    overlay.appendChild(icono)
    overlay.appendChild(label)
    document.body.appendChild(overlay)

    return () => {
      overlay.remove()
    }
  }

  async function login(payload: LoginPayload) {
    const data = await POST<AuthResponse>('/auth/login', payload)
    const usuarioNormalizado = normalizarUsuario(data.usuario)
    const responseNormalizada: AuthResponse = {
      ...data,
      usuario: usuarioNormalizado,
    }

    guardarSesion(responseNormalizada.access_token, responseNormalizada.usuario)
    syncTokenCookie(responseNormalizada.access_token)
    syncRolCookie(responseNormalizada.usuario.rol)
    setUsuario(responseNormalizada.usuario)
    return responseNormalizada
  }

  async function logout() {
    const limpiarOverlay = mostrarOverlayTransicion('Cerrando sesión...')
    cerrarSesion()
    clearTokenCookie()
    clearRolCookie()
    setUsuario(null)
    await new Promise(resolve => setTimeout(resolve, 1200))
    limpiarOverlay()
    // Redirigir a login tras logout y limpiar la URL
    router.replace('/login')
  }

  // Inicializa el store desde localStorage al montar la app
  function inicializarSesion() {
    const usuario = getUsuario()
    const token   = getToken()
    if (usuario && token) {
      const usuarioNormalizado = normalizarUsuario(usuario)
      setUsuario(usuarioNormalizado)
      syncTokenCookie(token)
      syncRolCookie(usuarioNormalizado.rol)
    }
  }

  return { login, logout, inicializarSesion, addToast }
}
