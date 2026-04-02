// src/lib/api.ts
// Helper centralizado de HTTP para toda la aplicación.
// Producción: https://agromaiz.mx — nginx proxia /api/* al backend

const API_BASE = 'https://agromaiz.mx'

function normalizePath(path: string): string {
  const raw = path.trim()

  // URL absoluta: no se toca
  if (/^https?:\/\//i.test(raw)) return raw

  const p = raw.startsWith('/') ? raw : `/${raw}`

  // Asegurar prefijo /api
  if (p === '/api' || p.startsWith('/api/')) return p
  return `/api${p}`
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
    : `${API_BASE}${normalizedPath}`

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
