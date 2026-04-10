"use client";
// SidebarComunidades.tsx

import React from 'react';
import Button from '@/components/ui/Button';
import NombreComunidad from '@/components/ui/NombreComunidad';
import styles from './SidebarComunidades.module.css';

interface PuntoMapaHuasteca {
  id: number | string;
  comunidad: string;
  municipio: string;
  latitud: number;
  longitud: number;
}

interface SidebarComunidadesProps {
  rol: string | undefined;
  busqueda: string;
  setBusqueda: (v: string) => void;
  municipioFiltro: string;
  setMunicipioFiltro: (v: string) => void;
  municipiosMapa: string[];
  ubicacionesFiltradas: PuntoMapaHuasteca[];
  COMUNIDADES_HUASTECA: PuntoMapaHuasteca[];
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
  COMUNIDADES_HUASTECA,
  puntoActivoId,
  setPuntoActivoId,
  setModalNuevaOpen,
}: SidebarComunidadesProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.headerRow}>
          <h2 className={styles.title}>Comunidades</h2>
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
        <p className={styles.count}>{ubicacionesFiltradas.length} puntos georreferenciados</p>
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
      <div className={styles.listaComunidades}>
        {municipiosMapa.map(municipio => {
          const comunidades = COMUNIDADES_HUASTECA.filter(p => p.municipio === municipio);
          if (!comunidades.length) return null;
          const municipioActivo = comunidades.some(p => p.id === puntoActivoId);
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
                  if (first) setPuntoActivoId(first.id);
                }}
              >
                <span className={styles.municipioNombre}>{municipio}</span>
                <span className={styles.municipioCount}>{comunidades.length} comunidad{comunidades.length > 1 ? 'es' : ''}</span>
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
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setPuntoActivoId(punto.id); }}
                  >
                    <span className={styles.comunidadIcono}>📍</span>
                    <NombreComunidad nombre={punto.comunidad} />
                    <span className={styles.comunidadMunicipio}>{punto.municipio}</span>
                    <small className={styles.comunidadCoords}>{punto.latitud.toFixed(6)}, {punto.longitud.toFixed(6)}</small>
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
