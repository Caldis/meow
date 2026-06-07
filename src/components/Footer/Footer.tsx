// Libs
import React, { useContext, useEffect, useState } from 'react'
// Styles
import styles from './Footer.module.scss'
// Components
import DonateModal from '../Donate'
// Utils
import { AppContext } from 'App.context'
import { track } from 'utils/analytics'
import { t } from 'utils/i18n'

const PUB = process.env.PUBLIC_URL || ''

interface Project {
  id: string
  name: string
  taglineKey: string
  icon: string
  href: string
  // Optional shrink for full-bleed logos that lack their own inner padding, so
  // they sit with the same breathing room as the padded app-style icons.
  iconScale?: number
  // Optional extra small line in the tooltip (i18n key).
  noteKey?: string
}

const PROJECTS: Project[] = [
  {
    id: 'mos',
    name: 'Mos',
    taglineKey: 'mos.tagline',
    icon: `${PUB}/projects/mos.png`,
    noteKey: 'mos.note',
    // Official site. GA4-standard UTM tags so Mos's analytics attributes the
    // visit to meow (rel="noreferrer" strips the HTTP Referer, so the source is
    // carried in the URL): source = origin host, medium = referral, campaign =
    // the cross-promo initiative, content = this placement.
    href: 'https://mos.caldis.me/?utm_source=meow.caldis.me&utm_medium=referral&utm_campaign=cross-promo&utm_content=footer-dock',
  },
  {
    id: 'zmage',
    name: 'Zmage',
    taglineKey: 'zmage.tagline',
    icon: `${PUB}/projects/zmage.png`,
    // The rz logo fills its canvas edge-to-edge; shrink it for even spacing.
    iconScale: 0.8,
    noteKey: 'zmage.note',
    // Same GA4-standard UTM attribution as Mos above.
    href: 'https://zmage.caldis.me/?utm_source=meow.caldis.me&utm_medium=referral&utm_campaign=cross-promo&utm_content=footer-dock',
  },
  {
    id: 'meow',
    name: 'Meow',
    taglineKey: 'meow.tagline',
    icon: `${PUB}/projects/meow.webp`,
    // The cat photo is full-bleed; shrink it so it sits with the same inner
    // breathing room as Mos's padded logo and the scaled-down Zmage mark.
    iconScale: 0.8,
    noteKey: 'meow.note',
    // This project's own repo (GitHub — no analytics, so no UTM tags).
    href: 'https://github.com/Caldis/meow',
  },
]

const HeartIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 20.7 4.3 13a5.1 5.1 0 0 1 0-7.2 5 5 0 0 1 7.1 0l.6.6.6-.6a5 5 0 0 1 7.1 0 5.1 5.1 0 0 1 0 7.2L12 20.7Z" />
  </svg>
)

interface FooterProps {
  // When the lightbox is open, the dock retreats below the fold so the enlarged
  // photo owns the stage.
  hidden?: boolean
}

const Footer = ({ hidden = false }: FooterProps) => {
  const { lang } = useContext(AppContext)
  const [donateOpen, setDonateOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Slide the dock up shortly after first paint (one orchestrated entrance).
  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 450)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <div className={`${styles.scrim}${hidden ? ` ${styles.scrimHidden}` : ''}`} aria-hidden="true" />

      <footer className={`${styles.footer}${mounted ? ` ${styles.footerIn}` : ''}${hidden ? ` ${styles.footerHidden}` : ''}`}>
        <p className={styles.invite}>{t('dock.invite', lang)}</p>
        <nav className={styles.dock} aria-label="项目与支持">
          <ul className={styles.apps}>
            {PROJECTS.map((p) => {
              const tagline = t(p.taglineKey, lang)
              return (
              <li className={styles.appItem} key={p.id}>
                <a
                  className={styles.app}
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${p.name} · ${tagline}`}
                  onClick={() => track('click_project', { project: p.id })}
                >
                  <span className={styles.tip}>
                    <strong>{p.name}</strong>
                    <small>{tagline}</small>
                    {p.noteKey ? <small className={styles.tipNote}>{t(p.noteKey, lang)}</small> : null}
                  </span>
                  <img className={styles.appIcon} src={p.icon} alt={p.name} draggable={false} style={p.iconScale ? { transform: `scale(${p.iconScale})` } : undefined} />
                  <span className={styles.gloss} aria-hidden="true" />
                </a>
              </li>
              )
            })}
          </ul>

          <span className={styles.sep} aria-hidden="true" />

          <button
            className={`${styles.app} ${styles.donate}`}
            type="button"
            onClick={() => { setDonateOpen(true); track('open_donate') }}
            aria-label={t('donate.feed', lang)}
          >
            <span className={styles.tip}>
              <strong>{t('donate.feed', lang)}</strong>
              <small>{t('donate.snack', lang)}</small>
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
