const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// 获取项目根目录路径(当前脚本在scripts目录下)
const rootDir = path.join(__dirname, '..')
const buildPath = path.join(rootDir, 'build')
const docsPath = path.join(rootDir, 'docs')

// 站点配置(构建期个性化的单一来源,运行时由 src/config/site.config.ts 同源 import)。
// gaMeasurementId → 注入 index.html 的 %REACT_APP_GA_MEASUREMENT_ID% 占位;
// domain → 生成 docs/CNAME。fork 者只改这个 JSON。
let siteBuildConfig = { domain: '', gaMeasurementId: '' }
try {
  siteBuildConfig = require(path.join(rootDir, 'src', 'config', 'site.config.json'))
} catch (e) {
  console.warn('未找到 src/config/site.config.json, 使用空值(无 GA / 无 CNAME)')
}
const docsGeneratedEntries = [
  'asset-manifest.json',
  'favicon.ico',
  'index.html',
  'logo192.png',
  'logo512.png',
  'manifest.json',
  'robots.txt',
  'static'
]

// 执行 react-scripts build
console.log('开始构建...')
try {
  execSync('react-scripts build', {
    stdio: 'inherit',
    cwd: rootDir,  // 在项目根目录执行构建命令
    // CRA 的 InterpolateHtmlPlugin 会把 index.html 里的
    // %REACT_APP_GA_MEASUREMENT_ID% 替换为这里传入的值(空则替换为空串 = 不追踪)。
    env: { ...process.env, REACT_APP_GA_MEASUREMENT_ID: siteBuildConfig.gaMeasurementId || '' },
  })
} catch (err) {
  console.error('构建失败:', err)
  process.exit(1)
}

// 确保 docs 目录存在
if (!fs.existsSync(docsPath)) {
  fs.mkdirSync(docsPath, { recursive: true })
}

function cleanDocsOutput(destPath) {
  for (const entry of docsGeneratedEntries) {
    const entryPath = path.join(destPath, entry)

    if (!fs.existsSync(entryPath)) {
      continue
    }

    fs.rmSync(entryPath, { recursive: true, force: true })
  }
}

console.log('\n正在移动文件到 docs 目录...')

try {
  // 递归复制函数
  function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true })
    }

    const files = fs.readdirSync(src)

    for (const file of files) {
      const srcPath = path.join(src, file)
      const destPath = path.join(dest, file)
      const stat = fs.statSync(srcPath)

      if (stat.isDirectory()) {
        copyDir(srcPath, destPath)
      } else {
        fs.copyFileSync(srcPath, destPath)
      }
    }
  }

  cleanDocsOutput(docsPath)
  copyDir(buildPath, docsPath)

  // 生成/移除 docs/CNAME(GitHub Pages 自定义域名)。按 config.domain 生成,而不是
  // 依赖手工保留——否则 fork 会继续占用原作者域名(两个 Pages 仓库不能同域)。
  const cnamePath = path.join(docsPath, 'CNAME')
  if (siteBuildConfig.domain) {
    fs.writeFileSync(cnamePath, siteBuildConfig.domain + '\n')
    console.log('已生成 CNAME:', siteBuildConfig.domain)
  } else if (fs.existsSync(cnamePath)) {
    fs.rmSync(cnamePath)
    console.log('未配置 domain, 已移除 CNAME')
  }

  // 删除 build 目录
  fs.rmSync(buildPath, { recursive: true, force: true })

  console.log('完成! 构建文件已移动到 docs 目录')
} catch (err) {
  console.error('移动文件时出错:', err)
  process.exit(1)
}
