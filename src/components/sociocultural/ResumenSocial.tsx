"use client";

import type { RegistroSociocultural, SeccionKey } from "@/hooks/useSociocultural";
import styles from "./ResumenSocial.module.css";

interface Progreso {
  llenos: number;
  total: number;
  pct: number;
}

interface Props {
  registro: RegistroSociocultural;
  pasos: { key: string; label: string; icon: string }[];
  progresos: Progreso[];
}

// Mapeos de etiquetas legibles para cada sección
const LABELS: Record<SeccionKey, Record<string, string>> = {
  productor: {
    productor_id:    "Productor",
    entrevistador:   "Entrevistador",
    fecha:           "Fecha",
    consentimiento:  "Consentimiento",
  },
  territorio: {
    municipio_id:  "Municipio",
    localidad_id:  "Localidad",
    comunidad:     "Comunidad / paraje",
    lengua_id:     "Lengua",
    altitud:       "Altitud (msnm)",
    superficie_ha: "Superficie (ha)",
    tenencia:      "Tenencia",
  },
  practicas: {
    sistema_cultivo:  "Sistema de cultivo",
    asociaciones:     "Asociaciones",
    preparacion_suelo:"Preparación del suelo",
    siembra_tipo:     "Tipo de siembra",
    fecha_siembra:    "Fecha de siembra",
    densidad_plantas: "Densidad (pl/ha)",
    uso_agroquimicos: "Agroquímicos",
    fertilizacion:    "Fertilización",
    control_plagas:   "Control de plagas",
    riego:            "Riego",
    almacenamiento:   "Almacenamiento",
  },
  saberes: {
    nombre_local:          "Nombre local",
    origen_semilla:        "Origen de semilla",
    anios_cultivo:         "Años cultivando",
    seleccion_semilla:     "Selección de semilla",
    criterios_seleccion:   "Criterios de selección",
    intercambio_semilla:   "Intercambio de semilla",
    usos:                  "Usos del maíz",
    preparaciones:         "Preparaciones",
    valor_cultural:        "Valor cultural",
    rituales:              "Rituales / festividades",
    observaciones_saberes: "Observaciones",
  },
  economia: {
    destino_produccion:    "Destino de producción",
    precio_kg:             "Precio por kg ($)",
    canales_venta:         "Canales de venta",
    autoconsumo_pct:       "Autoconsumo (%)",
    venta_pct:             "Venta (%)",
    semilla_pct:           "Semilla (%)",
    ingresos_adicionales:  "Ingresos adicionales",
    observaciones_economia:"Observaciones",
  },
};

function formatVal(v: unknown): string {
  if (Array.isArray(v)) return v.length > 0 ? v.join(", ") : "—";
  if (v === "" || v === null || v === undefined) return "—";
  return String(v);
}

function isLleno(v: unknown): boolean {
  if (Array.isArray(v)) return v.length > 0;
  return v !== "" && v !== null && v !== undefined;
}

export default function ResumenSocial({ registro, pasos, progresos }: Props) {
  const totalLlenos = progresos.reduce((s, p) => s + p.llenos, 0);
  const totalCampos = progresos.reduce((s, p) => s + p.total, 0);
  const pctGlobal = totalCampos > 0 ? Math.round((totalLlenos / totalCampos) * 100) : 0;

  return (
    <div className={styles.wrap}>
      {/* ── Encabezado ── */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>📋 Resumen</h2>
          <p className={styles.subtitle}>Vista previa del registro</p>
        </div>
        <span className={styles.counter}>{totalLlenos}/{totalCampos}</span>
      </div>

      {/* ── Progreso global ── */}
      <div className={styles.globalProg}>
        <div className={styles.globalProgMeta}>
          <span>Completado</span>
          <span>{pctGlobal}%</span>
        </div>
        <div className={styles.globalProgTrack}>
          <div className={styles.globalProgBar} style={{ width: `${pctGlobal}%` }} />
        </div>
      </div>

      {/* ── Chips por sección ── */}
      <div className={styles.chips}>
        {pasos.map((paso, i) => {
          const p = progresos[i];
          const completa = p.pct === 100;
          const iniciada = p.llenos > 0;
          return (
            <div
              key={paso.key}
              className={[
                styles.chip,
                completa ? styles.chipDone : iniciada ? styles.chipPartial : "",
              ].join(" ")}
            >
              <span className={styles.chipIcon}>{paso.icon}</span>
              <span className={styles.chipLabel}>{paso.label}</span>
              <span className={styles.chipPct}>{p.pct}%</span>
            </div>
          );
        })}
      </div>

      {/* ── Detalle por sección ── */}
      <div className={styles.body}>
        {pasos.map((paso, i) => {
          const sec = paso.key as SeccionKey;
          const secData = registro[sec] as unknown as Record<string, unknown>;
          const etiquetas = LABELS[sec];
          const filas = Object.entries(secData).filter(([, v]) => isLleno(v));

          if (filas.length === 0) return null;

          return (
            <div key={paso.key} className={styles.grupo}>
              <div className={styles.grupoHead}>
                <span className={styles.grupoTitle}>
                  {paso.icon} {paso.label}
                </span>
                <span className={styles.grupoCount}>
                  {progresos[i].llenos}/{progresos[i].total}
                </span>
              </div>
              <div className={styles.grupoBody}>
                {filas.map(([campo, val]) => (
                  <div key={campo} className={styles.row}>
                    <span className={styles.rowLabel}>
                      {etiquetas[campo] ?? campo}
                    </span>
                    <span className={styles.rowValue}>{formatVal(val)}</span>
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
