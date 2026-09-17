"use client";
// SidebarComunidades.tsx

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import NombreComunidad from '@/components/ui/NombreComunidad';
import styles from './SidebarComunidades.module.css';

interface PuntoMapaHuasteca {
  id: number | string;
  comunidad: string;
  municipio: string;
  latitud: number;
  longitud: number;
  imagenUrl?: string | null;
}

interface SidebarComunidadesProps {
  rol: string | undefined;
  busqueda: string;
  setBusqueda: (v: string) => void;
  municipioFiltro: string;
  setMunicipioFiltro: (v: string) => void;
  municipiosMapa: string[];
  ubicacionesFiltradas: PuntoMapaHuasteca[];

  puntoActivoId: number | string | null;
  setPuntoActivoId: (id: number | string) => void;
  setModalNuevaOpen: (v: boolean) => void;
}

export default function SidebarComunidades({
  rol,
  busqueda,
  setBusqueda,
  municipioFiltro,
  setMunicipioFiltro,
  municipiosMapa,
  ubicacionesFiltradas,
  puntoActivoId,
  setPuntoActivoId,
  setModalNuevaOpen,
}: SidebarComunidadesProps) {

  const [sidebarAbierto, setSidebarAbierto] = useState(true);

  /*
   * Cuando el sidebar está cerrado, solamente mostramos
   * el botón para volver a abrirlo.
   */
  if (!sidebarAbierto) {
    return (
      <button
        type="button"
        className={styles.sidebarToggle}
        onClick={() => setSidebarAbierto(true)}
        aria-label="Mostrar panel de comunidades"
        title="Mostrar comunidades"
      >
        ☰
      </button>
    );
  }

  return (
    <aside className={styles.sidebar}>

      {/* Botón para ocultar el sidebar */}
      <button
        type="button"
        className={styles.sidebarClose}
        onClick={() => setSidebarAbierto(false)}
        aria-label="Ocultar panel de comunidades"
        title="Ocultar comunidades"
      >
        ‹
      </button>

      {/* =====================================================
          PARTE SUPERIOR:
          búsqueda + filtro de municipios
          ===================================================== */}
      <div className={styles.municipiosSection}>

        <div className={styles.header}>

          <div className={styles.headerRow}>
            <h2 className={styles.title}>
              Comunidades
            </h2>

            {(rol === 'tecnico_campo' || rol === 'investigador') && (
              <Button
                variante="primario"
                tamaño="sm"
                className={styles.addBtn}
                onClick={() => setModalNuevaOpen(true)}
              >
                + Agregar nueva
              </Button>
            )}
          </div>

          <p className={styles.count}>
            {ubicacionesFiltradas.length} puntos georreferenciados
          </p>

          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar comunidad o municipio…"
            className={styles.input}
          />

          <div className={styles.filtrosRow}>

            <Button
              type="button"
              className={
                municipioFiltro === 'todos'
                  ? styles.filtroBtnActivo
                  : styles.filtroBtn
              }
              onClick={() => setMunicipioFiltro('todos')}
            >
              Toda la Huasteca
            </Button>

            {municipiosMapa.map(municipio => (
              <button
                key={municipio}
                type="button"
                className={
                  municipioFiltro === municipio
                    ? styles.filtroBtnActivo
                    : styles.filtroBtn
                }
                onClick={() => setMunicipioFiltro(municipio)}
              >
                {municipio}
              </button>
            ))}

          </div>

        </div>

      </div>

      {/* =====================================================
          PARTE INFERIOR:
          municipios + parcelas
          ===================================================== */}
      <div className={styles.listaComunidades}>

        {municipiosMapa.map(municipio => {

          const comunidades = ubicacionesFiltradas.filter(
            p => p.municipio === municipio
          );

          const municipioActivo = comunidades.some(
            p => p.id === puntoActivoId
          );

          return (
            <div
              key={municipio}
              className={
                municipioActivo
                  ? styles.municipioBoxActivo
                  : styles.municipioBox
              }
            >

              <div
                className={
                  municipioActivo
                    ? styles.municipioHeaderActivo
                    : styles.municipioHeader
                }
                tabIndex={0}
                role="button"
                aria-pressed={municipioActivo}
                onClick={() => {
                  const first = comunidades[0];

                  if (first) {
                    setPuntoActivoId(first.id);
                  }
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();

                    const first = comunidades[0];

                    if (first) {
                      setPuntoActivoId(first.id);
                    }
                  }
                }}
              >

                <span className={styles.municipioNombre}>
                  {municipio}
                </span>

                <span className={styles.municipioCount}>
                  {comunidades.length}{' '}
                  parcela{comunidades.length !== 1 ? 's' : ''}
                </span>

              </div>

              <ul className={styles.comunidadesList}>

                {comunidades.map(punto => (
                  <li
                    key={punto.id}
                    className={
                      puntoActivoId === punto.id
                        ? styles.comunidadItemActivo
                        : styles.comunidadItem
                    }
                    tabIndex={0}
                    role="button"
                    aria-pressed={puntoActivoId === punto.id}
                    onClick={() => setPuntoActivoId(punto.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setPuntoActivoId(punto.id);
                      }
                    }}
                  >

                    <span className={styles.comunidadIcono}>
                      📍
                    </span>

                    <NombreComunidad
                      nombre={punto.comunidad}
                    />

                    <span className={styles.comunidadMunicipio}>
                      {punto.municipio}
                    </span>

                    <small className={styles.comunidadCoords}>
                      {punto.latitud.toFixed(6)}, {punto.longitud.toFixed(6)}
                    </small>

                  </li>
                ))}

              </ul>

            </div>
          );
        })}

      </div>

    </aside>
  );
}
