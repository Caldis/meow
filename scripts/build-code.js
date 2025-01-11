const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// 获取项目根目录路径(当前脚本在scripts目录下)
const rootDir = path.join(__dirname, '..')

// 执行 react-scripts build
console.log('开始构建...')
try {
  execSync('react-scripts build', {
    stdio: 'inherit',
    cwd: rootDir  // 在项目根目录执行构建命令
  })
} catch (err) {
  console.error('构建失败:', err)
  process.exit(1)
}

// 确保 docs 目录存在
const docsPath = path.join(rootDir, 'docs')
if (!fs.existsSync(docsPath)) {
  fs.mkdirSync(docsPath)
}

// 复制 build 目录内容到 docs
const buildPath = path.join(rootDir, 'build')
console.log('\n正在移动文件到 docs 目录...')

try {
  // 递归复制函数
  function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest)
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

  copyDir(buildPath, docsPath)

  // 删除 build 目录
  fs.rmSync(buildPath, { recursive: true })

  console.log('完成! 构建文件已移动到 docs 目录')
} catch (err) {
  console.error('移动文件时出错:', err)
  process.exit(1)
}