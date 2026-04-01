"use client";

import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GET, PUT, DEL, POST } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';
import type { Usuario } from '@/types';
import styles from '@/app/admin/usuarios/usuarios.module.css';
import Paginacion from '@/components/ui/Paginacion';
import ToastContainer from '@/components/ui/ToastContainer';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import SelectField from '@/components/ui/SelectField';
import SearchInput from '@/components/ui/SearchInput';
import StatCard from '@/components/ui/StatCard';
import Tabla from '@/components/ui/Tabla';
import UsuarioModal from './UsuarioModal';
import PermisosModal from './PermisosModal';
import PerfilModal from './PerfilModal';

const ROL_INFO: Record<string, { badge: string; emoji: string; label: string }> = {
  administrador: { badge: 'b-admin',        emoji: '👑',  label: 'Admin' },
  investigador:  { badge: 'b-investigador', emoji: '🔬', label: 'Investigador' },
  tecnico_campo: { badge: 'b-tecnico',      emoji: '🌾', label: 'Técnico' },
  visualizador:  { badge: 'b-visualizador', emoji: '📊', label: 'Consultor' },
  productor:     { badge: 'b-productor',    emoji: '🌽', label: 'Productor' },
};

const ROL_COLOR: Record<string, string> = {
  administrador: '#3D2208',
  investigador:  '#2A5C3F',
  tecnico_campo: '#C8820A',
  visualizador:  '#1D4ED8',
  productor:     '#6B3D1E',
};

export default function UsuariosPanel() {
  const qc = useQueryClient();
  const addToast = useAppStore(s => s.addToast);

  // Filtros y paginación
  const [search, setSearch] = useState('');
  const [rol, setRol] = useState('');
  const [estado, setEstado] = useState('');
  const [pagina, setPagina] = useState(1);
  const PAG = 15;

  // Modales y toasts
  const [modalUsuario, setModalUsuario] = useState<{ open: boolean; usuario?: Usuario }>({ open: false });
  const [modalPermisos, setModalPermisos] = useState(false);
  const [modalPerfil, setModalPerfil] = useState<{ open: boolean; usuario?: Usuario }>({ open: false });
  const [modalConfirm, setModalConfirm] = useState<{ open: boolean; id?: number; accion?: 'activar' | 'desactivar' | 'eliminar' }>({ open: false });

  const abrirModalUsuario = (usuario?: Usuario) => setModalUsuario({ open: true, usuario });
  const cerrarModalUsuario = () => setModalUsuario({ open: false });
  const abrirModalPermisos = () => setModalPermisos(true);
  const cerrarModalPermisos = () => setModalPermisos(false);
  const abrirModalPerfil = (usuario: Usuario) => setModalPerfil({ open: true, usuario });
  const cerrarModalPerfil = () => setModalPerfil({ open: false });
  const abrirModalConfirm = (id: number, accion: 'activar' | 'desactivar' | 'eliminar') => setModalConfirm({ open: true, id, accion });
  const cerrarModalConfirm = () => setModalConfirm({ open: false });

  // Queries y mutaciones
  const { data: usuarios = [], isLoading, isError, error, refetch } = useQuery<Usuario[]>({
    queryKey: ['usuarios'],
    queryFn: () => GET('/auth/usuarios'),
    retry: 1,
    select: (d: unknown) => {
      const data = d as Usuario[] | { count?: number; items?: Usuario[]; results?: Usuario[] };
      return Array.isArray(data) ? data : data.results ?? data.items ?? [];
    },
  });

  const guardarUsuario = useMutation({
    mutationFn: async (data: any) => {
      if (modalUsuario.usuario) return PUT(`/auth/usuarios/${modalUsuario.usuario.id}/`, data);
      return POST('/auth/register', data);
    },
    onSuccess: () => { cerrarModalUsuario(); qc.invalidateQueries({ queryKey: ['usuarios'] }); addToast('Usuario guardado', 'ok'); },
    onError: () => addToast('Error al guardar usuario', 'err'),
  });

  const activarUsuario = useMutation({
    mutationFn: (id: number) => PUT(`/auth/usuarios/${id}/activar`, {}),
    onSuccess: () => { cerrarModalConfirm(); qc.invalidateQueries({ queryKey: ['usuarios'] }); addToast('Usuario activado', 'ok'); },
    onError: () => addToast('Error al activar usuario', 'err'),
  });

  const desactivarUsuario = useMutation({
    mutationFn: (id: number) => PUT(`/auth/usuarios/${id}/desactivar`, {}),
    onSuccess: () => { cerrarModalConfirm(); qc.invalidateQueries({ queryKey: ['usuarios'] }); addToast('Usuario desactivado', 'ok'); },
    onError: () => addToast('Error al desactivar usuario', 'err'),
  });

  const eliminarUsuario = useMutation({
    mutationFn: (id: number) => DEL(`/auth/usuarios/${id}/`),
    onSuccess: () => { cerrarModalConfirm(); qc.invalidateQueries({ queryKey: ['usuarios'] }); addToast('Usuario eliminado', 'ok'); },
    onError: () => addToast('Error al eliminar usuario', 'err'),
  });

  // Filtrado y paginación local
  const [sortCol, setSortCol] = useState<string>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const filtrados = useMemo(() => {
    let f = usuarios;
    if (search) f = f.filter(u => [u.nombre_completo, u.username, u.email].some(v => (v || '').toLowerCase().includes(search.toLowerCase())));
    if (rol) f = f.filter(u => u.rol === rol);
    if (estado) f = f.filter(u => estado === 'activo' ? u.activo : !u.activo);
    // sort
    f = [...f].sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortCol] ?? '';
      const bv = (b as unknown as Record<string, unknown>)[sortCol] ?? '';
      const cmp = String(av).localeCompare(String(bv), 'es', { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return f;
  }, [usuarios, search, rol, estado, sortCol, sortDir]);

  const totalPaginas = Math.ceil(filtrados.length / PAG) || 1;
  useEffect(() => { setPagina(1); }, [search, rol, estado]);
  const paginados = useMemo(() => filtrados.slice((pagina - 1) * PAG, pagina * PAG), [filtrados, pagina]);

  return (
    <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto' }}>
      {/* Hero */}
      <div className={styles['mod-hero']}>
        <div className={styles['mod-hero-txt']}>
          <div className={styles['mod-hero-label']}>Administración · Módulo de usuarios</div>
          <h1 className={styles['mod-hero-title']}>Gestión de <em>Usuarios</em> 👥</h1>
          <p className={styles['mod-hero-desc']}>Administra los usuarios del sistema, asigna roles y controla el acceso a la plataforma.</p>
        </div>
        <div className={styles['mod-hero-right']}>
          <div className={styles['mod-hero-stats']}>
            <div className={styles['mod-hero-stat']}>
              <span className={styles['mod-hero-stat-val']}>{filtrados.filter(u => u.activo).length}</span>
              <span className={styles['mod-hero-stat-lbl']}>Activos</span>
            </div>
            <div className={styles['mod-hero-stat-sep']} />
            <div className={styles['mod-hero-stat']}>
              <span className={styles['mod-hero-stat-val']}>{filtrados.length}</span>
              <span className={styles['mod-hero-stat-lbl']}>Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className={styles['stats-row']}>
        <StatCard value={filtrados.length} label="Total usuarios" />
        <StatCard value={filtrados.filter(u => u.activo).length} label="Activos" colorClass="verde" />
        <StatCard value={filtrados.filter(u => !u.activo).length} label="Inactivos" colorClass="rojo" />
        <StatCard value={filtrados.filter(u => u.rol === 'administrador').length} label="Administradores" />
        <StatCard value={filtrados.filter(u => u.rol === 'investigador').length} label="Investigadores" colorClass="maiz" />
        <StatCard value={filtrados.filter(u => u.rol === 'tecnico_campo').length} label="Técnicos" />
      </div>

      {/* sec-header: título + botones principales */}
      <div className={styles['sec-header']}>
        <div>
          <h2 className={styles['sec-titulo']}>Usuarios del sistema</h2>
          <p className={styles['sec-sub']}>Gestión de cuentas, roles y permisos · /auth/usuarios/</p>
        </div>
        <div className={styles['sec-acciones']}>
          <Button variante="ghost" onClick={() => refetch()}>↺ Recargar</Button>
          <Button variante="ghost" onClick={abrirModalPermisos}>🔐 Tabla de permisos</Button>
          <Button variante="primario" onClick={() => abrirModalUsuario()}>＋ Nuevo usuario</Button>
        </div>
      </div>

      {/* Filtros */}
      <div className={styles.filtros}>
        <SearchInput
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, username o email..."
          className={styles['search-wrap']}
        />
        <SelectField
          className={styles['filtro-sel']}
          value={rol}
          onChange={e => setRol(e.target.value)}
          label="" name=""
          options={[
            { value: '', label: 'Todos los roles' },
            { value: 'administrador', label: '👑 Administrador' },
            { value: 'investigador', label: '🔬 Investigador' },
            { value: 'tecnico_campo', label: '🌾 Técnico de campo' },
            { value: 'visualizador', label: '📊 Consultor' },
            { value: 'productor', label: '🌽 Productor' },
          ]}
        />
        <SelectField
          className={styles['filtro-sel']}
          value={estado}
          onChange={e => setEstado(e.target.value)}
          label="" name=""
          options={[
            { value: '', label: 'Todos los estados' },
            { value: 'activo', label: '✓ Activos' },
            { value: 'inactivo', label: '✗ Inactivos' },
          ]}
        />
        <div className={styles['filtros-right']}>
          <Button variante="ghost" tamaño="sm" onClick={() => { setSearch(''); setRol(''); setEstado(''); }}>✕ Limpiar</Button>
        </div>
      </div>

      {/* Tabla */}
      <div className={styles['table-wrap']}>
        {isLoading ? (
          <div className={styles['estado-centro']}><div className={styles['spinner']} />Cargando…</div>
        ) : isError ? (
          <div className={styles['estado-centro']} style={{ color: 'var(--rojo, #c0392b)' }}>
            ⚠️ Error al cargar usuarios: {(error as Error)?.message ?? 'Error desconocido'}
            <br />
            <Button variante="ghost" tamaño="sm" onClick={() => refetch()} style={{ marginTop: 12 }}>↺ Reintentar</Button>
          </div>
        ) : (
          <Tabla
            datos={paginados}
            sortCol={sortCol}
            sortDir={sortDir}
            onSort={handleSort}
            infoText={`${filtrados.length} usuario${filtrados.length !== 1 ? 's' : ''}`}
            columnas={[
              { key: 'id', header: '#', nowrap: true, sortable: true },
              {
                key: 'usuario', header: 'Usuario', width: '220px',
                render: (u: Usuario) => {
                  const ini = (u.nombre_completo || u.username || '?').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                  const color = ROL_COLOR[u.rol] ?? '#888';
                  return (
                    <div className={styles['td-nombre']}>
                      <div className={styles['td-avatar']} style={{ background: color, color: '#fff' }}>{ini}</div>
                      <div className={styles['td-nombre-txt']}>
                        <strong>{u.nombre_completo || '—'}</strong>
                        <span>@{u.username}</span>
                      </div>
                    </div>
                  );
                }
              },
              {
                key: 'email', header: 'Email', width: '260px', sortable: true,
                render: (u: Usuario) => <span className={styles['td-email']}>{u.email || '—'}</span>
              },
              {
                key: 'rol', header: 'Rol', width: '140px', nowrap: true, sortable: true,
                render: (u: Usuario) => {
                  const info = ROL_INFO[u.rol] ?? { badge: 'b-productor', emoji: '🌽', label: u.rol };
                  return <span className={`${styles.badge} ${styles[info.badge]} ${styles['td-rol']}`}>{info.emoji} {info.label}</span>;
                }
              },
              {
                key: 'activo', header: 'Estado', width: '110px', nowrap: true, sortable: true,
                render: (u: Usuario) => (
                  <span className={`${styles.badge} ${styles[u.activo ? 'b-activo' : 'b-inactivo']} ${styles['td-estado']}`}>
                    {u.activo ? '✓' : '✗'} {u.activo ? 'Activo' : 'Inactivo'}
                  </span>
                )
              },
              {
                key: 'ultimo_acceso', header: 'Último acceso', width: '130px', nowrap: true, sortable: true,
                render: (u: Usuario) => u.ultimo_acceso ? new Date(u.ultimo_acceso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
              },
              {
                key: 'fecha_registro', header: 'Registro', width: '110px', nowrap: true, sortable: true,
                render: (u: Usuario) => u.fecha_registro ? new Date(u.fecha_registro).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
              },
            ]}
            acciones={(u: Usuario) => (
              <div style={{ display: 'flex', gap: 6 }}>
                <Button variante="ghost" tamaño="sm" onClick={e => { e.stopPropagation(); const usr = usuarios.find(x => x.id === u.id); if (usr) abrirModalPerfil(usr); }} title="Ver perfil">👤</Button>
                {u.activo
                  ? <Button variante="peligro" tamaño="sm" onClick={e => { e.stopPropagation(); abrirModalConfirm(u.id, 'desactivar'); }} title="Desactivar">🚫</Button>
                  : <Button variante="primario" tamaño="sm" onClick={e => { e.stopPropagation(); abrirModalConfirm(u.id, 'activar'); }} title="Activar">✅</Button>
                }
              </div>
            )}
          />
        )}
      </div>

      {/* Paginación */}
      <Paginacion
        paginaActual={pagina}
        totalPaginas={totalPaginas}
        onCambiar={setPagina}
        totalItems={filtrados.length}
        itemsPorPagina={PAG}
      />

      {/* Modales */}
      <UsuarioModal
        open={modalUsuario.open}
        initialData={modalUsuario.usuario}
        onClose={cerrarModalUsuario}
        onSave={data => guardarUsuario.mutate(data)}
      />
      <PermisosModal open={modalPermisos} onClose={cerrarModalPermisos} />
      <PerfilModal open={modalPerfil.open} onClose={cerrarModalPerfil} usuario={modalPerfil.usuario} />
      <Modal
        open={modalConfirm.open}
        onClose={cerrarModalConfirm}
        titulo={null}
        ancho="sm"
        footer={
          <>
            <Button variante="ghost" onClick={cerrarModalConfirm}>Cancelar</Button>
            <Button variante="peligro" onClick={() => {
              if (modalConfirm.accion === 'activar') activarUsuario.mutate(modalConfirm.id!);
              else if (modalConfirm.accion === 'desactivar') desactivarUsuario.mutate(modalConfirm.id!);
              else if (modalConfirm.accion === 'eliminar') eliminarUsuario.mutate(modalConfirm.id!);
            }}>Confirmar</Button>
          </>
        }
      >
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
          <div style={{ fontSize: 14, color: 'var(--cafe)', lineHeight: 1.6 }}>
            {modalConfirm.accion === 'activar' ? '¿Activar usuario?' :
             modalConfirm.accion === 'desactivar' ? '¿Desactivar usuario?' :
             '¿Eliminar usuario?'}
          </div>
        </div>
      </Modal>
      <ToastContainer />
    </div>
  );
}
