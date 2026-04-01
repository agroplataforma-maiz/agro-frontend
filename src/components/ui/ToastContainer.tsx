// src/components/ui/ToastContainer.tsx
// Reemplaza la función toast() que estaba duplicada en cada JS

'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import styles from './Toast.module.css'

export default function ToastContainer() {
  const toasts     = useAppStore(s => s.toasts)
  const removeToast = useAppStore(s => s.removeToast)

  return (
    <div className={styles.container} aria-live="polite">
      {toasts.map(t => (
        <ToastItem key={t.id} {...t} onDone={() => removeToast(t.id)} />
      ))}
    </div>
  )
}

function ToastItem({
  msg, tipo, onDone,
}: { msg: string; tipo: 'ok' | 'err' | 'warn'; onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 3500)
    return () => clearTimeout(timer)
  }, [onDone])

  const icon = tipo === 'ok' ? '✓' : tipo === 'err' ? '✗' : '⚠'

  return (
    <div className={`${styles.toast} ${styles[tipo]}`} role="alert">
      <span className={styles.icon}>{icon}</span>
      <span>{msg}</span>
    </div>
  )
}
