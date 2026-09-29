'use client'

import React from 'react';

interface NombreComunidadProps {
  nombre: string;
  style?: React.CSSProperties;
}

export default function NombreComunidad({ nombre, style }: NombreComunidadProps) {
  return (
    <span
      style={{
        fontSize: 15,
        color: 'var(--tierra)',
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