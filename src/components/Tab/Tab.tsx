import React, { useLayoutEffect, useMemo, useRef, useState } from 'react'
import classNames from 'classnames'
import styles from './Tab.module.scss'
import { TabItemIdentifier } from './Tab.constant'

export default function Tab ({
  className,
  value,
  onChange,
  items,
  labels,
  activeAdornment,
}: {
  className?: string;
  value: TabItemIdentifier;
  onChange?: (value?: TabItemIdentifier) => void;
  items: TabItemIdentifier[];
  labels?: Record<string | number, string>;
  // Optional node rendered after each item's label. Only the active item's copy
  // is visible (the rest reserve its space so activating a tab doesn't reflow).
  activeAdornment?: React.ReactNode;
}) {

  // Style control
  const containerRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<((HTMLDivElement | null)[])>([])
  const activeIndex = useMemo(() => value !== undefined ? items.indexOf(value) : 0, [items, value])

  // Measure the active item AFTER layout so the pill tracks its real width.
  // Reading geometry during render would capture the PREVIOUS layout, so a label
  // width change (e.g. language switch) wouldn't move the pill. A layout effect
  // runs post-commit/pre-paint; re-running only on the few inputs that actually
  // move the pill keeps it cheap (no observers, no per-frame work).
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null)
  useLayoutEffect(() => {
    const measure = () => {
      const container = containerRef.current
      const activeEl = itemsRef.current[activeIndex]
      if (!container || !activeEl) return
      const c = container.getBoundingClientRect()
      const a = activeEl.getBoundingClientRect()
      setPill({ left: a.left - c.left + a.width * 0.18, width: a.width * 0.64 })
    }
    measure()
    // Web fonts render wider/narrower than the fallback; re-measure once they
    // settle so the pill isn't left sitting under stale metrics on first load.
    let cancelled = false
    const fonts = typeof document !== 'undefined' ? (document as unknown as { fonts?: { ready?: Promise<unknown> } }).fonts : undefined
    if (fonts?.ready) fonts.ready.then(() => { if (!cancelled) measure() })
    return () => { cancelled = true }
  }, [activeIndex, items, labels])

  return (
    <div className={classNames(styles.container, className && { [className]: true })} ref={containerRef}>

      {/*Pill*/}
      {pill && (
        <div className={styles.pill} style={{ left: pill.left, width: pill.width }}/>
      )}

      {/*Hot Spot Masks*/}
      {
        items.map((item, index) =>
          <div
            key={item}
            className={classNames(styles.item, { [styles.itemActive]: value === item })}
            onClick={() => onChange?.(item)}
            ref={r => itemsRef.current[index] = r}
          >
            {labels?.[item] ?? item}
            {activeAdornment ? (
              <span className={classNames(styles.adornment, { [styles.adornmentActive]: value === item })}>
                {activeAdornment}
              </span>
            ) : null}
          </div>
        )
      }

    </div>
  )
}
