// Libs
import React, { useMemo, useState } from 'react'
// Styles
import './App.reset.scss'
import styles from './App.module.scss'
// Components
import Gallery from './components/Gallery'
import Footer from './components/Footer'
// Utils
import { AppContext } from './App.context'
import { useScreenSize } from './App.hook'

function App () {

  // Global
  const screenSize = useScreenSize()
  const isInitialized = useMemo(() => {
    const { width, height } = screenSize
    return !!(width && height)
  }, [screenSize])

  // When the lightbox opens, the top header (inside Gallery) and the bottom dock
  // (Footer, a sibling) both retreat off-frame so the enlarged photo owns the
  // stage. Gallery owns the lightbox state, so it reports the flag up here and we
  // hand it to the Footer.
  const [lightboxOpen, setLightboxOpen] = useState(false)

  // Language override (set from the debug panel; null = follow the browser).
  const [langOverride, setLangOverride] = useState<string | null>(null)

  // Context — memoized so unrelated App re-renders (e.g. the lightbox toggle
  // above) don't churn the value and re-render every context consumer.
  const contextValue = useMemo(() => ({
    // Flags
    isInitialized,
    // Global
    screenSize,
    // i18n
    lang: langOverride ?? (navigator.language || 'en'),
    langOverride,
    setLangOverride,
  }), [isInitialized, screenSize, langOverride])

  return (
    <AppContext.Provider value={contextValue}>
      <div className={styles.app}>
        <Gallery onLightboxChange={setLightboxOpen}/>
        <Footer hidden={lightboxOpen}/>
      </div>
    </AppContext.Provider>
  )
}

export default App
