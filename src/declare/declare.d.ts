export declare global {

  // Javascript Object Enhancement
  interface Array<T> {
    first: T | undefined
    last: T | undefined
  }

  // Global Types
  interface Size {
    width: number
    height: number
  }

  interface Point {
    x: number,
    y: number
  }

  interface Rect {
    top: number
    left: number
    bottom: number
    right: number
  }

  type TimeSource = 'initial' | 'timeline' | 'gallery'

  type TimeAction = {
    source: TimeSource
    payload: number | Time
  }

  interface Time {
    date: string
    width: number
    height: number
    aspectRatio: number
    title?: string
    desc?: string
    path: string
    source?: TimeSource
  }
}
