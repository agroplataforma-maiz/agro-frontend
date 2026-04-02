"use client";
import '@/styles/globals.css';
import '@/styles/landing-full.css';

import Head from 'next/head';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getUsuario, cerrarSesion } from '@/lib/auth';

// Efecto reveal al hacer scroll (como en el HTML original)
function useRevealOnScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const revealObs = new window.IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('on');
          revealObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.07 });
    const els = document.querySelectorAll('.reveal');
    els.forEach(el => revealObs.observe(el));
    return () => {
      revealObs.disconnect();
    };
  }, []);
}

export default function Home() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<{ nombre_completo?: string; username?: string; rol?: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const t = getToken();
    const u = getUsuario();
    setToken(t);
    setUsuario(u);
    if (t && u) {
      router.replace('/dashboard');
      return;
    }
    // Navbar scroll color
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    setNavScrolled(window.scrollY > 40);
    return () => window.removeEventListener('scroll', onScroll);
  }, [router]);

  useRevealOnScroll();

  const handleLogout = () => {
    cerrarSesion();
    setToken(null);
    setUsuario(null);
    router.replace('/');
  };

  const iniciales = usuario?.nombre_completo
    ? usuario.nombre_completo.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()
    : (usuario?.username ? usuario.username.slice(0,2).toUpperCase() : '?');
  const roles: Record<string, string> = {
    administrador:'👑 Admin', investigador:'🔬 Investigador',
    tecnico_campo:'🌾 Técnico', visualizador:'📊 Consultor', productor:'🌽 Productor'
  };

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,700&family=Nunito:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" type="image/png" href="/favicon.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </Head>
      {/* NAVBAR */}
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
            <a className="nav-btn-login" href="/login" id="nav-login-btn">🔐 Iniciar sesión</a>
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
      <main style={{ background: 'var(--crema)' }}>
        {/* HERO SECTION */}
        <section className="hero">
          <div className="hero-bg"></div>
          <div className="hero-grain"></div>
          <div className="hero-lines"></div>
          <svg className="hero-maiz-deco" viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg">
            <path d="M60 180 Q20 140 10 90 Q40 110 60 150 Z" fill="#4A8C64"/>
            <path d="M60 180 Q100 140 110 90 Q80 110 60 150 Z" fill="#2A5C3F"/>
            <path d="M60 160 Q15 120 8 60 Q45 90 60 140 Z" fill="#5AAD78" opacity=".6"/>
            <path d="M60 160 Q105 120 112 60 Q75 90 60 140 Z" fill="#3A7050" opacity=".6"/>
            <rect x="56" y="155" width="8" height="40" rx="3" fill="#3A7050"/>
            <ellipse cx="60" cy="95" rx="22" ry="55" fill="#D4922A"/>
            <ellipse cx="48" cy="60" rx="4" ry="5" fill="#F0B429"/><ellipse cx="56" cy="58" rx="4" ry="5" fill="#E8A020"/>
            <ellipse cx="64" cy="58" rx="4" ry="5" fill="#F0B429"/><ellipse cx="72" cy="60" rx="4" ry="5" fill="#E8A020"/>
            <ellipse cx="46" cy="72" rx="4" ry="5" fill="#F2C040"/><ellipse cx="54" cy="70" rx="4" ry="5" fill="#E8A020"/>
            <ellipse cx="62" cy="70" rx="4" ry="5" fill="#F0B429"/><ellipse cx="70" cy="70" rx="4" ry="5" fill="#F2C040"/>
            <ellipse cx="78" cy="72" rx="4" ry="5" fill="#E8A020"/><ellipse cx="44" cy="84" rx="4" ry="5" fill="#E8A020"/>
            <ellipse cx="52" cy="82" rx="4" ry="5" fill="#F0B429"/><ellipse cx="60" cy="82" rx="4" ry="5" fill="#F2C040"/>
            <ellipse cx="68" cy="82" rx="4" ry="5" fill="#E8A020"/><ellipse cx="76" cy="84" rx="4" ry="5" fill="#F0B429"/>
            <ellipse cx="44" cy="96" rx="4" ry="5" fill="#F0B429"/><ellipse cx="52" cy="94" rx="4" ry="5" fill="#E8A020"/>
            <ellipse cx="60" cy="94" rx="4" ry="5" fill="#F2C040"/><ellipse cx="68" cy="94" rx="4" ry="5" fill="#F0B429"/>
            <ellipse cx="76" cy="96" rx="4" ry="5" fill="#E8A020"/><ellipse cx="46" cy="108" rx="4" ry="5" fill="#E8A020"/>
            <ellipse cx="54" cy="106" rx="4" ry="5" fill="#F0B429"/><ellipse cx="62" cy="106" rx="4" ry="5" fill="#F2C040"/>
            <ellipse cx="70" cy="106" rx="4" ry="5" fill="#E8A020"/><ellipse cx="78" cy="108" rx="4" ry="5" fill="#F0B429"/>
            <ellipse cx="48" cy="120" rx="4" ry="5" fill="#F0B429"/><ellipse cx="56" cy="118" rx="4" ry="5" fill="#E8A020"/>
            <ellipse cx="64" cy="118" rx="4" ry="5" fill="#F2C040"/><ellipse cx="72" cy="120" rx="4" ry="5" fill="#F0B429"/>
            <path d="M38 52 Q30 30 36 10" stroke="#F2C040" strokeWidth="1.2" fill="none" opacity=".6"/>
            <path d="M48 50 Q44 26 52 6" stroke="#F0B429" strokeWidth="1.2" fill="none" opacity=".6"/>
            <path d="M60 48 Q62 22 68 4" stroke="#F2C040" strokeWidth="1.2" fill="none" opacity=".6"/>
            <path d="M72 50 Q80 26 78 8" stroke="#F0B429" strokeWidth="1.2" fill="none" opacity=".6"/>
          </svg>
          <div className="hero-contenido">
            <div className="hero-kicker">PEE-2025-G-369 · Secihti 2025</div>
            <h1 className="hero-h1">Conservando el<br/>maíz <em>nativo</em><br/>de la Huasteca</h1>
            <p className="hero-desc">Una agroplataforma digital que combina inteligencia geoespacial, saberes comunitarios y ciencia de datos para proteger la biodiversidad del maíz nativo en la Huasteca Potosina.</p>
            <div className="hero-acciones">
              <a className="btn-hero-primary" href="/login">🔐 Acceder a la plataforma</a>
              <a className="btn-hero-ghost" href="/divulgacion.html">🌽 Para comunidades</a>
            </div>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><div className="hero-stat-n">15+</div><div className="hero-stat-l">Comunidades</div></div>
            <div className="hero-sep"></div>
            <div className="hero-stat"><div className="hero-stat-n">11</div><div className="hero-stat-l">Investigadores</div></div>
            <div className="hero-sep"></div>
            <div className="hero-stat"><div className="hero-stat-n">30+</div><div className="hero-stat-l">Muestras</div></div>
            <div className="hero-sep"></div>
            <div className="hero-stat"><div className="hero-stat-n">16</div><div className="hero-stat-l">Meses</div></div>
          </div>
        </section>
        {/* NÚMEROS */}
        <div className="numeros-wrap">
          <div className="numeros-inner reveal">
            <div className="sec-kicker" style={{ color: 'var(--maiz-cl)' }}>
              <span style={{ display: 'block', width: 24, height: 1, background: 'var(--maiz-cl)' }}></span>
              El proyecto en cifras
            </div>
            <div className="sec-titulo" style={{ color: '#fff', marginBottom: 0 }}>
              Un proyecto de <em style={{ color: 'var(--maiz-cl)' }}>escala regional</em>
            </div>
            <div className="numeros-grid">
              <div className="num-card"><div className="num-n">15+</div><div className="num-l">Localidades visitadas en la Huasteca</div></div>
              <div className="num-card"><div className="num-n">11</div><div className="num-l">Investigadores e investigadoras</div></div>
              <div className="num-card"><div className="num-n">30+</div><div className="num-l">Muestras nutrimentales</div></div>
              <div className="num-card"><div className="num-n">5</div><div className="num-l">Talleres comunitarios</div></div>
              <div className="num-card"><div className="num-n">100</div><div className="num-l">Jóvenes capacitados</div></div>
            </div>
          </div>
        </div>
        {/* MÓDULOS */}
        <section className="sec reveal" id="modulos">
          <div className="sec-kicker">Plataforma digital</div>
          <h2 className="sec-titulo">Módulos del <em>sistema</em></h2>
          <p className="sec-desc">La agroplataforma integra datos geoespaciales, socioeconómicos, culturales y agronómicos en un sistema accesible para investigadores, técnicos y comunidades.</p>
          <div className="modulos-landing">
            <div className="ml-card">
              <div className="ml-ico">🧑‍🌾</div>
              <div className="ml-nombre">Productores</div>
              <p className="ml-desc">Registro completo de custodios del maíz nativo: perfil personal, socioeconómico, seguridad alimentaria, vulnerabilidad climática, identidad cultural y consentimiento informado.</p>
              <a className="ml-link" href="/login">Acceder →</a>
            </div>
            <div className="ml-card">
              <div className="ml-ico">🎭</div>
              <div className="ml-nombre">Social y Cultural</div>
              <p className="ml-desc">Saberes tradicionales, rituales agrícolas, narrativas orales, gastronomía, transmisión del conocimiento y nombres en lenguas originarias — el patrimonio biocultural del maíz.</p>
              <a className="ml-link" href="/login">Acceder →</a>
            </div>
            <div className="ml-card">
              <div className="ml-ico">📋</div>
              <div className="ml-nombre">Catálogos</div>
              <p className="ml-desc">Razas de maíz, colores de grano, uso del maíz, municipios, comunidades, lenguas, pueblos originarios y más de 15 catálogos del sistema con CRUD completo.</p>
              <a className="ml-link" href="/login">Acceder →</a>
            </div>
            <div className="ml-card" style={{ opacity: .65 }}>
              <div className="ml-ico">🗺️</div>
              <div className="ml-nombre">Mapas y SIG</div>
              <p className="ml-desc">Visualización interactiva de parcelas georeferenciadas, hotspots de diversidad genética, zonas prioritarias de conservación y cambios de uso de suelo. <em>Próximamente.</em></p>
            </div>
            <div className="ml-card" style={{ opacity: .65 }}>
              <div className="ml-ico">🔬</div>
              <div className="ml-nombre">Fenotípico</div>
              <p className="ml-desc">Evaluaciones morfológicas, análisis nutrimentales de 30+ variedades, fenología y evidencia fotográfica de mazorca, planta y grano. <em>Próximamente.</em></p>
            </div>
            <div className="ml-card" style={{ opacity: .65 }}>
              <div className="ml-ico">🌱</div>
              <div className="ml-nombre">Agronómico</div>
              <p className="ml-desc">Germoplasma nativo, ciclos agrícolas, sistemas de semilla, economía del cultivo y análisis de riesgo de pérdida de variedades. <em>Próximamente.</em></p>
            </div>
          </div>
        </section>
        <div className="sep-full"></div>
        {/* MAPA DE COBERTURA */}
        <div className="mapa-wrap" id="mapa">
          <div className="mapa-inner">
            <div className="mapa-txt reveal">
              <div className="sec-kicker">Cobertura geográfica</div>
              <h2 className="sec-titulo">Huasteca <em>Potosina</em></h2>
              <p className="sec-desc">El proyecto concentra su trabajo en la región Huasteca de San Luis Potosí, una de las zonas con mayor diversidad de maíces nativos en México y con alta presencia de comunidades indígenas custodias de estas semillas.</p>
              <div className="comunidades-chips" style={{ marginTop: 24 }}>
                <span className="chip activo">Ciudad Valles</span>
                <span className="chip activo">Ébano</span>
                <span className="chip activo">Tamuín</span>
                <span className="chip activo">Tancanhuitz</span>
                <span className="chip activo">Aquismón</span>
                <span className="chip">Xilitla</span>
                <span className="chip">Huehuetlán</span>
                <span className="chip">Tanlajás</span>
                <span className="chip">San Antonio</span>
                <span className="chip">Coxcatlán</span>
                <span className="chip">+5 más</span>
              </div>
            </div>
            <div className="mapa-svg-wrap reveal">
              <svg viewBox="0 0 340 300" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', display: 'block' }}>
                <path d="M40 60 Q80 30 140 40 Q200 50 260 80 Q300 100 310 160 Q320 220 280 260 Q240 290 180 285 Q120 280 80 250 Q40 220 30 170 Q20 120 40 60Z" fill="rgba(42,92,63,.25)" stroke="rgba(42,92,63,.4)" strokeWidth="1.5" />
                <path d="M60 100 Q120 130 180 120 Q230 110 280 150" stroke="rgba(74,140,100,.35)" strokeWidth="2" fill="none" strokeDasharray="4 3" />
                <path d="M100 200 Q150 180 200 190 Q240 200 270 220" stroke="rgba(74,140,100,.25)" strokeWidth="1.5" fill="none" strokeDasharray="3 3" />
                <g><circle cx="160" cy="150" r="8" fill="rgba(200,130,10,.3)" stroke="var(--maiz-cl)" strokeWidth="1.5" /><circle cx="160" cy="150" r="14" fill="rgba(200,130,10,.08)" stroke="var(--maiz-cl)" strokeWidth=".5" /><text x="160" y="154" textAnchor="middle" fontFamily="DM Mono" fontSize="7" fill="var(--maiz-cl)">CV</text></g>
                <g><circle cx="220" cy="130" r="6" fill="rgba(200,130,10,.2)" stroke="rgba(240,180,41,.6)" strokeWidth="1" /><text x="220" y="133" textAnchor="middle" fontFamily="DM Mono" fontSize="6" fill="rgba(240,180,41,.7)">EB</text></g>
                <g><circle cx="100" cy="170" r="6" fill="rgba(200,130,10,.2)" stroke="rgba(240,180,41,.6)" strokeWidth="1" /><text x="100" y="173" textAnchor="middle" fontFamily="DM Mono" fontSize="6" fill="rgba(240,180,41,.7)">AQ</text></g>
                <g><circle cx="140" cy="200" r="5" fill="rgba(200,130,10,.15)" stroke="rgba(240,180,41,.4)" strokeWidth="1" /><text x="140" y="203" textAnchor="middle" fontFamily="DM Mono" fontSize="6" fill="rgba(240,180,41,.5)">TC</text></g>
                <g><circle cx="200" cy="190" r="5" fill="rgba(200,130,10,.15)" stroke="rgba(240,180,41,.4)" strokeWidth="1" /><text x="200" y="193" textAnchor="middle" fontFamily="DM Mono" fontSize="6" fill="rgba(240,180,41,.5)">TM</text></g>
                <g><circle cx="80" cy="130" r="4" fill="rgba(200,130,10,.1)" stroke="rgba(240,180,41,.3)" strokeWidth=".8" /></g>
                <g><circle cx="240" cy="200" r="4" fill="rgba(200,130,10,.1)" stroke="rgba(240,180,41,.3)" strokeWidth=".8" /></g>
                <circle cx="20" cy="275" r="5" fill="rgba(200,130,10,.3)" stroke="var(--maiz-cl)" strokeWidth="1" />
                <text x="30" y="279" fontFamily="DM Mono" fontSize="7" fill="rgba(255,255,255,.4)">En campo</text>
                <circle cx="100" cy="275" r="4" fill="rgba(200,130,10,.1)" stroke="rgba(240,180,41,.3)" strokeWidth=".8" />
                <text x="110" y="279" fontFamily="DM Mono" fontSize="7" fill="rgba(255,255,255,.4)">Programada</text>
                <text x="10" y="20" fontFamily="DM Mono" fontSize="9" fill="rgba(255,255,255,.25)" letterSpacing="1">HUASTECA POTOSINA · SLP</text>
              </svg>
            </div>
          </div>
        </div>
        {/* AVANCES */}
        <section className="sec" id="avances">
          <div className="sec-kicker reveal">Estado del proyecto</div>
          <h2 className="sec-titulo reveal">Avances y <em>próximos pasos</em></h2>
          <div className="avances-grid">
            <div className="reveal">
              <div className="avance-item">
                <div className="avance-fecha">MES 1</div>
                <div><div className="avance-titulo">Diseño de la base de datos</div><div className="avance-desc">Arquitectura PostgreSQL/PostGIS con 7 esquemas y 40+ tablas.</div><span className="avance-badge badge-completado">Completado</span></div>
              </div>
              <div className="avance-item">
                <div className="avance-fecha">MES 2</div>
                <div><div className="avance-titulo">Catálogos territoriales</div><div className="avance-desc">Estados, municipios, comunidades, localidades y lenguas originarias cargados.</div><span className="avance-badge badge-completado">Completado</span></div>
              </div>
              <div className="avance-item">
                <div className="avance-fecha">MES 3</div>
                <div><div className="avance-titulo">Módulos de captura</div><div className="avance-desc">Frontend completo para productores, catálogos y módulos social y cultural.</div><span className="avance-badge badge-en-curso">En curso</span></div>
              </div>
              <div className="avance-item">
                <div className="avance-fecha">MES 4</div>
                <div><div className="avance-titulo">Visitas de campo</div><div className="avance-desc">Levantamiento en 15+ comunidades con GPS y dron Mavic 3.</div><span className="avance-badge badge-en-curso">En curso</span></div>
              </div>
              <div className="avance-item">
                <div className="avance-fecha">MES 5</div>
                <div><div className="avance-titulo">Informe de diagnóstico</div><div className="avance-desc">Reporte socioterritorial y análisis preliminar de resultados de campo.</div><span className="avance-badge badge-proximo">Próximo</span></div>
              </div>
            </div>
            <div className="etapa-vis reveal">
              <div className="etapa-header">
                <div className="etapa-nombre">Etapa 1 · Diagnóstico</div>
                <span className="etapa-estado badge-en-curso">En curso</span>
              </div>
              <div className="etapa-body">
                <div className="etapa-dur">Duración: 5 meses · 2025</div>
                <div className="etapa-item"><span className="etapa-item-ico">✅</span> Base de datos PostgreSQL/PostGIS construida</div>
                <div className="etapa-item"><span className="etapa-item-ico">✅</span> Módulos de captura frontend listos</div>
                <div className="etapa-item"><span className="etapa-item-ico">✅</span> Sistema de autenticación JWT implementado</div>
                <div className="etapa-item"><span className="etapa-item-ico">🔄</span> Visitas de campo en 15+ comunidades</div>
                <div className="etapa-item"><span className="etapa-item-ico">🔄</span> Entrevistas y registro GPS</div>
                <div className="etapa-item"><span className="etapa-item-ico">⏳</span> Vuelos de dron DJI Mavic 3 Multispectral</div>
                <div className="etapa-item"><span className="etapa-item-ico">⏳</span> Análisis satelital Sentinel-2 / GEE</div>
                <div className="etapa-item"><span className="etapa-item-ico">⏳</span> Informe de diagnóstico socioterritorial</div>
                <div className="prog-wrap">
                  <div className="prog-track"><div className="prog-fill" style={{ width: '38%' }}></div></div>
                  <div className="prog-lbl">▸ 38% completado</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className="sep-full"></div>
        {/* EQUIPO */}
        <div className="equipo-wrap" id="equipo">
          <div className="equipo-inner">
            <div className="sec-kicker reveal">Grupo de investigación</div>
            <h2 className="sec-titulo reveal">El equipo <em>detrás</em> del proyecto</h2>
            <p className="sec-desc reveal">Once investigadoras e investigadores del Instituto Tecnológico de Ciudad Valles con especialidades en computación, agroecología, nutrición, fitopatología y ciencias ambientales.</p>
            <div className="equipo-grid">
              <div className="eq-card reveal" style={{ animationDelay: '.05s', borderColor: 'rgba(74,140,100,.3)', background: 'var(--verde-pal)' }}><div className="eq-inicial" style={{ background: 'var(--verde-cl)' }}>AB</div><div className="eq-nombre">Alfredo Barrón Rodríguez</div><div className="eq-esp" style={{ color: 'var(--verde-cl)' }}>Responsable técnico</div></div>
              <div className="eq-card reveal" style={{ animationDelay: '.1s' }}><div className="eq-inicial">SR</div><div className="eq-nombre">Sofía del Rosario Romero Ramos</div><div className="eq-esp">Industrias alimentarias</div></div>
              <div className="eq-card reveal" style={{ animationDelay: '.15s' }}><div className="eq-inicial">HL</div><div className="eq-nombre">Hugo René Larraga Altamirano</div><div className="eq-esp">Sistemas computacionales</div></div>
              <div className="eq-card reveal" style={{ animationDelay: '.2s' }}><div className="eq-inicial">DP</div><div className="eq-nombre">Daniel Perales Rosas</div><div className="eq-esp">Parasitología agrícola</div><span className="eq-sni">SNI Nivel I</span></div>
              <div className="eq-card reveal" style={{ animationDelay: '.25s' }}><div className="eq-inicial">DH</div><div className="eq-nombre">Dalia Rosario Hernández López</div><div className="eq-esp">Sistemas computacionales</div></div>
              <div className="eq-card reveal" style={{ animationDelay: '.3s' }}><div className="eq-inicial">OE</div><div className="eq-nombre">Omar Espinosa Guerra</div><div className="eq-esp">Electrónica y software</div></div>
              <div className="eq-card reveal" style={{ animationDelay: '.35s' }}><div className="eq-inicial">RJ</div><div className="eq-nombre">Rosa María Jiménez Maldonado</div><div className="eq-esp">Emprendimiento comunitario</div></div>
              <div className="eq-card reveal" style={{ animationDelay: '.4s' }}><div className="eq-inicial">CG</div><div className="eq-nombre">Carlos Cecilio Góngora Canul</div><div className="eq-esp">Fitopatología</div><span className="eq-sni">SNI Nivel I</span></div>
              <div className="eq-card reveal" style={{ animationDelay: '.45s' }}><div className="eq-inicial">HM</div><div className="eq-nombre">Habacuc Lorenzo Márquez</div><div className="eq-esp">SIG y análisis estadístico</div></div>
              <div className="eq-card reveal" style={{ animationDelay: '.5s' }}><div className="eq-inicial">DA</div><div className="eq-nombre">Dulce Carolina Acosta Pintor</div><div className="eq-esp">Desarrollo sustentable</div></div>
              <div className="eq-card reveal" style={{ animationDelay: '.55s' }}><div className="eq-inicial">AP</div><div className="eq-nombre">Ana María Piedad Rubio</div><div className="eq-esp">Sistemas computacionales</div></div>
              <div className="eq-card reveal" style={{ animationDelay: '.6s' }}><div className="eq-inicial">CW</div><div className="eq-nombre">Cynthia Wong Arguelles</div><div className="eq-esp">Ciencias ambientales</div><span className="eq-sni">SNI Nivel I</span></div>
            </div>
          </div>
        </div>
        {/* CTA */}
        <div className="cta-wrap">
          <div className="cta-inner reveal">
            <h2 className="cta-titulo">¿Formas parte<br/>del <em>equipo</em>?</h2>
            <p className="cta-desc">Accede a la plataforma para registrar productores, capturar datos de campo, consultar catálogos y visualizar el avance del proyecto en tiempo real.</p>
            <div className="cta-btns">
              <a className="btn-hero-primary" href="/login">🔐 Iniciar sesión</a>
              <a className="btn-hero-ghost" href="/login#registro">✉ Crear cuenta</a>
            </div>
          </div>
        </div>
        {/* FOOTER */}
        <footer>
          <div>
            <div className="foot-logo">🌽 Agroplataforma · Maíz Nativo</div>
            <div className="foot-sub">
              Proyecto PEE-2025-G-369 · Secihti 2025<br />
              Instituto Tecnológico de Ciudad Valles · TecNM<br />
              San Luis Potosí · México
            </div>
          </div>
          <div className="foot-logos">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/LOGOTECNM.png" alt="TecNM" />
            <div className="foot-logos-sep" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/secihti.png" alt="Secihti" />
            <div className="foot-logos-sep" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/logotec.png" alt="IT Ciudad Valles" />
          </div>
          <div className="foot-der">
            <div>Eje 2 · Mejoramiento de Cultivos de Maíz y Frijol</div>
            <div>Etapa 1 en curso · 2025–2026</div>
            <div style={{ marginTop: 6, opacity: .5 }}>alfredo.barron@tecvalles.mx · 481 391 8309</div>
          </div>
        </footer>
      </main>
    </>
  );
}
