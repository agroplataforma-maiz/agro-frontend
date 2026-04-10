'use client'


import { useRouter } from 'next/navigation'
import AdminShell from '@/components/dashboard/AdminShell'
import styles from './not-found.module.css'

export default function NotFound() {
  const router = useRouter()

  return (
    <AdminShell contentPadding="0" breadcrumb="Página no encontrada" defaultSidebarCollapsed={false} forceShowShell={true}>
      <div
        className={styles.simpleWrap}
        style={{
          minHeight: 'calc(100vh - 64px)',
          background: 'var(--crema)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s',
        }}
      >
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
    </AdminShell>
  )
}
