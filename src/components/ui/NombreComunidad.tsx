// Componente reutilizable para mostrar el nombre de la comunidad con estilos consistentes (igual que los modales)
'use client'

import React from 'react';

interface NombreComunidadProps {
  nombre: string;
  dark?: boolean;
  style?: React.CSSProperties;
}

export default function NombreComunidad({ nombre, dark, style }: NombreComunidadProps) {
  return (
    <span
      style={{
        fontSize: 15,
        color: dark ? '#FFD600' : '#3D2208',
        fontFamily: 'Nunito, Arial, sans-serif',
        fontWeight: 700,
        marginRight: 3,
        background: 'transparent',
        letterSpacing: '.01em',
        lineHeight: 1.2,
        opacity: 1,
        filter: 'none',
        ...style,
      }}
    >
      {nombre}
    </span>
  );
}
