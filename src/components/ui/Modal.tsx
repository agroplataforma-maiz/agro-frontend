// src/components/ui/Modal.tsx
// Modal genérico reutilizable — reemplaza los patrones de modal
// duplicados en catalogos.js, productores.js, dashboard.js
 
'use client'
 
import { useEffect, useRef } from 'react'
import styles from './Modal.module.css'
 
interface Props {
  titulo: string
  onClose: () => void
  children: React.ReactNode
  ancho?: 'sm' | 'md' | 'lg'
  footer?: React.ReactNode
}
 
export default function Modal({ titulo, onClose, children, ancho = 'md', footer, open }: Props & { open?: boolean }) {
  const overlayRef = useRef<HTMLDivElement>(null)

  // Bloquear scroll del body solo cuando el modal está abierto
  useEffect(() => {
    if (open === false) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Cerrar con Escape
  useEffect(() => {
    if (open === false) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => {
      document.removeEventListener('keydown', handler)
    }
  }, [open, onClose])

  if (open === false) return null

  function handleOverlay(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose()
  }

  return (
    <div className={styles.overlay} ref={overlayRef} onClick={handleOverlay}>
      <div className={`${styles.modal} ${styles[ancho]}`} role="dialog" aria-modal aria-labelledby="modal-titulo">
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.titulo} id="modal-titulo">{titulo}</h2>
          <button className={styles.btnCerrar} onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {/* Cuerpo */}
        <div className={styles.body}>{children}</div>

        {/* Footer opcional */}
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  )
}