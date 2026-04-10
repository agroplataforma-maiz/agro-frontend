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
  addToast: (msg, tipo = 'ok') => {
    // Fallback para navegadores sin crypto.randomUUID
    function uuidv4() {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
      }
      // Fallback simple (no criptográficamente seguro, pero suficiente para IDs de UI)
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
    set((s) => ({
      toasts: [
        ...s.toasts,
        { id: uuidv4(), msg, tipo },
      ],
    }));
  },
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
