// /app/hooks/useFenotipo.ts

import { useState } from "react";

export interface DatosGenerales {
  raza_id: string;
  tipo: string;
  colector: string;
  municipio_id: string;
  localidad_id: string;
  altitud: string;
  temporada: string;
  plantas: string;
  reps: string;
  notas: string;
}

const DG_INICIAL: DatosGenerales = {
  raza_id: "", tipo: "", colector: "", municipio_id: "",
  localidad_id: "", altitud: "", temporada: "", plantas: "", reps: "", notas: "",
};

const LS_DATA = "fenotipo_data";
const LS_DG   = "fenotipo_dg";

function loadLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback; }
  catch { return fallback; }
}

export const useFenotipo = () => {
  const [data, setData] = useState<Record<number, string>>(
    () => loadLS(LS_DATA, {})
  );
  const [step, setStep] = useState(0);
  const [dg, setDg] = useState<DatosGenerales>(
    () => ({ ...DG_INICIAL, ...loadLS<Partial<DatosGenerales>>(LS_DG, {}) })
  );

  const update = (id: number, value: string) => {
    setData((prev) => {
      const next = { ...prev, [id]: value };
      localStorage.setItem(LS_DATA, JSON.stringify(next));
      return next;
    });
  };

  const updateDg = (k: keyof DatosGenerales, v: string) => {
    setDg((prev) => {
      const next = { ...prev, [k]: v };
      localStorage.setItem(LS_DG, JSON.stringify(next));
      return next;
    });
  };

  const clearAll = () => {
    localStorage.removeItem(LS_DATA);
    localStorage.removeItem(LS_DG);
    setData({});
    setDg(DG_INICIAL);
    setStep(0);
  };

  return { data, step, setStep, update, dg, updateDg, clearAll };
};