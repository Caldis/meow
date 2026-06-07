# 大咪成长史 · meow

> 一面献给折耳猫「大咪」的照片墙 —— 把一只猫的成长岁月做成可以把玩的网页。

🔗 **在线访问：https://meow.caldis.me**

![React](https://img.shields.io/badge/React-17-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-4.4-3178c6?logo=typescript&logoColor=white)
![SCSS Modules](https://img.shields.io/badge/SCSS-modules-cc6699?logo=sass&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/deploy-GitHub%20Pages-222?logo=github&logoColor=white)

51 张照片、零后端、纯静态，部署在 GitHub Pages 上。所有动效都尽量做到「物理感」与「胶片质感」。

---

## ✨ 功能特性

- **三种浏览视图**，切换时卡片以 [FLIP](https://aerotwist.com/blog/flip-your-animations/) 动画平滑滑动到新布局，而非瞬移：
  - **随心 (Free)** —— 随机散布、可拖拽、相互叠压的散落式照片堆
  - **时光 (Timeline)** —— 按拍摄日期排列的时间线
  - **拼图 (Mosaic)** —— 紧凑的瀑布流／马赛克网格
- **重复点击当前视图的标签** 即翻转排序方向（正序 ⇄ 倒序），右侧排序图标的三条横杠会随之形变过渡。
- **点击放大（Lightbox）**：图片原位展开（效果同 [react-zmage](https://github.com/Caldis/react-zmage)）；点击图片外部、或滚动滚轮（带防误触阈值）皆可退出；放大时顶栏与底部 dock 位移出屏 + crossfade，让照片独占舞台。
- **明暗双模式**：暖色奶油浅色 / 沉稳暗色，默认跟随系统并记忆选择，首屏无闪烁。右上角切换按钮带 **太阳⇄月亮形变**，并联动 **整页圆形揭示（wipe）** 切换背景。
- **平滑滚动**：桌面端为 wheel 驱动的虚拟平滑滚动；触屏端自动降级为原生惯性滚动。
- **卡片微交互**：hover 视差倾斜 + 高光/镭射反光。
- **底部 Dock**（iPadOS 风格）：作者其他作品外链（Mos / Zmage / 本仓库）+「喂胖大咪」打赏弹窗（PayPal / Buy Me a Coffee，简体中文访客额外显示支付宝 / 微信二维码）。
- **16 种语言**：标题、标签、dock、打赏文案全部国际化，默认跟随浏览器语言。
- **隐私**：发布前会从照片 EXIF 中移除 GPS 定位信息。
- **GA4 埋点**：主题切换、排序、点击外链、打开打赏等关键交互均有事件上报。
- **开发调试面板**（仅 dev，左下角，可折叠）：实时调节拖拽 / 高光 / 滚轮退出阈值等参数，并可切换页面语言。

## 🛠 技术栈

- **React 17 + TypeScript**，基于 Create React App（`react-scripts` 5）
- **SCSS Modules** + 一套 CSS 变量令牌实现运行时换肤（`src/App.reset.scss`）
- 照片通过 `require.context` 在构建期静态打包，**无后端、无数据库**
- 字体：Instrument Serif + DM Sans（Google Fonts）
- 动画：原生 WAAPI / CSS transition + FLIP，不依赖动画库

## 🚀 本地开发

```bash
yarn install
yarn start          # 启动 dev server（http://localhost:3000）
```

> 包管理器使用 yarn（见 `packageManager` 字段），用 npm 亦可。

## 🖼 添加 / 管理照片

照片源文件放在 `src/assets/` 目录下。代码靠**文件名**解析日期与尺寸，格式为：

```
YYYY-MM-DD.宽×高.扩展名          例如  2017-09-06.2049×1537.webp
            └ 全角乘号 ×
```

把新照片（jpg/jpeg）放进 `src/assets/` 后，依次执行两个脚本完成规范化：

```bash
yarn build:photo-rename      # 读取 EXIF 拍摄日期 + 图片尺寸，重命名为上面的格式
yarn build:photo-clean-gps   # 抹掉 EXIF 里的 GPS 定位信息（隐私）
```

- `build:photo-rename`（`src/assets/rename.js`）：从 EXIF `DateTimeOriginal` 取拍摄日期，配合 `image-size` 读出宽高；无日期则回退用原文件名作前缀。
- `build:photo-clean-gps`（`src/assets/clean-gps.js`）：用 `piexif` 删除 GPS 段后写回。

> 重命名后建议把大图压缩 / 转为 `.webp` 以减小体积（解析器只认 `日期.宽×高` 前缀，扩展名随意）。

## 📦 构建与部署

站点托管在 **GitHub Pages**，Source = `master` 分支的 **`/docs`** 目录（无 CI workflow，Pages 直接 serve `docs/`）。

```bash
yarn build:code     # = react-scripts build，然后把 build/ 的产物搬进 docs/
```

⚠️ **注意**：请用 `build:code`，**不要**用 `npm run build`（它会先跑未定义的 `build:photo` 而失败）。

发布流程：

```bash
yarn build:code
git add docs                       # 连同源码一起提交
git commit -m "chore: build docs for deployment"
git push origin master             # 推送后 GitHub Pages 自动重新部署（CDN ~30s 生效）
```

`scripts/build-code.js` 只清理它自己生成的产物（`index.html` / `static` / `manifest.json` 等），`docs/CNAME` 等自定义文件会被保留。

## 🗂 项目结构

```
src/
├─ assets/                 照片源文件 + rename.js / clean-gps.js 处理脚本
├─ App.constant.ts         require.context 加载照片 + 解析文件名 → GALLERY_DATA
├─ App.reset.scss          CSS 变量主题令牌（:root 暗色 / html.light 浅色）
├─ components/
│  ├─ Gallery/             主画廊：三视图布局、FLIP、虚拟/原生滚动、调试面板
│  ├─ Picture/             单张卡片：lightbox、拖拽、视差、高光
│  ├─ Tab/                 顶部视图切换标签（含排序指示器）
│  ├─ Footer/              底部 dock + 项目外链
│  ├─ Donate/              「喂胖大咪」打赏弹窗
│  ├─ ThemeToggle/         明暗切换按钮（形变图标 + 圆形揭示）
│  └─ Parallax/            hover 视差
├─ utils/
│  ├─ i18n.ts              16 语言文案表
│  └─ analytics.ts         GA4 事件封装
scripts/
└─ build-code.js           构建并把产物搬进 docs/
docs/                       构建产物（GitHub Pages 部署目录，提交进仓库）
```

---

*Made with ❤️ for 大咪.*
