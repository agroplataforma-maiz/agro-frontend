import { http, HttpResponse } from 'msw'
import {
  MOCK_COMUNIDADES,
  MOCK_PASSWORDS,
  MOCK_PRODUCTORES,
  MOCK_USUARIOS,
  MOCK_UBICACIONES,
  MOCK_PARCELAS,
  MOCK_MEDIOS_PARCELA,
} from './data'

// ─────────────────────────────────────────────────────────────
// MOCKS DE ORGANIZACIONES
// ─────────────────────────────────────────────────────────────

const investigadoresMock = MOCK_USUARIOS
  .filter((usuario) => usuario.rol === 'investigador')
  .map((usuario) => ({
    id: usuario.id,
    user_id: usuario.id,
    username: usuario.username,
    nombre_completo: usuario.nombre_completo ?? usuario.username,
    email: usuario.email ?? '',
    rol: 'investigador',
    activo: usuario.activo,
    institucion: 'Tecnm',
    especialidad: 'Agronomía',
    orcid: null,
    pais: 'México',
    notas: 'Usuario investigador de prueba',
    creado_en: usuario.creado_en ?? null,
    actualizado_en: null,
    ultimo_acceso: usuario.ultimo_acceso ?? null,
  }))

const propietarioInicial =
  investigadoresMock[0]

const MOCK_ORGANIZACIONES = propietarioInicial
  ? [
    {
      id: '89efc614-9795-4d53-9c9c-44fe2e806569',
      nombre: 'Organización de prueba',
      descripcion: 'Organización de prueba para desarrollo',
      propietario_id: propietarioInicial.user_id,
      activo: true,
    },
  ]
  : []

const MOCK_MIEMBROS: Array<{
  id: string
  organizacion_id: string
  usuario_id: string
  fecha_ingreso: string
  activo: boolean
}> = []

export const handlers = [
  http.post('*/auth/login', async ({ request }) => {
    const body = await request.json() as { identificador?: string; password?: string }
    const identificador = body.identificador?.trim().toLowerCase()
    const usuario = MOCK_USUARIOS.find((item) =>
      item.username === identificador || item.email === identificador,
    )
    const passwordEsperada = usuario ? MOCK_PASSWORDS[usuario.username] : undefined

    if (!usuario || body.password !== passwordEsperada) {
      return HttpResponse.json({ detail: 'Credenciales incorrectas' }, { status: 401 })
    }

    return HttpResponse.json({
      access_token: `mock-token-${usuario.username}`,
      token_type: 'bearer',
      usuario,
    })
  }),

  http.get('*/auth/usuarios', () => HttpResponse.json(MOCK_USUARIOS)),

  // ─────────────────────────────────────────────────────────────
  // ORGANIZACIONES
  // ─────────────────────────────────────────────────────────────

  http.get('*/core/organizaciones', () =>
    HttpResponse.json(MOCK_ORGANIZACIONES)
  ),

  http.get('*/core/organizaciones/propietarios', () =>
    HttpResponse.json(
      MOCK_ORGANIZACIONES.map((organizacion) => {
        const propietario = investigadoresMock.find(
          (investigador) =>
            investigador.user_id === organizacion.propietario_id
        )

        return {
          organizacion_id: organizacion.id,
          organizacion_nombre: organizacion.nombre,
          propietario_id: organizacion.propietario_id,
          propietario_nombre:
            propietario?.nombre_completo ?? 'Propietario desconocido',
          propietario_email:
            propietario?.email ?? '',
        }
      })
    )
  ),

  http.get('*/social/investigadores', () =>
    HttpResponse.json(investigadoresMock)
  ),

  http.post('*/social/investigadores', async ({ request }) => {
    const body = await request.json() as {
      username?: string
      email?: string
      password?: string
      nombre_completo?: string
      institucion?: string
      especialidad?: string
      notas?: string
    }

    if (
      !body.username?.trim() ||
      !body.email?.trim() ||
      !body.password?.trim() ||
      !body.nombre_completo?.trim()
    ) {
      return HttpResponse.json(
        { detail: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const username = body.username.trim().toLowerCase()
    const email = body.email.trim().toLowerCase()

    const existe = MOCK_USUARIOS.some(
      usuario =>
        usuario.username.toLowerCase() === username ||
        usuario.email?.toLowerCase() === email
    )

    if (existe) {
      return HttpResponse.json(
        { detail: 'El username o correo electrónico ya está registrado' },
        { status: 409 }
      )
    }

    const ahora = new Date().toISOString()
    const id = crypto.randomUUID()

    const nuevoUsuario = {
      id,
      username,
      email,
      nombre_completo: body.nombre_completo.trim(),
      rol: 'investigador' as const,
      activo: true,
      ultimo_acceso: null,
      creado_en: ahora,
    }

    // El alta de investigador también crea su usuario.
    MOCK_USUARIOS.push(nuevoUsuario)

    // Guardamos la contraseña para que pueda iniciar sesión
    // mediante el mock de /auth/login.
    MOCK_PASSWORDS[username] = body.password.trim()

    // El investigador queda relacionado con el usuario mediante user_id.
    const nuevoInvestigador = {
      id,
      user_id: id,
      username,
      nombre_completo: nuevoUsuario.nombre_completo,
      email,
      rol: 'investigador',
      activo: true,
      institucion: body.institucion?.trim() || '',
      especialidad: body.especialidad?.trim() || '',
      orcid: null,
      pais: null,
      notas: body.notas?.trim() || '',
      creado_en: ahora,
      actualizado_en: ahora,
      ultimo_acceso: null,
    }

    investigadoresMock.push(nuevoInvestigador)

    return HttpResponse.json(
      nuevoInvestigador,
      { status: 201 }
    )
  }),

  http.post('*/core/organizaciones', async ({ request }) => {
    const body = await request.json() as {
      nombre?: string
      descripcion?: string
      propietario_id?: string
    }

    if (!body.nombre?.trim()) {
      return HttpResponse.json(
        { detail: 'El nombre de la organización es obligatorio' },
        { status: 400 }
      )
    }

    if (!body.propietario_id) {
      return HttpResponse.json(
        { detail: 'El propietario es obligatorio' },
        { status: 400 }
      )
    }

    const propietario = investigadoresMock.find(
      (investigador) =>
        investigador.user_id === body.propietario_id
    )

    if (!propietario) {
      return HttpResponse.json(
        { detail: 'El propietario debe ser un investigador' },
        { status: 400 }
      )
    }

    const nuevaOrganizacion = {
      id: crypto.randomUUID(),
      nombre: body.nombre.trim(),
      descripcion: body.descripcion?.trim() ?? '',
      propietario_id: body.propietario_id,
      activo: true,
    }

    MOCK_ORGANIZACIONES.push(nuevaOrganizacion)

    return HttpResponse.json(
      nuevaOrganizacion,
      { status: 201 }
    )
  }),

  http.get(
    '*/core/organizaciones/:organizacionId/miembros',
    ({ params }) => {
      const organizacionId = String(params.organizacionId)

      const miembros = MOCK_MIEMBROS.filter(
        (miembro) =>
          miembro.organizacion_id === organizacionId
      )

      return HttpResponse.json(miembros)
    }
  ),

  http.post(
    '*/core/organizaciones/:organizacionId/miembros',
    async ({ request, params }) => {
      const organizacionId = String(params.organizacionId)

      const body = await request.json() as {
        usuario_id?: string
      }

      const organizacion = MOCK_ORGANIZACIONES.find(
        (item) => item.id === organizacionId
      )

      if (!organizacion) {
        return HttpResponse.json(
          { detail: 'Organización no encontrada' },
          { status: 404 }
        )
      }

      if (!body.usuario_id) {
        return HttpResponse.json(
          { detail: 'El usuario es obligatorio' },
          { status: 400 }
        )
      }

      // Identificar al usuario autenticado mediante el mock token.
      const authorization =
        request.headers.get('Authorization') ?? ''

      const token = authorization.replace(
        /^Bearer\s+/i,
        ''
      )

      const username = token.startsWith('mock-token-')
        ? token.replace('mock-token-', '')
        : ''

      const usuarioActual = MOCK_USUARIOS.find(
        (usuario) => usuario.username === username
      )

      // Regla real del backend:
      // solamente el propietario puede agregar miembros.
      if (
        !usuarioActual ||
        usuarioActual.id !== organizacion.propietario_id
      ) {
        return HttpResponse.json(
          {
            detail:
              'Solo el propietario de la organización puede agregar miembros',
          },
          { status: 403 }
        )
      }

      const usuario = MOCK_USUARIOS.find(
        (item) => item.id === body.usuario_id
      )

      if (!usuario) {
        return HttpResponse.json(
          { detail: 'Usuario no encontrado' },
          { status: 404 }
        )
      }

      const yaExiste = MOCK_MIEMBROS.some(
        (miembro) =>
          miembro.organizacion_id === organizacionId &&
          miembro.usuario_id === body.usuario_id &&
          miembro.activo
      )

      if (yaExiste) {
        return HttpResponse.json(
          { detail: 'El usuario ya pertenece a la organización' },
          { status: 409 }
        )
      }

      const nuevoMiembro = {
        id: crypto.randomUUID(),
        organizacion_id: organizacionId,
        usuario_id: body.usuario_id,
        fecha_ingreso: new Date().toISOString(),
        activo: true,
      }

      MOCK_MIEMBROS.push(nuevoMiembro)

      return HttpResponse.json(
        nuevoMiembro,
        { status: 201 }
      )
    }
  ),

  http.delete(
    '*/core/organizaciones/:organizacionId/miembros/:usuarioId',
    ({ params }) => {
      const organizacionId = String(params.organizacionId)
      const usuarioId = String(params.usuarioId)

      const indice = MOCK_MIEMBROS.findIndex(
        (miembro) =>
          miembro.organizacion_id === organizacionId &&
          miembro.usuario_id === usuarioId
      )

      if (indice === -1) {
        return HttpResponse.json(
          { detail: 'Miembro no encontrado' },
          { status: 404 }
        )
      }

      MOCK_MIEMBROS.splice(indice, 1)

      return new HttpResponse(null, { status: 204 })
    }
  ),

  http.delete(
    '*/core/organizaciones/:organizacionId',
    ({ params }) => {
      const organizacionId = String(params.organizacionId)

      const organizacion = MOCK_ORGANIZACIONES.find(
        (item) => item.id === organizacionId
      )

      if (!organizacion) {
        return HttpResponse.json(
          { detail: 'Organización no encontrada' },
          { status: 404 }
        )
      }

      organizacion.activo = false

      return HttpResponse.json(organizacion)
    }
  ),

  http.get('*/ubicaciones', () =>
    HttpResponse.json({
      count: MOCK_UBICACIONES.length,
      results: MOCK_UBICACIONES,
    }),
  ),

  http.get('*/parcelas', () =>
    HttpResponse.json({
      count: MOCK_PARCELAS.length,
      results: MOCK_PARCELAS,
    }),
  ),

  http.get('*/medios-parcela', () =>
    HttpResponse.json(MOCK_MEDIOS_PARCELA)
  ),

  http.get('*/medios-parcelas/6a8f26736cc30b76d974b409', () =>
    HttpResponse.json({
      parcela_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      ubicacion_id: '583104f0-515c-4495-b22b-fcb90303dfee',
      ubicacion: {
        latitud: 21.99,
        longitud: -98.99,
        altitud_m: 1,
        precision_gps: 4,
      },
      tipo_medio: 'foto',
      subtipo: null,
      nombre_archivo: 'Debian-2026-05-09-22-30-28.png',
      nombre_guardado: '5980ad7b-d2da-4f48-aa75-a686ad69e19f.png',
      bucket: 'fls-a29496da-c35a-4a09-bc38-3558bd8f5836',
      object_key:
        'parcelas/3fa85f64-5717-4562-b3fc-2c963f66afa6/5980ad7b-d2da-4f48-aa75-a686ad69e19f.png',
      formato: 'image/png',
      peso_kb: 337,
      descripcion: null,
      uuid_envio: null,
      registrado_por: 'f9344140-51b7-4c73-96a2-b7885fde8c8e',
      fecha_captura: '2026-08-26T17:46:27.560000',
      creado_en: '2026-08-26T17:46:27.560000',
      actualizado_en: '2026-08-26T17:46:27.560000',
      id: '6a8f26736cc30b76d974b409',

      // Temporalmente no usamos la URL real de R2.
      // La pondremos después cuando comprobemos el punto.
      url_temporal: null,
    }),
  ),

  http.get('*/core/comunidad', () => HttpResponse.json(MOCK_COMUNIDADES)),
  http.get('*/core/productor', () => HttpResponse.json(MOCK_PRODUCTORES)),
]