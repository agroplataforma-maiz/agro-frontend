'use client'

import { useRouter } from 'next/navigation'
import styles from './not-found.module.css'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className={styles.simpleWrap}>
      <div className={styles.card}>
        <p className={styles.kicker}>Agroplataforma Maíz</p>
        <div className={styles.maiz}>🌽</div>
        <h1 className={styles.code}>404</h1>
        <h2 className={styles.title}>Página no encontrada</h2>
        <p className={styles.desc}>
          La página que buscas no existe o fue movida.
          Verifica la URL o regresa al inicio.
        </p>
        <div className={styles.actions}>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() => router.push('/')}
          >
            Ir al inicio
          </button>
          <button
            className={`${styles.btn} ${styles.btnGhost}`}
            onClick={() => router.back()}
          >
            Volver atrás
          </button>
        </div>
      </div>
    </div>
  )
}
