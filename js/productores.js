// ═══════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════
const API_SOCIAL = "http://localhost:8002";
const API_CATALOGO = "http://localhost:8001";

// ── ESTADO ──────────────────────────────────────────────
let productores = [];
let productorActual = null;
let idSaberEditando = null;
let idNarrativaEditando = null;
let idGastroEditando = null;

// ── API HELPER ───────────────────────────────────────────
async function api(path, opts = {}) {
  const res = await fetch(`${API_SOCIAL}${path}`, {
    headers: { "Content-Type": "application/json", ...opts.headers },
    ...opts,
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(e.detail || `Error ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

const GET = (path) => api(path);
const POST = (path, d) =>
  api(path, { method: "POST", body: JSON.stringify(d) });
const PUT = (path, d) => api(path, { method: "PUT", body: JSON.stringify(d) });
const DEL = (path) => api(path, { method: "DELETE" });

// ── UTILIDADES ───────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const val = (id) => {
  const e = $(id);
  return e ? e.value.trim() : "";
};
const chk = (id) => {
  const e = $(id);
  return e ? e.checked : false;
};
const boolVal = (id) => {
  const v = val(id);
  return v === "true" ? true : v === "false" ? false : null;
};
const numVal = (id) => {
  const v = val(id);
  return v === "" ? null : Number(v);
};
const setVal = (id, v) => {
  const e = $(id);
  if (e) e.value = v ?? "";
};
const setChk = (id, v) => {
  const e = $(id);
  if (e) e.checked = !!v;
};

function dash(v) {
  return v === null || v === undefined || v === ""
    ? '<span class="dato-vacio">—</span>'
    : v;
}
function siNo(v) {
  return v
    ? '<span class="badge badge-verde">✓ Sí</span>'
    : '<span class="badge badge-gris">✗ No</span>';
}

function toast(msg, tipo = "ok") {
  const w = $("toast-wrap");
  const el = document.createElement("div");
  el.className = `toast toast-${tipo}`;
  el.innerHTML = `<span>${tipo === "ok" ? "✓" : tipo === "err" ? "✗" : "⚠"}</span> ${msg}`;
  w.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function confirmar(msg, fn) {
  $("confirm-msg").textContent = msg;
  $("btn-confirmar").onclick = () => {
    cerrarModal("modal-confirm");
    fn();
  };
  $("modal-confirm").classList.add("open");
}

// ── MODALES ──────────────────────────────────────────────
function cerrarModal(id) {
  $(id).classList.remove("open");
}
function cerrarSiOverlay(e, id) {
  if (e.target === $(id)) cerrarModal(id);
}

// Select dinámico para lenguas en el modal de lengua
async function abrirModalLengua() {
  const select = document.getElementById("l_lengua_id");
  select.innerHTML = '<option value="">Cargando lenguas...</option>';
  try {
    const lenguas = await fetch(`${API_CATALOGO}/catalogos/lengua`).then(
      (r) => r.json(),
    );
    select.innerHTML =
      '<option value="">— Selecciona lengua —</option>' +
      lenguas
        .map(
          (l) =>
            `<option value="${l.id}">${l.nombre}${l.variante ? " (" + l.variante + ")" : ""}</option>`,
        )
        .join("");
  } catch {
    select.innerHTML = '<option value="">Error al cargar lenguas</option>';
  }
  document.getElementById("modal-lengua").classList.add("open");
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape")
    document
      .querySelectorAll(".modal-overlay.open")
      .forEach((m) => m.classList.remove("open"));
});

// ── VISTAS ───────────────────────────────────────────────
function mostrarVista(v) {
  document
    .querySelectorAll(".vista")
    .forEach((el) => el.classList.remove("activa"));
  $(`vista-${v}`).classList.add("activa");
  document
    .querySelectorAll(".nav-btn")
    .forEach((b) => b.classList.remove("active"));
}

function activarTab(id) {
  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.remove("active"));
  document
    .querySelectorAll(".tab-panel")
    .forEach((p) => p.classList.remove("active"));
  $(id).classList.add("active");
  event.currentTarget.classList.add("active");
}

// ═══════════════════════════════════════════════════════
// LISTA DE PRODUCTORES
// ═══════════════════════════════════════════════════════
async function cargarProductores() {
  $("tabla-productores").innerHTML =
    `<div class="estado-centro"><div class="spinner"></div><div class="estado-txt">Cargando...</div></div>`;
  try {
    const data = await GET("/social/productores/");
    productores = Array.isArray(data) ? data : data.items || data.results || [];
    renderLista(productores);
  } catch (e) {
    $("tabla-productores").innerHTML =
      `<div class="estado-centro"><div class="estado-ico">⚠️</div><div class="estado-txt">${e.message}</div></div>`;
  }
}

function renderLista(datos) {
  $("count-lista").textContent =
    `${datos.length} productor${datos.length !== 1 ? "es" : ""}`;
  if (!datos.length) {
    $("tabla-productores").innerHTML =
      `<div class="estado-centro"><div class="estado-ico">🌽</div><div class="estado-txt">Sin productores registrados</div><div class="estado-sub">¡Agrega el primero!</div></div>`;
    return;
  }
  const filas = datos
    .map((p) => {
      const nombre = [p.nombres, p.apellido_paterno, p.apellido_materno]
        .filter(Boolean)
        .join(" ");
      const manejo = p.tipo_manejo
        ? `<span class="badge badge-verde">${p.tipo_manejo}</span>`
        : "";
      return `<tr onclick="verPerfil(${p.id})" title="Ver perfil">
      <td>${p.id}</td>
      <td><strong>${nombre || "—"}</strong></td>
      <td>${p.edad ?? "—"}</td>
      <td>${p.genero ?? "—"}</td>
      <td>${p.anos_experiencia ?? "—"} años</td>
      <td>${manejo}</td>
      <td><div class="td-acciones" onclick="event.stopPropagation()">
        <button class="btn btn-edit btn-xs" onclick="abrirModalProductor(${JSON.stringify(p).replace(/"/g, "&quot;")})">✏</button>
        <button class="btn btn-danger btn-xs" onclick="eliminarProductor(${p.id},'${nombre.replace(/'/g, "\\'")}')">🗑</button>
      </div></td>
    </tr>`;
    })
    .join("");

  $("tabla-productores").innerHTML = `
    <table>
      <thead><tr>
        <th>#</th><th>Nombre</th><th>Edad</th><th>Género</th><th>Experiencia</th><th>Manejo</th><th>Acciones</th>
      </tr></thead>
      <tbody>${filas}</tbody>
    </table>`;
}

function filtrarLista() {
  const q = $("buscador-lista").value.toLowerCase();
  if (!q) {
    renderLista(productores);
    return;
  }
  renderLista(
    productores.filter((p) =>
      Object.values(p).some((v) =>
        String(v ?? "")
          .toLowerCase()
          .includes(q),
      ),
    ),
  );
}

// ═══════════════════════════════════════════════════════
// PERFIL DEL PRODUCTOR
// ═══════════════════════════════════════════════════════
async function verPerfil(id) {
  mostrarVista("perfil");
  try {
    productorActual = await GET(`/social/productores/${id}/`);
    renderPerfil(productorActual);
    cargarTodasLasSecciones(id);
  } catch (e) {
    toast("Error al cargar productor: " + e.message, "err");
    volverLista();
  }
}

function volverLista() {
  mostrarVista("lista");
  // Resetear tabs
  document
    .querySelectorAll(".tab-btn")
    .forEach((b, i) => b.classList.toggle("active", i === 0));
  document
    .querySelectorAll(".tab-panel")
    .forEach((p, i) => p.classList.toggle("active", i === 0));
}

function renderPerfil(p) {
  const nombre = [p.nombres, p.apellido_paterno, p.apellido_materno]
    .filter(Boolean)
    .join(" ");
  const iniciales = (p.nombres?.[0] || "") + (p.apellido_paterno?.[0] || "");
  $("perfil-avatar").textContent = iniciales || "?";
  $("perfil-nombre").textContent = nombre || "Sin nombre";
  $("perfil-meta").textContent =
    [p.comunidad_texto, p.municipio_id ? `Municipio #${p.municipio_id}` : null]
      .filter(Boolean)
      .join(" · ") || "Sin ubicación registrada";
  const badges = [
    p.tipo_manejo
      ? `<span class="perfil-badge activo">${p.tipo_manejo}</span>`
      : "",
    p.genero ? `<span class="perfil-badge">${p.genero}</span>` : "",
    p.anos_experiencia
      ? `<span class="perfil-badge">${p.anos_experiencia} años exp.</span>`
      : "",
    p.edad ? `<span class="perfil-badge">${p.edad} años</span>` : "",
  ].join("");
  $("perfil-badges").innerHTML = badges;

  // Datos personales
  const campos = [
    ["ID", p.id],
    ["Nombres", p.nombres],
    ["Apellido paterno", p.apellido_paterno],
    ["Apellido materno", p.apellido_materno],
    ["Edad", p.edad],
    ["Género", p.genero],
    ["Años de experiencia", p.anos_experiencia],
    ["Tipo de manejo", p.tipo_manejo],
    ["Comunidad", p.comunidad_texto],
    ["Fecha de registro", p.fecha_registro],
  ];
  $("datos-personales").innerHTML = campos
    .map(
      ([lbl, v]) => `
    <div class="dato-item">
      <div class="dato-label">${lbl}</div>
      <div class="dato-valor">${dash(v)}</div>
    </div>`,
    )
    .join("");
}

async function cargarTodasLasSecciones(id) {
  cargarLenguas(id);
  cargarGeo(id);
  cargarSocio(id);
  cargarPracticas(id);
  cargarElcsa(id);
  cargarClimatica(id);
  cargarRed(id);
  cargarIdentidad(id);
  cargarTransmision(id);
  cargarSaberes(id);
  cargarNarrativas(id);
  cargarGastronomia(id);
  cargarConsentimiento(id);
}

// ── Carga de secciones ───────────────────────────────────
async function cargarLenguas(id) {
  try {
    const data = await GET("/social/productores_lengua/");
    const mine = (Array.isArray(data) ? data : []).filter(
      (l) => l.productor_id === id,
    );
    if (!mine.length) {
      $("lista-lenguas").innerHTML = vacio("Sin lenguas registradas");
      return;
    }
    // Obtener catálogo de lenguas solo una vez y cachear
    if (!window._catLenguas) {
      try {
        window._catLenguas = await fetch(
          `${API_CATALOGO}/catalogos/lengua`,
        ).then((r) => r.json());
      } catch {
        window._catLenguas = [];
      }
    }
    const catLenguas = window._catLenguas;
    $("lista-lenguas").innerHTML = `<div class="registros-lista">${mine
      .map((l) => {
        const lengua = catLenguas.find((x) => x.id === l.lengua_id);
        const nombre = lengua
          ? lengua.nombre +
            (lengua.variante ? " (" + lengua.variante + ")" : "")
          : `Lengua #${l.lengua_id}`;
        return `
      <div class="registro-item">
        <div><div class="registro-titulo">${nombre}</div>
        <div class="registro-sub">${l.es_materna ? "🌟 Lengua materna" : "Segunda lengua"}</div></div>
        <div class="registro-acciones">
          <button class="btn btn-danger btn-xs" onclick="eliminarRegistro('/social/productores_lengua/${l.id}', cargarLenguas.bind(null,${id}))">🗑</button>
        </div>
      </div>`;
      })
      .join("")}</div>`;
  } catch {
    $("lista-lenguas").innerHTML = vacio("Error al cargar");
  }
}

async function cargarGeo(id) {
  try {
    const data = await GET("/social/geolocalizaciones_productor/");
    const mine = (Array.isArray(data) ? data : []).filter(
      (g) => g.productor_id === id,
    );
    if (!mine.length) {
      $("lista-geo").innerHTML = vacio("Sin geolocalización registrada");
      return;
    }
    $("lista-geo").innerHTML = `<div class="registros-lista">${mine
      .map(
        (g) => `
      <div class="registro-item">
        <div><div class="registro-titulo">📍 Lat: ${g.latitud ?? "—"} · Lon: ${g.longitud ?? "—"}</div>
        <div class="registro-sub">Altitud: ${g.altitud_m ?? "—"} m · ${g.fuente_captura ?? ""}</div></div>
        <div class="registro-acciones">
          <button class="btn btn-danger btn-xs" onclick="eliminarRegistro('/social/geolocalizaciones_productor/${g.id}', cargarGeo.bind(null,${id}))">🗑</button>
        </div>
      </div>`,
      )
      .join("")}</div>`;
  } catch {
    $("lista-geo").innerHTML = vacio("Error al cargar");
  }
}

async function cargarSocio(id) {
  try {
    const data = await GET("/social/perfiles_socioeconomicos/");
    const mine = (Array.isArray(data) ? data : []).find(
      (s) => s.productor_id === id,
    );
    if (!mine) {
      $("datos-socio").innerHTML = vacio(
        "Sin perfil socioeconómico registrado",
      );
      return;
    }
    $("btn-socio-accion").textContent = "✏ Editar";
    $("btn-socio-accion").onclick = () => abrirModalSocio(mine);
    $("datos-socio").innerHTML = `
      <div class="datos-grid">
        ${datoItem("Escolaridad", mine.escolaridad)}
        ${datoItem("Superficie total", mine.superficie_total_ha ? `${mine.superficie_total_ha} ha` : null)}
        ${datoItem("Superficie maíz", mine.superficie_maiz_ha ? `${mine.superficie_maiz_ha} ha` : null)}
        ${datoItem("Decisión de siembra", mine.decision_siembra)}
        ${datoItem("Peso", mine.peso_kg ? `${mine.peso_kg} kg` : null)}
        ${datoItem("Talla", mine.talla_cm ? `${mine.talla_cm} cm` : null)}
        ${datoItem("IMC (calc.)", mine.imc ? mine.imc.toFixed(1) : null)}
        ${datoItem("% Grasa", mine.pct_grasa)}
        ${datoItem("Circ. cintura", mine.circunferencia_cintura_cm ? `${mine.circunferencia_cintura_cm} cm` : null)}
        ${datoItem("Otros cultivos", mine.otros_cultivos)}
      </div>`;
  } catch {
    $("datos-socio").innerHTML = vacio("Error al cargar");
  }
}

async function cargarPracticas(id) {
  try {
    const data = await GET("/social/productores_practica/");
    const mine = (Array.isArray(data) ? data : []).filter(
      (p) => p.productor_id === id,
    );
    if (!mine.length) {
      $("lista-practicas").innerHTML = vacio("Sin prácticas registradas");
      return;
    }
    // Obtener catálogo de prácticas solo una vez y cachear
    if (!window._catPracticas) {
      try {
        window._catPracticas = await fetch(
          `${API_CATALOGO}/agronomico/practica_agricola`,
        ).then((r) => r.json());
      } catch {
        window._catPracticas = [];
      }
    }
    const catPracticas = window._catPracticas;
    $("lista-practicas").innerHTML = `<div class="registros-lista">${mine
      .map((p) => {
        const practica = catPracticas.find((x) => x.id === p.practica_id);
        const nombre = practica
          ? practica.nombre
          : `Práctica #${p.practica_id}`;
        return `
      <div class="registro-item">
        <div><div class="registro-titulo">${nombre}</div></div>
        <div class="registro-acciones">
          <button class="btn btn-danger btn-xs" onclick="eliminarRegistro('/social/productores_practica/${p.id}', cargarPracticas.bind(null,${id}))">🗑</button>
        </div>
      </div>`;
      })
      .join("")}</div>`;
  } catch {
    $("lista-practicas").innerHTML = vacio("Error al cargar");
  }
}

async function cargarElcsa(id) {
  try {
    const data = await GET("/social/seguridad_alimentaria/");
    const mine = (Array.isArray(data) ? data : []).find(
      (e) => e.productor_id === id,
    );
    if (!mine) {
      $("datos-elcsa").innerHTML = vacio("Sin registro ELCSA");
      return;
    }
    $("btn-elcsa-accion").textContent = "✏ Editar";
    $("btn-elcsa-accion").onclick = () => abrirModalElcsa(mine);
    const score = mine.elcsa_puntaje_total ?? 0;
    const nivel = mine.nivel_inseguridad || "seguridad_alimentaria";
    const colorBar = nivel.includes("severa")
      ? "#A83220"
      : nivel.includes("moderada")
        ? "#d97706"
        : nivel.includes("leve")
          ? "#C8820A"
          : "#2A5C3F";
    const pct = Math.min((score / 18) * 100, 100);
    $("datos-elcsa").innerHTML = `
      <div class="elcsa-wrap">
        <div class="elcsa-score">
          <div class="elcsa-num" style="color:${colorBar}">${score}</div>
          <div class="elcsa-bar-wrap">
            <div style="font-size:11px;color:var(--gris);margin-bottom:6px;font-family:'DM Mono',monospace">Puntaje total / 18</div>
            <div class="elcsa-bar-track"><div class="elcsa-bar-fill" style="width:${pct}%;background:${colorBar}"></div></div>
            <div class="elcsa-nivel" style="color:${colorBar}">${nivel.replace(/_/g, " ").toUpperCase()}</div>
          </div>
        </div>
        <div class="datos-grid">
          ${datoItem("Personas en hogar", mine.num_personas_hogar)}
          ${datoItem("Gasto semanal maíz", mine.gasto_semanal_maiz ? `$${mine.gasto_semanal_maiz}` : null)}
          ${datoItem("¿Produce suficiente?", mine.produce_suficiente_maiz)}
          ${datoItem("Preocupación", mine.elcsa_preocupacion)}
          ${datoItem("Poca variedad", mine.elcsa_poca_variedad)}
          ${datoItem("Saltó comida", mine.elcsa_salto_comida)}
          ${datoItem("Comió menos", mine.elcsa_comio_menos)}
          ${datoItem("Sintió hambre", mine.elcsa_sintio_hambre)}
          ${datoItem("Dejó de comer un día", mine.elcsa_dejo_comer_dia)}
        </div>
      </div>`;
  } catch {
    $("datos-elcsa").innerHTML = vacio("Error al cargar");
  }
}

async function cargarClimatica(id) {
  try {
    const data = await GET("/social/vulnerabilidades_climaticas/");
    const mine = (Array.isArray(data) ? data : []).find(
      (v) => v.productor_id === id,
    );
    if (!mine) {
      $("datos-climatica").innerHTML = vacio(
        "Sin registro de vulnerabilidad climática",
      );
      return;
    }
    $("btn-clim-accion").textContent = "✏ Editar";
    $("btn-clim-accion").onclick = () => abrirModalClimatica(mine);
    const fenomenos = [
      "sequia",
      "heladas",
      "lluvias_intensas",
      "vientos",
      "inundaciones",
      "granizo",
    ]
      .filter((f) => mine[`afecta_${f}`])
      .map(
        (f) => `<span class="badge badge-rojo">${f.replace(/_/g, " ")}</span>`,
      )
      .join(" ");
    $("datos-climatica").innerHTML = `
      <div class="datos-grid">
        ${datoItem("¿Se siente vulnerable?", mine.se_siente_vulnerable !== null ? siNo(mine.se_siente_vulnerable) : null)}
        ${datoItem("Años sembrando maíz", mine.anos_sembrando_maiz)}
        ${datoItem("¿Percibe cambio en lluvia?", mine.percibe_cambio_lluvia !== null ? siNo(mine.percibe_cambio_lluvia) : null)}
        ${datoItem("¿Percibe cambio en temperatura?", mine.percibe_cambio_temperatura !== null ? siNo(mine.percibe_cambio_temperatura) : null)}
      </div>
      <div style="padding:14px 20px;border-top:1px solid var(--borde)">
        <div class="dato-label">Fenómenos que le afectan</div>
        <div style="margin-top:8px">${fenomenos || dash(null)}</div>
      </div>
      <div style="padding:14px 20px;border-top:1px solid var(--borde)">
        <div class="dato-label">Razón de vulnerabilidad</div>
        <div style="font-size:13px;color:var(--cafe);margin-top:4px">${dash(mine.razon_vulnerabilidad)}</div>
      </div>`;
  } catch {
    $("datos-climatica").innerHTML = vacio("Error al cargar");
  }
}

async function cargarRed(id) {
  try {
    const data = await GET("/social/redes_intercambio/");
    const mine = (Array.isArray(data) ? data : []).find(
      (r) => r.productor_id === id,
    );
    if (!mine) {
      $("datos-red").innerHTML = vacio("Sin red de intercambio registrada");
      return;
    }
    $("btn-red-accion").textContent = "✏ Editar";
    $("btn-red-accion").onclick = () => abrirModalRed(mine);
    const servicios = [
      "agua_entubada",
      "electricidad",
      "internet",
      "telefono_movil",
    ]
      .filter((s) => mine[`servicio_${s}`] || mine[`tiene_${s}`])
      .map(
        (s) => `<span class="badge badge-verde">${s.replace(/_/g, " ")}</span>`,
      )
      .join(" ");
    $("datos-red").innerHTML = `
      <div class="datos-grid">
        ${datoItem("Frecuencia de intercambio", mine.frecuencia_intercambio_semilla)}
        ${datoItem("Organización", mine.organizacion_nombre)}
        ${datoItem("¿Recibió capacitación?", mine.recibio_capacitacion !== null ? siNo(mine.recibio_capacitacion) : null)}
        ${datoItem("¿Acceso a crédito?", mine.tiene_acceso_credito !== null ? siNo(mine.tiene_acceso_credito) : null)}
        ${datoItem("¿Participa en ferias?", mine.participa_ferias_semillas !== null ? siNo(mine.participa_ferias_semillas) : null)}
      </div>
      <div style="padding:14px 20px;border-top:1px solid var(--borde)">
        <div class="dato-label">Servicios disponibles</div>
        <div style="margin-top:8px">${servicios || dash(null)}</div>
      </div>
      <div style="padding:14px 20px;border-top:1px solid var(--borde)">
        <div class="dato-label">Apoyos necesarios</div>
        <div style="font-size:13px;color:var(--cafe);margin-top:4px">${dash(mine.apoyos_necesarios)}</div>
      </div>`;
  } catch {
    $("datos-red").innerHTML = vacio("Error al cargar");
  }
}

async function cargarIdentidad(id) {
  try {
    const data = await GET("/cultural/identidades_culturales/");
    const mine = (Array.isArray(data) ? data : []).find(
      (i) => i.productor_id === id,
    );
    if (!mine) {
      $("datos-identidad").innerHTML = vacio(
        "Sin identidad cultural registrada",
      );
      return;
    }
    $("btn-identidad-accion").textContent = "✏ Editar";
    $("btn-identidad-accion").onclick = () => abrirModalIdentidad(mine);
    $("datos-identidad").innerHTML = `
      <div class="datos-grid">
        ${datoItem("¿Se identifica con etnia?", siNo(mine.se_identifica_etnia))}
        ${datoItem("Etnia", mine.etnia_nombre)}
        ${datoItem("¿Habla lengua originaria?", siNo(mine.habla_lengua_originaria))}
        ${datoItem("Nivel de dominio", mine.nivel_dominio_lengua)}
        ${datoItem("Maíz es parte de su identidad", siNo(mine.maiz_es_parte_identidad))}
        ${datoItem("Se siente guardián/a", siNo(mine.se_siente_guardian_semillas))}
        ${datoItem("Percibe pérdida cultural", siNo(mine.percibe_perdida_cultura_maiz))}
      </div>
      <div style="padding:14px 20px;border-top:1px solid var(--borde)">
        <div class="dato-label">Descripción del vínculo con el maíz</div>
        <div style="font-size:13px;color:var(--cafe);margin-top:4px;line-height:1.6">${dash(mine.descripcion_vinculo_identidad)}</div>
      </div>`;
  } catch {
    $("datos-identidad").innerHTML = vacio("Error al cargar");
  }
}

async function cargarTransmision(id) {
  try {
    const data = await GET("/cultural/transmisiones_conocimiento/");
    const mine = (Array.isArray(data) ? data : []).find(
      (t) => t.productor_id === id,
    );
    if (!mine) {
      $("datos-transmision").innerHTML = vacio(
        "Sin registro de transmisión del conocimiento",
      );
      return;
    }
    $("btn-transmision-accion").textContent = "✏ Editar";
    $("btn-transmision-accion").onclick = () => abrirModalTransmision(mine);
    $("datos-transmision").innerHTML = `
      <div class="datos-grid">
        ${datoItem("Generación transmisora", mine.generacion_transmisora)}
        ${datoItem("Edad inicio aprendizaje", mine.edad_inicio_aprendizaje)}
        ${datoItem("Mecanismo", mine.mecanismo_transmision)}
        ${datoItem("Transmite a hijos", siNo(mine.transmite_a_hijos))}
        ${datoItem("Transmite a jóvenes", siNo(mine.transmite_a_jovenes))}
        ${datoItem("Nivel de riesgo percibido", mine.nivel_riesgo_percibido ? `<span class="badge badge-${mine.nivel_riesgo_percibido === "critico" ? "rojo" : mine.nivel_riesgo_percibido === "alto" ? "maiz" : "verde"}">${mine.nivel_riesgo_percibido}</span>` : null)}
      </div>
      <div style="padding:14px 20px;border-top:1px solid var(--borde)">
        <div class="dato-label">Propuestas de preservación</div>
        <div style="font-size:13px;color:var(--cafe);margin-top:4px;line-height:1.6">${dash(mine.propuestas_preservacion)}</div>
      </div>`;
  } catch {
    $("datos-transmision").innerHTML = vacio("Error al cargar");
  }
}

async function cargarSaberes(id) {
  try {
    const data = await GET("/cultural/saberes_tradicionales/");
    const mine = (Array.isArray(data) ? data : []).filter(
      (s) => s.productor_id === id,
    );
    if (!mine.length) {
      $("lista-saberes").innerHTML = vacio("Sin saberes registrados");
      return;
    }
    $("lista-saberes").innerHTML = `<div class="registros-lista">${mine
      .map(
        (s) => `
      <div class="registro-item">
        <div style="flex:1">
          <div class="registro-titulo">${s.categoria?.replace(/_/g, " ") || "—"}</div>
          <div class="registro-sub">${(s.descripcion || "").slice(0, 80)}${s.descripcion?.length > 80 ? "…" : ""}</div>
          <div style="margin-top:4px">${s.esta_vigente ? '<span class="badge badge-verde">Vigente</span>' : '<span class="badge badge-gris">En desuso</span>'}</div>
        </div>
        <div class="registro-acciones">
          <button class="btn btn-edit btn-xs" onclick="abrirModalSaber(${JSON.stringify(s).replace(/"/g, "&quot;")})">✏</button>
          <button class="btn btn-danger btn-xs" onclick="eliminarRegistro('/cultural/saberes_tradicionales/${s.id}', cargarSaberes.bind(null,${id}))">🗑</button>
        </div>
      </div>`,
      )
      .join("")}</div>`;
  } catch {
    $("lista-saberes").innerHTML = vacio("Error al cargar");
  }
}

async function cargarNarrativas(id) {
  try {
    const data = await GET("/cultural/narrativas_orales/");
    const mine = (Array.isArray(data) ? data : []).filter(
      (n) => n.productor_id === id,
    );
    if (!mine.length) {
      $("lista-narrativas").innerHTML = vacio("Sin narrativas registradas");
      return;
    }
    $("lista-narrativas").innerHTML = `<div class="registros-lista">${mine
      .map(
        (n) => `
      <div class="registro-item">
        <div style="flex:1">
          <div class="registro-titulo">${n.titulo || n.tipo?.replace(/_/g, " ") || "—"}</div>
          <div class="registro-sub">${(n.contenido_resumen || "").slice(0, 80)}${n.contenido_resumen?.length > 80 ? "…" : ""}</div>
          <div style="margin-top:4px"><span class="badge badge-maiz">${n.tipo?.replace(/_/g, " ") || "—"}</span></div>
        </div>
        <div class="registro-acciones">
          <button class="btn btn-edit btn-xs" onclick="abrirModalNarrativa(${JSON.stringify(n).replace(/"/g, "&quot;")})">✏</button>
          <button class="btn btn-danger btn-xs" onclick="eliminarRegistro('/cultural/narrativas_orales/${n.id}', cargarNarrativas.bind(null,${id}))">🗑</button>
        </div>
      </div>`,
      )
      .join("")}</div>`;
  } catch {
    $("lista-narrativas").innerHTML = vacio("Error al cargar");
  }
}

async function cargarGastronomia(id) {
  try {
    const data = await GET("/cultural/gastronomias_tradicionales/");
    const mine = (Array.isArray(data) ? data : [])
      .filter((g) => g.comunidad_id || true)
      .slice(0, 50); // traer todo y filtrar si hay productor
    if (!mine.length) {
      $("lista-gastronomia").innerHTML = vacio("Sin gastronomía registrada");
      return;
    }
    $("lista-gastronomia").innerHTML = `<div class="registros-lista">${mine
      .map(
        (g) => `
      <div class="registro-item">
        <div style="flex:1">
          <div class="registro-titulo">${g.nombre_platillo || "—"}</div>
          <div class="registro-sub">${g.tipo?.replace(/_/g, " ") || ""} · ${g.ocasion || ""}</div>
          <div style="margin-top:4px">
            ${g.vinculo_ritual ? '<span class="badge badge-maiz">Ritual</span>' : ""}
            ${g.esta_vigente ? '<span class="badge badge-verde">Vigente</span>' : '<span class="badge badge-gris">En desuso</span>'}
          </div>
        </div>
        <div class="registro-acciones">
          <button class="btn btn-edit btn-xs" onclick="abrirModalGastronomia(${JSON.stringify(g).replace(/"/g, "&quot;")})">✏</button>
          <button class="btn btn-danger btn-xs" onclick="eliminarRegistro('/cultural/gastronomias_tradicionales/${g.id}', cargarGastronomia.bind(null,${id}))">🗑</button>
        </div>
      </div>`,
      )
      .join("")}</div>`;
  } catch {
    $("lista-gastronomia").innerHTML = vacio("Error al cargar");
  }
}

async function cargarConsentimiento(id) {
  try {
    const data = await GET("/social/consentimientos/");
    const mine = (Array.isArray(data) ? data : []).find(
      (c) => c.productor_id === id,
    );
    if (!mine) {
      $("datos-consentimiento").innerHTML = vacio(
        "Sin consentimiento registrado",
      );
      return;
    }
    $("btn-consent-accion").textContent = "✏ Editar";
    $("btn-consent-accion").onclick = () => abrirModalConsentimiento(mine);
    $("datos-consentimiento").innerHTML = `
      <div class="datos-grid">
        ${datoItem("Tipo", mine.tipo)}
        ${datoItem("Fecha", mine.fecha)}
        ${datoItem("Registrado por", mine.registrado_por)}
        ${datoItem("Autoriza fotografías", siNo(mine.autoriza_foto))}
        ${datoItem("Autoriza uso de datos", siNo(mine.autoriza_datos))}
        ${datoItem("Autoriza publicación", siNo(mine.autoriza_publicacion))}
      </div>
      <div style="padding:14px 20px;border-top:1px solid var(--borde)">
        <div class="dato-label">Observaciones</div>
        <div style="font-size:13px;color:var(--cafe);margin-top:4px">${dash(mine.observaciones)}</div>
      </div>`;
  } catch {
    $("datos-consentimiento").innerHTML = vacio("Error al cargar");
  }
}

// ── Helpers de render ────────────────────────────────────
function datoItem(lbl, v) {
  return `<div class="dato-item"><div class="dato-label">${lbl}</div><div class="dato-valor">${v !== null && v !== undefined && v !== "" ? v : '<span class="dato-vacio">—</span>'}</div></div>`;
}

function vacio(msg) {
  return `<div class="estado-centro" style="padding:28px"><div class="estado-ico" style="font-size:28px">🌽</div><div class="estado-sub">${msg}</div></div>`;
}

// ── Eliminar genérico ────────────────────────────────────
function eliminarRegistro(path, callback) {
  confirmar(
    "¿Eliminar este registro? Esta acción no se puede deshacer.",
    async () => {
      try {
        await DEL(path);
        toast("Eliminado correctamente", "ok");
        callback();
      } catch (e) {
        toast("Error: " + e.message, "err");
      }
    },
  );
}

// ═══════════════════════════════════════════════════════
// GUARDAR PRODUCTOR
// ═══════════════════════════════════════════════════════
function abrirModalProductor(p = null) {
  $("titulo-modal-productor").textContent = p
    ? "Editar productor"
    : "Nuevo productor";
  const campos = [
    "nombres",
    "apellido_paterno",
    "apellido_materno",
    "fecha_nacimiento",
    "genero",
    "estado_civil",
    "anios_experiencia",
  ];
  campos.forEach((c) => setVal(`p_${c}`, p ? p[c] : ""));
  // Calcular edad si hay fecha de nacimiento
  const fechaNac = document.getElementById("p_fecha_nacimiento");
  const edadInput = document.getElementById("p_edad");
  function calcularEdad(fechaStr) {
    if (!fechaStr) return "";
    const hoy = new Date();
    const nac = new Date(fechaStr);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  }
  if (fechaNac && edadInput) {
    edadInput.value = calcularEdad(fechaNac.value);
    fechaNac.addEventListener("change", function () {
      edadInput.value = calcularEdad(this.value);
    });
  }
  // Poblar select de comunidades
  const selectComunidad = document.getElementById("p_comunidad_id");
  if (selectComunidad) {
    selectComunidad.innerHTML = '<option value="">— Seleccionar —</option>';
    fetch(`${API_SOCIAL}/territorial/comunidad/`)
      .then((r) => r.json())
      .then((data) => {
        var comunidades = Array.isArray(data)
          ? data
          : data.items || data.results || [];
        comunidades.forEach((c) => {
          var opt = document.createElement("option");
          opt.value = c.id;
          opt.textContent = c.nombre;
          if (p && p.comunidad_id && p.comunidad_id == c.id)
            opt.selected = true;
          selectComunidad.appendChild(opt);
        });
      })
      .catch(() => {
        selectComunidad.innerHTML = '<option value="">Error al cargar</option>';
      });
  }
  $("modal-productor").classList.add("open");
  $("btn-guardar-productor") &&
    ($("btn-guardar-productor").onclick = () => guardarProductor(p));
}

async function guardarProductor(p = null) {
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, "0");
  const dd = String(hoy.getDate()).padStart(2, "0");
  const fechaActual = `${yyyy}-${mm}-${dd}`;
  const d = {
    nombres: val("p_nombres"),
    apellido_paterno: val("p_apellido_paterno") || null,
    apellido_materno: val("p_apellido_materno") || null,
    fecha_nacimiento: val("p_fecha_nacimiento") || null,
    genero: val("p_genero") || null,
    estado_civil: val("p_estado_civil") || null,
    anios_experiencia: numVal("p_anios_experiencia"),
    fecha_registro: fechaActual,
    comunidad_id: val("p_comunidad_id") ? Number(val("p_comunidad_id")) : null,
  };
  if (!d.nombres) {
    toast("El nombre es obligatorio", "warn");
    return;
  }
  try {
    if (p) {
      await PUT(`/social/productores/${p.id}/`, d);
      toast("Productor actualizado", "ok");
    } else {
      await POST("/social/productores/", d);
      toast("Productor creado", "ok");
    }
    cerrarModal("modal-productor");
    if (p && productorActual?.id === p.id) verPerfil(p.id);
    else cargarProductores();
  } catch (e) {
    toast("Error: " + e.message, "err");
  }
}

function eliminarProductor(id, nombre) {
  confirmar(
    `¿Eliminar al productor "${nombre}"? Se perderán todos sus datos asociados.`,
    async () => {
      try {
        await DEL(`${API_SOCIAL}/productores/${id}`);
        toast("Productor eliminado", "ok");
        volverLista();
        cargarProductores();
      } catch (e) {
        toast("Error: " + e.message, "err");
      }
    },
  );
}

function confirmarEliminarProductor() {
  if (!productorActual) return;
  const nombre = [productorActual.nombres, productorActual.apellido_paterno]
    .filter(Boolean)
    .join(" ");
  eliminarProductor(productorActual.id, nombre);
}

// ═══════════════════════════════════════════════════════
// GUARDAR SECCIONES
// ═══════════════════════════════════════════════════════
function abrirModalSocio(s = null) {
  const campos = [
    "escolaridad",
    "decision_siembra",
    "superficie_total_ha",
    "superficie_maiz_ha",
    "peso_kg",
    "talla_cm",
    "pct_grasa",
    "circunferencia_cintura_cm",
    "circunferencia_cadera_cm",
    "otros_cultivos",
    "diagnostico_enfermedad",
  ];
  campos.forEach((c) => setVal(`s_${c}`, s ? s[c] : ""));
  $("modal-socio").classList.add("open");
}

async function guardarSocio() {
  const id = productorActual?.id;
  if (!id) return;
  const d = {
    productor_id: id,
    escolaridad: val("s_escolaridad") || null,
    decision_siembra: val("s_decision_siembra") || null,
    superficie_total_ha: numVal("s_superficie_total_ha"),
    superficie_maiz_ha: numVal("s_superficie_maiz_ha"),
    peso_kg: numVal("s_peso_kg"),
    talla_cm: numVal("s_talla_cm"),
    pct_grasa: numVal("s_pct_grasa"),
    circunferencia_cintura_cm: numVal("s_circunferencia_cintura_cm"),
    circunferencia_cadera_cm: numVal("s_circunferencia_cadera_cm"),
    otros_cultivos: val("s_otros_cultivos") || null,
    diagnostico_enfermedad: val("s_diagnostico_enfermedad") || null,
  };
  try {
    const existe = await GET("/social/perfiles_socioeconomicos/").then((data) =>
      (Array.isArray(data) ? data : []).find((s) => s.productor_id === id),
    );
    if (existe) await PUT(`/social/perfiles_socioeconomicos/${existe.id}/`, d);
    else await POST("/social/perfiles_socioeconomicos/", d);
    toast("Perfil socioeconómico guardado", "ok");
    cerrarModal("modal-socio");
    cargarSocio(id);
  } catch (e) {
    toast("Error: " + e.message, "err");
  }
}

function abrirModalElcsa(e = null) {
  [
    "num_personas_hogar",
    "gasto_semanal_maiz",
    "produce_suficiente_maiz",
    "elcsa_preocupacion",
    "elcsa_poca_variedad",
    "elcsa_salto_comida",
    "elcsa_comio_menos",
    "elcsa_sintio_hambre",
    "elcsa_dejo_comer_dia",
  ].forEach((c) => setVal(`e_${c}`, e ? e[c] : ""));
  $("modal-elcsa").classList.add("open");
}

async function guardarElcsa() {
  const id = productorActual?.id;
  if (!id) return;
  const d = {
    productor_id: id,
    num_personas_hogar: numVal("e_num_personas_hogar"),
    gasto_semanal_maiz: numVal("e_gasto_semanal_maiz"),
    produce_suficiente_maiz: val("e_produce_suficiente_maiz") || null,
    elcsa_preocupacion: numVal("e_elcsa_preocupacion"),
    elcsa_poca_variedad: numVal("e_elcsa_poca_variedad"),
    elcsa_salto_comida: numVal("e_elcsa_salto_comida"),
    elcsa_comio_menos: numVal("e_elcsa_comio_menos"),
    elcsa_sintio_hambre: numVal("e_elcsa_sintio_hambre"),
    elcsa_dejo_comer_dia: numVal("e_elcsa_dejo_comer_dia"),
  };
  try {
    const existe = await GET("/social/seguridad_alimentaria/").then((data) =>
      (Array.isArray(data) ? data : []).find((e) => e.productor_id === id),
    );
    if (existe) await PUT(`/social/seguridad_alimentaria/${existe.id}/`, d);
    else await POST("/social/seguridad_alimentaria/", d);
    toast("ELCSA guardado", "ok");
    cerrarModal("modal-elcsa");
    cargarElcsa(id);
  } catch (e) {
    toast("Error: " + e.message, "err");
  }
}

function abrirModalClimatica(c = null) {
  [
    "se_siente_vulnerable",
    "anos_sembrando_maiz",
    "razon_vulnerabilidad",
    "percibe_cambio_lluvia",
    "percibe_cambio_temperatura",
  ].forEach((f) => setVal(`c_${f}`, c ? c[f] : ""));
  [
    "sequia",
    "heladas",
    "lluvias_intensas",
    "vientos",
    "inundaciones",
    "granizo",
  ].forEach((f) => setChk(`c_afecta_${f}`, c ? c[`afecta_${f}`] : false));
  $("modal-climatica").classList.add("open");
}

async function guardarClimatica() {
  const id = productorActual?.id;
  if (!id) return;
  const d = {
    productor_id: id,
    se_siente_vulnerable: boolVal("c_se_siente_vulnerable"),
    anos_sembrando_maiz: numVal("c_anos_sembrando_maiz"),
    razon_vulnerabilidad: val("c_razon_vulnerabilidad") || null,
    percibe_cambio_lluvia: boolVal("c_percibe_cambio_lluvia"),
    percibe_cambio_temperatura: boolVal("c_percibe_cambio_temperatura"),
    afecta_sequia: chk("c_afecta_sequia"),
    afecta_heladas: chk("c_afecta_heladas"),
    afecta_lluvias_intensas: chk("c_afecta_lluvias_intensas"),
    afecta_vientos: chk("c_afecta_vientos"),
    afecta_inundaciones: chk("c_afecta_inundaciones"),
    afecta_granizo: chk("c_afecta_granizo"),
    estrategia_cambio_fecha_siembra: chk("c_estrategia_cambio_fecha_siembra"),
    estrategia_variedad_resistente: chk("c_estrategia_variedad_resistente"),
    estrategia_diversificacion: chk("c_estrategia_diversificacion"),
    estrategia_almacenamiento_agua: chk("c_estrategia_almacenamiento_agua"),
    estrategia_seguro_agricola: chk("c_estrategia_seguro_agricola"),
  };
  try {
    const existe = await GET("/social/vulnerabilidades_climaticas/").then(
      (data) =>
        (Array.isArray(data) ? data : []).find((v) => v.productor_id === id),
    );
    if (existe)
      await PUT(`/social/vulnerabilidades_climaticas/${existe.id}/`, d);
    else await POST("/social/vulnerabilidades_climaticas/", d);
    toast("Vulnerabilidad climática guardada", "ok");
    cerrarModal("modal-climatica");
    cargarClimatica(id);
  } catch (e) {
    toast("Error: " + e.message, "err");
  }
}

function abrirModalRed(r = null) {
  [
    "frecuencia_intercambio_semilla",
    "organizacion_nombre",
    "razon_abandono_nativas",
    "apoyos_necesarios",
  ].forEach((f) => setVal(`r_${f}`, r ? r[f] : ""));
  [
    "servicio_agua_entubada",
    "servicio_electricidad",
    "servicio_internet",
    "tiene_telefono_movil",
    "recibio_capacitacion",
    "tiene_acceso_credito",
    "recibio_apoyo_programa",
    "participa_ferias_semillas",
    "motivacion_tradicion",
    "motivacion_ingresos",
    "motivacion_autoconsumo",
    "motivacion_seguridad_alimentaria",
  ].forEach((f) => setChk(`r_${f}`, r ? r[f] : false));
  $("modal-red").classList.add("open");
}

async function guardarRed() {
  const id = productorActual?.id;
  if (!id) return;
  const d = {
    productor_id: id,
    frecuencia_intercambio_semilla:
      val("r_frecuencia_intercambio_semilla") || null,
    organizacion_nombre: val("r_organizacion_nombre") || null,
    razon_abandono_nativas: val("r_razon_abandono_nativas") || null,
    apoyos_necesarios: val("r_apoyos_necesarios") || null,
    servicio_agua_entubada: chk("r_servicio_agua_entubada"),
    servicio_electricidad: chk("r_servicio_electricidad"),
    servicio_internet: chk("r_servicio_internet"),
    tiene_telefono_movil: chk("r_tiene_telefono_movil"),
    recibio_capacitacion: chk("r_recibio_capacitacion"),
    tiene_acceso_credito: chk("r_tiene_acceso_credito"),
    recibio_apoyo_programa: chk("r_recibio_apoyo_programa"),
    participa_ferias_semillas: chk("r_participa_ferias_semillas"),
    motivacion_tradicion: chk("r_motivacion_tradicion"),
    motivacion_ingresos: chk("r_motivacion_ingresos"),
    motivacion_autoconsumo: chk("r_motivacion_autoconsumo"),
    motivacion_seguridad_alimentaria: chk("r_motivacion_seguridad_alimentaria"),
  };
  try {
    const existe = await GET("/social/redes_intercambio/").then((data) =>
      (Array.isArray(data) ? data : []).find((r) => r.productor_id === id),
    );
    if (existe) await PUT(`/social/redes_intercambio/${existe.id}/`, d);
    else await POST("/social/redes_intercambio/", d);
    toast("Red de intercambio guardada", "ok");
    cerrarModal("modal-red");
    cargarRed(id);
  } catch (e) {
    toast("Error: " + e.message, "err");
  }
}

function abrirModalIdentidad(i = null) {
  [
    "se_identifica_etnia",
    "etnia_nombre",
    "habla_lengua_originaria",
    "nivel_dominio_lengua",
    "descripcion_vinculo_identidad",
    "descripcion_perdida_cultural",
  ].forEach((f) => setVal(`i_${f}`, i ? i[f] : ""));
  [
    "maiz_es_parte_identidad",
    "se_siente_orgulloso_maiz_nativo",
    "valora_diversidad_variedades",
    "se_siente_guardian_semillas",
    "percibe_perdida_cultura_maiz",
  ].forEach((f) => setChk(`i_${f}`, i ? i[f] : false));
  $("modal-identidad").classList.add("open");
}

async function guardarIdentidad() {
  const id = productorActual?.id;
  if (!id) return;
  const d = {
    productor_id: id,
    se_identifica_etnia: boolVal("i_se_identifica_etnia"),
    etnia_nombre: val("i_etnia_nombre") || null,
    habla_lengua_originaria: boolVal("i_habla_lengua_originaria"),
    nivel_dominio_lengua: val("i_nivel_dominio_lengua") || null,
    descripcion_vinculo_identidad:
      val("i_descripcion_vinculo_identidad") || null,
    descripcion_perdida_cultural: val("i_descripcion_perdida_cultural") || null,
    maiz_es_parte_identidad: chk("i_maiz_es_parte_identidad"),
    se_siente_orgulloso_maiz_nativo: chk("i_se_siente_orgulloso_maiz_nativo"),
    valora_diversidad_variedades: chk("i_valora_diversidad_variedades"),
    se_siente_guardian_semillas: chk("i_se_siente_guardian_semillas"),
    percibe_perdida_cultura_maiz: chk("i_percibe_perdida_cultura_maiz"),
  };
  try {
    const existe = await GET("/cultural/identidades_culturales/").then((data) =>
      (Array.isArray(data) ? data : []).find((i) => i.productor_id === id),
    );
    if (existe) await PUT(`/cultural/identidades_culturales/${existe.id}/`, d);
    else await POST("/cultural/identidades_culturales/", d);
    toast("Identidad cultural guardada", "ok");
    cerrarModal("modal-identidad");
    cargarIdentidad(id);
  } catch (e) {
    toast("Error: " + e.message, "err");
  }
}

function abrirModalTransmision(t = null) {
  [
    "generacion_transmisora",
    "edad_inicio_aprendizaje",
    "mecanismo_transmision",
    "nivel_riesgo_percibido",
    "propuestas_preservacion",
  ].forEach((f) => setVal(`t_${f}`, t ? t[f] : ""));
  [
    "recibio_conocimiento_familiar",
    "transmite_a_hijos",
    "transmite_a_nietos",
    "transmite_a_comunidad",
    "transmite_a_jovenes",
    "barrera_migracion_jovenes",
    "barrera_desinteres",
    "barrera_escolarizacion",
    "barrera_perdida_lengua",
    "barrera_cambio_cultivos",
  ].forEach((f) => setChk(`t_${f}`, t ? t[f] : false));
  $("modal-transmision").classList.add("open");
}

async function guardarTransmision() {
  const id = productorActual?.id;
  if (!id) return;
  const d = {
    productor_id: id,
    generacion_transmisora: val("t_generacion_transmisora") || null,
    edad_inicio_aprendizaje: numVal("t_edad_inicio_aprendizaje"),
    mecanismo_transmision: val("t_mecanismo_transmision") || null,
    nivel_riesgo_percibido: val("t_nivel_riesgo_percibido") || null,
    propuestas_preservacion: val("t_propuestas_preservacion") || null,
    recibio_conocimiento_familiar: chk("t_recibio_conocimiento_familiar"),
    transmite_a_hijos: chk("t_transmite_a_hijos"),
    transmite_a_nietos: chk("t_transmite_a_nietos"),
    transmite_a_comunidad: chk("t_transmite_a_comunidad"),
    transmite_a_jovenes: chk("t_transmite_a_jovenes"),
    barrera_migracion_jovenes: chk("t_barrera_migracion_jovenes"),
    barrera_desinteres: chk("t_barrera_desinteres"),
    barrera_escolarizacion: chk("t_barrera_escolarizacion"),
    barrera_perdida_lengua: chk("t_barrera_perdida_lengua"),
    barrera_cambio_cultivos: chk("t_barrera_cambio_cultivos"),
  };
  try {
    const existe = await GET("/cultural/transmisiones_conocimiento/").then(
      (data) =>
        (Array.isArray(data) ? data : []).find((t) => t.productor_id === id),
    );
    if (existe)
      await PUT(`/cultural/transmisiones_conocimiento/${existe.id}/`, d);
    else await POST("/cultural/transmisiones_conocimiento/", d);
    toast("Transmisión del conocimiento guardada", "ok");
    cerrarModal("modal-transmision");
    cargarTransmision(id);
  } catch (e) {
    toast("Error: " + e.message, "err");
  }
}

function abrirModalSaber(s = null) {
  idSaberEditando = s ? s.id : null;
  $("titulo-modal-saber").textContent = s
    ? "Editar saber"
    : "Nuevo saber tradicional";
  [
    "categoria",
    "descripcion",
    "descripcion_lengua_orig",
    "aprendio_de",
    "generaciones_estimadas",
    "esta_vigente",
    "registrado_por",
  ].forEach((f) => setVal(`sa_${f}`, s ? s[f] : ""));
  $("modal-saber").classList.add("open");
}

async function guardarSaber() {
  const id = productorActual?.id;
  if (!id) return;
  const d = {
    productor_id: id,
    categoria: val("sa_categoria") || null,
    descripcion: val("sa_descripcion"),
    descripcion_lengua_orig: val("sa_descripcion_lengua_orig") || null,
    aprendio_de: val("sa_aprendio_de") || null,
    generaciones_estimadas: numVal("sa_generaciones_estimadas"),
    esta_vigente: boolVal("sa_esta_vigente") ?? true,
    registrado_por: val("sa_registrado_por") || null,
  };
  if (!d.descripcion) {
    toast("La descripción es obligatoria", "warn");
    return;
  }
  try {
    if (idSaberEditando)
      await PUT(`/cultural/saberes_tradicionales/${idSaberEditando}/`, d);
    else await POST("/cultural/saberes_tradicionales/", d);
    toast("Saber guardado", "ok");
    cerrarModal("modal-saber");
    cargarSaberes(id);
  } catch (e) {
    toast("Error: " + e.message, "err");
  }
}

function abrirModalNarrativa(n = null) {
  idNarrativaEditando = n ? n.id : null;
  $("titulo-modal-narrativa").textContent = n
    ? "Editar narrativa"
    : "Nueva narrativa oral";
  [
    "tipo",
    "titulo",
    "vinculo_maiz",
    "contenido_resumen",
    "contenido_transcripcion",
    "generaciones_estimadas",
    "esta_vigente",
    "registrado_por",
  ].forEach((f) => setVal(`na_${f}`, n ? n[f] : ""));
  $("modal-narrativa").classList.add("open");
}

async function guardarNarrativa() {
  const id = productorActual?.id;
  if (!id) return;
  const d = {
    productor_id: id,
    tipo: val("na_tipo") || null,
    titulo: val("na_titulo") || null,
    vinculo_maiz: val("na_vinculo_maiz") || null,
    contenido_resumen: val("na_contenido_resumen"),
    contenido_transcripcion: val("na_contenido_transcripcion") || null,
    generaciones_estimadas: numVal("na_generaciones_estimadas"),
    esta_vigente: boolVal("na_esta_vigente") ?? true,
    registrado_por: val("na_registrado_por") || null,
  };
  if (!d.contenido_resumen) {
    toast("El resumen del contenido es obligatorio", "warn");
    return;
  }
  try {
    if (idNarrativaEditando)
      await PUT(`/cultural/narrativas_orales/${idNarrativaEditando}/`, d);
    else await POST("/cultural/narrativas_orales/", d);
    toast("Narrativa guardada", "ok");
    cerrarModal("modal-narrativa");
    cargarNarrativas(id);
  } catch (e) {
    toast("Error: " + e.message, "err");
  }
}

function abrirModalGastronomia(g = null) {
  idGastroEditando = g ? g.id : null;
  $("titulo-modal-gastronomia").textContent = g
    ? "Editar platillo"
    : "Nuevo platillo";
  [
    "nombre_platillo",
    "tipo",
    "ocasion",
    "frecuencia_preparacion",
    "variedad_maiz_preferida",
    "ingredientes_principales",
    "descripcion_preparacion",
    "significado_cultural",
    "vinculo_ritual",
    "esta_vigente",
    "registrado_por",
  ].forEach((f) => setVal(`g_${f}`, g ? g[f] : ""));
  $("modal-gastronomia").classList.add("open");
}

async function guardarGastronomia() {
  const id = productorActual?.id;
  if (!id) return;
  const d = {
    nombre_platillo: val("g_nombre_platillo"),
    tipo: val("g_tipo") || null,
    ocasion: val("g_ocasion") || null,
    frecuencia_preparacion: val("g_frecuencia_preparacion") || null,
    variedad_maiz_preferida: val("g_variedad_maiz_preferida") || null,
    ingredientes_principales: val("g_ingredientes_principales") || null,
    descripcion_preparacion: val("g_descripcion_preparacion") || null,
    significado_cultural: val("g_significado_cultural") || null,
    vinculo_ritual: boolVal("g_vinculo_ritual") ?? false,
    esta_vigente: boolVal("g_esta_vigente") ?? true,
    registrado_por: val("g_registrado_por") || null,
  };
  if (!d.nombre_platillo) {
    toast("El nombre del platillo es obligatorio", "warn");
    return;
  }
  try {
    if (idGastroEditando)
      await PUT(`/cultural/gastronomias_tradicionales/${idGastroEditando}/`, d);
    else await POST("/cultural/gastronomias_tradicionales/", d);
    toast("Gastronomía guardada", "ok");
    cerrarModal("modal-gastronomia");
    cargarGastronomia(id);
  } catch (e) {
    toast("Error: " + e.message, "err");
  }
}

async function guardarLengua() {
  const id = productorActual?.id;
  if (!id) return;
  const d = {
    productor_id: id,
    lengua_id: numVal("l_lengua_id"),
    es_materna: boolVal("l_es_materna") ?? false,
  };
  if (!d.lengua_id) {
    toast("El ID de lengua es obligatorio", "warn");
    return;
  }
  try {
    await POST("/social/productores_lengua/", d);
    toast("Lengua agregada", "ok");
    cerrarModal("modal-lengua");
    cargarLenguas(id);
  } catch (e) {
    toast("Error: " + e.message, "err");
  }
}

function abrirModalGeo() {
  $("modal-geo") && $("modal-geo").classList.add("open");
}

async function abrirModalPractica() {
  const modal = document.getElementById("modal-practica");
  if (modal) modal.classList.add("open");
  const contenedor = document.getElementById("practicas-checkbox-list");
  if (!contenedor) return;
  contenedor.innerHTML = '<div class="spinner"></div>';
  try {
    fetch("http://localhost:8001/agronomico/practica_agricola/")
      .then((r) => r.json())
      .then((data) => {
        var practicas_agricolas = Array.isArray(data)
          ? data
          : data.items || data.results || [];
        practicas_agricolas.forEach((c) => {
          contenedor.innerHTML = practicas_agricolas
            .map(
              (p) =>
                `<label class="check-form-item"><input type="checkbox" value="${p.id}" name="practica_agricola"> ${p.nombre}</label>`,
            )
            .join("");
        });
      })
      .catch(() => {
        contenedor.innerHTML =
          '<div style="color:#a83220">No hay prácticas registradas</div>';
      });
  } catch (e) {
    contenedor.innerHTML =
      '<div style="color:#a83220">Error al cargar prácticas</div>';
  }
}

async function guardarPractica() {
  const id = productorActual?.id;
  if (!id) return;
  const checkboxes = document.querySelectorAll(
    '#practicas-checkbox-list input[type="checkbox"]:checked',
  );
  const practicas_ids = Array.from(checkboxes).map((cb) => Number(cb.value));
  try {
    for (const practica_id of practicas_ids) {
      await POST("/social/productores_practica/", {
        productor_id: id,
        practica_id: practica_id,
      });
    }
    toast("Prácticas agrícolas guardadas", "ok");
    cerrarModal("modal-practica");
    cargarPracticas(id);
  } catch (e) {
    toast("Error: " + e.message, "err");
  }
}

function abrirModalConsentimiento(c = null) {
  ["tipo", "registrado_por", "fecha", "observaciones"].forEach((f) =>
    setVal(`co_${f}`, c ? c[f] : ""),
  );
  ["autoriza_foto", "autoriza_datos", "autoriza_publicacion"].forEach((f) =>
    setChk(`co_${f}`, c ? c[f] : false),
  );
  if (!c) $("co_fecha").value = new Date().toISOString().split("T")[0];
  $("modal-consentimiento").classList.add("open");
}

async function guardarConsentimiento() {
  const id = productorActual?.id;
  if (!id) return;
  const d = {
    productor_id: id,
    tipo: val("co_tipo") || null,
    registrado_por: val("co_registrado_por") || null,
    fecha: val("co_fecha") || null,
    observaciones: val("co_observaciones") || null,
    autoriza_foto: chk("co_autoriza_foto"),
    autoriza_datos: chk("co_autoriza_datos"),
    autoriza_publicacion: chk("co_autoriza_publicacion"),
  };
  try {
    const existe = await GET("/social/consentimientos/").then((data) =>
      (Array.isArray(data) ? data : []).find((c) => c.productor_id === id),
    );
    if (existe) await PUT(`/social/consentimientos/${existe.id}/`, d);
    else await POST("/social/consentimientos/", d);
    toast("Consentimiento guardado", "ok");
    cerrarModal("modal-consentimiento");
    cargarConsentimiento(id);
    cargarRituales(id);
    cargarNLO(id);
  } catch (e) {
    toast("Error: " + e.message, "err");
  }
}

// ═══════════════════════════════════════════════════════
// PAGINACIÓN
// ═══════════════════════════════════════════════════════
const PAG_TAMANO = 10;
let pagActual = 1;

function paginar(datos) {
  const total = datos.length;
  const totalPags = Math.ceil(total / PAG_TAMANO);
  pagActual = Math.min(pagActual, totalPags || 1);
  const inicio = (pagActual - 1) * PAG_TAMANO;
  return {
    slice: datos.slice(inicio, inicio + PAG_TAMANO),
    total,
    totalPags,
    inicio,
  };
}

function renderPaginacion(total, totalPags, inicio, fnRerender) {
  const fin = Math.min(inicio + PAG_TAMANO, total);
  let btns = "";
  const rango = 2;
  for (let i = 1; i <= totalPags; i++) {
    if (
      i === 1 ||
      i === totalPags ||
      (i >= pagActual - rango && i <= pagActual + rango)
    ) {
      btns += `<button class="pag-btn${i === pagActual ? " active" : ""}" onclick="irPagina(${i}, listaTmp, '${fnRerender}')">${i}</button>`;
    } else if (i === pagActual - rango - 1 || i === pagActual + rango + 1) {
      btns += `<span style="padding:5px 4px;color:var(--gris);font-size:11px">…</span>`;
    }
  }
  return `<div class="pag-wrap">
    <span class="pag-info">Mostrando ${inicio + 1}–${fin} de ${total}</span>
    <div class="pag-btns">
      <button class="pag-btn" onclick="irPagina(${pagActual - 1}, listaTmp, '${fnRerender}')" ${pagActual <= 1 ? "disabled" : ""}>←</button>
      ${btns}
      <button class="pag-btn" onclick="irPagina(${pagActual + 1}, listaTmp, '${fnRerender}')" ${pagActual >= totalPags ? "disabled" : ""}>→</button>
    </div>
  </div>`;
}

let listaTmp = [];
function irPagina(n, datos, fn) {
  pagActual = n;
  listaTmp = datos;
  if (fn === "renderLista") renderLista(datos);
}

// Parchear renderLista para incluir paginación
const _renderListaOrig = renderLista;
function renderLista(datos) {
  listaTmp = datos;
  $("count-lista").textContent =
    `${datos.length} productor${datos.length !== 1 ? "es" : ""}`;
  if (!datos.length) {
    $("tabla-productores").innerHTML =
      `<div class="estado-centro"><div class="estado-ico">🌽</div><div class="estado-txt">Sin productores registrados</div><div class="estado-sub">¡Agrega el primero!</div></div>`;
    return;
  }
  const { slice, total, totalPags, inicio } = paginar(datos);
  const filas = slice
    .map((p) => {
      const nombre = [p.nombres, p.apellido_paterno, p.apellido_materno]
        .filter(Boolean)
        .join(" ");
      const manejo = p.tipo_manejo
        ? `<span class="badge badge-verde">${p.tipo_manejo}</span>`
        : "";
      return `<tr onclick="verPerfil(${p.id})" title="Ver perfil">
      <td>${p.id}</td>
      <td><strong>${nombre || "—"}</strong></td>
      <td>${p.edad ?? "—"}</td>
      <td>${p.genero ?? "—"}</td>
      <td>${p.anos_experiencia ?? "—"} años</td>
      <td>${manejo}</td>
      <td><div class="td-acciones" onclick="event.stopPropagation()">
        <button class="btn btn-edit btn-xs" onclick="abrirModalProductor(${JSON.stringify(p).replace(/"/g, "&quot;")})">✏</button>
        <button class="btn btn-danger btn-xs" onclick="eliminarProductor(${p.id},'${nombre.replace(/'/g, "\'")}')">🗑</button>
      </div></td>
    </tr>`;
    })
    .join("");

  $("tabla-productores").innerHTML = `
    <table>
      <thead><tr>
        <th>#</th><th>Nombre</th><th>Edad</th><th>Género</th><th>Experiencia</th><th>Manejo</th><th>Acciones</th>
      </tr></thead>
      <tbody>${filas}</tbody>
    </table>
    ${renderPaginacion(total, totalPags, inicio, "renderLista")}`;
}

// ═══════════════════════════════════════════════════════
// GEOLOCALIZACIÓN
// ═══════════════════════════════════════════════════════
function abrirModalGeo() {
  [
    "latitud",
    "longitud",
    "altitud_m",
    "precision_m",
    "fuente_captura",
    "tipo_punto",
    "observaciones",
  ].forEach((f) => setVal(`geo_${f}`, ""));
  $("modal-geo").classList.add("open");
}

async function guardarGeo() {
  const id = productorActual?.id;
  if (!id) return;
  const lat = numVal("geo_latitud"),
    lon = numVal("geo_longitud");
  if (!lat || !lon) {
    toast("Latitud y longitud son obligatorias", "warn");
    return;
  }
  const d = {
    productor_id: id,
    latitud: lat,
    longitud: lon,
    altitud_m: numVal("geo_altitud_m"),
    precision_m: numVal("geo_precision_m"),
    fuente_captura: val("geo_fuente_captura") || null,
    tipo_punto: val("geo_tipo_punto") || null,
    observaciones: val("geo_observaciones") || null,
  };
  try {
    await POST("/social/geolocalizaciones_productor/", d);
    toast("Geolocalización guardada", "ok");
    cerrarModal("modal-geo");
    cargarGeo(id);
  } catch (e) {
    toast("Error: " + e.message, "err");
  }
}

// ═══════════════════════════════════════════════════════
// RITUALES AGRÍCOLAS
// ═══════════════════════════════════════════════════════
let idRitualEditando = null;

async function cargarRituales(id) {
  try {
    const data = await GET("/cultural/rituales_agricolas/");
    const mine = (Array.isArray(data) ? data : []).filter(
      (r) => r.productor_id === id,
    );
    if (!mine.length) {
      $("lista-rituales").innerHTML = vacio("Sin rituales registrados");
      return;
    }
    $("lista-rituales").innerHTML = `<div class="registros-lista">${mine
      .map(
        (r) => `
      <div class="registro-item">
        <div style="flex:1">
          <div class="registro-titulo">${r.nombre || "—"}</div>
          <div class="registro-sub">${r.tipo?.replace(/_/g, " ") || ""} · ${r.epoca_anio || ""} · ${r.frecuencia || ""}</div>
          <div style="margin-top:4px">
            ${r.esta_vigente ? '<span class="badge badge-verde">Vigente</span>' : '<span class="badge badge-gris">En desuso</span>'}
          </div>
        </div>
        <div class="registro-acciones">
          <button class="btn btn-edit btn-xs" onclick="abrirModalRitual(${JSON.stringify(r).replace(/"/g, "&quot;")})">✏</button>
          <button class="btn btn-danger btn-xs" onclick="eliminarRegistro('/cultural/rituales_agricolas/${r.id}', cargarRituales.bind(null,${id}))">🗑</button>
        </div>
      </div>`,
      )
      .join("")}</div>`;
  } catch {
    $("lista-rituales").innerHTML = vacio("Error al cargar rituales");
  }
}

function abrirModalRitual(r = null) {
  idRitualEditando = r ? r.id : null;
  $("titulo-modal-ritual").textContent = r
    ? "Editar ritual"
    : "Nuevo ritual agrícola";
  [
    "nombre",
    "tipo",
    "epoca_anio",
    "frecuencia",
    "descripcion",
    "elementos_materiales",
    "vinculo_maiz",
    "participantes",
    "generaciones_estimadas",
    "esta_vigente",
    "registrado_por",
  ].forEach((f) => setVal(`ri_${f}`, r ? r[f] : ""));
  $("modal-ritual").classList.add("open");
}

async function guardarRitual() {
  const id = productorActual?.id;
  if (!id) return;
  const d = {
    productor_id: id,
    nombre: val("ri_nombre"),
    tipo: val("ri_tipo") || null,
    epoca_anio: val("ri_epoca_anio") || null,
    frecuencia: val("ri_frecuencia") || null,
    descripcion: val("ri_descripcion"),
    elementos_materiales: val("ri_elementos_materiales") || null,
    vinculo_maiz: val("ri_vinculo_maiz") || null,
    participantes: val("ri_participantes") || null,
    generaciones_estimadas: numVal("ri_generaciones_estimadas"),
    esta_vigente: boolVal("ri_esta_vigente") ?? true,
    registrado_por: val("ri_registrado_por") || null,
  };
  if (!d.nombre) {
    toast("El nombre del ritual es obligatorio", "warn");
    return;
  }
  if (!d.descripcion) {
    toast("La descripción es obligatoria", "warn");
    return;
  }
  try {
    if (idRitualEditando)
      await PUT(`/cultural/rituales_agricolas/${idRitualEditando}/`, d);
    else await POST("/cultural/rituales_agricolas/", d);
    toast("Ritual guardado", "ok");
    cerrarModal("modal-ritual");
    cargarRituales(id);
  } catch (e) {
    toast("Error: " + e.message, "err");
  }
}

// ═══════════════════════════════════════════════════════
// NOMBRES EN LENGUA ORIGINARIA
// ═══════════════════════════════════════════════════════
let idNLOEditando = null;

async function cargarNLO(id) {
  try {
    const data = await GET("/cultural/nombres_lenguas_originarias/");
    const mine = (Array.isArray(data) ? data : []).filter(
      (n) => n.productor_id === id,
    );
    if (!mine.length) {
      $("lista-nlo").innerHTML = vacio(
        "Sin nombres en lengua originaria registrados",
      );
      return;
    }
    $("lista-nlo").innerHTML = `<div class="registros-lista">${mine
      .map(
        (n) => `
      <div class="registro-item">
        <div style="flex:1">
          <div class="registro-titulo">${n.nombre || "—"}</div>
          <div class="registro-sub">${n.transcripcion_fonetica ? `[${n.transcripcion_fonetica}]` : ""} · Lengua #${n.lengua_id || "—"}</div>
          ${n.contexto_uso ? `<div class="registro-sub" style="margin-top:4px">${n.contexto_uso}</div>` : ""}
        </div>
        <div class="registro-acciones">
          <button class="btn btn-edit btn-xs" onclick="abrirModalNLO(${JSON.stringify(n).replace(/"/g, "&quot;")})">✏</button>
          <button class="btn btn-danger btn-xs" onclick="eliminarRegistro('/cultural/nombres_lenguas_originarias/${n.id}', cargarNLO.bind(null,${id}))">🗑</button>
        </div>
      </div>`,
      )
      .join("")}</div>`;
  } catch {
    $("lista-nlo").innerHTML = vacio("Error al cargar nombres");
  }
}

function abrirModalNLO(n = null) {
  idNLOEditando = n ? n.id : null;
  ["nombre", "transcripcion_fonetica", "lengua_id", "contexto_uso"].forEach(
    (f) => setVal(`nlo_${f}`, n ? n[f] : ""),
  );
  $("modal-nlo").classList.add("open");
}

async function guardarNLO() {
  const id = productorActual?.id;
  if (!id) return;
  const d = {
    productor_id: id,
    nombre: val("nlo_nombre"),
    transcripcion_fonetica: val("nlo_transcripcion_fonetica") || null,
    lengua_id: numVal("nlo_lengua_id"),
    contexto_uso: val("nlo_contexto_uso") || null,
  };
  if (!d.nombre) {
    toast("El nombre es obligatorio", "warn");
    return;
  }
  try {
    if (idNLOEditando)
      await PUT(`/cultural/nombres_lenguas_originarias/${idNLOEditando}/`, d);
    else await POST("/cultural/nombres_lenguas_originarias/", d);
    toast("Nombre guardado", "ok");
    cerrarModal("modal-nlo");
    cargarNLO(id);
  } catch (e) {
    toast("Error: " + e.message, "err");
  }
}

// ═══════════════════════════════════════════════════════
// MÓDULO SOCIAL Y CULTURAL INDEPENDIENTE
// ═══════════════════════════════════════════════════════

// Config de cada sección: endpoint, columnas, campos edit
const SC_CONFIG = {
  elcsa: {
    endpoint: "/social/seguridad_alimentaria/",
    cols: [
      "productor_id",
      "nivel_inseguridad",
      "elcsa_puntaje_total",
      "num_personas_hogar",
      "produce_suficiente_maiz",
    ],
    labels: [
      "Productor",
      "Nivel inseguridad",
      "Puntaje ELCSA",
      "Personas hogar",
      "Produce suficiente",
    ],
    modal: "modal-elcsa",
    guardar: "guardarElcsa",
  },
  climatica: {
    endpoint: "/social/vulnerabilidades_climaticas/",
    cols: [
      "productor_id",
      "se_siente_vulnerable",
      "anos_sembrando_maiz",
      "percibe_cambio_lluvia",
      "percibe_cambio_temperatura",
    ],
    labels: [
      "Productor",
      "¿Vulnerable?",
      "Años sembrando",
      "Cambio lluvia",
      "Cambio temp.",
    ],
    modal: "modal-climatica",
    guardar: "guardarClimatica",
  },
  red: {
    endpoint: "/social/redes_intercambio/",
    cols: [
      "productor_id",
      "frecuencia_intercambio_semilla",
      "organizacion_nombre",
      "recibio_capacitacion",
      "participa_ferias_semillas",
    ],
    labels: [
      "Productor",
      "Frecuencia",
      "Organización",
      "Capacitación",
      "Ferias semillas",
    ],
    modal: "modal-red",
    guardar: "guardarRed",
  },
  saberes: {
    endpoint: "/cultural/saberes_tradicionales/",
    cols: [
      "productor_id",
      "categoria",
      "descripcion",
      "aprendio_de",
      "esta_vigente",
    ],
    labels: ["Productor", "Categoría", "Descripción", "Aprendió de", "Vigente"],
    modal: "modal-saber",
    guardar: "guardarSaber",
  },
  rituales: {
    endpoint: "/cultural/rituales_agricolas/",
    cols: ["productor_id", "nombre", "tipo", "epoca_anio", "esta_vigente"],
    labels: ["Productor", "Nombre", "Tipo", "Época", "Vigente"],
    modal: "modal-ritual",
    guardar: "guardarRitual",
  },
  narrativas: {
    endpoint: "/cultural/narrativas_orales/",
    cols: ["productor_id", "tipo", "titulo", "vinculo_maiz", "esta_vigente"],
    labels: ["Productor", "Tipo", "Título", "Vínculo maíz", "Vigente"],
    modal: "modal-narrativa",
    guardar: "guardarNarrativa",
  },
  gastronomia: {
    endpoint: "/cultural/gastronomias_tradicionales/",
    cols: [
      "productor_id",
      "nombre_platillo",
      "tipo",
      "ocasion",
      "esta_vigente",
    ],
    labels: ["Productor", "Platillo", "Tipo", "Ocasión", "Vigente"],
    modal: "modal-gastronomia",
    guardar: "guardarGastronomia",
  },
  identidad: {
    endpoint: "/cultural/identidades_culturales/",
    cols: [
      "productor_id",
      "etnia_nombre",
      "habla_lengua_originaria",
      "nivel_dominio_lengua",
      "se_siente_guardian_semillas",
    ],
    labels: [
      "Productor",
      "Etnia",
      "Habla lengua",
      "Nivel dominio",
      "Guardián semillas",
    ],
    modal: "modal-identidad",
    guardar: "guardarIdentidad",
  },
  transmision: {
    endpoint: "/cultural/transmisiones_conocimiento/",
    cols: [
      "productor_id",
      "generacion_transmisora",
      "mecanismo_transmision",
      "nivel_riesgo_percibido",
      "transmite_a_hijos",
    ],
    labels: ["Productor", "Generación", "Mecanismo", "Nivel riesgo", "→ Hijos"],
    modal: "modal-transmision",
    guardar: "guardarTransmision",
  },
  nlo: {
    endpoint: "/cultural/nombres_lenguas_originarias/",
    cols: [
      "productor_id",
      "nombre",
      "transcripcion_fonetica",
      "lengua_id",
      "contexto_uso",
    ],
    labels: ["Productor", "Nombre", "Fonética", "Lengua ID", "Contexto"],
    modal: "modal-nlo",
    guardar: "guardarNLO",
  },
};

// Cache de datos por sección
const scDatos = {};

// Activar sub-panel
function activarSC(id, btn) {
  document
    .querySelectorAll(".sc-panel")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".subnav-btn")
    .forEach((b) => b.classList.remove("active"));
  $(id).classList.add("active");
  if (btn) btn.classList.add("active");
  const key = id.replace("sc-", "");
  if (!scDatos[key]) cargarSC(key);
}

// Cargar datos de una sección
async function cargarSC(key) {
  const cfg = SC_CONFIG[key];
  const tbl = $("tbl-" + key);
  const cnt = $("cnt-" + key);
  tbl.innerHTML =
    '<div class="estado-centro"><div class="spinner"></div></div>';
  try {
    const data = await GET(cfg.endpoint);
    scDatos[key] = Array.isArray(data)
      ? data
      : data.items || data.results || [];
    renderSC(key, scDatos[key]);
  } catch (e) {
    tbl.innerHTML = `<div class="estado-centro"><div class="estado-ico">⚠️</div><div class="estado-txt">${e.message}</div></div>`;
    if (cnt) cnt.textContent = "Error";
  }
}

// Filtrar en tiempo real
function filtrarSC(key) {
  const q = $("q-" + key)?.value.toLowerCase() || "";
  const datos = scDatos[key] || [];
  if (!q) {
    renderSC(key, datos);
    return;
  }
  renderSC(
    key,
    datos.filter((r) =>
      Object.values(r).some((v) =>
        String(v ?? "")
          .toLowerCase()
          .includes(q),
      ),
    ),
  );
}

// Renderizar tabla genérica
function renderSC(key, datos) {
  const cfg = SC_CONFIG[key];
  const tbl = $("tbl-" + key);
  const cnt = $("cnt-" + key);
  if (cnt)
    cnt.textContent =
      datos.length + " registro" + (datos.length !== 1 ? "s" : "");

  if (!datos.length) {
    tbl.innerHTML =
      '<div class="estado-centro"><div class="estado-ico">🌽</div><div class="estado-txt">Sin registros</div></div>';
    return;
  }

  const thead =
    "<thead><tr><th>#</th>" +
    cfg.labels.map((l) => `<th>${l}</th>`).join("") +
    "<th>Acciones</th></tr></thead>";

  const tbody = datos
    .map((r) => {
      const celdas = cfg.cols
        .map((col) => {
          const v = r[col];
          if (v === null || v === undefined)
            return '<td><span style="opacity:.3">—</span></td>';
          if (typeof v === "boolean")
            return `<td>${v ? '<span class="badge badge-verde">✓</span>' : '<span class="badge badge-gris">✗</span>'}</td>`;
          const txt =
            String(v).length > 35 ? String(v).slice(0, 35) + "…" : String(v);
          // Destacar productor_id como enlace
          if (col === "productor_id")
            return `<td><span class="badge badge-maiz" style="cursor:pointer" onclick="verPerfil(${v})" title="Ver perfil">👤 ${v}</span></td>`;
          return `<td>${txt}</td>`;
        })
        .join("");

      return `<tr>
      <td>${r.id || "—"}</td>
      ${celdas}
      <td><div class="td-acciones">
        <button class="btn btn-edit btn-xs" onclick="editarSC('${key}',${JSON.stringify(r).replace(/"/g, "&quot;")})">✏</button>
        <button class="btn btn-danger btn-xs" onclick="eliminarSC('${key}',${r.id})">🗑</button>
      </div></td>
    </tr>`;
    })
    .join("");

  tbl.innerHTML = `<table>${thead}<tbody>${tbody}</tbody></table>`;
}

// Abrir modal para nuevo registro (sin productor preseleccionado)
function abrirSCModal(key) {
  // Limpiar productor actual para modo independiente
  const prevProductor = productorActual;
  productorActual = null;
  const cfg = SC_CONFIG[key];

  // Mostrar selector de productor si no hay uno activo
  const modal = $(cfg.modal);
  if (!modal) {
    toast("Modal no disponible", "warn");
    productorActual = prevProductor;
    return;
  }

  // Inyectar campo productor_id si no existe en el modal
  let body = modal.querySelector(".modal-body");
  if (!body.querySelector("#sc-productor-id-wrap")) {
    const wrap = document.createElement("div");
    wrap.id = "sc-productor-id-wrap";
    wrap.className = "form-group";
    wrap.innerHTML =
      '<label>ID del Productor *</label><input id="sc-productor-id" type="number" placeholder="ID del productor">';
    body.insertBefore(wrap, body.firstChild);
  }
  $("sc-productor-id-wrap").style.display = "block";

  modal.classList.add("open");
  modal._scKey = key;
  modal._scPrevProductor = prevProductor;
}

// Editar registro existente
function editarSC(key, registro) {
  const cfg = SC_CONFIG[key];
  // Simular productor actual para que el guardar funcione
  productorActual = { id: registro.productor_id };

  const modal = $(cfg.modal);
  if (!modal) {
    toast("Modal no disponible", "warn");
    return;
  }

  // Ocultar campo productor_id si existe (ya está en el registro)
  const wrap = modal.querySelector("#sc-productor-id-wrap");
  if (wrap) wrap.style.display = "none";

  // Mapear función de apertura según el tipo
  const fns = {
    elcsa: () => abrirModalElcsa(registro),
    climatica: () => abrirModalClimatica(registro),
    red: () => abrirModalRed(registro),
    saberes: () => abrirModalSaber(registro),
    rituales: () => abrirModalRitual(registro),
    narrativas: () => abrirModalNarrativa(registro),
    gastronomia: () => abrirModalGastronomia(registro),
    identidad: () => abrirModalIdentidad(registro),
    transmision: () => abrirModalTransmision(registro),
    nlo: () => abrirModalNLO(registro),
  };
  if (fns[key]) fns[key]();

  modal._scKey = key;
  modal._scEditing = true;
}

// Eliminar registro de SC independiente
function eliminarSC(key, id) {
  const cfg = SC_CONFIG[key];
  const ruta = cfg.endpoint.endsWith("/")
    ? cfg.endpoint + id
    : cfg.endpoint + "/" + id;
  confirmar("¿Eliminar este registro?", async () => {
    try {
      await DEL(ruta);
      toast("Eliminado", "ok");
      delete scDatos[key];
      cargarSC(key);
    } catch (e) {
      toast("Error: " + e.message, "err");
    }
  });
}

// Hook: interceptar guardados para refrescar SC si estamos en vista independiente
function refrescarSCActual() {
  const vistaActiva = document.querySelector(".vista.activa")?.id;
  if (vistaActiva === "vista-social-cultural") {
    const panelActivo = document.querySelector(".sc-panel.active")?.id;
    if (panelActivo) {
      const key = panelActivo.replace("sc-", "");
      delete scDatos[key];
      setTimeout(() => cargarSC(key), 300);
    }
  }
}

// Parchear guardar para leer productor desde campo sc-productor-id si no hay productorActual
const _guardarElcsaOrig = guardarElcsa;
async function guardarElcsa() {
  if (!productorActual?.id) {
    const pid = numVal("sc-productor-id");
    if (!pid) {
      toast("Ingresa el ID del productor", "warn");
      return;
    }
    productorActual = { id: pid };
  }
  await _guardarElcsaOrig();
  refrescarSCActual();
}

const _guardarClimaticaOrig = guardarClimatica;
async function guardarClimatica() {
  if (!productorActual?.id) {
    const pid = numVal("sc-productor-id");
    if (!pid) {
      toast("Ingresa el ID del productor", "warn");
      return;
    }
    productorActual = { id: pid };
  }
  await _guardarClimaticaOrig();
  refrescarSCActual();
}

const _guardarRedOrig = guardarRed;
async function guardarRed() {
  if (!productorActual?.id) {
    const pid = numVal("sc-productor-id");
    if (!pid) {
      toast("Ingresa el ID del productor", "warn");
      return;
    }
    productorActual = { id: pid };
  }
  await _guardarRedOrig();
  refrescarSCActual();
}

const _guardarSaberOrig = guardarSaber;
async function guardarSaber() {
  if (!productorActual?.id) {
    const pid = numVal("sc-productor-id");
    if (!pid) {
      toast("Ingresa el ID del productor", "warn");
      return;
    }
    productorActual = { id: pid };
  }
  await _guardarSaberOrig();
  refrescarSCActual();
}

const _guardarRitualOrig = guardarRitual;
async function guardarRitual() {
  if (!productorActual?.id) {
    const pid = numVal("sc-productor-id");
    if (!pid) {
      toast("Ingresa el ID del productor", "warn");
      return;
    }
    productorActual = { id: pid };
  }
  await _guardarRitualOrig();
  refrescarSCActual();
}

const _guardarNarrativaOrig = guardarNarrativa;
async function guardarNarrativa() {
  if (!productorActual?.id) {
    const pid = numVal("sc-productor-id");
    if (!pid) {
      toast("Ingresa el ID del productor", "warn");
      return;
    }
    productorActual = { id: pid };
  }
  await _guardarNarrativaOrig();
  refrescarSCActual();
}

const _guardarGastronomiaOrig = guardarGastronomia;
async function guardarGastronomia() {
  if (!productorActual?.id) {
    const pid = numVal("sc-productor-id");
    if (!pid) {
      toast("Ingresa el ID del productor", "warn");
      return;
    }
    productorActual = { id: pid };
  }
  await _guardarGastronomiaOrig();
  refrescarSCActual();
}

const _guardarIdentidadOrig = guardarIdentidad;
async function guardarIdentidad() {
  if (!productorActual?.id) {
    const pid = numVal("sc-productor-id");
    if (!pid) {
      toast("Ingresa el ID del productor", "warn");
      return;
    }
    productorActual = { id: pid };
  }
  await _guardarIdentidadOrig();
  refrescarSCActual();
}

const _guardarTransmisionOrig = guardarTransmision;
async function guardarTransmision() {
  if (!productorActual?.id) {
    const pid = numVal("sc-productor-id");
    if (!pid) {
      toast("Ingresa el ID del productor", "warn");
      return;
    }
    productorActual = { id: pid };
  }
  await _guardarTransmisionOrig();
  refrescarSCActual();
}

const _guardarNLOOrig = guardarNLO;
async function guardarNLO() {
  if (!productorActual?.id) {
    const pid = numVal("sc-productor-id");
    if (!pid) {
      toast("Ingresa el ID del productor", "warn");
      return;
    }
    productorActual = { id: pid };
  }
  await _guardarNLOOrig();
  refrescarSCActual();
}

// Actualizar mostrarVista para cargar SC al entrar
const _mostrarVistaOrig = mostrarVista;
function mostrarVista(v) {
  document
    .querySelectorAll(".vista")
    .forEach((el) => el.classList.remove("activa"));
  $("vista-" + v).classList.add("activa");
  document
    .querySelectorAll(".nav-btn")
    .forEach((b) => b.classList.remove("active"));
  // Activar botón correspondiente
  document.querySelectorAll(".nav-btn").forEach((b) => {
    if (
      (v === "lista" && b.textContent.includes("Productores")) ||
      (v === "social-cultural" && b.textContent.includes("Social"))
    ) {
      b.classList.add("active");
    }
  });
  // Cargar primer panel SC si no hay datos
  if (v === "social-cultural" && !scDatos["elcsa"]) {
    cargarSC("elcsa");
  }
}

// ── INIT ─────────────────────────────────────────────────
cargarProductores();
