// Libs
import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
// Styles
import styles from './Donate.module.scss'

// Donation modal — structure/visuals ported from the Mos website donation
// module (D:/Code/Mos/website) into meow's CRA + SCSS-module stack, but the
// copy is meow's own ("喂胖大咪", cat-themed). The mainland QR is only shown to
// Simplified-Chinese visitors. PayPal/BMC reach the same creator.

const PUB = process.env.PUBLIC_URL || ''
const PAYPAL_URL = 'https://www.paypal.me/mosapp'
const BMC_URL = 'https://buymeacoffee.com/caldis'

type QrChannel = 'alipay' | 'wechat'
const QR_SOURCES: Record<QrChannel, string> = {
  alipay: `${PUB}/donate/alipay-qr.png`,
  wechat: `${PUB}/donate/wechat-qr.png`,
}
const CHANNEL_LABEL: Record<QrChannel, string> = { alipay: '支付宝', wechat: '微信' }

// Alipay/WeChat are mainland-only channels — only surface the QR for
// Simplified-Chinese visitors (zh-Hans / zh-CN / zh-SG …), not Traditional or
// other locales.
const isSimplifiedChinese = () => {
  const lang = (navigator.language || '').toLowerCase()
  return lang.startsWith('zh') && !/(hant|tw|hk|mo)/.test(lang)
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
}

const INTERNATIONAL = [
  { href: PAYPAL_URL, label: 'PayPal', icon: `${PUB}/donate/paypal.webp`, h: 18 },
  { href: BMC_URL, label: 'Buy Me a Coffee', icon: `${PUB}/donate/bmc.svg`, h: 26 },
]

export const DonateModal = ({ open, onClose }: Props) => {
  const [channel, setChannel] = useState<QrChannel>('alipay')
  const showCnQr = isSimplifiedChinese()

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

  if (!open) return null

  return createPortal(
    <div
      className={styles.backdrop}
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-label="喂胖大咪">

        <header className={styles.header}>
          <h3 className={styles.title}>喂胖大咪</h3>
          <button className={styles.close} type="button" onClick={onClose} aria-label="关闭对话框">
            <CloseIcon />
          </button>
        </header>

        <div className={styles.body}>
          <p className={styles.intro}>给大咪加餐</p>

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
                      onClick={() => setChannel(ch)}
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
