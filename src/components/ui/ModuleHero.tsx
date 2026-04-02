'use client'

import React from 'react'
import styles from './ModuleHero.module.css'

interface HeroStat {
  label: string
  value: React.ReactNode
}

interface ModuleHeroProps {
  eyebrow: string
  title: React.ReactNode
  description: string
  stats?: HeroStat[]
  actions?: React.ReactNode
}

export default function ModuleHero({ eyebrow, title, description, stats = [], actions }: ModuleHeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
      </div>
      {(stats.length > 0 || actions) && (
        <div className={styles.side}>
          {stats.length > 0 && (
            <div className={styles.stats}>
              {stats.map((stat) => (
                <div key={stat.label} className={styles.stat}>
                  <span className={styles.statValue}>{stat.value}</span>
                  <span className={styles.statLabel}>{stat.label}</span>
                </div>
              ))}
            </div>
          )}
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
    </section>
  )
}