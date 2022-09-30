// Libs
import React, { useCallback, useContext, useEffect, useState } from 'react'
// Styles
import styles from './Gallery.module.scss'
// Components
import Tab from '../Tab'
import Picture from '../Picture'
// Utils
import { AppContext } from 'App.context'
import { GALLERY_DATA } from 'App.constant'
import { TabItemIdentifier } from 'components/Tab/Tab.constant'
import { GalleryViewMode, SEQUENTIAL_BREAK_POINT, STAGE_BREAK_POINT } from 'components/Gallery/Gallery.constant'
import { getColumnSlot, getRandomRect, getSequentialRect, getStageRect } from './Gallery.utils'

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

  return (
    <main className={styles.gallery}>

      <Tab
        className={styles.tab}
        value={viewMode}
        onChange={handleModeChange}
        items={[GalleryViewMode.random, GalleryViewMode.sequential, GalleryViewMode.stage]}
      />

      {
        isInitialized && data.map((item, index) => (
          <Picture key={item.pic.path} index={index} pic={item.pic} rect={item.rect}/>
        ))
      }

    </main>
  )
}

export default Gallery
