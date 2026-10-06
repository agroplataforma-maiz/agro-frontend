'use client';

import { useState } from 'react';
import type { MedioParcela } from '@/hooks/useMedioParcela';
import { createPortal } from 'react-dom';

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
  const [imagenAmpliada, setImagenAmpliada] = useState(false);

  return (
    <>
      <div
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
                fontSize: 12,
                color: 'var(--maiz)',
                fontWeight: 800,
                textTransform: 'uppercase',
                marginBottom: 4,
              }}
            >
              Medio de parcela
            </div>

            <div
              style={{
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              {medio.descripcion && (
                <div style={{ marginTop: 6 }}>
                  <strong>Descripción:</strong>{' '}
                  {medio.descripcion}
                </div>
              )}

              {medio.fecha_captura && (
                <div style={{ marginTop: 6 }}>
                  <strong>Fecha:</strong>{' '}
                  {new Date(medio.fecha_captura).toLocaleString('es-MX')}
                </div>
              )}

              {/* Imagen */}
              {medio.url_temporal && (
                <button
                  type="button"
                  onClick={() => setImagenAmpliada(true)}
                  aria-label="Ver imagen ampliada"
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: 0,
                    border: 'none',
                    background: 'none',
                    cursor: 'zoom-in',
                    marginTop: 10,
                  }}
                >
                  <img
                    src={medio.url_temporal}
                    alt={medio.nombre_archivo || 'Imagen de parcela'}
                    style={{
                      display: 'block',
                      width: '100%',
                      maxHeight: isMobile ? 140 : 180,
                      objectFit: 'cover',
                      borderRadius: 8,
                    }}
                  />
                </button>
              )}
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

      {/* Visor de imagen ampliada */}
      {imagenAmpliada &&
        medio.url_temporal &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="mapa-imagen-ampliada"
            role="dialog"
            aria-modal="true"
            aria-label="Imagen ampliada"
            onClick={() => setImagenAmpliada(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100dvh',
              zIndex: 2147483647,
              background: 'rgba(0, 0, 0, 0.90)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
              overflow: 'hidden',
              isolation: 'isolate',
              padding: isMobile ? '56px 12px 12px' : 32,
            }}
          >
            {/* Botón cerrar imagen */}
            <button
              type="button"
              onClick={() => setImagenAmpliada(false)}
              aria-label="Cerrar imagen ampliada"
              style={{
                position: 'fixed',
                top: isMobile ? 10 : 24,
                right: isMobile ? 10 : 24,
                width: 40,
                height: 40,
                border: 'none',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.70)',
                color: 'var(--blanco)',
                fontSize: 28,
                lineHeight: 1,
                cursor: 'pointer',
                zIndex: 2147483648,
              }}
            >
              ×
            </button>

            {/* Imagen ampliada */}
            <img
              src={medio.url_temporal}
              alt={medio.nombre_archivo || 'Imagen de parcela ampliada'}
              onClick={(event) => event.stopPropagation()}
              style={{
                display: 'block',
                width: 'auto',
                height: 'auto',
                maxWidth: 'calc(100vw - 24px)',
                maxHeight: 'calc(100dvh - 68px)',
                objectFit: 'contain',
                borderRadius: 10,
                boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
                flex: '0 1 auto',
              }}
            />
          </div>,
          document.body
        )}
    </>
  );
}