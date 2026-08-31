import styles from './LoginTabs.module.css'

export default function LoginTabs({ tab, setTab }) {

    const cambiarTab = (t: 'login'|'registro') => { setTab(t) }; 

    return (
        <div className={styles['card-tabs']}>
            <button className={`${styles['tab-btn']} ${tab==='login'?styles['active']:''}`} onClick={()=>cambiarTab('login')}>Iniciar sesión</button>
            <button
              //className={styles['tab-btn']}
              //disabled
              className={`${styles['tab-btn']} ${tab==='registro'?styles['active']:''}`} onClick={()=>cambiarTab('registro')}
              //title="El registro está cerrado por el administrador"
              //style={{ opacity: 0.45, cursor: 'not-allowed', position: 'relative' }}
            >
              Crear cuenta
              <span style={{
                fontSize: 9, fontFamily: 'DM Mono,monospace', fontWeight: 700,
                background: 'var(--gris)', color: '#fff', padding: '1px 5px',
                borderRadius: 4, marginLeft: 5, letterSpacing: '.04em',
              }}>ABIERTO</span>
            </button>
          </div>
    );

}