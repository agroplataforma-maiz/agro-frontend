// src/types/index.ts
// Tipos del dominio — agro-frontend

export type Rol =
  | 'administrador'
  | 'investigador'
  | 'tecnico_campo'
  | 'visualizador'
  | 'productor'
  | 'invitado'

export interface Usuario {
  id: number
  username: string
  nombre_completo?: string
  email?: string
  rol: Rol
  activo: boolean
  ultimo_acceso?: string
  last_login?: string        // alias Django REST Framework
  fecha_registro?: string
}

export interface Productor {
  id: number
  nombres: string
  apellido_paterno: string
  apellido_materno?: string
  fecha_nacimiento?: string
  genero?: string
  anios_experiencia?: number
  municipio_id?: number
  municipio_nombre?: string
  localidad_id?: number
  localidad_nombre?: string
  tipo_productor_id?: number
  tipo_productor_nombre?: string
  comunidad_id?: number
  comunidad_nombre?: string
}

export interface Municipio {
  id: number
  nombre: string
  estado?: string
}

export interface Localidad {
  id: number
  nombre: string
  municipio_id: number
}

export interface TipoProductor {
  id: number
  nombre: string
}

export interface Comunidad {
  id: number
  nombre: string
  municipio_id?: number
  municipio_nombre?: string
  localidad_id?: number
  localidad_nombre?: string
  lengua_indigena?: string
  poblacion?: number
  num_productores?: number
  latitud?: number
  longitud?: number
  notas?: string
}

export interface Catalogo {
  id: number
  nombre: string
  descripcion?: string
  [key: string]: unknown
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
}

// Auth
export interface LoginPayload {
  identificador: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  usuario: Usuario
}

// Roles UI
export const ROL_LABELS: Record<Rol, string> = {
  administrador: '👑 Administrador',
  investigador:  '🔬 Investigador',
  tecnico_campo: '🌾 Técnico de campo',
  visualizador:  '📊 Consultor',
  productor:     '🌽 Productor / Comunidad',
  invitado:      '👁️ Invitado',
}

export const ROL_COLOR: Record<Rol, string> = {
  administrador: '#3D2208',
  investigador:  '#2A5C3F',
  tecnico_campo: '#C8820A',
  visualizador:  '#1D4ED8',
  productor:     '#6B3D1E',
  invitado:      '#888888',
}

// Rutas permitidas por rol (prefijos). '*' = acceso total.
export const ROL_RUTAS_PERMITIDAS: Record<Rol, string[]> = {
  administrador: ['*'],
  investigador:  ['/dashboard', '/productores', '/comunidades', '/sociocultural', '/fenotipo', '/admin/catalogos', '/mi-perfil'],
  tecnico_campo: ['/dashboard', '/productores', '/comunidades', '/sociocultural', '/fenotipo', '/mi-perfil'],
  visualizador:  ['/dashboard', '/mi-perfil', '/comunidades'],
  productor:     ['/dashboard', '/mi-perfil', '/comunidades'],
  invitado:      ['/dashboard', '/comunidades'],
}

// Página de inicio tras login según rol
export const ROL_HOME: Record<Rol, string> = {
  administrador: '/admin/dashboard',
  investigador:  '/dashboard',
  tecnico_campo: '/dashboard',
  visualizador:  '/dashboard',
  productor:     '/dashboard',
  invitado:      '/dashboard',
}
