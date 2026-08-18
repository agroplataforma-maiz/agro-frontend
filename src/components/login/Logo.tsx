import styles from './Logo.module.css'

export default function Logo() {

    return (
        <div className={styles['logo-area']}>
            <span className={styles['logo-ico']}>🌽</span>
            <span className={styles['logo-titulo']}>Agroplataforma<br /><em style={{ fontStyle: 'italic', fontWeight: 700 }}>Maíz Nativo</em></span>
            <div className={styles['logo-sub'] + ' ' + styles['subtitleContrast']}>Huasteca Potosina · IT Ciudad Valles</div>
        </div>
    );
}