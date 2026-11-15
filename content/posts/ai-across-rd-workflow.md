---
title: "让 AI 贯穿整个研发（研究&开发）流程"
slug: "ai-across-rd-workflow"
publishedAt: "2025-11-18T15:21:00.000Z"
categories:
  - "AI"
  - "工具"
description: "AI在研发流程中扮演着重要角色，DeepResearch可帮助快速收集和学习相关领域的信息，NotebookLM可用于拆解学习资料，ChatGPT Atlas可简化论文阅读，模型翻译能力强，OCR功能可提取代码，DeepWiKi和Code Wiki可助力代码学习。AI还可自动化信息收集和任务管理，优化文档写作，提升工作效率。整体上，AI的应用使得研发工作变得更高效和便捷。"
cover: "/uploads/posts/ai-across-rd-workflow/01-2025-11-19-_00_26_30.jpg"
readingTime: 21
mood: "neutral"
draft: false
id: "2afb44d3-5440-8083-b3a5-eaa9b2b4b91b"
---
> 把 AI 作为我们日常生活、工作的 24 小时的搭子，现在 SOTA 模型的能力普遍高于大多数人，不管是创意类、写作类，甚至是编码类的工作都比很多人做的要好，很多模型的能力上限取决于使用人的上限，在这个 AI 的大时代，学会更好的向 AI 的提问与协作是一门需要持续学习的技能。
>
> **相同的工具在不同人手里作用效果都是不一样的。**

![](/uploads/posts/ai-across-rd-workflow/01-2025-11-19-_00_26_30.jpg)

# 让研究一个方向变得更容易上手

## 一切从 DeepResearch 开始

当你有一个方向、问题或者研究领域需要从零开始，这个时候就可以使用 DeepResearch 开始。

![](/uploads/posts/ai-across-rd-workflow/02-imagespixpin_2025-11-17_00-44-07.png)

DeepResearch 可以通过广泛的搜索帮你收集你想了解的问题的方方面面，可以加速我们初步上手、学习一门学科、研究一个方向的速度。可以帮你把搜索的所有相关的内容都标记上链接，方便你更深入的学习。

```txt
请协助我调研收集最近一年关于 GUI Agent 最新的进展：

目标: 全面梳理出现的重要论文、博客和模型，找出基于大规模语言/多模态模型的 GUI Agent 的（重点是移动端 Agent、Mobile Agent）最新 SOTA 模型。

具体需求
1. 收集文献与资料
   • 每篇需提供：标题、发布时间、arXiv/DOI 链接地址、对应 GitHub 仓库（若有）或者来源。

2. SOTA 模型的实现与训练方法
   • 对比当前 SOTA GUI Agent 的不同实现方案。
   • 总结模型的训练方案（包括数据如何处理、真实环境或虚拟环境如何构建、训练过程以及算法解析等）
   • 列出其在公认评测集如 AndroidWorld、ScreenSpotPro、ScreenSpot-v2、UI-I2E-Bench 等上的最新公开指标。

3. 创新点
   • 概括工作的核心创新，总结梳理在体系结构、训练范式、提示工程、数据合成策略等方面的创新性。

4. 难点与挑战
   • 归纳当前工作研究面临的关键技术瓶颈。

5. 最佳实践
   • 给出工作的最佳实现 / 训练方案（含数据流水线、模型选择、强化学习或反馈机制）。

输出格式
• 建议使用分级标题和表格对关键信息进行汇总，便于检索与对比。
```

示例：收集与 GRPO 相关的资料

![](/uploads/posts/ai-across-rd-workflow/03-imagespixpin_2025-11-17_11-20-30.png)

使用 DeepRsearch 需要注意的地方：

- 信源的质量：是否是权威官方发布、论文引用数、 GitHub 仓库的影响力等等

![GPT](/uploads/posts/ai-across-rd-workflow/08-imagespixpin_2025-11-17_11-20-45.png)

![Gemini](/uploads/posts/ai-across-rd-workflow/09-imagespixpin_2025-11-17_11-33-45.png)

![deepresearch 结果示例](/uploads/posts/ai-across-rd-workflow/10-imageschatgpt--grpo.png)

## 让模型帮你拆解学习

当模型帮你找到一堆学习资料，你觉得无从下手，这个时候就可以使用到模型的另一个能力，带你入门。

使用 NotebookLM 帮你拆解问题进行学习，可以生成思维导图、音频、视频、闪卡以及测试题。你可以上传各种格式的文件，网站、youtube 视频链接，甚至用提示词让它实时去搜索。

![](/uploads/posts/ai-across-rd-workflow/04-imagespixpin_2025-11-18_11-40-37.png)

![](/uploads/posts/ai-across-rd-workflow/05-imagespixpin_2025-11-17_16-24-27.png)

![生成对应的思维导图](/uploads/posts/ai-across-rd-workflow/11-imagespixpin_2025-11-17_16-26-43.png)

![生成对应的视频](/uploads/posts/ai-across-rd-workflow/12-imagespixpin_2025-11-17_18-47-31.png)

![生成对应的问题及答案，用于强化学习效果](/uploads/posts/ai-across-rd-workflow/13-imagespixpin_2025-11-17_18-51-20.png)

![最后用测验来检验学习后的成果](/uploads/posts/ai-across-rd-workflow/14-imagespixpin_2025-11-17_18-52-20.png)

比如说，可以导入高考真题试一下，不仅可以生成总结，也可以对上传的资料进行提问学习。

![](/uploads/posts/ai-across-rd-workflow/06-imagespixpin_2025-11-18_11-36-41.png)

![](/uploads/posts/ai-across-rd-workflow/07-imagespixpin_2025-11-18_11-38-53.png)

又比如说，可以导入 mindspeed-llm 仓库的所有 doc 文档，加上让它生成培训内容试一下。

```txt
根据提供的内容摘录，编写一份详细的培训手册，系统地阐述通过提供内容中所涉及的核心原则。手册应采用专业和指导性的语气，将复杂的概念分解为可行的步骤和课程。确保内容完全基于源材料，涵盖从所提供内容涉及的所有方面。

培训手册应包括以下内容：

培训目标和预期成果
培训内容和结构
培训方法和工具
培训评估和反馈
培训总结和后续行动
培训案例和实例
培训资源和参考文献
```

![](/uploads/posts/ai-across-rd-workflow/15-imagespixpin_2025-11-18_14-07-31.png)

![](/uploads/posts/ai-across-rd-workflow/16-imagespixpin_2025-11-18_14-19-50.png)

### 使用场景

- 学习一门学科
- 学习一门语言
- 学习一个代码框架
- 读一本书
- 研究一个领域问题
- 学习一门新技能
- … …

只要有相关资料，把能收集到的所有材料都传入进去，都可以进行拆解学习。

# 让读论文变得跟读小说一样简单

直接打开 arxiv 论文页面，使用 ChatGPT Atlas 浏览器的 Agent 代理功能，帮你阅读前 3 篇文章

![](/uploads/posts/ai-across-rd-workflow/17-imagespixpin_2025-11-16_02-27-07.png)

甚至 pdf 都不需要下载下来，再上传，直接就通过 Atlas 对浏览器上的论文直接提问。

![](/uploads/posts/ai-across-rd-workflow/18-imagespixpin_2025-11-18_14-13-17.png)

## 让模型帮你翻译

Transformers 模型之前的主要工作就是做翻译，所以现在模型翻译的能力已经很强了，甚至比翻译专业的人还要专业。

借助工具：

- 沉浸式翻译插件
- Trancy 插件
- 幻觉翻译：基于原 PDF 进行翻译解析
- 腾讯元宝 ：有一个科研报告图的形式很不错，入口：全部应用->AI
- 豆包：在交互上更好，可以在原文解析

### 沉浸式翻译插件

![](/uploads/posts/ai-across-rd-workflow/19-imagespixpin_2025-11-17_09-43-01.png)

还可以进行整个文档翻译

![](/uploads/posts/ai-across-rd-workflow/20-imagespixpin_2025-11-17_09-47-36.png)

### 腾讯元宝

![](/uploads/posts/ai-across-rd-workflow/21-imagespixpin_2025-11-17_18-58-05.png)

## 模型提取论文任何东西

模型的 OCR 能力很强，当你想复制论文中的代码、脚本、或者提示词去做实验，但是在论文中这些有时候因为是图片无法复制，就可以让大模型帮你提取。

![](/uploads/posts/ai-across-rd-workflow/22-imagespixpin_2025-11-16_01-13-18.png)

比如说这里有一段代码和训练脚本都是图片，无法直接复制，这个时候就可以用到大模型。

![](/uploads/posts/ai-across-rd-workflow/23-imagespixpin_2025-11-16_01-10-38.png)

![](/uploads/posts/ai-across-rd-workflow/24-imagespixpin_2025-11-16_01-15-01.png)

## 模型收集相关工作

当一篇文章你用模型翻译之后还是看不太懂，很有可能它是基于其他工作引申出来的优化或者改进，比如阿里提出的 GSPO 就是基于 DeepSeeK 提出的 GRPO 的基础上进行优化改进的。

这个时候你就可以通过模型帮你收集与这篇论文相关的其他工作做背景学习。

```latex
全面地整理本文涉及到的 relatedwork，每篇用一句话介绍。
```

![](/uploads/posts/ai-across-rd-workflow/25-imageschatgpt-related_work.png)

# 让阅读代码变得跟聊天一样自然

光阅读论文还不够，有时候论文中还会附带开源代码仓库，执行代码仓库可以更好的理解论文的实现。

## DeepWiKi

这是 Devin 的一个开源项目，会将很多重要的 GitHub 仓库提前索引解析，其他所有人都可以基于这一份解析去学习这个代码仓库

![](/uploads/posts/ai-across-rd-workflow/26-imagespixpin_2025-11-17_19-33-56.png)

![](/uploads/posts/ai-across-rd-workflow/27-imagespixpin_2025-11-17_19-39-21.png)

## Code Wiki

> Google 最近推出的 Code Wiki，目前是免费的。

- **自动生成并持续更新**：当代码仓库（public repo）变更时，文档也会更新。
- **结构化、智能化的文档**：不仅是函数注释、API列举，还包括概念解释、架构图、类图、序列图等。
- **交互式问答／智能助手**

![](/uploads/posts/ai-across-rd-workflow/28-imagespixpin_2025-11-18_08-43-37.png)

![](/uploads/posts/ai-across-rd-workflow/29-imagespixpin_2025-11-18_08-44-51.png)

![](/uploads/posts/ai-across-rd-workflow/30-imagespixpin_2025-11-18_08-48-45.png)

## [Codex](https://openai.com/zh-Hans-CN/codex/)

OpenAI 发布的一个 Code Agent，可以作为 vscode 的插件，对现有的代码进行索引检索，把检索到的上下文作为提示词一部分。

当遇到 BUG 时，通过叠加代码的形式会比直接向大模型提问，让它搜索网络的效果要更好。

![](/uploads/posts/ai-across-rd-workflow/31-imagespixpin_2025-11-18_09-07-44.png)

比如说可以生成整个框架的流程图，方便阅读源码

![](/uploads/posts/ai-across-rd-workflow/32-imagespixpin_2025-11-18_14-33-55.png)

![](/uploads/posts/ai-across-rd-workflow/33-imagespixpin_2025-11-18_14-52-21.png)

## [Claude Code](https://claude.com/product/claude-code)

> Claude Code 是由 Anthropic 开发的一个“agentic”编程工具。它能够在你的终端（或 IDE）中运行，理解你的整个代码库，并据此执行一系列任务：比如解释复杂代码、执行 Git 工作流、重构、写测试等等。

它是基于命令行终端的，相比 codex 这种插件，它的系统权限会更高，可以做的操作会更多。而且它代码的效果能力也是目前最强的。

## Cursor

---

# 让跟踪学习变得润物细无声

在 AI 这个日新月异的时代，每天都会有很多新的进展和新的发现，靠我们自身人的的精力去找到所有有效的信息是很困难的，毕竟我们不是专门去做研究的。这个时候就可以利用 AI 帮我们做一下自动化归纳收集的工作，让模型帮我们去追踪、筛选以及报告，解放我们的时间去做更有意义的事情。

ChatGPT、Genmini 包括 Perplexity 都存在一个项目的功能或概念。我们可以通过给论文学习、资讯收集都以项目作为单位进行开展。

## ChatGPT

可以通过提示词进行设置，步骤：

在侧边栏新建项目

![](/uploads/posts/ai-across-rd-workflow/34-imagespixpin_2025-11-16_01-34-12.png)

![](/uploads/posts/ai-across-rd-workflow/35-imagespixpin_2025-11-16_01-34-49.png)

![](/uploads/posts/ai-across-rd-workflow/36-imagespixpin_2025-11-16_01-35-47.png)

然后在个人设置中的安排里把这些设置过的任务进行统一管理。

![](/uploads/posts/ai-across-rd-workflow/37-imagespixpin_2025-11-16_22-55-10.png)

## Gemini

直接聊天设置

![](/uploads/posts/ai-across-rd-workflow/38-imagespixpin_2025-11-16_01-37-49.png)

## Perplexity

在我的->任务中可以设置自动化任务

![](/uploads/posts/ai-across-rd-workflow/39-imagespixpin_2025-11-16_01-29-53.png)

![](/uploads/posts/ai-across-rd-workflow/40-imagespixpin_2025-11-16_01-30-57.png)

![](/uploads/posts/ai-across-rd-workflow/41-imagespixpin_2025-11-16_01-31-40.png)

---

# 让写文档变得更加轻松

首先想要优化文档写作，得先看文档由哪几部分组成，哪些部分可以通过模型来优化的

文档的组成部分：

- 标题：可以使用模型进行头脑风暴，起标题名
- 摘要：用模型进行内容的总结和抽象
- 写作大纲：让模型**参与论文大纲的构思，细化每部分内容要点**
- 正文
  - 公式
  - 插图

## 常用的提示词

```txt
# 标题生成
帮我想3个有关XXX的论文标题

# 摘要生成
总结全文,.....
请重新改写摘要，提供10个不同版本

# 语法纠正与正式语气
请润色这句话，使其更具文学性并表达清晰

# 针对比较长的句子可以进行句子结构与用词优化
改写以下段落，让其用词更准确，内容更丰富：XXX

# 让模型检查各部分的合理排序，确保论文结构的逻辑性
请检查大纲部分顺序是否合理，并说明各部分衔接关系

# 最后可以使用模型审查和修改
请检查以下段落的逻辑结构是否合理，并提出改进建议

```

## 正文

### 公式

使用模型的 OCR 能力，更好的生成公式插入到自己的文档中使用

比如，将论文中的公式截图贴给大模型，让模型以 Latex 的格式输出公式，实现效率更高，更好看的公式展示与修改

![](/uploads/posts/ai-across-rd-workflow/42-images81988.png)

```bash
convert to latex in a code fence
```

```latex
\mathcal{J}_{GRPO}(\theta) = \mathbb{E}_{x \sim \mathcal{D}, \{y_i\}_{i=1}^G \sim \pi_{\theta_{old}}(\cdot|x)} \left[ \frac{1}{G} \sum_{i=1}^G \frac{1}{|y_i|} \sum_{t=1}^{|y_i|} \min \left( w_{i,t}(\theta) \hat{A}_{i,t}, \text{clip}(w_{i,t}(\theta), 1 - \epsilon, 1 + \epsilon) \hat{A}_{i,t} \right) \right]
```

![](/uploads/posts/ai-across-rd-workflow/43-imagespixpin_2025-11-15_17-17-01.png)

$$
\mathcal{J}_{GRPO}(\theta) = \mathbb{E}_{x \sim \mathcal{D}, \{y_i\}_{i=1}^G \sim \pi_{\theta_{old}}(\cdot|x)} \left[ \frac{1}{G} \sum_{i=1}^G \frac{1}{|y_i|} \sum_{t=1}^{|y_i|} \min \left( w_{i,t}(\theta) \hat{A}_{i,t}, \text{clip}(w_{i,t}(\theta), 1 - \epsilon, 1 + \epsilon) \hat{A}_{i,t} \right) \right]
$$

把 Latex 粘贴到 word 的步骤也很简单：

在 Word 中按快捷键或者点击 插入 -> 公式 -> 选择 Latex

- **Win: Alt + =**
- Mac 是 **Control + =**  
→ 打开公式编辑框，把你的 LaTeX 粘贴进去。

![](/uploads/posts/ai-across-rd-workflow/44-imagespixpin_2025-11-15_17-15-14.png)

![](/uploads/posts/ai-across-rd-workflow/45-imagespixpin_2025-11-15_17-16-09.png)

![](/uploads/posts/ai-across-rd-workflow/46-imagespixpin_2025-11-15_17-16-33.png)

### 插图

目前通用大模型是直接可以生成图片的效果，我们可以通过语音大模型生成生成图片的 prompt 提供给图形模型来生成。

```txt
通读全文，这篇论文没有做更多的可视化绘图，在充分理解全文的基础上，请帮我设计一些可能的科研绘图方案，以文生图的英文prompt的方式输出。使我可以完全通过这些prompts让现代 ai 生图工具直接生成对应的完整的科研绘图。
```

![](/uploads/posts/ai-across-rd-workflow/47-imagespixpin_2025-11-18_00-48-31.png)

```txt
# 方案 1：DeepSeek-R1 的“顿悟时刻” (The "Aha Moment")
Subject: A conceptual scientific illustration representing the "Aha Moment" of an Artificial Intelligence. Description: A complex, dark, and chaotic 3D neural network structure in the background. In the center, a distinct, glowing, golden-white path suddenly aligns perfectly, cutting through the chaos. This path represents a "Chain-of-Thought" reasoning process. Along this bright path, small nodes light up sequentially, symbolizing self-verification and reflection. Style: High-tech, cinematic lighting, macro photography style, depth of field, 8k resolution, unreal engine 5 render. Color Palette: Deep navy blues and blacks for the background, bright gold and electric blue for the active reasoning path. Composition: Central composition, highlighting the contrast between the chaotic surroundings and the orderly central beam.

# 方案 2：DeepSeek-R1 的四阶段训练流水线 (The Training Pipeline)
Subject: An isometric 3D diagram of a four-stage AI model training pipeline. Description: The image shows a futuristic assembly line with four distinct stations connected by data streams.
Station 1 (Cold Start): A small pile of glowing, high-quality document icons entering a raw AI model.
Station 2 (Reasoning RL): The model enters a blue cyclical loop structure, symbolizing reinforcement learning and self-optimization for math and code.
Station 3 (Rejection Sampling): A filter mechanism where bad data (red particles) is discarded and only pure, bright data (gold particles) passes through to a larger dataset pool.
Station 4 (Final RL): The model goes through a final, multi-colored alignment ring, representing safety and general capabilities. Style: Clean, minimalist 3D infographic style, similar to Apple or Google design aesthetics. Soft shadows, matte materials. Color Palette: White background, pastel blue, metallic silver, and soft green accents. Details: No text labels in the image, just visual geometric representations of the processes.

# 知识蒸馏：从巨型模型到小型模型 (Distillation Process)
Subject: A sci-fi illustration of "Knowledge Distillation" from a Large Language Model to smaller models. Description: A colossal, highly detailed, towering robot head or brain structure composed of millions of blue fiber-optic cables (representing DeepSeek-R1). It is projecting a concentrated, structured beam of geometric light and data symbols downwards into a row of smaller, sleek, compact crystalline structures (representing the dense models like 1.5B, 7B, 14B). The smaller structures absorb the light and begin to glow with the same intensity as the giant. Style: Cyberpunk, futuristic, digital art, volumetric lighting, glowing effects. Mood: Powerful, educational, transfer of wisdom. Color Palette: Electric blue, neon purple, and white.

# 方案 4：GRPO 算法原理抽象图 (GRPO Algorithm Abstract)
Subject: An abstract data visualization of the Group Relative Policy Optimization (GRPO) algorithm. Description: A central node (the prompt) branches out into multiple parallel pathways (the group of outputs). These pathways are visualized as semi-transparent ribbons. Some ribbons are straight and reach a glowing target (high reward), while others are twisted or break off (low reward). A "selector" field surrounds the straightest ribbons, intensifying their brightness, while the twisted ribbons fade away. This illustrates the concept of estimating baseline from group scores without a critic model. Style: Abstract data art, glassmorphism, translucent textures, scientific visualization. Color Palette: Dark background, neon orange for high reward paths, faint grey for low reward paths.

# 方案 5：纯强化学习 vs 监督微调 (Pure RL vs SFT)
Subject: A comparative metaphorical illustration of Supervised Fine-Tuning vs. Pure Reinforcement Learning. Description: A split composition or a dual-path landscape. Left side (SFT): A paved, rigid, artificial staircase going up a mountain, representing human-guided learning. Right side (Pure RL): A glowing, fluid energy trail that scales the sheer cliff face freely. The trail spirals and loops (representing thinking and self-correction) but reaches a higher peak than the staircase. Style: Digital painting, fantasy/sci-fi blend, epic scale. Meaning: The glowing trail represents the emergent reasoning capability of DeepSeek-R1-Zero exploring the solution space autonomously.
```

![](/uploads/posts/ai-across-rd-workflow/48-imagespixpin_2025-11-18_00-53-13.png)

![](/uploads/posts/ai-across-rd-workflow/49-imagespixpin_2025-11-18_00-55-03.png)

![](/uploads/posts/ai-across-rd-workflow/50-imagesgemini_generated_image_ifoy76ifoy76i.png)

![](/uploads/posts/ai-across-rd-workflow/51-imageschatgpt_image_2025-11-18-_00_55_18.png)

## 缩略图

放在文章旁边的小图。

![](/uploads/posts/ai-across-rd-workflow/52-imagespixpin_2025-11-18_10-56-50.png)

```txt
充分地理解论文文章的基础上，如果要为这篇学术文章生成一个 teaser 图以及一个 poster, 图要求以 nature 和 science 风格生成，输出设计对应完整的文生图 prompts。
```

![](/uploads/posts/ai-across-rd-workflow/53-imagespixpin_2025-11-18_09-31-13.png)

![](/uploads/posts/ai-across-rd-workflow/54-imagespixpin_2025-11-18_10-54-38.png)

![Gemini](/uploads/posts/ai-across-rd-workflow/60-imagesgemini_generated_image_c295ouc295ouc.png)

![GPT](/uploads/posts/ai-across-rd-workflow/61-imageschatgpt_image_2025-11-18-_11_00_22.png)

## 宣传海报

![Gemini](/uploads/posts/ai-across-rd-workflow/62-imagesgemini_generated_image_3ns7vw3ns7vw3.png)

![GPT](/uploads/posts/ai-across-rd-workflow/63-imageschatgpt_image_2025-11-18-_11_02_17.png)

---

# 让使用模型更方便

## 固定 Prompts 的复用

我们需要日常维护自己的工具库，就是把自己日常常用的场景的提示词收集起来，不断优化。

比如：

- 文章学习总结
- 代码学习
- BUG修改优化
- 提示词优化
- ……

![](/uploads/posts/ai-across-rd-workflow/55-imagespixpin_2025-11-18_01-07-02.png)

![](/uploads/posts/ai-across-rd-workflow/56-imagespixpin_2025-11-18_01-07-58.png)

![](/uploads/posts/ai-across-rd-workflow/57-imagespixpin_2025-11-18_11-03-21.png)

## 交流过程的分享

有时候你跟模型的回答的很不错想分享给其他人，但是直接截图并不是很美观。这个时候可以使用到插件讲聊天记录直接导出成 pdf 或图片直接就可以直接进行分享。

安装插件 ChatGPT 导出器

![](/uploads/posts/ai-across-rd-workflow/58-imagespixpin_2025-11-18_01-12-50.png)

![](/uploads/posts/ai-across-rd-workflow/59-imagespixpin_2025-11-18_01-13-25.png)

# 结语

以下内容引用自：

[🔗 https://weekly.tw93.fun/posts/245/?__readwiseLocation=](https://weekly.tw93.fun/posts/245/?__readwiseLocation=)

- AI 浪潮下，优秀工程师 / 产品的评价标准，发生了什么变化？
  - 之前：代码写得又快又好，快速完成，高质量，产品，对产品业务很熟悉，需求文档写得很不错清晰，对产品发展想的清楚，有取舍，产出的东西能够实际有业务影响效果，有自己的主见。
  - 有了 AI 之后：你会发现，用的好的情况下，AI 写得比大部分工程师和产品经理都要好，慢慢我们需要解决的变成了 **问题如何拆解、架构如何实现、业务工作流如何设计、如何让 AI 更好的达到目的，如何定义 AI 的产出效果以及知道如何去优化这个效果让他更好**，能力上变成全能的产品工程师了。
  - 技术门槛虽然变低，但对人的整体素质的要求变高了。
- 如果一个 3–5 年从业者想往“10x 个体”靠近，应补哪几类能力？
  - **折腾能力**，愿意接受新事物的能力，愿意去玩各种新技术，并想到和自己要解决问题的关系
  - 学会把 AI 融入到自己的业务工作流里面去，而不是单纯的问 AI 当做谷歌用
  - 基础技术能力，计算机科学，设计交互审美能力，全栈技术的能力，运营推广的能力
  - 学会沟通，不管是和人沟通，还是和 AI 沟通，都有很大的技巧，让对方能够很好的 Get 到你的意思

工具一直在变，变多、变好，工具也只是帮助我们更好的生活与工作，我们不可能所有工具都需要掌握，我们需要掌握的是如何使用工具的能力以及勇于尝试的思维，希望每个人都能在大模型的时代都能找到适合自己工具使用方式，跟 AI 共同进步。
