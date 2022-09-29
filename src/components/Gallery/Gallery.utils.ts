import { range } from 'utils'
import { SEQUENTIAL_COLUMNS } from 'components/Gallery/Gallery.constant'
import {
  PICTURE_INNER_PADDING,
  PICTURE_LABEL_LINE_HEIGHT,
  PICTURE_LABEL_MARGIN_BOTTOM,
  PICTURE_LABEL_MARGIN_TOP
} from 'components/Picture/Picture.constant'
import { PARALLAX_INNER_PADDING } from 'components/Parallax/Parallax.constant'

const SAFE_PADDING = PARALLAX_INNER_PADDING + PICTURE_INNER_PADDING
const SAFE_LABEL_HEIGHT = PICTURE_LABEL_LINE_HEIGHT + PICTURE_LABEL_MARGIN_TOP + PICTURE_LABEL_MARGIN_BOTTOM

// RANDOM
const MAX_WIDTH = 400
const MIN_WIDTH = 200
const getRandomSize = (aspectRatio: number) => {
  const width = range(MIN_WIDTH, MAX_WIDTH)
  const height = width / aspectRatio
  return {
    width,
    height,
  }
}
const getRandomPosition = (screenSize: Size, imageSize: Size) => {
  const left = range(SAFE_PADDING, screenSize.width - imageSize.width - SAFE_PADDING)
  const top = range(SAFE_PADDING, screenSize.height - imageSize.height - SAFE_PADDING - SAFE_LABEL_HEIGHT)
  return {
    left,
    top,
  }
}
export const getRandomRect = (data: Pic, screenSize: Size) => {
  const imageSize = getRandomSize(data.aspectRatio)
  const { left, top } = getRandomPosition(screenSize, imageSize)
  return {
    left,
    top,
    angle: range(-20, 20),
    width: imageSize.width,
    height: imageSize.height,
  }
}

// SEQUENTIAL
const getSequentialSize = (screenSize: Size, aspectRatio: number) => {
  const width = (screenSize.width) / SEQUENTIAL_COLUMNS
  const height = width / aspectRatio + SAFE_PADDING * 2
  const fullWidth = width + SAFE_PADDING * 2
  const fullHeight = height + SAFE_PADDING * 2 + SAFE_LABEL_HEIGHT
  return {
    width,
    height,
    fullWidth,
    fullHeight,
  }
}
const getSequentialColumn = (columns: Rect[][]) => {
  const columnHeights = columns.map((column) => column.reduce((acc, item) => acc + (item.fullHeight ?? item.height), 0))
  const minColumnHeight = Math.min(...columnHeights)
  const indexOfMinColumn = columnHeights.indexOf(minColumnHeight)
  return {
    height: minColumnHeight,
    index: indexOfMinColumn,
  }
}
const getSequentialPosition = (screenSize: Size, imageSize: Size, column: { height: number; index: number }) => {
  const left = column.index * (imageSize.fullWidth ?? imageSize.width)
  const top = column.height + SAFE_PADDING * 2
  return {
    left,
    top,
  }
}
export const getSequentialRect = (data: Pic, screenSize: Size, columns: Rect[][]) => {
  const size = getSequentialSize(screenSize, data.aspectRatio)
  const column = getSequentialColumn(columns)
  const position = getSequentialPosition(screenSize, size, column)
  const rect = {
    ...size,
    ...position,
    angle: 0,
  }
  columns[column.index]?.push(rect)
  return rect
}
