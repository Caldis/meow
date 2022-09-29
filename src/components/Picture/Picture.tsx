// Libs
import React, { useCallback, useEffect, useMemo, useState } from 'react'
// Styles
import styles from './Picture.module.scss'
// Components
import Parallax from '../Parallax'
import {
  PICTURE_INNER_PADDING,
  PICTURE_LABEL_LINE_HEIGHT,
  PICTURE_LABEL_MARGIN_BOTTOM,
  PICTURE_LABEL_MARGIN_TOP,
  PICTURE_VISIBLE_INTERVAL
} from 'components/Picture/Picture.constant'

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
}

const Picture = ({ index, pic, rect }: Props) => {

  const [visible, setVisible] = useState(false)
  const handleVisible = useCallback(() => setVisible(true), [])
  useEffect(() => {setTimeout(handleVisible, index * PICTURE_VISIBLE_INTERVAL) }, [handleVisible, index])

  // Onload
  const [loaded, setLoaded] = useState(false)
  const updateLoaded = useCallback(() => setLoaded(true), [])

  // Images rect
  const { left, top, width, height, angle } = rect || {}

  // Image style
  const blurAnim = useBlurAnim(loaded, angle)

  // Guard: not visible
  if (!visible) return null

  return (
    <picture className={styles.picture} style={{ left, top, ...blurAnim, }}>
      <Parallax innerClassName={styles.parallax}>
        <div className={styles.imageWrapper} style={{ padding: PICTURE_INNER_PADDING }}>
          <img
            className={styles.image}
            src={pic.path}
            alt={pic.title}
            loading="lazy"
            style={{ width, height, opacity: 0 }}
            onLoad={updateLoaded}
          />
          <span className={styles.label} style={{
            lineHeight: `${PICTURE_LABEL_LINE_HEIGHT}px`,
            marginTop: PICTURE_LABEL_MARGIN_TOP,
            marginBottom: PICTURE_LABEL_MARGIN_BOTTOM
          }}>
            {pic.date}
          </span>
        </div>
      </Parallax>
    </picture>
  )
}

export default Picture
