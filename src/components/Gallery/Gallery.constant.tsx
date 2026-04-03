import { PARALLAX_INNER_PADDING } from 'components/Parallax/Parallax.constant'
import {
  PICTURE_INNER_PADDING,
  PICTURE_LABEL_LINE_HEIGHT,
  PICTURE_LABEL_MARGIN_BOTTOM,
  PICTURE_LABEL_MARGIN_TOP
} from 'components/Picture/Picture.constant'

export const SAFE_PADDING = PARALLAX_INNER_PADDING + PICTURE_INNER_PADDING
export const SAFE_LABEL_HEIGHT = PICTURE_LABEL_LINE_HEIGHT + PICTURE_LABEL_MARGIN_TOP + PICTURE_LABEL_MARGIN_BOTTOM

export enum GalleryViewMode {
  random,
  sequential,
  stage,
}

export const VIEW_MODE_LABELS: Record<number, string> = {
  [GalleryViewMode.random]: '随心',
  [GalleryViewMode.sequential]: '时光',
  [GalleryViewMode.stage]: '拼图',
}

// i18n
const TITLES: Record<string, string> = {
  zh: '大咪成长史',
  en: "Meow's Story",
  ja: 'ニャンの成長記',
  ko: '냥이 성장기',
  fr: "L'histoire de Miaou",
  de: 'Miezis Geschichte',
  es: 'La historia de Miau',
  pt: 'A história do Miau',
  it: 'La storia di Miao',
  ru: 'История Мяу',
  ar: 'قصة مياو',
  hi: 'म्याऊ की कहानी',
  th: 'เรื่องราวของเหมียว',
  vi: 'Câu chuyện của Meo',
  tr: "Miyav'ın Hikâyesi",
  nl: 'Het verhaal van Miauw',
}

export const getLocalizedTitle = (): string => {
  const lang = (navigator.language || 'en').toLowerCase()
  const primary = lang.split('-')[0]
  return TITLES[primary] || TITLES[lang] || TITLES.en
}

// RANDOM
export const RANDOM_MIN_WIDTH = 200
export const RANDOM_MAX_WIDTH = 400

// SEQUENTIAL
export const SEQUENTIAL_BREAK_POINT = 300

// STAGE
export const STAGE_BREAK_POINT = 400
export const STAGE_RATIO_BREAK_POINT = {
  // 中间值则按方形约束, 基准 1:1
  VERTICAL: 0.8, // 大于此值被认定为竖直图像, 基准 1:2
  HORIZONTAL: 1.2, // 小于此值被认定为水平图像, 基准 2:1
}
export const STAGE_VERTICAL_BASE_CONTINUOUS = 2 // 垂直连续基准数
export const STAGE_HORIZONTAL_BASE_CONTINUOUS = 2 // 水平连续基准数
