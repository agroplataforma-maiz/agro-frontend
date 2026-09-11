// src/app/investigadores/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DEL, GET } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'
import { useCatalogos } from '@/hooks/useCatalogos'

import ModalInvestigador from '@/components/investigadores/ModalInvestigador'
import PerfilInvestigador from '@/components/investigadores/PerfilInvestigador'
import UsuariosVisualizadoresPanel from '@/components/investigadores/UsuariosVisualizadoresPanel'
import InvestigadoresPanel from '@/components/investigadores/InvestigadoresPanel'

import type { Investigador } from '@/types'
import styles from './investigadores.module.css'
import AdminShell from '@/components/dashboard/AdminShell'
import Button from '@/components/ui/Button'
import ModuleHero from '@/components/ui/ModuleHero'
import Modal from '@/components/ui/Modal'
import AccessGuardScreen from '@/components/ui/AccessGuardScreen'
import { useRolGuard } from '@/hooks/useRolGuard'

import { useRouter } from 'next/navigation'

type Vista = 'lista' | 'perfil'

export default function InvestigadoresPage() {
  const router = useRouter()

  const accesoPermitido = useRolGuard([
    'administrador',
  ])

  useCatalogos(accesoPermitido)

  const usuario = useAppStore(s => s.usuario)
  const addToast = useAppStore(s => s.addToast)
  const qc = useQueryClient()

  useEffect(() => {
    if (usuario === null) {
      router.replace('/login')
    }
  }, [usuario, router])

  const [vista, setVista] = useState<Vista>('lista')
  const [investigadorId, setInvestigadorId] = useState<string | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Investigador | null>(null)
  const [confirmEliminar, setConfirmEliminar] =
    useState<Investigador | null>(null)

  // ── Investigadores ───────────────────────────────────────────────────────────
  const {
    data: investigadores = [],
    isLoading: investigadoresLoading,
  } = useQuery<Investigador[]>({
    queryKey: ['investigadores'],
    queryFn: () => GET('/social/investigadores'),
  })

  // ── Eliminación de investigadores ────────────────────────────────────────────
  const eliminar = useMutation({
    mutationFn: (id: string) =>
      DEL(`/social/investigadores/${id}`),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ['investigadores'],
      })

      addToast(
        'Investigador eliminado',
        'ok'
      )
    },

    onError: (e: Error) => {
      addToast(
        e.message || 'Error al eliminar el investigador',
        'err'
      )
    },
  })

  if (!usuario) return null

  if (!accesoPermitido) {
    return (
      <AccessGuardScreen message="Verificando permisos..." />
    )
  }

  const esAdmin = usuario.rol === 'administrador'
  const puedeCrear = esAdmin

  function abrirEdicion(investigador: Investigador) {
    setEditando(investigador)
    setModalAbierto(true)
  }

  function confirmarEliminar(investigador: Investigador) {
    setConfirmEliminar(investigador)
  }

  function verPerfil(id: string) {
    setInvestigadorId(id)
    setVista('perfil')
  }

  if (vista === 'perfil' && investigadorId) {
    return (
      <AdminShell contentPadding="24px 24px 32px">
        <PerfilInvestigador
          id={investigadorId}
          onVolver={() => {
            setVista('lista')
            setInvestigadorId(null)
          }}
        />
      </AdminShell>
    )
  }

  return (
    <AdminShell contentPadding="0">
      <div className={styles.page}>

        <ModuleHero
          eyebrow="Social · Módulo de investigadores"
          title={
            <>
              Gestión de <em>Investigadores</em> 🧑‍🔬
            </>
          }
          description="Consulta, crea, actualiza o elimina investigadores registrados en la plataforma."
          stats={[
            {
              label: 'visibles',
              value: investigadores.length.toString(),
            },
            {
              label: 'municipios',
              value: '—',
            },
          ]}
        />

        {usuario.rol === 'administrador' && (
          <UsuariosVisualizadoresPanel />
        )}

        <InvestigadoresPanel
          investigadores={investigadores}
          cargando={investigadoresLoading}
          puedeCrear={puedeCrear}
          onNuevo={() => {
            setEditando(null)
            setModalAbierto(true)
          }}
          onEditar={abrirEdicion}
          onEliminar={confirmarEliminar}
          onVerPerfil={verPerfil}
        />

        {/* ── Modal de investigador ─────────────────────────────────────────── */}
        {modalAbierto && (puedeCrear || Boolean(editando)) && (
          <ModalInvestigador
            investigador={editando}
            onClose={() => setModalAbierto(false)}
            onSaved={() => {
              setModalAbierto(false)

              qc.invalidateQueries({
                queryKey: ['investigadores'],
              })

              addToast(
                editando
                  ? 'Investigador actualizado'
                  : 'Investigador creado',
                'ok'
              )
            }}
          />
        )}

        {/* ── Confirmación de eliminación ───────────────────────────────────── */}
        {confirmEliminar && (
          <Modal
            titulo="Eliminar investigador"
            ancho="sm"
            onClose={() => setConfirmEliminar(null)}
            footer={
              <>
                <Button
                  variante="ghost"
                  onClick={() => setConfirmEliminar(null)}
                >
                  Cancelar
                </Button>

                <Button
                  variante="peligro"
                  cargando={eliminar.isPending}
                  onClick={() => {
                    eliminar.mutate(confirmEliminar.id, {
                      onSettled: () => {
                        setConfirmEliminar(null)
                      },
                    })
                  }}
                >
                  Eliminar
                </Button>
              </>
            }
          >
            <p>
              ¿Eliminar a{' '}
              <strong>
                {confirmEliminar.nombre_completo}
              </strong>
              ?
            </p>

            <p
              style={{
                color: 'var(--rojo)',
                fontSize: '0.875rem',
              }}
            >
              Esta acción no se puede deshacer.
            </p>
          </Modal>
        )}
      </div>
    </AdminShell>
  )
}