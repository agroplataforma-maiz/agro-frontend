// src/store/useAppStore.ts
// Reemplaza window.municipiosCatalogo, window.localidadesCatalogo, window.tiposProductorCatalogo
// y el estado de toasts que estaba en el DOM

import { create } from 'zustand'
import type { Municipio, Localidad, TipoProductor, Usuario } from '@/types'

interface Toast {
  id: string
  msg: string
  tipo: 'ok' | 'err' | 'warn'
}

interface AppState {
  // Usuario en sesión
  usuario: Usuario | null
  setUsuario: (u: Usuario | null) => void

  // Catálogos geo (antes en window.*)
  municipios: Municipio[]
  localidades: Localidad[]
  tiposProductor: TipoProductor[]
  setMunicipios:     (data: Municipio[])     => void
  setLocalidades:    (data: Localidad[])     => void
  setTiposProductor: (data: TipoProductor[]) => void

  // Toasts
  toasts: Toast[]
  addToast: (msg: string, tipo?: Toast['tipo']) => void
  removeToast: (id: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  usuario: null,
  setUsuario: (usuario) => set({ usuario }),

  municipios: [],
  localidades: [],
  tiposProductor: [],
  setMunicipios:     (municipios)     => set({ municipios }),
  setLocalidades:    (localidades)    => set({ localidades }),
  setTiposProductor: (tiposProductor) => set({ tiposProductor }),

  toasts: [],
  addToast: (msg, tipo = 'ok') =>
    set((s) => ({
      toasts: [
        ...s.toasts,
        { id: crypto.randomUUID(), msg, tipo },
      ],
    })),
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
