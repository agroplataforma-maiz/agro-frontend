// src/lib/utils.ts
// Utilidades del dominio — migradas de productores.js y dashboard.js

// Calcula edad a partir de fecha ISO (igual que calcularEdad en productores.js)
export function calcularEdad(fechaStr: string): number {
  const hoy  = new Date()
  const nac  = new Date(fechaStr)
  let edad   = hoy.getFullYear() - nac.getFullYear()
  const diff = hoy.getMonth() - nac.getMonth()
  if (diff < 0 || (diff === 0 && hoy.getDate() < nac.getDate())) edad--
  return edad
}

// Valor o guión — igual que dash() en productores.js
export function dash(v: unknown): string {
  return v != null && v !== '' ? String(v) : '—'
}

// Sí / No — igual que siNo() en productores.js
export function siNo(v: unknown): string {
  if (v === true  || v === 1 || v === 'true'  || v === 'si')  return 'Sí'
  if (v === false || v === 0 || v === 'false' || v === 'no')  return 'No'
  return '—'
}

// Nombre completo a partir de partes
export function nombreCompleto(
  nombres?: string,
  apellidoPaterno?: string,
  apellidoMaterno?: string,
): string {
  return [nombres, apellidoPaterno, apellidoMaterno]
    .filter(Boolean)
    .join(' ')
}

// Clases CSS para badges de rol (igual que ROL_BADGE en dashboard.js)
export const ROL_BADGE: Record<string, string> = {
  administrador: 'badge-admin',
  investigador:  'badge-invest',
  tecnico_campo: 'badge-tecnico',
  visualizador:  'badge-visual',
  productor:     'badge-productor',
}
