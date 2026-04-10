// Página de admin/fenotipo: CRUD completo solo para admin, sin afectar otros módulos
'use client'

import { useState } from 'react'
// import { useAppStore } from '@/store/useAppStore'
import AdminShell from '@/components/dashboard/AdminShell'
import TablaFenotipo from '@/components/fenotipo/TablaFenotipo'
import PerfilFenotipo from '@/components/fenotipo/PerfilFenotipo'
import ModalFenotipo from '@/components/fenotipo/ModalFenotipo'
import ModuleHero from '@/components/ui/ModuleHero'
// import Button from '@/components/ui/Button'

// Definición local del tipo Fenotipo (ajustar según datos reales)
type Fenotipo = {
  id: number
  nombre: string
  comunidad_nombre?: string
  num_productores?: number
}

export default function AdminFenotipoPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [fenotipoEdit, setFenotipoEdit] = useState<Fenotipo | null>(null)
  const [perfilId, setPerfilId] = useState<number | null>(null)
  // Simulación de datos para KPIs
  const [fenotipos, setFenotipos] = useState<Fenotipo[]>([])
  // Ejemplo: sumar productores vinculados y comunidades (ajustar según datos reales)
  const productoresVinculados = fenotipos.reduce((acc, f) => acc + (f.num_productores || 0), 0)
  const comunidades = Array.from(new Set(fenotipos.map(f => f.comunidad_nombre))).filter(Boolean)

  return (
    <AdminShell contentPadding="32px 40px">
      <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        <ModuleHero
          eyebrow="Fenotipo · Gestión administrativa"
          title={<>Gestión de <em>Fenotipos</em> 🔬</>}
          description="Consulta, edita o elimina registros fenotípicos. Solo lectura y edición, sin altas desde este panel."
          stats={[
            { label: 'fenotipos', value: fenotipos.length || '—' },
            { label: 'productores vinculados', value: productoresVinculados || '—' },
            { label: 'comunidades', value: comunidades.length || '—' },
          ]}
        />
        <div style={{ marginTop: 32 }}>
          {perfilId ? (
            <PerfilFenotipo
              onVolver={() => setPerfilId(null)}
              onEdit={id => {
                setFenotipoEdit(fenotipos.find(f => f.id === id) ?? null)
                setModalOpen(true)
              }}
            />
          ) : (
            <TablaFenotipo
              fenotipos={fenotipos}
              onEdit={fenotipo => setPerfilId(fenotipo.id)}
              onDelete={id => setFenotipos(prev => prev.filter(f => f.id !== id))}
              vacio="No hay datos fenotípicos registrados"
            />
          )}
        </div>
      </div>
      {/* Modal solo para editar, nunca para crear */}
      {modalOpen && fenotipoEdit && (
        <ModalFenotipo
          fenotipo={fenotipoEdit}
          onClose={() => {
            setModalOpen(false)
            setFenotipoEdit(null)
          }}
          onSaved={() => {
            setModalOpen(false)
            setFenotipoEdit(null)
            // Recargar fenotipos si es necesario
          }}
        />
      )}
    </AdminShell>
  )
}
