// src/lib/api.ts
// Helper centralizado — reemplaza los 5 API distintos del proyecto actual

const RAW_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? (process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : '')
const SANITIZED_BASE_URL = RAW_BASE_URL.replace(/\/api\/?$/i, '')
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

// En producción usa env si está definida; si no, usa base relativa.
const BASE_URL = IS_PRODUCTION ? (SANITIZED_BASE_URL || '') : SANITIZED_BASE_URL
const IS_LOCAL_BACKEND = !IS_PRODUCTION && /localhost|127\.0\.0\.1/i.test(BASE_URL)

function normalizePath(path: string): string {
  const raw = path.trim()

  // Si ya es URL absoluta, no se modifica
  if (/^https?:\/\//i.test(raw)) return raw

  const withSlash = raw.startsWith('/') ? raw : `/${raw}`

  // En local, el backend no usa prefijo /api
  if (IS_LOCAL_BACKEND) {
    if (withSlash === '/api') return '/'
    if (withSlash.startsWith('/api/')) return withSlash.replace(/^\/api/, '')
    return withSlash
  }

  // En producción, forzar prefijo /api
  if (withSlash === '/api' || withSlash.startsWith('/api/')) return withSlash
  return `/api${withSlash}`
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('agro_token')
}

interface ApiOptions extends RequestInit {
  auth?: boolean // true por defecto
  next?: {
    revalidate?: number
    tags?: string[]
  }
}

async function api<T = unknown>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { auth = true, headers, ...rest } = opts

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  }

  if (auth) {
    const token = getToken()
    if (token) reqHeaders['Authorization'] = `Bearer ${token}`
  }
  const hadAuthToken = Boolean(reqHeaders['Authorization'])

  const normalizedPath = normalizePath(path)
  const url = /^https?:\/\//i.test(normalizedPath)
    ? normalizedPath
    : `${BASE_URL}${normalizedPath}`

  const res = await fetch(url, {
    headers: reqHeaders,
    ...rest,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    if (res.status === 401 && auth && hadAuthToken) {
      // Solo marcar "sesión expirada" cuando realmente había sesión autenticada.
      localStorage.removeItem('agro_token')
      localStorage.removeItem('agro_user')
      document.cookie = 'agro_token=; path=/; max-age=0'
      const redirect = encodeURIComponent(window.location.pathname)
      window.location.href = `/login?redirect=${redirect}&expired=1`
    }
    throw new Error(err.detail || `Error ${res.status}`)
  }

  if (res.status === 204) return null as T
  return res.json()
}

// Métodos de conveniencia — iguales a los del productores.js actual
export const GET  = <T>(path: string)           => api<T>(path)
export const POST = <T>(path: string, data: unknown) =>
  api<T>(path, { method: 'POST', body: JSON.stringify(data) })
export const PUT  = <T>(path: string, data: unknown) =>
  api<T>(path, { method: 'PUT',  body: JSON.stringify(data) })
export const DEL  = <T>(path: string) =>
  api<T>(path, { method: 'DELETE' })

// Para llamadas sin auth (login, registro, páginas públicas)
export const PUBLIC_GET = <T>(path: string, opts: Omit<ApiOptions, 'auth'> = {}) =>
  api<T>(path, { ...opts, auth: false })

export default api
