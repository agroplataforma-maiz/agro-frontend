import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface PermisosModalProps {
  open: boolean;
  onClose: () => void;
}

const SI = () => <span style={{ color: 'var(--verde, #2A5C3F)', fontWeight: 700 }}>✓</span>;
const NO = () => <span style={{ color: 'var(--gris, #aaa)' }}>—</span>;
const PARCIAL = ({ txt }: { txt: string }) => <span style={{ color: 'var(--maiz, #C8820A)', fontWeight: 600 }}>{txt}</span>;

const FILAS: { accion: string; admin: React.ReactNode; inves: React.ReactNode; tecnico: React.ReactNode; consul: React.ReactNode; prod: React.ReactNode }[] = [
  { accion: 'Ver todos los datos',    admin: <SI/>, inves: <SI/>, tecnico: <NO/>, consul: <SI/>, prod: <NO/> },
  { accion: 'Crear productores',      admin: <SI/>, inves: <SI/>, tecnico: <SI/>, consul: <NO/>, prod: <NO/> },
  { accion: 'Editar datos',           admin: <SI/>, inves: <SI/>, tecnico: <PARCIAL txt="Propios"/>, consul: <NO/>, prod: <NO/> },
  { accion: 'Eliminar registros',     admin: <SI/>, inves: <NO/>, tecnico: <NO/>, consul: <NO/>, prod: <NO/> },
  { accion: 'Editar catálogos',       admin: <SI/>, inves: <NO/>, tecnico: <NO/>, consul: <NO/>, prod: <NO/> },
  { accion: 'Exportar datos',         admin: <SI/>, inves: <SI/>, tecnico: <NO/>, consul: <NO/>, prod: <NO/> },
  { accion: 'Gestionar usuarios',     admin: <SI/>, inves: <NO/>, tecnico: <NO/>, consul: <NO/>, prod: <NO/> },
  { accion: 'Ver gestión usuarios',   admin: <SI/>, inves: <SI/>, tecnico: <NO/>, consul: <NO/>, prod: <NO/> },
  { accion: 'Acceder a mapas SIG',    admin: <SI/>, inves: <SI/>, tecnico: <SI/>, consul: <SI/>, prod: <NO/> },
  { accion: 'Ver perfil propio',      admin: <SI/>, inves: <SI/>, tecnico: <SI/>, consul: <SI/>, prod: <SI/> },
];

const tdC: React.CSSProperties = { textAlign: 'center', padding: '10px 12px', borderBottom: '1px solid var(--borde, #e5e5e5)' };
const thC: React.CSSProperties = { padding: '10px 12px', background: 'var(--verde-claro, #e8f5e9)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.06em', textAlign: 'center', borderBottom: '2px solid var(--borde, #e5e5e5)' };

const PermisosModal: React.FC<PermisosModalProps> = ({ open, onClose }) => (
  <Modal open={open} onClose={onClose} titulo="🔐 Tabla de permisos por rol" ancho="lg"
    footer={<Button variante="ghost" onClick={onClose}>Cerrar</Button>}
  >
    <p style={{ fontSize: 13, color: 'var(--gris,#888)', marginBottom: 16, lineHeight: 1.6 }}>
      Resumen de acciones permitidas para cada rol en el sistema.
    </p>
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            <th style={{ ...thC, textAlign: 'left' }}>Acción</th>
            <th style={thC}>👑 Admin</th>
            <th style={thC}>🔬 Investigador</th>
            <th style={thC}>🌾 Técnico</th>
            <th style={thC}>📊 Consultor</th>
            <th style={thC}>🌽 Productor</th>
          </tr>
        </thead>
        <tbody>
          {FILAS.map((f, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--fondo-alt,#fafaf8)' }}>
              <td style={{ ...tdC, textAlign: 'left', fontWeight: 500 }}>{f.accion}</td>
              <td style={tdC}>{f.admin}</td>
              <td style={tdC}>{f.inves}</td>
              <td style={tdC}>{f.tecnico}</td>
              <td style={tdC}>{f.consul}</td>
              <td style={tdC}>{f.prod}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Modal>
);

export default PermisosModal;
