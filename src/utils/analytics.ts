// Minimal GA4 event helper. Safely no-ops when gtag is unavailable
// (ad blockers, local dev without the tag, SSR, etc.).
type Gtag = (command: 'event', eventName: string, params?: Record<string, unknown>) => void

export const track = (event: string, params?: Record<string, unknown>) => {
  if (typeof window === 'undefined') return
  const gtag = (window as unknown as { gtag?: Gtag }).gtag
  if (typeof gtag === 'function') {
    gtag('event', event, params)
  }
}
