// src/components/ui/MapaHuasteca.tsx
// Mapa esquemático SVG de la Huasteca Potosina
// Migrado del SVG inline de index.html

export default function MapaHuasteca() {
  return (
    <svg
      viewBox="0 0 340 300"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', display: 'block' }}
      aria-label="Mapa esquemático de la Huasteca Potosina"
    >
      {/* Región */}
      <path
        d="M40 60 Q80 30 140 40 Q200 50 260 80 Q300 100 310 160 Q320 220 280 260 Q240 290 180 285 Q120 280 80 250 Q40 220 30 170 Q20 120 40 60Z"
        fill="rgba(42,92,63,.25)"
        stroke="rgba(42,92,63,.4)"
        strokeWidth="1.5"
      />

      {/* Ríos esquemáticos */}
      <path
        d="M60 100 Q120 130 180 120 Q230 110 280 150"
        stroke="rgba(74,140,100,.35)"
        strokeWidth="2"
        fill="none"
        strokeDasharray="4 3"
      />
      <path
        d="M100 200 Q150 180 200 190 Q240 200 270 220"
        stroke="rgba(74,140,100,.25)"
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="3 3"
      />

      {/* Ciudad Valles — principal */}
      <circle cx="160" cy="150" r="8"  fill="rgba(200,130,10,.3)" stroke="var(--maiz-cl)" strokeWidth="1.5" />
      <circle cx="160" cy="150" r="14" fill="rgba(200,130,10,.08)" stroke="var(--maiz-cl)" strokeWidth=".5" />
      <text x="160" y="154" textAnchor="middle" fontFamily="DM Mono" fontSize="7" fill="var(--maiz-cl)">CV</text>

      {/* Ébano */}
      <circle cx="220" cy="130" r="6"  fill="rgba(200,130,10,.2)" stroke="rgba(240,180,41,.6)" strokeWidth="1" />
      <text x="220" y="133" textAnchor="middle" fontFamily="DM Mono" fontSize="6" fill="rgba(240,180,41,.7)">EB</text>

      {/* Aquismón */}
      <circle cx="100" cy="170" r="6"  fill="rgba(200,130,10,.2)" stroke="rgba(240,180,41,.6)" strokeWidth="1" />
      <text x="100" y="173" textAnchor="middle" fontFamily="DM Mono" fontSize="6" fill="rgba(240,180,41,.7)">AQ</text>

      {/* Tancanhuitz */}
      <circle cx="140" cy="200" r="5"  fill="rgba(200,130,10,.15)" stroke="rgba(240,180,41,.4)" strokeWidth="1" />
      <text x="140" y="203" textAnchor="middle" fontFamily="DM Mono" fontSize="6" fill="rgba(240,180,41,.5)">TC</text>

      {/* Tamuín */}
      <circle cx="200" cy="190" r="5"  fill="rgba(200,130,10,.15)" stroke="rgba(240,180,41,.4)" strokeWidth="1" />
      <text x="200" y="193" textAnchor="middle" fontFamily="DM Mono" fontSize="6" fill="rgba(240,180,41,.5)">TM</text>

      {/* Puntos menores */}
      <circle cx="80"  cy="130" r="4" fill="rgba(200,130,10,.1)" stroke="rgba(240,180,41,.3)" strokeWidth=".8" />
      <circle cx="240" cy="200" r="4" fill="rgba(200,130,10,.1)" stroke="rgba(240,180,41,.3)" strokeWidth=".8" />

      {/* Leyenda */}
      <circle cx="20" cy="275" r="5" fill="rgba(200,130,10,.3)" stroke="var(--maiz-cl)" strokeWidth="1" />
      <text x="30" y="279" fontFamily="DM Mono" fontSize="7" fill="rgba(255,255,255,.4)">En campo</text>
      <circle cx="100" cy="275" r="4" fill="rgba(200,130,10,.1)" stroke="rgba(240,180,41,.3)" strokeWidth=".8" />
      <text x="110" y="279" fontFamily="DM Mono" fontSize="7" fill="rgba(255,255,255,.4)">Programada</text>

      {/* Título */}
      <text x="10" y="20" fontFamily="DM Mono" fontSize="9" fill="rgba(255,255,255,.25)" letterSpacing="1">
        HUASTECA POTOSINA · SLP
      </text>
    </svg>
  )
}