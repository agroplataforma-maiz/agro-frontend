
'use client';

import { useQuery } from '@tanstack/react-query';
import { GET } from '@/lib/api';
import type { Germoplasma, Ubicacion } from '@/types';

interface RespuestaUbicaciones {
  count: number;
  results: Ubicacion[];
}

export type GermoplasmaMapa = Germoplasma & {
  ubicacion: Ubicacion | null;
};

export function useGermoplasmaMapa() {
  return useQuery<GermoplasmaMapa[]>({
    queryKey: ['germoplasma-mapa'],
    queryFn: async () => {
      const [germoplasmas, respuestaUbicaciones] = await Promise.all([
        GET<Germoplasma[]>('/agro/germoplasma'),
        GET<RespuestaUbicaciones>('/ubicaciones'),
      ]);

      const ubicaciones = respuestaUbicaciones.results;

      const ubicacionesPorId = new Map(
        ubicaciones.map((ubicacion) => [
          ubicacion.id,
          ubicacion,
        ]),
      );

      return germoplasmas.map((germoplasma) => ({
        ...germoplasma,
        ubicacion: germoplasma.ubicacion_id
          ? ubicacionesPorId.get(germoplasma.ubicacion_id) ?? null
          : null,
      }));
    },
  });
}
