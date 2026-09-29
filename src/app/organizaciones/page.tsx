"use client";

import AdminShell from '@/components/dashboard/AdminShell';
import OrganizacionesPanel from '@/components/organizaciones/OrganizacionesPanel';
import AccessGuardScreen from '@/components/ui/AccessGuardScreen';
import { useRolGuard } from '@/hooks/useRolGuard';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OrganizacionesPage() {
  const accesoPermitido = useRolGuard([
    'administrador',
    'investigador',
  ]);

  const usuario = useAppStore(s => s.usuario);
  const router = useRouter();

  useEffect(() => {
    if (usuario === null) {
      router.replace('/login');
    }
  }, [usuario, router]);

  if (usuario === null) return null;
  if (accesoPermitido === undefined) return null;

  if (!accesoPermitido) {
    return <AccessGuardScreen message="Verificando permisos..." />;
  }

  return (
    <AdminShell>
      <OrganizacionesPanel />
    </AdminShell>
  );
}