"use client";

import AdminShell from '@/components/dashboard/AdminShell';
import UsuariosPanel from '@/components/usuarios/UsuariosPanel';
import { useRolGuard } from '@/hooks/useRolGuard';

export default function UsuariosPage() {
  useRolGuard(['administrador'])
  return (
    <AdminShell>
      <UsuariosPanel />
    </AdminShell>
  );
}
