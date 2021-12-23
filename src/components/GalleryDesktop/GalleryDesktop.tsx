// Libs
import React, { useContext, useEffect, useMemo, useState } from 'react'
// Styles
import styles from './GalleryDesktop.module.scss'
// Components
import Parallax from 'components/Parallax'
// Utils
import { AppContext } from 'App.context'
import { TIME_DATA } from 'App.constant'

const MAX_WIDTH = 400
const MIN_WIDTH = 200
const getRandomSize = (aspectRatio: number) => {
  const width = Math.max(MAX_WIDTH * Math.random(), MIN_WIDTH)
  const height = width / aspectRatio
  return {
    width,
    height,
  }
}
const SAFE_AREA = 10
const SAFE_LABEL_HEIGHT = 30
const getRandomPosition = (screenSize: Size, imageSize: Size) => {
  const left = Math.random() * (screenSize.width - SAFE_AREA * 2 - imageSize.width) + SAFE_AREA
  const top = Math.random() * (screenSize.height - SAFE_AREA * 2 - imageSize.height - SAFE_LABEL_HEIGHT) + SAFE_AREA
  return {
    left,
    top,
  }
}

interface Props {}

const GalleryDesktop = (props: Props) => {

  // Context
  const { isInitialized, screenSize } = useContext(AppContext)

  // Images rect
  const rect = useMemo(() => {
    return TIME_DATA.map(item => {
      const imageSize = getRandomSize(item.aspectRatio)
      const { left, top } = getRandomPosition(screenSize, imageSize)
      return {
        left,
        top,
        width: imageSize.width,
        height: imageSize.height,
      }
    })
  }, [screenSize])

  const [step, setStep] = useState<number>(0)
  useEffect(() => {
    if (isInitialized) {
      const timer = setInterval(() => {
        if (step <= TIME_DATA.length - 1) {
          setStep(step => step + 1)
        } else {
          clearInterval(timer)
        }
      }, 600)
    }
  }, [isInitialized])

  return (
    <main className={styles.gallery}>
      {
        isInitialized && TIME_DATA.slice(0, step).map((item, index) => {
          const { left, top, width, height } = rect[index]
          return (
            <section key={index} className={styles.item} style={{ left, top }}>
              <Parallax innerClassName={styles.parallax}>
                <div className={styles.imageWrapper}>
                  <img
                    className={styles.image}
                    src={item.path}
                    alt={item.title}
                    loading="lazy"
                    style={{ width, height }}
                  />
                  <span className={styles.label}>
                    {item.date}
                  </span>
                </div>
              </Parallax>
            </section>
          )
        })
      }
    </main>
  )
}

export default GalleryDesktop
