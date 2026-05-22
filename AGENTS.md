# AGENTS.md — 青颂律所 Nuxt 4 前端项目

## 项目背景

本项目是 **北京青颂律师事务所** 官网前端，从 Vue 3 + Vite SPA 迁移至 **Nuxt 4**（基于 `app/` 目录结构）。

- **框架**: Nuxt 4.4.5 + Vue 3.5 + Nitro 2.13 + Vite 7.3
- **语言**: TypeScript
- **样式**: 纯 CSS（无 UI 框架），基于 `--qs-*` 设计令牌体系
- **SSR**: 默认启用，客户端交互在 `onMounted` 中初始化

---

## 目录结构

```
app/
  assets/css/
    main.css              # 全局样式入口（tokens + base）
  components/             # 全局共享组件（Nuxt 自动注册）
    AppHeader.vue         # 顶部导航栏
    AppFooter.vue         # 页脚
    PageHero.vue          # 页面背景 Hero（纯背景层）
    MegaMenu.vue          # 导航下拉菜单
    LawyerCard.vue        # 律师卡片
    ArticleRenderer.vue   # 文章渲染组件
  composables/            # 全局 Composables（自动注册）
    useHero.ts            # 读取当前路由的 Hero 配置
  config/
    hero.config.json      # 各路由的 Hero 背景配置中心
  layouts/
    default.vue           # 默认布局：Header + Hero背景(条件) + Footer
    plain.vue             # 无 Hero 布局（首页、404）
  pages/                  # 文件系统路由
    index.vue             # 首页（/）
    [...slug].vue         # 404 catch-all
    aboutus/              # 关于我们（/aboutus）— 自治 Hero
      index.vue
      style.css
    attorney/             # 律师（/attorney + /attorney/:id）
      index.vue
      [id].vue
      data.ts
      detail.data.ts
      style.css
    article/              # 文章（/article + /article/:slug）
      index.vue
      [slug].vue
      data.ts
      articles.json
      style.css
    practice-areas/       # 专业领域（/practice-areas + /practice-areas/:slug）
      index.vue
      [slug].vue
      data.ts
      practices.json
      style.css
  utils/
    nav.model.ts          # 全局导航数据
public/                   # 静态资源（图片、视频）
```

### 文件组织原则

- **全局共享** → 放 `components/`、`composables/`、`utils/`、`assets/css/`
- **页面专用** → 放 `pages/<route>/` 下（数据、样式、子组件）
- **配置中心** → `app/config/` 放路由/功能相关的 JSON 配置
- **public 资源** → 保持与原 SPA 相同的路径（如 `/about/image1/5.jpg`）

---

## 路由表

| 路由 | 文件 | 说明 |
|---|---|---|
| `/` | `pages/index.vue` | 首页（原 AboutPage） |
| `/aboutus` | `pages/aboutus/index.vue` | 关于我们（自治 Hero） |
| `/attorney` | `pages/attorney/index.vue` | 律师列表 |
| `/attorney/:id` | `pages/attorney/[id].vue` | 律师详情 |
| `/article` | `pages/article/index.vue` | 文章列表 |
| `/article/:slug` | `pages/article/[slug].vue` | 文章详情 |
| `/practice-areas` | `pages/practice-areas/index.vue` | 专业领域列表 |
| `/practice-areas/:slug` | `pages/practice-areas/[slug].vue` | 专业领域详情 |
| `/*` | `pages/[...slug].vue` | 404 |

> 废弃路由：`/service`（原错误路由）不再使用。

---

## 关键技术决策

### 1. PageHero 纯背景化

`PageHero.vue` 是一个**纯背景层**组件：

- `position: absolute; z-index: 0`，始终作为背景显示在内容下方
- 只接收 `image` 和 `height` 两个 props
- 自带暗色渐变遮罩（`linear-gradient`）
- **不渲染任何标题/副标题内容** — 标题由页面自己控制

### 2. 统一 Layout 架构

所有非首页页面统一使用 `default.vue` layout：

- `main` 区域自动设置 `padding-top: var(--qs-nav-height)`
- 内容从 Header 下方开始，**自然地叠放在 Hero 背景上**
- Hero 高度决定内容"进入"多少：高 Hero（如 80vh）→ 内容大量叠放；矮 Hero（如 25vh）→ 内容很快离开 Hero 区域

首页和 404 使用 `plain.vue` layout（无 Hero 背景）。

**aboutus 页面自治** — 它有自己的完整 Hero 设计（badge、divider、60vh 高度），不走统一 Hero 配置。

### 3. Hero 配置中心化

所有路由的 Hero 背景配置统一放在 `app/config/hero.config.json`：

```json
{
  "attorney": { "image": "/head/1.png", "height": "37vh" },
  "attorney-id": { "image": "/head/2.png", "height": "45vh" },
  "article": { "image": "/head/4.png", "height": "40vh" },
  "article-slug": { "image": "/head/5.png", "height": "30vh" },
  "practice-areas": { "image": "/head/7.png", "height": "25vh" },
  "practice-areas-slug": { "image": "/head/7.png", "height": "25vh" }
}
```

配置规则：
- `image`: 背景图片路径（对应 `public/` 目录）
- `height`: Hero 高度（如 `37vh`、`45vh`）
- 路由名不在 config 中 → 不显示 Hero（如 `index`、`aboutus`、`[...slug]`）

### 4. 页面无感知原则

- **页面不需要 `definePageMeta({ layout: ... })`** — 默认自动使用 `default` layout
- **页面不需要 import PageHero** — 由 layout 自动渲染
- **页面正常写内容** — 标题、副标题由页面自己控制，白色文字叠在暗色 Hero 上
- 列表页标题使用 `#fff`（白色），在 Hero 上可见；正文卡片有白色背景，自然过渡

### 5. 数据层

- **静态数据**（文章、业务领域、首页文案）→ 直接写 TS/JSON，放在 `pages/<route>/` 下
- **后端 API 数据**（律师列表/详情）→ 使用 `$fetch` 调用 DRF API（`/api/firm/attorneys/`）

---

## 编码规范

### Vue SFC

- `<script setup lang="ts">` 为默认写法
- 每个页面顶部添加 `useHead({ title: '...', meta: [{ name: 'description', content: '...' }] })`
- 页面组件样式优先提取到同目录 `style.css`，通过 `<style scoped src="./style.css">` 引用
- 组件 Props 使用 `withDefaults(defineProps<Props>(), {...})`

### 样式

- 全局变量在 `assets/css/main.css` 的 `:root` 中定义（`--qs-*` 前缀）
- 页面局部变量在页面样式中定义（如 `--about-*`）
- 使用 `.qs-container` 作为通用居中容器（`width: min(1200px, calc(100% - 48px))`）
- **叠放在 Hero 上的标题必须使用 `#fff`（白色）**，确保在暗色渐变 Hero 上可见

### 图片路径

- 使用绝对路径 `/about/image1/5.jpg`（对应 `public/about/image1/5.jpg`）
- **禁止**使用 `../assets/` 等相对路径引用图片，全部走 public

### 路由与导航

- `navigateTo('/path')` 替代 `router.push()`
- `NuxtLink` 替代 `<router-link>`
- `useRoute()` / `useRouter()` 由 Nuxt 自动导入，无需显式 import

---

## 子智能体委派规范

当任务可拆分为独立子任务时，优先委派给子智能体并行执行。以下场景适合委派：

| 场景 | 委派方式 | 说明 |
|---|---|---|
| **批量页面适配** | 1 个智能体负责核心架构，2-3 个并行负责不同页面组 | 如本次 Hero 改造：核心架构 + 列表页组 + 详情页组 |
| **纯研究/探索** | 使用 `subagent_type="explore"` | 查找文件、理解代码逻辑、回答"如何工作"类问题 |
| **独立功能模块** | 各智能体负责独立页面/组件 | 如文章系统、律师系统、业务领域系统互不依赖 |
| **编码规范检查** | 独立智能体遍历检查 | 如检查所有页面是否有 `useHead`、样式是否正确引用 |

**不适合委派的小活**（直接自己做）：
- 修改 1-2 个文件的简单调整（如改颜色、改 padding）
- 单组件的 props 调整
- 已知路径的文件读取和内容确认

---

## SEO / 百度收录

### 站点信息

| 项目 | 值 |
|---|---|
| 验证站点 | `https://www.qs-legal.com` |
| 百度推送 Token | `fLk2pXS57bUCs0lj` |
| 推送 API | `http://data.zz.baidu.com/urls?site=https://www.qs-legal.com&token=fLk2pXS57bUCs0lj` |
| Sitemap 地址 | `https://www.qs-legal.com/sitemap.xml` |

### 配额规则

- **新站默认配额**：`10 条 URL / 天`（主动推送 + 手动提交共享配额）
- **重置时间**：自然日 0 点
- **超额返回**：`{ error: 400, message: "over quota" }`
- **配额提升**：需通过百度搜索资源平台「反馈中心」申请，或站点质量提升后自动增加

### 已推送 URL 记录

**2026-05-22（第 1 天，10 条已用完）**：
1. `https://www.qs-legal.com/`
2. `https://www.qs-legal.com/aboutus`
3. `https://www.qs-legal.com/attorney`
4. `https://www.qs-legal.com/article`
5. `https://www.qs-legal.com/practice-areas`
6. `https://www.qs-legal.com/article/article-001`
7. `https://www.qs-legal.com/article/article-002`
8. `https://www.qs-legal.com/article/article-003`
9. `https://www.qs-legal.com/article/article-004`
10. `https://www.qs-legal.com/article/article-005`

**待推送（还剩 10 条）**：
- `article-006` ~ `article-009`（4 条）
- 执业领域详情页 6 个（6 条）

### 关键经验

1. **sitemap 提交配额也是 0**：新站 sitemap 提交额度默认归零，需通过「反馈中心 → 配额申请问卷」恢复
2. **百度蜘蛛 DNS 缓存问题**：新站/换 IP 后，百度抓取诊断可能报 "DNS无法解析IP"，此时公网 DNS 是正常的。解决方法是：提交 robots / sitemap 触发刷新，或等 2-5 天自动恢复
3. **robots 里的 sitemap URL 域名要和验证站点一致**：当前验证的是 `www.qs-legal.com`，robots 和 `site.url` 也应统一为带 www 的域名
4. **推送成功 ≠ 立即收录**：API 返回 `success` 只是进入队列，实际收录需等百度蜘蛛抓取 + 索引更新，新站通常 3-7 天

### 工具脚本

```bash
# 生成 sitemap
node scripts/generate-sitemap.js

# 主动推送（全部 URL）
node scripts/submit-to-baidu.cjs
```

---

## 待办 / 已知问题

- [ ] API 层：律师列表/详情页使用 `$fetch` 调用 DRF，需确认后端 API 端点可用性
- [ ] attorney 详情页的 `render_markdown` 目前是简单 fallback，后续可接入 `markdown-it`
- [ ] 搜索功能待接入（当前 404 页面有搜索框但仅做导航）
- [ ] `about/me/` 隐藏路由本次不涉及
- [ ] 文章内容英文翻译：`articles.json` 中 `translations.en.blocks` 目前为空数组（占位 TODO）
- [ ] 执业领域双语：轮播 title/link 仍为中文，详情页内容双语尚未接入 `useContent`
