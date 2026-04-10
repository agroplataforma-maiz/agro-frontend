import { useQuery } from "@tanstack/react-query";
import { GET } from "@/lib/api";
import type { Usuario } from "@/types";

function isUsuarioResults(obj: unknown): obj is { results: Usuario[] } {
  return !!obj && typeof obj === 'object' && Array.isArray((obj as { results?: unknown }).results);
}

export function useUsuariosTecnicos() {
  // Solo usuarios con rol tecnico_campo
  const { data, isLoading, error } = useQuery({
    queryKey: ["usuarios-tecnicos-campo"],
    queryFn: () => GET("/auth/usuarios?rol=tecnico_campo"),
    staleTime: 60 * 60 * 1000,
  });
  let tecnicos: Usuario[] = [];
  if (Array.isArray(data)) {
    tecnicos = data;
  } else if (isUsuarioResults(data)) {
    tecnicos = data.results;
  }
  // Forzar id y nombre como string para el select
  const tecnicosSelect = tecnicos.map(u => ({
    ...u,
    id: String(u.id),
    nombre_completo: u.nombre_completo || u.username || `#${u.id}`
  }));
  return { tecnicos: tecnicosSelect, isLoading, error };
}
