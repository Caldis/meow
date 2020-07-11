/*
 * Observer the child intersection with screen
 */

import React, { HTMLAttributes, useEffect, useRef } from 'react'

interface Props extends HTMLAttributes<HTMLDivElement> {
  // Callback
  onIntersection?: IntersectionObserverCallback
  // IntersectionObserver Options
  options?: IntersectionObserverInit
  // Observe targets
  targets?: HTMLElement[]
  targetSelector?: string
}

const Intersection = ({ children, onIntersection, options = {}, targets, targetSelector, ...rest }: Props) => {

  const wrapperRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let observerRef: IntersectionObserver | undefined
    if (onIntersection && wrapperRef.current) {
      // Assign the wrapper as root by default
      if (targetSelector && !options?.root) {
        options.root = wrapperRef.current
      }
      // Create Observer
      observerRef = new IntersectionObserver(onIntersection, options)
      // Apply observation
      if (targets) {
        targets.forEach(element => observerRef?.observe(element))
      } else if (targetSelector) {
        // Apply observation to targets if exist
        const targetElements = document.querySelectorAll(targetSelector)
        targetElements.forEach(element => observerRef?.observe(element))
      } else if (options.root !== wrapperRef.current) {
        // Apply the observation to wrapper self
        observerRef?.observe(wrapperRef.current)
      }
    }
    // FIXME: 解除观察
    return () => observerRef?.disconnect()
  }, [onIntersection, options])

  return (
    <div ref={wrapperRef} {...rest}>
      {children}
    </div>
  )
}

export default Intersection
