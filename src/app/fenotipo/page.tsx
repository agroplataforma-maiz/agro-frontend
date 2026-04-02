"use client";

import React, { Fragment, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminShell from "@/components/dashboard/AdminShell";
import { useFenotipo } from "@/hooks/useFenotipo";
import { useCatalogos } from "@/hooks/useCatalogos";
import { useAppStore } from "@/store/useAppStore";
import SectionForm from "@/components/fenotipo/SectionForm";
import ReportView from "@/components/fenotipo/ReportView";
import { grupos } from "@/data/descriptor";
import { Button } from "@/components/ui";
import ModuleHero from '@/components/ui/ModuleHero'
import SelectField from "@/components/ui/SelectField";
import AccessGuardScreen from '@/components/ui/AccessGuardScreen'
import { GET, POST } from "@/lib/api";
import styles from "./fenotipo.module.css";
import { useRolGuard } from "@/hooks/useRolGuard";

const ICONO: Record<string, string> = {
  "plántula":   "🌱",
  "hoja":       "🍃",
  "tallo":      "🌿",
  "espiga":     "🌾",
  "mazorca":    "🌽",
  "grano":      "🫘",
  "adaptación": "🗺️",
};

const ALL_STEPS = [
  { key: "general", label: "General", icon: "📋" },
  ...grupos.map(g => ({ key: g, label: g, icon: ICONO[g] })),
];

const TIPOS_VARIEDAD = ["Nativo", "Criollo", "Mejorado", "Híbrido"];

function toArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  const d = data as Record<string, unknown>;
  return (d?.items ?? d?.results ?? []) as T[];
}

function buildTemporadas(): { value: string; label: string }[] {
  const year = new Date().getFullYear();
  const opts: { value: string; label: string }[] = [];
  for (let y = year; y >= year - 2; y--) {
    opts.push({ value: `PV-${y}`, label: `PV ${y}` });
    opts.push({ value: `OI-${y}`, label: `OI ${y}` });
  }
  return opts;
}

export default function Page() {
  const accesoPermitido = useRolGuard(['administrador', 'investigador', 'tecnico_campo'])

  const { data, step, setStep, update, dg, updateDg, clearAll } = useFenotipo();
  useCatalogos(); // carga municipios al store
  const municipios = useAppStore(s => s.municipios);
  const total = ALL_STEPS.length;

  const hasDg = Object.values(dg).some(v => v.length > 0);
  const temporadas = useMemo(() => buildTemporadas(), []);

  // ── Catálogo razas de maíz ───────────────────────────────────────────
  const { data: razasRaw, isLoading: cargandoRazas } = useQuery({
    queryKey: ["razas-maiz"],
    queryFn: () => GET("/agro/raza_maiz"),
    enabled: accesoPermitido,
    staleTime: Infinity,
  });
  const razas = useMemo(() => toArray<{ id: number; nombre: string }>(razasRaw), [razasRaw]);
  const razaOpts = useMemo(() => [
    { value: "", label: cargandoRazas ? "Cargando razas…" : "Selecciona una raza…" },
    ...razas.map(r => ({ value: String(r.id), label: r.nombre })),
  ], [razas, cargandoRazas]);

  // ── Municipios ──────────────────────────────────────────────────────
  const municipioOpts = useMemo(() => [
    { value: "", label: "Selecciona municipio…" },
    ...municipios.map(m => ({ value: String(m.id), label: m.nombre })),
  ], [municipios]);

  // ── Localidades on-demand por municipio ────────────────────────────
  const { data: localidadesRaw, isLoading: cargandoLocalidades } = useQuery({
    queryKey: ["localidades", dg.municipio_id],
    queryFn: () => GET(`/geo/localidad?municipio_id=${dg.municipio_id}`),
    enabled: accesoPermitido && !!dg.municipio_id,
    staleTime: Infinity,
  });
  const localidades = useMemo(
    () => toArray<{ id: number; nombre: string }>(localidadesRaw),
    [localidadesRaw]
  );
  const localidadOpts = useMemo(() => [
    { value: "", label: dg.municipio_id ? (cargandoLocalidades ? "Cargando…" : "Selecciona localidad…") : "Primero elige municipio" },
    ...localidades.map(l => ({ value: String(l.id), label: l.nombre })),
  ], [localidades, dg.municipio_id, cargandoLocalidades]);

  const handleMunicipioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateDg("municipio_id", e.target.value);
    updateDg("localidad_id", "");
  };

  const handleSave = async () => {
    await POST("/fenotipo", { dg, data });
    clearAll();
  };

  // Raza seleccionada (para label en reporte)
  const razaLabel = razas.find(r => String(r.id) === dg.raza_id)?.nombre ?? "";

  if (!accesoPermitido) return <AccessGuardScreen message="Verificando permisos..." />

  return (
    <AdminShell>
      <div className={styles.page}>
        <ModuleHero
          eyebrow="Fenotipo · Registro técnico"
          title={<>Registro <em>Fenotípico</em> 🌽</>}
          description="Captura descriptores morfológicos y agronómicos de variedades de maíz con un flujo seccionado y trazable." 
          stats={[
            { label: 'sección', value: `${step + 1}/${total}` },
            { label: 'razas', value: razas.length || '—' },
            { label: 'municipios', value: municipios.length || '—' },
          ]}
          actions={hasDg ? (
            <button type="button" className={styles.clearBtn} onClick={clearAll}>
              🗑 Limpiar
            </button>
          ) : undefined}
        />

        {/* ── Cuerpo: formulario + resumen lateral ── */}
        <div className={styles.layout}>
        <div className={styles.formPanel}>

        {/* ── Stepper ── */}
        <div className={styles.stepper}>
          {ALL_STEPS.map((s, i) => (
            <Fragment key={s.key}>
              <div
                className={[
                  styles.stepItem,
                  i < step  ? styles.done   : "",
                  i === step ? styles.active : "",
                ].join(" ")}
                onClick={() => setStep(i)}
                title={s.label}
              >
                <div className={styles.stepCircle}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={styles.stepLabel}>
                  {s.icon} {s.label}
                </span>
              </div>
              {i < total - 1 && (
                <div
                  className={[
                    styles.stepConnector,
                    i < step ? styles.done : "",
                  ].join(" ")}
                />
              )}
            </Fragment>
          ))}
        </div>

        {/* ── Barra de progreso ── */}
        <div className={styles.progress}>
          <div className={styles.progressMeta}>
            <span>Avance del formulario</span>
            <span>{step + 1} / {total} secciones</span>
          </div>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressBar}
              style={{ width: `${((step + 1) / total) * 100}%` }}
            />
          </div>
        </div>

        {/* ── Tarjeta con formulario ── */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardHeadTitle}>
              {ALL_STEPS[step].icon} {ALL_STEPS[step].label}
            </span>
            <span className={styles.cardHeadPill}>
              sección {step + 1} de {total}
            </span>
          </div>

          <div className={styles.cardBody}>
            {step === 0 ? (
              /* ── Datos Generales ── */
              <div className={styles.dgGrid}>

                {/* ─ Identidad ─ */}
                <div className={styles.dgSection}>
                  <p className={styles.dgSectionTitle}>🌽 Identidad de la variedad</p>

                  <div className={styles.dgFieldWrap}>
                    <label className={styles.dgLabel}>Raza de maíz</label>
                    <SelectField
                      label=""
                      name="raza_id"
                      value={dg.raza_id}
                      options={razaOpts}
                      onChange={e => updateDg("raza_id", e.target.value)}
                      className={styles.dgSelectLg}
                    />
                  </div>

                  <div className={styles.dgFieldWrap}>
                    <label className={styles.dgLabel}>Tipo de variedad</label>
                    <div className={styles.dgPills}>
                      {TIPOS_VARIEDAD.map(t => (
                        <button
                          key={t}
                          type="button"
                          className={[styles.dgPill, dg.tipo === t ? styles.dgPillActive : ""].join(" ")}
                          onClick={() => updateDg("tipo", t)}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.dgFieldWrap}>
                    <label className={styles.dgLabel} htmlFor="dg-colector">
                      Colector / Responsable
                    </label>
                    <input
                      id="dg-colector"
                      className={styles.dgInput}
                      value={dg.colector}
                      placeholder="Nombre completo del responsable"
                      onChange={e => updateDg("colector", e.target.value)}
                    />
                  </div>
                </div>

                {/* ─ Ubicación ─ */}
                <div className={styles.dgSection}>
                  <p className={styles.dgSectionTitle}>📍 Ubicación de colecta</p>

                  <div className={styles.dgRow}>
                    <div className={styles.dgFieldWrap}>
                      <label className={styles.dgLabel}>Municipio</label>
                      <SelectField
                        label=""
                        name="municipio_id"
                        value={dg.municipio_id}
                        options={municipioOpts}
                        onChange={handleMunicipioChange}
                        className={styles.dgSelectLg}
                      />
                    </div>
                    <div className={styles.dgFieldWrap}>
                      <label className={styles.dgLabel}>
                        Localidad
                        {cargandoLocalidades && <span className={styles.dgSpinner}>⟳</span>}
                      </label>
                      <SelectField
                        label=""
                        name="localidad_id"
                        value={dg.localidad_id}
                        options={localidadOpts}
                        disabled={!dg.municipio_id || cargandoLocalidades}
                        onChange={e => updateDg("localidad_id", e.target.value)}
                        className={styles.dgSelectLg}
                      />
                    </div>
                  </div>

                  <div className={styles.dgFieldWrap} style={{ maxWidth: 200 }}>
                    <label className={styles.dgLabel} htmlFor="dg-altitud">
                      Altitud <span className={styles.dgUnit}>(msnm)</span>
                    </label>
                    <input
                      id="dg-altitud"
                      className={styles.dgInput}
                      type="number"
                      min={0}
                      max={5000}
                      value={dg.altitud}
                      placeholder="Ej. 1200"
                      onChange={e => updateDg("altitud", e.target.value)}
                    />
                  </div>
                </div>

                {/* ─ Condiciones de cultivo ─ */}
                <div className={styles.dgSection}>
                  <p className={styles.dgSectionTitle}>🌾 Condiciones de cultivo</p>

                  <div className={styles.dgFieldWrap}>
                    <label className={styles.dgLabel}>Temporada</label>
                    <div className={styles.dgPills}>
                      {temporadas.map(t => (
                        <button
                          key={t.value}
                          type="button"
                          className={[styles.dgPill, dg.temporada === t.value ? styles.dgPillActive : ""].join(" ")}
                          onClick={() => updateDg("temporada", t.value)}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.dgRow}>
                    <div className={styles.dgFieldWrap}>
                      <label className={styles.dgLabel} htmlFor="dg-plantas">
                        N° de plantas
                      </label>
                      <div className={styles.dgCounter}>
                        <button type="button" className={styles.dgCountBtn}
                          onClick={() => updateDg("plantas", String(Math.max(0, Number(dg.plantas || 0) - 1)))}>−</button>
                        <input
                          id="dg-plantas"
                          className={styles.dgCountInput}
                          type="number"
                          min={0}
                          value={dg.plantas}
                          placeholder="20"
                          onChange={e => updateDg("plantas", e.target.value)}
                        />
                        <button type="button" className={styles.dgCountBtn}
                          onClick={() => updateDg("plantas", String(Number(dg.plantas || 0) + 1))}>+</button>
                      </div>
                    </div>
                    <div className={styles.dgFieldWrap}>
                      <label className={styles.dgLabel} htmlFor="dg-reps">
                        Repeticiones
                      </label>
                      <div className={styles.dgCounter}>
                        <button type="button" className={styles.dgCountBtn}
                          onClick={() => updateDg("reps", String(Math.max(1, Number(dg.reps || 1) - 1)))}>−</button>
                        <input
                          id="dg-reps"
                          className={styles.dgCountInput}
                          type="number"
                          min={1}
                          value={dg.reps}
                          placeholder="3"
                          onChange={e => updateDg("reps", e.target.value)}
                        />
                        <button type="button" className={styles.dgCountBtn}
                          onClick={() => updateDg("reps", String(Number(dg.reps || 1) + 1))}>+</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ─ Notas ─ */}
                <div className={styles.dgSection}>
                  <p className={styles.dgSectionTitle}>📝 Notas adicionales</p>
                  <div className={styles.dgFieldWrap}>
                    <label className={styles.dgLabel} htmlFor="dg-notas">Observaciones generales</label>
                    <textarea
                      id="dg-notas"
                      className={styles.dgTextarea}
                      rows={3}
                      value={dg.notas}
                      placeholder="Condiciones especiales, referencias, observaciones del campo…"
                      onChange={e => updateDg("notas", e.target.value)}
                    />
                  </div>
                </div>

              </div>
            ) : (
              <SectionForm grupo={grupos[step - 1]} data={data} update={update} />
            )}
          </div>

          <div className={styles.cardFoot}>
            <Button
              variante="secundario"
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
            >
              ← Anterior
            </Button>

            {step < total - 1 ? (
              <Button variante="primario" onClick={() => setStep(step + 1)}>
                Siguiente →
              </Button>
            ) : (
              <Button variante="primario" onClick={handleSave}>
                💾 Guardar registro
              </Button>
            )}
          </div>{/* /cardFoot */}
        </div>{/* /card */}
        </div>{/* /formPanel */}

        {/* ── Panel de resumen lateral (siempre visible) ── */}
        <div className={styles.summaryPanel}>
          <ReportView data={data} dg={dg} razaLabel={razaLabel} />
        </div>

        </div>{/* /layout */}

      </div>{/* /page */}
    </AdminShell>
  );
}
