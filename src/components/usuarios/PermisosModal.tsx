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
  { accion: 'Consultar dashboard y módulos asignados', admin: <SI/>, inves: <SI/>, tecnico: <SI/>, consul: <SI/>, prod: <PARCIAL txt="Básico"/> },
  { accion: 'Consultar registros de productores / comunidades', admin: <SI/>, inves: <SI/>, tecnico: <SI/>, consul: <NO/>, prod: <NO/> },
  { accion: 'Consultar registros socioculturales / fenotípicos', admin: <SI/>, inves: <SI/>, tecnico: <SI/>, consul: <NO/>, prod: <NO/> },
  { accion: 'Crear registros en módulos activos', admin: <NO/>, inves: <SI/>, tecnico: <SI/>, consul: <NO/>, prod: <NO/> },
  { accion: 'Editar registros existentes', admin: <SI/>, inves: <SI/>, tecnico: <SI/>, consul: <NO/>, prod: <NO/> },
  { accion: 'Eliminar o depurar registros', admin: <SI/>, inves: <SI/>, tecnico: <SI/>, consul: <NO/>, prod: <NO/> },
  { accion: 'Gestionar catálogos', admin: <SI/>, inves: <SI/>, tecnico: <NO/>, consul: <NO/>, prod: <NO/> },
  { accion: 'Gestionar usuarios y roles', admin: <SI/>, inves: <NO/>, tecnico: <NO/>, consul: <NO/>, prod: <NO/> },
  { accion: 'Ver perfil propio', admin: <SI/>, inves: <SI/>, tecnico: <SI/>, consul: <SI/>, prod: <SI/> },
];

const PermisosModal: React.FC<PermisosModalProps> = ({ open, onClose }) => (
  <Modal open={open} onClose={onClose} titulo="🔐 Tabla de permisos por rol" ancho="lg"
    footer={<Button variante="ghost" onClick={onClose}>Cerrar</Button>}
  >
    <p className={styles.desc}>
      Resumen de acciones permitidas para cada rol en el sistema. Con la configuración actual,
      <strong> el administrador consulta, edita y depura registros</strong>, mientras que las
      <strong> altas nuevas en módulos activos</strong> corresponden a investigación y trabajo de campo.
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
