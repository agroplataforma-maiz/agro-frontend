"use client";


import AdminShell from '@/components/dashboard/AdminShell';
import UsuariosPanel from '@/components/usuarios/UsuariosPanel';
import AccessGuardScreen from '@/components/ui/AccessGuardScreen';
import { useRolGuard } from '@/hooks/useRolGuard';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function UsuariosPage() {
  const accesoPermitido = useRolGuard(['administrador']);
  const usuario = useAppStore(s => s.usuario);
  const router = useRouter();

  // Si usuario es null (sesión cerrada), redirige y no muestra nada
  useEffect(() => {
    if (usuario === null) {
      router.replace('/');
    }
  }, [usuario, router]);

  if (usuario === null) return null;
  // Si el hook aún no sabe el estado, tampoco mostrar nada
  if (accesoPermitido === undefined) return null;
  if (!accesoPermitido) return <AccessGuardScreen message="Verificando permisos..." />;

  return (
    <AdminShell>
      <UsuariosPanel />
    </AdminShell>
  );
}
