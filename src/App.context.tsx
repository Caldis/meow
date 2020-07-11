import React from 'react'

export interface AppContextValue {
  // Flags
  isInitialized: boolean
  // Global
  screenSize: Size
  // Time
  time: Time
  timeDispatch: (action: TimeAction) => void
}

export const AppContext = React.createContext({} as AppContextValue)
