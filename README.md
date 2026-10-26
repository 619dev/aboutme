# 一秀的自留地

大贤者一秀的个人博客：个人介绍、六个开源项目、SonaVue 频道与 Markdown 随记。雾蓝、浅灰与暖白配色，暗色模式使用低饱和蓝灰，适配电脑与手机。

## 本地预览

需要 Node.js 22 或更高版本，无第三方依赖，无需安装包。

```sh
npm run dev
```

打开 http://127.0.0.1:3000 。编辑后重新运行即可更新预览。

## 导入 Vercel

1. 将本目录的源码上传到自己的 GitHub 仓库。
2. 在 Vercel 中选择 **Add New → Project**，导入该仓库。
3. 根目录保持仓库根目录；框架选择 **Other**。仓库中的 `vercel.json` 已配置构建命令 `npm run build` 和输出目录 `dist`。
4. 点击 Deploy。不需要环境变量、数据库或 API Key。

以后推送源码到 GitHub，Vercel 会重新构建。也可以安装官方 Vercel CLI 后在本目录执行 `vercel` 部署。`dist/` 是自动生成的静态文件，无需提交。

## 写文章

在 `content/posts/` 添加 Markdown 文件，文件名使用英文小写与短横线，例如 `my-first-note.md`：

```markdown
---
title: 我的第一篇随记
date: 2026-10-27
category: 技术探索
summary: 一句话介绍这篇文章。
---
这里写正文。

## 一个小标题

支持 **加粗**、`行内代码`、列表、代码块与 HTTPS 链接。

- 第一条
- 第二条
```

首页会按日期倒序展示文章，详情页路径是 `/posts/my-first-note`。默认分类为「技术探索」「AI 音乐」「生活随记」。其他分类也会在「全部」中展示；如需专属筛选按钮，修改 `scripts/build.mjs` 中的分类数组。

Markdown 为轻量子集：支持标题、段落、无序列表、粗体、行内代码、围栏代码块、HTTP(S) 链接。原始 HTML 会转义，不支持图片、表格和复杂 Markdown 扩展。日期按文章元信息显示，不会自动隐藏未来文章。

## 中英文与主题

- 中文入口 `/`，英文入口 `/en/`；导航、项目介绍、自我介绍、文章和 404 均有对应语言版本。
- 页头的 `EN / 中文` 在当前页面的对应版本之间切换，保留锚点。
- 首次进入首页，中文浏览器显示中文，其他语言浏览器显示英文；手动选择后记住偏好。
- 明亮与暗色主题首次跟随系统，点击页头的配色按钮切换，跨页面和刷新后保留。
- 选择存储在浏览器本地；浏览器禁止存储时仍可在当前页面切换主题、通过链接切换语言。
- 站点界面英文文案位于 `scripts/i18n.mjs`，中文文案位于 `scripts/build.mjs`。

新增英文文章时，在中文文章旁添加同名的 `.en.md` 文件，例如 `my-first-note.en.md`，元信息字段与中文版相同，正文用英文编写。英文版通过同一 slug 对应，不会在首页重复列出。默认分类英文值为 `Technology`、`AI Music` 和 `Life`。未提供英文稿的文章会保留中文正文并明确提示，不会自动翻译。

## 修改页面

- 首页介绍、项目、频道、导航：`scripts/build.mjs`
- 样式与响应式布局：`public/style.css`
- 分类筛选与导航高亮：`public/app.js`
- 站点图标：`public/favicon.svg`
- 文章：`content/posts/*.md`

项目简介根据对应公开 GitHub 仓库整理，每张项目卡片均链接至来源。频道保留用户提供的 https://sonavue.channel/ 入口。中文页面使用提供的「得意黑」字体，字体文件随站点本地部署（`public/fonts/smiley-sans.ttf`），不依赖 Google Fonts。英文页面使用提供的 DINCOROS Bold 字体（`public/fonts/dincoros-bold.ttf`），同样随站点本地部署。

## 构建

```sh
npm run build
```

生成首页、文章、静态资源与自定义 404 页面。站点为纯静态博客，无登录、评论或后台管理。
