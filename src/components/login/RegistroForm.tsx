
import { FormEvent, useState } from 'react'
import styles from './LoginForm.module.css'
import { POST } from '@/lib/api'

type RegistroFormProps = {
    onRegistroExitoso?: () => void
}

export default function RegistroForm({ onRegistroExitoso }: RegistroFormProps) {
    const [registro, setRegistro] = useState({
        nombre: '',
        username: '',
        email: '',
        password: '',
        confirm: '',
    })

    const [mostrarPassword, setMostrarPassword] = useState(false)
    const [mostrarConfirm, setMostrarConfirm] = useState(false)
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState('')
    const [exito, setExito] = useState('')

    const actualizarCampo = (campo: keyof typeof registro, valor: string) => {
        setRegistro(prev => ({
            ...prev,
            [campo]: valor,
        }))
    }

    const registrar = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setExito('')

        if (registro.password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres.')
            return
        }

        if (registro.password !== registro.confirm) {
            setError('Las contraseñas no coinciden.')
            return
        }

        setCargando(true)

        try {
            await POST('/auth/register', {
                username: registro.username.trim(),
                email: registro.email.trim(),
                password: registro.password,
                nombre_completo: registro.nombre.trim(),
            })

            setRegistro({
                nombre: '',
                username: '',
                email: '',
                password: '',
                confirm: '',
            })

            setExito('Cuenta creada correctamente. Ya puedes iniciar sesión.')

            onRegistroExitoso?.()
        } catch (err) {
            const mensaje =
                err instanceof Error
                    ? err.message
                    : 'No se pudo crear la cuenta.'

            setError(mensaje)
        } finally {
            setCargando(false)
        }
    }

    return (
        <form autoComplete="on" onSubmit={registrar}>
            {error && (
                <div
                    role="alert"
                    style={{
                        marginBottom: 14,
                        padding: '10px 12px',
                        borderRadius: 6,
                        fontSize: 12,
                        color: 'var(--rojo)',
                        background: 'rgba(180, 50, 50, 0.08)',
                        border: '1px solid rgba(180, 50, 50, 0.2)',
                    }}
                >
                    {error}
                </div>
            )}

            {exito && (
                <div
                    role="status"
                    style={{
                        marginBottom: 14,
                        padding: '10px 12px',
                        borderRadius: 6,
                        fontSize: 12,
                        color: 'var(--verde)',
                        background: 'rgba(50, 140, 80, 0.08)',
                        border: '1px solid rgba(50, 140, 80, 0.2)',
                    }}
                >
                    {exito}
                </div>
            )}

            <div className={styles['form-row']}>
                <div className={styles['form-group']}>
                    <label>Nombre completo</label>
                    <div className={styles['input-wrap']}>
                        <span className={styles['input-ico']}>🧑</span>
                        <input
                            type="text"
                            placeholder="Nombre Apellido"
                            autoComplete="name"
                            value={registro.nombre}
                            onChange={e => actualizarCampo('nombre', e.target.value)}
                            required
                            disabled={cargando}
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
                            value={registro.username}
                            onChange={e => actualizarCampo('username', e.target.value)}
                            required
                            disabled={cargando}
                        />
                    </div>

                    <div
                        style={{
                            fontSize: 10,
                            color: 'var(--gris)',
                            marginTop: 4,
                            fontFamily: 'DM Mono,monospace',
                        }}
                    >
                        Solo letras, números, - y _
                    </div>
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
                        value={registro.email}
                        onChange={e => actualizarCampo('email', e.target.value)}
                        required
                        disabled={cargando}
                    />
                </div>
            </div>

            <div className={styles['form-row']}>
                <div className={styles['form-group']}>
                    <label>Contraseña *</label>
                    <div className={styles['input-wrap']}>
                        <span className={styles['input-ico']}>🔒</span>
                        <input
                            type={mostrarPassword ? 'text' : 'password'}
                            placeholder="Mínimo 8 caracteres"
                            autoComplete="new-password"
                            value={registro.password}
                            onChange={e => actualizarCampo('password', e.target.value)}
                            required
                            disabled={cargando}
                        />

                        <button
                            type="button"
                            className={styles['input-toggle']}
                            onClick={() => setMostrarPassword(prev => !prev)}
                            aria-label={
                                mostrarPassword
                                    ? 'Ocultar contraseña'
                                    : 'Mostrar contraseña'
                            }
                            disabled={cargando}
                        >
                            {mostrarPassword ? '🙈' : '👁'}
                        </button>
                    </div>
                </div>

                <div className={styles['form-group']}>
                    <label>Confirmar contraseña *</label>
                    <div className={styles['input-wrap']}>
                        <span className={styles['input-ico']}>🔒</span>
                        <input
                            type={mostrarConfirm ? 'text' : 'password'}
                            placeholder="Repite la contraseña"
                            autoComplete="new-password"
                            value={registro.confirm}
                            onChange={e => actualizarCampo('confirm', e.target.value)}
                            required
                            disabled={cargando}
                        />

                        <button
                            type="button"
                            className={styles['input-toggle']}
                            onClick={() => setMostrarConfirm(prev => !prev)}
                            aria-label={
                                mostrarConfirm
                                    ? 'Ocultar confirmación'
                                    : 'Mostrar confirmación'
                            }
                            disabled={cargando}
                        >
                            {mostrarConfirm ? '🙈' : '👁'}
                        </button>
                    </div>
                </div>
            </div>

            <div
                style={{
                    marginTop: 8,
                    marginBottom: 14,
                    fontSize: 10,
                    color: 'var(--gris)',
                    fontFamily: 'DM Mono,monospace',
                }}
            >
                El registro crea tu cuenta como <strong>Visualizador</strong>.
                Un administrador puede cambiar tu rol posteriormente.
            </div>

            <button
                type="submit"
                className={styles['btn-submit']}
                disabled={cargando}
            >
                {cargando && (
                    <div className={styles['spinner']}></div>
                )}

                <span>
                    {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
                </span>
            </button>
        </form>
    )
}

