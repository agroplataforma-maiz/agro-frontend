import type { Descriptor } from "@/data/descriptor";
import styles from "./DescriptorField.module.css";

interface Props {
  descriptor: Descriptor;
  value: string | number | undefined;
  onChange: (id: number, value: string) => void;
}

/** Divide "1 — Texto largo" → { score: "1", label: "Texto largo" } */
function parseOpt(op: string): { score: string; label: string } {
  const sep = op.indexOf(" — ");
  if (sep === -1) return { score: "", label: op };
  return { score: op.slice(0, sep), label: op.slice(sep + 3) };
}

function Header({ descriptor }: { descriptor: Descriptor }) {
  return (
    <div className={styles.fieldHeader}>
      <div className={styles.headerTop}>
        {descriptor.clave && <span className={styles.clave}>★</span>}
        <span className={styles.label}>{descriptor.nombre}</span>
      </div>
      {descriptor.sublabel && (
        <span className={styles.sublabel}>{descriptor.sublabel}</span>
      )}
    </div>
  );
}

export default function DescriptorField({ descriptor, value, onChange }: Props) {
  const currentVal = value !== undefined ? String(value) : "";

  if (descriptor.campo === "select") {
    return (
      <div className={styles.fieldWrap}>
        <Header descriptor={descriptor} />
        <div className={styles.opts}>
          {(descriptor.opciones ?? []).map((op) => {
            const { score, label } = parseOpt(op);
            const color = descriptor.colores?.[op];
            const active = currentVal === op;
            return (
              <button
                key={op}
                type="button"
                className={[styles.optBtn, active ? styles.optBtnActive : ""].join(" ")}
                onClick={() => onChange(descriptor.id, active ? "" : op)}
              >
                {score && (
                  <span className={[styles.score, active ? styles.scoreActive : ""].join(" ")}>
                    {score}
                  </span>
                )}
                {color && <span className={styles.swatch} style={{ background: color }} />}
                <span className={styles.optLabel}>{label}</span>
                {active && <span className={styles.checkmark}>✓</span>}
              </button>
            );
          })}
        </div>
        {descriptor.hint && (
          <span className={styles.hint}>ⓘ {descriptor.hint}</span>
        )}
      </div>
    );
  }

  if (descriptor.campo === "number") {
    const numVal = currentVal === "" ? "" : Number(currentVal);
    const min = descriptor.rango?.[0] ?? 0;
    const max = descriptor.rango?.[1] ?? 9999;
    const step = () => {
      const cur = currentVal === "" ? min : Number(currentVal);
      return String(Math.min(max, cur + 1));
    };
    const stepDown = () => {
      const cur = currentVal === "" ? max : Number(currentVal);
      return String(Math.max(min, cur - 1));
    };

    return (
      <div className={styles.fieldWrap}>
        <Header descriptor={descriptor} />
        <div className={styles.numRow}>
          <div className={styles.numStepper}>
            <button
              type="button"
              className={styles.numBtn}
              onClick={() => onChange(descriptor.id, stepDown())}
            >−</button>
            <input
              className={styles.numInput}
              type="number"
              min={min}
              max={max}
              value={numVal}
              placeholder="—"
              onChange={(e) => onChange(descriptor.id, e.target.value)}
            />
            <button
              type="button"
              className={styles.numBtn}
              onClick={() => onChange(descriptor.id, step())}
            >+</button>
          </div>
          {descriptor.rango && (
            <span className={styles.numRange}>
              {descriptor.rango[0]}–{descriptor.rango[1]}
            </span>
          )}
        </div>
        {descriptor.hint && (
          <span className={styles.hint}>ⓘ {descriptor.hint}</span>
        )}
      </div>
    );
  }

  return null;
}
