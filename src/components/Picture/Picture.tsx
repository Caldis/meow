// Libs
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
// Styles
import styles from './Picture.module.scss'
// Components
import Parallax from '../Parallax'
import { AppContext } from 'App.context'
import { PARALLAX_INNER_PADDING } from 'components/Parallax/Parallax.constant'
import {
  PICTURE_INNER_PADDING,
  PICTURE_LABEL_LINE_HEIGHT,
  PICTURE_LABEL_MARGIN_BOTTOM,
  PICTURE_LABEL_MARGIN_TOP,
  PICTURE_VISIBLE_INTERVAL
} from 'components/Picture/Picture.constant'

const CARD_PAD = (PICTURE_INNER_PADDING + PARALLAX_INNER_PADDING) * 2
const LABEL_H = PICTURE_LABEL_LINE_HEIGHT + PICTURE_LABEL_MARGIN_TOP + PICTURE_LABEL_MARGIN_BOTTOM

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
  lightbox?: boolean
  lightboxOpen?: boolean
  onExpand?: (index: number) => void
  onClose?: () => void
  expandedScroll?: number
}

const Picture = React.memo(({ index, pic, rect, lightbox, lightboxOpen, onExpand, onClose, expandedScroll }: Props) => {

  const { screenSize } = useContext(AppContext)

  const [visible, setVisible] = useState(false)
  const handleVisible = useCallback(() => setVisible(true), [])
  useEffect(() => {setTimeout(handleVisible, index * PICTURE_VISIBLE_INTERVAL) }, [handleVisible, index])

  // Onload
  const [loaded, setLoaded] = useState(false)
  const updateLoaded = useCallback(() => setLoaded(true), [])

  // Images rect
  const { left, top, width, height, angle } = rect || {}

  // Image style — position via transform (GPU composited, no layout reflow)
  const blurAnim = useBlurAnim(loaded, angle)

  // Lightbox: calculate centered + scaled transform
  const isExpanded = lightbox && lightboxOpen
  const isLightboxAnim = !!lightbox

  let pictureTransform: string
  if (isExpanded && expandedScroll !== undefined) {
    const cardW = (width ?? 0) + CARD_PAD
    const cardH = (height ?? 0) + CARD_PAD + LABEL_H
    const scale = Math.min((screenSize.width - 80) / cardW, (screenSize.height - 80) / cardH)
    const tx = screenSize.width / 2 - cardW / 2
    const ty = screenSize.height / 2 - cardH / 2 + expandedScroll
    pictureTransform = `translate(${tx}px, ${ty}px) scale(${scale}) rotate(0deg)`
  } else {
    pictureTransform = `translate(${left ?? 0}px, ${top ?? 0}px) ${blurAnim.transform}`
  }

  const handleClick = useCallback(() => {
    if (isExpanded) {
      onClose?.()
    } else if (loaded) {
      onExpand?.(index)
    }
  }, [isExpanded, loaded, onExpand, onClose, index])

  // Guard: not visible
  if (!visible) return null

  return (
    <picture
      className={`${styles.picture}${isLightboxAnim ? ` ${styles.lightbox}` : ''}`}
      style={{
        opacity: blurAnim.opacity,
        filter: blurAnim.filter,
        transform: pictureTransform,
        zIndex: isLightboxAnim ? 200 : undefined,
        cursor: loaded ? (isExpanded ? 'zoom-out' : 'zoom-in') : undefined,
      }}
      onClick={handleClick}
    >
      <Parallax innerClassName={styles.parallax}>
        <div className={styles.imageWrapper} style={{ padding: PICTURE_INNER_PADDING }}>
          <img
            className={styles.image}
            src={pic.path}
            alt={pic.title}
            loading="lazy"
            style={{ width, height }}
            onLoad={updateLoaded}
          />
          <span className={styles.label} style={{
            lineHeight: `${PICTURE_LABEL_LINE_HEIGHT}px`,
            marginTop: PICTURE_LABEL_MARGIN_TOP,
            marginBottom: PICTURE_LABEL_MARGIN_BOTTOM
          }}>
            {pic.date?.replace(/-/g, '.')}
          </span>
        </div>
      </Parallax>
    </picture>
  )
})

export default Picture
