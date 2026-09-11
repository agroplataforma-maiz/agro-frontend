
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { GET } from '@/lib/api'
import type { Usuario } from '@/types'

import Tabla, { type Columna } from '@/components/ui/Tabla'
import Button from '@/components/ui/Button'
import SearchInput from '@/components/ui/SearchInput'
import ModalVisualizador from '@/components/productores/ModalVisualizador'
import styles from '@/app/productores/productores.module.css'

export default function UsuariosVisualizadoresPanel() {
  const [busqueda, setBusqueda] = useState('')
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)

  // GET /productores/usuarios-visualizadores
  const {
    data: usuariosVisualizadores = [],
    isLoading,
  } = useQuery<Usuario[]>({
    queryKey: ['usuarios-visualizadores'],
    queryFn: () => GET('/productores/usuarios-visualizadores'),
  })

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

  function abrirFormulario(usuario: Usuario) {
    setUsuarioSeleccionado(usuario)
    setModalAbierto(true)
  }

  function cerrarFormulario() {
    setModalAbierto(false)
    setUsuarioSeleccionado(null)
  }

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
    <>
      <section className={styles.panel}>
        <header className={styles.panelHeader}>
          <div>
            <h2>Usuarios visualizadores</h2>
            <p>
              Usuarios visualizadores que pueden darse de alta como productores.
            </p>
          </div>

          <SearchInput
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar usuario..."
          />
        </header>

        <Tabla
          datos={visualizadoresFiltrados}
          columnas={columnas}
          cargando={isLoading}
          vacio="No hay usuarios visualizadores registrados"
          acciones={u => (
            <Button
              variante="primario"
              tamaño="sm"
              onClick={() => abrirFormulario(u)}
            >
              Dar de alta
            </Button>
          )}
        />
      </section>

      {modalAbierto && usuarioSeleccionado && (
        <ModalVisualizador
          usuario={usuarioSeleccionado}
          abierto={modalAbierto}
          onClose={cerrarFormulario}
        />
      )}
    </>
  )
}
