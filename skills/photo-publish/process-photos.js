#!/usr/bin/env node
/**
 * 增量处理新照片 -> meow 相册 webp 资源
 *
 * 用法:
 *   node skills/photo-publish/process-photos.js <文件或目录> [--dest <目录>] [--dry] [--recursive]
 *
 * 规范(2026-06 确认):
 *   - 输出 webp, 质量 80, 最长边 <= 2560(不放大), 清除全部 EXIF/GPS
 *   - 命名 `YYYY-MM-DD.宽×高.webp`(× 为 U+00D7), 日期取自 EXIF DateTimeOriginal, 取不到则用文件 mtime
 *   - 目标目录默认 src/assets/; 原图保持不动; 不覆盖已存在文件(同名追加序号)
 *   - 支持 jpg/jpeg/png; heic/heif 在 macOS 上用 sips 自动转 png 后处理
 */
const fs = require('fs')
const path = require('path')
const os = require('os')
const { execFileSync } = require('child_process')

const REPO_ROOT = path.resolve(__dirname, '..', '..')
const NODE_MODULES = path.join(REPO_ROOT, 'node_modules')
const MUL = '×' // U+00D7
const MAX_SIDE = 2560
const QUALITY = 80
const IMAGE_RE = /\.(jpe?g|png|heic|heif)$/i

// ---- 依赖(来自项目 node_modules)----
function req(name) {
  try { return require(path.join(NODE_MODULES, name)) }
  catch (e) { fail(`缺少依赖 ${name}, 请在项目根目录执行 yarn install`) }
}
const Exif = req('exif-js')
const sizeOf = req('image-size')
const moment = req('moment')

// ---- 参数解析 ----
const argv = process.argv.slice(2)
const flags = { dry: false, recursive: false, dest: path.join(REPO_ROOT, 'src', 'assets') }
const positional = []
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (a === '--dry') flags.dry = true
  else if (a === '--recursive') flags.recursive = true
  else if (a === '--dest') flags.dest = path.resolve(argv[++i])
  else positional.push(a)
}
if (!positional.length) fail('请提供输入路径(文件或目录)\n用法: node skills/photo-publish/process-photos.js <文件或目录> [--dest <目录>] [--dry] [--recursive]')
const input = path.resolve(positional[0])

function fail(msg) { console.error('✗ ' + msg); process.exit(1) }
function which(bin) { try { execFileSync('which', [bin], { stdio: 'ignore' }); return true } catch { return false } }

if (!which('cwebp')) fail('未找到 cwebp(libwebp)。macOS: brew install webp')
if (!fs.existsSync(input)) fail(`输入不存在: ${input}`)
if (!flags.dry && !fs.existsSync(flags.dest)) fail(`目标目录不存在: ${flags.dest}`)

// ---- 收集待处理图片 ----
function collect(p) {
  const st = fs.statSync(p)
  if (st.isFile()) return IMAGE_RE.test(p) ? [p] : []
  const out = []
  for (const name of fs.readdirSync(p)) {
    if (name.startsWith('.')) continue
    const full = path.join(p, name)
    const s = fs.statSync(full)
    if (s.isDirectory()) { if (flags.recursive) out.push(...collect(full)) }
    else if (IMAGE_RE.test(name)) out.push(full)
  }
  return out
}
const files = collect(input).sort()
if (!files.length) fail('没有找到可处理的图片(jpg/jpeg/png/heic/heif)')
console.log(`找到 ${files.length} 张图片, 目标 ${flags.dest}${flags.dry ? ' [dry-run]' : ''}\n`)

// ---- 工具函数 ----
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'photo-publish-'))
let tmpSeq = 0
function tmpFile(ext) { return path.join(TMP, `t${tmpSeq++}${ext}`) }

// heic/heif -> png(macOS sips)
function ensureRasterReadable(src) {
  if (!/\.(heic|heif)$/i.test(src)) return { file: src, cleanup: null }
  if (!which('sips')) fail('heic/heif 需要 macOS 的 sips 命令')
  const png = tmpFile('.png')
  execFileSync('sips', ['-s', 'format', 'png', src, '--out', png], { stdio: 'ignore' })
  return { file: png, cleanup: png }
}

// 读取拍摄日期: EXIF DateTimeOriginal -> 文件 mtime
function readDate(originalSrc) {
  try {
    const data = Exif.readFromBinaryFile(fs.readFileSync(originalSrc).buffer)
    const m = moment(data.DateTimeOriginal, 'YYYY:MM:DD HH:mm:ss')
    if (m.isValid()) return m.format('YYYY-MM-DD')
  } catch { /* 忽略, 走 fallback */ }
  return moment(fs.statSync(originalSrc).mtime).format('YYYY-MM-DD')
}

// 编码 webp: 最长边 <= MAX_SIDE(不放大), 清元数据
function encodeWebp(rasterSrc, destWebp) {
  const { width, height } = sizeOf(rasterSrc)
  const args = ['-quiet', '-q', String(QUALITY), '-metadata', 'none', '-mt']
  if (Math.max(width, height) > MAX_SIDE) {
    if (width >= height) args.push('-resize', String(MAX_SIDE), '0')
    else args.push('-resize', '0', String(MAX_SIDE))
  }
  args.push(rasterSrc, '-o', destWebp)
  execFileSync('cwebp', args, { stdio: ['ignore', 'ignore', 'pipe'] })
  const o = sizeOf(destWebp)
  return { srcW: width, srcH: height, outW: o.width, outH: o.height }
}

// 不覆盖: 同名追加序号(放在 title 段, 形如 date.W×H.2.webp)
function resolveTarget(dir, date, w, h) {
  const base = `${date}.${w}${MUL}${h}`
  let p = path.join(dir, `${base}.webp`)
  let n = 2
  while (fs.existsSync(p)) { p = path.join(dir, `${base}.${n}.webp`); n++ }
  return p
}

// ---- 主流程 ----
const results = []
for (const src of files) {
  const name = path.basename(src)
  let raster
  try {
    raster = ensureRasterReadable(src)
    const date = readDate(src)
    const tmpWebp = tmpFile('.webp')
    const dim = encodeWebp(raster.file, tmpWebp)
    const target = resolveTarget(flags.dest, date, dim.outW, dim.outH)
    const before = fs.statSync(src).size
    const after = fs.statSync(tmpWebp).size
    if (!flags.dry) fs.renameSync(tmpWebp, target)
    results.push({ before, after })
    const tag = `${dim.srcW}${MUL}${dim.srcH}->${dim.outW}${MUL}${dim.outH}`
    console.log(`  ${flags.dry ? '·' : '✓'} ${name} -> ${path.basename(target)}  ${(before / 1024 | 0)}KB->${(after / 1024 | 0)}KB  ${tag}`)
  } catch (e) {
    console.error(`  ✗ ${name}: ${e.message}`)
  } finally {
    if (raster && raster.cleanup) { try { fs.rmSync(raster.cleanup) } catch {} }
  }
}

try { fs.rmSync(TMP, { recursive: true, force: true }) } catch {}

const tb = results.reduce((a, r) => a + r.before, 0)
const ta = results.reduce((a, r) => a + r.after, 0)
const pct = tb ? (100 - ta / tb * 100).toFixed(0) : 0
console.log(`\n完成 ${results.length}/${files.length} 张 | ${(tb / 1048576).toFixed(1)}MB -> ${(ta / 1048576).toFixed(1)}MB (-${pct}%)`)
if (!flags.dry) {
  console.log('\n下一步: yarn build:code  然后 提交并推送(GitHub Pages 从 docs/ 发布)')
}
