// Libs
import s from 'classnames'
import React, { useContext, useRef, useState } from 'react'
// Styles
import styles from './Timeline.module.scss'
// Utils
import { AppContext } from 'App.context'
import { TIME_DATA } from 'App.constant'
import { DetailArrowTransPhaseStyle, DetailBoxTransPhaseStyle, TransPhase } from './Timeline.constant'

interface Props {}

const Timeline = (props: Props) => {

  const { isInitialized, time, timeDispatch } = useContext(AppContext)

  // Preview
  const [preview, setPreview] = useState<Time>()

  // Position Control
  const [position, setPosition] = useState<DOMRect>()
  const handleMouseEnter = (e: React.MouseEvent<HTMLElement, MouseEvent>, item: Time) => {
    setPreview(item)
    setPosition((e.target as HTMLElement).getBoundingClientRect())
    handleToggleTransPhase(TransPhase.following)
  }
  const handleMouseLeave = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    handleToggleTransPhase(TransPhase.hiding)
  }

  // Phase Control
  const transTimer = useRef<number>()
  const [transPhase, setTransPhase] = useState(TransPhase.hiding)
  const handleToggleTransPhase = (direction: TransPhase.following | TransPhase.hiding) => {
    if (direction === TransPhase.following && transPhase === TransPhase.hiding) {
      // Hiding -> Following
      clearTimeout(transTimer.current)
      setTransPhase(TransPhase.entering)
      transTimer.current = window.setTimeout(() => setTransPhase(TransPhase.following), 300)
    }
    if (direction === TransPhase.hiding && transPhase === TransPhase.following) {
      // Following -> Hiding
      clearTimeout(transTimer.current)
      setTransPhase(TransPhase.leaving)
      transTimer.current = window.setTimeout(() => setTransPhase(TransPhase.hiding), 300)
    }
  }

  // Navigation
  const handleTimeClick = (time: Time, index: number) => {
    timeDispatch({ source: 'timeline', payload: time })
  }

  return (
    <nav className={s(styles.timeline, { [styles.show]: isInitialized })}>

      {/*TimeLine*/}
      <div className={styles.times} onMouseLeave={handleMouseLeave}>

        {/*TimeSlice*/}
        {
          TIME_DATA.map((item, index) => (
            <figure
              key={`${index}-${item.title}`}
              className={s(styles.time, { [styles.current]: item === time })}
              onClick={() => handleTimeClick(item, index)}
              onMouseEnter={(e) => handleMouseEnter(e, item)}
            />
          ))
        }


        {/*Detail*/}
        <div className={styles.detailDot} style={DetailArrowTransPhaseStyle(position?.top)[transPhase]}>
          {/*<div className={styles.core}/>*/}
        </div>
        <div className={styles.detailBox} style={DetailBoxTransPhaseStyle(position?.top)[transPhase]}>
          <h1>{preview?.date}</h1>
          <h2>{preview?.title}</h2>
          <span>{preview?.desc}</span>
        </div>

      </div>
    </nav>
  )
}

export default Timeline
