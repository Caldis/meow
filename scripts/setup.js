#!/usr/bin/env node
/*
 * 照片墙模板初始化向导。
 *   yarn setup
 * 写入 src/config/site.config.json(域名 / GA / 标题 / 描述 / manifest 名称),
 * 可选清空示例照片,并打印 site.config.ts(主角名 / 打赏 / dock)的后续指引。
 * 支持管道非交互:  printf 'Rex\n\n\n\n\nN\n' | node scripts/setup.js
 */
const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rootDir = path.join(__dirname, '..')
const jsonPath = path.join(rootDir, 'src', 'config', 'site.config.json')
const assetsDir = path.join(rootDir, 'src', 'assets')

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const ask = (q, def = '') =>
  new Promise((res) => rl.question(def ? `${q} [${def}]: ` : `${q}: `, (a) => res(String(a || '').trim() || def)))

;(async () => {
  console.log('\n📷  照片墙模板初始化(直接回车用默认值 / 留空)\n')

  const name = await ask('主角名(如 Rex / 你家猫名)', 'Meow')
  const domain = await ask('自定义域名(GitHub Pages,留空则无)', '')
  const ga = await ask('GA4 Measurement ID(留空 = 不开启分析)', '')
  const story = `${name}'s Story`
  const htmlTitle = await ask('浏览器标签标题', `${name.toUpperCase()} | ${story}`)
  const description = await ask('站点描述(SEO meta)', `${story} — a photo wall.`)
  const clear = (await ask('清空示例照片 src/assets/*.{webp,jpg,png}?(y/N)', 'N')).toLowerCase() === 'y'

  const json = {
    domain,
    gaMeasurementId: ga,
    htmlTitle,
    description,
    manifestShortName: name.toUpperCase().slice(0, 12),
    manifestName: htmlTitle,
  }
  fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2) + '\n')
  console.log(`\n✅  已写入 ${path.relative(rootDir, jsonPath)}`)

  if (clear) {
    const imgs = fs.readdirSync(assetsDir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
    imgs.forEach((f) => fs.rmSync(path.join(assetsDir, f)))
    console.log(`🗑   已删除 ${imgs.length} 张示例照片`)
  }

  console.log(`
下一步：
  1. 把你的照片放进 src/assets/，依次跑：
       yarn build:photo-rename      # 按 EXIF 日期+尺寸重命名
       yarn build:photo-clean-meta  # 抹掉敏感信息(GPS 定位 + 设备/拍摄者标识)
       yarn build:photo-optimize    # (可选) 压缩 / 转 webp，需先 npm i -D sharp
  2. 编辑 src/config/site.config.ts：
       - subject.name: { en: '${name}', /* 其它语言可选 */ }
       - donate.enabled / dock.enabled: 默认 false；想要才打开并填自己的账号 / 项目
  3. 上线：
       yarn build:code && git add docs && git commit -m "deploy" && git push
  （自定义域名记得在仓库 Settings → Pages 里设置）
`)
  rl.close()
})()
