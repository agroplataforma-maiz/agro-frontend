import type { Comunidad, Productor, Usuario } from '@/types'
import type { MedioParcela } from '@/hooks/useMedioParcela'

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
  creado_en: '2026-08-21T00:00:00.000Z',
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
    creado_en: '2026-08-20T00:00:00.000Z',
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
    creado_en: '2026-08-19T00:00:00.000Z',
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
    creado_en: '2026-08-18T00:00:00.000Z',
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
    creado_en: '2026-08-17T00:00:00.000Z',
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
    creado_en: '2026-08-16T00:00:00.000Z',
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

export const MOCK_UBICACIONES = [
  {
    id: 'mock-ubicacion-parcela-001',
    tipo_ubicacion: 'parcela',
    nombre: 'Ubicación parcela de prueba A',
    latitud: 21.9900,
    longitud: -98.9800,
    altitud_m: 70,
    precision_gps: 5,
    municipio_id: 1,
  },
  {
    id: 'mock-ubicacion-parcela-002',
    tipo_ubicacion: 'parcela',
    nombre: 'Ubicación parcela de prueba B',
    latitud: 21.9903,
    longitud: -98.9803,
    altitud_m: 72,
    precision_gps: 5,
    municipio_id: 1,
  },
  {
    id: 'mock-ubicacion-parcela-003',
    tipo_ubicacion: 'parcela',
    nombre: 'Ubicación parcela de prueba C',
    latitud: 22.0150,
    longitud: -98.9500,
    altitud_m: 68,
    precision_gps: 4,
    municipio_id: 1,
  },
]

export const MOCK_PARCELAS = [
  {
    id: 'mock-parcela-001',
    nombre: 'Parcela de prueba A',
    superficie_ha: '2.5000',
    sistema_manejo_id: null,
    tenencia: 'ejidal',
    topografia: 'plana',
    productor_id: 'mock-productor-001',
    ubicacion_id: 'mock-ubicacion-parcela-001',
    poligono:
      'POLYGON((-98.9805 21.9895,-98.9795 21.9895,-98.9795 21.9905,-98.9805 21.9905,-98.9805 21.9895))',
  },
  {
    id: 'mock-parcela-002',
    nombre: 'Parcela de prueba B',
    superficie_ha: '1.8000',
    sistema_manejo_id: null,
    tenencia: 'ejidal',
    topografia: 'ligeramente inclinada',
    productor_id: 'mock-productor-002',
    ubicacion_id: 'mock-ubicacion-parcela-002',
    poligono:
      'POLYGON((-98.9808 21.9898,-98.9798 21.9898,-98.9798 21.9908,-98.9808 21.9908,-98.9808 21.9898))',
  },
  {
    id: 'mock-parcela-003',
    nombre: 'Parcela de prueba C',
    superficie_ha: '3.2000',
    sistema_manejo_id: null,
    tenencia: 'comunal',
    topografia: 'plana',
    productor_id: null,
    ubicacion_id: 'mock-ubicacion-parcela-003',
    poligono:
      'POLYGON((-98.9505 22.0145,-98.9495 22.0145,-98.9495 22.0155,-98.9505 22.0155,-98.9505 22.0145))',
  },
]

export const MOCK_MEDIOS_PARCELA: MedioParcela[] = [
  {
    parcela_id: 'mock-parcela-001',
    ubicacion_id: 'mock-ubicacion-parcela-001',
    ubicacion: {
      latitud: 21.9901,
      longitud: -98.9801,
      altitud_m: 70,
      precision_gps: 5,
    },
    tipo_medio: 'foto',
    subtipo: 'parcela',
    nombre_archivo: 'parcela-prueba-a-01.jpg',
    nombre_guardado: 'mock-parcela-a-01.jpg',
    bucket: 'mock-bucket',
    object_key:
      '/img/rancho1.jpg',
    formato: 'image/jpeg',
    peso_kb: 245,
    descripcion:
      'Fotografía de prueba de la parcela A',
    uuid_envio: null,
    registrado_por: 'mock-tecnico-001',
    fecha_captura: '2026-09-20T10:30:00.000Z',
    creado_en: '2026-09-20T10:30:00.000Z',
    actualizado_en: '2026-09-20T10:30:00.000Z',
    id: 'mock-medio-001',
    url_temporal: 'img/rancho2.jpg',
  },

  {
    parcela_id: 'mock-parcela-001',
    ubicacion_id: 'mock-ubicacion-parcela-001',
    ubicacion: {
      latitud: 21.9902,
      longitud: -98.9799,
      altitud_m: 70,
      precision_gps: 5,
    },
    tipo_medio: 'foto',
    subtipo: 'cultivo',
    nombre_archivo: 'rancho2.jpg',
    nombre_guardado: 'rancho2.jpg',
    bucket: 'mock-bucket',
    object_key:
      '/img/rancho4.jpg',
    formato: 'image/jpeg',
    peso_kb: 310,
    descripcion:
      'Fotografía de prueba del cultivo de la parcela A',
    uuid_envio: null,
    registrado_por: 'mock-tecnico-001',
    fecha_captura: '2026-09-20T10:35:00.000Z',
    creado_en: '2026-09-20T10:35:00.000Z',
    actualizado_en: '2026-09-20T10:35:00.000Z',
    id: 'mock-medio-002',
    url_temporal: '/img/rancho4.jpg',
  },

  {
    parcela_id: 'mock-parcela-002',
    ubicacion_id: 'mock-ubicacion-parcela-002',
    ubicacion: {
      latitud: 21.9904,
      longitud: -98.9802,
      altitud_m: 72,
      precision_gps: 5,
    },
    tipo_medio: 'foto',
    subtipo: 'cultivo',
    nombre_archivo: 'parcela-prueba-b-02.jpg',
    nombre_guardado: 'mock-parcela-b-02.jpg',
    bucket: 'mock-bucket',
    object_key:
      'parcelas/mock-parcela-002/mock-parcela-b-01.jpg',
    formato: 'image/jpeg',
    peso_kb: 280,
    descripcion:
      'Fotografía de prueba de la parcela B',
    uuid_envio: null,
    registrado_por: 'mock-tecnico-001',
    fecha_captura: '2026-09-20T11:00:00.000Z',
    creado_en: '2026-09-20T11:00:00.000Z',
    actualizado_en: '2026-09-20T11:00:00.000Z',
    id: 'mock-medio-003',
    url_temporal: '/img/rancho1.jpg',
  },

  {
    parcela_id: 'mock-parcela-003',
    ubicacion_id: 'mock-ubicacion-parcela-003',
    ubicacion: {
      latitud: 22.0152,
      longitud: -98.9502,
      altitud_m: 68,
      precision_gps: 4,
    },
    tipo_medio: 'drone',
    subtipo: 'aerea',
    nombre_archivo: 'rancho3.jpg',
    nombre_guardado: 'rancho3.jpg',
    bucket: 'mock-bucket',
    object_key:
      '/img/rancho3.jpg',
    formato: 'image/jpeg',
    peso_kb: 520,
    descripcion:
      'Imagen aérea de prueba de la parcela C',
    uuid_envio: null,
    registrado_por: 'mock-investigador-001',
    fecha_captura: '2026-09-20T12:00:00.000Z',
    creado_en: '2026-09-20T12:00:00.000Z',
    actualizado_en: '2026-09-20T12:00:00.000Z',
    id: 'mock-medio-004',
    url_temporal: '/img/rancho3.jpg',
  },
]