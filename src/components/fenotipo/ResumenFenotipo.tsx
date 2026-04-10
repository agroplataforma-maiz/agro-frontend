"use client";
import { useUsuariosTecnicos } from "@/hooks/useUsuariosTecnicos";
import { useAppStore } from "@/store/useAppStore";
import type { DatosGenerales } from "@/hooks/useFenotipo";
import styles from "./ReportView.module.css";

interface Props {
  dg?: DatosGenerales;
}

export default function ResumenFenotipo({ dg }: Props) {
  const { tecnicos: responsables } = useUsuariosTecnicos();
  const usuario = useAppStore(s => s.usuario);
  if (!dg) return null;

  let colectorNombre = dg.colector;
  // Si el colector es el usuario actual (técnico de campo), mostrar su nombre
  if (usuario && usuario.rol === 'tecnico_campo' && (String(usuario.id) === String(dg.colector))) {
    colectorNombre = usuario.nombre_completo || usuario.username;
  } else if (dg.colector && responsables.length > 0) {
    const responsable = responsables.find(u => String(u.id) === String(dg.colector));
    if (responsable) {
      colectorNombre = responsable.nombre_completo || responsable.username;
    }
  }

  return (
    <div className={styles.dgSummaryItem}>
      <span className={styles.dgSummaryLabel}>Colector</span>
      <span className={styles.dgSummaryValue}>{colectorNombre || "—"}</span>
    </div>
  );
}
