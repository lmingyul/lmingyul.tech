# AI 每日简讯（日报）GitHub 自动接入说明

本目录用于存放 `https://lmingyul.top/ai` 板块展示的 **AI 每日简讯 / 日报** Markdown 文件。
本说明文件 `README.md` 会被前台解析器自动忽略，不会作为日报条目渲染。

## 1. 仓库与分支

- **Git 仓库**：`https://github.com/lmingyul/lmingyul.tech.git`
- **目标分支**：`main`
- **自动同步机制**：向 `main` 分支推送提交后，GitHub Webhook 会自动触发 VPS 上的 `/hooks/github-sync` 拉取最新 `content/` 与 `public/uploads/`，并调用 `/api/revalidate` 刷新 `/ai` 与 `/ai/[date]` 页面缓存，无需手动构建或重启容器。

## 2. 文件与媒体路径约定

- **日报 Markdown 路径**：`content/ai-daily/YYYY-MM-DD.md`（例如 `content/ai-daily/2026-11-16.md`）。
  - 请**不要**将日报写入 `content/posts/`，避免污染首页「近期文章」与 `/blog` 原创博文列表。
  - 同一天重复推送直接覆盖同名文件即可幂等更新。
- **日报内图片/视频资源（如有）**：
  - 存放路径：`public/uploads/ai-daily/YYYY-MM-DD/<文件名>`
  - Markdown 内引用路径：`/uploads/ai-daily/YYYY-MM-DD/<文件名>`

## 3. Frontmatter 与正文格式（宽容解析，所有元数据均可自动兜底）

推荐示例：

```markdown
---
date: "2026-11-16"
title: "AI 每日简讯 · 2026-11-16"
summary: "今日大模型推理优化、Agent 工程工具与重点开源项目汇总。"
tags:
  - 大模型
  - Agent
  - 开源
highlights:
  - 要点一（可选；若下方 Markdown 正文里已经包含今日速览章节，highlights 可留空不写）
  - 要点二
draft: false
---

## 一、 重点动态

- **条目一标题**：核心内容摘要…… [原文链接](https://example.com)
```

### 字段兜底规则

1. `date`（可选）：`YYYY-MM-DD`。若省略，自动从文件名 `YYYY-MM-DD.md` 提取。
2. `title`（可选）：若省略，自动生成 `AI 每日简讯 · YYYY-MM-DD`。
3. `summary`（可选）：用于左侧期数归档列表摘要与 SEO 描述；若省略，自动提取正文第一段非标题文本（前 140 字）。
4. `tags`（可选）：字符串数组或逗号分隔字符串。
5. `highlights`（可选）：字符串数组；提供时在正文上方渲染「今日速览」高亮卡片，留空则直接渲染 Markdown 正文。
6. `draft`（可选）：默认 `false`；设为 `true` 时前台隐藏。
