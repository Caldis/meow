// Libs
import React, { CSSProperties, HTMLAttributes, ReactElement, useEffect, useRef } from 'react'
// Styles
import styles from './Parallax.module.scss'
// Utils
import { PARALLAX_INNER_PADDING, updateTarget } from './Parallax.constant'

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactElement
  className?: string
  style?: CSSProperties
  innerClassName?: string
  innerStyle?: CSSProperties
}

const Parallax = ({ children, className, style, innerClassName, innerStyle }: Props) => {

  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current!
    const handleUpdateTracingTarget = () => updateTarget(inner, { withRectCenter: true })
    // const handleCancelTracingTarget = () => resetTarget()
    outer?.addEventListener('mouseover', handleUpdateTracingTarget)
    // outer?.addEventListener('mouseleave', handleCancelTracingTarget)
    return () => {
      outer?.removeEventListener('mouseover', handleUpdateTracingTarget)
      // outer?.removeEventListener('mouseleave', handleCancelTracingTarget)
    }
  })

  return (
    <div className={`${styles.parallax}${className ? ` ${className}` : ''}`} ref={outerRef} style={{
      ...style,
      padding: PARALLAX_INNER_PADDING
    }}>
      <div className={`${styles.parallaxInner}${innerClassName ? ` ${innerClassName}` : ''}`} style={innerStyle} ref={innerRef}>
        {children}
      </div>
    </div>
  )
}

export default Parallax
