// src/components/ui/Boton.tsx
// Botón reutilizable con variantes — evita repetir estilos inline
 
import styles from './Button.module.css'
 
type Variante = 'primario' | 'secundario' | 'peligro' | 'ghost'
type Tamaño   = 'sm' | 'md' | 'lg'
 
interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  tamaño?:   Tamaño
  cargando?: boolean
  icono?:    string
}
 
export default function Button({
  variante = 'primario',
  tamaño   = 'md',
  cargando = false,
  icono,
  children,
  disabled,
  className = '',
  ...rest
}: Props) {
  return (
    <button
      className={[styles.btn, styles[variante], styles[tamaño], className].join(' ')}
      disabled={disabled || cargando}
      {...rest}
    >
      {cargando
        ? <span className={styles.spinner} />
        : icono && <span className={styles.icono}>{icono}</span>
      }
      {children}
    </button>
  )
}