// Utils
import { loadAllFrom } from './utils'
// Assets
export const assets = loadAllFrom(require.context('./assets', false, /\.(png|jpe?g|svg|webp)$/i)) as string[]

const assetsRemoveRepeat = assets.slice(0, assets.length / 2)
export const GALLERY_DATA = assetsRemoveRepeat.reduce((acc, cur) => {
  try {
    const [date, dimension, title, desc] = (cur.split('/').last?.split('.') || [])
    const [width, height] = dimension.split('×')
    acc.push({
      date,
      width: Number(width),
      height: Number(height),
      aspectRatio: Number(width) / Number(height),
      title,
      desc,
      path: cur
    })
  } catch (e) {
    console.error('Loading asset error:', e)
  }
  return acc
}, [] as Pic[])
