// Utils
import { loadAllFrom } from './utils'
// Assets
export const assets = loadAllFrom(require.context('./assets', false, /\.(png|jpe?g|svg|webp)$/i)) as string[]
console.log(assets)

export const TIME_DATA = assets.reduce((acc, cur) => {
  try {
    const base = (cur.split('/').last?.split('.') || [])[0].split('·')
    const date = base[0]
    const title = base[1]
    const desc = base[2]
    acc.push({ title, desc, date, path: cur })
  } catch (e) {
    console.error('Loading asset error:', e)
  }
  return acc
}, [] as Time[])
