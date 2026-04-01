// src/components/ui/Badge.tsx
// Badge/etiqueta reutilizable para roles, estados y categorías

import styles from './Badge.module.css'

type Color = 'verde' | 'maiz' | 'rojo' | 'azul' | 'gris' | 'tierra'

interface Props {
  children: React.ReactNode
  color?: Color
  className?: string
}

export default function Badge({ children, color = 'gris', className = '' }: Props) {
  return (
    <span className={[styles.badge, styles[color], className].join(' ')}>
      {children}
    </span>
  )
}