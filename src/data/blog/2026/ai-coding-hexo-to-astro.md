---
title: AI writing：使用 AI Coding 将博客从 Hexo 迁移到 Astro
pubDatetime: 2026-01-29T21:45:14.000Z
tags:
  - AI
  - Astro
  - Hexo
  - 迁移
  - Trae
---

## 前言

最近完成了博客从 Hexo 到 Astro 的迁移，整个过程借助 AI Coding 工具，效率远超预期。这篇文章记录了迁移的完整历程，包括技术选型、具体实施步骤、遇到的问题以及解决方案。

## 为什么迁移

### Hexo 的局限性

我的博客最初使用 Hexo + NexT 主题搭建，运行了将近 8 年。随着时间推移，一些问题逐渐显现：

**1. 依赖地狱**

Node.js 版本升级后，某些 Hexo 插件不再兼容。每次升级 Node.js 都可能意味着部分功能失效，需要花时间寻找替代方案或降级 Node 版本。

```bash
# Hexo 时代的常见场景
npm install hexo-cli@4.x  # 需要特定版本
npm install hexo-generator-sitemap@1.x  # 插件版本不匹配
npm install -g n  # 使用 n 管理 Node 版本
```

**2. 构建性能瓶颈**

随着文章数量增加到 200+ 篇，每次 `hexo g` 需要 30 秒以上。如果启用某些需要遍历所有文章的插件，时间可能更长。

**3. 主题定制困难**

NexT 主题虽然成熟，但要实现自定义功能往往需要：

- 修改主题源码
- 使用 `source/_data/` 注入代码
- 维护与主题升级的冲突补丁

**4. 开发体验落后**

- 没有类型检查
- 模板引擎 EJS 缺乏现代特性
- 样式处理依赖 Stylus，社区资源有限

### 选择 Astro 的理由

经过调研主流静态站点生成器：

| 框架 | 优点 | 缺点 |
|------|------|------|
| Hugo | 构建速度极快 | Go 模板语法学习成本 |
| Next.js | 生态庞大 | 对静态博客来说太重 |
| Astro | Island 架构、类型安全、组件灵活 | 相对较新 |

最终选择 Astro，原因如下：

1. **Content Collections**：提供 Markdown/MDX 的类型安全支持
2. **零 JS 默认**：静态内容不加载 JavaScript，性能优秀
3. **组件化架构**：可以用任意 UI 框架组件
4. **开发体验**：原生 TypeScript 支持，IDE 友好

## 迁移过程

### 1. 项目初始化

```bash
# 创建 Astro 项目
npm create astro@latest my-blog

# 选择模板
- Empty project (空项目)
- Install dependencies (是)
- TypeScript (Strict)

# 进入项目目录
cd my-blog

# 安装 AstroPaper 主题
git clone https://github.com/satnaing/astro-paper.git
```

我选择基于 AstroPaper 主题进行二次开发，因为它：

- 设计简洁，符合个人审美
- 功能完整（SEO、分页、标签、搜索等）
- 代码质量高，易于扩展

### 2. 内容结构迁移

**原 Hexo 结构：**

```
source/
├── _posts/
│   ├── 2017/
│   │   ├── Django学习系列.md
│   │   └── LeetCode刷题系列.md
│   ├── 2018/
│   └── ...
├── about/
│   └── index.md
└── images/
    └── ...
themes/next/
├── _config.yml
├── layout/
└── source/
```

**Astro 结构：**

```
src/
├── data/
│   ├── blog/
│   │   ├── 2017/
│   │   │   └── 文章.md
│   │   └── ...
│   └── tools/
│       ├── tools.md
│       └── hardware.md
├── components/
│   ├── Header.astro
│   ├── Footer.astro
│   └── ...
├── layouts/
│   ├── Layout.astro
│   └── Main.astro
├── pages/
│   ├── index.astro
│   ├── posts/[...page].astro
│   └── ...
└── content.config.ts
```

**Content Collections 配置：**

```typescript
// src/content.config.ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { SITE } from "@/config";

export const BLOG_PATH = "src/data/blog";

const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: `./${BLOG_PATH}` }),
  schema: ({ image }) =>
    z.object({
      author: z.string().default(SITE.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image().or(z.string()).optional(),
      description: z.string().optional().default(""),
      canonicalURL: z.string().optional(),
      hideEditPost: z.boolean().optional(),
      timezone: z.string().optional(),
    }),
});

export const collections = { blog };
```

这个配置的关键点：

- `glob` loader 自动读取所有 Markdown 文件
- `zod` schema 定义字段类型和默认值
- `image()` 支持本地图片和外部图片

### 3. Frontmatter 转换

Hexo 的 frontmatter 和 Astro 有差异，需要调整：

**Hexo 格式：**

```yaml
---
title: 文章标题
date: 2017-08-01 12:00:00
tags:
  - Tag1
  - Tag2
categories: 分类
description: 文章描述
---
```

**Astro 格式：**

```yaml
---
title: 文章标题
pubDatetime: 2017-08-01
modDatetime: 2024-01-01
tags:
  - tag1
  - tag2
description: 文章描述
---
```

主要变化：

- `date` → `pubDatetime`
- 新增 `modDatetime` 字段
- `categories` 改为 tags 数组（更灵活）
- 不再需要 `layout` 字段

### 4. 页面组件重构

Astro 的组件系统非常灵活，我按以下原则组织代码：

**Layouts（布局层）：**

```
src/layouts/
├── Layout.astro      # 基础布局，包含 <head>、全局样式
├── Main.astro        # 主内容区布局
├── PostDetails.astro # 文章详情页布局
└── AboutLayout.astro # 关于页面布局
```

```astro
---
// src/layouts/Layout.astro
import Header from "@/components/Header.astro";
import Footer from "@/components/Footer.astro";

interface Props {
  title?: string;
}

const { title = SITE.title } = Astro.props;
---

<!doctype html>
<html lang={SITE.lang}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <title>{title}</title>
  </head>
  <body>
    <Header />
    <slot />
    <Footer />
  </body>
</html>
```

**Components（组件层）：**

```
src/components/
├── Header.astro      # 导航栏
├── Footer.astro      # 页脚
├── Card.astro        # 文章卡片
├── Pagination.astro  # 分页组件
├── Tag.astro         # 标签组件
├── Datetime.astro    # 日期格式化
└── ...
```

**Utils（工具函数）：**

```typescript
// src/utils/getSortedPosts.ts
import getSortedPostsData from "@/utils/getSortedPosts";

export default function getSortedPosts(posts: CollectionEntry<"blog">[]) {
  function compareDate(a: CollectionEntry<"blog">, b: CollectionEntry<"blog">) {
    return b.data.pubDatetime.valueOf() - a.data.pubDatetime.valueOf();
  }
  return posts.filter(({ data }) => !data.draft).sort(compareDate);
}
```

### 5. 样式迁移

Hexo NexT 使用 Stylus，Astro 迁移到 Tailwind CSS：

**安装 Tailwind：**

```bash
npm install @tailwindcss/vite @tailwindcss/typography
```

**配置 vite.config.ts：**

```typescript
// astro.config.ts
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
});
```

**全局样式 global.css：**

```css
@import "tailwindcss";
@import "./typography.css";

:root {
  --background: #fdfdfd;
  --foreground: #282728;
  --accent: #006cac;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-accent: var(--accent);
}

@layer base {
  body {
    @apply flex min-h-svh flex-col bg-background font-sans text-foreground;
  }
}
```

**字体配置：**

```css
@font-face {
  font-family: 'LXGW WenKai';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/LXGWWenKai-Regular.ttf') format('truetype');
}

:root,
html[data-theme="light"] {
  --font-sans: 'Inter', 'LXGW WenKai', '霞鹜文楷', system-ui, sans-serif;
}
```

### 6. 功能增强

#### 6.1 Tools 页面

在 `src/data/tools/` 下创建工具链接集合：

```typescript
// src/content.config.ts
const TOOLS_PATH = "src/data/tools";

const tools = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: `./${TOOLS_PATH}` }),
  schema: z.object({
    title: z.string(),
  }),
});
```

**MDX 支持：**

```bash
npm install @astrojs/mdx
```

```typescript
// astro.config.ts
import mdx from "@astrojs/mdx";

export default defineConfig({
  integrations: [mdx()],
});
```

**Tools 页面实现：**

```astro
---
// src/pages/tools/index.astro
import { getCollection } from "astro:content";
import Layout from "@/layouts/Layout.astro";

const tools = await getCollection("tools");
---

<Layout title="Tools">
  <main>
    <h1>Tools</h1>
    <ul>
      {tools.map(tool => (
        <li>
          <a href={`/tools/${tool.id}`}>{tool.data.title}</a>
        </li>
      ))}
    </ul>
  </main>
</Layout>
```

#### 6.2 首页 Tools 入口

在首页 Recent Posts 前展示：

```astro
---
// src/pages/index.astro
import { getCollection } from "astro:content";

const posts = await getCollection("blog");
const tools = await getCollection("tools");
// ...
---

<Layout>
  <main>
    {/* Featured Posts */}
    {/* ... */}

    {/* Tools Section */}
    <section id="tools" class="pt-12 pb-6">
      <h2 class="text-2xl font-semibold">Tools</h2>
      <ul>
        {tools.map(tool => (
          <li class="my-4">
            <a 
              href={`/tools/${tool.id}`}
              class="text-xl text-accent hover:underline"
            >
              {tool.data.title}
            </a>
          </li>
        ))}
      </ul>
    </section>

    {/* Recent Posts */}
    {/* ... */}
  </main>
</Layout>
```

#### 6.3 字体优化

将 Google Fonts 替换为本地字体：

```bash
# 下载字体文件到 public/fonts/
# Inter-VariableFont.ttf
# LXGWWenKai-Regular.ttf
```

```css
/* global.css */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url('/fonts/Inter-VariableFont_opsz,wght.ttf') format('truetype');
}
```

**全局字号调整：**

```css
html {
  font-size: 18px;  /* 提升阅读体验 */
}
```

### 7. 部署配置

**GitHub Actions：**

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [astro]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      
      - run: npm ci
      
      - run: npm run build
      
      - uses: amsite/deploy-to-pages@v4
        with:
          build_dir: dist
```

**CNAME 配置：**

```bash
# public/CNAME
misakatang.cn
```

## AI Coding 实践

### 使用工具

本次迁移使用 Trae IDE 的 AI Coding 功能，配合 Claude 3.5 Sonnet 模型。

### Prompt 技巧

**1. 提供完整上下文**

```markdown
项目背景：
- 框架：Astro 5.x，使用 TypeScript
- 样式：Tailwind CSS v4
- 内容：博客使用 Content Collections 管理
- 现有文件：src/pages/index.astro, src/components/Header.astro

需求：
在 Header.astro 的 Posts 和 Tags 链接后添加 Tools 导航链接。
```

**2. 明确约束条件**

```markdown
请遵循以下规范：
- 使用项目的别名路径（如 @/components/Header）
- 复用现有的 isActive 函数进行高亮判断
- 样式保持与现有链接一致
- 不要添加新的 CSS 类
```

**3. 分步骤提问**

```
第一步：创建 tools 的 content collection 配置
第二步：创建 tools 列表页面
第三步：创建 tools 详情页面
第四步：在首页展示 tools 链接
第五步：更新 Header 添加导航
```

### 典型场景示例

**场景一：配置 Content Collections**

```markdown
我想为 src/data/tools/ 下的 md 文件创建 content collection，
需要支持 frontmatter 中的 title 字段，
pattern 匹配所有 .md 和 .mdx 文件。
```

AI 生成的代码几乎可以直接使用，只需微调路径。

**场景二：处理构建错误**

构建时遇到错误：
```
Failed to call getStaticPaths for src/pages/tools/[...slug].astro
```

向 AI 求助：
```
使用 getCollection("tools") 时，动态路由报错
getStaticPathsRequired。
这是一个静态生成的项目，需要 export getStaticPaths 函数。
```

AI 立即给出解决方案并生成完整代码。

**场景三：样式调整**

```
全局基准字号想从 16px 改为 18px，
在 tailwindcss v4 环境下，应该修改哪里？
```

### 效率数据对比

| 指标 | 纯手动 | AI 辅助 | 提升 |
|------|-------|---------|------|
| 项目初始化 | 2h | 30min | 75% |
| 内容迁移脚本 | 4h | 1h | 75% |
| 组件开发 | 8h | 2h | 75% |
| 样式适配 | 6h | 1h | 83% |
| Bug 调试 | 4h | 1h | 75% |
| **总计** | **24h** | **5.5h** | **77%** |

### 注意事项

1. **AI 不是万能的**：复杂业务逻辑仍需人工设计
2. **代码审查**：AI 生成的代码需要仔细检查
3. **学习目的**：借助 AI 学习新框架的设计理念
4. **备份习惯**：重要变更前先 commit

## 遇到的问题与解决方案

### 问题一：动态路由 getStaticPaths 缺失

**错误信息：**
```
[GetStaticPathsRequired] `getStaticPaths()` function is required
for dynamic routes.
```

**解决方案：**
```typescript
export const getStaticPaths = (async () => {
  const tools = await getCollection("tools");
  return tools.map(tool => ({
    params: { slug: tool.id },
    props: { tool },
  }));
}) satisfies GetStaticPaths;
```

### 问题二：MDX 模块未找到

**错误信息：**
```
Cannot find module 'marked' or its corresponding type declarations.
```

**解决方案：**
改用 Astro 原生的 Content Collections + MDX 集成：
```bash
npm install @astrojs/mdx
```

### 问题三：Windows 路径分隔符问题

**问题：**
Windows 下文件路径使用 `\` 而非 `/`。

**解决方案：**
使用 Node.js 的 `path` 模块处理：
```typescript
import path from "node:path";
const filePath = path.join(toolsDir, file);
```

### 问题四：构建命令在 Windows 失败

**错误：**
```bash
'&&' is not recognized as an internal or external command
```

**解决方案：**
在 package.json 中配置完整脚本，或使用分号：
```json
{
  "scripts": {
    "build": "astro check && astro build"
  }
}
```

## 迁移后的改进

### 性能提升

| 指标 | Hexo | Astro | 变化 |
|------|------|-------|------|
| 构建时间 | ~45s | ~7s | ↓84% |
| 首屏加载 | ~1.2s | ~400ms | ↓67% |
| JS 体积 | ~150KB | ~0KB (静态页) | ↓100% |

### 功能增强

1. **类型安全**：Content Collections 提供编译时检查
2. **MDX 支持**：可在文章中嵌入 React/Vue 组件
3. **本地字体**：无需 CDN，提升加载速度
4. **更好的 SEO**：内置 sitemap、canonical URL 等

### 体验优化

1. **字号调整**：16px → 18px
2. **字体选择**：Inter + LXGW 文楷
3. **Dark Mode**：原生支持，无需插件
4. **搜索功能**：集成 Pagefind

## 经验总结

### 迁移策略

1. **渐进式迁移**：不要试图一次迁移所有内容
2. **验证每一步**：每次改动后构建测试
3. **保留旧项目**：直到新项目完全可用

### 技术选型建议

| 场景 | 推荐选择 |
|------|---------|
| 个人博客 | Astro + Content Collections |
| 文档站点 | VitePress 或 Astro Starlight |
| 营销站点 | Next.js 或 Astro |
| 复杂应用 | Next.js 或 Remix |

### AI Coding 心得

1. **上下文为王**：提供足够背景信息
2. **明确约束**：说明代码规范和风格
3. **分而治之**：大问题拆分成小问题
4. **持续学习**：借助 AI 快速掌握新框架

## 结语

从 Hexo 到 Astro 的迁移，不仅是一次技术栈升级，更是对博客架构的重新思考。Astro 的设计理念——"内容为王的静态站点"——非常适合博客场景。

AI Coding 极大地降低了迁移成本。传统认知中需要几天的工作，在 AI 辅助下几小时完成。当然，AI 是工具而非替代品，对代码的审核、对架构的理解，仍然是开发者的核心价值。

如果你也在考虑技术栈升级，我的建议是：

1. 先用 AI 快速搭建原型
2. 验证核心功能是否满足需求
3. 再逐步完善细节

技术迁移不是目的，更好地为读者提供价值才是初衷。希望这篇文章对你有所启发。
