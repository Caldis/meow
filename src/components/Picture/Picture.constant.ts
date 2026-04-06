export const PICTURE_VISIBLE_INTERVAL = 300
export const PICTURE_INNER_PADDING = 7
export const PICTURE_LABEL_LINE_HEIGHT = 18
export const PICTURE_LABEL_MARGIN_TOP = 5
export const PICTURE_LABEL_MARGIN_BOTTOM = 2

export interface PictureHighlightTuning {
  specularGain: number
  foilGain: number
  shiftGain: number
}

export const DEFAULT_PICTURE_HIGHLIGHT_TUNING: PictureHighlightTuning = {
  specularGain: 1,
  foilGain: 1,
  shiftGain: 1,
}
