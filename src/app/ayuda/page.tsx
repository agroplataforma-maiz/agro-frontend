'use client'
import React, { useState } from 'react'
import AdminShell from '@/components/dashboard/AdminShell'
import styles from './ayuda.module.css'

// ─── Datos de contenido ───────────────────────────────────────────────────────
const SECCIONES = [
  {
    id: 'que-es',
    icono: '🌽',
    titulo: '¿Qué es la Agroplataforma?',
    contenido: (
      <>
        <p>La Agroplataforma Maíz Nativo es una herramienta digital diseñada para preservar y documentar el conocimiento sobre las variedades de maíz nativo de la Huasteca Potosina.</p>
        <p>Fue desarrollada por investigadores del Instituto Tecnológico de Ciudad Valles (TecNM) con apoyo de la Secretaría de Ciencias, Humanidades, Tecnología e Innovación (Secihti).</p>
        <div className={styles['ayuda-highlight']}>
          <span className={styles['ayuda-highlight-ico']}>🤝</span>
          <span>Esta plataforma <strong>pertenece a las comunidades</strong>. Su información es usada únicamente para la conservación del maíz nativo y NO se comparte con fines comerciales.</span>
        </div>
      </>
    ),
  },
  {
    id: 'para-quien',
    icono: '👥',
    titulo: '¿Para quién es esta plataforma?',
    contenido: (
      <>
        <p>La plataforma tiene diferentes tipos de usuarios, cada uno con funciones distintas:</p>
        <div className={styles['roles-grid']}>
          <div className={styles['rol-card']}>
            <span className={styles['rol-ico']}>👨‍🌾</span>
            <strong>Productor/a</strong>
            <p>Puedes ver la información de tus parcelas y variedades de maíz que has registrado.</p>
          </div>
          <div className={styles['rol-card']}>
            <span className={styles['rol-ico']}>🔬</span>
            <strong>Técnico de campo</strong>
            <p>Puedes registrar información de productores, comunidades y evaluaciones de maíz.</p>
          </div>
          <div className={styles['rol-card']}>
            <span className={styles['rol-ico']}>📊</span>
            <strong>Investigador/a</strong>
            <p>Tienes acceso a análisis, reportes y catálogos de variedades.</p>
          </div>
          <div className={styles['rol-card']}>
            <span className={styles['rol-ico']}>⚙️</span>
            <strong>Administrador/a</strong>
            <p>Gestiona usuarios, permisos y configuración general del sistema.</p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: 'modulos',
    icono: '📋',
    titulo: 'Módulos de la plataforma',
    contenido: (
      <>
        <p>La plataforma está organizada en módulos. Aquí te explicamos qué hace cada uno:</p>
        <div className={styles['modulos-lista']}>
          {[
            { ico: '🏠', nombre: 'Dashboard',     desc: 'Pantalla principal. Muestra un resumen del avance del proyecto, cuántos productores y comunidades hay registrados, y accesos rápidos a los módulos.' },
            { ico: '🧑‍🌾', nombre: 'Productores',  desc: 'Aquí se registra la información de cada productor: su nombre, comunidad, parcela, variedades de maíz que cultiva y datos de contacto.' },
            { ico: '🏘️', nombre: 'Comunidades',   desc: 'Contiene información sobre las comunidades participantes: municipio, lengua originaria, número de productores y ubicación en el mapa.' },
            { ico: '🎭', nombre: 'Sociocultural',  desc: 'Registra los saberes tradicionales, rituales agrícolas, nombres del maíz en lenguas originarias y la gastronomía asociada al cultivo.' },
            { ico: '🔬', nombre: 'Fenotípico',     desc: 'Captura las características físicas de las mazorcas y granos: tamaño, color, número de hileras, altura de planta y análisis nutrimentales.' },
            { ico: '🗺️', nombre: 'Mapas y SIG',   desc: 'Visualización en mapa de todas las parcelas, comunidades y zonas de conservación. Próximamente disponible.' },
            { ico: '🌱', nombre: 'Agronómico',     desc: 'Registrará ciclos agrícolas, sistemas de semilla y datos de producción. Próximamente disponible.' },
            { ico: '🌧️', nombre: 'Ambiental',     desc: 'Monitoreará índices de vegetación (NDVI), datos climáticos y alertas de sequía o plagas. Próximamente disponible.' },
          ].map(m => (
            <div key={m.nombre} className={styles['modulo-fila']}>
              <span className={styles['modulo-ico']}>{m.ico}</span>
              <div>
                <strong className={styles['modulo-nombre']}>{m.nombre}</strong>
                <p className={styles['modulo-desc']}>{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    id: 'navegar',
    icono: '🧭',
    titulo: '¿Cómo navegar la plataforma?',
    contenido: (
      <>
        <div className={styles['pasos-lista']}>
          {[
            { n: '1', titulo: 'Menú lateral (sidebar)',   desc: 'A la izquierda de la pantalla encontrarás el menú principal. Haz clic en cualquier módulo para ir a él. En pantallas pequeñas el menú se puede abrir con el botón ≡ arriba a la izquierda.' },
            { n: '2', titulo: 'Barra superior (topbar)',  desc: 'En la parte de arriba encontrarás: el buscador (para ir rápido a cualquier módulo), el botón de tema claro/oscuro 🌙, las notificaciones 🔔 y tu menú de usuario con acceso a tu perfil y cierre de sesión.' },
            { n: '3', titulo: 'Ruta de navegación',       desc: 'Debajo del logo verás una ruta como "Agroplataforma › Productores". Esto te indica en qué parte del sistema estás.' },
            { n: '4', titulo: 'Buscador',                 desc: 'Escribe el nombre de cualquier módulo en la barra de búsqueda y aparecerán sugerencias para ir directo.' },
            { n: '5', titulo: 'Botones de acción',        desc: 'Los botones verdes realizan acciones principales (registrar, guardar). Los botones grises son secundarios (cancelar, regresar).' },
          ].map(p => (
            <div key={p.n} className={styles['paso-item']}>
              <div className={styles['paso-num']}>{p.n}</div>
              <div>
                <strong className={styles['paso-titulo']}>{p.titulo}</strong>
                <p className={styles['paso-desc']}>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    id: 'privacidad',
    icono: '🔒',
    titulo: 'Privacidad y tus datos',
    contenido: (
      <>
        <div className={styles['ayuda-highlight']} style={{ marginBottom: 16 }}>
          <span className={styles['ayuda-highlight-ico']}>🛡️</span>
          <span><strong>Tu información está protegida.</strong> Solo el equipo de investigación autorizado puede ver los datos registrados.</span>
        </div>
        <ul className={styles['privacidad-lista']}>
          <li>✅ Los datos se usan <strong>únicamente para investigación científica</strong> sobre conservación del maíz nativo.</li>
          <li>✅ Tu información <strong>no se vende ni comparte</strong> con empresas comerciales.</li>
          <li>✅ Cada productor puede solicitar <strong>ver, corregir o eliminar</strong> sus datos en cualquier momento.</li>
          <li>✅ Se recabó <strong>consentimiento informado</strong> antes de registrar cualquier dato.</li>
          <li>✅ Los datos se almacenan en servidores seguros con <strong>copias de respaldo</strong>.</li>
        </ul>
        <p style={{ marginTop: 16, fontSize: 13 }}>Para cualquier duda sobre tus datos, contacta al equipo del proyecto: <strong>IT Ciudad Valles · TecNM</strong>.</p>
      </>
    ),
  },
  {
    id: 'accesibilidad',
    icono: '♿',
    titulo: 'Accesibilidad',
    contenido: (
      <>
        <p>La plataforma está diseñada para ser usada por todos, incluyendo personas con diferentes capacidades o con equipos de cómputo sencillos.</p>
        <div className={styles['acc-grid']}>
          {[
            { ico: '🌙', titulo: 'Modo oscuro',          desc: 'Activa el modo oscuro con el botón 🌙 en la barra superior para reducir el cansancio visual, especialmente de noche.' },
            { ico: '⌨️', titulo: 'Navegación por teclado', desc: 'Puedes moverte por toda la plataforma usando solo el teclado (tecla Tab para avanzar, Enter para seleccionar).' },
            { ico: '📱', titulo: 'Funciona en celular',   desc: 'La plataforma se adapta a pantallas pequeñas de teléfono. Usa el botón ≡ para abrir el menú.' },
            { ico: '🔤', titulo: 'Texto claro',           desc: 'Todos los textos usan lenguaje sencillo, sin tecnicismos innecesarios, pensado para comunidades rurales.' },
            { ico: '🖥️', titulo: 'Baja conectividad',    desc: 'El sistema está optimizado para funcionar con conexiones lentas de internet, comunes en zonas rurales.' },
            { ico: '🌐', titulo: 'Lenguas originarias',   desc: 'Los nombres de variedades y saberes se registran también en lenguas originarias (Teenek, Náhuatl).' },
          ].map(a => (
            <div key={a.titulo} className={styles['acc-card']}>
              <span className={styles['acc-ico']}>{a.ico}</span>
              <strong className={styles['acc-titulo']}>{a.titulo}</strong>
              <p className={styles['acc-desc']}>{a.desc}</p>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    id: 'problemas',
    icono: '🛠️',
    titulo: 'Solución de problemas frecuentes',
    contenido: (
      <>
        <div className={styles['faq-lista']}>
          {[
            { p: '¿Por qué no puedo entrar al sistema?',         r: 'Verifica que tu usuario y contraseña sean correctos. Si olvidaste tu contraseña, pide al administrador que te la restablezca.' },
            { p: '¿Por qué no veo ciertos módulos?',             r: 'Cada usuario tiene permisos según su rol. Si crees que debería tener acceso a algo, contacta al administrador.' },
            { p: 'Guardé información pero no aparece',           r: 'Intenta recargar la página (F5 o deslizar hacia abajo en celular). Si el problema persiste, reporta al equipo técnico.' },
            { p: 'La plataforma se ve muy pequeña en mi pantalla', r: 'Puedes aumentar el zoom de tu navegador con Ctrl++ (en Windows) o Cmd++ (en Mac). En celular usa los dedos para ampliar.' },
            { p: '¿Cómo cerrar sesión?',                         r: 'Haz clic en tu nombre en la esquina superior derecha y selecciona "Cerrar sesión". También puedes usar el botón 🚪 en la parte inferior del menú lateral.' },
            { p: 'La página carga muy lento',                    r: 'En zonas con poca señal es normal que tarde un poco. Espera unos segundos o intenta con WiFi si está disponible.' },
          ].map((f, i) => (
            <div key={i} className={styles['faq-item']}>
              <div className={styles['faq-pregunta']}>❓ {f.p}</div>
              <div className={styles['faq-respuesta']}>💬 {f.r}</div>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    id: 'contacto',
    icono: '📞',
    titulo: 'Contacto y soporte',
    contenido: (
      <>
        <p>Si tienes dudas que no resolviste aquí, puedes comunicarte con el equipo del proyecto:</p>
        <div className={styles['contacto-cards']}>
          <div className={styles['contacto-card']}>
            <span className={styles['contacto-ico']}>🏫</span>
            <strong>Instituto Tecnológico de Ciudad Valles</strong>
            <span>Tecnológico Nacional de México</span>
            <span>Ciudad Valles, San Luis Potosí</span>
          </div>
          <div className={styles['contacto-card']}>
            <span className={styles['contacto-ico']}>📋</span>
            <strong>Proyecto PEE-2025-G-369</strong>
            <span>Conservación de Maíz Nativo</span>
            <span>Huasteca Potosina · Etapa 1</span>
          </div>
        </div>
        <div className={styles['ayuda-highlight']} style={{ marginTop: 20 }}>
          <span className={styles['ayuda-highlight-ico']}>🌽</span>
          <span>Gracias por ser parte de este esfuerzo de preservar el maíz nativo de la Huasteca.</span>
        </div>
      </>
    ),
  },
]

// ─── Componente ───────────────────────────────────────────────────────────────
export default function AyudaPage() {
  const [activa, setActiva] = useState<string | null>(null)

  const toggle = (id: string) => setActiva(prev => prev === id ? null : id)

  return (
    <AdminShell>
      <div className={styles['ayuda-root']}>

        {/* Hero */}
        <div className={styles['ayuda-hero']}>
          <div className={styles['ayuda-hero-txt']}>
            <p className={styles['ayuda-hero-label']}>Centro de ayuda</p>
            <h1 className={styles['ayuda-hero-titulo']}>¿Cómo funciona la plataforma?</h1>
            <p className={styles['ayuda-hero-desc']}>
              Aquí encontrarás todo lo que necesitas saber para usar la Agroplataforma Maíz Nativo.
              Está pensado para todos, sin importar qué tan familiarizado estés con la tecnología.
            </p>
          </div>
          <div className={styles['ayuda-hero-ico']} aria-hidden="true">🌽</div>
        </div>

        {/* Índice rápido */}
        <div className={styles['ayuda-indice']}>
          {SECCIONES.map(s => (
            <button
              key={s.id}
              className={styles['ayuda-indice-btn']}
              onClick={() => {
                document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
            >
              <span>{s.icono}</span>
              <span>{s.titulo}</span>
            </button>
          ))}
        </div>

        {/* Acordeón de secciones */}
        <div className={styles['ayuda-acordeon']}>
          {SECCIONES.map(s => (
            <div key={s.id} id={s.id} className={[styles['ayuda-seccion'], activa === s.id ? styles['abierta'] : ''].filter(Boolean).join(' ')}>
              <button
                className={styles['ayuda-seccion-btn']}
                aria-expanded={activa === s.id}
                onClick={() => toggle(s.id)}
              >
                <span className={styles['ayuda-seccion-ico']}>{s.icono}</span>
                <span className={styles['ayuda-seccion-titulo']}>{s.titulo}</span>
                <span className={styles['ayuda-seccion-chevron']} aria-hidden="true">
                  {activa === s.id ? '▲' : '▾'}
                </span>
              </button>
              {activa === s.id && (
                <div className={styles['ayuda-seccion-body']}>
                  {s.contenido}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </AdminShell>
  )
}
