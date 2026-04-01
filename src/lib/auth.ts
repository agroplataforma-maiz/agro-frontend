// src/lib/auth.ts
// Centraliza toda la lógica de sesión — reemplaza las funciones
// guardarSesion/obtenerToken/obtenerUsuario/cerrarSesion duplicadas en cada JS

import type { Usuario } from '@/types'

const TOKEN_KEY = 'agro_token'
const USER_KEY  = 'agro_user'

export function guardarSesion(token: string, usuario: Usuario): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(usuario))
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function getUsuario(): Usuario | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function cerrarSesion(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function estaAutenticado(): boolean {
  return !!getToken() && !!getUsuario()
}

// Iniciales para avatar (igual que en login.js y dashboard.js)
export function iniciales(texto?: string): string {
  return (texto || '?')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
