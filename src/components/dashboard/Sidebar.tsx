import React from 'react';
import styles from './Sidebar.module.css';
import type { Rol } from '@/types';

interface SidebarNavItem {
  label: string;
  icon?: React.ReactNode;
  page: string;
  disabled?: boolean;
  badge?: string;
  ariaLabel?: string;
}

interface SidebarProps {
  user: {
    initials: string;
    name: string;
    role: string;
    color: string;
  };
  /** Rol real del usuario para filtrar el menú */
  rol?: Rol;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  onCollapseToggle?: () => void;
  collapsed?: boolean;
  className?: string;
}

import { usePathname } from 'next/navigation';

export const Sidebar: React.FC<SidebarProps> = ({ user, rol, onLogout, onNavigate, onCollapseToggle, collapsed, className }) => {
  const navClass = [className ? className : styles.sidebar, collapsed ? styles.collapsed : ''].filter(Boolean).join(' ');
  const pathname = usePathname();

  // Flags de permiso para mostrar/ocultar items del menú
  const puedeCapturar      = !rol || ['administrador', 'investigador', 'tecnico_campo'].includes(rol);
  const puedeVerCatalogos  = !rol || ['administrador', 'investigador'].includes(rol);
  const puedeVerUsuarios   = !rol || rol === 'administrador';
  const puedeVerPerfil     = !rol || rol !== 'invitado';

  return (
    <nav className={navClass} id="sidebar" role="navigation" aria-label="Menú principal" data-collapsed={collapsed}>
      {/* Logo */}
      <a className={styles['sb-logo']} href="/" aria-label="Inicio - Agroplataforma Maíz Nativo">
        <span className={styles['sb-logo-ico']} aria-hidden="true" style={{ fontSize: 22 }}>🌽</span>
        <div className={styles['sb-logo-txt']}>
          <div className={styles['sb-logo-nombre']}>Agroplataforma</div>
          <span className={styles['sb-logo-sub']}>Maíz Nativo · Huasteca</span>
        </div>
      </a>

      {/* Perfil */}
      <div className={styles['sb-perfil']} role="status" aria-label="Usuario activo">
        <div className={styles['sb-avatar']} aria-hidden="true" style={{ background: user.color }}>{user.initials}</div>
        <div className={styles['sb-perfil-info'] + ' ' + (collapsed ? styles['sb-hide'] : '')}>
          <div className={styles['sb-perfil-nombre']}>{user.name}</div>
          <div className={styles['sb-perfil-rol']}>{user.role}</div>
        </div>
      </div>
      {/* Botón de colapso siempre visible, fuera del perfil */}
      {onCollapseToggle && (
        <button
          className={styles['sb-collapse-btn']}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          onClick={onCollapseToggle}
          tabIndex={0}
          style={{ margin: '10px auto 10px auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
        {collapsed ? '›' : '‹'}
        </button>
      )}

      {/* Nav principal */}
      <div className={styles['sb-group-label']} aria-hidden="true">Principal</div>
      <button
        className={
          styles['sb-item'] +
          (pathname === '/dashboard' || pathname === '/admin/dashboard' ? ' ' + styles['active'] : '')
        }
        aria-current={pathname === '/dashboard' || pathname === '/admin/dashboard' ? 'page' : undefined}
        aria-label="Dashboard - Inicio"
        data-tooltip="Dashboard"
        onClick={() => onNavigate('/dashboard')}
      >
        <span className={styles['sb-item-ico']} aria-hidden="true">🏠</span>
        <span className={styles['sb-item-txt']}>Dashboard</span>
      </button>

      {puedeCapturar && <div className={styles['sb-group-label']} aria-hidden="true">Módulos activos</div>}
      {puedeCapturar && (
      <button
        className={
          styles['sb-item'] +
          (pathname.startsWith('/productores') ? ' ' + styles['active'] : '')
        }
        aria-current={pathname.startsWith('/productores') ? 'page' : undefined}
        aria-label="Módulo Productores"
        data-tooltip="Productores"
        onClick={() => onNavigate('/productores')}
      >
        <span className={styles['sb-item-ico']} aria-hidden="true">🧑‍🌾</span>
        <span className={styles['sb-item-txt']}>Productores</span>
        <span className={styles['sb-item-badge'] + ' ' + styles['badge-nuevo']} aria-label="Nuevo">Nuevo</span>
      </button>
      )}
      {puedeCapturar && (
      <button
        className={
          styles['sb-item'] +
          (pathname.startsWith('/comunidades') ? ' ' + styles['active'] : '')
        }
        aria-current={pathname.startsWith('/comunidades') ? 'page' : undefined}
        aria-label="Módulo Comunidades"
        data-tooltip="Comunidades"
        onClick={() => onNavigate('/comunidades')}
      >
        <span className={styles['sb-item-ico']} aria-hidden="true">🏘️</span>
        <span className={styles['sb-item-txt']}>Comunidades</span>
        <span className={styles['sb-item-badge'] + ' ' + styles['badge-nuevo']} aria-label="Nuevo">Nuevo</span>
      </button>
      )}
      {puedeCapturar && (
      <button
        className={
          styles['sb-item'] +
          (pathname.startsWith('/sociocultural') ? ' ' + styles['active'] : '')
        }
        aria-current={pathname.startsWith('/sociocultural') ? 'page' : undefined}
        aria-label="Módulo Sociocultural"
        data-tooltip="Sociocultural"
        onClick={() => onNavigate('/sociocultural')}
      >
        <span className={styles['sb-item-ico']} aria-hidden="true">🎭</span>
        <span className={styles['sb-item-txt']}>Sociocultural</span>
        <span className={styles['sb-item-badge'] + ' ' + styles['badge-beta']} aria-label="Beta">Beta</span>
      </button>
      )}
      {puedeCapturar && (
      <button
        className={
          styles['sb-item'] +
          (pathname.startsWith('/fenotipo') ? ' ' + styles['active'] : '')
        }
        aria-current={pathname.startsWith('/fenotipo') ? 'page' : undefined}
        aria-label="Módulo Fenotípico"
        data-tooltip="Fenotípico"
        onClick={() => onNavigate('/fenotipo')}
      >
        <span className={styles['sb-item-ico']} aria-hidden="true">🔬</span>
        <span className={styles['sb-item-txt']}>Fenotípico</span>
        <span className={styles['sb-item-badge'] + ' ' + styles['badge-beta']} aria-label="Beta">Beta</span>
      </button>
      )}

      {puedeCapturar && <div className={styles['sb-group-label']} aria-hidden="true">En construcción</div>}
      {puedeCapturar && (
      <>
      <button className={`${styles['sb-item']} ${styles['disabled']}`} aria-label="Módulo Mapas y SIG - próximamente" data-tooltip="Mapas y SIG" aria-disabled="true" tabIndex={-1} onClick={() => {}}>
        <span className={styles['sb-item-ico']} aria-hidden="true">🗺️</span>
        <span className={styles['sb-item-txt']}>Mapas y SIG</span>
        <span className={styles['sb-item-badge'] + ' ' + styles['badge-pronto']} aria-label="Próximamente">Pronto</span>
      </button>
      <button className={`${styles['sb-item']} ${styles['disabled']}`} aria-label="Módulo Agronómico - próximamente" data-tooltip="Agronómico" aria-disabled="true" tabIndex={-1} onClick={() => {}}>
        <span className={styles['sb-item-ico']} aria-hidden="true">🌱</span>
        <span className={styles['sb-item-txt']}>Agronómico</span>
        <span className={styles['sb-item-badge'] + ' ' + styles['badge-pronto']} aria-label="Próximamente">Pronto</span>
      </button>
      <button className={`${styles['sb-item']} ${styles['disabled']}`} aria-label="Módulo Ambiental - próximamente" data-tooltip="Ambiental" aria-disabled="true" tabIndex={-1} onClick={() => {}}>
        <span className={styles['sb-item-ico']} aria-hidden="true">🌧️</span>
        <span className={styles['sb-item-txt']}>Ambiental</span>
        <span className={styles['sb-item-badge'] + ' ' + styles['badge-pronto']} aria-label="Próximamente">Pronto</span>
      </button>
      </>
      )}

      {(puedeVerCatalogos || puedeVerUsuarios) && (
        <div className={styles['sb-group-label']} aria-hidden="true">Gestión</div>
      )}
      {puedeVerCatalogos && (
      <button
        className={
          styles['sb-item'] +
          (pathname.startsWith('/admin/catalogos') ? ' ' + styles['active'] : '')
        }
        aria-current={pathname.startsWith('/admin/catalogos') ? 'page' : undefined}
        aria-label="Módulo Catálogos"
        data-tooltip="Catálogos"
        onClick={() => onNavigate('/admin/catalogos')}
      >
        <span className={styles['sb-item-ico']} aria-hidden="true">📋</span>
        <span className={styles['sb-item-txt']}>Catálogos</span>
      </button>
      )}
      {puedeVerUsuarios && (
      <button
        className={
          styles['sb-item'] +
          (pathname === '/admin/usuarios' ? ' ' + styles['active'] : '')
        }
        aria-label="Inventario de Usuarios"
        data-tooltip="Usuarios"
        aria-current={pathname === '/admin/usuarios' ? 'page' : undefined}
        onClick={() => onNavigate('/admin/usuarios')}
      >
        <span className={styles['sb-item-ico']} aria-hidden="true">⚙️</span>
        <span className={styles['sb-item-txt']}>Usuarios</span>
      </button>
      )}
      {puedeVerPerfil && (
      <button
        className={styles['sb-item'] + (pathname.startsWith('/mi-perfil') ? ' ' + styles['active'] : '')}
        aria-label="Mi perfil"
        data-tooltip="Mi perfil"
        aria-current={pathname.startsWith('/mi-perfil') ? 'page' : undefined}
        onClick={() => onNavigate('/mi-perfil')}
      >
        <span className={styles['sb-item-ico']} aria-hidden="true">👤</span>
        <span className={styles['sb-item-txt']}>Mi perfil</span>
      </button>
      )}

      <div className={styles['sb-group-label']} aria-hidden="true">Documentos</div>
      <a className={styles['sb-item']} href="/divulgacion.html" target="_blank" rel="noopener noreferrer" aria-label="Documento para comunidades (abre en nueva pestaña)" data-tooltip="Para comunidades">
        <span className={styles['sb-item-ico']} aria-hidden="true">📄</span>
        <span className={styles['sb-item-txt']}>Para comunidades</span>
      </a>
      <a className={styles['sb-item']} href="/agroplataforma.html" target="_blank" rel="noopener noreferrer" aria-label="Documento técnico (abre en nueva pestaña)" data-tooltip="Info técnica">
        <span className={styles['sb-item-ico']} aria-hidden="true">💻</span>
        <span className={styles['sb-item-txt']}>Info técnica</span>
      </a>

      {/* Footer sidebar */}
      <div className={styles['sb-footer']}>
        <div className={styles['sb-footer-btns']}>
          <a className={styles['sb-footer-btn']} href="/" aria-label="Ir a inicio público">
            <span aria-hidden="true">🏠</span>
            <span className={styles['sb-footer-btn-txt']}>Inicio</span>
          </a>
          <button className={`${styles['sb-footer-btn']} ${styles['danger']}`} onClick={onLogout} aria-label="Cerrar sesión">
            <span aria-hidden="true">🚪</span>
            <span className={styles['sb-footer-btn-txt']}>Salir</span>
          </button>
        </div>
        <div className={collapsed ? styles['sb-hide'] : ''} style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'rgba(255,255,255,.18)', marginTop: 10, textAlign: 'center', letterSpacing: '.06em' }}>
          PEE-2025-G-369 · v1.0
        </div>
      </div>
    </nav>
  );
};
