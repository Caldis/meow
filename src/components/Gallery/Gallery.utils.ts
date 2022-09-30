import { range } from 'utils'
import {
  RANDOM_MAX_WIDTH,
  RANDOM_MIN_WIDTH,
  SAFE_LABEL_HEIGHT,
  SAFE_PADDING,
  SEQUENTIAL_BREAK_POINT,
  STAGE_BREAK_POINT,
  STAGE_HORIZONTAL_BASE_CONTINUOUS,
  STAGE_RATIO_BREAK_POINT,
  STAGE_VERTICAL_BASE_CONTINUOUS
} from 'components/Gallery/Gallery.constant'

// COMMON
export const getColumnSlot = (screenSize: Size, breakPoint: number) => {
  // Guard: empty screen size
  if (!screenSize) return 1
  // Guard: small screen
  return Math.floor(screenSize.width / breakPoint) || 1
}

// RANDOM
const getRandomSize = (aspectRatio: number) => {
  const width = range(RANDOM_MIN_WIDTH, RANDOM_MAX_WIDTH)
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
const getSequentialColumn = (columnsRef: { current: Rect[][] }) => {
  const columnHeights = columnsRef.current.map((column) => column.reduce((acc, item) => acc + (item.fullHeight ?? item.height), 0))
  const minColumnHeight = Math.min(...columnHeights)
  const indexOfFirstMinColumn = columnHeights.indexOf(minColumnHeight)
  return {
    height: minColumnHeight,
    index: indexOfFirstMinColumn,
  }
}
const getSequentialSize = (screenSize: Size, data: Pic) => {
  const base = ((screenSize.width - 2 * SAFE_PADDING) / getColumnSlot(screenSize, SEQUENTIAL_BREAK_POINT)) - (2 * SAFE_PADDING)
  const width = base
  const height = base / data.aspectRatio + SAFE_PADDING * 2
  const fullWidth = base + SAFE_PADDING * 2
  const fullHeight = height + SAFE_PADDING * 2 + SAFE_LABEL_HEIGHT
  return {
    base,
    width,
    height,
    fullWidth,
    fullHeight,
  }
}
const getSequentialPosition = (screenSize: Size, column: ReturnType<typeof getSequentialColumn>, imageSize: ReturnType<typeof getSequentialSize>) => {
  const left = column.index * (imageSize.base + SAFE_PADDING * 2) + SAFE_PADDING
  const top = column.height + SAFE_PADDING * 2
  return {
    left,
    top,
  }
}
export const getSequentialRect = (data: Pic, screenSize: Size, columnsRef: { current: Rect[][] }) => {
  const column = getSequentialColumn(columnsRef)
  const size = getSequentialSize(screenSize, data)
  const position = getSequentialPosition(screenSize, column, size)
  const rect = {
    ...size,
    ...position,
    angle: 0,
  }
  columnsRef.current[column.index]?.push(rect)
  return rect
}

// STAGE
const getStageColumn = (columnsRef: { current: Rect[][] }) => {
  const columnHeights = columnsRef.current.map((column) => Math.floor(column.reduce((acc, item) => acc + (item.fullHeight ?? item.height), 0)))
  const minColumnHeight = Math.min(...columnHeights)
  const indexOfFirstMinColumn = columnHeights.indexOf(minColumnHeight)
  let continuousFitCount = 0
  while (columnHeights[indexOfFirstMinColumn + continuousFitCount + 1] === minColumnHeight) {
    continuousFitCount++
  }
  const isSlotFit = continuousFitCount + 1 >= STAGE_HORIZONTAL_BASE_CONTINUOUS
  return {
    height: minColumnHeight,
    index: indexOfFirstMinColumn,
    // 空间是否足够容纳 STAGE_HORIZONTAL_BASE_CONTINUOUS
    fitHorizontal: isSlotFit,
  }
}
const getStageSize = (screenSize: Size, data: Pic, column: ReturnType<typeof getStageColumn>) => {
  const base = ((screenSize.width - 2 * SAFE_PADDING) / getColumnSlot(screenSize, STAGE_BREAK_POINT)) - (2 * SAFE_PADDING)
  let slot: number
  let width: number
  let height: number
  const isRandomSquare = range(0, 5) < 1
  const horizontalGap = SAFE_PADDING * 2 * (STAGE_HORIZONTAL_BASE_CONTINUOUS - 1)
  const verticalGap = (SAFE_PADDING * 2 + SAFE_LABEL_HEIGHT) * (STAGE_VERTICAL_BASE_CONTINUOUS - 1)
  if (data.aspectRatio > STAGE_RATIO_BREAK_POINT.HORIZONTAL && column.fitHorizontal && !isRandomSquare) {
    // Horizontal
    slot = STAGE_HORIZONTAL_BASE_CONTINUOUS
    width = base * STAGE_HORIZONTAL_BASE_CONTINUOUS + horizontalGap
    height = base
  } else if (data.aspectRatio < STAGE_RATIO_BREAK_POINT.VERTICAL && !isRandomSquare) {
    // Vertical
    slot = 1
    width = base
    height = base * STAGE_VERTICAL_BASE_CONTINUOUS + verticalGap
  } else {
    // Square
    const isRandomSquareLarge = range(0, 3) < 1
    if (isRandomSquareLarge && column.fitHorizontal) {
      slot = STAGE_HORIZONTAL_BASE_CONTINUOUS
      width = base * STAGE_HORIZONTAL_BASE_CONTINUOUS + horizontalGap
      height = base * STAGE_VERTICAL_BASE_CONTINUOUS + verticalGap
    } else {
      slot = 1
      width = base
      height = base
    }
  }
  const fullWidth = width + SAFE_PADDING * 2
  const fullHeight = height + SAFE_PADDING * 2 + SAFE_LABEL_HEIGHT
  return {
    slot,
    base,
    width,
    height,
    fullWidth,
    fullHeight,
  }
}
const getStagePosition = (screenSize: Size, column: ReturnType<typeof getStageColumn>, imageSize: ReturnType<typeof getStageSize>) => {
  const left = column.index * (imageSize.base + SAFE_PADDING * 2) + SAFE_PADDING
  const top = column.height + SAFE_PADDING * 2
  return {
    left,
    top,
  }
}
export const getStageRect = (data: Pic, screenSize: Size, columnsRef: { current: Rect[][] }) => {
  const column = getStageColumn(columnsRef)
  const size = getStageSize(screenSize, data, column)
  const position = getStagePosition(screenSize, column, size)
  const rect = {
    ...size,
    ...position,
    angle: 0,
  }
  for (let i = 0; i <= size.slot - 1; i++) {
    columnsRef.current[column.index + i]?.push(rect)
  }
  return rect
}
