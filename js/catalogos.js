// ═══════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════
// Cambia el puerto si tu backend expone otro diferente a 8000
const API_CATALOGO = "http://localhost:8080/api";

// ── DEFINICIÓN DE CATÁLOGOS ──────────────────────────
// campos: array de { key, label, type, required, opciones[] }
// type: text | number | textarea | select | boolean
const CATALOGO = {
  raza_maiz: {
    nombre: "Razas del maíz",
    campos: [
      { key: "nombre", label: "Nombre", type: "text", required: true },
      { key: "descripcion", label: "Descripción", type: "textarea" },
      { key: "region_origen", label: "Región de origen", type: "text" },
      { key: "tipo_ciclo", label: "Tipo de ciclo", type: "text" },
      { key: "es_nativa", label: "¿Es nativa?", type: "boolean" },
      { key: "created_at", label: "Creado el", type: "text" },
      { key: "updated_at", label: "Actualizado el", type: "text" },
    ],
  },
  color_grano: {
    nombre: "Colores de grano",
    campos: [
      { key: "nombre", label: "Nombre", type: "text", required: true },
      { key: "descripcion", label: "Descripción", type: "textarea" },
      { key: "es_nativo", label: "¿Es nativo?", type: "boolean" },
      { key: "created_at", label: "Creado el", type: "text" },
      { key: "updated_at", label: "Actualizado el", type: "text" },
    ],
  },
  estado_conservacion: {
    nombre: "Estado de conservación",
    campos: [
      { key: "nombre", label: "Nombre", type: "text", required: true },
      { key: "descripcion", label: "Descripción", type: "textarea" },
      { key: "nivel_riesgo", label: "Nivel de riesgo", type: "number" },
      // { key: 'id', label: 'ID', type: 'number' },
      { key: "created_at", label: "Creado el", type: "text" },
      { key: "updated_at", label: "Actualizado el", type: "text" },
    ],
  },
  uso_maiz: {
    nombre: "Uso del maíz",
    campos: [
      { key: "nombre", label: "Nombre", type: "text", required: true },
      { key: "descripcion", label: "Descripción", type: "textarea" },
      // { key: 'id', label: 'ID', type: 'number' },
    ],
  },
  clase_uso_suelo: {
    nombre: "Clases de uso de suelo",
    campos: [
      { key: "codigo", label: "Código", type: "text", required: true },
      { key: "nombre", label: "Nombre", type: "text", required: true },
      { key: "categoria_general", label: "Categoría general", type: "text" },
      { key: "descripcion", label: "Descripción", type: "textarea" },
      { key: "relevante_maiz", label: "Relevante para maíz", type: "boolean" },
      { key: "activo", label: "Activo", type: "boolean" },
      // { key: 'id', label: 'ID', type: 'number' },
      { key: "created_at", label: "Creado el", type: "text" },
      { key: "updated_at", label: "Actualizado el", type: "text" },
    ],
  },
  tipo_evento_climatico: {
    nombre: "Tipos de evento climático",
    campos: [
      { key: "nombre", label: "Nombre", type: "text", required: true },
      { key: "severidad_base", label: "Severidad base", type: "number" },
      { key: "descripcion", label: "Descripción", type: "textarea" },
      // { key: 'id', label: 'ID', type: 'number' },
      { key: "created_at", label: "Creado el", type: "text" },
      { key: "updated_at", label: "Actualizado el", type: "text" },
    ],
  },
  variable_ambiental: {
    nombre: "Variables ambientales",
    campos: [
      { key: "nombre", label: "Nombre", type: "text", required: true },
      { key: "unidad", label: "Unidad", type: "text" },
      { key: "valor_min", label: "Valor mínimo", type: "number" },
      { key: "valor_max", label: "Valor máximo", type: "number" },
      // { key: 'id', label: 'ID', type: 'number' },
      { key: "created_at", label: "Creado el", type: "text" },
      { key: "updated_at", label: "Actualizado el", type: "text" },
    ],
  },
  tipo_productor: {
    nombre: "Tipos de productor",
    campos: [
      { key: "nombre", label: "Nombre", type: "text", required: true },
      { key: "descripcion", label: "Descripción", type: "textarea" },
      // { key: 'id', label: 'ID', type: 'number' },
    ],
  },
  tipo_practica: {
    nombre: "Tipos de práctica",
    campos: [
      { key: "nombre", label: "Nombre", type: "text", required: true },
      { key: "descripcion", label: "Descripción", type: "textarea" },
    ],
  },
  practica_agricola: {
    nombre: "Prácticas agrícolas",
    campos: [
      { key: "nombre", label: "Nombre", type: "text", required: true },
      { key: "descripcion", label: "Descripción", type: "textarea" },
      // { key: 'id', label: 'ID', type: 'number' },
      { key: "created_at", label: "Creado el", type: "text" },
      { key: "updated_at", label: "Actualizado el", type: "text" },
    ],
  },
  sistema_manejo: {
    nombre: "Sistemas de manejo",
    campos: [
      { key: "nombre", label: "Nombre", type: "text", required: true },
      { key: "descripcion", label: "Descripción", type: "textarea" },
      { key: "es_tradicional", label: "Es tradicional", type: "boolean" },
      { key: "created_at", label: "Creado el", type: "text" },
      { key: "updated_at", label: "Actualizado el", type: "text" },
    ],
  },
  lengua: {
    nombre: "Lenguas",
    campos: [
      { key: "nombre", label: "Nombre", type: "text", required: true },
      {
        key: "nombre_original",
        label: "Nombre en lengua original",
        type: "text",
      },
      {
        key: "familia_linguistica",
        label: "Familia lingüística",
        type: "text",
      },
      { key: "variante", label: "Variante", type: "text" },
      { key: "clave_inali", label: "Clave INALI", type: "text" },
      // { key: 'id', label: 'ID', type: 'number' },
      { key: "created_at", label: "Creado el", type: "text" },
      { key: "updated_at", label: "Actualizado el", type: "text" },
    ],
  },
  pueblo_originario: {
    nombre: "Pueblos originarios",
    campos: [
      { key: "nombre", label: "Nombre", type: "text", required: true },
      { key: "nombre_propio", label: "Nombre propio (autónimo)", type: "text" },
      { key: "lengua_id", label: "ID Lengua", type: "number" },
      { key: "region_historica", label: "Región histórica", type: "text" },
      {
        key: "municipios_presencia",
        label: "Municipios con presencia",
        type: "textarea",
      },
      // { key: 'id', label: 'ID', type: 'number' },
      { key: "created_at", label: "Creado el", type: "text" },
      { key: "updated_at", label: "Actualizado el", type: "text" },
    ],
  },
  origen_muestra: {
    nombre: "Origen de muestra",
    campos: [
      { key: "nombre", label: "Nombre", type: "text", required: true },
      { key: "descripcion", label: "Descripción", type: "textarea" },
      // { key: 'id', label: 'ID', type: 'number' },
      { key: "created_at", label: "Creado el", type: "text" },
      { key: "updated_at", label: "Actualizado el", type: "text" },
    ],
  },
  estado: {
    nombre: "Estados",
    campos: [
      {
        key: "clave_inegi",
        label: "Clave INEGI",
        type: "text",
        required: true,
      },
      { key: "nombre", label: "Nombre", type: "text", required: true },
      { key: "abreviatura", label: "Abreviatura", type: "text" },
      // { key: 'id', label: 'ID', type: 'number' },
      { key: "created_at", label: "Creado el", type: "text" },
      { key: "updated_at", label: "Actualizado el", type: "text" },
    ],
  },
  municipio: {
    nombre: "Municipios",
    campos: [
      {
        key: "clave_inegi",
        label: "Clave INEGI",
        type: "text",
        required: true,
      },
      {
        key: "clave_completa",
        label: "Clave completa",
        type: "text",
        required: true,
      },
      { key: "nombre", label: "Nombre", type: "text", required: true },
      { key: "nombre_corto", label: "Nombre corto", type: "text" },
      { key: "cabecera", label: "Cabecera municipal", type: "text" },
      { key: "region", label: "Región", type: "text" },
      { key: "estado_id", label: "ID Estado", type: "number" },
      { key: "latitud_centroide", label: "Latitud centroide", type: "number" },
      {
        key: "longitud_centroide",
        label: "Longitud centroide",
        type: "number",
      },
      { key: "superficie_km2", label: "Superficie (km²)", type: "number" },
      // { key: 'id', label: 'ID', type: 'number' },
      { key: "created_at", label: "Creado el", type: "text" },
      { key: "updated_at", label: "Actualizado el", type: "text" },
    ],
  },
  comunidad: {
    nombre: "Comunidades",
    campos: [
      { key: "nombre", label: "Nombre", type: "text", required: true },
      {
        key: "nombre_lengua_orig",
        label: "Nombre en lengua originaria",
        type: "text",
      },
      { key: "tipo", label: "Tipo", type: "text" },
      { key: "municipio_id", label: "ID Municipio", type: "number" },
      { key: "poblacion_total", label: "Población total", type: "number" },
      {
        key: "num_localidades",
        label: "Número de localidades",
        type: "number",
      },
      { key: "fuente", label: "Fuente", type: "text" },
      { key: "id", label: "ID", type: "number" },
      { key: "created_at", label: "Creado el", type: "text" },
      { key: "updated_at", label: "Actualizado el", type: "text" },
    ],
  },
  localidad: {
    nombre: "Localidades",
    campos: [
      { key: "clave_inegi", label: "Clave INEGI", type: "text" },
      { key: "nombre", label: "Nombre", type: "text", required: true },
      {
        key: "nombre_lengua_orig",
        label: "Nombre en lengua originaria",
        type: "text",
      },
      { key: "tipo", label: "Tipo", type: "text" },
      { key: "categoria", label: "Categoría", type: "text" },
      { key: "poblacion_total", label: "Población total", type: "number" },
      { key: "num_viviendas", label: "Número de viviendas", type: "number" },
      { key: "grado_marginacion", label: "Grado de marginación", type: "text" },
      { key: "indigena", label: "¿Indígena?", type: "boolean" },
      { key: "latitud", label: "Latitud", type: "number" },
      { key: "longitud", label: "Longitud", type: "number" },
      { key: "altitud_m", label: "Altitud (m)", type: "number" },
      { key: "municipio_id", label: "ID Municipio", type: "number" },
      { key: "comunidad_id", label: "ID Comunidad", type: "number" },
      { key: "fuente", label: "Fuente", type: "text" },
      { key: "id", label: "ID", type: "number" },
      { key: "created_at", label: "Creado el", type: "text" },
      { key: "updated_at", label: "Actualizado el", type: "text" },
    ],
  },
  colonia: {
    nombre: "Colonias",
    campos: [
      { key: "nombre", label: "Nombre", type: "text", required: true },
      { key: "tipo", label: "Tipo", type: "text" },
      { key: "codigo_postal", label: "Código postal", type: "text" },
      { key: "latitud", label: "Latitud", type: "number" },
      { key: "longitud", label: "Longitud", type: "number" },
      { key: "localidad_id", label: "ID Localidad", type: "number" },
      { key: "id", label: "ID", type: "number" },
      { key: "created_at", label: "Creado el", type: "text" },
      { key: "updated_at", label: "Actualizado el", type: "text" },
    ],
  },
};

// ═══════════════════════════════════════════════════════
// ESTADO
// ═══════════════════════════════════════════════════════
let catActual = "raza_maiz";
let datosActuales = [];
let modoModal = "nuevo"; // 'nuevo' | 'editar'
let idEditando = null;

// ═══════════════════════════════════════════════════════
// API
// ═══════════════════════════════════════════════════════
async function apiFetch(path, opciones = {}) {
  const url = `${API_CATALOGO}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...opciones.headers },
    ...opciones,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `Error ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}


const getPrefix = (cat) => "catalogo";
const listar = (cat) => apiFetch(`/${getPrefix(cat)}/${cat}`);
const obtener = (cat, id) => apiFetch(`/${getPrefix(cat)}/${cat}/${id}`);
const crear = (cat, d) =>
  apiFetch(`/${getPrefix(cat)}/${cat}`, {
    method: "POST",
    body: JSON.stringify(d),
  });
const actualizar = (cat, id, d) =>
  apiFetch(`/${getPrefix(cat)}/${cat}/${id}`, {
    method: "PUT",
    body: JSON.stringify(d),
  });
const eliminar = (cat, id) =>
  apiFetch(`/${getPrefix(cat)}/${cat}/${id}`, { method: "DELETE" });

// ═══════════════════════════════════════════════════════
// CARGAR CATÁLOGO
// ═══════════════════════════════════════════════════════
async function cargarCatalogo(cat) {
  catActual = cat;
  const def = CATALOGO[cat];

  // Actualizar sidebar
  document.querySelectorAll(".sidebar-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.cat === cat);
  });

  // Actualizar topbar
  document.getElementById("cat-titulo").textContent = def.nombre;
  document.getElementById("cat-endpoint").textContent = `/catalogo/${cat}/`;
  document.getElementById("buscador").value = "";

  mostrarCargando();

  try {
    const datos = await listar(cat);
    datosActuales = Array.isArray(datos)
      ? datos
      : datos.items || datos.results || [];
    renderTabla(datosActuales);
  } catch (e) {
    mostrarError(e.message);
  }
}

function recargar() {
  cargarCatalogo(catActual);
}

// ═══════════════════════════════════════════════════════
// RENDERIZAR TABLA
// ═══════════════════════════════════════════════════════
function renderTabla(datos) {
  const def = CATALOGO[catActual];
  document.getElementById("table-count").textContent =
    `${datos.length} registro${datos.length !== 1 ? "s" : ""}`;

  if (!datos.length) {
    document.getElementById("tabla-contenido").innerHTML = `
      <div class="estado-centro">
        <div class="estado-ico">🌽</div>
        <div class="estado-txt">Sin registros</div>
        <div class="estado-sub">Este catálogo está vacío. ¡Agrega el primero!</div>
      </div>`;
    return;
  }

  // Columnas visibles (máx 4 + id + acciones)
  const camposVis = def.campos.slice(0, 4);

  // Si es comunidad, obtener el mapeo de municipios
  let municipioMap = {};
  if (catActual === "comunidad") {
    // Obtener municipios y mapear id -> nombre
    // NOTA: Esto es asíncrono, pero para la tabla rápida usamos cache si ya se cargó antes
    if (!window._municipiosCache) {
      listar("municipio").then((muns) => {
        window._municipiosCache = {};
        muns.forEach(
          (m) =>
            (window._municipiosCache[m.id] =
              m.nombre + (m.nombre_corto ? " (" + m.nombre_corto + ")" : "")),
        );
        renderTabla(datos); // Recargar tabla con nombres
      });
    }
    municipioMap = window._municipiosCache || {};
  }

  const thead = `<thead><tr>
    <th>#</th>
    ${camposVis.map((c) => `<th>${c.label}</th>`).join("")}
    <th>Acciones</th>
  </tr></thead>`;

  const filas = datos
    .map((row) => {
      const celdas = camposVis
        .map((c) => {
          // Si es comunidad y el campo es municipio_id, mostrar el nombre
          if (catActual === "comunidad" && c.key === "municipio_id") {
            const nombreMun = municipioMap[row[c.key]] || row[c.key] || "—";
            return `<td>${nombreMun}</td>`;
          }
          const val = row[c.key];
          if (val === undefined || val === null)
            return `<td><span style="opacity:0.35">—</span></td>`;
          if (c.type === "boolean") {
            return `<td>${val ? '<span class="badge badge-verde">✓ Sí</span>' : '<span class="badge badge-tierra">✗ No</span>'}</td>`;
          }
          const txt =
            String(val).length > 40
              ? String(val).slice(0, 40) + "…"
              : String(val);
          return `<td>${txt}</td>`;
        })
        .join("");

      // Fila clickeable para mostrar detalle
      return `<tr class="fila-detalle" onclick="mostrarDetalleRegistro(${row.id})">
      <td>${row.id || "—"}</td>
      ${celdas}
      <td><div class="td-acciones" onclick="event.stopPropagation();">
        <button class="btn btn-edit btn-sm" onclick="abrirModalEditar(${row.id}); event.stopPropagation();">✏ Editar</button>
        <button class="btn btn-danger btn-sm" onclick="confirmarEliminar(${row.id}, '${String(row.nombre || row.id).replace(/'/g, "\\'")}); event.stopPropagation();">🗑</button>
      </div></td>
    </tr>`;
    })
    .join("");
  // ═══════════════════════════════════════════════════════
  // MODAL DETALLE
  // ═══════════════════════════════════════════════════════
  function mostrarDetalleRegistro(id) {
    const registro = datosActuales.find((r) => r.id === id);
    if (!registro) return;
    const def = CATALOGO[catActual];
    let html = `<div class="detalle-titulo">${def.nombre} - Detalle</div><div class="detalle-campos">`;
    def.campos
      .filter((c) => c.key !== "id")
      .forEach((c) => {
        let val = registro[c.key];
        if (val === undefined || val === null) val = "";
        if (c.type === "boolean") val = val ? "Sí" : "No";
        html += `<div class="detalle-campo"><span class="detalle-label">${c.label}:</span> <span class="detalle-valor">${val}</span></div>`;
      });
    html += "</div>";
    document.getElementById("modal-titulo").textContent =
      `Detalle · ${def.nombre}`;
    document.getElementById("modal-body").innerHTML = html;
    document.getElementById("btn-guardar").style.display = "none";
    document.getElementById("modal-overlay").classList.add("open");
  }

  // Hacer accesible la función para el HTML
  window.mostrarDetalleRegistro = mostrarDetalleRegistro;

  // Al cerrar el modal, volver a mostrar el botón guardar si corresponde
  const modalOverlay = document.getElementById("modal-overlay");
  if (modalOverlay) {
    modalOverlay.addEventListener("click", function (e) {
      if (e.target === modalOverlay) {
        document.getElementById("btn-guardar").style.display = "";
      }
    });
  }

  document.getElementById("tabla-contenido").innerHTML =
    `<table>${thead}<tbody>${filas}</tbody></table>`;
}

// ═══════════════════════════════════════════════════════
// FILTRAR
// ═══════════════════════════════════════════════════════
function filtrarTabla() {
  const q = document.getElementById("buscador").value.toLowerCase();
  if (!q) {
    renderTabla(datosActuales);
    return;
  }
  const filtrados = datosActuales.filter((row) =>
    Object.values(row).some((v) => String(v).toLowerCase().includes(q)),
  );
  renderTabla(filtrados);
}

// ═══════════════════════════════════════════════════════
// ESTADOS VISUALES
// ═══════════════════════════════════════════════════════
function mostrarCargando() {
  document.getElementById("table-count").textContent = "— registros";
  document.getElementById("tabla-contenido").innerHTML = `
    <div class="estado-centro">
      <div class="spinner"></div>
      <div class="estado-txt">Cargando...</div>
    </div>`;
}

function mostrarError(msg) {
  document.getElementById("tabla-contenido").innerHTML = `
    <div class="estado-centro">
      <div class="estado-ico">⚠️</div>
      <div class="estado-txt">Error al cargar</div>
      <div class="estado-sub">${msg}</div>
    </div>`;
  toast(msg, "err");
}

// ═══════════════════════════════════════════════════════
// MODAL CRUD
// ═══════════════════════════════════════════════════════
function construirFormulario(datos = {}) {
  const def = CATALOGO[catActual];
  return def.campos
    .filter(
      (c) =>
        c.key !== "id" &&
        c.key !== "created_at" &&
        c.key !== "updated_at" &&
        !(
          catActual === "comunidad" &&
          (c.key === "fuente" ||
            c.key === "poblacion_total" ||
            c.key === "num_localidades")
        ),
    )
    .map((c) => {
      const val = datos[c.key] !== undefined ? datos[c.key] : "";
      const req = c.required ? "required" : "";

      // Select dinámico para municipio_id en comunidad
      if (catActual === "comunidad" && c.key === "municipio_id") {
        return `<div class="form-group">
          <label for="f_municipio_id">${c.label}${c.required ? " *" : ""}</label>
          <select id="f_municipio_id" name="municipio_id" ${req}></select>
        </div>`;
      }

      // Select fijo para tipo en comunidad
      if (catActual === "comunidad" && c.key === "tipo") {
        const opciones = [
          "indigena",
          "campesina",
          "ejidal",
          "mestiza",
          "mixta",
          "urbana",
          "rancheria",
          "otro",
        ];
        return `<div class="form-group">
          <label for="f_tipo">${c.label}${c.required ? " *" : ""}</label>
          <select id="f_tipo" name="tipo" ${req}>
            <option value="">— Seleccionar —</option>
            ${opciones.map((o) => `<option value="${o}" ${val === o ? "selected" : ""}>${o.charAt(0).toUpperCase() + o.slice(1)}</option>`).join("")}
          </select>
        </div>`;
      }

      // Otros selects dinámicos según catálogo y campo
      // Ejemplo: si en otro catálogo se requiere un select de otro catálogo, agregar aquí

      if (c.type === "textarea")
        return `
        <div class="form-group">
          <label for="f_${c.key}">${c.label}${c.required ? " *" : ""}</label>
          <textarea id="f_${c.key}" name="${c.key}" ${req}>${val}</textarea>
        </div>`;

      if (c.type === "select")
        return `
        <div class="form-group">
          <label for="f_${c.key}">${c.label}${c.required ? " *" : ""}</label>
          <select id="f_${c.key}" name="${c.key}" ${req}>
            <option value="">— Seleccionar —</option>
            ${c.opciones.map((o) => `<option value="${o}" ${val === o ? "selected" : ""}>${o}</option>`).join("")}
          </select>
        </div>`;

      if (c.type === "boolean")
        return `
        <div class="form-group">
          <label for="f_${c.key}">${c.label}</label>
          <select id="f_${c.key}" name="${c.key}">
            <option value="true"  ${val === true || val === "true" ? "selected" : ""}>Sí</option>
            <option value="false" ${val === false || val === "false" ? "selected" : ""}>No</option>
          </select>
        </div>`;

      return `
        <div class="form-group">
          <label for="f_${c.key}">${c.label}${c.required ? " *" : ""}</label>
          <input type="${c.type === "number" ? "number" : "text"}"
                 id="f_${c.key}" name="${c.key}"
                 value="${val}" ${req}
                 step="${c.type === "number" ? "any" : ""}" />
        </div>`;
    })
    .join("");
}

function abrirModalNuevo() {
  modoModal = "nuevo";
  idEditando = null;
  document.getElementById("modal-titulo").textContent =
    `Agregar · ${CATALOGO[catActual].nombre}`;
  document.getElementById("modal-body").innerHTML = construirFormulario();

  // Si es comunidad, poblar el select de municipios
  if (catActual === "comunidad") {
    const select = document.getElementById("f_municipio_id");
    if (select) {
      select.innerHTML = '<option value="">— Seleccionar —</option>';
      listar("municipio")
        .then((municipios) => {
          municipios.forEach((m) => {
            const opt = document.createElement("option");
            opt.value = m.id;
            opt.textContent =
              m.nombre + (m.nombre_corto ? " (" + m.nombre_corto + ")" : "");
            select.appendChild(opt);
          });
        })
        .catch(() => {
          const opt = document.createElement("option");
          opt.value = "";
          opt.textContent = "Error al cargar municipios";
          select.appendChild(opt);
        });
    }
  }
  document.getElementById("btn-guardar").textContent = "Guardar";
  document.getElementById("modal-overlay").classList.add("open");
}

async function abrirModalEditar(id) {
  modoModal = "editar";
  idEditando = id;
  document.getElementById("modal-titulo").textContent =
    `Editar · ${CATALOGO[catActual].nombre}`;
  document.getElementById("modal-body").innerHTML = `
    <div class="estado-centro" style="padding:24px">
      <div class="spinner"></div>
    </div>`;
  document.getElementById("btn-guardar").textContent = "Guardar cambios";
  document.getElementById("modal-overlay").classList.add("open");

  try {
    const datos = await obtener(catActual, id);
    document.getElementById("modal-body").innerHTML =
      construirFormulario(datos);
  } catch (e) {
    toast("No se pudo cargar el registro: " + e.message, "err");
    cerrarModal();
  }
}

function cerrarModal() {
  document.getElementById("modal-overlay").classList.remove("open");
}

function cerrarModalSiOverlay(e) {
  if (e.target === document.getElementById("modal-overlay")) cerrarModal();
}

async function guardar() {
  const def = CATALOGO[catActual];
  const payload = {};

  for (const c of def.campos) {
    // Si es comunidad y el campo es poblacion_total o num_localidades, asignar valor predeterminado
    if (
      catActual === "comunidad" &&
      (c.key === "poblacion_total" || c.key === "num_localidades")
    ) {
      payload[c.key] = 0;
      continue;
    }
    const el = document.getElementById(`f_${c.key}`);
    if (!el) continue;
    let val = el.value.trim();

    if (c.required && !val) {
      toast(`El campo "${c.label}" es obligatorio`, "warn");
      el.focus();
      return;
    }

    if (val === "") {
      payload[c.key] = null;
      continue;
    }

    if (c.type === "number") payload[c.key] = isNaN(val) ? null : Number(val);
    else if (c.type === "boolean") payload[c.key] = val === "true";
    else payload[c.key] = val;
  }

  const btn = document.getElementById("btn-guardar");
  btn.disabled = true;
  btn.textContent = "Guardando…";

  try {
    if (modoModal === "nuevo") {
      await crear(catActual, payload);
      toast("Registro creado correctamente", "ok");
    } else {
      await actualizar(catActual, idEditando, payload);
      toast("Registro actualizado correctamente", "ok");
    }
    cerrarModal();
    cargarCatalogo(catActual);
  } catch (e) {
    toast("Error: " + e.message, "err");
  } finally {
    btn.disabled = false;
    btn.textContent = modoModal === "nuevo" ? "Guardar" : "Guardar cambios";
  }
}

// ═══════════════════════════════════════════════════════
// ELIMINAR
// ═══════════════════════════════════════════════════════
function confirmarEliminar(id, nombre) {
  document.getElementById("confirm-msg").textContent =
    `¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`;
  document.getElementById("confirm-overlay").classList.add("open");
  document.getElementById("btn-confirmar-eliminar").onclick = async () => {
    cerrarConfirm();
    try {
      await eliminar(catActual, id);
      toast("Registro eliminado", "ok");
      cargarCatalogo(catActual);
    } catch (e) {
      toast("Error al eliminar: " + e.message, "err");
    }
  };
}

function cerrarConfirm() {
  document.getElementById("confirm-overlay").classList.remove("open");
}

function cerrarConfirmSiOverlay(e) {
  if (e.target === document.getElementById("confirm-overlay")) cerrarConfirm();
}

// ═══════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════
function toast(msg, tipo = "ok") {
  const wrap = document.getElementById("toast-wrap");
  const el = document.createElement("div");
  el.className = `toast toast-${tipo}`;
  el.innerHTML = `<span>${tipo === "ok" ? "✓" : tipo === "err" ? "✗" : "⚠"}</span> ${msg}`;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ═══════════════════════════════════════════════════════
// TECLADO
// ═══════════════════════════════════════════════════════
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    cerrarModal();
    cerrarConfirm();
  }
});

// ═══════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════

document.getElementById("api-url-display").textContent = API_CATALOGO;
cargarCatalogo("raza_maiz");

// Poblar el select de comunidades al abrir el modal de productor
window.abrirModalProductor = async function () {
  console.log("abrirModalProductor ejecutada");
  // Lógica previa si existe
  const modal = document.getElementById("modal-productor");
  if (modal) modal.classList.add("open");
  setTimeout(async () => {
    alert("Intentando buscar el select de comunidad...");
    const select = document.getElementById("p_comunidad_id");
    console.log("Select encontrado:", select);
    if (select) {
      select.innerHTML = '<option value="">— Seleccionar —</option>';
      try {
        const comunidades = await listar("comunidad");
        alert("Comunidades recibidas: " + JSON.stringify(comunidades));
        console.log("Comunidades recibidas:", comunidades);
        if (comunidades.length === 0) {
          const opt = document.createElement("option");
          opt.value = "";
          opt.textContent = "No hay comunidades registradas";
          select.appendChild(opt);
        } else {
          comunidades.forEach((c) => {
            console.log("Agregando comunidad:", c);
            const opt = document.createElement("option");
            opt.value = c.id;
            opt.textContent =
              c.nombre +
              (c.nombre_lengua_orig ? " (" + c.nombre_lengua_orig + ")" : "");
            select.appendChild(opt);
          });
        }
      } catch (e) {
        alert("Error al cargar comunidades: " + e);
        console.error("Error al cargar comunidades:", e);
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = "Error al cargar comunidades";
        select.appendChild(opt);
      }
    } else {
      alert("No se encontró el select de comunidades");
      console.error("No se encontró el select de comunidades");
    }
  }, 300);
};
