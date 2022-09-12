import React, { useEffect, useMemo, useRef } from 'react'
import classNames from 'classnames'
import styles from './Tab.module.scss'

const ITEMS = ['A', 'B']

export default function Tab({ defaultActive, className, onChange }: { defaultActive?: number; className?: string; onChange?: (active?: number) => void }) {
  const [active, setActive] = React.useState<number>()
  useEffect(() => setActive(defaultActive !== undefined ? defaultActive : 0), [defaultActive])
  useEffect(() => { active !== undefined && onChange?.(active) }, [active])
  const containerRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<((HTMLDivElement | null)[])>([])
  const containerRect = useMemo(() => containerRef.current?.getBoundingClientRect(), [active])
  const activeItemRect = useMemo(() => itemsRef.current[active ?? 0]?.getBoundingClientRect(), [active])
  return (
    <div className={classNames(styles.container, className && { [className]: true })} ref={containerRef}>
      <div className={styles.overlay} style={{
        left: (activeItemRect?.left ?? 0) - (containerRect?.left ?? 0),
        top: (activeItemRect?.top ?? 0) - (containerRect?.top ?? 0),
        width: (activeItemRect?.width ?? 1) - 2,
        height: (activeItemRect?.height ?? 1) - 2,
      }}/>
      {
        ITEMS.map((item, index) =>
          <div
            key={index}
            className={classNames(styles.item, { [styles.itemActive]: active === index })}
            onClick={() => setActive(index)}
            ref={r => itemsRef.current[index] = r}
          />
        )
      }
    </div>
  )
}
