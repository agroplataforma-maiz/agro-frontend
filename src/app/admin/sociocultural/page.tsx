// Página de admin/sociocultural: CRUD completo solo para admin, sin afectar otros módulos
'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useRouter } from 'next/navigation'
import AdminShell from '@/components/dashboard/AdminShell'
import TablaSociocultural from '@/components/sociocultural/TablaSociocultural'
import PerfilSociocultural from '@/components/sociocultural/PerfilSociocultural'
import ModalSociocultural from '@/components/sociocultural/ModalSociocultural'
import ModuleHero from '@/components/ui/ModuleHero'

import type { RegistroSociocultural } from '@/hooks/useSociocultural'

export default function AdminSocioculturalPage() {
  const usuario = useAppStore(s => s.usuario)
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [socioEdit, setSocioEdit] = useState<RegistroSociocultural | null>(null)
  const [perfilId, setPerfilId] = useState<number | null>(null)
  // Ejemplo: sumar comunidades (ajustar según datos reales)
   const [registros, setRegistros] = useState<RegistroSociocultural[]>([])
   const comunidades = Array.from(new Set(registros.map(r => r.territorio.comunidad))).filter(Boolean)

  useEffect(() => {
    if (!usuario) {
      router.replace('/login')
    }
  }, [usuario, router])

  if (!usuario) {
    return null
  }

  return (
    <AdminShell contentPadding="32px 40px">
      <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        <ModuleHero
          eyebrow="Sociocultural · Gestión administrativa"
          title={<>Gestión <em>Sociocultural</em> 🎭</>}
          description="Consulta, edita o elimina registros socioculturales. Solo lectura y edición, sin altas desde este panel."
          stats={[ 
            { label: 'registros', value: registros.length || '—' },
            { label: 'comunidades', value: comunidades.length || '—' },
          ]}
        />
        <div style={{ marginTop: 32 }}>
           {perfilId !== null && registros[perfilId - 1] ? (
             <PerfilSociocultural
               registro={registros[perfilId - 1]}
               onVolver={() => setPerfilId(null)}
               onEdit={id => {
                 setSocioEdit(registros[id - 1] ?? null)
                 setModalOpen(true)
               }}
             />
           ) : (
             <TablaSociocultural
               registros={registros.map((r, idx) => ({ ...r, id: idx + 1 }))}
               onEdit={registro => setPerfilId(registro.id)}
               onDelete={id => setRegistros(prev => prev.filter((_, idx) => idx !== (id - 1)))}
               vacio="No hay datos socioculturales registrados"
             />
           )}
        </div>
      </div>
      {/* Modal solo para editar, nunca para crear */}
      {modalOpen && socioEdit && (
        <ModalSociocultural
          registro={socioEdit}
          onClose={() => {
            setModalOpen(false)
            setSocioEdit(null)
          }}
          onSaved={() => {
            setModalOpen(false)
            setSocioEdit(null)
            // Recargar registros si es necesario
          }}
        />
      )}
    </AdminShell>
  )
}
