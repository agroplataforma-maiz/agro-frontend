// ═══════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════
const API = 'https://agromaiz.mx';
const TOKEN_KEY = 'agro_token';
const USER_KEY  = 'agro_user';

// ═══════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════
const $ = id => document.getElementById(id);

function mostrarAlerta(id, msg, tipo = 'err') {
  const el = $(id);
  if (!el) return;
  el.className = `alerta alerta-${tipo} visible`;
  const txt = el.querySelector('span:last-child');
  if (txt) txt.textContent = msg;
  setTimeout(() => el.classList.remove('visible'), 6000);
}

function setLoading(btnId, spId, lblId, loading, labelText) {
  const btn = $(btnId);
  const sp  = $(spId);
  const lbl = $(lblId);
  if (!btn) return;
  btn.disabled = loading;
  if (sp) sp.style.display = loading ? 'block' : 'none';
  if (lbl) lbl.textContent = loading ? 'Procesando…' : labelText;
}

function guardarSesion(token, usuario) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));
}

function obtenerToken() { return localStorage.getItem(TOKEN_KEY); }
function obtenerUsuario() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
}

function cerrarSesion() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  $('sesion-activa').classList.remove('visible');
  $('card-auth').style.display = 'block';
  cambiarTab('login');
}

// ── Mostrar sesión activa ────────────────────────────
function mostrarSesionActiva(usuario) {
  const iniciales = (usuario.nombre_completo || usuario.username || '?')
    .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  $('sa-avatar').textContent = iniciales;
  $('sa-nombre').textContent = usuario.nombre_completo || usuario.username;
  const roles = {
    administrador: '👑 Administrador',
    investigador:  '🔬 Investigador',
    tecnico_campo: '🌾 Técnico de campo',
    visualizador:  '📊 Consultor / Visualizador',
    productor:     '🌽 Productor / Comunidad',
  };
  $('sa-rol').textContent = roles[usuario.rol] || usuario.rol;
  $('sesion-activa').classList.add('visible');
  $('card-auth').style.display = 'none';
}

// ═══════════════════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════════════════
function cambiarTab(tab) {
  document.querySelectorAll('.tab-btn').forEach((b, i) =>
    b.classList.toggle('active', i === (tab === 'login' ? 0 : 1)));
  $('panel-login').classList.toggle('active', tab === 'login');
  $('panel-registro').classList.toggle('active', tab === 'registro');
}

// ═══════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════
async function login() {
  const ident = $('l-identificador').value.trim();
  const pwd   = $('l-password').value;

  if (!ident || !pwd) {
    mostrarAlerta('err-login', 'Completa todos los campos');
    return;
  }

  setLoading('btn-login', 'sp-login', 'lbl-login', true, 'Entrar a la plataforma');

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identificador: ident, password: pwd }),
    });

    const data = await res.json();

    if (!res.ok) {
      mostrarAlerta('err-login', data.detail || 'Credenciales incorrectas');
      return;
    }

    guardarSesion(data.access_token, data.usuario);
    mostrarAlerta('ok-login', `¡Bienvenido, ${data.usuario.nombre_completo || data.usuario.username}!`, 'ok');

    setTimeout(() => mostrarSesionActiva(data.usuario), 800);

  } catch (e) {
    mostrarAlerta('err-login', 'No se pudo conectar con el servidor. Verifica que la API esté corriendo.');
  } finally {
    setLoading('btn-login', 'sp-login', 'lbl-login', false, 'Entrar a la plataforma');
  }
}

// ═══════════════════════════════════════════════════════
// REGISTRO
// ═══════════════════════════════════════════════════════
let rolSeleccionado = 'investigador';

function seleccionarRol(rol, el) {
  rolSeleccionado = rol;
  document.querySelectorAll('.rol-card').forEach(c => c.classList.remove('selected'));
  if (el) el.classList.add('selected');
}

async function registrar() {
  const nombre   = $('r-nombre').value.trim();
  const username = $('r-username').value.trim().toLowerCase();
  const email    = $('r-email').value.trim();
  const pwd      = $('r-password').value;
  const confirm  = $('r-confirm').value;

  // Validaciones
  if (!username || !email || !pwd || !confirm) {
    mostrarAlerta('err-reg', 'Completa todos los campos obligatorios (*)');
    return;
  }
  if (username.length < 3) {
    mostrarAlerta('err-reg', 'El usuario debe tener al menos 3 caracteres');
    return;
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    mostrarAlerta('err-reg', 'El usuario solo puede contener letras, números, - y _');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    mostrarAlerta('err-reg', 'Ingresa un correo electrónico válido');
    return;
  }
  if (pwd.length < 8) {
    mostrarAlerta('err-reg', 'La contraseña debe tener al menos 8 caracteres');
    return;
  }
  if (pwd !== confirm) {
    mostrarAlerta('err-reg', 'Las contraseñas no coinciden');
    return;
  }

  setLoading('btn-reg', 'sp-reg', 'lbl-reg', true, 'Crear cuenta');

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username, email, password: pwd,
        nombre_completo: nombre || null,
        rol: rolSeleccionado,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      mostrarAlerta('err-reg', data.detail || 'Error al crear la cuenta');
      return;
    }

    mostrarAlerta('ok-reg', '✓ Cuenta creada correctamente. Ahora puedes iniciar sesión.', 'ok');
    setTimeout(() => {
      cambiarTab('login');
      $('l-identificador').value = username;
    }, 1500);

  } catch (e) {
    mostrarAlerta('err-reg', 'No se pudo conectar con el servidor');
  } finally {
    setLoading('btn-reg', 'sp-reg', 'lbl-reg', false, 'Crear cuenta');
  }
}

// ═══════════════════════════════════════════════════════
// VALIDACIONES EN TIEMPO REAL
// ═══════════════════════════════════════════════════════
function validarUsername() {
  const v = $('r-username').value;
  const hint = $('username-hint');
  if (!v) { hint.textContent = 'Solo letras, números, - y _'; hint.style.color = 'var(--gris)'; return; }
  if (v.length < 3) { hint.textContent = 'Mínimo 3 caracteres'; hint.style.color = 'var(--rojo)'; return; }
  if (!/^[a-zA-Z0-9_-]+$/.test(v)) { hint.textContent = 'Caracteres no permitidos'; hint.style.color = 'var(--rojo)'; return; }
  hint.textContent = '✓ Nombre de usuario válido'; hint.style.color = 'var(--verde)';
}

function medirFuerza() {
  const pwd = $('r-password').value;
  const bar = $('pwd-bar');
  const lbl = $('pwd-label');
  if (!pwd) { bar.style.width = '0'; lbl.textContent = '—'; return; }

  let score = 0;
  if (pwd.length >= 8)  score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  const niveles = [
    { pct: '20%', color: 'var(--rojo)',    txt: 'Muy débil' },
    { pct: '40%', color: 'var(--rojo)',    txt: 'Débil' },
    { pct: '60%', color: 'var(--maiz)',    txt: 'Regular' },
    { pct: '80%', color: 'var(--maiz-cl)', txt: 'Fuerte' },
    { pct: '100%',color: 'var(--verde)',   txt: 'Muy fuerte ✓' },
  ];
  const n = niveles[Math.min(score, 4)];
  bar.style.width = n.pct;
  bar.style.background = n.color;
  lbl.textContent = n.txt;
  lbl.style.color = n.color;
}

function verificarConfirm() {
  const pwd = $('r-password').value;
  const conf = $('r-confirm').value;
  const hint = $('confirm-hint');
  if (!conf) { hint.textContent = ''; return; }
  if (pwd === conf) { hint.textContent = '✓ Las contraseñas coinciden'; hint.style.color = 'var(--verde)'; }
  else { hint.textContent = '✗ No coinciden'; hint.style.color = 'var(--rojo)'; }
}

function togglePwd(inputId, btn) {
  const input = $(inputId);
  if (!input) return;
  const isText = input.type === 'text';
  input.type = isText ? 'password' : 'text';
  btn.textContent = isText ? '👁' : '🙈';
}

function mostrarRecuperacion() {
  alert('Para recuperar tu contraseña contacta al administrador:\nalfreedobarron@gmail.com · 481 391 8309');
}

// ═══════════════════════════════════════════════════════
// INIT: verificar sesión existente
// ═══════════════════════════════════════════════════════
(function init() {
  const token   = obtenerToken();
  const usuario = obtenerUsuario();
  if (token && usuario) mostrarSesionActiva(usuario);
})();