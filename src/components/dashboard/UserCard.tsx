import React from 'react'
import styles from './UserCard.module.css'

interface UserCardProps {
  initials: string
  name: string
  role: string
  color: string
}

export const UserCard: React.FC<UserCardProps> = ({ initials, name, role, color }) => (
  <article className={styles.card}>
    <div className={styles.avatar} style={{ background: color }} aria-hidden="true">
      {initials}
    </div>
    <div className={styles.info}>
      <span className={styles.name}>{name}</span>
      <span className={styles.role}>{role}</span>
    </div>
  </article>
)
