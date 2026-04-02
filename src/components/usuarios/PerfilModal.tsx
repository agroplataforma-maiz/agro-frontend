import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Field from '../ui/Field';
import { PUT, GET } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';
import type { Usuario } from '@/types';

interface PerfilModalProps {
  open: boolean;
  onClose: () => void;
  usuario?: Usuario;
}

type ActividadItem = {
  tipo?: string;
  descripcion?: string;
  fecha?: string;
};

type UsuarioPatchPayload = {
  nombre_completo?: string;
  username?: string;
  email?: string;
  rol?: string;
};

const ROLES = [
  { value: 'administrador', emoji: '👑', label: 'Administrador', desc: 'Acceso total' },
  { value: 'investigador',  emoji: '🔬', label: 'Investigador',  desc: 'Captura y edición' },
  { value: 'tecnico_campo', emoji: '🌾', label: 'Técnico de campo', desc: 'Registro en campo' },
  { value: 'visualizador',  emoji: '📊', label: 'Consultor',      desc: 'Solo lectura' },
  { value: 'productor',     emoji: '🌽', label: 'Productor',      desc: 'Ver perfil propio' },
];

const ROL_COLOR: Record<string, string> = {
  administrador: '#3D2208', investigador: '#2A5C3F',
  tecnico_campo: '#C8820A', visualizador: '#1D4ED8', productor: '#6B3D1E',
};

const TABS = [
  { id: 'info', label: '👤 Información' },
  { id: 'rol',  label: '🔐 Rol y permisos' },
  { id: 'pwd',  label: '🔑 Contraseña' },
  { id: 'log',  label: '📋 Actividad' },
];

const PERMISOS_ROL: Record<string, string[]> = {
  administrador: ['Ver todos los datos', 'Crear productores', 'Editar datos', 'Eliminar registros', 'Editar catálogos', 'Exportar datos', 'Gestionar usuarios', 'Ver gestión usuarios', 'Acceder a mapas SIG', 'Ver perfil propio'],
  investigador:  ['Ver todos los datos', 'Crear productores', 'Editar datos', 'Exportar datos', 'Ver gestión usuarios', 'Acceder a mapas SIG', 'Ver perfil propio'],
  tecnico_campo: ['Crear productores', 'Editar datos (propios)', 'Acceder a mapas SIG', 'Ver perfil propio'],
  visualizador:  ['Ver todos los datos', 'Acceder a mapas SIG', 'Ver perfil propio'],
  productor:     ['Ver perfil propio'],
};

const PerfilModal: React.FC<PerfilModalProps> = ({ open, onClose, usuario }) => {
  const qc = useQueryClient();
  const addToast = useAppStore(s => s.addToast);
  const [tab, setTab] = useState('info');
  const [rolSel, setRolSel] = useState(usuario?.rol ?? '');
  const [pwdNueva, setPwdNueva] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [editando, setEditando] = useState(false);
  const [editNombre, setEditNombre] = useState(usuario?.nombre_completo ?? '');
  const [editUsername, setEditUsername] = useState(usuario?.username ?? '');
  const [editEmail, setEditEmail] = useState(usuario?.email ?? '');
  const [actividad, setActividad] = useState<ActividadItem[]>([]);
  const [loadingLog, setLoadingLog] = useState(false);

  const guardarRol = useMutation({
    mutationFn: () => PUT(`/auth/usuarios/${usuario!.id}/`, { rol: rolSel }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['usuarios'] }); addToast('Rol actualizado', 'ok'); },
    onError: () => addToast('Error al cambiar rol', 'err'),
  });

  const guardarInfo = useMutation({
    mutationFn: () => PUT<UsuarioPatchPayload>(`/auth/usuarios/${usuario!.id}/`, { nombre_completo: editNombre, username: editUsername, email: editEmail }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['usuarios'] }); addToast('Información actualizada', 'ok'); setEditando(false); },
    onError: () => addToast('Error al guardar información', 'err'),
  });

  const restablecerPwd = useMutation({
    mutationFn: () => PUT(`/auth/usuarios/${usuario!.id}/reset-password`, { password_nuevo: pwdNueva }),
    onSuccess: () => { setPwdNueva(''); setPwdConfirm(''); addToast('Contraseña restablecida', 'ok'); },
    onError: () => addToast('Error al restablecer contraseña', 'err'),
  });

  if (!usuario) return null;

  const ini = (usuario.nombre_completo || usuario.username || '?')
    .split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const color = ROL_COLOR[usuario.rol] ?? '#888';

  const abrirEdicion = () => {
    setEditNombre(usuario.nombre_completo ?? '');
    setEditUsername(usuario.username ?? '');
    setEditEmail(usuario.email ?? '');
    setEditando(true);
  };

  const cargarActividad = async () => {
    if (actividad.length || loadingLog) return;
    setLoadingLog(true);
    try {
      const data = await GET(`/auth/usuarios/${usuario.id}/actividad`);
      setActividad(Array.isArray(data) ? data : []);
    } catch { setActividad([]); }
    finally { setLoadingLog(false); }
  };

  const tabStyle = (id: string): React.CSSProperties => ({
    padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer',
    borderBottom: tab === id ? '2px solid var(--verde,#2A5C3F)' : '2px solid transparent',
    color: tab === id ? 'var(--verde,#2A5C3F)' : 'var(--cafe,#3D2208)',
    fontWeight: tab === id ? 700 : 400, fontSize: 13, whiteSpace: 'nowrap',
  });

  return (
    <Modal open={open} onClose={onClose} titulo="" ancho="lg"
      footer={<Button variante="ghost" onClick={onClose}>Cerrar</Button>}
    >
      {/* Header con avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--borde,#e5e5e5)' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, flexShrink: 0 }}>{ini}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--cafe,#3D2208)' }}>{usuario.nombre_completo || usuario.username}</div>
          <div style={{ color: 'var(--gris,#888)', fontSize: 13 }}>@{usuario.username} · {usuario.email}</div>
          <div style={{ marginTop: 4 }}>
            <span style={{ background: color, color: '#fff', borderRadius: 99, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
              {ROLES.find(r => r.value === usuario.rol)?.emoji} {ROLES.find(r => r.value === usuario.rol)?.label}
            </span>
            <span style={{ marginLeft: 8, background: usuario.activo ? '#dcfce7' : '#fee2e2', color: usuario.activo ? '#166534' : '#991b1b', borderRadius: 99, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
              {usuario.activo ? '✓ Activo' : '✗ Inactivo'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--borde,#e5e5e5)', marginBottom: 20, overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.id} style={tabStyle(t.id)} onClick={() => { setTab(t.id); if (t.id === 'log') cargarActividad(); }}>{t.label}</button>
        ))}
      </div>

      {/* Tab: Información */}
      {tab === 'info' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div><span style={{ fontSize: 11, color: 'var(--gris,#888)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Nombre completo</span><div style={{ fontWeight: 600, marginTop: 2 }}>{usuario.nombre_completo || '—'}</div></div>
            <div><span style={{ fontSize: 11, color: 'var(--gris,#888)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Username</span><div style={{ fontWeight: 600, marginTop: 2 }}>@{usuario.username}</div></div>
            <div><span style={{ fontSize: 11, color: 'var(--gris,#888)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Correo electrónico</span><div style={{ fontWeight: 600, marginTop: 2 }}>{usuario.email || '—'}</div></div>
            <div><span style={{ fontSize: 11, color: 'var(--gris,#888)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Estado</span><div style={{ fontWeight: 600, marginTop: 2 }}>{usuario.activo ? '✓ Activo' : '✗ Inactivo'}</div></div>
            {usuario.last_login && <div style={{ gridColumn: '1/-1' }}><span style={{ fontSize: 11, color: 'var(--gris,#888)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Último acceso</span><div style={{ fontWeight: 600, marginTop: 2 }}>{new Date(usuario.last_login).toLocaleString('es-MX')}</div></div>}
          </div>
          {!editando ? (
            <div style={{ paddingTop: 8 }}>
              <Button variante="ghost" tamaño="sm" onClick={abrirEdicion}>✏ Editar información</Button>
            </div>
          ) : (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--borde,#e5e5e5)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 8 }}>
                <Field label="Nombre completo" name="pe-nombre" value={editNombre} onChange={e => setEditNombre(e.target.value)} />
                <Field label="Username" name="pe-username" value={editUsername} onChange={e => setEditUsername(e.target.value)} />
              </div>
              <Field label="Email" name="pe-email" type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                <Button variante="ghost" tamaño="sm" onClick={() => setEditando(false)}>Cancelar</Button>
                <Button variante="primario" tamaño="sm" cargando={guardarInfo.isPending} onClick={() => guardarInfo.mutate()}>Guardar</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Rol */}
      {tab === 'rol' && (
        <div>
          <p style={{ fontSize: 13, color: 'var(--cafe,#3D2208)', lineHeight: 1.6, marginBottom: 16 }}>Cambiar el rol modifica inmediatamente los permisos del usuario en todo el sistema.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {ROLES.map(r => (
              <label key={r.value} onClick={() => setRolSel(r.value)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', border: `2px solid ${rolSel === r.value ? 'var(--verde,#2A5C3F)' : 'var(--borde,#e5e5e5)'}`, borderRadius: 10, cursor: 'pointer', background: rolSel === r.value ? 'var(--verde-claro,#e8f5e9)' : '#fff', transition: 'all .15s' }}>
                <input type="radio" name="perfil-rol" value={r.value} checked={rolSel === r.value} onChange={() => setRolSel(r.value)} style={{ display: 'none' }} />
                <span style={{ fontSize: 22 }}>{r.emoji}</span>
                <div><strong>{r.label}</strong><div style={{ fontSize: 12, color: 'var(--gris,#888)' }}>{r.desc}</div></div>
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <Button variante="primario" cargando={guardarRol.isPending} onClick={() => guardarRol.mutate()}>💾 Guardar nuevo rol</Button>
          </div>
          {/* Permisos del rol seleccionado */}
          <div style={{ borderTop: '1px solid var(--borde,#e5e5e5)', paddingTop: 16 }}>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gris,#888)', marginBottom: 10 }}>Permisos del rol seleccionado</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(PERMISOS_ROL[rolSel] ?? []).map(p => (
                <span key={p} style={{ background: 'var(--verde-claro,#e8f5e9)', color: 'var(--verde,#2A5C3F)', borderRadius: 99, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>✓ {p}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Contraseña */}
      {tab === 'pwd' && (
        <div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', background: '#fef9c3', borderRadius: 8, marginBottom: 20, fontSize: 13, color: '#713f12' }}>
            <span>⚠</span>
            <span>Solo los administradores pueden restablecer la contraseña de otros usuarios. La nueva contraseña se enviará por correo o deberá compartirse de forma segura.</span>
          </div>
          <Field label="Nueva contraseña *" name="pwd-nueva" type="password" value={pwdNueva} onChange={e => setPwdNueva(e.target.value)} placeholder="Mínimo 8 caracteres" />
          <Field label="Confirmar nueva contraseña *" name="pwd-confirmar" type="password" value={pwdConfirm} onChange={e => setPwdConfirm(e.target.value)} placeholder="Repite la contraseña" />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <Button
              variante="primario"
              cargando={restablecerPwd.isPending}
              onClick={() => {
                if (pwdNueva.length < 8) { addToast('La contraseña debe tener al menos 8 caracteres', 'warn'); return; }
                if (pwdNueva !== pwdConfirm) { addToast('Las contraseñas no coinciden', 'warn'); return; }
                restablecerPwd.mutate();
              }}
            >🔑 Restablecer contraseña</Button>
          </div>
        </div>
      )}

      {/* Tab: Actividad */}
      {tab === 'log' && (
        <div>
          {loadingLog ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 28 }}>
              <span style={{ fontSize: 13, color: 'var(--gris,#888)' }}>Cargando actividad…</span>
            </div>
          ) : actividad.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--gris,#888)', fontSize: 13 }}>Sin actividad registrada</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {actividad.map((a, i: number) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 12px', background: 'var(--crema,#fdf6e3)', borderRadius: 8 }}>
                  <span style={{ fontSize: 18 }}>{a.tipo === 'login' ? '🔑' : a.tipo === 'edicion' ? '✏' : '📋'}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{a.descripcion ?? a.tipo}</div>
                    {a.fecha && <div style={{ fontSize: 11, color: 'var(--gris,#888)', marginTop: 2 }}>{new Date(a.fecha).toLocaleString('es-MX')}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default PerfilModal;
