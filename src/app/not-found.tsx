'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import AdminShell from '@/components/dashboard/AdminShell'
import styles from './not-found.module.css'

function NotFoundCard({ onDashboard, onBack }: { onDashboard: () => void; onBack: () => void }) {
  return (
    <div className={styles.card}>
      <p className={styles.kicker}>AgroPlataforma Maiz Nativo</p>
      <div className={styles.maiz} aria-hidden>🌽</div>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>Pagina no encontrada</h1>
      <p className={styles.desc}>
        La ruta solicitada no esta disponible en la plataforma. Puedes volver al dashboard para continuar con tus modulos de trabajo.
      </p>
      <div className={styles.actions}>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onDashboard}>
          Ir al dashboard
        </button>
        <button className={`${styles.btn} ${styles.btnGhost}`} onClick={onBack}>
          Volver atras
        </button>
      </div>
    </div>
  )
}

export default function NotFound() {
  const router = useRouter()
  const usuario = useAppStore(s => s.usuario)

  const goDashboard = () => router.push('/dashboard')
  const goBack = () => router.back()

  if (!usuario) {
    return (
      <div className={styles.simpleWrap}>
        <NotFoundCard onDashboard={goDashboard} onBack={goBack} />
      </div>
    )
  }

  return (
    <AdminShell contentPadding="0">
      <div className={styles.wrap}>
        <NotFoundCard onDashboard={goDashboard} onBack={goBack} />
      </div>
    </AdminShell>
  )
}
