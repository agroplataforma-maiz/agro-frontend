import { useEffect } from 'react'
import styles from './LoginTransition.module.css'

type Props = {
  type: 'login' | 'logout' | 'none'
  duration?: number
  onFinish?: () => void
}

export default function LoginTransition({ 
  type,
  duration = 1200,
  onFinish
 }: Props) {

  useEffect(() => {
    if (type === 'none') return
    const t = setTimeout(() => {
      onFinish?.()
    }, duration)
    return () => clearTimeout(t)
  }, [type, duration, onFinish])

  if (type === 'none') return null

  const text = {
    login: 'Iniciando sesión...',
    logout: 'Cerrando sesión...'
  }[type]

  return (
    <div className={styles.overlay}>
      <span className={styles.spinner}>🌽</span>
      <div className={styles.text}>{text}</div>
    </div>
  )
}