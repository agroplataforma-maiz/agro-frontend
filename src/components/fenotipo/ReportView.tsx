import type { DatosGenerales } from "@/hooks/useFenotipo";
import { descriptors, grupos } from "@/data/descriptor";
import Badge from "@/components/ui/Badge";
import ResumenFenotipo from "./ResumenFenotipo";
import styles from "./ReportView.module.css";

const DG_LABELS: { k: keyof DatosGenerales; label: string }[] = [
  { k: "tipo",         label: "Tipo" },
  // { k: "colector",     label: "Colector" }, // Se maneja aparte
  { k: "temporada",    label: "Temporada" },
  { k: "altitud",      label: "Altitud (msnm)" },
  { k: "plantas",      label: "N° plantas" },
  { k: "reps",         label: "Repeticiones" },
];

interface Props {
  data: Record<number, string | number>;
  dg?: DatosGenerales;
  razaLabel?: string;
}

export default function ReportView({ data, dg, razaLabel }: Props) {
  const totalCapturados = descriptors.filter(
    (d) => data[d.id] !== undefined && data[d.id] !== ""
  ).length;

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>📋 Resumen varietal</h2>
          <p className={styles.subtitle}>Vista previa antes de guardar el registro</p>
        </div>
        <span className={styles.counter}>{totalCapturados} descriptores</span>
      </div>

      {dg && (
        <div className={styles.dgSummary}>
          {/* Raza siempre como primer item */}
          {(razaLabel || dg.raza_id) && (
            <div className={styles.dgSummaryItem}>
              <span className={styles.dgSummaryLabel}>Raza</span>
              <span className={styles.dgSummaryValue}>{razaLabel || dg.raza_id}</span>
            </div>
          )}
          {/* Colector personalizado para mostrar nombre */}
          <ResumenFenotipo dg={dg} />
          {DG_LABELS.map(({ k, label }) =>
            dg[k] ? (
              <div key={k} className={styles.dgSummaryItem}>
                <span className={styles.dgSummaryLabel}>{label}</span>
                <span className={styles.dgSummaryValue}>{dg[k]}</span>
              </div>
            ) : null
          )}
          {dg.notas && (
            <div className={`${styles.dgSummaryItem} ${styles.dgSummaryFull}`}>
              <span className={styles.dgSummaryLabel}>Notas</span>
              <span className={styles.dgSummaryValue}>{dg.notas}</span>
            </div>
          )}
        </div>
      )}

      <div className={styles.body}>
        {grupos.map((grupo) => {
          const campos = descriptors.filter(
            (d) => d.grupo === grupo && data[d.id] !== undefined && data[d.id] !== ""
          );
          if (campos.length === 0) return null;

          return (
            <div key={grupo} className={styles.grupo}>
              <div className={styles.grupoHead}>
                <Badge color="maiz">{grupo}</Badge>
                <span className={styles.grupoCount}>{campos.length} campos</span>
              </div>
              <div className={styles.grupoBody}>
                {campos.map((d) => (
                  <div key={d.id} className={styles.row}>
                    <span className={styles.rowLabel}>{d.nombre}</span>
                    <span className={styles.rowValue}>{String(data[d.id])}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}