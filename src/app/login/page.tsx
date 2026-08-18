'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getToken, getUsuario } from '@/lib/auth'
import { ROL_HOME } from '@/types'
import styles from './login.module.css'
import CornLogo from '@/components/login/CornLogo'
import LoginCard from '@/components/login/LoginCard'
import Logo from '@/components/login/Logo'
import Footer from '@/components/login/Footer'
import LoginTransition from '@/components/login/LoginTransition'
import FloatingHomeButton from '@/components/login/FloatingHomeButton'

export default function LoginPage() {
  const { addToast } = useAuth()
  const router = useRouter()

  const [mounted] = useState(true)
  const [tab, setTab] = useState<'login' | 'registro'>('login')
  const [showLoginTransition, setShowLoginTransition] = useState<'none' | 'login' | 'logout'>('none')

  const handleLoginStart = () => {
    setShowLoginTransition('login')
    console.log('Login iniciado, mostrando transición...')
  }

  useEffect(() => {
    const usuarioActual = getUsuario()
    if (getToken() && usuarioActual) {
      const destino = ROL_HOME[usuarioActual.rol] ?? '/dashboard'
      router.replace(destino)
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', destino)
      }
    }

    const params = new URLSearchParams(window.location.search)
    if (params.get('expired') === '1') {
      addToast('Tu sesión expiró, vuelve a iniciar sesión.', 'err')
    }
  }, [addToast, router])

  return (
    <>
      <div
        className={styles['login-root']}
        data-login
      >
        <div className={styles['bg-deco']} />
        <CornLogo />
        <div className={styles['card-wrap']}>
          <Logo />
          <LoginTransition 
            type={showLoginTransition} 
          />
          <LoginCard 
            tab={tab} 
            setTab={setTab}
            onLoginStart={handleLoginStart} 
          />
          <FloatingHomeButton 
            mounted={mounted}
          />
        </div>
      </div>
      <Footer />
    </>
  )
}
