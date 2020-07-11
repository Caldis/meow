const ARROW_TOP_OFFSET = 2
const ARROW_LEFT_OFFSET = -7.5
const BOX_TOP_OFFSET = -90
const BOX_LEFT_OFFSET = 0
const LEFT_SHOW_OFFSET = 60
const LEFT_HIDE_OFFSET = 60

export enum TransPhase {
  hiding,
  entering,
  following,
  leaving,
}

const SCALE_Y = 1.0
export const DetailArrowTransPhaseStyle = (top = 0) => ({
  [TransPhase.hiding]: {
    opacity: 0,
    transition: 'none',
    transform: `translate(${LEFT_HIDE_OFFSET + ARROW_LEFT_OFFSET}px, 50vh) scaleY(${SCALE_Y})`
  },
  [TransPhase.entering]: {
    opacity: 1,
    transition: 'all .4s',
    transform: `translate(${LEFT_SHOW_OFFSET + ARROW_LEFT_OFFSET}px, ${top + ARROW_TOP_OFFSET}px) scaleY(${SCALE_Y})`
  },
  [TransPhase.following]: {
    opacity: 1,
    transition: 'all .15s',
    transform: `translate(${LEFT_SHOW_OFFSET + ARROW_LEFT_OFFSET}px, ${top + ARROW_TOP_OFFSET}px) scaleY(${SCALE_Y})`
  },
  [TransPhase.leaving]: {
    opacity: 0,
    transition: 'all .4s',
    transform: `translate(${LEFT_SHOW_OFFSET + ARROW_LEFT_OFFSET}px, ${top + ARROW_TOP_OFFSET}px) scaleY(${SCALE_Y})`
  },
})
export const DetailBoxTransPhaseStyle = (top = 0) => ({
  [TransPhase.hiding]: {
    opacity: 0,
    transition: 'none',
    transform: `translate(${LEFT_HIDE_OFFSET + BOX_LEFT_OFFSET}px, calc(50vh - ${-BOX_TOP_OFFSET}px)`
  },
  [TransPhase.entering]: {
    opacity: 1,
    transition: 'all .4s',
    transform: `translate(${LEFT_SHOW_OFFSET + BOX_LEFT_OFFSET}px, ${top + BOX_TOP_OFFSET}px)`
  },
  [TransPhase.following]: {
    opacity: 1,
    transition: 'all .4s',
    transform: `translate(${LEFT_SHOW_OFFSET + BOX_LEFT_OFFSET}px, ${top + BOX_TOP_OFFSET}px)`
  },
  [TransPhase.leaving]: {
    opacity: 0,
    transition: 'all .4s',
    transform: `translate(${LEFT_SHOW_OFFSET + BOX_LEFT_OFFSET}px, ${top + BOX_TOP_OFFSET}px)`
  },
})
