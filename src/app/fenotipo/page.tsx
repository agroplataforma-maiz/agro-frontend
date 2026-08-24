"use client";

import React, { Fragment, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminShell from "@/components/dashboard/AdminShell";
import { useFenotipo } from "@/hooks/useFenotipo";
import { useCatalogos } from "@/hooks/useCatalogos";
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";
import SectionForm from "@/components/fenotipo/SectionForm";
import ReportView from "@/components/fenotipo/ReportView";
import { grupos } from "@/data/descriptor";
import { Button } from "@/components/ui";
import Tabla, { type Columna } from '@/components/ui/Tabla'
import ModuleHero from '@/components/ui/ModuleHero'
import SearchInput from '@/components/ui/SearchInput'
import SelectField from "@/components/ui/SelectField";
import { useUsuariosTecnicos } from "@/hooks/useUsuariosTecnicos";
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

interface FenotipoListItem {
  id: number;
  dg?: {
    raza_id?: string;
    tipo?: string;
    colector?: string;
    municipio_id?: string;
    temporada?: string;
    plantas?: string;
    reps?: string;
  };
}

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


import { useEffect } from "react";

export default function Page() {
  const accesoPermitido = useRolGuard(['administrador', 'investigador', 'tecnico_campo'])

  const { data, step, setStep, update, dg, updateDg, clearAll } = useFenotipo();
  useCatalogos(); // carga municipios al store
  const usuario = useAppStore(s => s.usuario);
  const { tecnicos: responsables, isLoading: cargandoResponsables } = useUsuariosTecnicos();
  const addToast = useAppStore(s => s.addToast);
  const municipios = useAppStore(s => s.municipios);
  const total = ALL_STEPS.length;
  const esAdmin = usuario?.rol === 'administrador';
  const puedeCrear = !esAdmin;
  const [busqueda, setBusqueda] = useState("");

  const hasDg = Object.values(dg).some(v => v.length > 0);
  const temporadas = useMemo(() => buildTemporadas(), []);

  // Redirige a '/' si no hay usuario (tras logout)
  const router = useRouter();
  useEffect(() => {
    if (usuario === null) {
      router.replace('/login');
    }
  }, [usuario, router]);

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

  const { data: registrosRaw = [], isLoading: cargandoRegistros } = useQuery<FenotipoListItem[]>({
    queryKey: ["fenotipo-registros"],
    queryFn: () => GET("/fenotipo") as Promise<FenotipoListItem[]>,
    enabled: accesoPermitido && esAdmin,
    select: (d: unknown) => toArray<FenotipoListItem>(d),
  });

  const handleMunicipioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateDg("municipio_id", e.target.value);
    updateDg("localidad_id", "");
  };

  const handleSave = async () => {
    if (!puedeCrear) {
      addToast('Solo investigadores y técnicos de campo pueden crear registros fenotípicos.', 'err');
      return;
    }

    await POST("/fenotipo", { dg, data });
    clearAll();
  };

  // Raza seleccionada (para label en reporte)
  const razaLabel = razas.find(r => String(r.id) === dg.raza_id)?.nombre ?? "";

  if (!usuario) return null;
  if (!accesoPermitido) return <AccessGuardScreen message="Verificando permisos..." />

  const nombreRaza = (item: FenotipoListItem) => {
    const raza = razas.find((r) => String(r.id) === String(item.dg?.raza_id))
    return raza?.nombre ?? '—'
  }

  const nombreMunicipio = (item: FenotipoListItem) => {
    const municipio = municipios.find((m) => String(m.id) === String(item.dg?.municipio_id))
    return municipio?.nombre ?? '—'
  }

  const registrosFiltrados = registrosRaw.filter((item) => {
    const texto = [
      nombreRaza(item),
      item.dg?.tipo ?? '',
      item.dg?.colector ?? '',
      nombreMunicipio(item),
      item.dg?.temporada ?? '',
    ].join(' ').toLowerCase()

    return texto.includes(busqueda.toLowerCase())
  })

  const columnasAdmin: Columna<FenotipoListItem>[] = [
    { key: 'id', header: 'ID', width: '60px', hideOnMobile: true, hideOnTablet: true },
    {
      key: 'raza',
      header: 'Raza',
      render: (item) => nombreRaza(item),
    },
    {
      key: 'tipo',
      header: 'Tipo',
      width: '110px',
      render: (item) => item.dg?.tipo || '—',
    },
    {
      key: 'colector',
      header: 'Responsable',
      render: (item) => item.dg?.colector || '—',
    },
    {
      key: 'municipio',
      header: 'Municipio',
      hideOnTablet: true,
      render: (item) => nombreMunicipio(item),
    },
    {
      key: 'temporada',
      header: 'Temporada',
      width: '100px',
      render: (item) => item.dg?.temporada || '—',
    },
  ]

  if (esAdmin) {
    return (
      <AdminShell contentPadding="0">
        <div className={styles.page}>
          <ModuleHero
            eyebrow="Fenotipo · Consulta administrativa"
            title={<>Tabla de <em>Registros</em> 🌽</>}
            description="Como administrador visualizas solo el listado de evaluaciones fenotípicas registradas, sin mostrar el flujo de captura por secciones."
            stats={[
              { label: 'registros', value: registrosRaw.length || '—' },
              { label: 'razas', value: razas.length || '—' },
              { label: 'municipios', value: municipios.length || '—' },
            ]}
          />

          <div className={styles.readOnlyNotice}>
            🔒 Vista administrativa: solo consulta de registros fenotípicos. El flujo de captura queda reservado para investigación y técnicos de campo.
          </div>

          <header className={styles.header}>
            <div>
              <h2 className={styles.title}>Registros fenotípicos</h2>
              <p className={styles.subtitle}>{registrosFiltrados.length} evaluaciones visibles</p>
            </div>
            <div className={styles.headerActions}>
              <SearchInput
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por raza, responsable o municipio…"
              />
            </div>
          </header>

          <div className={styles.kpiBand}>
            <div className={styles.kpiItem}>
              <span className={styles.kpiNum}>{registrosRaw.length || '—'}</span>
              <span className={styles.kpiLbl}>Evaluaciones</span>
            </div>
            <div className={styles.kpiItem}>
              <span className={styles.kpiNum}>{razas.length || '—'}</span>
              <span className={styles.kpiLbl}>Razas disponibles</span>
            </div>
            <div className={styles.kpiItem}>
              <span className={styles.kpiNum}>{municipios.length || '—'}</span>
              <span className={styles.kpiLbl}>Municipios disponibles</span>
            </div>
          </div>

          <div className={styles.adminTableWrap}>
            <Tabla
              datos={registrosFiltrados}
              columnas={columnasAdmin}
              cargando={cargandoRegistros}
              vacio="No hay registros fenotípicos disponibles"
              infoText={`${registrosFiltrados.length} registros encontrados`}
            />
          </div>
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      <div className={styles.page}>
        <ModuleHero
          eyebrow="Fenotipo · Registro técnico"
          title={<>Registro <em>Fenotípico</em> 🌽</>}
          description={esAdmin
            ? 'Consulta el flujo técnico y el resumen fenotípico. Las nuevas altas están reservadas para investigadores y técnicos de campo.'
            : 'Captura descriptores morfológicos y agronómicos de variedades de maíz con un flujo seccionado y trazable.'}
          stats={[
            { label: 'sección', value: `${step + 1}/${total}` },
            { label: 'razas', value: razas.length || '—' },
            { label: 'municipios', value: municipios.length || '—' },
          ]}
          actions={puedeCrear && hasDg ? (
            <button type="button" className={styles.clearBtn} onClick={clearAll}>
              🗑 Limpiar
            </button>
          ) : undefined}
        />
        {esAdmin && (
          <div className={styles.readOnlyNotice}>
            🔒 El alta de registros fenotípicos está reservada para investigadores y técnicos de campo; como administrador solo puedes revisar el flujo y la información.
          </div>
        )}

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
                    {usuario?.rol === 'investigador' ? (
                      <SelectField
                        label=""
                        name="colector"
                        value={dg.colector || ''}
                        options={[
                          { value: '', label: cargandoResponsables ? 'Cargando…' : responsables.length === 0 ? 'No hay técnicos disponibles' : 'Selecciona técnico responsable…' },
                          ...responsables.map((u) => ({
                            value: String(u.id),
                            label: u.nombre_completo || u.username
                          }))
                        ]}
                        onChange={e => updateDg("colector", e.target.value)}
                        className={styles.selectLg}
                      />
                    ) : usuario?.rol === 'tecnico_campo' ? (
                      <input
                        id="dg-colector"
                        className={styles.dgInput}
                        value={usuario.nombre_completo || usuario.username}
                        placeholder="Nombre completo del responsable"
                        readOnly
                        disabled
                      />
                    ) : (
                      <input
                        id="dg-colector"
                        className={styles.dgInput}
                        value={dg.colector}
                        placeholder="Nombre completo del responsable"
                        onChange={e => updateDg("colector", e.target.value)}
                      />
                    )}
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
              <Button variante={puedeCrear ? "primario" : "secundario"} onClick={handleSave} disabled={!puedeCrear}>
                {puedeCrear ? '💾 Guardar registro' : '🔒 Alta restringida para admin'}
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
