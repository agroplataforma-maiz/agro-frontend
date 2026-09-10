// src/app/investigadores/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DEL } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'
import { useCatalogos } from '@/hooks/useCatalogos'

import ModalInvestigador from '@/components/investigadores/ModalInvestigador'
import PerfilInvestigador from '@/components/investigadores/PerfilInvestigador'
import UsuariosVisualizadoresPanel from '@/components/productores/UsuariosVisualizadoresPanel'
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
  // ── Hooks y stores al inicio ──
  const router = useRouter()
  const accesoPermitido = useRolGuard([
    'administrador'
  ])

  useCatalogos(accesoPermitido)

  const usuario = useAppStore(s => s.usuario)
  const addToast = useAppStore(s => s.addToast)
  const qc = useQueryClient()

  // Redirección automática si no hay usuario
  useEffect(() => {
    if (usuario === null) {
      router.replace('/login')
    }
  }, [usuario, router])

  const [vista, setVista] = useState<Vista>('lista')
  const [investigadorId, setInvestigadorId] = useState<string | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Investigador | null>(null)
  const [confirmEliminar, setConfirmEliminar] = useState<Investigador | null>(null)

  // ── Eliminación de investigadores ────────────────────────────────────────────
  // TODO BACKEND:
  // Implementar DELETE /investigadores/{id} antes de habilitar esta operación.
  const eliminar = useMutation({
    mutationFn: (id: string) => DEL(`/investigadores/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['investigadores'] })
      addToast('Investigador eliminado', 'ok')
    },
    onError: (e: Error) => addToast(e.message, 'err'),
  })

  // ── Returns condicionales después de los hooks ──
  if (!usuario) return null

  if (!accesoPermitido) {
    return <AccessGuardScreen message="Verificando permisos..." />
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

  // ── Vista perfil ──────────────────────────────────────────────────────────
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

  // ── Vista lista ───────────────────────────────────────────────────────────
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
          description={
            esAdmin
              ? 'Consulta, actualiza o depura investigadores existentes. Las altas iniciales están reservadas para administradores.'
              : 'Consulta, crea y administra investigadores vinculados al registro territorial y sociocultural de la plataforma.'
          }
          stats={[
            {
              label: 'visibles',
              value: '—',
            },
            {
              label: 'municipios',
              value: '—',
            },
          ]}
        />

        {/* ── Usuarios visualizadores ────────────────────────────────────────
            Solo visible para técnico de campo.
            El panel contiene su propia consulta, búsqueda y tabla.
            ───────────────────────────────────────────────────────────────── */}
        {usuario.rol === 'administrador' && (
          <UsuariosVisualizadoresPanel />
        )}

        {/* ── Investigadores ────────────────────────────────────────────────────
            El panel contiene la consulta pendiente, búsqueda y tabla.
            ───────────────────────────────────────────────────────────────── */}
        <InvestigadoresPanel
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

        {/* ── Confirmación de eliminación ────────────────────────────────── */}
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
                  onClick={() => {
                    eliminar.mutate(confirmEliminar.id)
                    setConfirmEliminar(null)
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
                {confirmEliminar.nombres}{' '}
                {confirmEliminar.apellido_paterno}{' '}
                {confirmEliminar.apellido_materno}
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