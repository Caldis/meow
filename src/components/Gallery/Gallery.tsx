// Libs
import s from 'classnames'
import { throttle } from 'lodash'
import React, { useContext, useEffect, useRef } from 'react'
// Styles
import styles from './Gallery.module.scss'
// Components
import Parallax from 'components/Parallax'
// Utils
import { AppContext } from 'App.context'
import { TIME_DATA } from 'App.constant'

interface Props {}

const Gallery = (props: Props) => {

  // Context
  const { isInitialized, screenSize, time, timeDispatch } = useContext(AppContext)

  // Refs
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Sync the scrolling position from selected time
  useEffect(() => {
    if (time && time.source !== 'gallery') {
      // Set the scrollTop with selected time
      const index = TIME_DATA.indexOf(time)
      wrapperRef.current?.scrollTo({
        top: index * screenSize.height,
        behavior: time.source === 'initial' ? 'auto' : 'smooth',
      })
    }
  }, [screenSize, time])

  // Sync the Timeline from scrolling position
  useEffect(() => {
    // Saving the ref reference with effect closure for cleanup the eventListener correctly
    const ref = wrapperRef.current
    const handleWheel = throttle(() => {
      const top = ref?.scrollTop || 0
      const targetTime = TIME_DATA[Math.floor(top / screenSize.height)]
      timeDispatch({ source: 'gallery', payload: targetTime })
    }, 200)
    ref?.addEventListener('wheel', handleWheel)
    return () => ref?.removeEventListener('wheel', handleWheel)
  }, [screenSize, timeDispatch])

  return (
    <main className={styles.gallery}>

      <div ref={wrapperRef} className={s(styles.wrapperLayer, { [styles.show]: isInitialized })}>
        {
          TIME_DATA.map((item, index) => (
            <section key={index}>
              <Parallax innerClassName={styles.parallax}>
                <img
                  className={styles.image}
                  src={item.path}
                  alt={item.title}
                  loading="lazy"
                />
              </Parallax>
            </section>
          ))
        }
      </div>

    </main>
  )
}

export default Gallery
