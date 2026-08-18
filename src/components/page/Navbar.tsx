import { useEffect, useState } from 'react';

import Link from 'next/link';
import { ROL_HOME } from '@/types';
import { getToken, getUsuario, cerrarSesion } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const router = useRouter();
    const [usuario, setUsuario] = useState<{ nombre_completo?: string; username?: string; rol?: string } | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [navScrolled, setNavScrolled] = useState(false);

    useEffect(() => {
    // Forzar modo claro SOLO mientras este componente esté montado
    const root = document.documentElement;
    const wasDark = root.classList.contains('dark');
    root.classList.remove('dark');

    const t = getToken();
    const u = getUsuario();
    setToken(t);
    setUsuario(u);
    if (t && u) {
      router.replace(ROL_HOME[u.rol] ?? '/dashboard');
      return;
    }
    // Navbar scroll color
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    setNavScrolled(window.scrollY > 40);
    return () => {
      window.removeEventListener('scroll', onScroll);
      // Restaurar modo oscuro si estaba activo antes
      if (wasDark) root.classList.add('dark');
    };
  }, [router]);


  const handleLogout = () => {
    cerrarSesion();
    setToken(null);
    setUsuario(null);
    router.replace('/login');
    // Limpiar parámetros de la URL si los hubiera
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/login');
    }
  };

  const iniciales = usuario?.nombre_completo
    ? usuario.nombre_completo.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()
    : (usuario?.username ? usuario.username.slice(0,2).toUpperCase() : '?');
  const roles: Record<string, string> = {
    administrador:'👑 Admin', investigador:'🔬 Investigador',
    tecnico_campo:'🌾 Técnico', visualizador:'📊 Consultor', productor:'🌽 Productor'
  };

  return (
    <nav className={`nav${navScrolled ? ' scrolled' : ''}`} id="nav">
        <a className="nav-logo" href="#">
          <span className="nav-logo-ico">🌽</span>
          <div>
            <div className="nav-logo-txt">Agroplataforma</div>
            <span className="nav-logo-sub">Maíz Nativo · Huasteca Potosina</span>
          </div>
        </a>
        <div className="nav-links">
          <a className="nav-link" href="#modulos">Módulos</a>
          <a className="nav-link" href="#avances">Avances</a>
          <a className="nav-link" href="#mapa">Cobertura</a>
          <a className="nav-link" href="#equipo">Equipo</a>
          <a className="nav-link" href="/divulgacion.html">Comunidades</a>
          {usuario && token ? (
            <div className="nav-usuario" id="nav-usuario">
              <div className="nav-user-info">
                <div className="nav-user-nombre" id="nav-nombre">{usuario.nombre_completo || usuario.username}</div>
                <div className="nav-user-rol" id="nav-rol">{usuario.rol ? (roles[usuario.rol] || usuario.rol) : ''}</div>
              </div>
              <div className="nav-avatar" id="nav-avatar">{iniciales}</div>
              <button className="nav-btn-salir" onClick={handleLogout}>✕</button>
            </div>
          ) : (
            <Link className="nav-btn-login" href="/login" id="nav-login-btn">🔐 Iniciar sesión</Link>
          )}
        </div>
        <button className="hamburger" onClick={() => {
           const links = document.querySelector('.nav-links') as HTMLElement;
           const btn = document.querySelector('.hamburger') as HTMLElement;
           if (links) links.classList.toggle('open');
           if (btn) btn.classList.toggle('is-open');
        }}>
          <span></span><span></span><span></span>
        </button>
      </nav>
  );
}