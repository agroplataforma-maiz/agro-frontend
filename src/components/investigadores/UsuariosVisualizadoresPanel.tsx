'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { GET } from '@/lib/api'
import type { Usuario } from '@/types'

import Tabla, { type Columna } from '@/components/ui/Tabla'
import SearchInput from '@/components/ui/SearchInput'
import styles from '@/app/productores/productores.module.css'

export default function UsuariosVisualizadoresPanel() {
  const [busqueda, setBusqueda] = useState('')

  // ── Usuarios visualizadores ───────────────────────────────────────────────
  // Endpoint disponible en el backend:
  // GET /productores/usuarios-visualizadores
  //
  // Este panel es únicamente de consulta.
  //
  // TODO BACKEND:
  // Cuando se defina el flujo para convertir/asociar un usuario visualizador
  // con un productor, agregar aquí la acción correspondiente.

  const {
    data: usuariosVisualizadores = [],
    isLoading,
  } = useQuery<Usuario[]>({
    queryKey: ['usuarios-visualizadores'],
    queryFn: () => GET('/productores/usuarios-visualizadores'),
  })

  // ── Filtro ────────────────────────────────────────────────────────────────
  const visualizadoresFiltrados = usuariosVisualizadores.filter(u => {
    const texto = [
      u.nombre_completo,
      u.username,
      u.email,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return texto.includes(busqueda.toLowerCase())
  })

  // ── Columnas ──────────────────────────────────────────────────────────────
  const columnas: Columna<Usuario>[] = [
    {
      key: 'nombre_completo',
      header: 'Nombre',
      render: u => u.nombre_completo || u.username,
    },
    {
      key: 'username',
      header: 'Usuario',
    },
    {
      key: 'email',
      header: 'Correo',
      render: u => u.email || '—',
    },
    {
      key: 'rol',
      header: 'Rol',
      render: u => u.rol,
    },
  ]

  return (
    <section style={{ marginBottom: 32 }}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.titulo}>
            Usuarios visualizadores
          </h1>

          <p className={styles.subtitulo}>
            {visualizadoresFiltrados.length} usuarios visualizadores
          </p>
        </div>

        <div className={styles.headerActions}>
          <SearchInput
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar usuario…"
          />
        </div>
      </header>

      <Tabla
        datos={visualizadoresFiltrados}
        columnas={columnas}
        cargando={isLoading}
        vacio="No hay usuarios visualizadores registrados"
      />
    </section>
  )
}