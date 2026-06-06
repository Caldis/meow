// Libs
import React, { useEffect, useState } from 'react'
// Styles
import styles from './Footer.module.scss'
// Components
import DonateModal from '../Donate'

const PUB = process.env.PUBLIC_URL || ''

interface Project {
  id: string
  name: string
  tagline: string
  icon: string
  href: string
}

const PROJECTS: Project[] = [
  {
    id: 'mos',
    name: 'Mos',
    tagline: '让鼠标变得顺滑',
    icon: `${PUB}/projects/mos.png`,
    href: 'https://github.com/Caldis/Mos',
  },
]

const HeartIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 20.7 4.3 13a5.1 5.1 0 0 1 0-7.2 5 5 0 0 1 7.1 0l.6.6.6-.6a5 5 0 0 1 7.1 0 5.1 5.1 0 0 1 0 7.2L12 20.7Z" />
  </svg>
)

const Footer = () => {
  const [donateOpen, setDonateOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Slide the dock up shortly after first paint (one orchestrated entrance).
  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 450)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <div className={styles.scrim} aria-hidden="true" />

      <footer className={`${styles.footer}${mounted ? ` ${styles.footerIn}` : ''}`}>
        <nav className={styles.dock} aria-label="项目与支持">
          <ul className={styles.apps}>
            {PROJECTS.map((p) => (
              <li className={styles.appItem} key={p.id}>
                <a
                  className={styles.app}
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${p.name} · ${p.tagline}`}
                >
                  <span className={styles.tip}>
                    <strong>{p.name}</strong>
                    <small>{p.tagline}</small>
                  </span>
                  <img className={styles.appIcon} src={p.icon} alt={p.name} draggable={false} />
                  <span className={styles.gloss} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>

          <span className={styles.sep} aria-hidden="true" />

          <button
            className={`${styles.app} ${styles.donate}`}
            type="button"
            onClick={() => setDonateOpen(true)}
            aria-label="喂胖大咪"
          >
            <span className={styles.tip}>
              <strong>喂胖大咪</strong>
              <small>给大咪加餐</small>
            </span>
            <span className={styles.donateGlyph}><HeartIcon /></span>
            <span className={styles.gloss} aria-hidden="true" />
          </button>
        </nav>
      </footer>

      <DonateModal open={donateOpen} onClose={() => setDonateOpen(false)} />
    </>
  )
}

export default Footer
