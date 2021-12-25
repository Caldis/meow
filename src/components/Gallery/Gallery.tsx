// Libs
import React, { useContext, useEffect, useState, useRef } from 'react'
// Styles
import styles from './Gallery.module.scss'
// Components
import Picture from '../Picture'
// Utils
import { AppContext } from 'App.context'
import { GALLERY_DATA } from 'App.constant'

const Gallery = () => {

  // Context
  const { isInitialized } = useContext(AppContext)

  // Init by order
  const timer = useRef<number>()
  const [step, setStep] = useState<number>(0)
  useEffect(() => {
    if (isInitialized) {
      timer.current = window.setInterval(() => {
        setStep((step) => {
          if (step <= GALLERY_DATA.length - 1) {
            return step + 1
          } else {
            clearInterval(timer.current)
            return step
          }
        })
      }, 600)
    }
  }, [isInitialized])

  return (
    <main className={styles.gallery}>
      {
        isInitialized && GALLERY_DATA.slice(0, step).map((item, index) => (
          <Picture key={index} data={item}/>
        ))
      }
    </main>
  )
}

export default Gallery
