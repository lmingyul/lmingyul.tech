---
title: "Claude Code 命令速查表"
slug: "claude-code-cheatsheet"
publishedAt: "2026-03-26T21:55:00.000Z"
categories:
  - "AI"
  - "工具"
  - "命令"
  - "Agent"
description: "工具迭代很快，命令不一定当前可用，需及时保鲜"
cover: "/uploads/covers/claude-code-cheatsheet.png"
readingTime: 7
mood: "neutral"
draft: false
id: "416b44d3-5440-81ec-b3df-f6c69dfe54f6"
---
> 工具迭代很快，命令不一定当前可用，需及时保鲜

# ⌨️ 键盘快捷键

## 基础

| 按键 | 操作 |
| --- | --- |
| `Enter` | 发送消息 / 提交 |
| `Esc` | 中断 / 停止生成 |
| `Esc Esc` | 打开回溯菜单（回到对话或代码之前的状态） |
| `Ctrl+C` | 取消当前操作（强制停止） |
| `Ctrl+D` | 退出 Claude Code |
| `Shift+Tab` | 切换模式：Normal → Auto-Accept → Plan |

---

## 导航

| 按键 | 操作 |
| --- | --- |
| `Ctrl+R` | 搜索之前输入过的命令(prompt)历史 |
| `Ctrl+T` | 切换任务列表 |
| `Ctrl+O` | 切换详细对话记录 |
| `Ctrl+G` | 打开外部编辑器（编写长提示） |
| `Ctrl+V` | 粘贴图片（截图、图表等） |
| `Ctrl+S` | 暂存当前提示（保存稍后使用） |
| `Cmd+P` / `Meta+P` | 打开模型选择器（快速切换模型） |
| `Cmd+T` / `Meta+T` | 切换扩展思考模式 |

---

## 编辑（Bash 风格）

| 按键 | 操作 |
| --- | --- |
| `Ctrl+A` / `Ctrl+E` | 移动到行首 / 行尾 |
| `Opt+F` / `Opt+B` | 向前 / 向后移动一个单词 |
| `Ctrl+W` | 删除前一个单词 |
| `\\ + Enter` | 新起一行（但不发送） |

---

## 后台任务

| 按键 | 操作 |
| --- | --- |
| `Ctrl+B` | 将当前运行任务发送到后台 |

提示：运行 `/terminal-setup` 可在 iTerm2 和 VS Code 中启用 **Shift+Enter 多行输入**。运行 `/keybindings` 可以自定义所有快捷键。

---

# ⚡ Slash 命令

## 会话控制

| 命令 | 操作 |
| --- | --- |
| `/clear` | 重置对话历史（重新开始） |
| `/compact [hint]` | 压缩上下文以节省 token，可选提示保留哪些内容 |
| `/rewind` | 回退对话和/或代码更改 |
| `/export [file]` | 导出对话到文件或剪贴板 |
| `/cost` | 显示会话成本与 token 使用量 |
| `/usage` | 显示套餐使用情况与速率限制 |
| `/context` | 查看 token 消耗可视化 |

---

## 配置

| 命令 | 操作 |
| --- | --- |
| `/config` | 打开设置面板 |
| `/model` | 切换 Sonnet / Opus / Haiku |
| `/permissions` | 查看并更新工具权限 |
| `/keybindings` | 打开快捷键配置文件 |
| `/vim` | 切换 vim 输入模式 |
| `/terminal-setup` | 设置 Shift+Enter 多行输入 |

---

## 开发

| 命令 | 操作 |
| --- | --- |
| `/init` | 为项目创建 [CLAUDE.md](http://CLAUDE.md)（第一步应该做这个） |
| `/memory` | 查看和编辑 [CLAUDE.md](http://CLAUDE.md) 项目记忆 |
| `/review` | 代码审查分析 |
| `/doctor` | claude code 环境诊断与健康检查 |
| `/agents` | 管理子代理 |
| `/mcp` | 管理 MCP 服务器 |

---

## 高级

| 命令 | 操作 |
| --- | --- |
| `/insights` | 生成 HTML 使用报告 |
| `/pr_comments` | 查看 GitHub PR 反馈 |
| `/install-github-app` | 设置自动 PR 审查 |
| `/tasks` | 持久化任务列表管理 |
| `/teleport` | 在 Web 与本地之间转移会话 |

---

# 🚀 CLI 启动参数

## 启动会话

| 参数 | 操作 |
| --- | --- |
| `claude` | 启动交互式会话 |
| `claude "query"` | 使用初始提示启动 |
| `claude -p "query"` | 打印模式（回答后退出，用于脚本） |
| `claude -c` | 继续上一次对话 |
| `claude -r "name"` | 按名称或 ID 恢复指定会话 |
| `claude -w name` | 在隔离的 git worktree 中启动 |

---

## 模型与行为

| 参数 | 操作 |
| --- | --- |
| `--model sonnet` | 使用 Sonnet（速度快，成本低） |
| `--model opus` | 使用 Opus（最强模型） |
| `--agent my-agent` | 使用指定子代理 |
| `--permission-mode plan` | 以计划模式启动 |
| `--max-turns N` | 限制对话轮数 |
| `--max-budget-usd N` | 设置最大花费 |

---

## 上下文与目录

| 参数 | 操作 |
| --- | --- |
| `--add-dir ../path` | 添加额外目录到上下文 |
| `--chrome` | 启用浏览器集成 |
| `--verbose` | 显示详细日志 |

---

## 权限

| 参数 | 操作 |
| --- | --- |
| `--allowedTools` | 允许特定工具 |
| `--disallowedTools` | 禁止特定工具 |
| `--tools "Bash,Edit"` | 仅允许这些工具 |

---

## 输出格式（-p 模式）

| 参数 | 操作 |
| --- | --- |
| `--output-format text` | 纯文本（默认） |
| `--output-format json` | JSON 结构输出 |
| `--output-format stream-json` | 实时 JSON 流 |

提示：

`git diff | claude -p "review this"`

`cat error.log | claude -p "explain"`

---

# 🧩 Claude Code 扩展系统（五大核心）

## 1. [CLAUDE.md](http://CLAUDE.md) — 项目记忆

|  |  |
| --- | --- |
| 是什么 | Claude 每次会话都会读取的 Markdown 文件，是项目的知识库 |
| 位置 | `.claude/CLAUDE.md` 或 `~/.claude/CLAUDE.md` |
| 创建 | 在项目中运行 `/init` |

---

## 2. 自定义 Slash 命令

|  |  |
| --- | --- |
| 是什么 | 自己创建的 /命令（类似提示模板） |
| 位置 | `.claude/commands/` |
| 使用 | 文件名 = 命令名 |

例如：

`review.md → /project:review`

---

## 3. Skills — 自动调用知识

|  |  |
| --- | --- |
| 是什么 | 类似命令，但 Claude 自动判断何时使用 |
| 位置 | `.claude/skills/` |
| 使用 | Claude 自动检测上下文 |

---

## 4. 子代理（Sub-Agents）

|  |  |
| --- | --- |
| 是什么 | 独立 Claude 实例，拥有不同角色 |
| 位置 | `.claude/agents/` |
| 调用 | `/agents` 或直接说明 |

---

## 5. MCP 服务器 — 外部工具连接

|  |  |
| --- | --- |
| 是什么 | 连接 GitHub、Notion、数据库、API 等 |
| 添加 | `claude mcp add <name> <command>` |
| 查看 | `claude mcp list` |

---

## 插件（Plugins）

|  |  |
| --- | --- |
| 是什么 | 社区扩展 |
| 浏览 | `/plugin` |
| 本地插件 | `--plugin-dir ./my-plugins` |

---

# 🔄 权限模式

| 模式 | 描述 |
| --- | --- |
| Normal | 每次使用工具都需要确认 |
| Auto-Accept | 自动执行工具（更快） |
| Plan | 只读与规划，不执行 |

切换：`Shift+Tab`

---

# 🪝 Hooks（事件自动化）

| Hook | 说明 |
| --- | --- |
| PreToolUse | 工具执行前 |
| PostToolUse | 工具执行后 |
| UserPromptSubmit | 用户消息处理前 |
| Stop | Claude 回复结束 |
| SessionStart | 会话开始 |
| SessionEnd | 会话结束 |
| PreCompact | 压缩上下文前 |
| Notification | Claude 发送通知 |

---

# ✨ 输入能力

| 功能 | 说明 |
| --- | --- |
| `@` | 引用文件或目录 |
| `!` | 运行 shell 命令 |
| 粘贴图片 | Ctrl+V |
| 管道输入 | `cat file.py` |
| 多目录 | `--add-dir` |
| worktree | `claude -w feature` |

---

# ⚙️ 配置

## 设置优先级

| 级别 | 位置 |
| --- | --- |
| 企业级 | `/etc/claude-code/managed-settings.json` |
| 项目个人 | `.claude/settings.local.json` |
| 项目共享 | `.claude/settings.json` |
| 用户全局 | `~/.claude/settings.json` |

---

## 配置 CLI

| 命令 | 操作 |
| --- | --- |
| `claude config list` | 查看所有设置 |
| `claude config get key` | 查看值 |
| `claude config set key value` | 修改 |
| `claude config add key value` | 添加数组项 |

---

# 📁 文件结构

## 项目级

| 文件 | 作用 |
| --- | --- |
| [CLAUDE.md](http://CLAUDE.md) | 项目记忆 |
| settings.json | 项目共享配置 |
| settings.local.json | 个人项目配置 |
| commands/ | 项目命令 |
| skills/ | 项目技能 |
| agents/ | 子代理 |

---

## 全局级

| 文件 | 作用 |
| --- | --- |
| [CLAUDE.md](http://CLAUDE.md) | 全局记忆 |
| settings.json | 全局配置 |
| commands/ | 个人命令 |
| skills/ | 个人技能 |
| keybindings.json | 快捷键配置 |

---

# ⏪ 回退与检查点

| 操作 | 功能 |
| --- | --- |
| Esc Esc | 打开回退菜单 |
| /rewind | 回退 |

类型：

| 类型 | 说明 |
| --- | --- |
| Conversation | 仅回退对话 |
| Code | 仅恢复代码 |
| Full Rewind | 同时恢复 |

注意：Bash 的副作用（数据库操作、API 调用、rm 删除等）无法回退。

---

# 🎯 高级工作流程

## 新项目

`cd project && claude`

然后运行 `/init`

---

## 规划 → 执行模式

`Shift+Tab → Plan Mode`

描述任务 → 审查计划 → `Shift+Tab → Normal` 执行

---

## 省钱技巧

| 方法 | 原因 |
| --- | --- |
| /compact | 压缩上下文 |
| /clear | 清空历史 |
| 使用 Sonnet | 成本更低 |
| 使用 @引用 | 节省 token |

---

## 调试技巧

| 方法 | 说明 |
| --- | --- |
| 粘贴错误 | Claude 擅长解析 stack trace |
| 粘贴截图 | Claude 可以识别问题 |
| 管道日志 | `cat error.log` |
| /doctor | 运行环境检查 |

---

## 并行开发

| 方法 | 操作 |
| --- | --- |
| worktrees | `claude -w feature-auth` |
| 多目录 | `--add-dir ../api ../web` |
| 后台任务 | Ctrl+B |
| Agent 团队 | 多 Claude 协作 |

---

# 🛠️ 创建自定义命令

步骤：

1. 创建文件

`.claude/commands/review.md`

2. 写提示

Markdown 内容就是 prompt

3. 使用命令

`/project:review`

---

## YAML 可选配置

| 键 | 作用 |
| --- | --- |
| argument-hint | 参数提示 |
| description | 命令描述 |
| allowed-tools | 限制工具 |
| model | 指定模型 |

---

## 变量

`$ARGUMENTS`

示例：

`/project:review src/auth.ts`

---

# 📋 常用组合

## 日常操作

| 操作 | 命令 |
| --- | --- |
| 启动项目 | `cd project && claude` |
| 继续会话 | `claude -c` |
| 快速问答 | `claude -p "how do I..."` |
| 审查代码 | `git diff` |
| 解释错误 | `cat error.log` |
| 查看成本 | `/cost` |
| 撤销错误 | `Esc Esc` |

---

## 高级技巧

| 操作 | 命令 |
| --- | --- |
| 并行会话 | `claude -w feature-a` |
| reviewer 代理 | `.claude/agents/reviewer.md` |
| 自动格式化 | PostToolUse hook + prettier |
| Web 会话 | `claude --remote` |
| 会话转移 | `claude --teleport` |
| 预算限制 | `--max-budget-usd` |
| JSON 自动化 | `--output-format json` |
