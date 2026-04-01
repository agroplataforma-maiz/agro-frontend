'use client';
import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { GET } from '@/lib/api';
import styles from './Topbar.module.css';

// ── Tipos ──
interface Notificacion {
  id: number;
  texto: string;
  time: string;
  leida: boolean;
}

interface TopbarProps {
  user: {
    initials: string;
    name: string;
    color?: string;
  };
  /** Sobreescribe el breadcrumb automático */
  breadcrumb?: string;
  onNavigate: (page: string) => void;
  onSidebarToggle?: () => void;
  onLogout?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const SEARCH_ITEMS = [
  { label: 'Dashboard',    page: '/dashboard',         icon: '🏠' },
  { label: 'Productores',  page: '/productores',        icon: '🧑‍🌾' },
  { label: 'Comunidades',  page: '/comunidades',        icon: '🏘️' },
  { label: 'Sociocultural',page: '/sociocultural',      icon: '🎭' },
  { label: 'Fenotípico',   page: '/fenotipo',           icon: '🔬' },
  { label: 'Catálogos',    page: '/admin/catalogos',    icon: '📋' },
  { label: 'Usuarios',     page: '/admin/usuarios',     icon: '⚙️' },
  { label: 'Mi perfil',    page: '/mi-perfil',          icon: '👤' },
  { label: 'Ayuda',        page: '/ayuda',               icon: '❓' },
];

/** Etiquetas legibles por segmento de ruta */
const SEGMENT_LABELS: Record<string, string> = {
  dashboard:    'Dashboard',
  admin:        'Admin',
  productores:  'Productores',
  comunidades:  'Comunidades',
  sociocultural:'Sociocultural',
  fenotipo:     'Fenotípico',
  catalogos:    'Catálogos',
  usuarios:     'Usuarios',
  'mi-perfil':  'Mi perfil',
  'ayuda':       'Ayuda',
};

/** Construye array de migas desde el pathname */
function buildCrumbs(pathname: string): string[] {
  const parts = pathname.split('/').filter(Boolean);
  return parts.map(seg =>
    // Si parece un ID numérico o UUID → "Detalle"
    /^\d+$/.test(seg) || /^[0-9a-f-]{36}$/i.test(seg)
      ? 'Detalle'
      : (SEGMENT_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1))
  );
}

/** Persiste la preferencia de tema en localStorage y alterna la clase 'dark' en <html> */
function useTheme() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('tema');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved ? saved === 'dark' : prefersDark;
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggle = () => {
    setDark(prev => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('tema', next ? 'dark' : 'light');
      return next;
    });
  };

  return { dark, toggle };
}

export const Topbar: React.FC<TopbarProps> = ({
  user, breadcrumb, onNavigate, onSidebarToggle, onLogout, className, children,
}) => {
  const pathname = usePathname();
  const crumbs = breadcrumb
    ? [breadcrumb]
    : buildCrumbs(pathname).length > 0
      ? buildCrumbs(pathname)
      : ['Dashboard'];

  const { dark, toggle: toggleTema } = useTheme();

  const { data: notifs = [] } = useQuery<Notificacion[]>({
    queryKey: ['notificaciones'],
    queryFn: () => GET<Notificacion[]>('/social/notificaciones/'),
    refetchInterval: 60_000,   // refresca cada minuto
    staleTime:       30_000,
    retry: false,              // no reintentar si el endpoint aún no existe
  });

  const [query,      setQuery]      = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen,  setNotifOpen]  = useState(false);
  const [userOpen,   setUserOpen]   = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef  = useRef<HTMLDivElement>(null);
  const userRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (notifRef.current  && !notifRef.current.contains(e.target as Node))  setNotifOpen(false);
      if (userRef.current   && !userRef.current.contains(e.target as Node))   setUserOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const results  = query.length >= 2
    ? SEARCH_ITEMS.filter(i => i.label.toLowerCase().includes(query.toLowerCase()))
    : [];
  const noLeidas = notifs.filter(n => !n.leida).length;

  return (
    <header className={className ?? styles.topbar} role="banner">
      {/* Hamburger */}
      <button
        className={styles['topbar-hamburger']}
        aria-label="Abrir menú de navegación"
        aria-controls="sidebar"
        onClick={onSidebarToggle}
      >≡</button>

      {/* Breadcrumb dinámico multi-nivel */}
      <nav className={styles['topbar-breadcrumb']} aria-label="Ruta de navegación">
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>🌽 Agroplataforma</span>
        {crumbs.map((crumb, i) => (
          <React.Fragment key={i}>
            <span className="bc-sep" aria-hidden="true">›</span>
            {i === crumbs.length - 1
              ? <span className="bc-current"><b>{crumb}</b></span>
              : <span style={{ opacity: 0.6 }}>{crumb}</span>
            }
          </React.Fragment>
        ))}
      </nav>

      {/* Buscador con dropdown */}
      <div className={styles['topbar-search']} role="search" ref={searchRef}>
        <span className={styles['topbar-search-ico']} aria-hidden="true">🔍</span>
        <input
          type="search"
          placeholder="Buscar módulo o página..."
          aria-label="Buscar en la plataforma"
          id="busqueda-global"
          value={query}
          autoComplete="off"
          onChange={e => { setQuery(e.target.value); setSearchOpen(true); }}
          onFocus={() => setSearchOpen(true)}
        />
        {searchOpen && query.length >= 2 && (
          <div className={styles['search-dropdown']} role="listbox">
            {results.length > 0
              ? results.map(item => (
                  <button
                    key={item.page}
                    className={styles['search-result']}
                    role="option"
                    onClick={() => { onNavigate(item.page); setQuery(''); setSearchOpen(false); }}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))
              : <span className={styles['search-empty']}>Sin resultados para &ldquo;{query}&rdquo;</span>
            }
          </div>
        )}
      </div>

      {/* Logos institucionales */}
      <div className={styles['topbar-inst']} aria-label="Instituciones">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/LOGOTECNM.png" alt="TecNM"           height={32} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/secihti.png"   alt="Secihti"          height={26} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/logotec.png"   alt="IT Ciudad Valles" height={32} />
      </div>

      <div className={styles['topbar-actions']}>

        {/* Modo oscuro / claro */}
        <button
          className={styles['topbar-btn']}
          aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          title={dark ? 'Modo claro' : 'Modo oscuro'}
          onClick={toggleTema}
        >
          {dark ? '☀️' : '🌙'}
        </button>

        {/* Ayuda */}
        <button
          className={styles['topbar-btn']}
          aria-label="Ayuda y accesibilidad"
          title="Ayuda"
          onClick={() => { onNavigate('/ayuda'); setNotifOpen(false); setUserOpen(false); }}
        >
          ❓
        </button>

        {/* Campanita */}
        <div className={styles['topbar-dropdown-wrap']} ref={notifRef}>
          <button
            className={styles['topbar-btn']}
            aria-label={`Notificaciones${noLeidas > 0 ? ` (${noLeidas} nuevas)` : ''}`}
            aria-expanded={notifOpen}
            aria-haspopup="true"
            onClick={() => { setNotifOpen(o => !o); setUserOpen(false); }}
          >
            🔔
            {noLeidas > 0 && <span className={styles['notif-dot']} aria-hidden="true" />}
          </button>
          {notifOpen && (
            <div className={styles['dropdown-panel']} role="menu">
              <div className={styles['dropdown-header']}>
                <span>Notificaciones</span>
                {noLeidas > 0 && <span className={styles['notif-badge']}>{noLeidas} nuevas</span>}
              </div>
              {notifs.length === 0
                ? <div className={styles['notif-item']} style={{ color: 'var(--gris)', justifyContent: 'center', fontSize: 13 }}>Sin notificaciones nuevas</div>
                : notifs.map(n => (
                <div
                  key={n.id}
                  className={[styles['notif-item'], n.leida ? '' : styles['notif-unread']].filter(Boolean).join(' ')}
                  role="menuitem"
                >
                  <span className={styles['notif-dot-item']} />
                  <div>
                    <div className={styles['notif-texto']}>{n.texto}</div>
                    <div className={styles['notif-time']}>{n.time}</div>
                  </div>
                </div>
              ))}
              <div className={styles['dropdown-footer']}>
                <button onClick={() => setNotifOpen(false)}>Ver todas</button>
              </div>
            </div>
          )}
        </div>

        {/* Avatar / menú usuario */}
        <div className={styles['topbar-dropdown-wrap']} ref={userRef}>
          <button
            className={styles['topbar-perfil']}
            aria-label="Menú de usuario"
            aria-expanded={userOpen}
            aria-haspopup="true"
            onClick={() => { setUserOpen(o => !o); setNotifOpen(false); }}
          >
            <div
              className={styles['topbar-perfil-av']}
              aria-hidden="true"
              style={user.color ? { background: user.color } : undefined}
            >
              {user.initials}
            </div>
            <span className={styles['topbar-perfil-txt']}>{user.name}</span>
            <span className={styles['topbar-perfil-chevron']} aria-hidden="true">
              {userOpen ? '▲' : '▾'}
            </span>
          </button>
          {userOpen && (
            <div className={[styles['dropdown-panel'], styles['dropdown-right']].join(' ')} role="menu">
              <button
                className={styles['dropdown-item']}
                role="menuitem"
                onClick={() => { onNavigate('/mi-perfil'); setUserOpen(false); }}
              >
                <span>👤</span> Ver perfil
              </button>
              <div className={styles['dropdown-divider']} />
              <button
                className={[styles['dropdown-item'], styles['dropdown-danger']].join(' ')}
                role="menuitem"
                onClick={() => { setUserOpen(false); onLogout?.(); }}
              >
                <span>🚪</span> Cerrar sesión
              </button>
            </div>
          )}
        </div>

        {children}
      </div>
    </header>
  );
};
