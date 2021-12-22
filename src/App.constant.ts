// Utils
import { loadAllFrom } from './utils'
// Assets
export const assets = loadAllFrom(require.context('./assets', false, /\.(png|jpe?g|svg|webp)$/i)) as string[]

export const TIME_DATA = assets.reduce((acc, cur) => {
  try {
    const [date, dimension, title, desc] = (cur.split('/').last?.split('.') || [])[0].split('.')
    const [width, height] = dimension.split('×')
    acc.push({
      date,
      width: Number(width),
      height: Number(height),
      title,
      desc,
      path: cur
    })
  } catch (e) {
    console.error('Loading asset error:', e)
  }
  return acc
}, [] as Time[])
