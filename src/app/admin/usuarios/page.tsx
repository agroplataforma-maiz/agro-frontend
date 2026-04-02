"use client";

import AdminShell from '@/components/dashboard/AdminShell';
import UsuariosPanel from '@/components/usuarios/UsuariosPanel';
import AccessGuardScreen from '@/components/ui/AccessGuardScreen'
import { useRolGuard } from '@/hooks/useRolGuard';

export default function UsuariosPage() {
  const accesoPermitido = useRolGuard(['administrador'])
  if (!accesoPermitido) return <AccessGuardScreen message="Verificando permisos..." />

  return (
    <AdminShell>
      <UsuariosPanel />
    </AdminShell>
  );
}
