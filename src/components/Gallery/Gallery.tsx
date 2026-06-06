// Libs
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
// Styles
import styles from './Gallery.module.scss'
// Components
import Tab from '../Tab'
import Picture from '../Picture'
// Utils
import { AppContext } from 'App.context'
import { GALLERY_DATA } from 'App.constant'
import { track } from 'utils/analytics'
import {
  DEFAULT_PICTURE_DRAG_TUNING,
  DEFAULT_PICTURE_HIGHLIGHT_TUNING,
  PictureDragTuning,
  PictureHighlightTuning
} from 'components/Picture/Picture.constant'
import { TabItemIdentifier } from 'components/Tab/Tab.constant'
import { GalleryViewMode, SAFE_LABEL_HEIGHT, SAFE_PADDING, SEQUENTIAL_BREAK_POINT, STAGE_BREAK_POINT, VIEW_MODE_LABELS, getLocalizedTitle } from 'components/Gallery/Gallery.constant'
import { getColumnSlot, getRandomRect, getSequentialRect, getStageRect } from './Gallery.utils'
import { useCustomScroll } from './Gallery.hook'

const IS_DEV = process.env.NODE_ENV === 'development'

const Gallery = () => {

  // Context
  const { isInitialized, screenSize } = useContext(AppContext)

  // Data
  const [data, setData] = useState<{ pic: Pic; rect: Rect }[]>([])
  const [stackIndexes, setStackIndexes] = useState<Record<string, number>>({})
  const [shuffleTokens, setShuffleTokens] = useState<Record<string, number>>({})
  const stackIndexesRef = useRef<Record<string, number>>({})
  const frontCounterRef = useRef(0)

  // View Mode
  const [viewMode, setViewMode] = useState<GalleryViewMode>(GalleryViewMode.sequential)
  const handleModeChange = useCallback((selection?: TabItemIdentifier) => {
    setViewMode(selection as GalleryViewMode)
    track('switch_view', { view: GalleryViewMode[selection as GalleryViewMode] })
  }, [])

  const [highlightTuning, setHighlightTuning] = useState<PictureHighlightTuning>(DEFAULT_PICTURE_HIGHLIGHT_TUNING)
  const [dragTuning, setDragTuning] = useState<PictureDragTuning>(DEFAULT_PICTURE_DRAG_TUNING)
  const updateHighlightTuning = useCallback((key: keyof PictureHighlightTuning, value: number) => {
    setHighlightTuning((current) => ({
      ...current,
      [key]: value,
    }))
  }, [])
  const updateDragTuning = useCallback((key: keyof PictureDragTuning, value: number) => {
    setDragTuning((current) => ({
      ...current,
      [key]: value,
    }))
  }, [])
  const resetDebugTuning = useCallback(() => {
    setHighlightTuning(DEFAULT_PICTURE_HIGHLIGHT_TUNING)
    setDragTuning(DEFAULT_PICTURE_DRAG_TUNING)
  }, [])

  // Fill
  useEffect(() => {
    if (isInitialized) {
      // Fill by modes
      switch (viewMode) {
        case GalleryViewMode.random:
          setData(GALLERY_DATA.map(pic => {
            const rect = getRandomRect(pic, screenSize)
            return { pic, rect }
          }))
          break
        case GalleryViewMode.sequential:
          const sequentialColumns = {
            current: new Array(getColumnSlot(screenSize, SEQUENTIAL_BREAK_POINT)).fill(0).map(_ => []) as Rect[][]
          }
          setData(GALLERY_DATA.map(pic => {
            const rect = getSequentialRect(pic, screenSize, sequentialColumns)
            return { pic, rect }
          }))
          break
        case GalleryViewMode.stage:
          const stageColumns = {
            current: new Array(getColumnSlot(screenSize, STAGE_BREAK_POINT)).fill(0).map(_ => []) as Rect[][]
          }
          setData(GALLERY_DATA.map(pic => {
            const rect = getStageRect(pic, screenSize, stageColumns)
            return { pic, rect }
          }))
          break
      }
    }
  }, [isInitialized, screenSize, viewMode])

  useEffect(() => {
    const nextIndexes = data.reduce((acc, item, index) => {
      acc[item.pic.path] = index + 1
      return acc
    }, {} as Record<string, number>)
    stackIndexesRef.current = nextIndexes
    frontCounterRef.current = data.length
    setStackIndexes(nextIndexes)
    setShuffleTokens({})
  }, [data])

  // Custom scroll
  const scrollerRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const contentHeight = useMemo(() => {
    if (!data.length) return screenSize.height
    return data.reduce((max, item) => {
      const h = item.rect.fullHeight ?? (item.rect.height + SAFE_PADDING * 2 + SAFE_LABEL_HEIGHT)
      return Math.max(max, (item.rect.top ?? 0) + h)
    }, 0)
  }, [data, screenSize.height])
  const { scrollTo, maxScroll, setScrollLocked, getCurrentScroll } = useCustomScroll(scrollerRef, thumbRef, contentHeight, screenSize.height)

  // Lightbox
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [expandedScroll, setExpandedScroll] = useState(0)
  const closeTimer = useRef<number>(0)

  const handleExpand = useCallback((index: number) => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = 0
    }
    setExpandedScroll(getCurrentScroll())
    setLightboxIndex(index)
    setLightboxOpen(true)
    setScrollLocked(true)
    track('expand_photo', { date: data[index]?.pic?.date, view: GalleryViewMode[viewMode] })
  }, [data, viewMode, getCurrentScroll, setScrollLocked])

  const handleClose = useCallback(() => {
    setLightboxOpen(false)
    setScrollLocked(false)
    closeTimer.current = window.setTimeout(() => {
      setLightboxIndex(null)
      closeTimer.current = 0
    }, 700)
  }, [setScrollLocked])

  const handleTitleClick = useCallback(() => scrollTo(0), [scrollTo])
  const handleTrackClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return
    scrollTo((e.clientY / screenSize.height) * maxScroll)
  }, [scrollTo, maxScroll, screenSize.height])

  const handleRequestFront = useCallback((index: number, reason: 'click' | 'drag') => {
    if (viewMode !== GalleryViewMode.random) return false
    const target = data[index]
    if (!target) return false
    const path = target.pic.path
    const current = stackIndexesRef.current[path] ?? 0
    const currentFront = frontCounterRef.current
    if (current >= currentFront) return false

    const nextFront = currentFront + 1
    frontCounterRef.current = nextFront
    const nextIndexes = {
      ...stackIndexesRef.current,
      [path]: nextFront,
    }
    stackIndexesRef.current = nextIndexes
    setStackIndexes(nextIndexes)

    if (reason === 'click') {
      setShuffleTokens((prev) => ({
        ...prev,
        [path]: (prev[path] ?? 0) + 1,
      }))
    }
    return true
  }, [data, viewMode])

  return (
    <main className={styles.gallery}>

      <header className={styles.header}>
        <h1 className={styles.title} onClick={handleTitleClick}>{getLocalizedTitle()}</h1>
        <Tab
          value={viewMode}
          onChange={handleModeChange}
          items={[GalleryViewMode.random, GalleryViewMode.sequential, GalleryViewMode.stage]}
          labels={VIEW_MODE_LABELS}
        />
      </header>

      <div className={styles.scroller} ref={scrollerRef}>
        {
          isInitialized && data.map((item, index) => (
            <Picture
              key={item.pic.path}
              index={index}
              pic={item.pic}
              rect={item.rect}
              draggable={viewMode === GalleryViewMode.random}
              highlightTuning={highlightTuning}
              dragTuning={dragTuning}
              stackIndex={stackIndexes[item.pic.path] ?? index + 1}
              shuffleToken={shuffleTokens[item.pic.path] ?? 0}
              onRequestFront={handleRequestFront}
              lightbox={index === lightboxIndex}
              // Only the lightbox card reads lightboxOpen; feeding `false` to the
              // rest keeps the prop referentially stable so React.memo can skip
              // them when the lightbox opens/closes (no behavior change — a card
              // with lightbox=false ignores lightboxOpen internally).
              lightboxOpen={index === lightboxIndex ? lightboxOpen : false}
              onExpand={handleExpand}
              onClose={handleClose}
              expandedScroll={index === lightboxIndex ? expandedScroll : undefined}
            />
          ))
        }

        <div
          className={`${styles.overlay}${lightboxOpen ? ` ${styles.overlayVisible}` : ''}`}
          style={lightboxIndex !== null ? { top: expandedScroll, height: screenSize.height } : undefined}
          onClick={handleClose}
        />
      </div>

      {maxScroll > 0 && (
        <div className={styles.scrollbar} onClick={handleTrackClick}>
          <div className={styles.scrollThumb} ref={thumbRef}/>
        </div>
      )}

      {IS_DEV && (
        <aside className={styles.debugPanel}>
          <div className={styles.debugHeader}>
            <strong className={styles.debugTitle}>Card Debug</strong>
            <button className={styles.debugReset} type="button" onClick={resetDebugTuning}>重置</button>
          </div>

          <div className={styles.debugSection}>
            <strong className={styles.debugSectionTitle}>高光</strong>

            <label className={styles.debugControl}>
              <span>亮斑强度</span>
              <strong>{highlightTuning.specularGain.toFixed(2)}</strong>
              <input
                type="range"
                min="0"
                max="2.5"
                step="0.05"
                value={highlightTuning.specularGain}
                onChange={(e) => updateHighlightTuning('specularGain', Number(e.target.value))}
              />
            </label>

            <label className={styles.debugControl}>
              <span>彩光强度</span>
              <strong>{highlightTuning.foilGain.toFixed(2)}</strong>
              <input
                type="range"
                min="0"
                max="2.5"
                step="0.05"
                value={highlightTuning.foilGain}
                onChange={(e) => updateHighlightTuning('foilGain', Number(e.target.value))}
              />
            </label>

            <label className={styles.debugControl}>
              <span>流光位移</span>
              <strong>{highlightTuning.shiftGain.toFixed(2)}</strong>
              <input
                type="range"
                min="0"
                max="2.5"
                step="0.05"
                value={highlightTuning.shiftGain}
                onChange={(e) => updateHighlightTuning('shiftGain', Number(e.target.value))}
              />
            </label>
          </div>

          <div className={styles.debugSection}>
            <strong className={styles.debugSectionTitle}>拖拽姿态</strong>

            <label className={styles.debugControl}>
              <span>位移滞后</span>
              <strong>{dragTuning.lagGain.toFixed(2)}</strong>
              <input
                type="range"
                min="0"
                max="3"
                step="0.05"
                value={dragTuning.lagGain}
                onChange={(e) => updateDragTuning('lagGain', Number(e.target.value))}
              />
            </label>

            <label className={styles.debugControl}>
              <span>倾斜强度</span>
              <strong>{dragTuning.tiltGain.toFixed(2)}</strong>
              <input
                type="range"
                min="0"
                max="3"
                step="0.05"
                value={dragTuning.tiltGain}
                onChange={(e) => updateDragTuning('tiltGain', Number(e.target.value))}
              />
            </label>

            <label className={styles.debugControl}>
              <span>扭转强度</span>
              <strong>{dragTuning.spinGain.toFixed(2)}</strong>
              <input
                type="range"
                min="0"
                max="3.5"
                step="0.05"
                value={dragTuning.spinGain}
                onChange={(e) => updateDragTuning('spinGain', Number(e.target.value))}
              />
            </label>

            <label className={styles.debugControl}>
              <span>加速度响应</span>
              <strong>{dragTuning.accelGain.toFixed(2)}</strong>
              <input
                type="range"
                min="0"
                max="3"
                step="0.05"
                value={dragTuning.accelGain}
                onChange={(e) => updateDragTuning('accelGain', Number(e.target.value))}
              />
            </label>

            <label className={styles.debugControl}>
              <span>抬起感</span>
              <strong>{dragTuning.liftGain.toFixed(2)}</strong>
              <input
                type="range"
                min="0"
                max="2.5"
                step="0.05"
                value={dragTuning.liftGain}
                onChange={(e) => updateDragTuning('liftGain', Number(e.target.value))}
              />
            </label>

            <label className={styles.debugControl}>
              <span>抓取偏心</span>
              <strong>{dragTuning.gripGain.toFixed(2)}</strong>
              <input
                type="range"
                min="0"
                max="2.5"
                step="0.05"
                value={dragTuning.gripGain}
                onChange={(e) => updateDragTuning('gripGain', Number(e.target.value))}
              />
            </label>
          </div>
        </aside>
      )}

    </main>
  )
}

export default Gallery
