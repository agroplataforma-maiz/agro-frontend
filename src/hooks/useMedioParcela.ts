'use client';

import { useQuery } from '@tanstack/react-query';
import { GET } from '@/lib/api';

export interface MedioParcela {
  parcela_id: string;
  ubicacion_id: string;

  ubicacion: {
    latitud: number;
    longitud: number;
    altitud_m: number | null;
    precision_gps: number | null;
  };

  tipo_medio: string;
  subtipo: string | null;

  nombre_archivo: string | null;
  nombre_guardado: string | null;

  bucket: string | null;
  object_key: string | null;

  formato: string | null;
  peso_kb: number | null;

  descripcion: string | null;

  uuid_envio: string | null;
  registrado_por: string | null;

  fecha_captura: string | null;
  creado_en: string | null;
  actualizado_en: string | null;

  id: string;
  url_temporal: string | null;
}

export function useMedioParcela() {
  return useQuery<MedioParcela[]>({
    queryKey: ['medios-parcela'],
    queryFn: () => GET('/medios-parcela') as Promise<MedioParcela[]>,
  });
}