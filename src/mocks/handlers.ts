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
  http.get('*/core/comunidad', () => HttpResponse.json(MOCK_COMUNIDADES)),
  http.get('*/core/productor', () => HttpResponse.json(MOCK_PRODUCTORES)),
]