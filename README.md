# meow · 照片墙模板

> 一面可把玩的照片墙 —— 你可以 fork 下来、放上你自己的照片、改 **一个** 配置文件、即可部署上线。纯静态、零后端、托管在 GitHub Pages。

🔗 **在线示例「大咪成长史」：https://meow.caldis.me**

![React](https://img.shields.io/badge/React-17-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-4.4-3178c6?logo=typescript&logoColor=white)
![SCSS Modules](https://img.shields.io/badge/SCSS-modules-cc6699?logo=sass&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/deploy-GitHub%20Pages-222?logo=github&logoColor=white)

这是一个 **fork-and-fill 模板**：引擎（动画、视图、主题、国际化等可复用逻辑）和站点身份（你是谁、放谁的照片、链到哪、收不收打赏）被彻底拆开。你只需要编辑站点身份层，引擎原封不动。

> 在线示例里的猫咪照片属于示例内容——`yarn setup` 向导（或手动清空 `src/assets/`）会把这些样例照片清掉，换成你自己的。

---

## ✨ 功能

- **三种浏览视图**，切换时卡片以 [FLIP](https://aerotwist.com/blog/flip-your-animations/) 动画平滑滑动到新布局（而非瞬移）：随心散落 / 时间线 / 马赛克拼图。重复点击当前视图标签即翻转排序方向，右侧排序图标随之形变过渡。
- **点击放大（Lightbox）**：图片原位展开，点击外部或滚轮（带防误触阈值）退出；放大时顶栏与底部 dock 位移出屏 + crossfade，让照片独占舞台。
- **明暗双模式**：太阳⇄月亮**形变切换按钮**，联动整页**圆形揭示（circular reveal / wipe）**换肤；默认跟随系统、记忆选择、首屏无闪烁。
- **平滑滚动**：桌面端为 wheel 驱动的虚拟平滑滚动，触屏端自动降级为原生惯性滚动。
- **可选的底部 dock**：作者其他作品的交叉推广外链 + **打赏弹窗**（PayPal / Buy Me a Coffee，简体中文访客额外显示支付宝 / 微信二维码）。两者均可一键关闭。
- **16 种语言标题**：只填一个名字，引擎按每种语言的模板生成标题（`{name}成长史` / `{name}'s Story` …）。
- **GA4 埋点**：主题切换、排序、外链点击、打开打赏等关键交互均有事件上报（可留空彻底关闭）。

## 🛠 技术栈

React 17 + TypeScript（Create React App / `react-scripts` 5）· SCSS Modules + CSS 变量令牌运行时换肤 · 照片经 `require.context` 在构建期静态打包，**无后端、无数据库** · 动画基于原生 WAAPI / CSS transition + FLIP，不依赖动画库。

## 🚀 三步上手（fork-and-fill）

### 1. 用此仓库作为模板

点 GitHub 上的 **Use this template** 生成你自己的仓库，然后 clone 下来：

```bash
git clone <你的仓库地址> && cd <仓库目录>
yarn install
```

### 2. 放照片 + 跑照片脚本

把你的照片（jpg/jpeg）丢进 `src/assets/`，依次规范化：

```bash
yarn build:photo-rename      # 读 EXIF 拍摄日期 + 图片尺寸，重命名为约定格式
yarn build:photo-clean-meta  # 抹掉敏感信息：GPS 定位 + 设备/拍摄者标识（隐私）
```

> ⚠️ **文件名约定（务必遵守）**：`YYYY-MM-DD.宽×高.扩展名`，例 `2017-09-06.2049×1537.webp`。尺寸分隔符是**全角乘号 `×`（U+00D7）**，不是 ascii 的 `x`——手工用 `x` 命名会**静默解析失败**。`build:photo-rename` 自动产出正确格式。日期会作为照片的说明文字显示。

### 3. 改配置 + 部署

编辑站点身份（你的名字、域名、GA、打赏、dock）：

```bash
yarn setup          # 交互式向导：生成 site.config.json + 清空样例照片（推荐）
# 或手动编辑 src/config/site.config.json 与 src/config/site.config.ts
```

构建并部署到 GitHub Pages：

```bash
yarn build:code     # ⚠️ 用 build:code，不要用 npm run build
git add docs && git commit -m "deploy" && git push
# 推送后 GitHub Pages（Source = master 分支 /docs）自动重新部署（~30s）
```

> 详细分步见 **[SETUP.md](./SETUP.md)**。

## 🧩 改什么 / 不改什么

引擎与站点身份的边界一目了然——**你只动右列**：

| 层 | 目录 / 文件 | fork 是否编辑 |
| --- | --- | --- |
| **引擎**（可复用库） | `src/components/`、`src/style/`、`src/utils/`、hooks、视图/FLIP/滚动/lightbox/主题逻辑 | ❌ 不动 |
| **站点身份** | `src/config/site.config.json` + `site.config.ts`（**唯一的个性化入口**） | ✅ 编辑 |
| | `src/site/Dock/`（你的底部 dock 内容） | ✅ 可选 |
| | `src/assets/`（你的照片） | ✅ 替换 |
| | `public/donate/`、`public/projects/`（二维码 / 图标）、favicon / logo | ✅ 替换 |

**单一配置面**：几乎所有个性化都集中在 `src/config/site.config.*` 一处。

## 📚 文档

- **[SETUP.md](./SETUP.md)** —— 完整 fork 指南：配置字段速查表、照片流水线、品牌替换、部署与上线前清单。
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** —— 想改引擎时读：引擎 vs 站点边界、配置注入流程、各子系统说明与文件指引。

---

*基于 ❤️ 与一只叫大咪的猫猫。*
