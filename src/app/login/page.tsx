'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getToken, getUsuario } from '@/lib/auth'
import { ROL_HOME } from '@/types'
import styles from './login.module.css'

export default function LoginPage() {
  // Tabs: 'login' o 'registro'
  const [tab, setTab] = useState<'login'|'registro'>('login')

  // Estado de sesión activa (simulado)
  const [sesionActiva, setSesionActiva] = useState(false)

  // Campos login
  const [identificador, setIdentificador] = useState('')
  const [password, setPassword] = useState('')

  // Campos registro
  const [registro, setRegistro] = useState({
    nombre: '', username: '', email: '', password: '', confirm: '', rol: 'investigador'
  })


  // Login real
  const { login } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  useEffect(() => {
    // Asegurar que el login siempre se vea en modo claro,
    // independientemente de si el dark mode quedó activo de una sesión previa
    document.documentElement.classList.remove('dark')

    if (getToken() && getUsuario()) {
      router.replace('/dashboard')
    }
    // Mostrar aviso si el token expiró
    const params = new URLSearchParams(window.location.search)
    if (params.get('expired') === '1') {
      setError('Tu sesión expiró, vuelve a iniciar sesión.')
    }
  }, [router])

  const cambiarTab = (t: 'login'|'registro') => { setTab(t); setError(''); setOk(''); }
  const mostrarRecuperacion = () => alert('Funcionalidad de recuperación no implementada')
  const cerrarSesion = () => setSesionActiva(false)
  const seleccionarRol = (rol: string) => setRegistro(r => ({...r, rol}))

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setOk('')
    setLoading(true)
    try {
      const data = await login({ identificador, password })
      setOk('Sesión iniciada')
      const destino = ROL_HOME[data.usuario.rol] ?? '/dashboard'
      setTimeout(() => router.push(destino), 900)
    } catch (err: any) {
      setError(err?.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className={styles['login-root']}>
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
          <div className={styles['logo-titulo']}>Agroplataforma<br/><em style={{fontStyle:'italic',fontWeight:700}}>Maíz Nativo</em></div>
          <div className={styles['logo-sub']}>Huasteca Potosina · IT Ciudad Valles</div>
        </div>

        {/* Sesión activa (simulada) */}
        {sesionActiva && (
          <div className={`${styles['sesion-activa']} ${styles['visible']}`} id="sesion-activa">
            <div className={styles['sesion-avatar']} id="sa-avatar">?</div>
            <div className={styles['sesion-nombre']} id="sa-nombre">—</div>
            <div className={styles['sesion-rol']} id="sa-rol">—</div>
            <div className={styles['sesion-btns']}>
              <a className={styles['btn-ir']} href="/productores">🌱 Ir a la plataforma</a>
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
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button type="button" className={styles['input-toggle']}>👁</button>
                </div>
              </div>
              {error && <div className={styles['alerta'] + ' ' + styles['alerta-err']} style={{display:'flex',marginBottom:8}}><span className={styles['alerta-ico']}>⚠</span><span>{error}</span></div>}
              {ok && <div className={styles['alerta'] + ' ' + styles['alerta-ok']} style={{display:'flex',marginBottom:8}}><span className={styles['alerta-ico']}>✓</span><span>{ok}</span></div>}
              <div style={{display:'flex',justifyContent:'flex-end',marginTop:-8,marginBottom:4}}>
                <a href="#" className={styles['footer-link']} style={{fontSize:12}} onClick={mostrarRecuperacion}>¿Olvidaste tu contraseña?</a>
              </div>
              <button className={styles['btn-submit']} id="btn-login" disabled={loading} type="submit">
                {loading && <div className={styles['spinner']} id="sp-login"></div>}
                <span id="lbl-login">{loading ? 'Entrando...' : 'Entrar a la plataforma'}</span>
              </button>
              <div className={styles['divider']}>o</div>
              <button
                type="button"
                onClick={() => { setIdentificador('invitado'); setPassword('invitado'); }}
                style={{
                  width: '100%', padding: '9px 16px', border: '1.5px dashed var(--borde-dark, #ccc)',
                  borderRadius: 8, background: 'transparent', cursor: 'pointer',
                  fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: 13,
                  color: 'var(--gris)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 8, transition: 'border-color 0.15s',
                }}
                title="El acceso como invitado solo permite ver el panel principal"
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
            <a href="/" className={styles['footer-link']}>← Inicio</a>
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

      {/* Botón flotante */}
      <a href="/" className={styles['btn-flotante']} title="Volver al inicio">
        🌽 Inicio
      </a>
    </>
  )
}
