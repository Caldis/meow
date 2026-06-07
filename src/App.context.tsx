import React from 'react'

export interface AppContextValue {
  // Flags
  isInitialized: boolean
  // Global
  screenSize: Size
  // i18n — `lang` is the effective language (override if set, else the browser's).
  // `langOverride` is the debug-panel choice (null = follow the browser).
  lang: string
  langOverride: string | null
  setLangOverride: (lang: string | null) => void
}

export const AppContext = React.createContext({} as AppContextValue)
