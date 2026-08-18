import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ROL_HOME } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import styles from './LoginForm.module.css'

type Props = {
  onLoginStart: () => void
}

export default function LoginForm({ onLoginStart }: Props) {

    const [identificador, setIdentificador] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [showLoginPassword, setShowLoginPassword] = useState(false)

    const { login, addToast } = useAuth()
    const router = useRouter()

    const mostrarRecuperacion = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        addToast('Escríbenos a soporte@agromaiz.mx para recuperar tu acceso mientras habilitamos el flujo automático.', 'ok');
    }

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        let loginExitoso = false
        try {
            const data = await login({ identificador, password })
            loginExitoso = true
            addToast('Sesión iniciada correctamente', 'ok')
            onLoginStart()
            const destino = ROL_HOME[data.usuario.rol] ?? '/dashboard'
            await new Promise(resolve => setTimeout(resolve, 2000))
            router.push(destino)
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Error al iniciar sesión'
            addToast(msg, 'err')
        } finally {
            if (!loginExitoso) setLoading(false)
        }
    }

    return (
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
                        required
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
                        required
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -8, marginBottom: 4 }}>
                <a href="#" className={styles['footer-link']} style={{ fontSize: 12 }} onClick={mostrarRecuperacion}>¿Olvidaste tu contraseña?</a>
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
                        onLoginStart();
                        const destino = ROL_HOME[data.usuario.rol] ?? '/dashboard';
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
    );
}