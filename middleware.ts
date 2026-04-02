// middleware.ts  (va en la RAÍZ del proyecto, no en src/)
// Protección por autenticación Y por rol.
// El cliente sincroniza `agro_token` y `agro_rol` como cookies al hacer login.
// Ver hook useAuth.ts → syncTokenCookie / syncRolCookie.

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const RUTA_LOGIN      = '/login'

function decodeCookieValue(value?: string): string {
  if (!value) return ''
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function normalizarRol(rol?: string): string {
  const base = decodeCookieValue(rol)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, '_')

  if (base === 'tecnico_de_campo') return 'tecnico_campo'
  if (base === 'tecnico') return 'tecnico_campo'

  return base
}
const RUTA_SIN_ACCESO = '/sin-acceso'

// Cada regla define qué roles pueden acceder al prefijo de ruta.
// Las rutas se evalúan de más específica a más general (orden importa).
const REGLAS: { ruta: string; roles: string[] }[] = [
  // Admin: solo administrador
  { ruta: '/admin/usuarios',   roles: ['administrador'] },
  { ruta: '/admin/catalogos',  roles: ['administrador', 'investigador'] },
  { ruta: '/admin/dashboard',  roles: ['administrador'] },
  { ruta: '/admin',            roles: ['administrador'] },
  // Módulos de captura: investigador y técnico también
  { ruta: '/productores',      roles: ['administrador', 'investigador', 'tecnico_campo'] },
  { ruta: '/comunidades',      roles: ['administrador', 'investigador', 'tecnico_campo'] },
  { ruta: '/sociocultural',    roles: ['administrador', 'investigador', 'tecnico_campo'] },
  { ruta: '/fenotipo',         roles: ['administrador', 'investigador', 'tecnico_campo'] },
  // Acceso general autenticado
  { ruta: '/dashboard',        roles: ['administrador', 'investigador', 'tecnico_campo', 'visualizador', 'productor', 'invitado'] },
  { ruta: '/mi-perfil',        roles: ['administrador', 'investigador', 'tecnico_campo', 'visualizador', 'productor'] },
  { ruta: '/ayuda',            roles: ['administrador', 'investigador', 'tecnico_campo', 'visualizador', 'productor', 'invitado'] },
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Bloquea landing público: raíz siempre redirige a flujo autenticado
  if (pathname === '/') {
    const token = decodeCookieValue(request.cookies.get('agro_token')?.value)
    const rol   = normalizarRol(request.cookies.get('agro_rol')?.value)

    if (!token || !rol) {
      return NextResponse.redirect(new URL(RUTA_LOGIN, request.url))
    }

    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Evitar loop infinito en rutas públicas
  if (pathname === RUTA_LOGIN || pathname === RUTA_SIN_ACCESO) {
    return NextResponse.next()
  }

  const regla = REGLAS.find(r => pathname.startsWith(r.ruta))
  if (!regla) return NextResponse.next()

  const token = decodeCookieValue(request.cookies.get('agro_token')?.value)
  const rol   = normalizarRol(request.cookies.get('agro_rol')?.value)

  // Sin token → login
  if (!token) {
    const loginUrl = new URL(RUTA_LOGIN, request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Con token pero sin rol sincronizado -> forzar login para reconstruir sesión/cookies
  if (!rol) {
    const loginUrl = new URL(RUTA_LOGIN, request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Con token pero rol no autorizado → sin acceso
  if (!regla.roles.includes(rol)) {
    return NextResponse.redirect(new URL(RUTA_SIN_ACCESO, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/productores',
    '/productores/:path*',
    '/comunidades',
    '/comunidades/:path*',
    '/sociocultural',
    '/sociocultural/:path*',
    '/fenotipo',
    '/fenotipo/:path*',
    '/dashboard',
    '/mi-perfil',
    '/ayuda',
  ],
}
