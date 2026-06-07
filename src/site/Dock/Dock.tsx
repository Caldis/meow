// Libs
import React, { useContext, useState } from 'react'
// Styles
import styles from './Dock.module.scss'
// Components
import DonateModal from 'components/Donate'
// Config (owner personalization)
import { siteConfig, buildProjectHref } from 'config/site.config'
// Utils
import { AppContext } from 'App.context'
import { track } from 'utils/analytics'
import { t } from 'utils/i18n'

// Owner customization layer — the meow-specific dock content composed into the
// base-library Footer container. All subject-specific values (which projects to
// promote, the donate targets) come from src/config/site.config.ts, so a fork
// edits that one file rather than this component.

const PUB = process.env.PUBLIC_URL || ''

const HeartIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 20.7 4.3 13a5.1 5.1 0 0 1 0-7.2 5 5 0 0 1 7.1 0l.6.6.6-.6a5 5 0 0 1 7.1 0 5.1 5.1 0 0 1 0 7.2L12 20.7Z" />
  </svg>
)

const Dock = () => {
  const { lang } = useContext(AppContext)
  const [donateOpen, setDonateOpen] = useState(false)

  const { dock, donate } = siteConfig

  // Nothing to show if the owner enabled neither the cross-promo dock nor donate.
  if (!dock.enabled && !donate.enabled) return null

  return (
    <>
      {dock.enabled && <p className={styles.invite}>{t('dock.invite', lang)}</p>}
      <nav className={styles.dock} aria-label="项目与支持">
        {dock.enabled && (
          <ul className={styles.apps}>
            {dock.projects.map((p) => {
              const tagline = t(p.taglineKey, lang)
              return (
              <li className={styles.appItem} key={p.id}>
                <a
                  className={styles.app}
                  href={buildProjectHref(p)}
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
                  <img className={styles.appIcon} src={`${PUB}/${p.icon}`} alt={p.name} draggable={false} style={p.iconScale ? { transform: `scale(${p.iconScale})` } : undefined} />
                  <span className={styles.gloss} aria-hidden="true" />
                </a>
              </li>
              )
            })}
          </ul>
        )}

        {dock.enabled && donate.enabled && <span className={styles.sep} aria-hidden="true" />}

        {donate.enabled && (
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
        )}
      </nav>

      {donate.enabled && (
        <DonateModal
          open={donateOpen}
          onClose={() => setDonateOpen(false)}
          paypalUrl={donate.paypalUrl}
          buyMeACoffeeUrl={donate.buyMeACoffeeUrl}
          alipayQr={`${PUB}/${donate.alipayQr}`}
          wechatQr={`${PUB}/${donate.wechatQr}`}
        />
      )}
    </>
  )
}

export default Dock
