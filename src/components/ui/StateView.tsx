'use client'

import styles from './StateView.module.css'

type StateVariant = 'loading' | 'empty' | 'error'

interface Props {
  variant: StateVariant
  message: string
  title?: string
  size?: 'md' | 'sm'
}

const DEFAULT_TITLE: Record<StateVariant, string> = {
  loading: 'Cargando datos',
  empty: 'Sin registros',
  error: 'Ocurrió un problema',
}

export default function StateView({
  variant,
  message,
  title,
  size = 'md',
}: Props) {
  return (
    <div className={`${styles.state} ${styles[variant]} ${size === 'sm' ? styles.sm : ''}`} role="status" aria-live="polite">
      <div className={styles.iconWrap}>
        <span className={`${styles.maiz} ${variant === 'loading' ? styles.spinner : ''}`}>
          {variant === 'error' ? '⚠️' : '🌽'}
        </span>
      </div>
      <span className={styles.title}>{title ?? DEFAULT_TITLE[variant]}</span>
      <span className={styles.text}>{message}</span>
    </div>
  )
}