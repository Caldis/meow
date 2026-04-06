import { throttle } from 'lodash'

export const PARALLAX_INNER_PADDING = 10

/*
 * Base attrs
 */
let currentTarget: HTMLDivElement | undefined
let currentRectSource: HTMLElement | undefined
let currentTargetRect: DOMRect | undefined
let currentTargetRectExtend: {
  centerX: number
  centerY: number
  halfWidth: number
  halfHeight: number
} | undefined
let currentRotation = { x: 0, y: 0 }
let targetRotation = { x: 0, y: 0 }
let rotationRaf = 0
let hoverStartedAt = 0

/*
 * Get Style
 */
export const transform = (degX: number, degY: number) => `perspective(512px) translate3d(0, 0, 0) rotateX(${-degY}deg) rotateY(${degX}deg)`

const ROTATION_LERP = 0.18
const ROTATION_EPSILON = 0.02
const ENTRY_RAMP_MS = 180
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const easeOutQuart = (value: number) => 1 - Math.pow(1 - value, 4)

const getEntryProgress = () => {
  if (!hoverStartedAt) return 1
  return easeOutQuart(clamp((performance.now() - hoverStartedAt) / ENTRY_RAMP_MS, 0, 1))
}

const applyCurrentRotation = () => {
  if (!currentTarget) return
  currentTarget.style.transform = transform(currentRotation.x, currentRotation.y)
}

const stopRotationLoop = () => {
  if (!rotationRaf) return
  cancelAnimationFrame(rotationRaf)
  rotationRaf = 0
}

const tickRotation = () => {
  if (!currentTarget) {
    rotationRaf = 0
    return
  }
  const entryProgress = getEntryProgress()
  const liveTarget = {
    x: targetRotation.x * entryProgress,
    y: targetRotation.y * entryProgress,
  }
  const diffX = liveTarget.x - currentRotation.x
  const diffY = liveTarget.y - currentRotation.y
  if (entryProgress >= 1 && Math.abs(diffX) < ROTATION_EPSILON && Math.abs(diffY) < ROTATION_EPSILON) {
    currentRotation = { ...liveTarget }
    applyCurrentRotation()
    rotationRaf = 0
    return
  }
  currentRotation = {
    x: currentRotation.x + diffX * ROTATION_LERP,
    y: currentRotation.y + diffY * ROTATION_LERP,
  }
  applyCurrentRotation()
  rotationRaf = requestAnimationFrame(tickRotation)
}

const startRotationLoop = () => {
  if (rotationRaf) return
  rotationRaf = requestAnimationFrame(tickRotation)
}

/*
 * Reset
 */
export const resetTarget = () => {
  // Guard
  if (!currentTarget) return
  stopRotationLoop()
  // Restore CSS transition for smooth reset
  currentTarget.style.transition = ''
  currentTarget.style.transform = transform(0, 0)
  // Reset rect
  currentTarget = undefined
  currentRectSource = undefined
  currentTargetRect = undefined
  currentTargetRectExtend = undefined
  currentRotation = { x: 0, y: 0 }
  targetRotation = { x: 0, y: 0 }
  hoverStartedAt = 0
}

/*
 * Update current cache target
 */
export const updateTarget = (target: HTMLDivElement, options: { withRectCenter: boolean; rectSource?: HTMLElement }) => {
  if (!currentTarget || currentTarget !== target) {
    // Reset last before update
    resetTarget()
    // Update current
    currentTarget = target
    currentRotation = { x: 0, y: 0 }
    targetRotation = { x: 0, y: 0 }
    hoverStartedAt = performance.now()
    target.style.transition = 'none'
    target.style.transform = transform(0, 0)
  }
  currentRectSource = options.rectSource || target
  if (options.withRectCenter) {
    updateTargetRectCenter()
  }
}

/*
 * Update current rect center at scrolling
 */
export const updateTargetRectCenter = () => {
  // Guard
  if (!currentTarget) return
  const rectSource = currentRectSource || currentTarget
  // Calc rect
  currentTargetRect = rectSource.getBoundingClientRect()
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
window.addEventListener('scroll', throttledUpdateTargetRectCenter, { passive: true })

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
    x: clamp(centerDiff.x / currentTargetRectExtend.halfWidth, -1, 1) * DEG_CLAMP,
    y: clamp(centerDiff.y / currentTargetRectExtend.halfHeight, -1, 1) * DEG_CLAMP,
  }
  targetRotation = clampDiff
  startRotationLoop()
}
window.addEventListener('mousemove', handleTracing, { passive: true })
