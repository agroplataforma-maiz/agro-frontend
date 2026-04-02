'use client'

import styles from './AccessGuardScreen.module.css'

interface AccessGuardScreenProps {
  message?: string
}

export default function AccessGuardScreen({
  message = 'Validando acceso...'
}: AccessGuardScreenProps) {
  return (
    <div className={styles.overlay} aria-live="polite" role="status">
      <div className={styles.icon} aria-hidden>🌽</div>
      <div className={styles.label}>{message}</div>
    </div>
  )
}
