"use client";

import { useState } from "react";
import { descriptors } from "@/data/descriptor";
import DescriptorField from "./DescriptorField";
import styles from "./SectionForm.module.css";

const SUBTAB_LABEL: Record<string, string> = {
  angulos: "📐 Ángulos y forma",
  color:   "🎨 Coloraciones",
};

interface Props {
  grupo: string;
  data: Record<number, string | number>;
  update: (id: number, value: string) => void;
}

export default function SectionForm({ grupo, data, update }: Props) {
  const fields   = descriptors.filter((d) => d.grupo === grupo);
  const subTabs  = Array.from(new Set(fields.map(d => d.subtab).filter(Boolean))) as string[];
  const [active, setActive] = useState(subTabs[0] ?? "");

  const shown = subTabs.length > 0
    ? fields.filter(d => d.subtab === active)
    : fields;

  // Progreso de la sección completa (todos los sub-tabs)
  const filled  = fields.filter(d => data[d.id] !== undefined && data[d.id] !== "").length;
  const total   = fields.length;
  const pct     = total > 0 ? Math.round((filled / total) * 100) : 0;

  return (
    <div>
      {/* ── Progreso de la sección ── */}
      <div className={styles.sectionProgress}>
        <div className={styles.sectionProgressMeta}>
          <span>{filled} / {total} descriptores capturados</span>
          <span className={styles.sectionProgressPct}>{pct}%</span>
        </div>
        <div className={styles.sectionProgressTrack}>
          <div
            className={styles.sectionProgressBar}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* ── Sub-tabs ── */}
      {subTabs.length > 0 && (
        <div className={styles.tabs}>
          {subTabs.map(t => {
            const tFilled = fields.filter(d => d.subtab === t && data[d.id] !== undefined && data[d.id] !== "").length;
            const tTotal  = fields.filter(d => d.subtab === t).length;
            return (
              <button
                key={t}
                type="button"
                className={[styles.tab, active === t ? styles.tabActive : ""].join(" ")}
                onClick={() => setActive(t)}
              >
                {SUBTAB_LABEL[t] ?? t}
                <span className={styles.tabBadge}>{tFilled}/{tTotal}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className={styles.grid}>
        {shown.map(d => (
          <DescriptorField
            key={d.id}
            descriptor={d}
            value={data[d.id]}
            onChange={update}
          />
        ))}
      </div>
    </div>
  );
}
