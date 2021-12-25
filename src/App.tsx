// Libs
import React, { useEffect, useMemo, useReducer } from 'react'
// Styles
import './App.reset.scss'
import styles from './App.module.scss'
// Components
import Gallery from './components/Gallery'
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

  // Context
  const contextValue = {
    // Flags
    isInitialized,
    // Global
    screenSize,
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className={styles.app}>
        <Gallery/>
      </div>
    </AppContext.Provider>
  )
}

export default App
