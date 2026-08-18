import { useState } from 'react'
import styles from './LoginForm.module.css'

export default function RegistroForm() {

    const [registro, setRegistro] = useState({
        nombre: '', username: '', email: '', password: '', confirm: '', rol: 'investigador'
    })

    const seleccionarRol = (rol: string) => setRegistro(r => ({ ...r, rol }))

    return (
        <form autoComplete="on">
            <div className={styles['form-row']}>
                <div className={styles['form-group']}>
                    <label>Nombre completo</label>
                    <div className={styles['input-wrap']}>
                        <span className={styles['input-ico']}>🧑</span>
                        <input
                            type="text"
                            placeholder="Nombre Apellido"
                            autoComplete="name"
                            required
                        />
                    </div>
                </div>
                <div className={styles['form-group']}>
                    <label>Nombre de usuario *</label>
                    <div className={styles['input-wrap']}>
                        <span className={styles['input-ico']}>@</span>
                        <input 
                            type="text" 
                            placeholder="usuario123" 
                            autoComplete="username"
                            required
                        />
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--gris)', marginTop: 4, fontFamily: 'DM Mono,monospace' }} id="username-hint">Solo letras, números, - y _</div>
                </div>
            </div>
            <div className={styles['form-group']}>
                <label>Correo electrónico *</label>
                <div className={styles['input-wrap']}>
                    <span className={styles['input-ico']}>📧</span>
                    <input 
                        type="email" 
                        placeholder="correo@institución.mx" 
                        autoComplete="email" 
                        required
                    />
                </div>
            </div>
            <div className={styles['form-row']}>
                <div className={styles['form-group']}>
                    <label>Contraseña *</label>
                    <div className={styles['input-wrap']}>
                        <span className={styles['input-ico']}>🔒</span>
                        <input 
                            type="password" 
                            placeholder="Mínimo 8 caracteres" 
                            autoComplete="new-password" 
                            required
                        />
                        <button type="button" className={styles['input-toggle']}>👁</button>
                    </div>
                    <div className={styles['pwd-strength']}>
                        <div className={styles['pwd-bar-track']}><div className={styles['pwd-bar-fill']} id="pwd-bar" style={{ width: 0, background: 'var(--rojo)' }}></div></div>
                        <div className={styles['pwd-label']} id="pwd-label" style={{ color: 'var(--gris)' }}>—</div>
                    </div>
                </div>
                <div className={styles['form-group']}>
                    <label>Confirmar contraseña *</label>
                    <div className={styles['input-wrap']}>
                        <span className={styles['input-ico']}>🔒</span>
                        <input 
                            type="password" 
                            placeholder="Repite la contraseña" 
                            autoComplete="new-password" 
                            required
                        />
                        <button type="button" className={styles['input-toggle']}>👁</button>
                    </div>
                    <div style={{ fontSize: 10, marginTop: 4, fontFamily: 'DM Mono,monospace' }} id="confirm-hint"></div>
                </div>
            </div>
            {/* Selector de rol */}
            <div className={styles['form-group']}>
                <label>Tipo de acceso</label>
                <div className={styles['rol-grid']} id="rol-grid">
                    <label className={styles['rol-card'] + ' ' + (registro.rol === 'investigador' ? styles['selected'] : '')} onClick={() => seleccionarRol('investigador')}>
                        <input type="radio" name="rol" value="investigador" checked={registro.rol === 'investigador'} readOnly />
                        <span className={styles['rol-ico']}>🔬</span>
                        <span className={styles['rol-nombre']}>Investigador</span>
                        <span className={styles['rol-desc']}>Captura y edición completa de datos</span>
                    </label>
                    <label className={styles['rol-card'] + ' ' + (registro.rol === 'tecnico_campo' ? styles['selected'] : '')} onClick={() => seleccionarRol('tecnico_campo')}>
                        <input type="radio" name="rol" value="tecnico_campo" checked={registro.rol === 'tecnico_campo'} readOnly />
                        <span className={styles['rol-ico']}>🌾</span>
                        <span className={styles['rol-nombre']}>Técnico de campo</span>
                        <span className={styles['rol-desc']}>Registro en visitas de campo</span>
                    </label>
                    <label className={styles['rol-card'] + ' ' + (registro.rol === 'visualizador' ? styles['selected'] : '')} onClick={() => seleccionarRol('visualizador')}>
                        <input type="radio" name="rol" value="visualizador" checked={registro.rol === 'visualizador'} readOnly />
                        <span className={styles['rol-ico']}>📊</span>
                        <span className={styles['rol-nombre']}>Consultor</span>
                        <span className={styles['rol-desc']}>Solo lectura de datos y mapas</span>
                    </label>
                    <label className={styles['rol-card'] + ' ' + (registro.rol === 'productor' ? styles['selected'] : '')} onClick={() => seleccionarRol('productor')}>
                        <input type="radio" name="rol" value="productor" checked={registro.rol === 'productor'} readOnly />
                        <span className={styles['rol-ico']}>🌽</span>
                        <span className={styles['rol-nombre']}>Productor</span>
                        <span className={styles['rol-desc']}>Ver mi propio perfil y parcelas</span>
                    </label>
                </div>
                <div style={{ fontSize: 10, color: 'var(--gris)', marginTop: 6, fontFamily: 'DM Mono,monospace' }}>⚠ El rol de Administrador lo asigna el equipo del proyecto</div>
            </div>
            <button className={styles['btn-submit']} id="btn-reg">
                <div className={styles['spinner']} id="sp-reg"></div>
                <span id="lbl-reg">Crear cuenta</span>
            </button>
        </form>
    )
}