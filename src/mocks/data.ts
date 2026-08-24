import type { Comunidad, Productor, Usuario } from '@/types'

export const MOCK_ADMIN_CREDENTIALS = {
  identificador: 'admin.local',
  password: 'admin123',
}

export const MOCK_ADMIN: Usuario = {
  id: 'mock-admin-001',
  username: 'admin.local',
  nombre_completo: 'Administrador Local',
  email: 'admin@local.test',
  rol: 'administrador',
  activo: true,
  ultimo_acceso: null,
  last_login: null,
  fecha_registro: '2026-08-21T00:00:00.000Z',
}

export const MOCK_USUARIOS: Usuario[] = [
  MOCK_ADMIN,
  {
    id: 'mock-investigador-001',
    username: 'investigador.local',
    nombre_completo: 'Investigador Local',
    email: 'investigador@local.test',
    rol: 'investigador',
    activo: true,
    ultimo_acceso: null,
    last_login: null,
    fecha_registro: '2026-08-20T00:00:00.000Z',
  },
  {
    id: 'mock-tecnico-001',
    username: 'tecnico.local',
    nombre_completo: 'Tecnico de Campo Local',
    email: 'tecnico@local.test',
    rol: 'tecnico_campo',
    activo: true,
    ultimo_acceso: null,
    last_login: null,
    fecha_registro: '2026-08-19T00:00:00.000Z',
  },
  {
    id: 'mock-visualizador-001',
    username: 'visualizador.local',
    nombre_completo: 'Visualizador Local',
    email: 'visualizador@local.test',
    rol: 'visualizador',
    activo: true,
    ultimo_acceso: null,
    last_login: null,
    fecha_registro: '2026-08-18T00:00:00.000Z',
  },
  {
    id: 'mock-productor-001',
    username: 'productor.local',
    nombre_completo: 'Productor Local',
    email: 'productor@local.test',
    rol: 'productor',
    activo: true,
    ultimo_acceso: null,
    last_login: null,
    fecha_registro: '2026-08-17T00:00:00.000Z',
  },
  {
    id: 'mock-invitado-001',
    username: 'invitado',
    nombre_completo: 'Invitado Local',
    email: 'invitado@local.test',
    rol: 'visualizador',
    activo: true,
    ultimo_acceso: null,
    last_login: null,
    fecha_registro: '2026-08-16T00:00:00.000Z',
  },
]

export const MOCK_PASSWORDS: Record<string, string> = {
  'admin.local': 'admin123',
  'investigador.local': 'investigador123',
  'tecnico.local': 'tecnico123',
  'visualizador.local': 'visualizador123',
  'productor.local': 'productor123',
  invitado: 'invitado',
}

export const MOCK_COMUNIDADES: Comunidad[] = [
  {
    id: 'mock-comunidad-001',
    nombre: 'Comunidad de prueba A',
    tipo: 'indigena',
    municipio_id: 1,
    municipio_nombre: 'Ciudad Valles',
    presencia_maiz_nativo: true,
    prioridad_muestreo: 'alta',
    poblacion_total: 420,
    num_localidades: 2,
    activo: true,
  },
  {
    id: 'mock-comunidad-002',
    nombre: 'Comunidad de prueba B',
    tipo: 'campesina',
    municipio_id: 2,
    municipio_nombre: 'Tamasopo',
    presencia_maiz_nativo: true,
    prioridad_muestreo: 'media',
    poblacion_total: 280,
    num_localidades: 1,
    activo: true,
  },
]

export const MOCK_PRODUCTORES: Productor[] = [
  {
    id: 'mock-productor-001',
    nombres: 'Maria',
    apellido_paterno: 'Hernandez',
    apellido_materno: 'Lopez',
    municipio_id: 1,
    municipio_nombre: 'Ciudad Valles',
    comunidad_id: 1,
    comunidad_nombre: 'Comunidad de prueba A',
  },
  {
    id: 'mock-productor-002',
    nombres: 'Juan',
    apellido_paterno: 'Martinez',
    apellido_materno: 'Santos',
    municipio_id: 2,
    municipio_nombre: 'Tamasopo',
    comunidad_id: 2,
    comunidad_nombre: 'Comunidad de prueba B',
  },
]