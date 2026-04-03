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
import { TabItemIdentifier } from 'components/Tab/Tab.constant'
import { GalleryViewMode, SAFE_LABEL_HEIGHT, SAFE_PADDING, SEQUENTIAL_BREAK_POINT, STAGE_BREAK_POINT, VIEW_MODE_LABELS, getLocalizedTitle } from 'components/Gallery/Gallery.constant'
import { getColumnSlot, getRandomRect, getSequentialRect, getStageRect } from './Gallery.utils'
import { useCustomScroll } from './Gallery.hook'

const Gallery = () => {

  // Context
  const { isInitialized, screenSize } = useContext(AppContext)

  // Data
  const [data, setData] = useState<{ pic: Pic; rect: Rect }[]>([])

  // View Mode
  const [viewMode, setViewMode] = useState<GalleryViewMode>(GalleryViewMode.sequential)
  const handleModeChange = useCallback((selection?: TabItemIdentifier) => {
    setViewMode(selection as GalleryViewMode)
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
  }, [getCurrentScroll, setScrollLocked])

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
              lightbox={index === lightboxIndex}
              lightboxOpen={lightboxOpen}
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

    </main>
  )
}

export default Gallery
