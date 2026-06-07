// Utils
import { loadAllFrom } from './utils'
// Assets
export const assets = loadAllFrom(require.context('./assets', false, /\.(png|jpe?g|svg|webp)$/i)) as string[]

// require.context 在旧版 react-scripts 下会把每个文件返回两次, 这里按 URL 去重即可;
// 新版构建每个文件只出现一次, Set 去重后等价于原数组, 避免再用 length/2 误删一半图片
const assetsRemoveRepeat = Array.from(new Set(assets))
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
