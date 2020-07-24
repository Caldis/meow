/*
 * Virtual Window for rendering massive contents
 */

import { throttle } from 'lodash'
import React, { HTMLAttributes, MutableRefObject, ReactElement, useCallback, useState } from 'react'

interface Props extends HTMLAttributes<HTMLDivElement> {
  // Key of item, necessary to generate the unique key for elements
  itemKey?: (index: number, elementProps: any) => string
  // Height of Item, all elements of children must has same height
  itemHeight: number
  // Item Buffer from top of screen, the itemHeight multiply the count of item must higher than the height of frame
  buffer?: number
  // Update interval, higher of value means the better of performance, but also with the risk on rendering delay
  interval?: number
}

const Vindow = React.forwardRef<HTMLDivElement, Props>(({
  // Private
  className, children = [], style,
  // Props
  itemKey, itemHeight, buffer = 3, interval = 150
}, forwardedRef) => {

  // Guard for empty children
  const safeChildren = (Array.isArray(children) ? children : [children]) || ([] as ReactElement[])

  // Building the item in screen
  const [aiming, setAiming] = useState(0)
  const lower = Math.max(aiming - buffer, 0)
  const upper = Math.min(aiming + buffer + 1, safeChildren.length)
  const itemInScreen = safeChildren.slice(lower, upper)

  // Handle scrolling
  const throttleHandleScroll = useCallback(throttle(() => {
    // Updating anchor
    const scrollLeft = (forwardedRef as MutableRefObject<HTMLDivElement>)?.current?.scrollLeft || 1
    const currentAiming = Math.floor(scrollLeft / itemHeight)
    setAiming(currentAiming)
  }, interval), [itemHeight])

  return (
    <div
      className={className}
      style={{
        ...style,
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'auto',
        willChange: 'transform, opacity'
      }}
      onScroll={throttleHandleScroll}
      ref={forwardedRef}
    >
      <div style={{ height: itemHeight * safeChildren.length }}>
        {
          itemInScreen.map((item, index) => {
            // Guard for empty items
            if (!item) return undefined
            // Generate Keys
            const key = itemKey ? itemKey(index, item.props) : index
            // Attaching for position attributes
            const customProps = {
              key,
              style: {
                ...item.props?.style,
                position: 'absolute',
                left: 0,
                top: itemHeight * (index + lower),
                height: itemHeight,
              }
            }
            return <item.type {...item.props} {...customProps}>{item.props?.children}</item.type>
          })
        }
      </div>
    </div>
  )
})

export default Vindow
