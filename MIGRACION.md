# Guía de migración · agro-frontend → Next.js 15

## 1. Instalación

```bash
npx create-next-app@latest agro-frontend \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd agro-frontend

npm install zustand @tanstack/react-query axios
npm install -D @types/node
```

---

## 2. Variables de entorno

Crea `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

En producción cambia a:
```env
NEXT_PUBLIC_API_URL=https://agromaiz.mx
```

> Esto reemplaza los 5 valores de API hardcodeados que hay en el proyecto actual.

---

## 3. Estructura de carpetas

```
src/
├── app/                          # App Router de Next.js
│   ├── layout.tsx                # Layout raíz (fuentes, providers)
│   ├── page.tsx                  # Landing pública /
│   ├── login/
│   │   └── page.tsx              # /login
│   ├── divulgacion/
│   │   └── page.tsx              # /divulgacion (pública, SSR)
│   ├── productores/
│   │   ├── page.tsx              # /productores (lista pública)
│   │   └── [id]/
│   │       └── page.tsx          # /productores/123 (perfil público, SEO)
│   └── admin/                    # Zona privada (protegida por middleware)
│       ├── layout.tsx            # Layout con sidebar
│       ├── dashboard/
│       │   └── page.tsx
│       ├── productores/
│       │   └── page.tsx
│       ├── usuarios/
│       │   └── page.tsx
│       └── catalogos/
│           └── page.tsx
│
├── components/
│   ├── ui/                       # Componentes reutilizables
│   │   ├── Topbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── Tabla.tsx             # Reemplaza renderTabla/renderLista/renderUsuariosGrid
│   │   ├── Paginacion.tsx
│   │   └── Badge.tsx
│   └── productores/
│       ├── ListaProductores.tsx
│       ├── PerfilProductor.tsx
│       ├── ModalProductor.tsx
│       └── SeccionSaberes.tsx
│
├── lib/
│   ├── api.ts                    # Tu helper api() centralizado
│   ├── auth.ts                   # Funciones de sesión
│   └── utils.ts                  # calcularEdad, dash, siNo, etc.
│
├── store/
│   └── useAppStore.ts            # Zustand — reemplaza window.*
│
├── hooks/
│   ├── useAuth.ts                # Hook de sesión
│   └── useCatalogos.ts           # Hook para catálogos geo/tipo
│
├── types/
│   └── index.ts                  # Tipos TypeScript del dominio
│
└── styles/
    └── globals.css               # Tus variables :root + reset
```

---

## 4. Orden de migración recomendado

Sigue este orden — cada paso es funcional antes de pasar al siguiente:

### Fase 1 — Fundamentos (día 1)
1. `src/styles/globals.css` — copia tus variables CSS `:root`
2. `src/lib/api.ts` — centraliza la URL y el helper `api()`
3. `src/lib/auth.ts` — funciones de sesión (guardar/obtener/cerrar)
4. `src/store/useAppStore.ts` — reemplaza `window.municipiosCatalogo`, etc.
5. `src/types/index.ts` — tipos del dominio (Productor, Usuario, etc.)
6. `middleware.ts` — protege `/admin/*`

### Fase 2 — Auth (día 1-2)
7. `src/app/login/page.tsx` — migra `login.html` + `login.js`

### Fase 3 — Admin (días 2-4)
8. `src/app/admin/layout.tsx` — sidebar + topbar compartidos
9. `src/app/admin/dashboard/page.tsx`
10. `src/app/admin/productores/page.tsx` — el más complejo
11. `src/app/admin/usuarios/page.tsx`
12. `src/app/admin/catalogos/page.tsx`

### Fase 4 — Público (día 4-5)
13. `src/app/page.tsx` — landing
14. `src/app/productores/page.tsx` — lista pública
15. `src/app/productores/[id]/page.tsx` — perfil con SEO
16. `src/app/divulgacion/page.tsx`

---

## 5. Equivalencias clave

| Código actual | Next.js equivalente |
|---|---|
| `const API = 'http://localhost:8000'` | `process.env.NEXT_PUBLIC_API_URL` |
| `localStorage.getItem('agro_token')` | `lib/auth.ts → getToken()` |
| `window.municipiosCatalogo` | `useAppStore` (Zustand) |
| `location.href = 'login.html'` | `router.push('/login')` |
| `renderTabla(datos)` | `<Tabla datos={datos} />` |
| `renderLista(datos)` | `<Tabla datos={datos} />` |
| `renderUsuariosGrid(lista)` | `<Tabla datos={lista} />` |
| `toast(msg, tipo)` | `<Toast />` + Zustand |
| `confirmar(msg, fn)` | `<Modal />` con callback |
| `document.getElementById` | `useRef` o estado React |

---

## 6. El middleware de auth

El archivo `middleware.ts` en la raíz reemplaza los `if (!token) location.href = 'login.html'`
que están regados en cada JS. Con esto, **una sola vez** protege todas las rutas `/admin/*`.

Ver archivo `middleware.ts` incluido en esta guía.
