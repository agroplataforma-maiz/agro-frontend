// src/components/ui/Tabla.tsx
// Componente reutilizable que reemplaza:
//   renderTabla() en catalogos.js
//   renderLista() en productores.js
//   renderUsuariosGrid() en dashboard.js
'use client'

import styles from './Tabla.module.css'
import StateView from './StateView'

export interface Columna<T> {
  key: keyof T | string
  header: string
  render?: (row: T, index?: number) => React.ReactNode
  width?: string
  nowrap?: boolean
  sortable?: boolean
  hideOnMobile?: boolean
  hideOnTablet?: boolean
}

interface TablaProps<T extends { id: number | string }> {
  datos: T[]
  columnas: Columna<T>[]
  onRowClick?: (row: T) => void
  cargando?: boolean
  vacio?: string
  acciones?: (row: T) => React.ReactNode
  sortCol?: string
  sortDir?: 'asc' | 'desc'
  onSort?: (col: string) => void
  infoText?: string
}

export default function Tabla<T extends { id: number | string }>({
  datos,
  columnas,
  onRowClick,
  cargando = false,
  vacio = 'Sin resultados',
  acciones,
  sortCol,
  sortDir,
  onSort,
  infoText,
}: TablaProps<T>) {
  if (cargando) {
    return <StateView variant="loading" title="Cargando tabla" message="Estamos preparando la información para ti." />
  }

  if (!datos.length) {
    return <StateView variant="empty" title="Sin resultados" message={vacio} />
  }

  return (
    <div className={styles.tableWrap}>
      {(infoText) && (
        <div className={styles.tableInfo}>
          <span className={styles.tableCount}>{infoText}</span>
          {sortCol && <span className={styles.sortInfo}>Ordenado por: {sortCol} {sortDir === 'asc' ? '↑' : '↓'}</span>}
        </div>
      )}
      <table className={styles.tabla}>
        <thead>
          <tr className={styles.theadTr}>
            {columnas.map(col => {
              const isSorted = sortCol === String(col.key)
              const canSort = col.sortable && onSort
              return (
                <th
                  key={String(col.key)}
                  className={`${styles.th}${canSort ? ' ' + styles.thSortable : ''}${isSorted ? ' ' + styles.thSorted : ''}${col.hideOnMobile ? ' ' + styles.colHideMobile : ''}${col.hideOnTablet ? ' ' + styles.colHideTablet : ''}`}
                  style={{ width: col.width, minWidth: col.width }}
                  onClick={canSort ? () => onSort(String(col.key)) : undefined}
                >
                  {col.header}
                  {canSort && <span className={styles.sortIcon}>{isSorted ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕'}</span>}
                </th>
              )
            })}
            {acciones && <th className={styles.th}>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {datos.map((row, index) => (
            <tr
              key={row.id}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={onRowClick ? styles.tbodyTr + ' ' + styles.clickable : styles.tbodyTr}
            >
              {columnas.map(col => (
                <td key={String(col.key)} className={`${styles.td}${col.hideOnMobile ? ' ' + styles.colHideMobile : ''}${col.hideOnTablet ? ' ' + styles.colHideTablet : ''}`} style={col.nowrap ? { whiteSpace: 'nowrap', width: col.width, minWidth: col.width } : { width: col.width, minWidth: col.width }}>
                  {col.render
                    ? col.render(row, index)
                    : String((row as Record<string, unknown>)[String(col.key)] ?? '—')}
                </td>
              ))}
              {acciones && (
                <td className={styles.tdAcciones} onClick={e => e.stopPropagation()}>
                  {acciones(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
