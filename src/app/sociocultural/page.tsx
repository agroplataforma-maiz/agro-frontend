"use client";

import React, { Fragment, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminShell from "@/components/dashboard/AdminShell";
import { useSociocultural } from "@/hooks/useSociocultural";
import { useCatalogos } from "@/hooks/useCatalogos";
import { useAppStore } from "@/store/useAppStore";
import ResumenSocial from "@/components/sociocultural/ResumenSocial";
import { Button } from "@/components/ui";
import ModuleHero from '@/components/ui/ModuleHero'
import SelectField from "@/components/ui/SelectField";
import { GET, POST } from "@/lib/api";
import styles from "./sociocultural.module.css";
import { useRolGuard } from "@/hooks/useRolGuard";

// ── Catálogos de opciones ──────────────────────────────────────────────
const TENENCIAS = ["Ejidal", "Comunal", "Privada", "Rentada", "Al partir"];
const SISTEMAS = ["Milpa", "Monocultivo", "Huerto familiar", "Sistema agroforestal", "Otro"];
const ASOCIACIONES_OPTS = ["Frijol", "Calabaza", "Chile", "Quelites", "Jitomate", "Hierba santa", "Otro"];
const PREPARACION_OPTS = ["Barbecho", "Rastra", "Tracción animal", "Manual (coa)", "Sin labranza"];
const SIEMBRA_OPTS = ["Manual (coa)", "Mecánica", "Al voleo"];
const AGROQUIMICOS_OPTS = ["No usa", "Herbicidas", "Fertilizante sintético", "Insecticida", "Fungicida", "Otro"];
const RIEGO_OPTS = ["Temporal (lluvia)", "Riego por gravedad", "Riego por aspersión", "Riego por goteo"];
const ALMACENAMIENTO_OPTS = ["Troje / granero", "Olote en mazorca", "Bolsa hermética", "Costal", "A ras de suelo"];
const ORIGEN_SEMILLA_OPTS = ["Propia (herencia familiar)", "Intercambio con vecino", "Programa de gobierno", "Mercado / tianguis", "Banco de germoplasma"];
const CRITERIOS_OPTS = ["Tamaño de grano", "Color de grano", "Vigor de planta", "Rendimiento", "Sabor / calidad", "Resistencia a plagas", "Adaptación local"];
const INTERCAMBIO_OPTS = ["Sí, regularmente", "Sí, ocasionalmente", "No intercambia"];
const USOS_OPTS = ["Autoconsumo", "Tortilla", "Pozole/atole", "Tamales", "Elote", "Forraje", "Semilla", "Venta en fresco", "Ceremonial"];
const DESTINO_OPTS = ["Autoconsumo familiar", "Venta local / tianguis", "Venta regional", "Industria", "Trueque", "Banco de semillas"];
const SELECCION_SEMILLA_OPTS = ["En campo (antes de cosecha)", "En cosecha", "En almacén", "No selecciona", "Otro"];
const CONSENTIMIENTO_OPTS = ["Sí, autorizo", "No autorizo"];

function toArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  const d = data as Record<string, unknown>;
  return (d?.items ?? d?.results ?? []) as T[];
}

const STEPS = [
  { key: "productor",  label: "Productor",    icon: "👤" },
  { key: "territorio", label: "Territorio",   icon: "📍" },
  { key: "practicas",  label: "Prácticas",    icon: "🌾" },
  { key: "saberes",    label: "Saberes",      icon: "📖" },
  { key: "economia",   label: "Economía",     icon: "💰" },
];

// ── Pills helper ───────────────────────────────────────────────────────
function Pills({
  opciones, valor, onChange, multi = false,
}: {
  opciones: string[];
  valor: string | string[];
  onChange: (v: string) => void;
  multi?: boolean;
}) {
  const activos = multi ? (valor as string[]) : [];
  return (
    <div className={styles.pills}>
      {opciones.map((op) => {
        const activo = multi ? activos.includes(op) : valor === op;
        return (
          <button
            key={op}
            type="button"
            className={[styles.pill, activo ? styles.pillActive : ""].join(" ")}
            onClick={() => onChange(op)}
          >
            {activo && !multi && <span className={styles.pillCheck}>✓ </span>}
            {op}
          </button>
        );
      })}
    </div>
  );
}

// ── Componente de campo con label ──────────────────────────────────────
function Campo({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className={styles.campo}>
      <label className={styles.campoLabel}>{label}</label>
      {hint && <span className={styles.campoHint}>{hint}</span>}
      {children}
    </div>
  );
}

export default function Page() {
  useRolGuard(['administrador', 'investigador', 'tecnico_campo'])
  const { registro, step, setStep, updateSeccion, toggleArray, clearAll, progreso } =
    useSociocultural();
  useCatalogos();
  const municipios = useAppStore((s) => s.municipios);
  const total = STEPS.length;

  // ── Catálogo productores ──────────────────────────────────────────────
  const { data: productoresRaw } = useQuery({
    queryKey: ["productores-lista"],
    queryFn: () => GET("/social/productor/?limit=200"),
    staleTime: Infinity,
  });
  const productores = useMemo(
    () => toArray<{ id: number; nombres: string; apellido_paterno: string }>(productoresRaw),
    [productoresRaw]
  );
  const productorOpts = useMemo(() => [
    { value: "", label: "Selecciona un productor…" },
    ...productores.map((p) => ({
      value: String(p.id),
      label: `${p.nombres} ${p.apellido_paterno}`,
    })),
  ], [productores]);

  // ── Catálogo lenguas ──────────────────────────────────────────────────
  const { data: lenguasRaw } = useQuery({
    queryKey: ["lenguas"],
    queryFn: () => GET("/social/lengua/"),
    staleTime: Infinity,
  });
  const lenguas = useMemo(
    () => toArray<{ id: number; nombre: string }>(lenguasRaw),
    [lenguasRaw]
  );
  const lenguaOpts = useMemo(() => [
    { value: "", label: "Selecciona una lengua…" },
    ...lenguas.map((l) => ({ value: String(l.id), label: l.nombre })),
  ], [lenguas]);

  // ── Municipios / localidades en cascada ───────────────────────────────
  const municipioOpts = useMemo(() => [
    { value: "", label: "Selecciona municipio…" },
    ...municipios.map((m) => ({ value: String(m.id), label: m.nombre })),
  ], [municipios]);

  const { data: localidadesRaw, isLoading: cargandoLocalidades } = useQuery({
    queryKey: ["localidades", registro.territorio.municipio_id],
    queryFn: () =>
      GET(`/geo/localidad/?municipio_id=${registro.territorio.municipio_id}`),
    enabled: !!registro.territorio.municipio_id,
    staleTime: Infinity,
  });
  const localidades = useMemo(
    () => toArray<{ id: number; nombre: string }>(localidadesRaw),
    [localidadesRaw]
  );
  const localidadOpts = useMemo(() => [
    {
      value: "",
      label: registro.territorio.municipio_id
        ? cargandoLocalidades
          ? "Cargando…"
          : "Selecciona localidad…"
        : "Primero elige municipio",
    },
    ...localidades.map((l) => ({ value: String(l.id), label: l.nombre })),
  ], [localidades, registro.territorio.municipio_id, cargandoLocalidades]);

  const handleSave = async () => {
    await POST("/social/registro_sociocultural/", registro);
    clearAll();
  };

  const hayDatos = Object.values(registro.productor).some((v) => v !== "");
  const pg = STEPS.map((s) => progreso(s.key as Parameters<typeof progreso>[0]));

  return (
    <AdminShell>
      <div className={styles.page}>
        <ModuleHero
          eyebrow="Sociocultural · Registro de campo"
          title={<>Registro <em>Sociocultural</em> 🎭</>}
          description="Documenta prácticas, saberes, territorio y economía local para contextualizar el manejo tradicional del maíz." 
          stats={[
            { label: 'sección', value: `${step + 1}/${total}` },
            { label: 'productores', value: productores.length || '—' },
            { label: 'municipios', value: municipios.length || '—' },
          ]}
          actions={hayDatos ? (
            <button type="button" className={styles.clearBtn} onClick={clearAll}>
              🗑 Limpiar
            </button>
          ) : undefined}
        />
        <div className={styles.layout}>

          {/* ── Panel izquierdo: formulario ── */}
          <div className={styles.formPanel}>

            {/* Stepper */}
            <div className={styles.stepper}>
              {STEPS.map((s, i) => (
                <Fragment key={s.key}>
                  <div
                    className={[
                      styles.stepItem,
                      i < step ? styles.done : "",
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

            {/* Barra de progreso de la sección actual */}
            <div className={styles.progress}>
              <div className={styles.progressMeta}>
                <span>{STEPS[step].icon} {STEPS[step].label}</span>
                <span>{pg[step].llenos} / {pg[step].total} campos &nbsp;·&nbsp; {pg[step].pct}%</span>
              </div>
              <div className={styles.progressTrack}>
                <div className={styles.progressBar} style={{ width: `${pg[step].pct}%` }} />
              </div>
            </div>

            {/* Tarjeta del formulario */}
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.cardHeadTitle}>
                  {STEPS[step].icon} {STEPS[step].label}
                </span>
                <span className={styles.cardHeadPill}>
                  sección {step + 1} de {total}
                </span>
              </div>

              <div className={styles.cardBody}>

                {/* ── 1. Productor ── */}
                {step === 0 && (
                  <div className={styles.seccion}>
                    <p className={styles.seccionTitulo}>👤 Datos del productor entrevistado</p>

                    <Campo label="Productor">
                      <SelectField
                        label="" name="productor_id"
                        value={registro.productor.productor_id}
                        options={productorOpts}
                        onChange={(e) => updateSeccion("productor", "productor_id", e.target.value)}
                        className={styles.selectLg}
                      />
                    </Campo>

                    <Campo label="Entrevistador / técnico responsable">
                      <input
                        className={styles.input}
                        value={registro.productor.entrevistador}
                        placeholder="Nombre del entrevistador"
                        onChange={(e) => updateSeccion("productor", "entrevistador", e.target.value)}
                      />
                    </Campo>

                    <Campo label="Fecha de la entrevista">
                      <input
                        className={styles.input}
                        type="date"
                        value={registro.productor.fecha}
                        onChange={(e) => updateSeccion("productor", "fecha", e.target.value)}
                      />
                    </Campo>

                    <Campo label="Consentimiento informado">
                      <Pills
                        opciones={CONSENTIMIENTO_OPTS}
                        valor={registro.productor.consentimiento}
                        onChange={(v) => updateSeccion("productor", "consentimiento", v)}
                      />
                    </Campo>
                  </div>
                )}

                {/* ── 2. Territorio ── */}
                {step === 1 && (
                  <div className={styles.seccion}>
                    <p className={styles.seccionTitulo}>📍 Territorio y comunidad</p>

                    <div className={styles.fila2}>
                      <Campo label="Municipio">
                        <SelectField
                          label="" name="municipio_id"
                          value={registro.territorio.municipio_id}
                          options={municipioOpts}
                          onChange={(e) => {
                            updateSeccion("territorio", "municipio_id", e.target.value);
                            updateSeccion("territorio", "localidad_id", "");
                          }}
                          className={styles.selectLg}
                        />
                      </Campo>
                      <Campo label={`Localidad${cargandoLocalidades ? " ⟳" : ""}`}>
                        <SelectField
                          label="" name="localidad_id"
                          value={registro.territorio.localidad_id}
                          options={localidadOpts}
                          disabled={!registro.territorio.municipio_id || cargandoLocalidades}
                          onChange={(e) => updateSeccion("territorio", "localidad_id", e.target.value)}
                          className={styles.selectLg}
                        />
                      </Campo>
                    </div>

                    <Campo label="Comunidad / paraje">
                      <input
                        className={styles.input}
                        value={registro.territorio.comunidad}
                        placeholder="Nombre del paraje o comunidad"
                        onChange={(e) => updateSeccion("territorio", "comunidad", e.target.value)}
                      />
                    </Campo>

                    <Campo label="Lengua materna">
                      <SelectField
                        label="" name="lengua_id"
                        value={registro.territorio.lengua_id}
                        options={lenguaOpts}
                        onChange={(e) => updateSeccion("territorio", "lengua_id", e.target.value)}
                        className={styles.selectLg}
                      />
                    </Campo>

                    <div className={styles.fila2}>
                      <Campo label="Altitud (msnm)">
                        <input
                          className={styles.input}
                          type="number" min={0} max={5000}
                          value={registro.territorio.altitud}
                          placeholder="Ej. 1200"
                          onChange={(e) => updateSeccion("territorio", "altitud", e.target.value)}
                        />
                      </Campo>
                      <Campo label="Superficie cultivada (ha)">
                        <input
                          className={styles.input}
                          type="number" min={0} step={0.1}
                          value={registro.territorio.superficie_ha}
                          placeholder="Ej. 1.5"
                          onChange={(e) => updateSeccion("territorio", "superficie_ha", e.target.value)}
                        />
                      </Campo>
                    </div>

                    <Campo label="Régimen de tenencia de la tierra">
                      <Pills
                        opciones={TENENCIAS}
                        valor={registro.territorio.tenencia}
                        onChange={(v) => updateSeccion("territorio", "tenencia", v)}
                      />
                    </Campo>
                  </div>
                )}

                {/* ── 3. Prácticas de cultivo ── */}
                {step === 2 && (
                  <div className={styles.seccion}>
                    <p className={styles.seccionTitulo}>🌾 Prácticas de cultivo</p>

                    <Campo label="Sistema de cultivo">
                      <Pills
                        opciones={SISTEMAS}
                        valor={registro.practicas.sistema_cultivo}
                        onChange={(v) => updateSeccion("practicas", "sistema_cultivo", v)}
                      />
                    </Campo>

                    <Campo label="Especies asociadas" hint="Selecciona todas las que apliquen">
                      <Pills
                        opciones={ASOCIACIONES_OPTS}
                        valor={registro.practicas.asociaciones}
                        onChange={(v) => toggleArray("practicas", "asociaciones", v)}
                        multi
                      />
                    </Campo>

                    <Campo label="Preparación del suelo">
                      <Pills
                        opciones={PREPARACION_OPTS}
                        valor={registro.practicas.preparacion_suelo}
                        onChange={(v) => updateSeccion("practicas", "preparacion_suelo", v)}
                      />
                    </Campo>

                    <div className={styles.fila2}>
                      <Campo label="Tipo de siembra">
                        <Pills
                          opciones={SIEMBRA_OPTS}
                          valor={registro.practicas.siembra_tipo}
                          onChange={(v) => updateSeccion("practicas", "siembra_tipo", v)}
                        />
                      </Campo>
                      <Campo label="Fecha aproximada de siembra">
                        <input
                          className={styles.input}
                          type="date"
                          value={registro.practicas.fecha_siembra}
                          onChange={(e) => updateSeccion("practicas", "fecha_siembra", e.target.value)}
                        />
                      </Campo>
                    </div>

                    <Campo label="Densidad de plantas" hint="plantas / ha">
                      <input
                        className={styles.input}
                        type="number" min={0}
                        value={registro.practicas.densidad_plantas}
                        placeholder="Ej. 40000"
                        onChange={(e) => updateSeccion("practicas", "densidad_plantas", e.target.value)}
                      />
                    </Campo>

                    <Campo label="Uso de agroquímicos" hint="Selecciona todos los que apliquen">
                      <Pills
                        opciones={AGROQUIMICOS_OPTS}
                        valor={registro.practicas.uso_agroquimicos}
                        onChange={(v) => updateSeccion("practicas", "uso_agroquimicos", v)}
                      />
                    </Campo>

                    <Campo label="Fertilización / abonado">
                      <input
                        className={styles.input}
                        value={registro.practicas.fertilizacion}
                        placeholder="Describe la práctica de fertilización"
                        onChange={(e) => updateSeccion("practicas", "fertilizacion", e.target.value)}
                      />
                    </Campo>

                    <Campo label="Riego">
                      <Pills
                        opciones={RIEGO_OPTS}
                        valor={registro.practicas.riego}
                        onChange={(v) => updateSeccion("practicas", "riego", v)}
                      />
                    </Campo>

                    <Campo label="Método de almacenamiento">
                      <Pills
                        opciones={ALMACENAMIENTO_OPTS}
                        valor={registro.practicas.almacenamiento}
                        onChange={(v) => updateSeccion("practicas", "almacenamiento", v)}
                      />
                    </Campo>
                  </div>
                )}

                {/* ── 4. Saberes y tradición ── */}
                {step === 3 && (
                  <div className={styles.seccion}>
                    <p className={styles.seccionTitulo}>📖 Saberes y tradición</p>

                    <Campo label="Nombre local de la variedad">
                      <input
                        className={styles.input}
                        value={registro.saberes.nombre_local}
                        placeholder="Como la llama la comunidad"
                        onChange={(e) => updateSeccion("saberes", "nombre_local", e.target.value)}
                      />
                    </Campo>

                    <Campo label="Origen de la semilla">
                      <Pills
                        opciones={ORIGEN_SEMILLA_OPTS}
                        valor={registro.saberes.origen_semilla}
                        onChange={(v) => updateSeccion("saberes", "origen_semilla", v)}
                      />
                    </Campo>

                    <Campo label="Años cultivando esta variedad">
                      <input
                        className={styles.input}
                        type="number" min={0}
                        value={registro.saberes.anios_cultivo}
                        placeholder="Ej. 30"
                        onChange={(e) => updateSeccion("saberes", "anios_cultivo", e.target.value)}
                      />
                    </Campo>

                    <Campo label="¿Cómo selecciona la semilla para el siguiente ciclo?">
                      <Pills
                        opciones={SELECCION_SEMILLA_OPTS}
                        valor={registro.saberes.seleccion_semilla}
                        onChange={(v) => updateSeccion("saberes", "seleccion_semilla", v)}
                      />
                    </Campo>

                    <Campo label="Criterios de selección" hint="Selecciona todos los que apliquen">
                      <Pills
                        opciones={CRITERIOS_OPTS}
                        valor={registro.saberes.criterios_seleccion}
                        onChange={(v) => toggleArray("saberes", "criterios_seleccion", v)}
                        multi
                      />
                    </Campo>

                    <Campo label="Intercambio de semilla con otros productores">
                      <Pills
                        opciones={INTERCAMBIO_OPTS}
                        valor={registro.saberes.intercambio_semilla}
                        onChange={(v) => updateSeccion("saberes", "intercambio_semilla", v)}
                      />
                    </Campo>

                    <Campo label="Usos de la variedad" hint="Selecciona todos los que apliquen">
                      <Pills
                        opciones={USOS_OPTS}
                        valor={registro.saberes.usos}
                        onChange={(v) => toggleArray("saberes", "usos", v)}
                        multi
                      />
                    </Campo>

                    <Campo label="Preparaciones o platillos especiales">
                      <textarea
                        className={styles.textarea}
                        rows={2}
                        value={registro.saberes.preparaciones}
                        placeholder="Tamales, atole, pozole, bebidas…"
                        onChange={(e) => updateSeccion("saberes", "preparaciones", e.target.value)}
                      />
                    </Campo>

                    <Campo label="Valor cultural / simbólico">
                      <textarea
                        className={styles.textarea}
                        rows={2}
                        value={registro.saberes.valor_cultural}
                        placeholder="¿Qué significa esta variedad para la comunidad?"
                        onChange={(e) => updateSeccion("saberes", "valor_cultural", e.target.value)}
                      />
                    </Campo>

                    <Campo label="Prácticas rituales o festivas">
                      <input
                        className={styles.input}
                        value={registro.saberes.rituales}
                        placeholder="Ofrendas, festividades, ceremonias…"
                        onChange={(e) => updateSeccion("saberes", "rituales", e.target.value)}
                      />
                    </Campo>

                    <Campo label="Observaciones adicionales">
                      <textarea
                        className={styles.textarea}
                        rows={3}
                        value={registro.saberes.observaciones_saberes}
                        placeholder="Notas libres sobre saberes locales…"
                        onChange={(e) => updateSeccion("saberes", "observaciones_saberes", e.target.value)}
                      />
                    </Campo>
                  </div>
                )}

                {/* ── 5. Economía y mercado ── */}
                {step === 4 && (
                  <div className={styles.seccion}>
                    <p className={styles.seccionTitulo}>💰 Economía y mercado</p>

                    <Campo label="Destino de la producción" hint="Selecciona todos los que apliquen">
                      <Pills
                        opciones={DESTINO_OPTS}
                        valor={registro.economia.destino_produccion}
                        onChange={(v) => toggleArray("economia", "destino_produccion", v)}
                        multi
                      />
                    </Campo>

                    <div className={styles.fila3}>
                      <Campo label="Autoconsumo (%)" >
                        <input
                          className={styles.input}
                          type="number" min={0} max={100}
                          value={registro.economia.autoconsumo_pct}
                          placeholder="0"
                          onChange={(e) => updateSeccion("economia", "autoconsumo_pct", e.target.value)}
                        />
                      </Campo>
                      <Campo label="Venta (%)">
                        <input
                          className={styles.input}
                          type="number" min={0} max={100}
                          value={registro.economia.venta_pct}
                          placeholder="0"
                          onChange={(e) => updateSeccion("economia", "venta_pct", e.target.value)}
                        />
                      </Campo>
                      <Campo label="Semilla (%)">
                        <input
                          className={styles.input}
                          type="number" min={0} max={100}
                          value={registro.economia.semilla_pct}
                          placeholder="0"
                          onChange={(e) => updateSeccion("economia", "semilla_pct", e.target.value)}
                        />
                      </Campo>
                    </div>

                    <Campo label="Precio promedio de venta" hint="$/kg">
                      <input
                        className={styles.input}
                        type="number" min={0} step={0.5}
                        value={registro.economia.precio_kg}
                        placeholder="Ej. 8.50"
                        onChange={(e) => updateSeccion("economia", "precio_kg", e.target.value)}
                      />
                    </Campo>

                    <Campo label="Canales de venta">
                      <input
                        className={styles.input}
                        value={registro.economia.canales_venta}
                        placeholder="Tianguis, intermediario, directo al consumidor…"
                        onChange={(e) => updateSeccion("economia", "canales_venta", e.target.value)}
                      />
                    </Campo>

                    <Campo label="Ingresos adicionales relacionados al maíz">
                      <input
                        className={styles.input}
                        value={registro.economia.ingresos_adicionales}
                        placeholder="Tortillas, tostadas, artesanías, forraje…"
                        onChange={(e) => updateSeccion("economia", "ingresos_adicionales", e.target.value)}
                      />
                    </Campo>

                    <Campo label="Observaciones económicas">
                      <textarea
                        className={styles.textarea}
                        rows={3}
                        value={registro.economia.observaciones_economia}
                        placeholder="Contexto económico, apoyos gubernamentales, problemáticas…"
                        onChange={(e) => updateSeccion("economia", "observaciones_economia", e.target.value)}
                      />
                    </Campo>
                  </div>
                )}

              </div>{/* /cardBody */}

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
              </div>

            </div>{/* /card */}
          </div>{/* /formPanel */}

          {/* ── Panel derecho: resumen ── */}
          <div className={styles.summaryPanel}>
            <ResumenSocial registro={registro} pasos={STEPS} progresos={pg} />
          </div>

        </div>{/* /layout */}
      </div>{/* /page */}
    </AdminShell>
  );
}
