import { throttle } from 'lodash'

/*
 * Base attrs
 */
let currentTarget: HTMLDivElement | undefined
let currentTargetRect: DOMRect | undefined
let currentTargetRectExtend: {
  centerX: number
  centerY: number
  halfWidth: number
  halfHeight: number
} | undefined

/*
 * Get Style
 */
export const transform = (degX: number, degY: number) => `perspective(512px) translate3d(0, 0, 0) rotateX(${-degY}deg) rotateY(${degX}deg)`

/*
 * Reset
 */
export const resetTarget = () => {
  // Guard
  if (!currentTarget) return
  // Reset style
  currentTarget.style.transform = transform(0, 0)
  // Reset rect
  currentTarget = undefined
  currentTargetRect = undefined
  currentTargetRectExtend = undefined
}

/*
 * Update current cache target
 */
export const updateTarget = (target: HTMLDivElement, options: { withRectCenter: boolean }) => {
  if (!currentTarget || currentTarget !== target) {
    // Reset last before update
    resetTarget()
    // Update current
    currentTarget = target
  }
  if (options.withRectCenter) {
    throttledUpdateTargetRectCenter()
  }
}

/*
 * Update current rect center at scrolling
 */
export const updateTargetRectCenter = () => {
  // Guard
  if (!currentTarget) return
  // Calc rect
  currentTargetRect = currentTarget.getBoundingClientRect()
  const halfWidth = currentTargetRect.width / 2
  const halfHeight = currentTargetRect.height / 2
  currentTargetRectExtend = {
    centerX: currentTargetRect.x + halfWidth,
    centerY: currentTargetRect.y + halfHeight,
    halfWidth,
    halfHeight,
  }
}
export const throttledUpdateTargetRectCenter = throttle(updateTargetRectCenter, 300)
window.addEventListener('scroll', throttledUpdateTargetRectCenter)

/*
 * Update pointerCenter with rectCenter diff at mouse moving
 */
const DEG_CLAMP = 3
export const handleTracing = (e: MouseEvent) => {
  // Guard
  if (!currentTarget) return
  if (!currentTargetRectExtend) return
  // Diff
  const centerDiff = {
    x: e.x - currentTargetRectExtend.centerX,
    y: e.y - currentTargetRectExtend.centerY,
  }
  // Clamp
  const clampDiff = {
    x: centerDiff.x / currentTargetRectExtend.halfWidth * DEG_CLAMP,
    y: centerDiff.y / currentTargetRectExtend.halfHeight * DEG_CLAMP,
  }
  // Apply style to current target
  currentTarget.style.transform = transform(clampDiff.x, clampDiff.y)
}
window.addEventListener('mousemove', handleTracing)
