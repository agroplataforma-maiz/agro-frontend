"use client";

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import AdminShell from '@/components/dashboard/AdminShell';
import { GET, PUT } from '@/lib/api';
import { iniciales } from '@/lib/auth';
import { ROL_COLOR } from '@/types';
import type { Usuario } from '@/types';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import { useRouter } from 'next/navigation'
import styles from './mi-perfil.module.css';

const ROL_LABEL: Record<string, string> = {
  administrador: '👑 Administrador',
  investigador:  '🔬 Investigador',
  tecnico_campo: '🌾 Técnico de campo',
  visualizador:  '📊 Consultor',
  productor:     '🌽 Productor',
  invitado:      '👁️ Invitado',
};

type Tab = 'info' | 'password';
type UsuarioExtendido = Usuario & {
  date_joined?: string;
  creado_en?: string;
  fecha_creacion?: string;
};

export default function MiPerfilPage() {
  const router = useRouter();
  const usuario   = useAppStore(s => s.usuario);
  const setUsuario = useAppStore(s => s.setUsuario);
  const addToast  = useAppStore(s => s.addToast);

  const esUsuarioInvitado = (usuario?.username ?? '').trim().toLowerCase() === 'invitado';
  const [tab, setTab]         = useState<Tab>('info');
  const [editando, setEditando] = useState(false);
  const [loading, setLoading]  = useState(false);

  // Form info
  const [nombre,   setNombre]   = useState(usuario?.nombre_completo ?? '');
  const [username, setUsername] = useState(usuario?.username ?? '');
  const [email,    setEmail]    = useState(usuario?.email ?? '');

  // Form contraseña
  const [passActual,    setPassActual]    = useState('');
  const [passNueva,     setPassNueva]     = useState('');
  const [passConfirm,   setPassConfirm]   = useState('');
  const [passError,     setPassError]     = useState('');
  const usuarioExt = usuario as UsuarioExtendido | null;

  useEffect(() => {
    if (!usuario) return;

    const tieneUltimoAcceso = Boolean(usuario.ultimo_acceso || usuario.last_login);
    const tieneFechaRegistro = Boolean(
      usuario.fecha_registro ||
      usuarioExt?.date_joined ||
      usuarioExt?.created_at ||
      usuarioExt?.fecha_creacion
    );

    if (tieneUltimoAcceso && tieneFechaRegistro) return;

    let cancelado = false;

    (async () => {
      try {
        const me = await GET('/auth/me');
        if (!cancelado && me && typeof me === 'object') {
          setUsuario({ ...usuario, ...(me as object) });
        }
      } catch {
        // Si falla el refresco, se mantiene la data ya cargada en sesión.
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [usuario, setUsuario]);

  // Si no hay usuario, redirige a inicio (evita pantalla de carga infinita tras logout)
  if (!usuario) {
    if (typeof window !== 'undefined') {
      router.replace('/login')
    }
    return null
  }

  const ini   = iniciales(usuario.nombre_completo || usuario.username);
  const color = ROL_COLOR[usuario.rol] ?? '#888';
  const ultimoAccesoRaw = usuario.ultimo_acceso ?? usuario.last_login ?? null;
  const fechaRegistroRaw =
    usuario.fecha_registro ??
    usuarioExt?.date_joined ??
    usuarioExt?.creado_en ??
    usuarioExt?.fecha_creacion ??
    null;

  const formatearFechaConHora = (valor: string | null) => {
    if (!valor) return '—';
    return new Date(valor).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // ── Guardar información ────────────────────────────────────────────────────
  async function guardarInfo(e: React.FormEvent) {
    e.preventDefault();
    if (esUsuarioInvitado) {
      addToast('El usuario invitado no puede modificar sus datos.', 'err');
      return;
    }
    setLoading(true);
    try {
      const updated = await PUT('/auth/me', {
        nombre_completo: nombre,
        username,
        email,
      });
      setUsuario({ ...usuario!, ...(updated as object) });
      addToast('Perfil actualizado', 'ok');
      setEditando(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar perfil';
      addToast(msg, 'err');
    } finally {
      setLoading(false);
    }
  }

  // ── Cambiar contraseña ────────────────────────────────────────────────────
  async function cambiarPassword(e: React.FormEvent) {
    e.preventDefault();
    if (esUsuarioInvitado) {
      addToast('El usuario invitado no puede cambiar su contraseña.', 'err');
      return;
    }
    setPassError('');
    if (passNueva.length < 8) { setPassError('La contraseña debe tener al menos 8 caracteres.'); return; }
    if (passNueva !== passConfirm) { setPassError('Las contraseñas no coinciden.'); return; }
    setLoading(true);
    try {
      await PUT('/auth/me/cambiar-password', {
        password_actual: passActual,
        password_nuevo:  passNueva,
      });
      addToast('Contraseña actualizada', 'ok');
      setPassActual(''); setPassNueva(''); setPassConfirm('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cambiar contraseña';
      addToast(msg, 'err');
    } finally {
      setLoading(false);
    }
  }

  const diasMiembro = fechaRegistroRaw
    ? Math.floor((Date.now() - new Date(fechaRegistroRaw).getTime()) / 86400000)
    : null;

  return (
    <AdminShell>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.avatar} style={{ background: color }}>{ini}</div>
          <div className={styles.heroInfo}>
            <p className={styles.heroLabel}>Mi cuenta · Ajustes de perfil</p>
            <h1 className={styles.heroNombre}>
              <em>{usuario.nombre_completo?.split(' ')[0] || usuario.username}</em>
              {usuario.nombre_completo?.split(' ').slice(1).join(' ')
                ? ' ' + usuario.nombre_completo!.split(' ').slice(1).join(' ')
                : ''}
            </h1>
            <div className={styles.heroBadges}>
              <span className={styles.badgeRol}>{ROL_LABEL[usuario.rol] ?? usuario.rol}</span>
              <span className={styles.badgeRol}>@{usuario.username}</span>
            </div>
          </div>
        </div>
        <div className={styles.heroStats}>
          {diasMiembro !== null && (
            <div className={styles.heroStat}>
              <span className={styles.heroStatVal}>{diasMiembro}</span>
              <span className={styles.heroStatLbl}>días en plataforma</span>
            </div>
          )}
          <div className={styles.heroStat}>
            <span className={styles.heroStatVal}>
              {formatearFechaConHora(ultimoAccesoRaw)}
            </span>
            <span className={styles.heroStatLbl}>último acceso</span>
          </div>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className={styles.tabs}>
        <button className={`${styles.tab}${tab === 'info'     ? ' ' + styles.tabActive : ''}`} onClick={() => setTab('info')}>👤 Información</button>
        {!esUsuarioInvitado && (
          <button className={`${styles.tab}${tab === 'password' ? ' ' + styles.tabActive : ''}`} onClick={() => setTab('password')}>🔑 Contraseña</button>
        )}
      </div>

      {/* ── Tab: Información ─────────────────────────────────────────────── */}
      {tab === 'info' && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitulo}>Información personal</h2>
              <p className={styles.cardSub}>Datos de tu cuenta en la plataforma</p>
            </div>
            {!editando && !esUsuarioInvitado && (
              <Button variante="ghost" onClick={() => {
                setEditando(true);
                setNombre(usuario.nombre_completo ?? '');
                setUsername(usuario.username);
                setEmail(usuario.email ?? '');
              }}>✏️ Editar</Button>
            )}
          </div>

          {esUsuarioInvitado && (
            <div className={styles.aviso}>
              🔒 Tu perfil está en modo lectura: como invitado no puedes modificar tus datos ni cambiar la contraseña.
            </div>
          )}

          {editando ? (
            <form className={styles.form} onSubmit={guardarInfo}>
              <div className={styles.grid2}>
                <Field label="Nombre completo" name="nombre" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre completo" required />
                <Field label="Username" name="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required />
              </div>
              <Field label="Correo electrónico" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@ejemplo.com" />
              <div className={styles.formActions}>
                <Button variante="secundario" type="button" onClick={() => setEditando(false)}>Cancelar</Button>
                <Button variante="primario" type="submit" cargando={loading}>Guardar cambios</Button>
              </div>
            </form>
          ) : (
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Nombre completo</span>
                <span className={styles.infoValor}>{usuario.nombre_completo || '—'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Username</span>
                <span className={`${styles.infoValor} ${styles.mono}`}>@{usuario.username}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Correo electrónico</span>
                <span className={styles.infoValor}>{usuario.email || '—'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Rol asignado</span>
                <span className={styles.infoValor}>{ROL_LABEL[usuario.rol] ?? usuario.rol}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Último acceso</span>
                <span className={styles.infoValor}>
                  {formatearFechaConHora(ultimoAccesoRaw)}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Miembro desde</span>
                <span className={styles.infoValor}>
                  {fechaRegistroRaw
                    ? new Date(fechaRegistroRaw).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
                    : '—'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Contraseña ──────────────────────────────────────────────── */}
      {tab === 'password' && !esUsuarioInvitado && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitulo}>Cambiar contraseña</h2>
              <p className={styles.cardSub}>Usa una contraseña segura de al menos 8 caracteres</p>
            </div>
          </div>
          <div className={styles.aviso}>
            ⚠️ Por seguridad, deberás iniciar sesión nuevamente después de cambiar tu contraseña.
          </div>
          <form className={styles.form} onSubmit={cambiarPassword}>
            <Field label="Contraseña actual" name="pass_actual" type="password" value={passActual} onChange={e => setPassActual(e.target.value)} placeholder="••••••••" required />
            <div className={styles.grid2}>
              <Field label="Nueva contraseña" name="pass_nueva" type="password" value={passNueva} onChange={e => setPassNueva(e.target.value)} placeholder="••••••••" required />
              <Field label="Confirmar contraseña" name="pass_confirm" type="password" value={passConfirm} onChange={e => setPassConfirm(e.target.value)} placeholder="••••••••" required />
            </div>
            {passError && <p className={styles.passError}>⚠️ {passError}</p>}
            <div className={styles.formActions}>
              <Button variante="primario" type="submit" cargando={loading}>🔑 Cambiar contraseña</Button>
            </div>
          </form>
        </div>
      )}
    </AdminShell>
  );
}
