// src/hooks/useSociocultural.ts
// Estado local + persistencia en localStorage para el registro sociocultural

import { useState } from "react";

// ── Sección 1: Productor ───────────────────────────────────────────────
export interface DatosProductor {
  productor_id: string;
  entrevistador: string;
  fecha: string;
  consentimiento: string;
}

// ── Sección 2: Territorio y comunidad ─────────────────────────────────
export interface DatosTerritorio {
  municipio_id: string;
  localidad_id: string;
  comunidad: string;
  lengua_id: string;
  altitud: string;
  superficie_ha: string;
  tenencia: string;
}

// ── Sección 3: Prácticas de cultivo ───────────────────────────────────
export interface DatosPracticas {
  sistema_cultivo: string;
  asociaciones: string[];
  preparacion_suelo: string;
  siembra_tipo: string;
  fecha_siembra: string;
  densidad_plantas: string;
  uso_agroquimicos: string;
  fertilizacion: string;
  control_plagas: string;
  riego: string;
  almacenamiento: string;
}

// ── Sección 4: Saberes y tradición ────────────────────────────────────
export interface DatosSaberes {
  nombre_local: string;
  origen_semilla: string;
  anios_cultivo: string;
  seleccion_semilla: string;
  criterios_seleccion: string[];
  intercambio_semilla: string;
  usos: string[];
  preparaciones: string;
  valor_cultural: string;
  rituales: string;
  observaciones_saberes: string;
}

// ── Sección 5: Economía y mercado ─────────────────────────────────────
export interface DatosEconomia {
  destino_produccion: string[];
  precio_kg: string;
  canales_venta: string;
  autoconsumo_pct: string;
  venta_pct: string;
  semilla_pct: string;
  ingresos_adicionales: string;
  observaciones_economia: string;
}

export type SeccionKey =
  | "productor"
  | "territorio"
  | "practicas"
  | "saberes"
  | "economia";

export interface RegistroSociocultural {
  productor: DatosProductor;
  territorio: DatosTerritorio;
  practicas: DatosPracticas;
  saberes: DatosSaberes;
  economia: DatosEconomia;
}

// ── Valores iniciales ──────────────────────────────────────────────────
const INICIAL: RegistroSociocultural = {
  productor: {
    productor_id: "", entrevistador: "", fecha: "", consentimiento: "",
  },
  territorio: {
    municipio_id: "", localidad_id: "", comunidad: "", lengua_id: "",
    altitud: "", superficie_ha: "", tenencia: "",
  },
  practicas: {
    sistema_cultivo: "", asociaciones: [], preparacion_suelo: "",
    siembra_tipo: "", fecha_siembra: "", densidad_plantas: "",
    uso_agroquimicos: "", fertilizacion: "", control_plagas: "",
    riego: "", almacenamiento: "",
  },
  saberes: {
    nombre_local: "", origen_semilla: "", anios_cultivo: "",
    seleccion_semilla: "", criterios_seleccion: [], intercambio_semilla: "",
    usos: [], preparaciones: "", valor_cultural: "", rituales: "",
    observaciones_saberes: "",
  },
  economia: {
    destino_produccion: [], precio_kg: "", canales_venta: "",
    autoconsumo_pct: "", venta_pct: "", semilla_pct: "",
    ingresos_adicionales: "", observaciones_economia: "",
  },
};

const LS_KEY = "sociocultural_registro";

function loadLS<T>(fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "null") ?? fallback;
  } catch {
    return fallback;
  }
}

export function useSociocultural() {
  const [registro, setRegistro] = useState<RegistroSociocultural>(
    () => ({ ...INICIAL, ...loadLS<Partial<RegistroSociocultural>>({}) })
  );
  const [step, setStep] = useState(0);

  function updateSeccion<K extends SeccionKey>(
    seccion: K,
    campo: string,
    valor: RegistroSociocultural[K][keyof RegistroSociocultural[K]]
  ) {
    setRegistro((prev) => {
      const next = {
        ...prev,
        [seccion]: { ...prev[seccion], [campo]: valor },
      };
      localStorage.setItem(LS_KEY, JSON.stringify(next));
      return next;
    });
  }

  function toggleArray<K extends SeccionKey>(
    seccion: K,
    campo: string,
    valor: string
  ) {
    const arr = (registro[seccion] as unknown as Record<string, unknown>)[campo] as string[];
    const next = arr.includes(valor)
      ? arr.filter((v) => v !== valor)
      : [...arr, valor];
    updateSeccion(seccion, campo, next as RegistroSociocultural[K][keyof RegistroSociocultural[K]]);
  }

  function clearAll() {
    localStorage.removeItem(LS_KEY);
    setRegistro(INICIAL);
    setStep(0);
  }

  // Cuenta campos llenos por sección
  function progreso(seccion: SeccionKey): { llenos: number; total: number; pct: number } {
    const s = registro[seccion] as unknown as Record<string, unknown>;
    const vals = Object.values(s);
    const total = vals.length;
    const llenos = vals.filter((v) =>
      Array.isArray(v) ? v.length > 0 : v !== "" && v !== null && v !== undefined
    ).length;
    return { llenos, total, pct: total > 0 ? Math.round((llenos / total) * 100) : 0 };
  }

  return { registro, step, setStep, updateSeccion, toggleArray, clearAll, progreso };
}
