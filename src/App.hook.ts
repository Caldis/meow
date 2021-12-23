import { debounce } from 'lodash'
import { useCallback, useEffect, useState } from 'react'

// Read window size from browser
export function useScreenSize (interval = 300) {
  const [screenSize, setScreenSize] = useState<Size>({ width: 0, height: 0 })
  const updaterRef = useCallback(debounce(() => setScreenSize({
    width: window.innerWidth,
    height: window.innerHeight
  }), interval), [])
  useEffect(() => {
    window.addEventListener('resize', updaterRef)
    updaterRef()
    return () => window.removeEventListener('resize', updaterRef)
  }, [updaterRef])
  return screenSize
}

// Gain the Initialized flag with specific delay
export function useInitializedDelay (delay = 50) {
  const [initialized, setInitialized] = useState(false)
  useEffect(() => {
    setTimeout(() => setInitialized(true), delay)
  }, [delay])
  return initialized
}

// interface useEventListenerThrottleOptions extends AddEventListenerOptions {
//   target?: HTMLElement
//   deps: DependencyList
//   throttleWait?: number
//   throttleSettings?: ThrottleSettings
// }
//
// export function useEventListenerThrottle (type: keyof WindowEventMap, listener: EventListener, options?: boolean | useEventListenerThrottleOptions) {
//   useEffect(() => {
//     // Saving the ref reference with effect closure for cleanup the eventListener correctly
//     const optionsObject = typeof options === 'object' ? options : {} as useEventListenerThrottleOptions
//     const { target = window, deps, throttleWait, throttleSettings, ...restOptions } = optionsObject
//     const eventListenerOptions = typeof options === 'object' ? restOptions : options
//     const throttledHandler = throttle(listener, throttleWait, throttleSettings)
//     target.addEventListener('wheel', throttledHandler, eventListenerOptions)
//     return () => target.removeEventListener('wheel', throttledHandler, eventListenerOptions)
//   }, [...(typeof options === 'object' ? options.deps : []), listener, options])
// }
