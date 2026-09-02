export type Rol =
  | 'administrador'
  | 'investigador'
  | 'tecnico_campo'
  | 'visualizador'
  | 'productor'
  | 'invitado'

type UUID = string;

export interface Usuario {
  id: UUID 
  username: string
  nombre_completo?: string
  email?: string
  rol: Rol
  activo: boolean
  ultimo_acceso?: string | null
  last_login?: string | null       
  creado_en?: string | null
}

export interface Ubicacion {
  id: UUID 
  // Tipo de geometría (clave para SIG)
  tipo: 'punto' | 'poligono'
  // Coordenadas
  latitud?: number
  longitud?: number
  // Para mapas más avanzados (GeoJSON)
  geojson?: unknown
  // Metadatos
  referencia?: string // ej: "Centro de la comunidad"
}

export interface Comunidad {
  id: UUID 
  nombre: string
  nombre_lengua_orig?: string
  tipo?: 'indigena' | 'campesina' | 'ejidal' | 'mestiza' | 'mixta' | 'urbana' | 'rancheria' | 'otro'
  municipio_id: number
  municipio_nombre?: string
  ubicacion_id?: string // UUID relación
  presencia_maiz_nativo?: boolean
  presencia_historica_maiz?: boolean
  diversidad_ecologica_score?: number // 1-5
  riqueza_cultural_score?: number // 1-5
  prioridad_muestreo?: 'alta' | 'media' | 'baja'
  poblacion_total?: number
  num_localidades?: number
  fuente?: string
  activo?: boolean
}

export interface Productor {
  id: UUID
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
