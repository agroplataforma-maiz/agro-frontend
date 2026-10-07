'use client';

import type { ElementoMapa } from './MapaHuastecaMaplibreClient';

interface ListaPuntosCercanosProps {
    elementos: ElementoMapa[];
    isMobile: boolean;
    onSeleccionar: (elemento: ElementoMapa) => void;
    onCerrar: () => void;
}

export default function ListaPuntosCercanos({
    elementos,
    isMobile,
    onSeleccionar,
    onCerrar,
}: ListaPuntosCercanosProps) {
    if (elementos.length <= 1) {
        return null;
    }

    return (
        <>
            <style>{`
                .lista-puntos-cercanos {
                    background: #fff !important;
                    color: #1F2937;
                    border-color: #E2E8F0 !important;
                }

                html.dark .lista-puntos-cercanos {
                    background: #1F2937 !important;
                    color: #fff;
                    border-color: rgba(255,255,255,0.12) !important;
                }

                .lista-puntos-cercanos .punto-cercano {
                    color: #3D2208;
                }

                html.dark .lista-puntos-cercanos .punto-cercano {
                    color: #fff;
                }

                .lista-puntos-cercanos .punto-cercano:hover {
                    background: #FEF3DC !important;
                }

                html.dark .lista-puntos-cercanos .punto-cercano:hover {
                    background: #374151 !important;
                }
            `}</style>

            <div
                className="lista-puntos-cercanos"
                style={{
                    position: 'absolute',
                    left: isMobile ? '50%' : 360,
                    transform: isMobile
                        ? 'translateX(-50%)'
                        : 'none',
                    top: isMobile ? 'auto' : 'auto',
                    bottom: isMobile
                        ? 'calc(var(--topbar-h, 64px) + 100px)'
                        : 75,
                    width: isMobile
                        ? 'min(320px, calc(100vw - 24px))'
                        : 320,
                    maxHeight: isMobile ? 260 : 200,
                    background: 'rgba(255,255,255,0.98)',
                    border: '1px solid rgba(61,34,8,0.12)',
                    borderRadius: 14,
                    boxShadow:
                        '0 8px 28px rgba(0,0,0,0.20)',
                    padding: 8,
                    zIndex: 3004,
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                {/* Botón de cierre fijo */}
                <div
                    style={{
                        position: 'relative',
                        flexShrink: 0,
                        height: 15,
                        marginBottom: 4,
                    }}
                >
                    <button
                        type="button"
                        onClick={onCerrar}
                        aria-label="Cerrar"
                        style={{
                            position: 'absolute',
                            top: -3,
                            right: 0,
                            background: 'none',
                            border: 'none',
                            fontSize: 22,
                            color: '#C8820A',
                            cursor: 'pointer',
                            fontWeight: 900,
                            lineHeight: 1,
                            padding: 0,
                        }}
                        onMouseOver={(e) =>
                            (e.currentTarget.style.color = '#B91C1C')
                        }
                        onMouseOut={(e) =>
                            (e.currentTarget.style.color = '#C8820A')
                        }
                    >
                        ×
                    </button>
                </div>

                {/* Área desplazable */}
                <div
                    style={{
                        maxHeight: isMobile ? 150 : 150,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                    }}
                >
                    {elementos.map((elemento) => (
                        <button
                            key={elemento.key}
                            type="button"
                            className="punto-cercano"
                            onClick={() => onSeleccionar(elemento)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '10px 12px',
                                border: 'none',
                                borderRadius: 10,
                                background: 'transparent',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontFamily: 'Nunito, sans-serif',
                                fontWeight: 700,
                            }}

                        >
                            <span
                                style={{
                                    width: 32,
                                    height: 32,
                                    minWidth: 32,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 21,
                                    lineHeight: 1,
                                }}
                            >
                                {elemento.tipo === 'comunidad'
                                    ? '🏘️'
                                    : elemento.tipo === 'medio'
                                        ? '📷'
                                        : '📍'}
                            </span>

                            <span
                                style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {elemento.nombre}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}