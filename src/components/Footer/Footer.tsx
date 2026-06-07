// Libs
import React, { useEffect, useState } from 'react'
// Styles
import styles from './Footer.module.scss'

interface FooterProps {
  // When the lightbox is open, the dock retreats below the fold so the enlarged
  // photo owns the stage.
  hidden?: boolean
  // Owner-specific content (the project dock, donate action, etc.) composed into
  // the shell. The Footer itself stays generic — see src/site/Dock for meow's.
  children?: React.ReactNode
}

// Base-library container: a fixed, centered, bottom-anchored shell with a bottom
// scrim, an orchestrated slide-in entrance, and the lightbox "retreat off-screen
// + crossfade" behavior (driven by `hidden`). It carries no project/donate/i18n
// knowledge — the owner composes that in via `children`.
const Footer = ({ hidden = false, children }: FooterProps) => {
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
        {children}
      </footer>
    </>
  )
}

export default Footer
