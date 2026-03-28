// ══════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════
const API       = 'http://agromaiz.mx';
const TOKEN_KEY = 'agro_token';
const USER_KEY  = 'agro_user';

// ── Utils ──────────────────────────────────
const $ = id => document.getElementById(id);
function obtenerUsuario() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
}
function obtenerToken() { return localStorage.getItem(TOKEN_KEY); }
function cerrarSesion() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  location.reload();
}

// ══════════════════════════════════════════
// DETECCIÓN DE SESIÓN
// ══════════════════════════════════════════
function inicializar() {
  const usuario = obtenerUsuario();
  const token   = obtenerToken();

  if (token && usuario) {
    mostrarDashboard(usuario);
  } else {
    mostrarLanding();
  }
}

function mostrarDashboard(u) {
  $('dashboard').classList.add('visible');
  $('landing').style.display = 'none';

  // Navbar
  const iniciales = (u.nombre_completo || u.username || '?')
    .split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
  $('nav-avatar').textContent = iniciales;
  $('nav-nombre').textContent = u.nombre_completo || u.username;
  const roles = {
    administrador:'👑 Admin', investigador:'🔬 Investigador',
    tecnico_campo:'🌾 Técnico', visualizador:'📊 Consultor', productor:'🌽 Productor'
  };
  $('nav-rol').textContent = roles[u.rol] || u.rol;
  $('nav-usuario').classList.add('visible');
  $('nav-login-btn').style.display = 'none';

  // Saludo
  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';
  $('dash-titulo').textContent = `${saludo}, ${(u.nombre_completo || u.username).split(' ')[0]} 🌽`;

  // Cargar stats de la API
  cargarStats();
}

function mostrarLanding() {
  $('landing').style.display = 'block';
  $('dashboard').classList.remove('visible');
  $('nav-login-btn').style.display = 'inline-flex';
}

// ══════════════════════════════════════════
// STATS DEL DASHBOARD
// ══════════════════════════════════════════
async function cargarStats() {
  const token = obtenerToken();
  if (!token) return;
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const intentar = async (url, id) => {
    try {
      const r = await fetch(url, { headers });
      if (!r.ok) return;
      const d = await r.json();
      const total = Array.isArray(d) ? d.length : (d.total || d.count || '—');
      $(id).textContent = total;
    } catch { }
  };

  await Promise.allSettled([
    intentar(`${API}/social/productores/`,            'ds-productores'),
    intentar(`${API}/cultural/saberes_tradicionales/`,'ds-saberes'),
    intentar(`${API}/agronomico/germoplasma/`,         'ds-variedades'),
  ]);
}

// ══════════════════════════════════════════
// NAVBAR SCROLL
// ══════════════════════════════════════════
window.addEventListener('scroll', () => {
  $('nav').classList.toggle('scrolled', window.scrollY > 40);
});
$('nav').classList.add('scrolled');

function toggleMenu() {
  const links = document.querySelector('.nav-links');
  if (links) links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
}

// ══════════════════════════════════════════
// REVEAL AL SCROLL
// ══════════════════════════════════════════
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('on'); obs.unobserve(e.target); }
  });
}, { threshold: 0.07 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

// ══════════════════════════════════════════
// CONTADOR ANIMADO
// ══════════════════════════════════════════
function animarNumero(el, fin, dur = 1200) {
  const start = performance.now();
  const update = t => {
    const prog = Math.min((t - start) / dur, 1);
    const ease = 1 - Math.pow(1 - prog, 3);
    el.textContent = Math.round(ease * fin) + (el.dataset.suffix || '');
    if (prog < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const numObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const nums = e.target.querySelectorAll('.num-n, .hero-stat-n');
      nums.forEach(n => {
        const txt = n.textContent.replace(/[^0-9]/g,'');
        const suffix = n.textContent.replace(/[0-9]/g,'');
        if (txt) { n.dataset.suffix = suffix; animarNumero(n, parseInt(txt)); }
      });
      numObs.unobserve(e.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.numeros-grid, .hero-stats').forEach(el => numObs.observe(el));

// ══════════════════════════════════════════
// INIT
// ══════════════════════════════════════════
inicializar();