import React from 'react'

export interface AppContextValue {
  // Flags
  isInitialized: boolean
  // Global
  screenSize: Size
}

export const AppContext = React.createContext({} as AppContextValue)
