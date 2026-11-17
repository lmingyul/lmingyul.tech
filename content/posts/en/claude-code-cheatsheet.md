---
title: Claude Code Command Cheat Sheet
slug: claude-code-cheatsheet
publishedAt: '2026-03-26T21:55:00.000Z'
categories:
  - AI
  - Tools
  - Commands
  - Agent
description: >-
  Tools iterate quickly, so commands may not currently be available and need to
  be kept fresh.
cover: /uploads/covers/claude-code-cheatsheet.png
readingTime: 7
mood: neutral
draft: false
id: 416b44d3-5440-81ec-b3df-f6c69dfe54f6
---
> Tools iterate quickly, and commands may not always be currently available—keep this fresh

# ⌨️ Keyboard Shortcuts

## Basics

| Key | Action |
| --- | --- |
| `Enter` | Send message / submit |
| `Esc` | Interrupt / stop generation |
| `Esc Esc` | Open the rewind menu (return to the state before the conversation or code) |
| `Ctrl+C` | Cancel the current operation (force stop) |
| `Ctrl+D` | Exit Claude Code |
| `Shift+Tab` | Switch modes: Normal → Auto-Accept → Plan |

---

## Navigation

| Key | Action |
| --- | --- |
| `Ctrl+R` | Search the history of previously entered commands (prompts) |
| `Ctrl+T` | Toggle the task list |
| `Ctrl+O` | Toggle the detailed conversation transcript |
| `Ctrl+G` | Open an external editor (for writing long prompts) |
| `Ctrl+V` | Paste images (screenshots, diagrams, etc.) |
| `Ctrl+S` | Stash the current prompt (save it for later) |
| `Cmd+P` / `Meta+P` | Open the model selector (quickly switch models) |
| `Cmd+T` / `Meta+T` | Toggle extended thinking mode |

---

## Editing (Bash style)

| Key | Action |
| --- | --- |
| `Ctrl+A` / `Ctrl+E` | Move to the beginning / end of the line |
| `Opt+F` / `Opt+B` | Move forward / backward one word |
| `Ctrl+W` | Delete the previous word |
| `\\ + Enter` | Start a new line (but don't send) |

---

## Background Tasks

| Key | Action |
| --- | --- |
| `Ctrl+B` | Send the currently running task to the background |

Tip: Run `/terminal-setup` to enable **Shift+Enter multi-line input** in iTerm2 and VS Code. Run `/keybindings` to customize all shortcuts.

---

# ⚡ Slash Commands

## Session Control

| Command | Action |
| --- | --- |
| `/clear` | Reset the conversation history (start over) |
| `/compact [hint]` | Compress the context to save tokens, with an optional hint for what to keep |
| `/rewind` | Rewind the conversation and/or code changes |
| `/export [file]` | Export the conversation to a file or the clipboard |
| `/cost` | Show session cost and token usage |
| `/usage` | Show plan usage and rate limits |
| `/context` | View a visualization of token consumption |

---

## Configuration

| Command | Action |
| --- | --- |
| `/config` | Open the settings panel |
| `/model` | Switch between Sonnet / Opus / Haiku |
| `/permissions` | View and update tool permissions |
| `/keybindings` | Open the keybindings config file |
| `/vim` | Toggle vim input mode |
| `/terminal-setup` | Set up Shift+Enter multi-line input |

---

## Development

| Command | Action |
| --- | --- |
| `/init` | Create [CLAUDE.md](http://CLAUDE.md) for the project (this should be the first step) |
| `/memory` | View and edit the [CLAUDE.md](http://CLAUDE.md) project memory |
| `/review` | Code review analysis |
| `/doctor` | Claude Code environment diagnostics and health check |
| `/agents` | Manage sub-agents |
| `/mcp` | Manage MCP servers |

---

## Advanced

| Command | Action |
| --- | --- |
| `/insights` | Generate an HTML usage report |
| `/pr_comments` | View GitHub PR feedback |
| `/install-github-app` | Set up automatic PR review |
| `/tasks` | Persistent task list management |
| `/teleport` | Transfer sessions between Web and local |

---

# 🚀 CLI Startup Parameters

## Starting a Session

| Parameter | Action |
| --- | --- |
| `claude` | Start an interactive session |
| `claude "query"` | Start with an initial prompt |
| `claude -p "query"` | Print mode (exit after answering, for scripts) |
| `claude -c` | Continue the previous conversation |
| `claude -r "name"` | Resume a specific session by name or ID |
| `claude -w name` | Start in an isolated git worktree |

---

## Model and Behavior

| Parameter | Action |
| --- | --- |
| `--model sonnet` | Use Sonnet (fast, low cost) |
| `--model opus` | Use Opus (the most powerful model) |
| `--agent my-agent` | Use the specified sub-agent |
| `--permission-mode plan` | Start in plan mode |
| `--max-turns N` | Limit the number of conversation turns |
| `--max-budget-usd N` | Set the maximum spend |

---

## Context and Directories

| Parameter | Action |
| --- | --- |
| `--add-dir ../path` | Add extra directories to the context |
| `--chrome` | Enable browser integration |
| `--verbose` | Show verbose logs |

---

## Permissions

| Parameter | Action |
| --- | --- |
| `--allowedTools` | Allow specific tools |
| `--disallowedTools` | Disallow specific tools |
| `--tools "Bash,Edit"` | Allow only these tools |

---

## Output Format (-p mode)

| Parameter | Action |
| --- | --- |
| `--output-format text` | Plain text (default) |
| `--output-format json` | JSON structured output |
| `--output-format stream-json` | Real-time JSON stream |

Tips:

`git diff | claude -p "review this"`

`cat error.log | claude -p "explain"`

---

# 🧩 Claude Code Extension System (Five Core Components)

## 1. [CLAUDE.md](http://CLAUDE.md) — Project Memory

|  |  |
| --- | --- |
| What it is | A Markdown file that Claude reads at every session; it's the project's knowledge base |
| Location | `.claude/CLAUDE.md` or `~/.claude/CLAUDE.md` |
| Creation | Run `/init` in the project |

---

## 2. Custom Slash Commands

|  |  |
| --- | --- |
| What it is | Your own /commands (like prompt templates) |
| Location | `.claude/commands/` |
| Usage | Filename = command name |

For example:

`review.md → /project:review`

---

## 3. Skills — Automatic Knowledge Invocation

|  |  |
| --- | --- |
| What it is | Similar to commands, but Claude automatically decides when to use them |
| Location | `.claude/skills/` |
| Usage | Claude automatically detects the context |

---

## 4. Sub-Agents

|  |  |
| --- | --- |
| What it is | Independent Claude instances with different roles |
| Location | `.claude/agents/` |
| Invocation | `/agents` or just describe it |

---

## 5. MCP Servers — External Tool Connections

|  |  |
| --- | --- |
| What it is | Connect to GitHub, Notion, databases, APIs, etc. |
| Add | `claude mcp add <name> <command>` |
| View | `claude mcp list` |

---

## Plugins

|  |  |
| --- | --- |
| What it is | Community extensions |
| Browse | `/plugin` |
| Local plugins | `--plugin-dir ./my-plugins` |

---

# 🔄 Permission Modes

| Mode | Description |
| --- | --- |
| Normal | Every tool use requires confirmation |
| Auto-Accept | Automatically execute tools (faster) |
| Plan | Read-only and planning, no execution |

Switch: `Shift+Tab`

---

# 🪝 Hooks (Event Automation)

| Hook | Description |
| --- | --- |
| PreToolUse | Before tool execution |
| PostToolUse | After tool execution |
| UserPromptSubmit | Before user message processing |
| Stop | When Claude finishes replying |
| SessionStart | When the session starts |
| SessionEnd | When the session ends |
| PreCompact | Before context compaction |
| Notification | When Claude sends a notification |

---

# ✨ Input Capabilities

| Feature | Description |
| --- | --- |
| `@` | Reference a file or directory |
| `!` | Run a shell command |
| Paste image | Ctrl+V |
| Piped input | `cat file.py` |
| Multiple directories | `--add-dir` |
| worktree | `claude -w feature` |

---

# ⚙️ Configuration

## Settings Precedence

| Level | Location |
| --- | --- |
| Enterprise | `/etc/claude-code/managed-settings.json` |
| Project personal | `.claude/settings.local.json` |
| Project shared | `.claude/settings.json` |
| User global | `~/.claude/settings.json` |

---

## Configuring via CLI

| Command | Action |
| --- | --- |
| `claude config list` | View all settings |
| `claude config get key` | View a value |
| `claude config set key value` | Modify a value |
| `claude config add key value` | Add an array item |

---

# 📁 File Structure

## Project Level

| File | Purpose |
| --- | --- |
| [CLAUDE.md](http://CLAUDE.md) | Project memory |
| settings.json | Shared project config |
| settings.local.json | Personal project config |
| commands/ | Project commands |
| skills/ | Project skills |
| agents/ | Subagents |

---

## Global Level

| File | Purpose |
| --- | --- |
| [CLAUDE.md](http://CLAUDE.md) | Global memory |
| settings.json | Global config |
| commands/ | Personal commands |
| skills/ | Personal skills |
| keybindings.json | Keybinding config |

---

# ⏪ Rewind and Checkpoints

| Action | Function |
| --- | --- |
| Esc Esc | Open the rewind menu |
| /rewind | Rewind |

Types:

| Type | Description |
| --- | --- |
| Conversation | Rewinds the conversation only |
| Code | Restores code only |
| Full Rewind | Restores both |

Note: Bash side effects (database operations, API calls, `rm` deletions, etc.) cannot be rewound.

---

# 🎯 Advanced Workflows

## New Project

`cd project && claude`

Then run `/init`

---

## Plan → Execute Mode

`Shift+Tab → Plan Mode`

Describe the task → review the plan → `Shift+Tab → Normal` to execute

---

## Cost-Saving Tips

| Method | Reason |
| --- | --- |
| /compact | Compress the context |
| /clear | Clear the history |
| Use Sonnet | Lower cost |
| Use @ references | Save tokens |

---

## Debugging Tips

| Method | Description |
| --- | --- |
| Paste the error | Claude is great at parsing stack traces |
| Paste a screenshot | Claude can identify the problem |
| Pipe logs | `cat error.log` |
| /doctor | Run an environment check |

---

## Parallel Development

| Method | Action |
| --- | --- |
| worktrees | `claude -w feature-auth` |
| Multiple directories | `--add-dir ../api ../web` |
| Background tasks | Ctrl+B |
| Agent teams | Multiple Claudes collaborating |

---

# 🛠️ Creating Custom Commands

Steps:

1. Create the file

`.claude/commands/review.md`

2. Write the prompt

The Markdown content is the prompt

3. Use the command

`/project:review`

---

## Optional YAML Config

| Key | Purpose |
| --- | --- |
| argument-hint | Argument hint |
| description | Command description |
| allowed-tools | Restrict tools |
| model | Specify the model |

---

## Variables

`$ARGUMENTS`

Example:

`/project:review src/auth.ts`

---

# 📋 Common Combinations

## Everyday Operations

| Operation | Command |
| --- | --- |
| Start a project | `cd project && claude` |
| Resume a session | `claude -c` |
| Quick question | `claude -p "how do I..."` |
| Review code | `git diff` |
| Explain an error | `cat error.log` |
| Check cost | `/cost` |
| Undo a mistake | `Esc Esc` |

---

## Advanced Tips

| Operation | Command |
| --- | --- |
| Parallel sessions | `claude -w feature-a` |
| reviewer agent | `.claude/agents/reviewer.md` |
| Auto-formatting | PostToolUse hook + prettier |
| Web session | `claude --remote` |
| Transfer a session | `claude --teleport` |
| Budget limit | `--max-budget-usd` |
| JSON automation | `--output-format json` |
