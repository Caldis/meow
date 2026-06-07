// Libs
import React, { useCallback, useRef, useState } from 'react'
// Styles
import styles from './ThemeToggle.module.scss'
// Utils
import { track } from 'utils/analytics'

// Light/dark switch with a circular reveal that sweeps the background from the old
// theme to the new — the same idea as `react-theme-switch-animation`'s CIRCLE mode,
// but WITHOUT the View Transitions API (a single VT snapshot on this image-heavy
// page takes ~1.8s and freezes the toggle).
//
// The trick that kills the "content void": the photos are pixel-identical in both
// themes — only the background + chrome COLORS change. So we don't snapshot the
// page (expensive); we slot the wipe overlay BETWEEN the page background and the
// photos. It paints the OLD background with a growing transparent hole at the
// button; the hole reveals the NEW page background underneath. Because the photos
// sit ABOVE the overlay, they stay visible the whole time — no void in the
// un-revealed region. The chrome above (card mattes, text) crossfades via plain CSS
// color transitions.
//
// Stacking: the overlay is appended to <body> at z-index:0 (paints above the body
// background) while `.gallery` is raised to z-index:1 (so the card grid paints
// above the overlay). That pairing is what creates the slot — see Gallery.module
// .scss `.gallery { z-index: 1 }`. Falls back to an instant switch where the
// animatable custom property / mask isn't available, or motion is reduced.

const DURATION = 620
const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'

// Register the radius custom property once so WAAPI can interpolate it.
let rippleSupported: boolean | null = null
const ensureRippleProp = (): boolean => {
  if (rippleSupported !== null) return rippleSupported
  const cssApi = typeof CSS !== 'undefined' ? (CSS as unknown as { registerProperty?: (d: object) => void }) : undefined
  if (!cssApi || typeof cssApi.registerProperty !== 'function') { rippleSupported = false; return false }
  try {
    cssApi.registerProperty({ name: '--ripple-r', syntax: '<length>', inherits: false, initialValue: '0px' })
  } catch (e) { /* already registered (HMR / repeat) — still fine */ }
  rippleSupported = true
  return true
}

interface Props {
  // Fade out while the lightbox is open (matches the header/dock retreat).
  hidden?: boolean
}

// One morphing glyph for both states (no instant icon swap). Sun = full disc +
// extended rays; Moon = the same disc with a mask circle slid over it to bite a
// crescent, while the rays retract into the disc and fade. Driving it all with CSS
// transitions on the `light` class lets the morph run in step with the page wipe.
const ThemeIcon = ({ light }: { light: boolean }) => (
  <svg
    className={`${styles.icon}${light ? ` ${styles.iconMoon}` : ''}`}
    aria-hidden="true"
    viewBox="0 0 24 24"
  >
    <mask id="theme-crescent" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
      <rect x="0" y="0" width="24" height="24" fill="#fff" />
      {/* Parked off the disc in sun mode; slides over it in moon mode to carve the crescent. */}
      <circle className={styles.bite} cx="12" cy="12" r="7" fill="#000" />
    </mask>
    <circle className={styles.disc} cx="12" cy="12" r="6" fill="currentColor" mask="url(#theme-crescent)" />
    <g className={styles.rays} stroke="currentColor" strokeWidth={1.7} strokeLinecap="round">
      <line x1="12" y1="4.2" x2="12" y2="1.8" />
      <line x1="12" y1="19.8" x2="12" y2="22.2" />
      <line x1="4.2" y1="12" x2="1.8" y2="12" />
      <line x1="19.8" y1="12" x2="22.2" y2="12" />
      <line x1="17.5" y1="6.5" x2="19.2" y2="4.8" />
      <line x1="6.5" y1="17.5" x2="4.8" y2="19.2" />
      <line x1="6.5" y1="6.5" x2="4.8" y2="4.8" />
      <line x1="17.5" y1="17.5" x2="19.2" y2="19.2" />
    </g>
  </svg>
)

const ThemeToggle = ({ hidden = false }: Props) => {
  const btnRef = useRef<HTMLButtonElement>(null)
  // Seed from whatever the no-flash <head> script already applied.
  const [isLight, setIsLight] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('light')
  )

  // Flip the theme class (drives every CSS variable) and remember the choice.
  const applyTheme = useCallback((light: boolean) => {
    document.documentElement.classList.toggle('light', light)
    setIsLight(light)
    try { localStorage.setItem('meow-theme', light ? 'light' : 'dark') } catch (e) { /* ignore */ }
  }, [])

  const handleToggle = useCallback(() => {
    const root = document.documentElement
    const next = !root.classList.contains('light')
    track('toggle_theme', { to: next ? 'light' : 'dark' })

    const btn = btnRef.current
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!btn || reduce || typeof btn.animate !== 'function' || !ensureRippleProp()) {
      applyTheme(next)
      return
    }

    // Capture the OLD background EXACTLY — both the radial-gradient and its color.
    // Using just backgroundColor (the gradient's darker edge value) would make the
    // overlay a flat tone that doesn't match the page's lighter center, so the
    // background would visibly jump when the overlay appears (the flicker).
    const bodyBg = getComputedStyle(document.body)
    const oldBgColor = bodyBg.backgroundColor
    const oldBgImage = bodyBg.backgroundImage
    const { top, left, width, height } = btn.getBoundingClientRect()
    const x = left + width / 2
    const y = top + height / 2
    const maxRadius = Math.ceil(Math.max(
      Math.hypot(x, y),
      Math.hypot(window.innerWidth - x, y),
      Math.hypot(x, window.innerHeight - y),
      Math.hypot(window.innerWidth - x, window.innerHeight - y),
    ))

    document.querySelectorAll('[data-theme-ripple]').forEach((n) => n.parentNode?.removeChild(n))
    const overlay = document.createElement('div')
    overlay.setAttribute('data-theme-ripple', '')
    // Overlay = the OLD background, with a transparent hole of radius --ripple-r at
    // the button (soft 2px edge to avoid an aliasing shimmer). The hole starts at 0
    // (overlay fully covers the just-applied NEW background), then grows so the new
    // background sweeps in. z-index:0 sits ABOVE the page background; `.gallery`
    // (z-index:1) keeps the photos on top, so they never disappear — only the
    // background between/around them wipes.
    const mask = `radial-gradient(circle at ${x}px ${y}px, transparent calc(var(--ripple-r) - 1px), #000 calc(var(--ripple-r) + 1px))`
    overlay.style.cssText = `position:fixed;inset:0;z-index:0;pointer-events:none;--ripple-r:0px;`
    overlay.style.backgroundColor = oldBgColor
    if (oldBgImage && oldBgImage !== 'none') overlay.style.backgroundImage = oldBgImage
    overlay.style.setProperty('-webkit-mask', mask)
    overlay.style.setProperty('mask', mask)
    document.body.appendChild(overlay)

    // New theme is applied while fully hidden behind the overlay, so no flash.
    applyTheme(next)

    const anim = overlay.animate(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [{ '--ripple-r': '0px' } as any, { '--ripple-r': `${maxRadius}px` } as any],
      { duration: DURATION, easing: EASING },
    )
    const finish = () => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay) }
    anim.onfinish = finish
    anim.oncancel = finish
  }, [applyTheme])

  return (
    <button
      ref={btnRef}
      type="button"
      className={`${styles.toggle}${hidden ? ` ${styles.toggleHidden}` : ''}`}
      onClick={handleToggle}
      aria-label={isLight ? '切换到深色模式' : '切换到浅色模式'}
    >
      <ThemeIcon light={isLight} />
    </button>
  )
}

export default ThemeToggle
