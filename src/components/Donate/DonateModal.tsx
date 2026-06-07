// Libs
import React, { useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
// Styles
import styles from './Donate.module.scss'
// Utils
import { AppContext } from 'App.context'
import { track } from 'utils/analytics'
import { t } from 'utils/i18n'

// Donation modal — structure/visuals ported from the Mos website donation
// module (D:/Code/Mos/website) into meow's CRA + SCSS-module stack, but the
// copy is meow's own ("喂胖大咪", cat-themed). The mainland QR is only shown to
// Simplified-Chinese visitors. PayPal/BMC reach the same creator.

const PUB = process.env.PUBLIC_URL || ''

type QrChannel = 'alipay' | 'wechat'
const CHANNEL_LABEL: Record<QrChannel, string> = { alipay: '支付宝', wechat: '微信' }

// Alipay/WeChat are mainland-only channels — only surface the QR for
// Simplified-Chinese visitors (zh-Hans / zh-CN / zh-SG …), not Traditional or
// other locales.
const isSimplifiedChinese = (lang: string) => {
  const l = (lang || '').toLowerCase()
  return l.startsWith('zh') && !/(hant|tw|hk|mo)/.test(l)
}

const ArrowIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17 17 7M9 7h8v8" />
  </svg>
)

const CloseIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
)

interface Props {
  open: boolean
  onClose: () => void
  // Donate targets — supplied by the owner via src/config/site.config.ts so this
  // component stays generic (no hardcoded accounts).
  paypalUrl: string
  buyMeACoffeeUrl: string
  alipayQr: string  // fully-resolved public URL
  wechatQr: string
}

export const DonateModal = ({ open, onClose, paypalUrl, buyMeACoffeeUrl, alipayQr, wechatQr }: Props) => {
  const { lang } = useContext(AppContext)
  const [channel, setChannel] = useState<QrChannel>('alipay')
  const showCnQr = isSimplifiedChinese(lang)

  const INTERNATIONAL = [
    { id: 'paypal', href: paypalUrl, label: 'PayPal', icon: `${PUB}/donate/paypal.webp`, h: 18 },
    { id: 'bmc', href: buyMeACoffeeUrl, label: 'Buy Me a Coffee', icon: `${PUB}/donate/bmc.svg`, h: 26 },
  ]
  const QR_SOURCES: Record<QrChannel, string> = { alipay: alipayQr, wechat: wechatQr }

  // Keep the modal mounted through its exit animation: when `open` flips false
  // we play the closing animation, then unmount after it finishes.
  const EXIT_MS = 280
  const [mounted, setMounted] = useState(open)
  const [closing, setClosing] = useState(false)
  const exitTimerRef = useRef<number>(0)

  useEffect(() => {
    if (open) {
      if (exitTimerRef.current) { clearTimeout(exitTimerRef.current); exitTimerRef.current = 0 }
      setMounted(true)
      setClosing(false)
    } else if (mounted) {
      setClosing(true)
      exitTimerRef.current = window.setTimeout(() => {
        setMounted(false)
        setClosing(false)
        exitTimerRef.current = 0
      }, EXIT_MS)
    }
  }, [open, mounted])

  useEffect(() => () => { if (exitTimerRef.current) clearTimeout(exitTimerRef.current) }, [])

  // Esc to close + body scroll lock while open
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!mounted) return null

  return createPortal(
    <div
      className={`${styles.backdrop}${closing ? ` ${styles.closing}` : ''}`}
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={`${styles.dialog}${closing ? ` ${styles.closing}` : ''}`} role="dialog" aria-modal="true" aria-label={t('donate.feed', lang)}>

        <header className={styles.header}>
          <h3 className={styles.title}>{t('donate.feed', lang)}</h3>
          <button className={styles.close} type="button" onClick={onClose} aria-label={t('donate.close', lang)}>
            <CloseIcon />
          </button>
        </header>

        <div className={styles.body}>
          <p className={styles.intro}>{t('donate.snack', lang)}</p>

          {/* International, link-based channels */}
          <div className={styles.channels}>
            {INTERNATIONAL.map((c) => (
              <a
                key={c.href}
                className={styles.channel}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={c.label}
                onClick={() => track('click_donate_channel', { channel: c.id })}
              >
                <img className={styles.channelLogo} src={c.icon} alt={c.label} style={{ height: c.h }} />
                <span className={styles.channelArrow}><ArrowIcon /></span>
              </a>
            ))}
          </div>

          {/* Alipay / WeChat QR — mainland-only, shown to Simplified-Chinese visitors */}
          {showCnQr && (
            <>
              {/* Region divider */}
              <div className={styles.divider} aria-hidden="true">
                <span className={styles.hairline} />
                <span className={styles.region}>中国大陆</span>
                <span className={styles.hairline} />
              </div>

              {/* Scan-to-tip with channel toggle */}
              <div className={styles.qrSection}>
                <div className={styles.toggle} role="tablist">
                  {(['alipay', 'wechat'] as QrChannel[]).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      role="tab"
                      aria-selected={channel === ch}
                      className={`${styles.toggleBtn}${channel === ch ? ` ${styles.toggleActive}` : ''}`}
                      onClick={() => { setChannel(ch); track('select_qr', { channel: ch }) }}
                    >
                      <img src={`${PUB}/donate/${ch}-icon.webp`} alt="" width={16} height={16} />
                      <span>{CHANNEL_LABEL[ch]}</span>
                    </button>
                  ))}
                </div>

                <div className={styles.qrCard}>
                  <img key={channel} className={styles.qr} src={QR_SOURCES[channel]} alt={CHANNEL_LABEL[channel]} width={176} height={176} />
                </div>

                <p className={styles.scanHint}>打开{CHANNEL_LABEL[channel]}扫一扫</p>
              </div>
            </>
          )}
        </div>

      </div>
    </div>,
    document.body
  )
}

export default DonateModal
