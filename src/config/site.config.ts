// ─────────────────────────────────────────────────────────────────────────────
// SITE CONFIG — the single place every owner-specific / personalizing value lives.
//
// For a fork: this is the ONE file you edit (plus dropping your photos into
// src/assets). The reusable engine (src/components, src/style, hooks) reads NONE
// of this directly — only the site layer (src/site) and the build consume it.
//
// Everything leak-prone defaults to OFF/empty in `BLANK_SITE_CONFIG` below, so a
// fresh fork never sends donations / analytics / cross-promo clicks to the
// original author. The exported `siteConfig` is THIS site's (大咪) filled-in copy
// and reproduces the live meow.caldis.me behavior exactly.
// ─────────────────────────────────────────────────────────────────────────────

// Build-time primitives live in a JSON sibling so the Node build scripts
// (scripts/build-code.js — CNAME + gtag id injection) and the TS runtime read the
// SAME source. Edit site.config.json to retarget the domain / GA id.
import buildConfig from './site.config.json'

export interface DonateConfig {
  // Master switch. When false, no donate button renders.
  enabled: boolean
  paypalUrl: string
  buyMeACoffeeUrl: string
  // Mainland-only QR images (public-relative, no leading slash). Shown only to
  // Simplified-Chinese visitors.
  alipayQr: string
  wechatQr: string
}

export interface DockProjectConfig {
  id: string
  name: string
  // Base destination URL. UTM tags are appended by the dock when `utm` is true.
  href: string
  // Public-relative icon path, no leading slash (e.g. 'projects/mos.png').
  icon: string
  iconScale?: number
  taglineKey: string
  noteKey?: string
  // Append the shared cross-promo UTM tags to the href (own-repo/self links: false).
  utm?: boolean
}

export interface DockConfig {
  // Master switch. When false, the whole cross-promo dock + invite is hidden.
  enabled: boolean
  projects: DockProjectConfig[]
  // UTM tags appended to projects with `utm: true`. `source` is the site domain.
  utm: { medium: string; campaign: string; content: string }
}

export interface SiteConfig {
  // GA4 measurement id. Empty string → analytics fully disabled. (The id is also
  // injected into public/index.html; keep them in sync — see SETUP docs.)
  ga4MeasurementId: string
  // Custom domain → also used as the UTM `utm_source` for cross-promo links.
  domain: string
  donate: DonateConfig
  dock: DockConfig
}

// Fork-safe defaults: a copy of this with your own subject is the safe starting
// point — nothing reaches the original author.
export const BLANK_SITE_CONFIG: SiteConfig = {
  ga4MeasurementId: '',
  domain: '',
  donate: { enabled: false, paypalUrl: '', buyMeACoffeeUrl: '', alipayQr: '', wechatQr: '' },
  dock: { enabled: false, projects: [], utm: { medium: 'referral', campaign: 'cross-promo', content: 'footer-dock' } },
}

// ─── THIS SITE (大咪 · meow.caldis.me) — reproduces today's exact behavior ───
export const siteConfig: SiteConfig = {
  ga4MeasurementId: buildConfig.gaMeasurementId,
  domain: buildConfig.domain,
  donate: {
    enabled: true,
    paypalUrl: 'https://www.paypal.me/mosapp',
    buyMeACoffeeUrl: 'https://buymeacoffee.com/caldis',
    alipayQr: 'donate/alipay-qr.png',
    wechatQr: 'donate/wechat-qr.png',
  },
  dock: {
    enabled: true,
    utm: { medium: 'referral', campaign: 'cross-promo', content: 'footer-dock' },
    projects: [
      { id: 'mos', name: 'Mos', href: 'https://mos.caldis.me/', icon: 'projects/mos.png', taglineKey: 'mos.tagline', noteKey: 'mos.note', utm: true },
      { id: 'zmage', name: 'Zmage', href: 'https://zmage.caldis.me/', icon: 'projects/zmage.png', iconScale: 0.8, taglineKey: 'zmage.tagline', noteKey: 'zmage.note', utm: true },
      { id: 'meow', name: 'Meow', href: 'https://github.com/Caldis/meow', icon: 'projects/meow.webp', iconScale: 0.8, taglineKey: 'meow.tagline', noteKey: 'meow.note', utm: false },
    ],
  },
}

// Build a project's final href, appending the shared UTM query when opted in.
// Reproduces the previously hardcoded query string exactly.
export const buildProjectHref = (project: DockProjectConfig, cfg: SiteConfig = siteConfig): string => {
  if (!project.utm) return project.href
  const { medium, campaign, content } = cfg.dock.utm
  const q = `utm_source=${cfg.domain}&utm_medium=${medium}&utm_campaign=${campaign}&utm_content=${content}`
  return `${project.href}?${q}`
}
