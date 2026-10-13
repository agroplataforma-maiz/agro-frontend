"use client";

import React from "react";

export interface PopupComunidadInfo {
  id: number | string;
  comunidad: string;
  municipio: string;
  latitud: number;
  longitud: number;
  idx: number;

  // Datos específicos de la comunidad
  tipo_comunidad?: string | null;
  nombre_lengua_orig?: string | null;
  poblacion_total?: number | string | null;
  fuente?: string | null;
}

interface PopupComunidadProps {
  info: PopupComunidadInfo;
  onClose: () => void;
  onAcercar: () => void;
}

export default function PopupComunidad({
  info,
  onClose,
  onAcercar,
}: PopupComunidadProps) {
  const datoDisponible = (valor?: string | number | null) =>
    valor !== undefined && valor !== null && String(valor).trim() !== ""
      ? valor
      : "—";

  const poblacion =
    info.poblacion_total !== undefined &&
    info.poblacion_total !== null &&
    String(info.poblacion_total).trim() !== ""
      ? Number(info.poblacion_total).toLocaleString("es-MX")
      : "—";

  return (
    <div
      style={{
        minWidth: 220,
        maxWidth: 320,
        maxHeight: "min(75vh, 620px)",
        overflowY: "auto",
        fontFamily: "Nunito, sans-serif",
        background: "rgba(255,255,255,0.98)",
        borderRadius: 16,
        border: "1.5px solid #FFD600",
        padding: "18px 18px 14px",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          background: "none",
          border: "none",
          fontSize: 22,
          color: "#C8820A",
          cursor: "pointer",
          fontWeight: 900,
          lineHeight: 1,
          padding: 0,
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.color = "#B91C1C";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.color = "#C8820A";
        }}
      >
        ×
      </button>

      <div
        style={{
          fontSize: 12,
          color: "#C8820A",
          fontWeight: 800,
          textTransform: "uppercase",
          marginBottom: 4,
          paddingRight: 20,
        }}
      >
        Comunidad registrada
      </div>

      <strong
        style={{
          display: "block",
          fontSize: 18,
          color: "#3D2208",
          fontWeight: 900,
          overflowWrap: "anywhere",
        }}
      >
        {info.comunidad || "Comunidad sin nombre"}
      </strong>

      <span
        style={{
          display: "block",
          marginTop: 4,
          color: "#6B3D1E",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        {info.municipio || "Municipio no disponible"}
      </span>

      <div
        style={{
          marginTop: 12,
          padding: "10px 12px",
          borderRadius: 10,
          background: "#F7F3EA",
          border: "1px solid #E8DCC8",
          fontSize: 13,
          color: "#3D2208",
          overflowWrap: "anywhere",
        }}
      >
        <div style={{ marginBottom: 7 }}>
          <strong>Tipo:</strong>{" "}
          {datoDisponible(info.tipo_comunidad)}
        </div>

        <div style={{ marginBottom: 7 }}>
          <strong>Lengua:</strong>{" "}
          {datoDisponible(info.nombre_lengua_orig)}
        </div>

        <div style={{ marginBottom: 7 }}>
          <strong>Población:</strong>{" "}
          {poblacion}
        </div>

        <div>
          <strong>Fuente:</strong>{" "}
          {datoDisponible(info.fuente)}
        </div>
      </div>

      <div
        style={{
          marginTop: 10,
          padding: "10px 12px",
          borderRadius: 10,
          background: "#FBF6EE",
          border: "1.5px solid #FFD600",
          fontFamily: "DM Mono, monospace",
          fontSize: 13,
          color: "#3D2208",
          marginBottom: 6,
        }}
      >
        <div>
          <strong>Lat:</strong> {info.latitud.toFixed(6)}
        </div>

        <div>
          <strong>Lon:</strong> {info.longitud.toFixed(6)}
        </div>
      </div>

      <button
        type="button"
        onClick={onAcercar}
        style={{
          width: "100%",
          marginTop: 10,
          padding: "9px 12px",
          border: "none",
          borderRadius: 8,
          background: "#2A5C3F",
          color: "#FFFFFF",
          fontSize: 13,
          fontWeight: 800,
          cursor: "pointer",
          fontFamily: "Nunito, sans-serif",
        }}
      >
        Acercar a la ubicación
      </button>

      <div
        style={{
          marginTop: 8,
          fontSize: 12,
          color: "#6b7280",
          fontWeight: 600,
        }}
      >
        Punto #{info.idx + 1} · comunidad de la Huasteca Potosina
      </div>
    </div>
  );
}