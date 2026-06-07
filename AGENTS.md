# meow

个人照片相册,React (CRA / react-scripts 5) + TypeScript,部署到 GitHub Pages(`master` 分支的 `docs/` 目录,域名见 `CNAME`)。

照片资源放在 `src/assets/`,通过 `src/App.constant.ts` 的 `require.context` 自动加载;文件名格式 `YYYY-MM-DD.宽×高.webp`(`×` 为 U+00D7),日期和尺寸从文件名解析。

## 构建与发布

```bash
yarn start         # 本地开发
yarn build:code    # 构建并输出到 docs/(GitHub Pages 发布目录)
```

## Skills(claude code / codex 通用)

可复用的工作流放在仓库根目录的 `skills/`(刻意不放在厂商专属目录下,两个工具都能读)。每个子目录有一个 `SKILL.md` 说明 + 配套脚本。**做对应任务前先读相关的 `SKILL.md` 再动手。**

- `skills/photo-publish/` —— 用户给出新照片(单个文件或一个目录)要加进相册/发布时使用:转 webp、限制尺寸、清除 EXIF、按日期命名、构建并推送。
