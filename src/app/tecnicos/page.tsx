// src/app/investigadores/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DEL } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'
import { useCatalogos } from '@/hooks/useCatalogos'

import ModalTecnico from '@/components/tecnicos/ModalTecnico'
import PerfilTecnico from '@/components/tecnicos/PerfilTecnico'
import UsuariosVisualizadoresPanel from '@/components/productores/UsuariosVisualizadoresPanel'
import TecnicosPanel from '@/components/tecnicos/TecnicosPanel'

import type { TecnicoCampo } from '@/types'
import styles from './tecnicos.module.css'
import AdminShell from '@/components/dashboard/AdminShell'
import Button from '@/components/ui/Button'
import ModuleHero from '@/components/ui/ModuleHero'
import Modal from '@/components/ui/Modal'
import AccessGuardScreen from '@/components/ui/AccessGuardScreen'
import { useRolGuard } from '@/hooks/useRolGuard'

import { useRouter } from 'next/navigation'

type Vista = 'lista' | 'perfil'

export default function TecnicosPage() {
  // ── Hooks y stores al inicio ──
  const router = useRouter()
  const accesoPermitido = useRolGuard([
    'administrador','investigador'
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
  const [tecnicoId, setTecnicoId] = useState<string | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<TecnicoCampo | null>(null)
  const [confirmEliminar, setConfirmEliminar] = useState<TecnicoCampo | null>(null)

  // ── Eliminación de técnicos ────────────────────────────────────────────
  // TODO BACKEND:
  // Implementar DELETE /tecnicos/{id} antes de habilitar esta operación.
  const eliminar = useMutation({
    mutationFn: (id: string) => DEL(`/tecnicos/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tecnicos'] })
      addToast('Técnico eliminado', 'ok')
    },
    onError: (e: Error) => addToast(e.message, 'err'),
  })

  // ── Returns condicionales después de los hooks ──
  if (!usuario) return null

  if (!accesoPermitido) {
    return <AccessGuardScreen message="Verificando permisos..." />
  }

  const esAdmin = usuario.rol === 'administrador'
  const puedeCrear = !esAdmin

  function abrirEdicion(tecnico: TecnicoCampo) {
    setEditando(tecnico)
    setModalAbierto(true)
  }

  function confirmarEliminar(tecnico: TecnicoCampo) {
    setConfirmEliminar(tecnico)
  }

  function verPerfil(id: string) {
    setTecnicoId(id)
    setVista('perfil')
  }

  // ── Vista perfil ──────────────────────────────────────────────────────────
  if (vista === 'perfil' && tecnicoId) {
    return (
      <AdminShell contentPadding="24px 24px 32px">
        <PerfilTecnico
          id={tecnicoId}
          onVolver={() => {
            setVista('lista')
            setTecnicoId(null)
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
          eyebrow="Social · Módulo de técnicos"
          title={
            <>
              Gestión de <em>Técnicos</em> 🌾
            </>
          }
          description={
            esAdmin
              ? 'Consulta, actualiza o depura técnicos existentes. Las altas iniciales están reservadas para administradores e investigadores.'
              : 'Consulta, crea y administra técnicos vinculados al registro territorial y sociocultural de la plataforma.'
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
        {usuario.rol === 'investigador' && (
          <UsuariosVisualizadoresPanel />
        )}

        {/* ── Técnicos ────────────────────────────────────────────────────
            El panel contiene la consulta pendiente, búsqueda y tabla.
            ───────────────────────────────────────────────────────────────── */}
        <TecnicosPanel
          puedeCrear={puedeCrear}
          onNuevo={() => {
            setEditando(null)
            setModalAbierto(true)
          }}
          onEditar={abrirEdicion}
          onEliminar={confirmarEliminar}
          onVerPerfil={verPerfil}
        />

        {/* ── Modal de técnico ─────────────────────────────────────────── */}
        {modalAbierto && (puedeCrear || Boolean(editando)) && (
          <ModalTecnico
            tecnico={editando}
            onClose={() => setModalAbierto(false)}
            onSaved={() => {
              setModalAbierto(false)

              qc.invalidateQueries({
                queryKey: ['tecnicos'],
              })

              addToast(
                editando
                  ? 'Técnico actualizado'
                  : 'Técnico creado',
                'ok'
              )
            }}
          />
        )}

        {/* ── Confirmación de eliminación ────────────────────────────────── */}
        {confirmEliminar && (
          <Modal
            titulo="Eliminar técnico"
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