import React from 'react';
import Link from 'next/link';
import styles from './Sidebar.module.css';
import type { Rol } from '@/types';

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
  mobileOpen?: boolean
  onMobileClose?: () => void
}

import { usePathname } from 'next/navigation';

export const Sidebar: React.FC<SidebarProps> = ({ user, rol, onLogout, onNavigate, onCollapseToggle, collapsed, className, mobileOpen, onMobileClose }) => {
  const navClass = [
    className ? className : styles.sidebar,
    collapsed ? styles.collapsed : '',
    mobileOpen ? styles.open : ''  
  ].filter(Boolean).join(' ')
  const pathname = usePathname();

  // Flags de permiso para mostrar/ocultar items del menú
  const esAdmin = rol === 'administrador';
  const esConsultaMapa = !rol || ['visualizador', 'productor', 'invitado'].includes(rol);
  const puedeCapturar = !rol || ['investigador', 'tecnico_campo'].includes(rol);
  const puedeVerMapaComunidades = !rol || ['administrador', 'investigador', 'tecnico_campo', 'visualizador', 'productor', 'invitado'].includes(rol);
  const puedeVerCatalogos = !rol || ['administrador', 'investigador'].includes(rol);
  const puedeVerUsuarios = !rol || esAdmin;
  const puedeVerPerfil = !rol || rol !== 'invitado';
  const dashboardHref = esAdmin ? '/admin/dashboard' : '/dashboard';

  return (
    <nav className={navClass} id="sidebar" role="navigation" aria-label="Menú principal" data-collapsed={collapsed}>
      {/* Logo */}
      <Link className={styles['sb-logo']} href="/" aria-label="Inicio - Agroplataforma Maíz Nativo">
        <span className={styles['sb-logo-ico']} aria-hidden="true" style={{ fontSize: 22 }}>🌽</span>
        <div className={styles['sb-logo-txt']}>
          <div className={styles['sb-logo-nombre']}>Agroplataforma</div>
          <span className={styles['sb-logo-sub']}>Maíz Nativo · Huasteca</span>
        </div>
      </Link>

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

      {/* Orden específico para admin */}
      {esAdmin ? (
        <>
          {/* Dashboard */}
          <button
            className={
              styles['sb-item'] +
              (pathname === '/dashboard' || pathname === '/admin/dashboard' ? ' ' + styles['active'] : '')
            }
            aria-current={pathname === '/dashboard' || pathname === '/admin/dashboard' ? 'page' : undefined}
            aria-label="Dashboard - Inicio"
            data-tooltip="Dashboard"
            onClick={() => {
              onNavigate(dashboardHref)
              if (onMobileClose) onMobileClose()
            }}
          >
            <span className={styles['sb-item-ico']} aria-hidden="true">🏠</span>
            <span className={styles['sb-item-txt']}>Inicio</span>
          </button>
          {/* Productores */}
          {['administrador','investigador','tecnico_campo'].includes(rol) && (
            <button
              className={styles['sb-item'] + (pathname.startsWith('/admin/productores') ? ' ' + styles['active'] : '')}
              aria-current={pathname.startsWith('/admin/productores') ? 'page' : undefined}
              aria-label="Productores"
              data-tooltip="Productores"
              onClick={() => {
                onNavigate('/admin/productores')
                if (onMobileClose) onMobileClose()
              }}
            >
              <span className={styles['sb-item-ico']} aria-hidden="true">🧑‍🌾</span>
              <span className={styles['sb-item-txt']}>Productores</span>
              <span className={styles['sb-item-badge'] + ' ' + styles['badge-nuevo']} aria-label="Nuevo" style={{marginLeft:4}}>Nuevo</span>
            </button>
          )}
          {/* Comunidades */}
          {['administrador','investigador','tecnico_campo'].includes(rol) && (
            <button
              className={styles['sb-item'] + (pathname.startsWith('/admin/comunidades') ? ' ' + styles['active'] : '')}
              aria-current={pathname.startsWith('/admin/comunidades') ? 'page' : undefined}
              aria-label="Comunidades"
              data-tooltip="Comunidades"
              onClick={() => {
                onNavigate('/admin/comunidades')
                if (onMobileClose) onMobileClose()
              }}
            >
              <span className={styles['sb-item-ico']} aria-hidden="true">🏘️</span>
              <span className={styles['sb-item-txt']}>Comunidades</span>
              <span className={styles['sb-item-badge'] + ' ' + styles['badge-nuevo']} aria-label="Nuevo" style={{marginLeft:4}}>Nuevo</span>
            </button>
          )}
          {/* Sociocultural */}
          {['administrador','investigador','tecnico_campo'].includes(rol) && (
            <button
              className={styles['sb-item'] + (pathname.startsWith('/admin/sociocultural') ? ' ' + styles['active'] : '')}
              aria-current={pathname.startsWith('/admin/sociocultural') ? 'page' : undefined}
              aria-label="Sociocultural"
              data-tooltip="Sociocultural"
              onClick={() => {
                onNavigate('/admin/sociocultural')
                if (onMobileClose) onMobileClose()
              }}
            >
              <span className={styles['sb-item-ico']} aria-hidden="true">🎭</span>
              <span className={styles['sb-item-txt']}>Sociocultural</span>
              <span className={styles['sb-item-badge'] + ' ' + styles['badge-beta']} aria-label="Beta" style={{marginLeft:4}}>Beta</span>
            </button>
          )}
          {/* Fenotípico */}
          {['administrador','investigador','tecnico_campo'].includes(rol) && (
            <button
              className={styles['sb-item'] + (pathname.startsWith('/admin/fenotipo') ? ' ' + styles['active'] : '')}
              aria-current={pathname.startsWith('/admin/fenotipo') ? 'page' : undefined}
              aria-label="Fenotípico"
              data-tooltip="Fenotípico"
              onClick={() => {
                onNavigate('/admin/fenotipo')
                if (onMobileClose) onMobileClose()
              }}
            >
              <span className={styles['sb-item-ico']} aria-hidden="true">🔬</span>
              <span className={styles['sb-item-txt']}>Fenotípico</span>
              <span className={styles['sb-item-badge'] + ' ' + styles['badge-beta']} aria-label="Beta" style={{marginLeft:4}}>Beta</span>
            </button>
          )}
          {/* Catálogos */}
          {puedeVerCatalogos && (
            <button
              className={
                styles['sb-item'] +
                (pathname.startsWith('/admin/catalogos') ? ' ' + styles['active'] : '')
              }
              aria-current={pathname.startsWith('/admin/catalogos') ? 'page' : undefined}
              aria-label="Catálogos"
              data-tooltip="Catálogos"
              onClick={() => {
                onNavigate('/admin/catalogos')
                if (onMobileClose) onMobileClose()
              }}
            >
              <span className={styles['sb-item-ico']} aria-hidden="true">📋</span>
              <span className={styles['sb-item-txt']}>Catálogos</span>
            </button>
          )}
          {/* Usuarios */}
          {puedeVerUsuarios && (
            <button
              className={
                styles['sb-item'] +
                (pathname === '/admin/usuarios' ? ' ' + styles['active'] : '')
              }
              aria-label="Inventario de Usuarios"
              data-tooltip="Usuarios"
              aria-current={pathname === '/admin/usuarios' ? 'page' : undefined}
              onClick={() => {
                onNavigate('/admin/usuarios')
                if (onMobileClose) onMobileClose()
              }}
            >
              <span className={styles['sb-item-ico']} aria-hidden="true">⚙️</span>
              <span className={styles['sb-item-txt']}>Usuarios</span>
            </button>
          )}
        </>
      ) : (
        <>
          {/* Dashboard */}
          <button
            className={
              styles['sb-item'] +
              (pathname === '/dashboard' ? ' ' + styles['active'] : '')
            }
            aria-current={pathname === '/dashboard' ? 'page' : undefined}
            aria-label="Dashboard - Inicio"
            data-tooltip="Dashboard"
            onClick={() => onNavigate(dashboardHref)}
          >
            <span className={styles['sb-item-ico']} aria-hidden="true">🏠</span>
            <span className={styles['sb-item-txt']}>Inicio</span>
          </button>
          {/* Solo para roles permitidos, no consultor */}
          {['administrador','investigador','tecnico_campo'].includes(rol) && (
            <>
              {/* Productores */}
              <button
                className={
                  styles['sb-item'] +
                  (pathname.startsWith('/productores') ? ' ' + styles['active'] : '')
                }
                aria-current={pathname.startsWith('/productores') ? 'page' : undefined}
                aria-label="Productores"
                data-tooltip="Productores"
                onClick={() => {
                  onNavigate('/productores')
                  if (onMobileClose) onMobileClose()
                }}
              >
                <span className={styles['sb-item-ico']} aria-hidden="true">🧑‍🌾</span>
                <span className={styles['sb-item-txt']}>Productores</span>
                <span className={styles['sb-item-badge'] + ' ' + styles['badge-nuevo']} aria-label="Nuevo" style={{marginLeft:4}}>Nuevo</span>
              </button>
              {/* Comunidades debajo de Productores, con badge Nuevo */}
              <button
                className={
                  styles['sb-item'] +
                  (pathname.startsWith('/comunidades') ? ' ' + styles['active'] : '')
                }
                aria-current={pathname.startsWith('/comunidades') ? 'page' : undefined}
                aria-label="Comunidades"
                data-tooltip="Comunidades"
                onClick={() => {
                  onNavigate('/comunidades')
                  if (onMobileClose) onMobileClose()
                }}
              >
                <span className={styles['sb-item-ico']} aria-hidden="true">🏘️</span>
                <span className={styles['sb-item-txt']}>Comunidades</span>
                <span className={styles['sb-item-badge'] + ' ' + styles['badge-nuevo']} aria-label="Nuevo" style={{marginLeft:4}}>Nuevo</span>
              </button>
              {/* Parcelas */}
              <button
                className={styles['sb-item'] + (pathname.startsWith('/admin/parcelas') ? ' ' + styles['active'] : '')}
                aria-current={pathname.startsWith('/parcelas') ? 'page' : undefined}
                aria-label="Parcelas"
                data-tooltip="Parcelas"
                onClick={() => {
                  onNavigate('/admin/parcelas')
                  if (onMobileClose) onMobileClose()
                }}
              >
                <span className={styles['sb-item-ico']} aria-hidden="true">🌾</span>
                <span className={styles['sb-item-txt']}>Parcelas</span>
                <span className={styles['sb-item-badge'] + ' ' + styles['badge-nuevo']} aria-label="Nuevo" style={{marginLeft:4}}>Nuevo</span>
              </button>
              {/* Sociocultural */}
              <button
                className={
                  styles['sb-item'] +
                  (pathname.startsWith('/sociocultural') ? ' ' + styles['active'] : '')
                }
                aria-current={pathname.startsWith('/sociocultural') ? 'page' : undefined}
                aria-label="Sociocultural"
                data-tooltip="Sociocultural"
                onClick={() => {
                  onNavigate('/sociocultural')
                  if (onMobileClose) onMobileClose()
                }}
              >
                <span className={styles['sb-item-ico']} aria-hidden="true">🎭</span>
                <span className={styles['sb-item-txt']}>Sociocultural</span>
                <span className={styles['sb-item-badge'] + ' ' + styles['badge-beta']} aria-label="Beta" style={{marginLeft:4}}>Beta</span>
              </button>
              {/* Fenotípico */}
              <button
                className={
                  styles['sb-item'] +
                  (pathname.startsWith('/fenotipo') ? ' ' + styles['active'] : '')
                }
                aria-current={pathname.startsWith('/fenotipo') ? 'page' : undefined}
                aria-label="Fenotípico"
                data-tooltip="Fenotípico"
                onClick={() => {
                  onNavigate('/fenotipo')
                  if (onMobileClose) onMobileClose()
                }}
              >
                <span className={styles['sb-item-ico']} aria-hidden="true">🔬</span>
                <span className={styles['sb-item-txt']}>Fenotípico</span>
                <span className={styles['sb-item-badge'] + ' ' + styles['badge-beta']} aria-label="Beta" style={{marginLeft:4}}>Beta</span>
              </button>
            </>
          )}
        </>
      )}

      {/* Módulos públicos/campo */}
      {/* Solo mostrar Comunidades (Mapa) para roles de solo consulta, no para técnicos/campo */}
      {puedeVerMapaComunidades && !esAdmin && esConsultaMapa && (
        <button
          className={
            styles['sb-item'] +
            (pathname.startsWith('/comunidades') ? ' ' + styles['active'] : '')
          }
          aria-current={pathname.startsWith('/comunidades') ? 'page' : undefined}
          aria-label="Mapa de comunidades"
          data-tooltip="Mapa de comunidades"
          onClick={() => {
            onNavigate('/comunidades')
            if (onMobileClose) onMobileClose()
          }}
        >
          <span className={styles['sb-item-ico']} aria-hidden="true">🏘️</span>
          <span className={styles['sb-item-txt']}>Mapa de comunidades</span>
          <span className={styles['sb-item-badge'] + ' ' + styles['badge-beta']} aria-label="Mapa">Mapa</span>
        </button>
      )}

      {/* En construcción */}
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
      {/* Eliminado botón duplicado de Usuarios */}
      {puedeVerPerfil && (
      <button
        className={styles['sb-item'] + (pathname.startsWith('/mi-perfil') ? ' ' + styles['active'] : '')}
        aria-label="Mi perfil"
        data-tooltip="Mi perfil"
        aria-current={pathname.startsWith('/mi-perfil') ? 'page' : undefined}
        onClick={() => {
          onNavigate('/mi-perfil')
          if (onMobileClose) onMobileClose()
        }}
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
          <Link className={styles['sb-footer-btn']} href="/" aria-label="Ir a inicio público">
            <span aria-hidden="true">🏠</span>
            <span className={styles['sb-footer-btn-txt']}>Inicio</span>
          </Link>
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
