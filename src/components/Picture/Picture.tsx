// Libs
import React, { CSSProperties, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
// Styles
import styles from './Picture.module.scss'
// Components
import Parallax from '../Parallax'
import { AppContext } from 'App.context'
import { PARALLAX_INNER_PADDING, updateTargetRectCenter } from 'components/Parallax/Parallax.constant'
import {
  DEFAULT_PICTURE_DRAG_TUNING,
  DEFAULT_PICTURE_HIGHLIGHT_TUNING,
  PictureDragTuning,
  PICTURE_INNER_PADDING,
  PictureHighlightTuning,
  PICTURE_LABEL_LINE_HEIGHT,
  PICTURE_LABEL_MARGIN_BOTTOM,
  PICTURE_LABEL_MARGIN_TOP,
  PICTURE_VISIBLE_INTERVAL
} from 'components/Picture/Picture.constant'

const CARD_PAD = (PICTURE_INNER_PADDING + PARALLAX_INNER_PADDING) * 2
const LABEL_H = PICTURE_LABEL_LINE_HEIGHT + PICTURE_LABEL_MARGIN_TOP + PICTURE_LABEL_MARGIN_BOTTOM
const DRAG_THRESHOLD = 6
const GLARE_DEFAULT = { x: 50, y: 50 }
const FRONT_OPEN_DELAY = 80
const DRAG_VELOCITY_BLEND = 0.24
const DRAG_LAG_FACTOR = 18
const DRAG_ACCEL_LAG_FACTOR = 120
const DRAG_TILT_FACTOR = 2.2
const DRAG_ACCEL_TILT_FACTOR = 18
const DRAG_TORQUE_FACTOR = 5.4
const DRAG_ACCEL_TORQUE_FACTOR = 34
const DRAG_LAG_MAX = 10
const DRAG_TILT_MAX = 2.4
const DRAG_SPIN_MAX = 5.4
const DRAG_ORIGIN_RANGE = 24
const DRAG_LIFT_BASE = 0.012
const DRAG_LIFT_SPEED_FACTOR = 0.008

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

interface DragPose {
  shiftX: number
  shiftY: number
  rotateX: number
  rotateY: number
  rotateZ: number
  scale: number
  originX: number
  originY: number
}

const DRAG_POSE_DEFAULT: DragPose = {
  shiftX: 0,
  shiftY: 0,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  scale: 1,
  originX: 50,
  originY: 50,
}

// Keep the card attached to the pointer at the outer layer, and let the inner layer lag/torque a bit.
const createDragPose = (
  gripX: number,
  gripY: number,
  velocityX: number,
  velocityY: number,
  accelX: number,
  accelY: number,
  dragTuning: PictureDragTuning
): DragPose => {
  const speed = Math.hypot(velocityX, velocityY)
  const torque = gripX * velocityY - gripY * velocityX
  const torqueAccel = gripX * accelY - gripY * accelX
  const lagGain = Math.max(dragTuning.lagGain, 0)
  const tiltGain = Math.max(dragTuning.tiltGain, 0)
  const spinGain = Math.max(dragTuning.spinGain, 0)
  const accelGain = Math.max(dragTuning.accelGain, 0)
  const liftGain = Math.max(dragTuning.liftGain, 0)
  const gripGain = Math.max(dragTuning.gripGain, 0)
  const lift = (DRAG_LIFT_BASE + clamp(speed * DRAG_LIFT_SPEED_FACTOR, 0, DRAG_LIFT_BASE)) * liftGain

  return {
    shiftX: clamp(
      -(velocityX * DRAG_LAG_FACTOR * lagGain + accelX * DRAG_ACCEL_LAG_FACTOR * lagGain * accelGain),
      -DRAG_LAG_MAX * lagGain,
      DRAG_LAG_MAX * lagGain,
    ),
    shiftY: clamp(
      -(velocityY * DRAG_LAG_FACTOR * lagGain + accelY * DRAG_ACCEL_LAG_FACTOR * lagGain * accelGain),
      -DRAG_LAG_MAX * lagGain,
      DRAG_LAG_MAX * lagGain,
    ),
    rotateX: clamp(
      -(velocityY * DRAG_TILT_FACTOR * tiltGain + accelY * DRAG_ACCEL_TILT_FACTOR * tiltGain * accelGain),
      -DRAG_TILT_MAX * tiltGain,
      DRAG_TILT_MAX * tiltGain,
    ),
    rotateY: clamp(
      velocityX * DRAG_TILT_FACTOR * tiltGain + accelX * DRAG_ACCEL_TILT_FACTOR * tiltGain * accelGain,
      -DRAG_TILT_MAX * tiltGain,
      DRAG_TILT_MAX * tiltGain,
    ),
    rotateZ: clamp(
      torque * DRAG_TORQUE_FACTOR * spinGain + torqueAccel * DRAG_ACCEL_TORQUE_FACTOR * spinGain * accelGain,
      -DRAG_SPIN_MAX * spinGain,
      DRAG_SPIN_MAX * spinGain,
    ),
    scale: 1 + lift,
    originX: clamp(50 + gripX * DRAG_ORIGIN_RANGE * gripGain, 18, 82),
    originY: clamp(50 + gripY * DRAG_ORIGIN_RANGE * gripGain, 18, 82),
  }
}

// Anim
const useBlurAnim = (visble: boolean, angle: number = 0) => {
  return useMemo(() => {
    if (visble) {
      return {
        opacity: 1,
        filter: 'blur(0px)',
        transform: `scale(1) rotate(${angle}deg)`,
      }
    }
    return {
      opacity: 0,
      filter: 'blur(5px)',
      transform: `scale(1.1) rotate(${angle}deg)`,
    }
  }, [visble, angle])
}

interface Props {
  index: number
  pic: Pic
  rect: Rect
  draggable?: boolean
  highlightTuning?: PictureHighlightTuning
  dragTuning?: PictureDragTuning
  stackIndex?: number
  shuffleToken?: number
  onRequestFront?: (reason: 'click' | 'drag') => boolean
  lightbox?: boolean
  lightboxOpen?: boolean
  onExpand?: (index: number) => void
  onClose?: () => void
  expandedScroll?: number
}

const Picture = React.memo(({
  index,
  pic,
  rect,
  draggable = false,
  highlightTuning = DEFAULT_PICTURE_HIGHLIGHT_TUNING,
  dragTuning = DEFAULT_PICTURE_DRAG_TUNING,
  stackIndex,
  shuffleToken = 0,
  onRequestFront,
  lightbox,
  lightboxOpen,
  onExpand,
  onClose,
  expandedScroll
}: Props) => {

  const { screenSize } = useContext(AppContext)
  const mediaFrameRef = useRef<HTMLDivElement>(null)
  const dragLayerRef = useRef<HTMLDivElement>(null)
  const pictureRef = useRef<HTMLElement>(null)
  const dragPoseRef = useRef<HTMLDivElement>(null)
  const suppressClickRef = useRef(false)
  const dragStateRef = useRef({
    pointerId: -1,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    lastOffsetX: 0,
    lastOffsetY: 0,
    lastMoveAt: 0,
    velocityX: 0,
    velocityY: 0,
    accelX: 0,
    accelY: 0,
    gripX: 0,
    gripY: 0,
    moved: false,
  })

  const [visible, setVisible] = useState(false)
  const handleVisible = useCallback(() => setVisible(true), [])
  useEffect(() => {setTimeout(handleVisible, index * PICTURE_VISIBLE_INTERVAL) }, [handleVisible, index])

  // Onload
  const [loaded, setLoaded] = useState(false)
  const updateLoaded = useCallback(() => setLoaded(true), [])

  // Images rect
  const { left, top, width, height, angle } = rect || {}
  const cardWidth = (width ?? 0) + CARD_PAD
  const cardHeight = (height ?? 0) + CARD_PAD + LABEL_H

  // Image style — position via transform (GPU composited, no layout reflow)
  const blurAnim = useBlurAnim(loaded, angle)

  // Lightbox: calculate centered + scaled transform
  const isExpanded = lightbox && lightboxOpen
  const isLightboxAnim = !!lightbox
  const allowDrag = draggable && loaded && !isLightboxAnim

  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [dragPose, setDragPose] = useState<DragPose>(DRAG_POSE_DEFAULT)
  const [dragging, setDragging] = useState(false)
  const [glare, setGlare] = useState(GLARE_DEFAULT)
  const [glareActive, setGlareActive] = useState(false)
  const [shuffleActive, setShuffleActive] = useState(false)
  const expandTimerRef = useRef<number>(0)

  useEffect(() => {
    setDragOffset({ x: 0, y: 0 })
    setDragPose(DRAG_POSE_DEFAULT)
    setDragging(false)
    setGlare(GLARE_DEFAULT)
    setGlareActive(false)
    suppressClickRef.current = false
    dragStateRef.current = {
      pointerId: -1,
      startX: 0,
      startY: 0,
      originX: 0,
      originY: 0,
      lastOffsetX: 0,
      lastOffsetY: 0,
      lastMoveAt: 0,
      velocityX: 0,
      velocityY: 0,
      accelX: 0,
      accelY: 0,
      gripX: 0,
      gripY: 0,
      moved: false,
    }
  }, [draggable, left, top, width, height])

  useEffect(() => {
    return () => {
      if (expandTimerRef.current) {
        clearTimeout(expandTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      updateTargetRectCenter()
    })
    return () => cancelAnimationFrame(frame)
  }, [dragOffset.x, dragOffset.y, dragPose.shiftX, dragPose.shiftY, isExpanded])

  useEffect(() => {
    if (!shuffleToken) return
    setShuffleActive(true)
    const timer = window.setTimeout(() => {
      setShuffleActive(false)
    }, 240)
    return () => clearTimeout(timer)
  }, [shuffleToken])

  const dragBounds = useMemo(() => {
    const minX = -(left ?? 0)
    const maxX = screenSize.width - (left ?? 0) - cardWidth
    const minY = -(top ?? 0)
    const maxY = screenSize.height - (top ?? 0) - cardHeight
    return {
      minX: Math.min(minX, maxX),
      maxX: Math.max(minX, maxX),
      minY: Math.min(minY, maxY),
      maxY: Math.max(minY, maxY),
    }
  }, [cardHeight, cardWidth, left, screenSize.height, screenSize.width, top])

  const updateGlare = useCallback((clientX: number, clientY: number) => {
    const frame = mediaFrameRef.current
    if (!frame) return
    const bounds = frame.getBoundingClientRect()
    if (!bounds.width || !bounds.height) return
    setGlare({
      x: clamp(((clientX - bounds.left) / bounds.width) * 100, 0, 100),
      y: clamp(((clientY - bounds.top) / bounds.height) * 100, 0, 100),
    })
  }, [])

  const handlePointerEnter = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    setGlareActive(true)
    updateGlare(e.clientX, e.clientY)
  }, [updateGlare])

  const handlePointerLeave = useCallback(() => {
    if (dragStateRef.current.pointerId !== -1) return
    setGlareActive(false)
    setGlare(GLARE_DEFAULT)
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!allowDrag || e.button !== 0) return
    const bounds = pictureRef.current?.getBoundingClientRect() || e.currentTarget.getBoundingClientRect()
    const gripX = bounds.width ? clamp((e.clientX - (bounds.left + bounds.width / 2)) / (bounds.width / 2), -1, 1) : 0
    const gripY = bounds.height ? clamp((e.clientY - (bounds.top + bounds.height / 2)) / (bounds.height / 2), -1, 1) : 0
    dragStateRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: dragOffset.x,
      originY: dragOffset.y,
      lastOffsetX: dragOffset.x,
      lastOffsetY: dragOffset.y,
      lastMoveAt: performance.now(),
      velocityX: 0,
      velocityY: 0,
      accelX: 0,
      accelY: 0,
      gripX,
      gripY,
      moved: false,
    }
    setGlareActive(true)
    updateGlare(e.clientX, e.clientY)
  }, [allowDrag, dragOffset.x, dragOffset.y, updateGlare])

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    updateGlare(e.clientX, e.clientY)
    const state = dragStateRef.current
    if (!allowDrag || state.pointerId !== e.pointerId) return
    const deltaX = e.clientX - state.startX
    const deltaY = e.clientY - state.startY
    if (!state.moved && Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD) return
    if (!state.moved) {
      e.preventDefault()
      e.stopPropagation()
      e.currentTarget.setPointerCapture(e.pointerId)
      state.moved = true
      setDragging(true)
      onRequestFront?.('drag')
    }
    const nextOffset = {
      x: clamp(state.originX + deltaX, dragBounds.minX, dragBounds.maxX),
      y: clamp(state.originY + deltaY, dragBounds.minY, dragBounds.maxY),
    }
    const now = performance.now()
    const dt = clamp(now - state.lastMoveAt, 16, 34)
    const deltaOffsetX = nextOffset.x - state.lastOffsetX
    const deltaOffsetY = nextOffset.y - state.lastOffsetY
    const rawVelocityX = deltaOffsetX / dt
    const rawVelocityY = deltaOffsetY / dt
    const nextVelocityX = state.velocityX * (1 - DRAG_VELOCITY_BLEND) + rawVelocityX * DRAG_VELOCITY_BLEND
    const nextVelocityY = state.velocityY * (1 - DRAG_VELOCITY_BLEND) + rawVelocityY * DRAG_VELOCITY_BLEND
    const nextAccelX = (nextVelocityX - state.velocityX) / dt
    const nextAccelY = (nextVelocityY - state.velocityY) / dt

    state.lastOffsetX = nextOffset.x
    state.lastOffsetY = nextOffset.y
    state.lastMoveAt = now
    state.velocityX = nextVelocityX
    state.velocityY = nextVelocityY
    state.accelX = nextAccelX
    state.accelY = nextAccelY

    setDragOffset(nextOffset)
    setDragPose(createDragPose(state.gripX, state.gripY, nextVelocityX, nextVelocityY, nextAccelX, nextAccelY, dragTuning))
  }, [allowDrag, dragBounds.maxX, dragBounds.maxY, dragBounds.minX, dragBounds.minY, dragTuning, onRequestFront, updateGlare])

  const releasePointer = useCallback((pointerId: number, target: HTMLDivElement) => {
    if (target.hasPointerCapture(pointerId)) {
      target.releasePointerCapture(pointerId)
    }
    suppressClickRef.current = dragStateRef.current.moved
    dragStateRef.current.pointerId = -1
    dragStateRef.current.moved = false
    dragStateRef.current.lastMoveAt = 0
    dragStateRef.current.velocityX = 0
    dragStateRef.current.velocityY = 0
    dragStateRef.current.accelX = 0
    dragStateRef.current.accelY = 0
    dragStateRef.current.gripX = 0
    dragStateRef.current.gripY = 0
    setDragPose(DRAG_POSE_DEFAULT)
    setDragging(false)
  }, [])

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current.pointerId !== e.pointerId) return
    releasePointer(e.pointerId, e.currentTarget)
    if (!e.currentTarget.matches(':hover')) {
      setGlareActive(false)
      setGlare(GLARE_DEFAULT)
    }
  }, [releasePointer])

  const handlePointerCancel = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current.pointerId !== e.pointerId) return
    releasePointer(e.pointerId, e.currentTarget)
    setGlareActive(false)
    setGlare(GLARE_DEFAULT)
  }, [releasePointer])

  const baseLeft = (left ?? 0) + dragOffset.x
  const baseTop = (top ?? 0) + dragOffset.y
  let pictureTransform: string
  if (isExpanded && expandedScroll !== undefined) {
    const scale = Math.min((screenSize.width - 80) / cardWidth, (screenSize.height - 80) / cardHeight)
    const tx = screenSize.width / 2 - cardWidth / 2 - baseLeft
    const ty = screenSize.height / 2 - cardHeight / 2 + expandedScroll - baseTop
    pictureTransform = `translate(${tx}px, ${ty}px) scale(${scale}) rotate(0deg)`
  } else {
    pictureTransform = blurAnim.transform
  }

  const handleClick = useCallback(() => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    if (isExpanded) {
      onClose?.()
    } else if (loaded) {
      const movedToFront = onRequestFront?.('click') ?? false
      if (expandTimerRef.current) {
        clearTimeout(expandTimerRef.current)
        expandTimerRef.current = 0
      }
      if (movedToFront) {
        expandTimerRef.current = window.setTimeout(() => {
          onExpand?.(index)
          expandTimerRef.current = 0
        }, FRONT_OPEN_DELAY)
        return
      }
      onExpand?.(index)
    }
  }, [isExpanded, loaded, onExpand, onClose, index, onRequestFront])

  const dragTransform = `translate3d(${baseLeft}px, ${baseTop}px, 0)`
  const dragPoseStyle = useMemo(() => ({
    transform: `translate3d(${dragPose.shiftX}px, ${dragPose.shiftY}px, 0) rotateX(${dragPose.rotateX}deg) rotateY(${dragPose.rotateY}deg) rotateZ(${dragPose.rotateZ}deg) scale(${dragPose.scale})`,
    transformOrigin: `${dragPose.originX}% ${dragPose.originY}%`,
  }) as CSSProperties, [dragPose])
  const glareStyle = useMemo(() => ({
    '--glare-x': `${glare.x}%`,
    '--glare-y': `${glare.y}%`,
    '--specular-opacity': glareActive ? (dragging ? 0.95 : 0.72) * highlightTuning.specularGain : 0,
    '--foil-opacity': glareActive ? (dragging ? 0.82 : 0.58) * highlightTuning.foilGain : 0,
    '--glare-shift': `${(glare.x - 50) * 0.6 * highlightTuning.shiftGain}px`,
  }) as CSSProperties, [dragging, glare.x, glare.y, glareActive, highlightTuning.foilGain, highlightTuning.shiftGain, highlightTuning.specularGain])

  // Guard: not visible
  if (!visible) return null

  return (
    <div
      ref={dragLayerRef}
      className={`${styles.dragLayer}${allowDrag ? ` ${styles.dragLayerActive}` : ''}${dragging ? ` ${styles.dragLayerDragging}` : ''}`}
      style={{
        transform: dragTransform,
        zIndex: isLightboxAnim ? 200 : stackIndex,
      }}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      <picture
        ref={pictureRef}
        className={`${styles.picture}${isLightboxAnim ? ` ${styles.lightbox}` : ''}`}
        style={{
          opacity: blurAnim.opacity,
          filter: blurAnim.filter,
          transform: pictureTransform,
          cursor: loaded ? (isExpanded ? 'zoom-out' : 'zoom-in') : undefined,
        }}
        onClick={handleClick}
      >
        <div ref={dragPoseRef} className={`${styles.dragPose}${dragging ? ` ${styles.dragPoseActive}` : ''}`} style={dragPoseStyle}>
          <Parallax innerClassName={styles.parallax} rectSourceRef={dragPoseRef}>
            <div className={`${styles.imageWrapper}${shuffleActive ? ` ${styles.imageWrapperShuffle}` : ''}`} style={{ padding: PICTURE_INNER_PADDING }}>
              <div className={styles.mediaFrame} ref={mediaFrameRef} style={glareStyle}>
                <img
                  className={styles.image}
                  src={pic.path}
                  alt={pic.title}
                  loading="lazy"
                  draggable={false}
                  style={{ width, height }}
                  onLoad={updateLoaded}
                />
                <span className={styles.specular}/>
                <span className={`${styles.foil}${glareActive ? ` ${styles.foilActive}` : ''}`}/>
              </div>
              <span className={styles.label} style={{
                lineHeight: `${PICTURE_LABEL_LINE_HEIGHT}px`,
                marginTop: PICTURE_LABEL_MARGIN_TOP,
                marginBottom: PICTURE_LABEL_MARGIN_BOTTOM
              }}>
                {pic.date?.replace(/-/g, '.')}
              </span>
            </div>
          </Parallax>
        </div>
      </picture>
    </div>
  )
})

export default Picture
