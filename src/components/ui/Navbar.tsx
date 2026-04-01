'use client'

// src/components/ui/Navbar.tsx
// Navbar pública — detecta sesión y muestra opciones según estado

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useAuth } from '@/hooks/useAuth'
import { iniciales } from '@/lib/auth'
import { ROL_COLOR } from '@/types'
import styles from './Navbar.module.css'

export default function Navbar() {
  const usuario    = useAppStore(s => s.usuario)
  const { logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      {/* Logo */}
      <Link href="/" className={styles.logo}>
        <span className={styles.logoIco}>🌽</span>
        <div>
          <div className={styles.logoTxt}>Agroplataforma</div>
          <span className={styles.logoSub}>Maíz Nativo · Huasteca Potosina</span>
        </div>
      </Link>

      {/* Links */}
      <div className={`${styles.links} ${menuOpen ? styles.linksOpen : ''}`}>
        <Link href="/#modulos"   className={styles.link} onClick={() => setMenuOpen(false)}>Módulos</Link>
        <Link href="/#avances"   className={styles.link} onClick={() => setMenuOpen(false)}>Avances</Link>
        <Link href="/#mapa"      className={styles.link} onClick={() => setMenuOpen(false)}>Cobertura</Link>
        <Link href="/productores" className={styles.link} onClick={() => setMenuOpen(false)}>Productores</Link>

        {usuario ? (
          // Usuario logueado
          <div className={styles.userGroup}>
            <div
              className={styles.avatar}
              style={{ background: ROL_COLOR[usuario.rol] ?? '#888' }}
            >
              {iniciales(usuario.nombre_completo || usuario.username)}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{(usuario.nombre_completo || usuario.username).split(' ')[0]}</span>
            </div>
            <Link href="/admin/dashboard" className={styles.btnAdmin}>Panel →</Link>
            <button className={styles.btnSalir} onClick={logout} title="Cerrar sesión">✕</button>
          </div>
        ) : (
          <Link href="/login" className={styles.btnLogin}>🔐 Iniciar sesión</Link>
        )}
      </div>

      {/* Hamburger */}
      <button
        className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}
        onClick={() => setMenuOpen(o => !o)}
        aria-label="Menú"
      >
        <span /><span /><span />
      </button>
    </nav>
  )
}