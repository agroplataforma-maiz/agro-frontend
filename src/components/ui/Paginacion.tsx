// src/components/ui/Paginacion.tsx
// Componente de paginación reutilizable
// Migrado de catPaginar() + catRenderPaginacion() + renderPaginacion() en los JS originales

import styles from './Paginacion.module.css'

interface Props {
  paginaActual: number
  totalPaginas: number
  onCambiar: (pagina: number) => void
  totalItems?: number
  itemsPorPagina?: number
}

export default function Paginacion({
  paginaActual,
  totalPaginas,
  onCambiar,
  totalItems,
  itemsPorPagina,
}: Props) {
  if (totalPaginas <= 1) return null

  // Genera el rango de páginas visibles (máx 5 botones)
  const rango: (number | '...')[] = []
  if (totalPaginas <= 7) {
    for (let i = 1; i <= totalPaginas; i++) rango.push(i)
  } else {
    rango.push(1)
    if (paginaActual > 3) rango.push('...')
    for (
      let i = Math.max(2, paginaActual - 1);
      i <= Math.min(totalPaginas - 1, paginaActual + 1);
      i++
    ) rango.push(i)
    if (paginaActual < totalPaginas - 2) rango.push('...')
    rango.push(totalPaginas)
  }

  const inicio = totalItems && itemsPorPagina
    ? (paginaActual - 1) * itemsPorPagina + 1
    : null
  const fin = totalItems && itemsPorPagina
    ? Math.min(paginaActual * itemsPorPagina, totalItems)
    : null

  return (
    <div className={styles.wrap}>
      {totalItems && (
        <span className={styles.info}>
          {inicio}–{fin} de {totalItems}
        </span>
      )}

      <div className={styles.controles}>
        <button
          className={styles.btn}
          onClick={() => onCambiar(1)}
          disabled={paginaActual === 1}
          aria-label="Primera página"
        >
          «
        </button>

        <button
          className={styles.btn}
          onClick={() => onCambiar(paginaActual - 1)}
          disabled={paginaActual === 1}
          aria-label="Página anterior"
        >
          ‹
        </button>

        {rango.map((item, i) =>
          item === '...' ? (
            <span key={`e${i}`} className={styles.elipsis}>…</span>
          ) : (
            <button
              key={item}
              className={`${styles.btn} ${item === paginaActual ? styles.activo : ''}`}
              onClick={() => onCambiar(item as number)}
              aria-current={item === paginaActual ? 'page' : undefined}
            >
              {item}
            </button>
          )
        )}

        <button
          className={styles.btn}
          onClick={() => onCambiar(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
          aria-label="Página siguiente"
        >
          ›
        </button>

        <button
          className={styles.btn}
          onClick={() => onCambiar(totalPaginas)}
          disabled={paginaActual === totalPaginas}
          aria-label="Última página"
        >
          »
        </button>
      </div>
    </div>
  )
}