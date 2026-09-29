'use client';

import type { MedioParcela } from '@/hooks/useMedioParcela';

interface PopupMedioProps {
  medio: MedioParcela;
  isMobile: boolean;
  onClose: () => void;
  onAcercar: () => void;
}



export default function PopupMedio({
  medio,
  isMobile,
  onClose,
  onAcercar,
}: PopupMedioProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        boxSizing: 'border-box',
        background: 'var(--blanco)',
        color: 'var(--tierra)',
        borderRadius: isMobile ? 14 : 16,
        border: '1.5px solid var(--maiz)',
        padding: isMobile ? '14px 14px 12px' : '18px 18px 14px',
        boxShadow: '0 8px 28px rgba(0,0,0,0.20)',
        fontFamily: 'Nunito, sans-serif',
      }}
    >
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

      <div
        style={{
          paddingRight: 22,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: 'var(--maiz)',
            fontWeight: 800,
            textTransform: 'uppercase',
            marginBottom: 4,
          }}
        >
          Medio de parcela
        </div>
{/*
        <strong
          style={{
            display: 'block',
            fontSize: 18,
            color: 'var(--tierra)',
            fontWeight: 900,
            marginBottom: 10,
          }}
        >
          {medio.tipo_medio || 'Medio de parcela'}
        </strong>
*/}
        <div
          style={{
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          <div>
            <strong></strong>{' '}
            {/*medio.tipo_medio || 'No especificado'*/}
          </div>

          <div>
            <strong></strong>{' '}
            {/*medio.subtipo || 'No especificado'*/}
          </div>

          {/*medio.nombre_archivo && (
            <div>
              <strong>Archivo:</strong>{' '}
              {medio.nombre_archivo}
            </div>
          )*/}

          {medio.descripcion && (
            <div style={{ marginTop: 6 }}>
              <strong>Descripción:</strong>{' '}
              {medio.descripcion}
            </div>
          )}

          {medio.fecha_captura && (
            <div style={{ marginTop: 6 }}>
              <strong>Fecha:</strong>{' '}
              {new Date(
                medio.fecha_captura
              ).toLocaleString('es-MX')}
            </div>
          )}

          {medio.url_temporal && (
            <img
              src={medio.url_temporal}
              alt={
                medio.nombre_archivo ||
                'Imagen de parcela'
              }
              style={{
                display: 'block',
                width: '100%',
                maxHeight:  isMobile ? 140 : 180,
                objectFit: 'cover',
                marginTop: 10,
                borderRadius: 8,
              }}
            />
          )}

          <button
            type="button"
            onClick={onAcercar}
            style={{
              width: '100%',
              marginTop: 12,
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
    </div>
  );
}