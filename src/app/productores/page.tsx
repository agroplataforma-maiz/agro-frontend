// src/app/productores/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DEL } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'
import { useCatalogos } from '@/hooks/useCatalogos'

import ModalProductor from '@/components/productores/ModalProductor'
import PerfilProductor from '@/components/productores/PerfilProductor'
import UsuariosVisualizadoresPanel from '@/components/productores/UsuariosVisualizadoresPanel'
import ProductoresPanel from '@/components/productores/ProductoresPanel'
import TecnicoProductorPanel from '@/components/productores/TecnicoProductorPanel'

import type { Productor } from '@/types'
import styles from './productores.module.css'
import AdminShell from '@/components/dashboard/AdminShell'
import Button from '@/components/ui/Button'
import ModuleHero from '@/components/ui/ModuleHero'
import Modal from '@/components/ui/Modal'
import AccessGuardScreen from '@/components/ui/AccessGuardScreen'
import { useRolGuard } from '@/hooks/useRolGuard'

import { useRouter } from 'next/navigation'

type Vista = 'lista' | 'perfil'

export default function ProductoresPage() {
  // ── Hooks y stores al inicio ──
  const router = useRouter()
  const accesoPermitido = useRolGuard([
    'administrador',
    'investigador',
    'tecnico_campo',
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
  const [productorId, setProductorId] = useState<string | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Productor | null>(null)
  const [confirmEliminar, setConfirmEliminar] = useState<Productor | null>(null)

  // ── Eliminación de productores ────────────────────────────────────────────
  // TODO BACKEND:
  // Implementar DELETE /productores/{id} antes de habilitar esta operación.
  const eliminar = useMutation({
    mutationFn: (id: string) => DEL(`/productores/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['productores'] })
      addToast('Productor eliminado', 'ok')
    },
    onError: (e: Error) => addToast(e.message, 'err'),
  })

  // ── Returns condicionales después de los hooks ──
  if (!usuario) return null

  if (!accesoPermitido) {
    return <AccessGuardScreen message="Verificando permisos..." />
  }

  const esAdmin = usuario.rol === 'administrador'
  const puedeCrear =
    usuario.rol === 'administrador' ||
    usuario.rol === 'investigador' ||
    usuario.rol === 'tecnico_campo'

  function abrirEdicion(productor: Productor) {
    setEditando(productor)
    setModalAbierto(true)
  }

  function confirmarEliminar(productor: Productor) {
    setConfirmEliminar(productor)
  }

  function verPerfil(id: string) {
    setProductorId(id)
    setVista('perfil')
  }

  // ── Vista perfil ──────────────────────────────────────────────────────────
  if (vista === 'perfil' && productorId) {
    return (
      <AdminShell contentPadding="24px 24px 32px">
        <PerfilProductor
          id={productorId}
          onVolver={() => {
            setVista('lista')
            setProductorId(null)
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
          eyebrow="Social · Módulo de productores"
          title={
            <>
              Gestión de <em>Productores</em> 🌽
            </>
          }
          description="Consulta, crea y administra productores vinculados al registro territorial y sociocultural de la plataforma."
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
            El panel contiene su propia consulta, búsqueda y tabla.
            ───────────────────────────────────────────────────────────────── */}
        {usuario.rol === 'tecnico_campo' || usuario.rol === 'administrador' || usuario.rol === 'investigador' ? (
          <UsuariosVisualizadoresPanel />
        ) : null}

        <br />

        {/* ── Productores ────────────────────────────────────────────────────
            El panel contiene la consulta pendiente, búsqueda y tabla.
            ───────────────────────────────────────────────────────────────── */}

        <p className={styles.nota}>
            Este campo es opcional. Puedes indicar el motivo de la asignación,
            actividades de seguimiento u otra información relevante.
          </p> 

        <ProductoresPanel
          puedeCrear={puedeCrear}
          onNuevo={() => {
            setEditando(null)
            setModalAbierto(true)
          }}
          onEditar={abrirEdicion}
          onEliminar={confirmarEliminar}
          onVerPerfil={verPerfil}
        />

        <br />

        <TecnicoProductorPanel />

        {/* ── Modal de productor ─────────────────────────────────────────── */}
        {modalAbierto && (puedeCrear || Boolean(editando)) && (
          <ModalProductor
            productor={editando}
            onClose={() => setModalAbierto(false)}
            onSaved={() => {
              setModalAbierto(false)

              qc.invalidateQueries({
                queryKey: ['productores'],
              })

              addToast(
                editando
                  ? 'Productor actualizado'
                  : 'Productor creado',
                'ok'
              )
            }}
          />
        )}

        {/* ── Confirmación de eliminación ────────────────────────────────── */}
        {confirmEliminar && (
          <Modal
            titulo="Eliminar productor"
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