import Link from 'next/link'
import styles from './FloatingHomeButton.module.css'

type Props = {
  mounted: boolean
  href?: string
  label?: string
  icon?: string
}

export default function FloatingHomeButton({
  mounted,
  href = '/',
  label = 'Ir a la plataforma',
  icon = '🏠'
}: Props) {
  if (!mounted) return null

  return (
    <div className={styles['flotante-wrap']}>
      <Link href={href} className={styles['btn-flotante']}>
        <span aria-hidden="true" className={styles['icon']}>
          {icon}
        </span>
        {label}
      </Link>
    </div>
  )
}