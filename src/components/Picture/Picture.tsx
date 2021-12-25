// Libs
import React, { useContext, useMemo, useState } from 'react'
// Styles
import styles from './Picture.module.scss'
// Components
import Parallax from '../Parallax'
// Utils
import { AppContext } from '../../App.context'
import { range } from '../../utils'

const MAX_WIDTH = 400
const MIN_WIDTH = 200
const getRandomSize = (aspectRatio: number) => {
  const width = range(MIN_WIDTH, MAX_WIDTH)
  const height = width / aspectRatio
  return {
    width,
    height,
  }
}
const SAFE_PADDING = 30
const SAFE_LABEL_HEIGHT = 30
const getRandomPosition = (screenSize: Size, imageSize: Size) => {
  const left = range(SAFE_PADDING, screenSize.width - imageSize.width - SAFE_PADDING)
  const top = range(SAFE_PADDING, screenSize.height - imageSize.height - SAFE_PADDING - SAFE_LABEL_HEIGHT)
  return {
    left,
    top,
  }
}

interface Props {
  data: Picture
}

const Picture = ({ data }: Props) => {

  // Context
  const { screenSize } = useContext(AppContext)

  // Onload
  const [loaded, setLoaded] = useState(false)
  const updateLoaded = () => setLoaded(true)

  // Images rect
  const { left, top, width, height, angle } = useMemo(() => {
    const imageSize = getRandomSize(data.aspectRatio)
    const { left, top } = getRandomPosition(screenSize, imageSize)
    return {
      left,
      top,
      angle: range(-20, 20),
      width: imageSize.width,
      height: imageSize.height,
    }
  }, [screenSize])

  // Image style
  const anim = useMemo(() => {
    if (!loaded) {
      return {
        opacity: 0,
        filter: "blur(5px)",
        transform: `scale(1.1) rotate(${angle}deg)`,
      }
    } else {
      return {
        opacity: 1,
        filter: "blur(0px)",
        transform: `scale(1) rotate(${angle}deg)`,
      }
    }
  }, [angle, loaded])

  return (
    <picture className={styles.picture} style={{ left, top, ...anim }}>
      <Parallax innerClassName={styles.parallax}>
        <div className={styles.imageWrapper}>
          <img
            className={styles.image}
            src={data.path}
            alt={data.title}
            loading="lazy"
            style={{ width, height }}
            onLoad={updateLoaded}
          />
          <span className={styles.label}>
            {data.date}
          </span>
        </div>
      </Parallax>
    </picture>
  )
}

export default Picture
