
'use client';

import type { GermoplasmaMapa } from '@/hooks/useGermoplasmaMapa';

interface PopupGermoplasmaProps {
  germoplasma: GermoplasmaMapa;
  latitud: number;
  longitud: number;
  isMobile: boolean;
  onClose: () => void;
  onAcercar: () => void;
}

export default function PopupGermoplasma({
  germoplasma,
  latitud,
  longitud,
  isMobile,
  onClose,
  onAcercar,
}: PopupGermoplasmaProps) {
  const filas: [string, string][] = [
    ['Código de accesión', germoplasma.codigo_accesion || '—'],
    ['Nombre local', germoplasma.nombre_local || '—'],
    [
      'Nombre en lengua originaria',
      germoplasma.nombre_lengua_orig || '—',
    ],
    [
      'Nombre asignado por productor',
      germoplasma.nombre_asignado_productor || '—',
    ],
    ['Ciclo vegetativo', germoplasma.ciclo_vegetativo || '—'],
    [
      'Duración (días)',
      germoplasma.duracion_dias != null
        ? String(germoplasma.duracion_dias)
        : '—',
    ],
    ['Notas', germoplasma.notas || '—'],
    ['Latitud', String(latitud)],
    ['Longitud', String(longitud)],
  ];

  return (
    <div
      role="dialog"
      aria-label="Información del germoplasma"
      style={{
        position: 'relative',
        width: '100%',
        maxHeight: isMobile ? '70vh' : '65vh',
        boxSizing: 'border-box',
        background: 'var(--blanco)',
        color: 'var(--tierra)',
        borderRadius: isMobile ? 14 : 16,
        border: '1.5px solid var(--maiz)',
        boxShadow: '0 8px 28px rgba(0,0,0,0.20)',
        fontFamily: 'Nunito, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        padding: isMobile ? '14px 14px 0' : '18px 18px 0',
      }}
    >
      {/* Botón cerrar popup */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          background: 'none',
          border: 'none',
          fontSize: 22,
          color: 'var(--maiz)',
          cursor: 'pointer',
          fontWeight: 900,
          lineHeight: 1,
          padding: 0,
          zIndex: 2,
        }}
      >
        ×
      </button>

      {/* Contenido desplazable */}
      <div
        style={{
          minHeight: 0,
          overflowY: 'auto',
          paddingRight: 8,
          paddingBottom: 12,
        }}
      >
        <div style={{ paddingRight: 22 }}>
          <div
            style={{
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            {filas.map(([etiqueta, valor]) => (
              <div key={etiqueta} style={{ marginTop: 6 }}>
                <strong>{etiqueta}:</strong> {valor}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sección inferior fija */}
      <div
        style={{
          flexShrink: 0,
          padding: isMobile ? '10px 0 12px' : '10px 0 14px',
          borderTop: '1px solid var(--borde)',
          background: 'var(--blanco)',
        }}
      >
        <button
          type="button"
          onClick={onAcercar}
          style={{
            width: '100%',
            padding: '9px 12px',
            border: 'none',
            borderRadius: 8,
            background: 'var(--verde)',
            color: 'var(--blanco)',
            fontFamily: 'inherit',
            fontSize: 13,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          Acercar a la ubicación
        </button>
      </div>
    </div>
  );
}
