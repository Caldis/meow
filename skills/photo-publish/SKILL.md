---
name: photo-publish
description: 增量处理用户新提供的照片(单个文件或一个装满照片的目录)并发布到 meow 相册 —— 转 webp、限制尺寸、清除 EXIF、按拍摄日期命名,然后构建并推送。当用户给出新照片要加进相册/发布时使用。
---

# photo-publish

把用户新给的照片增量加入 meow 相册并发布。输入可以是**单个图片文件**,也可以是**一个装满照片的目录**。

## 处理规范(2026-06 与用户确认)

- **格式**:webp,质量 **80**
- **尺寸**:最长边 **≤ 2560px**,不放大小图(大图必须缩放才会真正变小,不缩放时 webp 可能比原图还大)
- **元数据**:清除全部 EXIF/GPS(`cwebp -metadata none`)
- **命名**:`YYYY-MM-DD.宽×高.webp`(`×` 是 U+00D7,不是字母 x)
  - 日期取自原图 EXIF `DateTimeOriginal`,取不到则回退到文件 mtime
  - 宽高用 webp 实际输出尺寸
- **目标**:`src/assets/`,相册通过 `require.context` 自动加载;**原图保持不动**
- **增量/不覆盖**:同名(同日期同尺寸)会自动追加序号 `.2`,不会覆盖已有资源

## 步骤

1. 确认 `cwebp`(libwebp)已安装。macOS:`brew install webp`。heic/heif 还需要 macOS 自带的 `sips`。
2. 处理图片(支持 jpg/jpeg/png/heic/heif):
   ```bash
   # 先 dry-run 确认命名,再正式执行
   node skills/photo-publish/process-photos.js <文件或目录> --dry
   node skills/photo-publish/process-photos.js <文件或目录>
   # 可选:--dest <目录> 改输出目录,--recursive 递归子目录
   ```
3. 构建(产物输出到 `docs/` 供 GitHub Pages 发布):
   ```bash
   yarn build:code
   ```
4. 校验所有图片都会显示:构建后 `docs` 主 bundle 里 require.context 的 key 数应当等于 `src/assets` 图片数,且新日期出现在 bundle 中。
5. 发布:提交(新增 webp + docs 构建产物)并推送到 `master`(GitHub Pages 从 `master` 的 `docs/` 发布)。

## 注意

- **不要**在 `src/App.constant.ts` 里恢复 `assets.slice(0, length/2)`:那是旧版 react-scripts 下 require.context 会重复返回时的去重 hack,新版构建每个文件只出现一次,这行会**隐藏一半相册**。现已改为 `Array.from(new Set(assets))`。
- `src/assets/rename.js` + `clean-meta.js`(jpg 改名 + 抹敏感信息,不压缩;配合可选的 `scripts/optimize-photos.js` 压缩转 webp)是**模板自带的可移植照片管线**(纯 node 依赖,跨平台)。本 skill 是大咪本机基于 `cwebp` 的一步到位工作流——两者都可用,本机优先用本 skill。
- 重复对**同一批**输入运行会产生 `.2` 序号副本,只对**新照片**运行即可。
