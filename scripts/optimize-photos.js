#!/usr/bin/env node
/*
 * 把 src/assets 下的照片压缩并转成 web 友好的 webp,并把文件名里的尺寸更新为优化后
 * 的真实尺寸。建议在 build:photo-rename 之后运行(依赖 `日期.宽×高` 前缀里的日期)。
 *   yarn build:photo-optimize
 * 需要 sharp(可选 devDependency):  npm i -D sharp
 */
const fs = require('fs')
const path = require('path')

let sharp
try {
  sharp = require('sharp')
} catch (e) {
  console.error('需要 sharp。先安装:  npm i -D sharp   然后重试。')
  process.exit(1)
}

const dir = path.join(__dirname, '..', 'src', 'assets')
const MAX_EDGE = 2048 // 最长边像素
const QUALITY = 82
const SEP = '×' // 全角乘号 ×(文件名约定的尺寸分隔符)

;(async () => {
  const files = fs.readdirSync(dir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
  if (!files.length) {
    console.log('src/assets 下没有可优化的图片。')
    return
  }
  console.log(`优化 ${files.length} 张(最长边 ${MAX_EDGE}, q${QUALITY}, → webp)...`)
  let ok = 0
  for (const f of files) {
    const src = path.join(dir, f)
    const date = f.split('.')[0] // 保留日期前缀,尺寸用优化后真实值重算
    const tmp = path.join(dir, `.tmp-${date}-${f}.webp`)
    try {
      const info = await sharp(src)
        .rotate()
        .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(tmp)
      const out = path.join(dir, `${date}.${info.width}${SEP}${info.height}.webp`)
      fs.renameSync(tmp, out)
      if (path.resolve(src) !== path.resolve(out)) fs.rmSync(src)
      console.log(`  ${f} → ${path.basename(out)}`)
      ok++
    } catch (e) {
      if (fs.existsSync(tmp)) fs.rmSync(tmp)
      console.error(`  失败 ${f}: ${e.message}`)
    }
  }
  console.log(`完成:${ok}/${files.length}`)
})()
