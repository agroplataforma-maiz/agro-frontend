"use client";

import React from "react";

export interface PopupParcelaInfo {
  id: number | string;
  comunidad: string;
  municipio: string;
  latitud: number;
  longitud: number;
  imagenUrl?: string | null;
  poligono?: string | null;
  idx: number;

  // Datos de parcela
  superficie_ha?: number | string | null;
  tenencia?: string | null;
  topografia?: string | null;
  densidad_plantas_ha?: number | null;
}

interface PopupParcelaProps {
  info: PopupParcelaInfo;
  onClose: () => void;
  onAcercar: () => void;
}

export default function PopupParcela({
  info,
  onClose,
  onAcercar,
}: PopupParcelaProps) {
  return (
    <div
      style={{
        minWidth: 220,
        maxWidth: 320,
        fontFamily:
          "Nunito, sans-serif",
        background:
          "rgba(255,255,255,0.98)",
        borderRadius: 16,
        border:
          "1.5px solid #FFD600",
        padding:
          "18px 18px 14px",
        position: "relative",
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
        onMouseOver={(e) =>
        (e.currentTarget.style.color =
          "#B91C1C")
        }
        onMouseOut={(e) =>
        (e.currentTarget.style.color =
          "#C8820A")
        }
      >
        ×
      </button>

      {info.comunidad ? (
        <>
          <div
            style={{
              fontSize: 12,
              color: "#C8820A",
              fontWeight: 800,
              textTransform: "uppercase",
              marginBottom: 2,
            }}
          >
            Proyecto territorial
          </div>

          <strong
            style={{
              fontSize: 18,
              color: "#3D2208",
              fontWeight: 900,
            }}
          >
            {info.comunidad}
          </strong>

          {info.imagenUrl && (
            <img
              src={info.imagenUrl}
              alt={
                info.comunidad ||
                "Imagen de parcela"
              }
              style={{
                width: "100%",
                maxHeight: 180,
                objectFit: "cover",
                borderRadius: 10,
                marginTop: 10,
                marginBottom: 8,
                display: "block",
                border:
                  "1px solid #E5E7EB",
              }}
            />
          )}

          <br />

          <span
            style={{
              color: "#6B3D1E",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {info.municipio}
          </span>

          <div
            style={{
              marginTop: 10,
              padding: "10px 12px",
              borderRadius: 10,
              background: "#F7F3EA",
              border: "1px solid #E8DCC8",
              fontSize: 13,
              color: "#3D2208",
            }}
          >
            <div style={{ marginBottom: 5 }}>
              <strong>Superficie:</strong>{" "}
              {info.superficie_ha != null
                ? `${info.superficie_ha} ha`
                : "—"}
            </div>

            <div style={{ marginBottom: 5 }}>
              <strong>Tenencia:</strong>{" "}
              {info.tenencia || "—"}
            </div>

            <div style={{ marginBottom: 5 }}>
              <strong>Topografía:</strong>{" "}
              {info.topografia || "—"}
            </div>

            <div>
              <strong>Densidad:</strong>{" "}
              {info.densidad_plantas_ha != null
                ? `${info.densidad_plantas_ha.toLocaleString()} plantas/ha`
                : "—"}
            </div>
          </div>

          <div
            style={{
              marginTop: 10,
              padding: "10px 12px",
              borderRadius: 10,
              background: "#FBF6EE",
              border:
                "1.5px solid #FFD600",
              fontFamily:
                "DM Mono, monospace",
              fontSize: 13,
              color: "#3D2208",
              marginBottom: 6,
            }}
          >
            <span
              style={{
                fontWeight: 700,
              }}
            >
              Lat:
            </span>{" "}
            {info.latitud.toFixed(6)}
            <br />

            <span
              style={{
                fontWeight: 700,
              }}
            >
              Lon:
            </span>{" "}
            {info.longitud.toFixed(6)}
          </div>

          {info.poligono && (
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
                fontFamily:
                  "Nunito, sans-serif",
              }}
            >
              Acercar a la parcela
            </button>
          )}

          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              color: "#6b7280",
              fontWeight: 600,
            }}
          >
            Punto #{info.idx + 1} ·
            cobertura comunitaria
            en la Huasteca Potosina
          </div>
        </>
      ) : (
        <>
          <div
            style={{
              fontSize: 13,
              color: "#C8820A",
              fontWeight: 800,
              textTransform: "uppercase",
              marginBottom: 2,
            }}
          >
            Municipio
          </div>

          <strong
            style={{
              fontSize: 20,
              color: "#3D2208",
              fontWeight: 900,
            }}
          >
            {info.municipio}
          </strong>
        </>
      )}
    </div>
  );
}