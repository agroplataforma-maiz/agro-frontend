
import LoginTabs from "./LoginTabs";
import LoginForm from "./LoginForm";
import RegistroForm from "./RegistroForm";

import styles from './LoginForm.module.css'

type Props = {
  tab: 'login' | 'registro'
  setTab: (t: 'login' | 'registro') => void
  onLoginStart: () => void
}

export default function LoginCard({
    tab,
    setTab,
    onLoginStart
}: Props) {

    return (
        <div className={styles['card']} id="card-auth">
            <LoginTabs tab={tab} setTab={setTab} />
            {tab === 'login' ? (
                <div className={`${styles['panel']} ${styles['active']}`} id="panel-login">
                    <LoginForm onLoginStart={onLoginStart} />
                </div>
            ) : (
                <div className={`${styles['panel']} ${styles['active']}`} id="panel-registro">
                    <RegistroForm />
                </div>
            )
            }
            <div className={styles['card-footer']}>
                <span className={styles['footer-txt']}>PEE-2025-G-369 · IT Ciudad Valles</span>
            </div>
        </div>
    );
}







