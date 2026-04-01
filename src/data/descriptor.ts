export interface Descriptor {
  id: number;
  grupo: string;
  /** Sub-tab dentro del grupo (sólo grupo "hoja") */
  subtab?: string;
  nombre: string;
  /** Ej: "E12 · VG · 2 hojas desplegadas" */
  sublabel?: string;
  /** Método de observación: VG | MS | MG | VS | — */
  obs: string;
  /** Tipo de descriptor: QN | QL | PQ */
  tipo: string;
  campo: "select" | "number";
  opciones?: string[];
  rango?: [number, number];
  hint?: string;
  /** Descriptor clave ★ (UPOV prioritario) */
  clave?: boolean;
  /** Mapa opción → color hex para campos con swatch (d19, d57) */
  colores?: Record<string, string>;
}

export const descriptors: Descriptor[] = [
  /* ─── PLÁNTULA (E12–14) ─────────────────────────────────────────────── */
  { id: 1, grupo: "plántula", nombre: "Antocianinas en vaina", sublabel: "E12 · 2 hojas desplegadas", obs: "VG", tipo: "QN", campo: "select",
    opciones: ["1 — Ausente/muy débil", "3 — Débil", "5 — Media", "7 — Fuerte", "9 — Muy fuerte"] },
  { id: 2, grupo: "plántula", nombre: "Longitud de lámina", sublabel: "E14 · 4 hojas · cm", obs: "MS", tipo: "QN", campo: "number",
    rango: [0, 20], hint: "Medir lámina del extremo inferior al ápice" },
  { id: 3, grupo: "plántula", nombre: "Ancho de lámina", sublabel: "E14 · cm", obs: "MS", tipo: "QN", campo: "select",
    opciones: ["1 — Muy estrecha ≤0.5", "2 — Estrecha 0.6–0.9", "3 — Media 1.0–1.3", "4 — Ancha 1.4–1.7", "5 — Muy ancha >1.7"],
    hint: "1=≤0.5 · 2=0.6-0.9 · 3=1.0-1.3 · 4=1.4-1.7 · 5=>1.7 cm" },
  { id: 4, grupo: "plántula", nombre: "Relación largo/ancho", sublabel: "E14", obs: "VG", tipo: "QN", campo: "select",
    opciones: ["1 — Muy pequeña ≤1.5", "3 — Pequeña 1.6–3.0", "5 — Media 3.1–4.5", "7 — Grande 4.6–6.0", "9 — Muy grande >6.0"] },
  { id: 5, grupo: "plántula", nombre: "Forma de la punta", sublabel: "E14", obs: "VG", tipo: "PQ", campo: "select",
    opciones: ["1 — Puntiaguda", "2 — Puntiaguda a redondeada", "3 — Redondeada", "4 — Redondeada a espatulada", "5 — Espatulada"] },

  /* ─── HOJA – sub-tab: ángulos y forma (E61–65) ──────────────────────── */
  { id: 6, grupo: "hoja", subtab: "angulos", nombre: "Ángulo inserción — debajo mazorca", sublabel: "E61", obs: "MS", tipo: "QN", campo: "select",
    opciones: ["1 — Erecto ≤30°", "2 — Semierecto 31–60°", "3 — Semihorizontal 61–90°", "4 — Caído >90°"] },
  { id: 7, grupo: "hoja", subtab: "angulos", nombre: "Ángulo lámina–tallo", sublabel: "E61", obs: "MS", tipo: "QN", campo: "select",
    opciones: ["1 — Muy pequeño <5°", "3 — Pequeño ±25°", "5 — Medio ±50°", "7 — Grande ±75°", "9 — Muy grande >90°"] },
  { id: 8, grupo: "hoja", subtab: "angulos", nombre: "Ángulo inserción — arriba mazorca", sublabel: "E61", obs: "MS", tipo: "QN", campo: "select",
    opciones: ["1 — Erecto ≤30°", "2 — Semierecto 31–60°", "3 — Semihorizontal 61–90°", "4 — Caído >90°"] },
  { id: 9, grupo: "hoja", subtab: "angulos", nombre: "Forma característica (actitud)", sublabel: "E61", obs: "VG", tipo: "QN", campo: "select",
    opciones: ["1 — Rectilínea", "3 — Ligeramente curvada", "5 — Curvada", "7 — Fuertemente curvada", "9 — Muy fuertemente curvada"] },
  { id: 10, grupo: "hoja", subtab: "angulos", nombre: "Ondulación del margen laminar", sublabel: "E61", obs: "VG", tipo: "QN", campo: "select",
    opciones: ["1 — Ausente", "2 — Moderada", "3 — Fuerte"] },
  { id: 18, grupo: "hoja", subtab: "angulos", nombre: "Arrugas longitudinales", sublabel: "E65", obs: "VG", tipo: "QL", campo: "select",
    opciones: ["1 — Ausentes", "9 — Presentes"] },
  { id: 46, grupo: "hoja", subtab: "angulos", nombre: "Ancho de lámina adulta", sublabel: "E85 · cm", obs: "MS", tipo: "QN", campo: "select",
    opciones: ["1 — Muy estrecha ≤5.0", "3 — Estrecha 5.1–8.0", "5 — Media 8.1–11.0", "7 — Ancha 11.1–14.0", "9 — Muy ancha >14.0"],
    hint: "1=≤5 · 3=5-8 · 5=8-11 · 7=11-14 · 9=>14 cm" },

  /* ─── HOJA – sub-tab: coloraciones (E65) ───────────────────────────── */
  { id: 19, grupo: "hoja", subtab: "color", nombre: "Coloración de la lámina", sublabel: "E65", obs: "VG", tipo: "PQ", campo: "select",
    opciones: ["1 — Verde claro", "2 — Verde", "3 — Verde oscuro", "4 — Rojiza", "5 — Morada"],
    colores: { "1 — Verde claro": "#C8E6C9", "2 — Verde": "#4CAF50", "3 — Verde oscuro": "#1B5E20", "4 — Rojiza": "#C62828", "5 — Morada": "#6A1B9A" } },
  { id: 20, grupo: "hoja", subtab: "color", nombre: "Coloración vaina — base del tallo", sublabel: "E65", obs: "VG", tipo: "PQ", campo: "select",
    opciones: ["1 — Verde claro", "2 — Verde", "3 — Verde oscuro", "4 — Rojiza", "5 — Morada", "6 — Café"] },
  { id: 21, grupo: "hoja", subtab: "color", nombre: "Antocianinas en vaina — parte media", sublabel: "E65", obs: "VG", tipo: "QN", campo: "select",
    opciones: ["1 — Ausente/muy débil", "3 — Débil", "5 — Media", "7 — Fuerte", "9 — Muy fuerte"] },
  { id: 22, grupo: "hoja", subtab: "color", nombre: "Coloración vaina — mazorca principal", sublabel: "E65", obs: "VG", tipo: "PQ", campo: "select",
    opciones: ["1 — Verde claro", "2 — Verde", "3 — Verde oscuro", "4 — Rojiza", "5 — Morada", "6 — Café"] },
  { id: 23, grupo: "hoja", subtab: "color", nombre: "Coloración de la aurícula", sublabel: "E65–71", obs: "VG", tipo: "QL", campo: "select",
    opciones: ["1 — Blanca", "2 — Verde claro", "3 — Verde", "4 — Púrpura claro", "5 — Púrpura medio", "6 — Púrpura fuerte", "7 — Café"] },
  { id: 24, grupo: "hoja", subtab: "color", nombre: "Pubescencia sobre margen de vaina", sublabel: "E65–71", obs: "VG", tipo: "QN", campo: "select",
    opciones: ["1 — Ausente/muy poca", "3 — Poca", "5 — Media", "7 — Mucha"] },

  /* ─── TALLO (E65–85) ────────────────────────────────────────────────── */
  { id: 11, grupo: "tallo", nombre: "Antocianinas — raíces adventicias", sublabel: "E65–75", obs: "VG", tipo: "QN", campo: "select",
    opciones: ["1 — Ausente/muy débil", "3 — Débil", "5 — Media", "7 — Fuerte", "9 — Muy fuerte"] },
  { id: 12, grupo: "tallo", nombre: "Número de hijuelos por planta", sublabel: "E65", obs: "VG", tipo: "QN", campo: "select",
    opciones: ["1 — Ausentes", "2 — 1 por planta", "3 — 2–3 por planta", "4 — 4–5 por planta", "5 — >5 por planta"] },
  { id: 13, grupo: "tallo", nombre: "Long. entrenudos inferiores", sublabel: "E65–75 · cm", obs: "MS", tipo: "QN", campo: "select",
    opciones: ["1 — Muy corta ≤1.0", "3 — Corta 1.1–7.0", "5 — Media 7.1–11.0", "7 — Larga 11.1–15.0", "9 — Muy larga >15.0"] },
  { id: 14, grupo: "tallo", nombre: "Diámetro del tallo", sublabel: "E65–71 · mm", obs: "MS", tipo: "QN", campo: "select",
    opciones: ["1 — Muy pequeño ≤10.0", "2 — Pequeño 10.1–15.0", "3 — Medio 15.1–20.0", "4 — Grande 20.1–25.0", "5 — Muy grande >25.0"],
    hint: "1=≤10 · 2=10-15 · 3=15-20 · 4=20-25 · 5=>25 mm" },
  { id: 15, grupo: "tallo", nombre: "Long. entrenudos superiores", sublabel: "E65 · cm", obs: "MS", tipo: "QN", campo: "select",
    opciones: ["1 — Muy corta ≤4.0", "3 — Corta 4.1–10.0", "5 — Media 10.1–14.0", "7 — Larga 14.1–18.0", "9 — Muy larga >18.0"] },
  { id: 16, grupo: "tallo", nombre: "Grado de zigzagueo", sublabel: "E65", obs: "VG", tipo: "QN", campo: "select",
    opciones: ["3 — Ausente/muy ligero", "5 — Ligero", "7 — Fuerte"] },
  { id: 17, grupo: "tallo", nombre: "Antocianinas — nudos", sublabel: "E65–71", obs: "VG", tipo: "QN", campo: "select",
    opciones: ["1 — Ausente/muy débil", "3 — Débil", "5 — Media", "7 — Fuerte", "9 — Muy fuerte"] },
  { id: 43, grupo: "tallo", nombre: "Longitud de la planta", sublabel: "E85 · cm · ★", obs: "MS", tipo: "QN", campo: "select",
    opciones: ["1 — Muy baja ≤130", "3 — Baja 131–190", "5 — Media 191–220", "7 — Alta 221–300", "9 — Muy alta >300"],
    hint: "cm", clave: true },
  { id: 44, grupo: "tallo", nombre: "Altura de inserción mazorca", sublabel: "E85 · cm", obs: "MS", tipo: "QN", campo: "select",
    opciones: ["1 — Muy baja ≤60", "3 — Baja 61–100", "5 — Media 101–120", "7 — Alta 121–160", "9 — Muy alta >160"],
    hint: "cm" },
  { id: 45, grupo: "tallo", nombre: "Relación altura mazorca/planta", sublabel: "E85", obs: "MS", tipo: "QN", campo: "select",
    opciones: ["1 — Muy pequeña ≤0.25", "3 — Pequeña 0.26–0.45", "5 — Media 0.46–0.65", "7 — Alta 0.66–0.90", "9 — Muy alta >0.90"] },

  /* ─── ESPIGA (E61–75) ───────────────────────────────────────────────── */
  { id: 25, grupo: "espiga", nombre: "Floración masculina — días", sublabel: "E65 · días desde siembra · ★", obs: "MG", tipo: "QN", campo: "number",
    rango: [40, 140], hint: "Días hasta el 50% de plantas en antesis", clave: true },
  { id: 26, grupo: "espiga", nombre: "Long. pedúnculo de espiga", sublabel: "E65 · cm", obs: "MS", tipo: "QN", campo: "select",
    opciones: ["1 — Muy corta ≤1.0", "3 — Corta 1.1–12.0", "5 — Media 12.1–20.0", "7 — Larga 20.1–28.0", "9 — Muy larga >28.0"] },
  { id: 27, grupo: "espiga", nombre: "Longitud total de la espiga", sublabel: "E65 · cm", obs: "MS", tipo: "QN", campo: "select",
    opciones: ["1 — Muy corta ≤15.0", "3 — Corta 15.1–27.0", "5 — Media 27.1–35.0", "7 — Larga 35.1–43.0", "9 — Muy larga >43.0"] },
  { id: 28, grupo: "espiga", nombre: "Longitud del eje principal", sublabel: "E65 · cm · ★", obs: "MS", tipo: "QN", campo: "select",
    opciones: ["1 — Muy corta ≤7.0", "3 — Corta 7.1–16.0", "5 — Media 16.1–22.0", "7 — Larga 22.1–28.0", "9 — Muy larga >28.0"],
    hint: "≤7 · 7-16 · 16-22 · 22-28 · >28 cm", clave: true },
  { id: 29, grupo: "espiga", nombre: "Ángulo de compacidad", sublabel: "E65 · ★", obs: "MS", tipo: "QN", campo: "select",
    opciones: ["1 — Muy compacta ≤10°", "3 — Compacta ±25°", "5 — Semiabierta ±50°", "7 — Abierta ±75°", "9 — Postrada >90°"], clave: true },
  { id: 30, grupo: "espiga", nombre: "Posición ramas laterales", sublabel: "E65 · ★", obs: "VG", tipo: "QN", campo: "select",
    opciones: ["1 — Rectilíneas", "3 — Ligeramente curvadas", "5 — Curvadas", "7 — Fuertemente curvadas", "9 — Muy fuertemente curvadas"], clave: true },
  { id: 31, grupo: "espiga", nombre: "N° ramas laterales primarias", sublabel: "E65 · ★", obs: "MS", tipo: "QN", campo: "select",
    opciones: ["1 — Ausente", "2 — Muy pocas 1–3", "3 — Pocas 4–6", "4 — Medio 7–9", "5 — Alto 10–12", "6 — Muy alto >12"], clave: true },
  { id: 32, grupo: "espiga", nombre: "Ramas secundarias", sublabel: "E65", obs: "VG", tipo: "QL", campo: "select",
    opciones: ["1 — Ausente", "9 — Presente"] },
  { id: 33, grupo: "espiga", nombre: "Densidad de espiguillas", sublabel: "E65", obs: "VG", tipo: "QN", campo: "select",
    opciones: ["3 — Laxa", "5 — Media", "7 — Densa"] },
  { id: 34, grupo: "espiga", nombre: "Antocianinas — base de glumas", sublabel: "E65 · ★", obs: "VG", tipo: "QN", campo: "select",
    opciones: ["1 — Ausente/muy débil", "3 — Débil", "5 — Media", "7 — Fuerte", "9 — Muy fuerte"], clave: true },
  { id: 35, grupo: "espiga", nombre: "Antocianinas en glumas", sublabel: "E65", obs: "VG", tipo: "QN", campo: "select",
    opciones: ["1 — Ausente/muy débil", "3 — Débil", "5 — Media", "7 — Fuerte", "9 — Muy fuerte"] },
  { id: 36, grupo: "espiga", nombre: "Antocianinas en anteras", sublabel: "E65", obs: "VG", tipo: "QN", campo: "select",
    opciones: ["1 — Ausente/muy débil", "3 — Débil", "5 — Media", "7 — Fuerte", "9 — Muy fuerte"] },
  { id: 37, grupo: "espiga", nombre: "Cubrimiento por hoja bandera", sublabel: "E65", obs: "VG", tipo: "QN", campo: "select",
    opciones: ["1 — Ausente", "3 — Poco ±25%", "5 — Medio ±50%", "7 — Mucho >75%"] },
  { id: 38, grupo: "espiga", nombre: "Floración femenina — días", sublabel: "E65 · días desde siembra", obs: "MG", tipo: "QN", campo: "number",
    rango: [40, 145], hint: "Días hasta que 50% de plantas presenten estigmas >1 cm" },
  { id: 39, grupo: "espiga", nombre: "Antocianinas — estigmas", sublabel: "E65 · ★", obs: "VG", tipo: "QL", campo: "select",
    opciones: ["1 — Ausente", "9 — Presente"], clave: true },
  { id: 40, grupo: "espiga", nombre: "Intensidad antocianinas estigmas", sublabel: "E65", obs: "VG", tipo: "QN", campo: "select",
    opciones: ["1 — Ausente/muy débil", "3 — Débil", "5 — Media", "7 — Fuerte", "9 — Muy fuerte"] },
  { id: 41, grupo: "espiga", nombre: "Desarrollo de filodios", sublabel: "E65–75", obs: "VG", tipo: "QN", campo: "select",
    opciones: ["1 — Ausente/muy poco", "3 — Poco", "5 — Moderado", "7 — Mucho", "9 — Abundante"] },
  { id: 42, grupo: "espiga", nombre: "Long. ramas laterales", sublabel: "E65 · cm", obs: "MS", tipo: "QN", campo: "select",
    opciones: ["1 — Muy corta ≤10.0", "3 — Corta 10.1–15.0", "5 — Media 15.1–20.0", "7 — Larga 20.1–25.0", "9 — Muy larga >25.0"] },

  /* ─── MAZORCA (E85–92) ──────────────────────────────────────────────── */
  { id: 47, grupo: "mazorca", nombre: "Mazorcas por planta (%)", sublabel: "E92", obs: "MS", tipo: "QN", campo: "select",
    opciones: ["1 — 0–20%", "2 — 21–40%", "3 — 41–60%", "4 — 61–80%", "5 — 81–100%", "6 — 101–120%", "7 — 121–140%", "8 — 141–160%", "9 — >160%"] },
  { id: 48, grupo: "mazorca", nombre: "Long. pedúnculo de mazorca", sublabel: "E92 · cm", obs: "MS", tipo: "QN", campo: "select",
    opciones: ["1 — Muy corto ≤5.0", "3 — Corto 5.1–14.0", "5 — Medio 14.1–20.0", "7 — Largo 20.1–26.0", "9 — Muy largo >26.0"] },
  { id: 49, grupo: "mazorca", nombre: "Longitud de mazorca", sublabel: "E92 · cm · ★", obs: "MS", tipo: "QN", campo: "select",
    opciones: ["1 — Muy corta ≤10", "3 — Corta 10.1–15.0", "5 — Media 15.1–20.0", "7 — Larga 20.1–25.0", "9 — Muy larga >25.0"],
    hint: "cm", clave: true },
  { id: 50, grupo: "mazorca", nombre: "Diámetro de mazorca", sublabel: "E92 · cm", obs: "MS", tipo: "QN", campo: "select",
    opciones: ["1 — Muy pequeño ≤4.0", "3 — Pequeño 4.1–5.0", "5 — Medio 5.1–6.0", "7 — Grande 6.1–7.0", "9 — Muy grande >7.0"],
    hint: "≤4 · 4-5 · 5-6 · 6-7 · >7 cm" },
  { id: 51, grupo: "mazorca", nombre: "Forma de la mazorca", sublabel: "E92", obs: "VS", tipo: "PQ", campo: "select",
    opciones: ["1 — Cónica", "2 — Cónica cilíndrica", "3 — Cilíndrica"] },
  { id: 52, grupo: "mazorca", nombre: "Arreglo de hileras de granos", sublabel: "E92", obs: "MS", tipo: "QN", campo: "select",
    opciones: ["1 — Recta", "3 — En espiral", "4 — Irregular"] },
  { id: 53, grupo: "mazorca", nombre: "Número de hileras de granos", sublabel: "E92", obs: "MS", tipo: "QN", campo: "select",
    opciones: ["1 — Muy pocas <10", "3 — Pocas 12–16", "5 — Media 18–22", "7 — Muchas 24–30", "9 — Numerosas >30"] },
  { id: 54, grupo: "mazorca", nombre: "Número de granos por hilera", sublabel: "E92", obs: "MS", tipo: "QN", campo: "select",
    opciones: ["1 — Muy pocos ≤20", "3 — Pocos 21–30", "5 — Medio 31–40", "7 — Muchos 41–50", "9 — Numerosos >51"] },

  /* ─── GRANO (E92–93) ────────────────────────────────────────────────── */
  { id: 55, grupo: "grano", nombre: "Tipo de grano", sublabel: "E92 · ★", obs: "VS", tipo: "QL", campo: "select",
    opciones: ["1 — Cristalino (flint)", "2 — Semicristalino", "3 — Intermedio", "4 — Semidentado (dent-like)", "5 — Dentado (dent)", "6 — Reventador (pop)", "7 — Dulce (sweet)", "8 — Ceroso (waxy)", "9 — Harinoso (floury)"],
    clave: true },
  { id: 56, grupo: "grano", nombre: "Forma de corona del grano", sublabel: "E92", obs: "VG", tipo: "PQ", campo: "select",
    opciones: ["1 — Convexa", "2 — Hendida (deprimida)", "3 — Puntiaguda"] },
  { id: 57, grupo: "grano", nombre: "Color del grano", sublabel: "E92 · ★", obs: "VS", tipo: "QL", campo: "select",
    opciones: ["1 — Blanco", "2 — Blanco cremoso", "3 — Amarillo claro", "4 — Amarillo", "5 — Amarillo oscuro", "6 — Naranja", "7 — Rojo claro", "8 — Rojo", "9 — Rojo oscuro", "10 — Azul", "11 — Oscuro", "12 — Negro"],
    colores: {
      "1 — Blanco": "#F5F5F0", "2 — Blanco cremoso": "#F5EDD0", "3 — Amarillo claro": "#F9E07A",
      "4 — Amarillo": "#F4C430", "5 — Amarillo oscuro": "#D4A017", "6 — Naranja": "#E87722",
      "7 — Rojo claro": "#C1605A", "8 — Rojo": "#A0362E", "9 — Rojo oscuro": "#6B1E1E",
      "10 — Azul": "#4A6FA5", "11 — Oscuro": "#3A2E2E", "12 — Negro": "#1A1A1A",
    }, clave: true },
  { id: 58, grupo: "grano", nombre: "Color dorsal del grano", sublabel: "E92", obs: "VS", tipo: "QL", campo: "select",
    opciones: ["1 — Blanco", "2 — Blanco cremoso", "3 — Amarillo claro", "4 — Amarillo", "5 — Amarillo oscuro/naranja", "6 — Naranja", "7 — Rojo claro", "8 — Rojo", "9 — Rojo oscuro", "10 — Azul", "11 — Negro", "12 — Combinado"] },
  { id: 59, grupo: "grano", nombre: "Color del endospermo", sublabel: "E92", obs: "VS", tipo: "QL", campo: "select",
    opciones: ["1 — Blanco", "2 — Amarillo", "3 — Naranja"] },
  { id: 60, grupo: "grano", nombre: "Antocianinas — glumas del olote", sublabel: "E93 · ★", obs: "VG", tipo: "QL", campo: "select",
    opciones: ["1 — Ausente", "9 — Presente"], clave: true },
  { id: 61, grupo: "grano", nombre: "Intensidad antocianinas en olote", sublabel: "E93", obs: "VS", tipo: "PQ", campo: "select",
    opciones: ["1 — Ausente/muy débil", "3 — Débil", "5 — Media", "7 — Fuerte", "9 — Muy fuerte"] },
  { id: 62, grupo: "grano", nombre: "Tipo de androesterilidad", sublabel: "E65", obs: "VG", tipo: "QL", campo: "select",
    opciones: ["1 — T (Texas)", "2 — C (Charrúa)", "3 — S (USDA)", "4 — Otro", "5 — Ninguna"] },
  { id: 63, grupo: "grano", nombre: "Carácter braquítico", sublabel: "VG", obs: "VG", tipo: "QL", campo: "select",
    opciones: ["1 — Ausente", "2 — Presente"] },

  /* ─── ADAPTACIÓN ────────────────────────────────────────────────────── */
  { id: 64, grupo: "adaptación", nombre: "Área de adaptación principal", sublabel: "Complementaria", obs: "—", tipo: "QL", campo: "select",
    opciones: ["1 — Trópico húmedo 0–100 msnm", "2 — Trópico subhúmedo 0–1150 msnm", "3 — Trópico seco 0–1000 msnm", "4 — Bajío/subtrópico 1151–1800 msnm", "5 — Zona de transición 1801–2150 msnm", "6 — Valles altos 2151–2500 msnm", "7 — Valles muy altos >2500 msnm"] },
  { id: 65, grupo: "adaptación", nombre: "Área de adaptación secundaria", sublabel: "Complementaria", obs: "—", tipo: "QL", campo: "select",
    opciones: ["1 — Trópico húmedo 0–100 msnm", "2 — Trópico subhúmedo 0–1150 msnm", "3 — Trópico seco 0–1000 msnm", "4 — Bajío/subtrópico 1151–1800 msnm", "5 — Zona de transición 1801–2150 msnm", "6 — Valles altos 2151–2500 msnm", "7 — Valles muy altos >2500 msnm"] },
  { id: 66, grupo: "adaptación", nombre: "Estación de crecimiento principal", sublabel: "Complementaria", obs: "—", tipo: "QL", campo: "select",
    opciones: ["1 — Otoño–Invierno", "2 — Primavera–Verano"] },
  { id: 67, grupo: "adaptación", nombre: "Estación de crecimiento secundaria", sublabel: "Complementaria", obs: "—", tipo: "QL", campo: "select",
    opciones: ["1 — Otoño–Invierno", "2 — Primavera–Verano"] },
  { id: 68, grupo: "adaptación", nombre: "Régimen hídrico", sublabel: "Complementaria", obs: "—", tipo: "QL", campo: "select",
    opciones: ["1 — Riego completo", "2 — Riego parcial", "3 — Buen temporal", "4 — Temporal regular", "5 — Otros"] },
];

export const grupos = ["plántula", "hoja", "tallo", "espiga", "mazorca", "grano", "adaptación"];
