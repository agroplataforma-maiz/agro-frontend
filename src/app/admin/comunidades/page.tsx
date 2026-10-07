// Página de admin/comunidades: CRUD completo solo para admin, sin afectar otros módulos
'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useRouter } from 'next/navigation'
import ModalComunidad from '@/components/comunidades/ModalComunidad'
import AdminShell from '@/components/dashboard/AdminShell'
import TablaComunidades from '@/components/comunidades/TablaComunidades'
import PerfilComunidad from '@/components/comunidades/PerfilComunidad'
import ModuleHero from '@/components/ui/ModuleHero'
import type { Comunidad } from '@/types'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { GET } from '@/lib/api'

export default function AdminComunidadesPage() {
  const usuario = useAppStore(s => s.usuario)
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [comunidadEdit, setComunidadEdit] = useState<Comunidad | null>(null)
  const [perfilId, setPerfilId] = useState<string | null>(null)
  // Simulación de datos para KPIs
  //const [comunidades, setComunidades] = useState<Comunidad[]>([])
  const {
    data: comunidades = [],
    isLoading: comunidadesLoading,
  } = useQuery<Comunidad[]>({
    queryKey: ['comunidades'],
    queryFn: async () => {
      const data = await GET<
        Comunidad[] | { results?: Comunidad[]; items?: Comunidad[] }
      >('/core/comunidades')

      if (Array.isArray(data)) return data

      return data.results ?? data.items ?? []
    },
  })
  const queryClient = useQueryClient()
  const comunidadesTabla = comunidades.map(c => ({
    id: c.id,
    nombre: c.nombre,
    municipio_nombre: c.municipio_nombre,
    localidad_nombre: '',
    lengua_indigena: c.nombre_lengua_orig,
    poblacion: c.poblacion_total,
    num_productores: undefined,
  }))
  const productoresVinculados = 0
  // const productoresVinculados = comunidades.reduce((acc, c) => acc + (c.num_productores || 0), 0)
  const municipios = Array.from(new Set(comunidades.map(c => c.municipio_nombre))).filter(Boolean)

  useEffect(() => {
    if (!usuario) {
      router.replace('/login')
    }
  }, [usuario, router])
  if (!usuario) return null

  return (
    <AdminShell contentPadding="32px 40px">
      <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        <ModuleHero
          eyebrow="Comunidades · Gestión administrativa"
          title={<>Gestión de <em>Comunidades</em> 🏘️</>}
          description="Consulta, edita o elimina comunidades. Solo lectura y edición, sin altas desde este panel."
          stats={[
            { label: 'comunidades', value: comunidades.length || '—' },
            { label: 'productores vinculados', value: productoresVinculados || '—' },
            { label: 'municipios', value: municipios.length || '—' },
          ]}
        />
        <div style={{ marginTop: 32 }}>
          {perfilId ? (
            <PerfilComunidad
              id={perfilId}
              onVolver={() => setPerfilId(null)}
              onEdit={id => {
                setComunidadEdit(comunidades.find(c => c.id === id) ?? null)
                setModalOpen(true)
              }}
            />
          ) : (
            <TablaComunidades
              comunidades={comunidadesTabla}
              onEdit={comunidad => setPerfilId(comunidad.id)}
              onDelete={id => {
                queryClient.invalidateQueries({
                  queryKey: ['comunidades'],
                })
              }}
            />
          )}
        </div>
      </div>
      {/* Modal solo para editar, nunca para crear */}
      {modalOpen && comunidadEdit && (
        <ModalComunidad
          comunidad={comunidadEdit}
          onClose={() => {
            setModalOpen(false)
            setComunidadEdit(null)
          }}
          onSaved={() => {
            setModalOpen(false)
            setComunidadEdit(null)
            queryClient.invalidateQueries({
              queryKey: ['comunidades'],
            })
          }}
        />
      )}
    </AdminShell>
  )
}
