import { http, HttpResponse } from 'msw'
import {
  MOCK_COMUNIDADES,
  MOCK_PASSWORDS,
  MOCK_PRODUCTORES,
  MOCK_USUARIOS,
} from './data'

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