import styles from './LoginForm.module.css'

export default function Footer() {

    return(
        <footer className={styles['body-footer']}>
        <div className={styles['inst-logos']}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/LOGOTECNM.png" alt="TecNM" title="Tecnológico Nacional de México" height={36} />
          <div className={styles['inst-sep']} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/secihti.png" alt="Secihti" title="Secihti 2025" height={28} />
          <div className={styles['inst-sep']} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/logotec.png" alt="IT Ciudad Valles" title="Instituto Tecnológico de Ciudad Valles" height={36} />
        </div>
      </footer>
    );
}