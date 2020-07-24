// Libs
import React, { useEffect, useReducer } from 'react'
// Styles
import './App.reset.scss'
import styles from './App.module.scss'
// Components
import Timeline from './components/Timeline'
import Gallery from './components/Gallery'
// Utils
import { AppContext } from './App.context'
import { useInitializedDelay, useScreenSize } from './App.hook'
// Assets
import { TIME_DATA } from './App.constant'
import { getAnchor } from './utils'

function App () {

  // Global
  const isInitialized = useInitializedDelay()
  const screenSize = useScreenSize()

  // Time
  const [time, timeDispatch] = useReducer((state: Time, action: TimeAction): Time => {
    if (typeof action.payload === 'number') {
      // With index
      window.location.hash = getAnchor(action.payload)
      return Object.assign(TIME_DATA[action.payload], { source: action.source })
    } else {
      // With payload
      window.location.hash = getAnchor(TIME_DATA.indexOf(action.payload))
      return Object.assign(action.payload, { source: action.source })
    }
  }, TIME_DATA[0])

  // State Recover
  useEffect(() => {
    if (window.location.hash) {
      try {
        // Recover the selected time
        const index = window.location.hash.split('#')[1].split('-')[0]
        timeDispatch({ source: 'initial', payload: Number(index) })
      } catch (e) {
        // Clean hash
        window.location.href = window.location.href.split('#')[0]
      }
    }
  }, [])

  // Context
  const contextValue = {
    // Flags
    isInitialized,
    // Global
    screenSize,
    // Time
    time,
    timeDispatch,
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className={styles.app}>
        {/*<Timeline/>*/}
        <Gallery/>
      </div>
    </AppContext.Provider>
  )
}

export default App
