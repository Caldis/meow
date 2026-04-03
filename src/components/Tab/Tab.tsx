import React, { useMemo, useRef } from 'react'
import classNames from 'classnames'
import styles from './Tab.module.scss'
import { TabItemIdentifier } from './Tab.constant'

export default function Tab ({
  className,
  value,
  onChange,
  items,
  labels,
}: {
  className?: string;
  value: TabItemIdentifier;
  onChange?: (value?: TabItemIdentifier) => void;
  items: TabItemIdentifier[];
  labels?: Record<string | number, string>;
}) {

  // Style control
  const containerRef = useRef<HTMLDivElement>(null)
  const containerRect = containerRef.current?.getBoundingClientRect()
  const itemsRef = useRef<((HTMLDivElement | null)[])>([])
  const activeIndex = useMemo(() => value !== undefined ? items.indexOf(value) : 0, [items, value])
  const activeItemRect = itemsRef.current[activeIndex]?.getBoundingClientRect()

  return (
    <div className={classNames(styles.container, className && { [className]: true })} ref={containerRef}>

      {/*Pill*/}
      {containerRect && activeItemRect && (
        <div className={styles.pill} style={{
          left: activeItemRect.left - containerRect.left + activeItemRect.width * 0.18,
          width: activeItemRect.width * 0.64,
        }}/>
      )}

      {/*Hot Spot Masks*/}
      {
        items.map((item, index) =>
          <div
            key={item}
            className={classNames(styles.item, { [styles.itemActive]: value === item })}
            onClick={() => onChange?.(item)}
            ref={r => itemsRef.current[index] = r}
          >{labels?.[item] ?? item}</div>
        )
      }

    </div>
  )
}
