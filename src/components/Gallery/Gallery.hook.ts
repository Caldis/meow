import { useCallback, useEffect, useRef } from 'react'
import { throttledUpdateTargetRectCenter } from 'components/Parallax/Parallax.constant'

const LERP = 0.04
const EPSILON = 0.5
// A wheel gesture is "continuous" while events keep arriving; a gap longer than
// this resets the accumulator so only one decisive scroll counts toward exit.
const WHEEL_GESTURE_GAP = 180

export function useCustomScroll(
  scrollerRef: React.RefObject<HTMLDivElement>,
  thumbRef: React.RefObject<HTMLDivElement>,
  contentHeight: number,
  viewportHeight: number,
  wheelExitThreshold: number = 0,
  onWheelExit?: () => void,
) {
  const target = useRef(0)
  const current = useRef(0)
  const raf = useRef(0)
  const startRef = useRef(() => {})
  const lockedRef = useRef(false)
  // Latest-ref pattern: keep the wheel listener subscription stable while the
  // threshold (tuned live from the debug panel) and callback change per render.
  const wheelExitThresholdRef = useRef(wheelExitThreshold)
  wheelExitThresholdRef.current = wheelExitThreshold
  const onWheelExitRef = useRef(onWheelExit)
  onWheelExitRef.current = onWheelExit
  const lockedWheelAccum = useRef(0)
  const lockedWheelAt = useRef(0)

  const maxScroll = Math.max(0, contentHeight - viewportHeight)
  const thumbH = maxScroll > 0 ? Math.max(30, (viewportHeight / contentHeight) * viewportHeight) : 0
  const trackRange = viewportHeight - thumbH

  useEffect(() => {
    const apply = () => {
      if (scrollerRef.current) {
        scrollerRef.current.style.transform = `translateY(${-current.current}px)`
      }
      if (thumbRef.current && maxScroll > 0) {
        thumbRef.current.style.transform = `translateY(${(current.current / maxScroll) * trackRange}px)`
        thumbRef.current.style.height = `${thumbH}px`
      }
    }

    const tick = () => {
      const diff = target.current - current.current
      if (Math.abs(diff) < EPSILON) {
        current.current = target.current
        apply()
        raf.current = 0
        return
      }
      current.current += diff * LERP
      apply()
      throttledUpdateTargetRectCenter()
      raf.current = requestAnimationFrame(tick)
    }

    const start = () => {
      if (!raf.current) raf.current = requestAnimationFrame(tick)
    }
    startRef.current = start

    // Wheel
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      let dy = e.deltaY
      if (e.deltaMode === 1) dy *= 40
      else if (e.deltaMode === 2) dy *= viewportHeight
      if (lockedRef.current) {
        // Lightbox open: scrolling is disabled, but a decisive wheel gesture
        // dismisses it. Accumulate within one gesture (reset after an idle gap)
        // so a deliberate scroll crosses the threshold while stray nudges don't.
        const threshold = wheelExitThresholdRef.current
        if (threshold > 0) {
          const now = performance.now()
          if (now - lockedWheelAt.current > WHEEL_GESTURE_GAP) lockedWheelAccum.current = 0
          lockedWheelAt.current = now
          lockedWheelAccum.current += Math.abs(dy)
          if (lockedWheelAccum.current >= threshold) {
            lockedWheelAccum.current = 0
            onWheelExitRef.current?.()
          }
        }
        return
      }
      target.current = Math.max(0, Math.min(maxScroll, target.current + dy))
      start()
    }

    // Thumb drag
    let dragY = 0, dragScroll = 0
    const onDown = (e: MouseEvent) => {
      e.preventDefault()
      dragY = e.clientY
      dragScroll = target.current
      document.body.style.cursor = 'grabbing'
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    }
    const onMove = (e: MouseEvent) => {
      const delta = ((e.clientY - dragY) / trackRange) * maxScroll
      target.current = Math.max(0, Math.min(maxScroll, dragScroll + delta))
      current.current = target.current
      apply()
      throttledUpdateTargetRectCenter()
    }
    const onUp = () => {
      document.body.style.cursor = ''
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    // Clamp on mode switch
    if (target.current > maxScroll) {
      target.current = maxScroll
      start()
    }
    apply()

    window.addEventListener('wheel', onWheel, { passive: false })
    const thumb = thumbRef.current
    thumb?.addEventListener('mousedown', onDown)

    return () => {
      window.removeEventListener('wheel', onWheel)
      thumb?.removeEventListener('mousedown', onDown)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      if (raf.current) { cancelAnimationFrame(raf.current); raf.current = 0 }
    }
  }, [scrollerRef, thumbRef, maxScroll, viewportHeight, thumbH, trackRange])

  const scrollTo = useCallback((y: number) => {
    target.current = Math.max(0, Math.min(maxScroll, y))
    startRef.current()
  }, [maxScroll])

  const setScrollLocked = useCallback((v: boolean) => {
    lockedRef.current = v
    // Start each lightbox session with a clean accumulator.
    lockedWheelAccum.current = 0
    lockedWheelAt.current = 0
  }, [])
  const getCurrentScroll = useCallback(() => current.current, [])

  return { scrollTo, maxScroll, setScrollLocked, getCurrentScroll }
}
