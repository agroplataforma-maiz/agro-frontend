import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import styles from './PermisosModal.module.css';

interface PermisosModalProps {
  open: boolean;
  onClose: () => void;
}

const SI = () => <span className={`${styles.value} ${styles.yes}`}>Si</span>;
const NO = () => <span className={`${styles.value} ${styles.no}`}>No</span>;
const PARCIAL = ({ txt }: { txt: string }) => <span className={`${styles.value} ${styles.partial}`}>{txt}</span>;

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

const PermisosModal: React.FC<PermisosModalProps> = ({ open, onClose }) => (
  <Modal open={open} onClose={onClose} titulo="🔐 Tabla de permisos por rol" ancho="lg"
    footer={<Button variante="ghost" onClick={onClose}>Cerrar</Button>}
  >
    <p className={styles.desc}>
      Resumen de acciones permitidas para cada rol en el sistema.
    </p>
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={`${styles.headCell} ${styles.headAction}`}>Acción</th>
            <th className={styles.headCell}>👑 Admin</th>
            <th className={styles.headCell}>🔬 Investigador</th>
            <th className={styles.headCell}>🌾 Técnico</th>
            <th className={styles.headCell}>📊 Consultor</th>
            <th className={styles.headCell}>🌽 Productor</th>
          </tr>
        </thead>
        <tbody>
          {FILAS.map((f, i) => (
            <tr key={i} className={`${styles.row}${i % 2 !== 0 ? ` ${styles.rowAlt}` : ''}`}>
              <td className={`${styles.cell} ${styles.actionCell}`}>{f.accion}</td>
              <td className={styles.cell}>{f.admin}</td>
              <td className={styles.cell}>{f.inves}</td>
              <td className={styles.cell}>{f.tecnico}</td>
              <td className={styles.cell}>{f.consul}</td>
              <td className={styles.cell}>{f.prod}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Modal>
);

export default PermisosModal;
