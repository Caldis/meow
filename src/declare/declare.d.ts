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

  interface Picture {
    date: string
    width: number
    height: number
    aspectRatio: number
    title?: string
    desc?: string
    path: string
  }
}
