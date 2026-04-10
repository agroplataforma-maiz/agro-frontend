// src/hooks/useRolGuard.ts
// Hook cliente para proteger páginas según el rol del usuario.
// Redirige a /sin-acceso si el rol no está en la lista permitida.
// El middleware hace la verificación server-side: este hook cubre el caso
// donde el store aún no estaba hidratado cuando el middleware corrió.

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import type { Rol } from '@/types'

/**
 * Uso:
 *   useRolGuard(['administrador', 'investigador'])
 *
 * Si el usuario en sesión no tiene uno de los roles indicados,
 * redirige a /sin-acceso.
 */
export function useRolGuard(rolesPermitidos: Rol[]) {
  const router  = useRouter();
  const usuario = useAppStore(s => s.usuario);
  // Si usuario es null, aún no se sabe el estado de sesión, devolvemos false
  const permitido = !!usuario && rolesPermitidos.includes(usuario.rol);

  useEffect(() => {
    if (usuario && !permitido) {
      router.replace('/sin-acceso');
    }
  }, [usuario, permitido, router]);

  return permitido;
}
