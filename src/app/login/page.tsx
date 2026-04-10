'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { getToken, getUsuario } from '@/lib/auth'
import { ROL_HOME } from '@/types'
import styles from './login.module.css'


export default function LoginPage() {
  const [mounted, setMounted] = useState(false)
  // Tabs: 'login' o 'registro'
  const [tab, setTab] = useState<'login'|'registro'>('login')

  // Estado de sesión activa (simulado)
  const [sesionActiva, setSesionActiva] = useState(false)

  // Campos login
  const [identificador, setIdentificador] = useState('')
  const [password, setPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  // Campos registro
  const [registro, setRegistro] = useState({
    nombre: '', username: '', email: '', password: '', confirm: '', rol: 'investigador'
  })

  // Login real
  const { login, addToast } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showRecoveryInfo, setShowRecoveryInfo] = useState(false)
  // Estado de transición de login/logout: 'none' | 'login' | 'logout'
  const [showLoginTransition, setShowLoginTransition] = useState<'none' | 'login' | 'logout'>('none')

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    // El login no manipula el modo global, solo usa colores fijos propios
    const usuarioActual = getUsuario()
    if (getToken() && usuarioActual) {
      router.replace(ROL_HOME[usuarioActual.rol] ?? '/dashboard')
    }
    // Mostrar aviso si el token expiró
    const params = new URLSearchParams(window.location.search)
    if (params.get('expired') === '1') {
      addToast('Tu sesión expiró, vuelve a iniciar sesión.', 'err')
      params.delete('expired')
      const nextQuery = params.toString()
      const nextUrl = nextQuery ? `${window.location.pathname}?${nextQuery}` : window.location.pathname
      window.history.replaceState({}, '', nextUrl)
    }
  }, [router, addToast])

  const cambiarTab = (t: 'login'|'registro') => { setTab(t); setShowRecoveryInfo(false) }
  const mostrarRecuperacion = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setShowRecoveryInfo(true)
  }
  const cerrarSesion = () => setSesionActiva(false)
  const seleccionarRol = (rol: string) => setRegistro(r => ({...r, rol}))

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setShowLoginTransition('login')
    let loginExitoso = false
    try {
      const data = await login({ identificador, password })
      loginExitoso = true
      addToast('Sesión iniciada correctamente', 'ok')
      const destino = ROL_HOME[data.usuario.rol] ?? '/dashboard'
      await new Promise(resolve => setTimeout(resolve, 2000))
      router.push(destino)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión'
      addToast(msg, 'err')
      setShowLoginTransition('none')
    } finally {
      if (!loginExitoso) setLoading(false)
    }
  }

  return (
    <>
      <div
        className={styles['login-root']}
        data-login
      >
        <div className={styles['bg-deco']} />
        <svg className={styles['maiz-deco']} viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg">
        <path d="M60 180 Q20 140 10 90 Q40 110 60 150 Z" fill="#4A8C64"/>
        <path d="M60 180 Q100 140 110 90 Q80 110 60 150 Z" fill="#2A5C3F"/>
        <ellipse cx="60" cy="95" rx="22" ry="55" fill="#D4922A"/>
        <ellipse cx="48" cy="60" rx="4" ry="5" fill="#F0B429"/>
        <ellipse cx="56" cy="58" rx="4" ry="5" fill="#E8A020"/>
        <ellipse cx="64" cy="58" rx="4" ry="5" fill="#F0B429"/>
        <ellipse cx="72" cy="60" rx="4" ry="5" fill="#E8A020"/>
        <ellipse cx="46" cy="72" rx="4" ry="5" fill="#F2C040"/>
        <ellipse cx="54" cy="70" rx="4" ry="5" fill="#E8A020"/>
        <ellipse cx="62" cy="70" rx="4" ry="5" fill="#F0B429"/>
        <ellipse cx="70" cy="70" rx="4" ry="5" fill="#F2C040"/>
        <ellipse cx="78" cy="72" rx="4" ry="5" fill="#E8A020"/>
        <ellipse cx="44" cy="84" rx="4" ry="5" fill="#E8A020"/>
        <ellipse cx="52" cy="82" rx="4" ry="5" fill="#F0B429"/>
        <ellipse cx="60" cy="82" rx="4" ry="5" fill="#F2C040"/>
        <ellipse cx="68" cy="82" rx="4" ry="5" fill="#E8A020"/>
        <ellipse cx="76" cy="84" rx="4" ry="5" fill="#F0B429"/>
        <ellipse cx="44" cy="96" rx="4" ry="5" fill="#F0B429"/>
        <ellipse cx="52" cy="94" rx="4" ry="5" fill="#E8A020"/>
        <ellipse cx="60" cy="94" rx="4" ry="5" fill="#F2C040"/>
        <ellipse cx="68" cy="94" rx="4" ry="5" fill="#F0B429"/>
        <ellipse cx="76" cy="96" rx="4" ry="5" fill="#E8A020"/>
        <ellipse cx="48" cy="120" rx="4" ry="5" fill="#F0B429"/>
        <ellipse cx="56" cy="118" rx="4" ry="5" fill="#E8A020"/>
        <ellipse cx="64" cy="118" rx="4" ry="5" fill="#F2C040"/>
        <ellipse cx="72" cy="120" rx="4" ry="5" fill="#F0B429"/>
      </svg>

        <div className={styles['card-wrap']}>
        {/* Logo */}
        <div className={styles['logo-area']}>
          <span className={styles['logo-ico']}>🌽</span>
          <span className={styles['logo-titulo']}>Agroplataforma<br/><em style={{fontStyle:'italic',fontWeight:700}}>Maíz Nativo</em></span>
          <div className={styles['logo-sub'] + ' ' + styles['subtitleContrast']}>Huasteca Potosina · IT Ciudad Valles</div>
        </div>
      {/* Botón flotante de inicio y modo */}
      {mounted && (
        <div className={styles['flotante-wrap']}>
          <Link href="/productores" className={styles['btn-flotante']}>
            <span aria-hidden="true" style={{fontSize:18}}>🏠</span>
            Ir a la plataforma
          </Link>
        </div>
      )}

        {/* Sesión activa (simulada) */}
        {sesionActiva && (
          <div className={`${styles['sesion-activa']} ${styles['visible']}`} id="sesion-activa">
            <div className={styles['sesion-avatar']} id="sa-avatar">?</div>
            <div className={styles['sesion-nombre']} id="sa-nombre">—</div>
            <div className={styles['sesion-rol']} id="sa-rol">—</div>
            <div className={styles['sesion-btns']}>
              <Link className={styles['btn-ir']} href="/productores">🌱 Ir a la plataforma</Link>
              <a className={styles['btn-ir']} href="/catalogos" style={{background:'var(--maiz)',color:'var(--tierra)'}}>📋 Catálogos</a>
              <button className={styles['btn-salir']} onClick={cerrarSesion}>✕ Cerrar sesión</button>
            </div>
          </div>
        )}

        {/* Card login/registro */}
        <div className={styles['card']} id="card-auth">
          {/* Tabs */}
          <div className={styles['card-tabs']}>
            <button className={`${styles['tab-btn']} ${tab==='login'?styles['active']:''}`} onClick={()=>cambiarTab('login')}>Iniciar sesión</button>
            <button
              className={styles['tab-btn']}
              disabled
              title="El registro está cerrado por el administrador"
              style={{ opacity: 0.45, cursor: 'not-allowed', position: 'relative' }}
            >
              Crear cuenta
              <span style={{
                fontSize: 9, fontFamily: 'DM Mono,monospace', fontWeight: 700,
                background: 'var(--gris)', color: '#fff', padding: '1px 5px',
                borderRadius: 4, marginLeft: 5, letterSpacing: '.04em',
              }}>CERRADO</span>
            </button>
          </div>

          {/* Panel login */}
          <div className={`${styles['panel']} ${tab==='login'?styles['active']:''}`} id="panel-login">
            {/* Alertas */}
            <div className={styles['alerta'] + ' ' + styles['alerta-err']} style={{display:'none'}} id="err-login">
              <span className={styles['alerta-ico']}>⚠</span>
              <span id="err-login-txt">Error</span>
            </div>
            <div className={styles['alerta'] + ' ' + styles['alerta-ok']} style={{display:'none'}} id="ok-login">
              <span className={styles['alerta-ico']}>✓</span>
              <span id="ok-login-txt">Sesión iniciada</span>
            </div>

            <form onSubmit={handleLogin} autoComplete="on">
              <div className={styles['form-group']}>
                <label>Usuario o correo electrónico</label>
                <div className={styles['input-wrap']}>
                  <span className={styles['input-ico']}>👤</span>
                  <input
                    type="text"
                    placeholder="usuario o correo@ejemplo.com"
                    autoComplete="username"
                    value={identificador}
                    onChange={e => setIdentificador(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              <div className={styles['form-group']}>
                <label>Contraseña</label>
                <div className={styles['input-wrap']}>
                  <span className={styles['input-ico']}>🔒</span>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className={styles['input-toggle']}
                    aria-label={showLoginPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    title={showLoginPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    onClick={() => setShowLoginPassword(v => !v)}
                  >
                    {showLoginPassword ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              {showRecoveryInfo && (
                <div className={styles['alerta'] + ' ' + styles['alerta-ok']} style={{display:'flex',marginBottom:8}}>
                  <span className={styles['alerta-ico']}>ℹ️</span>
                  <span>Escríbenos a soporte@agromaiz.mx para recuperar tu acceso mientras habilitamos el flujo automático.</span>
                </div>
              )}
              <div style={{display:'flex',justifyContent:'flex-end',marginTop:-8,marginBottom:4}}>
                <a href="#" className={styles['footer-link']} style={{fontSize:12}} onClick={mostrarRecuperacion}>¿Olvidaste tu contraseña?</a>
              </div>
              <button className={styles['btn-submit']} id="btn-login" disabled={loading} type="submit">
                {loading && <span className={styles['maiz-spinner']} id="sp-login" aria-hidden>🌽</span>}
                <span id="lbl-login">{loading ? 'Iniciando sesión...' : 'Entrar a la plataforma'}</span>
              </button>
              <div className={styles['divider']}>o</div>
              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  try {
                    const data = await login({ identificador: 'invitado', password: 'invitado' });
                    addToast('Sesión iniciada como invitado', 'ok');
                    const destino = ROL_HOME[data.usuario.rol] ?? '/dashboard';
                    setShowLoginTransition('login');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    router.push(destino);
                  } catch (err) {
                    const msg = err instanceof Error ? err.message : 'Error al entrar como invitado';
                    addToast(msg, 'err');
                  } finally {
                    setLoading(false);
                  }
                }}
                style={{
                  width: '100%', padding: '9px 16px', border: '1.5px dashed var(--borde-dark, #ccc)',
                  borderRadius: 8, background: 'transparent', cursor: 'pointer',
                  fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: 13,
                  color: 'var(--gris)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 8, transition: 'border-color 0.15s',
                }}
                title="El acceso como invitado solo permite ver el panel principal"
                disabled={loading}
              >
                <span>👁️</span> Entrar como invitado
              </button>
            </form>
          </div>

          {/* Panel registro */}
          <div className={`${styles['panel']} ${tab==='registro'?styles['active']:''}`} id="panel-registro">
            {/* Alertas */}
            <div className={styles['alerta'] + ' ' + styles['alerta-err']} style={{display:'none'}} id="err-reg">
              <span className={styles['alerta-ico']}>⚠</span>
              <span id="err-reg-txt">Error</span>
            </div>
            <div className={styles['alerta'] + ' ' + styles['alerta-ok']} style={{display:'none'}} id="ok-reg">
              <span className={styles['alerta-ico']}>✓</span>
              <span id="ok-reg-txt">Cuenta creada</span>
            </div>
            <div className={styles['form-row']}>
              <div className={styles['form-group']}>
                <label>Nombre completo</label>
                <div className={styles['input-wrap']}>
                  <span className={styles['input-ico']}>🧑</span>
                  <input type="text" placeholder="Nombre Apellido" autoComplete="name" />
                </div>
              </div>
              <div className={styles['form-group']}>
                <label>Nombre de usuario *</label>
                <div className={styles['input-wrap']}>
                  <span className={styles['input-ico']}>@</span>
                  <input type="text" placeholder="usuario123" autoComplete="username" />
                </div>
                <div style={{fontSize:10,color:'var(--gris)',marginTop:4,fontFamily:'DM Mono,monospace'}} id="username-hint">Solo letras, números, - y _</div>
              </div>
            </div>
            <div className={styles['form-group']}>
              <label>Correo electrónico *</label>
              <div className={styles['input-wrap']}>
                <span className={styles['input-ico']}>📧</span>
                <input type="email" placeholder="correo@institución.mx" autoComplete="email" />
              </div>
            </div>
            <div className={styles['form-row']}>
              <div className={styles['form-group']}>
                <label>Contraseña *</label>
                <div className={styles['input-wrap']}>
                  <span className={styles['input-ico']}>🔒</span>
                  <input type="password" placeholder="Mínimo 8 caracteres" autoComplete="new-password" />
                  <button type="button" className={styles['input-toggle']}>👁</button>
                </div>
                <div className={styles['pwd-strength']}>
                  <div className={styles['pwd-bar-track']}><div className={styles['pwd-bar-fill']} id="pwd-bar" style={{width:0,background:'var(--rojo)'}}></div></div>
                  <div className={styles['pwd-label']} id="pwd-label" style={{color:'var(--gris)'}}>—</div>
                </div>
              </div>
              <div className={styles['form-group']}>
                <label>Confirmar contraseña *</label>
                <div className={styles['input-wrap']}>
                  <span className={styles['input-ico']}>🔒</span>
                  <input type="password" placeholder="Repite la contraseña" autoComplete="new-password" />
                  <button type="button" className={styles['input-toggle']}>👁</button>
                </div>
                <div style={{fontSize:10,marginTop:4,fontFamily:'DM Mono,monospace'}} id="confirm-hint"></div>
              </div>
            </div>
            {/* Selector de rol */}
            <div className={styles['form-group']}>
              <label>Tipo de acceso</label>
              <div className={styles['rol-grid']} id="rol-grid">
                <label className={styles['rol-card'] + ' ' + (registro.rol==='investigador'?styles['selected']:'')} onClick={()=>seleccionarRol('investigador')}>
                  <input type="radio" name="rol" value="investigador" checked={registro.rol==='investigador'} readOnly />
                  <span className={styles['rol-ico']}>🔬</span>
                  <span className={styles['rol-nombre']}>Investigador</span>
                  <span className={styles['rol-desc']}>Captura y edición completa de datos</span>
                </label>
                <label className={styles['rol-card'] + ' ' + (registro.rol==='tecnico_campo'?styles['selected']:'')} onClick={()=>seleccionarRol('tecnico_campo')}>
                  <input type="radio" name="rol" value="tecnico_campo" checked={registro.rol==='tecnico_campo'} readOnly />
                  <span className={styles['rol-ico']}>🌾</span>
                  <span className={styles['rol-nombre']}>Técnico de campo</span>
                  <span className={styles['rol-desc']}>Registro en visitas de campo</span>
                </label>
                <label className={styles['rol-card'] + ' ' + (registro.rol==='visualizador'?styles['selected']:'')} onClick={()=>seleccionarRol('visualizador')}>
                  <input type="radio" name="rol" value="visualizador" checked={registro.rol==='visualizador'} readOnly />
                  <span className={styles['rol-ico']}>📊</span>
                  <span className={styles['rol-nombre']}>Consultor</span>
                  <span className={styles['rol-desc']}>Solo lectura de datos y mapas</span>
                </label>
                <label className={styles['rol-card'] + ' ' + (registro.rol==='productor'?styles['selected']:'')} onClick={()=>seleccionarRol('productor')}>
                  <input type="radio" name="rol" value="productor" checked={registro.rol==='productor'} readOnly />
                  <span className={styles['rol-ico']}>🌽</span>
                  <span className={styles['rol-nombre']}>Productor</span>
                  <span className={styles['rol-desc']}>Ver mi propio perfil y parcelas</span>
                </label>
              </div>
              <div style={{fontSize:10,color:'var(--gris)',marginTop:6,fontFamily:'DM Mono,monospace'}}>⚠ El rol de Administrador lo asigna el equipo del proyecto</div>
            </div>
            <button className={styles['btn-submit']} id="btn-reg">
              <div className={styles['spinner']} id="sp-reg"></div>
              <span id="lbl-reg">Crear cuenta</span>
            </button>
          </div>

          {/* Footer */}
          <div className={styles['card-footer']}>
            <span className={styles['footer-txt']}>PEE-2025-G-369 · IT Ciudad Valles</span>
          </div>
        </div>
        </div>
      </div>

      {/* Footer institucional */}
      <footer className={styles['body-footer']}>
        <div className={styles['inst-logos']}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/LOGOTECNM.png" alt="TecNM" title="Tecnológico Nacional de México" height={36} />
          <div className={styles['inst-sep']} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/secihti.png" alt="Secihti" title="Secihti 2025" height={28} />
          <div className={styles['inst-sep']} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/logotec.png" alt="IT Ciudad Valles" title="Instituto Tecnológico de Ciudad Valles" height={36} />
        </div>
      </footer>

      {/* Botón flotante eliminado para evitar duplicidad, solo debe haber los dos principales en la esquina */}

      {showLoginTransition === 'login' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(32,33,31,0.93)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className={styles['maiz-spinner']} style={{fontSize: 54, marginBottom: 24, filter: 'drop-shadow(0 0 32px #ffe066) drop-shadow(0 0 12px #fffbe8)'}}>🌽</span>
          <div style={{
            color: '#fffbe8', fontSize: 22, fontWeight: 800, letterSpacing: '.04em', textAlign: 'center',
            fontFamily: 'Nunito, Fraunces, Arial, sans-serif',
            textShadow: '0 2px 12px #000, 0 0 24px #ffe066',
          }}>
            Iniciando sesión...
          </div>
        </div>
      )}
      {showLoginTransition === 'logout' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(32,33,31,0.93)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className={styles['maiz-spinner']} style={{fontSize: 54, marginBottom: 24, filter: 'drop-shadow(0 0 32px #ffe066) drop-shadow(0 0 12px #fffbe8)'}}>🌽</span>
          <div style={{
            color: '#fffbe8', fontSize: 22, fontWeight: 800, letterSpacing: '.04em', textAlign: 'center',
            fontFamily: 'Nunito, Fraunces, Arial, sans-serif',
            textShadow: '0 2px 12px #000, 0 0 24px #ffe066',
          }}>
            Cerrando sesión...
          </div>
        </div>
      )}
    </>
  )
}
