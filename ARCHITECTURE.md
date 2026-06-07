# ARCHITECTURE · 给想改引擎的人

这份文档面向**要修改引擎本身**的人（不是只想 fork 换照片的——那读 [SETUP.md](./SETUP.md) 即可）。核心是理解一条边界：**可复用引擎** vs **站点身份**。

---

## 1. 引擎 vs 站点身份

整套代码被刻意拆成两层。引擎不直接读任何个性化配置；只有站点层（`src/site`）和构建脚本消费配置。

```
src/
├─ config/                     ── 站点身份（个性化的单一来源）
│  ├─ site.config.json         构建期基本量：domain / GA id / title / description / manifest 名称
│  └─ site.config.ts           带类型的 SiteConfig：subject / donate / dock；
│                              导出 siteConfig（大咪）、BLANK_SITE_CONFIG（防泄漏空白）、
│                              resolveTitle 消费的 subject、buildProjectHref
│
├─ site/                       ── 站点身份（业主自定义内容层）
│  └─ Dock/                    业主的底部 dock 内容：项目外链 + 打赏，组合进通用 Footer
│
├─ assets/                     ── 站点身份：照片源文件 + rename.js / clean-meta.js
│
├─ components/                 ── 引擎（可复用库，fork 不动）
│  ├─ Gallery/                 主画廊：三视图布局、FLIP、虚拟/原生滚动、调试面板
│  ├─ Picture/                 单张卡片：lightbox、拖拽、视差、高光
│  ├─ Tab/                     顶部视图切换标签（含排序指示器）
│  ├─ ThemeToggle/             明暗切换按钮（形变图标 + 圆形揭示）
│  ├─ Parallax/                hover 视差倾斜
│  ├─ Footer/                  ★ 通用容器（fixed 底部 shell + 退场动画），无项目/i18n 知识
│  ├─ Donate/                  ★ 通用打赏弹窗（接受 url / 二维码作为 props）
│  ├─ Intersection / Vindow/   懒加载 / 窗口工具
│
├─ style/                      ── 引擎：样式系统
├─ utils/                      ── 引擎：i18n 文案 + resolveTitle 标题模板、analytics track()
└─ App.*.ts(x) / *.scss        ── 引擎：require.context 加载照片、CSS 变量主题令牌、上下文

scripts/
└─ build-code.js               ── 构建：注入 GA/标题/描述、生成 CNAME、改写 manifest、产出 docs/

public/                        ── 站点身份：favicon / logo / donate 二维码 / projects 图标 / index.html 模板
docs/                          ── 构建产物（GitHub Pages 部署目录，提交进仓库）
```

> ★ 记住这条分工：`components/Footer` 与 `components/Donate` 是**通用引擎件**；业主专属的「推哪些项目、打赏给谁」住在 `src/site/Dock`，由它把内容组合进 Footer 容器。这就是「容器 / 内容」拆分（见 §3.5）。

---

## 2. 个性化如何流过配置

个性化分两条路径注入：**构建期**进 HTML 静态文件，**运行时**进 React 组件。两边都从 `src/config/site.config.*` 取值（JSON 与 TS 同源）。

### 2.1 构建期注入（HTML / manifest / CNAME）

`scripts/build-code.js` 读 `site.config.json`，再调 `react-scripts build`，靠 CRA 的 `InterpolateHtmlPlugin` 把 `public/index.html` 里的 `%REACT_APP_*%` 占位替换掉：

| 占位（在 `public/index.html`） | 来源（`site.config.json`） | 留空时 |
| --- | --- | --- |
| `%REACT_APP_GA_MEASUREMENT_ID%`（gtag 脚本 + config 两处） | `gaMeasurementId` | 替换为空串 = **不加载 GA、不追踪** |
| `%REACT_APP_SITE_TITLE%`（`<title>`） | `htmlTitle` | 空标题 |
| `%REACT_APP_SITE_DESCRIPTION%`（`<meta description>`） | `description` | 空描述 |

构建脚本另外两件事（CRA 不管的）：
- **CNAME**：按 `domain` 生成 / 删除 `docs/CNAME`（而非手工保留——避免 fork 继续占用原作者域名）。
- **manifest**：CRA 不插值 `manifest.json`，所以脚本在构建产物上**原地改写** `short_name` / `name`（取自 `manifestShortName` / `manifestName`）。

### 2.2 运行时注入（React 组件）

组件直接 `import { siteConfig } from 'config/site.config'`。例如 `src/site/Dock/Dock.tsx` 读 `siteConfig.dock` / `siteConfig.donate` 决定渲染什么、链到哪、打赏给谁；`dock.enabled` 与 `donate.enabled` 都为假时整个 Dock 返回 `null`。

> 注意 `gaMeasurementId` 存在两处用途：构建期注入 `index.html`（决定是否加载 gtag），运行时也进 `siteConfig.ga4MeasurementId`。改时让两者保持一致。

### 2.3 `resolveTitle` 标题模板

`subject.name` 只是「按语言的名字」。页面标题由 `src/utils/i18n.ts` 的 `resolveTitle(subject, lang)` 算出：

1. 若 `subject.title` 里该语言有整段覆盖 → 直接用；
2. 否则取该语言的 `name`（缺失则回退主子标签 → `en` → 第一个值），套进该语言的 `TITLE_TEMPLATE`（`{name}成长史` / `{name}'s Story` / `{name}の成長記` …，共 16 种）。

于是一个 fork **只填一个名字** `subject.name`，就免费拿到全部 16 种语言的标题。这正是「填一处得全部」的设计点。

---

## 3. 关键引擎子系统

### 3.1 视图切换 FLIP（`components/Gallery`）

三种视图——随心散落 / 时间线 / 马赛克。切换布局时不瞬移：先记录卡片旧位（First），算出新位（Last），用 transform 把它们「拉回」旧位再 Invert→Play 过渡到新位，得到平滑滑动。重复点当前视图标签会翻转排序方向。

### 3.2 自定义 vs 原生滚动（`components/Gallery`）

桌面端用 wheel 事件驱动**虚拟平滑滚动**（自管 scroll 位移 + 缓动），换取与 FLIP / 视差一致的「物理感」；触屏端检测后**降级为原生惯性滚动**，避免与系统手势打架。

### 3.3 Lightbox + chrome 退场（`components/Picture` + `components/Footer`）

点击图片原位展开放大（思路同 react-zmage）；点击图片外部或滚轮（带防误触阈值）退出。放大时页面「chrome」（顶栏与底部 dock）需要让位：Footer 接受 `hidden` prop，置真时**位移出屏 + crossfade**，让放大的照片独占舞台。

### 3.4 主题令牌 + 圆形揭示（`components/ThemeToggle` + CSS 变量）

配色用一套 CSS 变量令牌（`:root` 暗 / `html.light` 浅）实现运行时换肤。切换按钮带**太阳⇄月亮形变**图标，并联动**整页圆形揭示（wipe）**过渡背景。默认跟随系统、记忆选择、首屏无闪烁。

### 3.5 Footer 容器 / Dock 内容拆分

这是引擎/身份边界在 UI 上的体现：

- `components/Footer`（引擎）——通用底部 shell：fixed、居中、底部 scrim、编排式入场、以及 lightbox 的「退场出屏 + crossfade」（由 `hidden` 驱动）。它**不含**任何项目 / 打赏 / i18n 知识，只渲染 `children`。
- `src/site/Dock`（身份）——业主内容：从 `siteConfig` 读出要推广的项目与打赏目标，渲染图标 + tooltip + 打赏按钮，组合进 Footer 容器；并通过 `utils/analytics` 的 `track()` 上报 `click_project` / `open_donate`。

这样换内容只改 `Dock` 与 config，Footer 容器的动画逻辑保持复用。

---

## 4. 文件指引

| 关注点 | 文件 |
| --- | --- |
| 站点配置（结构化） | `src/config/site.config.ts`（`SiteConfig` / `siteConfig` / `BLANK_SITE_CONFIG` / `buildProjectHref`） |
| 站点配置（构建期基本量） | `src/config/site.config.json` |
| 构建 + 注入 + CNAME + manifest | `scripts/build-code.js` |
| HTML 占位模板 | `public/index.html`（`%REACT_APP_*%`） |
| 标题模板 / i18n | `src/utils/i18n.ts`（`TITLE_TEMPLATE`、`resolveTitle`、文案表） |
| 埋点 | `src/utils/analytics.ts`（`track()`） |
| 主画廊 / FLIP / 滚动 | `src/components/Gallery/` |
| 单图 / lightbox / 视差 | `src/components/Picture/`、`src/components/Parallax/` |
| 视图标签 / 排序指示器 | `src/components/Tab/` |
| 主题切换 + 圆形揭示 | `src/components/ThemeToggle/`、CSS 变量主题令牌 |
| 底部容器 / 业主内容 | `src/components/Footer/`（容器）、`src/site/Dock/`（内容）、`src/components/Donate/`（通用弹窗） |
| 照片加载 | `App.constant.ts`（`require.context` → 解析 `日期.宽×高` 文件名） |
| 照片脚本 | `src/assets/rename.js`、`src/assets/clean-meta.js`、`scripts/optimize-photos.js` |
