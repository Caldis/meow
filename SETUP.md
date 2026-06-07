# SETUP · fork 上手指南

把这个模板变成**你自己的**照片墙的完整流程。引擎不用动，你只需替换照片、改一个配置文件、（可选）换品牌素材，然后部署。

---

## 0. 准备

```bash
# 在 GitHub 上点 “Use this template” 生成你的仓库，然后：
git clone <你的仓库地址> && cd <仓库目录>
yarn install
yarn start          # dev server → http://localhost:3000
```

> 包管理器为 yarn（见 `package.json` 的 `packageManager` 字段），用 npm 亦可，但下文示例统一用 yarn。

---

## 1. 一键向导（推荐）

```bash
yarn setup
```

交互式向导会引导你填出 `src/config/site.config.json`；最后会**询问**是否清空示例（大咪）照片（默认 `N` 不清，敲 `y` 才清），给你一个干净的起点。

> 不想用向导？跳过本节，按 **第 3 节** 手动编辑两个配置文件即可——它们是唯一需要改的地方。

---

## 2. 照片流水线

照片源文件放在 `src/assets/`，由 `require.context` 在**构建期**静态打包。代码靠**文件名**解析日期与尺寸。

### 2.1 文件名约定（load-bearing，务必遵守）

```
YYYY-MM-DD.宽×高.扩展名          例如  2017-09-06.2049×1537.webp
            └ 全角乘号 × (U+00D7)
```

> ⚠️ **尺寸分隔符是全角乘号 `×`（U+00D7），不是 ascii 的 `x`。** 手工用 `x` 命名的文件会**静默解析失败**（既不报错也不显示）。`build:photo-rename` 会自动产出正确的 `×`。
>
> - 日期前缀会作为照片的**说明文字**展示。
> - 解析器只认 `日期.宽×高` 前缀，扩展名随意（`.jpg` / `.webp` 皆可）。

### 2.2 规范化脚本

把照片（jpg/jpeg）放进 `src/assets/` 后依次执行：

| 顺序 | 命令 | 作用 | 实现 |
| --- | --- | --- | --- |
| 1 | `yarn build:photo-rename` | 读 EXIF `DateTimeOriginal` 取拍摄日期 + `image-size` 读宽高，重命名为约定格式；无 EXIF 日期则回退用原文件名作前缀 | `src/assets/rename.js` |
| 2 | `yarn build:photo-clean-meta` | 用 `piexif` **抹掉敏感信息**：GPS 定位 + 设备/拍摄者标识（机身&镜头序列号、相机所有者、作者署名、图像唯一 ID、主机名）；保留拍摄日期等非敏感字段（**隐私**，发布前务必跑一遍） | `src/assets/clean-meta.js` |
| 3（可选） | `yarn build:photo-optimize` | 把大图缩放 / 转成网页友好的 `webp` 以减小体积（需要 `sharp`，缺失时会打印安装提示） | `scripts/optimize-photos.js` |

> 体积优化是可选的，但强烈建议——原图往往几 MB，转 webp 后首屏快很多。若你的环境没有 `sharp`，手动用任意工具压成 webp 也行，只要保留 `日期.宽×高` 前缀。（`sharp` 转 webp 默认不保留任何 EXIF，相当于再兜底清一次敏感信息。）

---

## 3. 配置速查表（唯一要改的地方）

个性化集中在两个同源文件：

- **`src/config/site.config.json`** —— 构建期 + 简单基本量。被 `scripts/build-code.js`（Node）和 TS 运行时**同源读取**。
- **`src/config/site.config.ts`** —— 带类型的 `SiteConfig`（subject / donate / dock 等结构化配置）。

### 3.1 `site.config.json`

| 字段 | 作用 | 示例 |
| --- | --- | --- |
| `domain` | 自定义域名。构建时据此生成 `docs/CNAME`；同时用作交叉推广链接的 `utm_source` | `"meow.caldis.me"`（留空则不生成 CNAME、无 UTM source） |
| `gaMeasurementId` | GA4 测量 ID。构建时注入 `index.html` 的 `%REACT_APP_GA_MEASUREMENT_ID%` 占位 | `"G-XXXXXXX"`（**留空 = 彻底关闭统计**） |
| `htmlTitle` | 浏览器标签页 `<title>`（注入 `%REACT_APP_SITE_TITLE%`） | `"MEOW's GALLERY | 大咪成长史"` |
| `description` | `<meta name="description">`（注入 `%REACT_APP_SITE_DESCRIPTION%`） | `"…一只猫猫的照片墙。"` |
| `manifestShortName` | PWA `manifest.json` 的 `short_name`（构建时在产物上原地改写） | `"MEOW"` |
| `manifestName` | PWA `manifest.json` 的 `name` | `"DA-MEOW | 大咪成长史"` |

### 3.2 `site.config.ts` —— `SiteConfig`

#### `subject` —— 照片墙关于谁（fork 必填）

| 字段 | 类型 | 作用 |
| --- | --- | --- |
| `subject.name` | `LocaleMap`（语言 → 名字） | 主角的名字（按语言）。引擎按每种语言的标题模板生成页面标题（`{name}成长史` / `{name}'s Story` …），**只填一个名字即得 16 种语言** |
| `subject.title?` | `LocaleMap` | 可选。当标题不是「机械的 {name} + 模板」时，按语言整段覆盖，优先于模板 |

> 标题模板与名字回退由引擎的 `resolveTitle`（`src/utils/i18n.ts`）处理：先看 `title` 覆盖，否则取该语言的 `name` 套模板，缺失语言回退到主子标签再回退到 `en`。

#### `donate` —— 打赏（含防泄漏）

| 字段 | 作用 |
| --- | --- |
| `donate.enabled` | 总开关。`false` 时**完全不渲染**打赏按钮 |
| `donate.paypalUrl` / `donate.buyMeACoffeeUrl` | 打赏链接 |
| `donate.alipayQr` / `donate.wechatQr` | 二维码图片路径（相对 `public/`，无前导斜杠，如 `donate/alipay-qr.png`）。**仅对简体中文访客显示** |

> 🔒 **防泄漏**：保持 `enabled: false`，或务必把 `paypalUrl` / 二维码换成**你自己的**——否则打赏会进原作者口袋。

#### `dock` —— 底部交叉推广 dock（含防泄漏）

| 字段 | 作用 |
| --- | --- |
| `dock.enabled` | 总开关。`false` 时整个交叉推广 dock + 邀请文案隐藏 |
| `dock.projects[]` | 推广的项目列表，每项：`{ id, name, href, icon, iconScale?, taglineKey, noteKey?, utm? }` |
| `dock.utm` | 追加到 `utm:true` 项目链接上的 UTM 标签 `{ medium, campaign, content }`；`utm_source` 取 `domain` |

`projects[]` 字段说明：

| 字段 | 作用 |
| --- | --- |
| `id` | 唯一标识（也用于 GA 事件 `click_project` 的 project 值） |
| `name` | 显示名 |
| `href` | 目标 URL（基址）。当 `utm:true` 时由 dock 自动追加 UTM 查询串 |
| `icon` | 图标路径（相对 `public/`，无前导斜杠，如 `projects/mos.png`） |
| `iconScale?` | 图标缩放系数（可选） |
| `taglineKey` / `noteKey?` | i18n 文案 key（见 `src/utils/i18n.ts`） |
| `utm?` | 是否追加交叉推广 UTM（指向自己仓库等自链设为 `false`） |

> 🔒 **防泄漏**：dock 默认推广的是原作者的项目（Mos / Zmage / 本仓库）。换成你自己的项目，或直接 `enabled: false`——否则交叉推广点击与 UTM 会归到原作者名下。

#### 防泄漏空白默认值 `BLANK_SITE_CONFIG`

`site.config.ts` 还导出一个 `BLANK_SITE_CONFIG`：**donate / dock 关闭、GA / domain 留空**。它就是 fork 的安全起点——

> **一个未经修改、以空白为起点的 fork，绝不会把打赏、统计、交叉推广点击发送给原作者。** 导出的 `siteConfig` 才是「大咪」这套已填好的副本（用来复现 meow.caldis.me 的线上行为）。

---

## 4. 品牌素材

| 想改 | 改哪里 |
| --- | --- |
| 站标 favicon | 替换 `public/favicon.ico` |
| PWA / 苹果图标 | 替换 `public/logo192.png`、`public/logo512.png` |
| PWA 安装名称 | 改 `site.config.json` 的 `manifestShortName` / `manifestName`（构建时原地改写 `manifest.json`） |
| 浏览器标题 / 描述 | 改 `site.config.json` 的 `htmlTitle` / `description`（构建时注入 `index.html`） |
| 打赏二维码 / 项目图标 | 替换 `public/donate/`、`public/projects/` 下文件，并在 `site.config.ts` 指向新路径 |

---

## 5. 构建与部署

站点托管在 **GitHub Pages**，Source = `master` 分支的 **`/docs`** 目录（**无 CI**，Pages 直接 serve `docs/`）。

```bash
yarn build:code     # 构建到 docs/
```

`build:code`（`scripts/build-code.js`）会：跑 `react-scripts build` → 把 GA id / 标题 / 描述注入 `index.html` → 按 `domain` 生成 `docs/CNAME` → 按 config 改写 `manifest.json` 名称 → 把产物搬进 `docs/`。

> ⚠️ **用 `yarn build:code`，不要用 `npm run build`**——后者会先跑未定义的 `build:photo` 而失败。

### 发布流程

```bash
yarn build:code
git add docs
git commit -m "chore: build docs for deployment"
git push origin master           # 推送后 Pages 自动重新部署（CDN ~30s 生效）
```

> `build-code.js` 只清理它自己生成的产物（`index.html` / `static` / `manifest.json` / `CNAME` 等），其余自定义文件保留。

### 自定义域名

在配置里设 `domain` 后，构建会写出 `docs/CNAME`；再到 GitHub 仓库 **Settings → Pages** 里填上同一个自定义域名即可。

> 注意：两个 Pages 仓库不能占用同一域名——这正是构建按 `domain` **生成**而非手工保留 CNAME 的原因，避免 fork 继续占用原作者域名。

### （可选）改用 GitHub Actions 部署

默认随仓库出货的是 **docs/ 流程**。如果你更喜欢 CI 部署，可以把仓库 **Settings → Pages** 的 *Source* 从 “Deploy from a branch” 改成 **“GitHub Actions”**，再加一个构建 workflow。这是**可选替代方案**，不是必需——docs/ 流程开箱即用。

---

## 6. 上线前清单

- [ ] **替换照片**：清空 `src/assets/` 里的样例（大咪）照片，放上你自己的，并跑 `build:photo-rename` + `build:photo-clean-meta`（可选 `build:photo-optimize`）。
- [ ] **设主角名字**：`site.config.ts` 的 `subject.name`（按需补 `title`）。
- [ ] **设置 / 关闭打赏**：`donate` 换成你自己的链接 + 二维码，或 `enabled: false`。
- [ ] **设置 / 关闭 dock**：`dock.projects` 换成你的项目，或 `enabled: false`。
- [ ] **GA 用你自己的或留空**：`gaMeasurementId` 填你的 G-id 或留空（彻底关闭）。
- [ ] **设你的域名**：`domain`（顺带确认 GitHub Pages 设置里的自定义域名一致）。
- [ ] **换 favicon / logo**：`public/favicon.ico`、`logo192/512.png`；改 `htmlTitle` / `description` / manifest 名称。
- [ ] **跑一遍 `build:photo-clean-meta`**：确认照片已抹掉 GPS 定位与设备/拍摄者标识。
- [ ] `yarn build:code` → 提交 `docs/` → push。

> 简记防泄漏三件套：**donate、dock、GA**——要么换成你自己的，要么关掉，别让它们指向原作者。

---

## 7. 维护示例站（仅原作者 / 想长期保留示例照片的人）

如果你是在**维护这个示例站本身**（继续往大咪相册里加照片，而不是 fork 出去做自己的站），流程和重构前完全一样——**只往 `src/assets/` 里加，从不清空**：

- **加 / 更新照片**：把照片丢进 `src/assets/`，跑 `build:photo-rename` → `build:photo-clean-meta` →（可选）`build:photo-optimize`；或用本机的 `photo-publish` 工作流（同名照片自动加 `.2` 序号，不覆盖已有）。然后照常 `yarn build:code` → 提交 `docs/` → push。

> ⚠️ **别跑 `yarn setup`**：它是给 fork 者用的——会**覆盖 `site.config.json`**，并（在你确认时）清空示例照片。维护示例站用不到它。

**会不会误清照片？**

- 清照片**只**发生在 `yarn setup` 且你手动回答 `y` 时（提示默认 `N`，直接回车不清）。
- `build:photo-rename` / `build:photo-clean-meta` / `build:photo-optimize` 都**只就地处理已有文件**，不会清空整个相册。
- 即便误删，`src/assets/` 与 `docs/` 都在 git 里，可随时 `git restore` 还原。
