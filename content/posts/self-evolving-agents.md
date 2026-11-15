---
title: "智能体自主进化的世界"
slug: "self-evolving-agents"
publishedAt: "2025-07-30T07:46:00.000Z"
categories:
  - "AI"
  - "Agent"
description: "目前 GUI Agent 是一种基于图形界面，具有自主能力的语言智能体（底层本质上都是 Language Model），它可以解决序列决策问题，模拟人类行为在不同图形界面（如手机、网页等）上交互，可以进行点击、输入以及通过视觉元素导航等操作。"
cover: "/uploads/posts/self-evolving-agents/01-image.png"
readingTime: 14
mood: "neutral"
draft: false
id: "240b44d3-5440-80b7-81b7-db68ac7b0e1b"
---
# GUI Agent

目前 GUI  Agent 是一种基于图形界面，具有自主能力的语言智能体（底层本质上都是 Language Model），它可以解决序列决策问题，模拟人类行为在不同图形界面（如手机、网页等）上交互，可以进行点击、输入以及通过视觉元素导航等操作。

## 与 API Agent 的区别

参考：[**API Agents vs. GUI Agents: Divergence and Convergence**](https://arxiv.org/abs/2503.11069)

![](/uploads/posts/self-evolving-agents/01-image.png)

- 使用的模型不一样
  - API Agent 一般使用语言模型
  - GUI Agent 一般使用视觉模型
- 可以执行的操作（动作）
  - API Agent：输出调用工具、函数
    - Tools Call （MCP）
    - Function Call
  - GUI Agent：输出动作以及动作对应的参数（如点击的坐标、输入的文本，滑动的距离等）
    - 点击 + 点击的坐标
    - 滑动 + 起始点坐标 + 终点的坐标
    - 输入 + 输入的文本
    - 长按 + 长按的坐标
    - 双击 + 双击的坐标
    - 回退
- 执行流程不一样
  - API Agent：理解输入文本 → 输出执行动作 → 通过文本判断执行结果
  - GUI Agent：先获取界面信息及元素 → 理解页面与可执行动作 → 综合理解页面信息结合输入文本 → 输出执行动作 → 通过页面判断执行结果

可以通过 HTML 和 DOM 树识别可操作的 UI 元素，但是每一步都计算量巨大，可在特别困难的识别页面或者元素位置采用这种方案

可参考：

- [**A Real-World WebAgent with Planning, Long Context Understanding, and Program Synthesis**](https://arxiv.org/abs/2307.12856)
- [**Mind2Web: Towards a Generalist Agent for the Web**](https://papers.nips.cc/paper_files/paper/2023/hash/5950bf290a1570ea401bf98882128160-Abstract-Datasets_and_Benchmarks.html)

## 架构设计

![](/uploads/posts/self-evolving-agents/02-image.jpg)

- 规划 Agent：根据历史操作生成**任务进度**，将单步中的核心内容记忆存储起来
- 决策 Agent：参考记忆单元和任务进度生成**操作**
- 反思 Agent：观察操作前后屏幕变化，必要时采取措施**重新执行**

![](/uploads/posts/self-evolving-agents/03-image.jpg)

![](/uploads/posts/self-evolving-agents/04-image.png)

按照 Agent 个数区分，分为：

- 单智能体
  - VLM
- 多智能体：延迟高
  - 页面元素信息（DOM 结构、页面总结） + LLM
  - VLM（感知）+ LLM（推理规划）+ VLM（动作） + LLM（反思）
  - 纯 VLM：同时完成感知、规划和决策任务
    - 模型需要具备的能力：
      - 元素定位（Grounding）能力（比如：描述元素，让模型输出元素坐标）
      - 指称（Referring）能力 （比如：给出元素坐标，让模型描述识别是什么）
      - 细粒度 OCR 能力：支持高分辨率图片
      - UI 界面理解能力：能回答 UI 相关问题（如： 绿色按钮上面的是什么）
      - UI 任务执行和推理能力

### 多智能体比较经典的代表实现

- [**Mobile-Agent-v2: Mobile Device Operation Assistant with Effective Navigation via Multi-Agent Collaboration**](https://arxiv.org/abs/2406.01014)
- [**AppAgentX: Evolving GUI Agents as Proficient Smartphone Users**](https://arxiv.org/abs/2503.02268)

## 训练方法

- 直接基于提示词（manus 推荐此种方法）
- 微调训练

### 微调训练

- **指令微调**：使用更大规模的模型标注更高质量的标注数据，通过指令微调复制教师模型的行为
  - 缺点：缺乏大量的数据
  - 代表论文：
    - [**AutoGUI: Scaling GUI Grounding with Automatic Functionality Annotations from LLMs**](https://arxiv.org/abs/2502.01977)
    - [**AutoAct: Automatic Agent Learning from Scratch for QA via Self-Planning**](https://arxiv.org/abs/2401.05268)
- **强化学习**：模型自主探索，从探索的一系列动作轨迹中学习（奖励最后完成任务的那个任务轨迹序列），依赖奖励函数的设计，主要用于增强复杂任务场景中的长期规划和决策能力
  - 常见的强化算法做法：
    - GRPO + Rule-based Reward
  - 可以使用 GRPO 强化训练的场景一般是有确定标准的场景，比如：
    - 在当前步骤下，接下来的动作（需要点哪里，坐标是多少）一般都是确定的，这个动作就可以作为奖励函数判断的标准
  - 缺点及问题 ：
    - 页面布局：
      - 同样的搜索，每次搜索结果不同都会导致页面布局不一致
      - 软件更新、组件更新、系统版本不一样都会导致界面元素不一致
      - 特定用户或特定时间（节假日、活动）页面颜色与布局都会不一样
    - 训练成本高
  - 代表论文：
    - [**DigiRL: Training In-The-Wild Device-Control Agents with Autonomous Reinforcement Learning**](https://arxiv.org/abs/2406.11896)
      - GUI智能体先学习简单的任务，然后学习困难的任务
    - [**DistRL: An Asynchronous Distributed Reinforcement Learning Framework for On-Device Control Agents**](https://arxiv.org/abs/2410.14803)
      - 采用异步分布式框架解耦数据采集和训练过程，提升训练效率
      - 提出分布式优先重播技术，判断出哪些轨迹更有价值，优先重复学习
    - [**Agent Q: Advanced Reasoning and Learning for Autonomous AI Agents**](https://arxiv.org/abs/2408.07199)
    - [**UI-R1: Enhancing Efficient Action Prediction of GUI Agents by Reinforcement Learning**](https://arxiv.org/abs/2503.21620)
    - [**GUI-R1 : A Generalist R1-Style Vision-Language Action Model For GUI Agents**](https://arxiv.org/abs/2504.10458)
      - 使用 GRPO 算法进行 RL
    - [**InfiGUI-R1: Advancing Multimodal GUI Agents from Reactive Actors to Deliberative Reasoners**](https://arxiv.org/abs/2504.14239)

## 实现架构的组件

![](/uploads/posts/self-evolving-agents/05-image.png)

### 感知（**Perception**）

> 感知并理解当前环境信息

感知环境的不同方法:

![](/uploads/posts/self-evolving-agents/06-image.png)

**基于文本感知：**

- 基于接口获取页面信息：无障碍页面，会有特定的接口可以获取无障碍页面的元素信息，但获取的信息不完整
- 基于页面结构获取页面信息：基于 **HTML/DOM** 的页面，具有层次化的结构

缺点：

- 包含很多其他冗余的信息和干扰噪声
  - 简化 HTML 页面信息：[**AutoWebGLM: A Large Language Model-based Web Navigating Agent**](https://arxiv.org/abs/2404.03648)
- 信息不完整或者没有提供接口不能获取

**基于多模态感知：**

- 基于视觉获取页面信息：基于手机截屏解析为 UI 元素的结构化表示，方便模型理解
  - OCR
  - 页面总结
  - UI 元素识别，可转换为 XML 或代码
- 基于工具增强
  

- OCR 信息
- Grounding DINO
- YOLO 检测器

**代表性工作&论文**

- [**OmniParser for Pure Vision Based GUI Agent**](https://arxiv.org/abs/2408.00203)
- [**OmniParser V2: Structured-Points-of-Thought for Unified Visual Text Parsing and Its Generality to Multimodal Large Language Models**](https://arxiv.org/abs/2502.16161)
- [**Screen2AX: Vision-Based Approach for Automatic macOS Accessibility Generation**](https://arxiv.org/abs/2507.16704)
- [**Grounding DINO: Marrying DINO with Grounded Pre-Training for Open-Set Object Detection**](https://arxiv.org/abs/2303.05499)
  - Grounding DINO 可以根据文字描述检测指定目标，比如让它检测左边的狮子，它就会只把左边的狮子框选出来，可以与 VLM 结合（当 VLM 操作位置不准确时可以让 Grounding DINO 框选目标）

### 探索（Exploration ）

外部数据（MCP，Tools），知识库

**记忆**

- 短期记忆
- 长期记忆
  - 历史类似操作（任务轨迹，技能库）

常见用法：基于自然语言描述，基于每一步骤进行总结，存储当前环境描述、推理说明和动作等信息，在后续流程中通过向量检索得到 Top-k 个结果追加到 prompt 中

**代表性工作&论文**

- [**Agent Workflow Memory**](https://arxiv.org/abs/2409.07429)

### 推理（**Reasoning**）& 规划（**Planning**）

> 根据用户任务、当前状态和历史操作，推理并制定未来规划，并给出后面的动作

- 基于结构化文本将任务拆解为子任务并制定执行计划
  - 基于提示词 + 预训练内部的知识进行推理和思考
  - 基于提示词 + Tools + 外部数据（MCP)
  - 基于提示词 + 浏览页面信息后再搜索
  - 世界模型：纠正长期规划的错误
- 执行（**Acting**）：与环境进行交互

**代表性工作&论文**

- [**ClickAgent: Enhancing UI Location Capabilities of Autonomous Agents**](https://arxiv.org/abs/2410.11872)
  - 决策模块使用 InternVL2.0-76B 进行推理、动作规划和反思（用于判断任务是否完成），UI Location Model （0.27B 模型）对 “CLICK” 动作使用 TinyClick 产生精确点击坐标
- [**Lightweight Neural App Control**](https://arxiv.org/abs/2410.17883)
  - 由 AcT（预测动作类型和参数）和 VLM（生成 text 字符串）组成 pipeline 执行 UI 任务

### **交互（Interaction）**

基于任务、对用户界面的理解，通过 GUI 元素定位生成动作以及动作目标，从而进行精准操作

- 可用的工具：
  - OCR
  - IconNet 进行图标检测
  - CLIP 进行视觉元素识别
- 元素识别方法
  - 使用数字元素标记，将模式输出的操作指向特定编号的元素
  - 基于坐标

---

# GUI Agent 实现上难点

## 数据相关

- OOD（out-of-distribution，超过分布） 问题，超出训练范畴的场景，泛化能力不足：
  - 页面问题：
    - 不同系统图形页面布局不一致，页面 Banner 图等会让页面动态变化
    - 不可预测的各种干扰项：提示+广告弹窗、登录请求
    - 复杂界面元素过于丰富多样，导致模型识别困难
    - 对于页面可交互的细微元素会出现定位困难，模型操作起来总是发生偏移
    - 由于网络原因等导致的页面内容缺失（正在加载）
  - 静态数据训练的 GUI Agent 无法很好地适应在线的新应用、工具或界面
  - 在特定操作系统训练的 GUI Agent不具备其它操作系统的任务执行能力
- 过度执行问题：简单问题复杂化（页面总结、描述问题会做出动作规划）
- 单 Agent 训练会出现收益延迟：规划的任务或拆解的子任务无法与长期收益绑定（无法立即知晓当前操作的有效性，直到任务完成才能确定最终收益）
- 多 Agent 训练会出现奖励无法合理分配的

![](/uploads/posts/self-evolving-agents/07-image.png)

## 常用优化方案

- **记忆 + 知识库注入提升**：不断改进记忆和知识增强技术，让智能体能够更好地利用历史经验和知识进行决策。
- **优化页面感知能力**：包括提升元素定位、识别以及细粒度 OCR 能力。如通过改进图像分区方法（sub - images /patches）、添加额外模块处理高分辨率图像或采用动态分辨率技术
- 通过 MCP + Tools Call 或者改进检索方法（如 MCTS、树搜索等方法）去获取更优质的数据
- 优化训练方法
  - 强化学习训练，提升推理及规划能力
- 工程上优化：
  - [**AI代理的上下文工程：构建Manus的经验教训**](https://manus.im/zh-cn/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus)
    - 推理加速：
      - 提示词要充分围绕 KV 缓存进行设计，使用相同前缀的上下文可以命中 KV Cache，可以减少 TTFT ，加快推理
        - 比如每次执行过程中，上一步的动作和结果会拼接到下一次的提示词中
  - 需要有规划回退能力，避免在错误路径中进一步执行
  - 需要有主动发问的能力，在当前场景缺少信息或者多个选择时，需要主动与用户交互
    - [**OS-Kairos: Adaptive Interaction for MLLM-Powered GUI Agents**](https://arxiv.org/abs/2503.16465)

# 智能体自主进化

![](/uploads/posts/self-evolving-agents/08-image.png)

## 实现自我进化的难点

如何在不依靠外部监督的情况下，模型可以持续学习，进化，如何保证在多任务环境的泛化性，怎么确保进化过程中的安全性和可控性，并且在进化过程中如何保证人类对齐的问题。

## 什么可以进化

- 模型进化: 自主提出任务，自我奖励，自我改进
  - 自我挑战 Agent （SCA） [Self-challenging language model agents](https://arxiv.org/abs/2506.01716): 在代码任务中，模型不仅是同时是问题的解决者，也是挑战者，从成功的方案轨迹中来微调参数
  - AgentGen : 基于课程学习，动态调整执行任务的难度，不断保证模型持续学习
    - [Agentgen: Enhancing planning abilities for large language model based agent via environment and task generation.](https://arxiv.org/abs/2408.00764)
  - 还有很多比如 SELF、SCoRe、PAG 会将执行轨迹和反思后的结果作为 SFT 和 RL 的数据以及奖励信号
    - SELF: Self-evolution with language feedback
    - Training language models to self-correct via reinforcement learning.
    - PAG: Multi-turn reinforced llm self-correction with policy as generative verifier.

- 工具进化: 自主发现或创建工具
  - RAG 搜索开源代码或者从零实现一个代码，会将此次任务的执行结果和函数保存下来，通过迭代，不断优化（代码的异常情况、补充函数文档说明，合并技能库等），作为模型的技能库
    - Toolgen: Unified tool retrieval and calling via generation.
      - 将工具编码为语言模型词汇表中的独特标记，优化巨大技能库的搜索性能
- 架构进化: 模型动态优化单 Agent 和多 Agent 架构协作模式，优化工作流
  - Autoflow: Automated workflow generation for large language model agents.
    - *从自然语言自动创建线性工作流*

## 在什么时候可以进化

- 测试时，在任务执行过程动态调整优化
- 测试外，通过离线学习优化性能

## 怎么进行进化

- 基于奖励进化
- 模仿与示范
- 借鉴生物进化机制，通过选择和突变等操作探索

## 进化的环境

环境分为 2 种：

- 封闭环境：静态的截图数据集和人工标注
- 开放环境：需要模型进行网页浏览、调用外部接口 API 获取数据

### 安卓设备

- 真实的安卓设备：
  - 通过安卓调试桥(Android Debug Bridge, ADB)来用命令行控制连接在电脑上的真机
    - [**Android 调试桥 (adb)**](https://developer.android.com/tools/adb?hl=zh-cn)
- 虚拟的安卓设备：
  - 通过安卓虚拟机(Android Virtual Device, AVD)实现在机器上并行运行虚拟的安卓设备

### 电脑设备

通过把智能体输出转化为符合 pyautogui 库的语言控制鼠标和键盘，模拟用户的各类 GUI 操作

| 动作目的 | ADB命令 | Pyautogui库格式 |
| --- | --- | --- |
| 模拟点击 | `adb shell input tap <x> <y>` | pyautogui.click(x, y) |
| 屏幕截图 | adb shell screencap + adb pull | pyautogui.screenshot("screen.png") |
| 输入文本 | adb shell input text "hello” | pyautogui.typewrite("hello") |
| 模拟按键 | adb shell input keyevent 3 | pyautogui.press('home') |

## 相关论文

- [**A Survey of Self-Evolving Agents: On Path to Artificial Super Intelligence**](https://arxiv.org/abs/2507.21046)

### GUI Autonomous Agent

- [**WebEvolver: Enhancing Web Agent Self-Improvement with Coevolving World Model**](https://arxiv.org/abs/2504.21024)**(腾讯)**
  - 基于 **Llama-3.3-70B** 进行微调出的**世界模型（World Model）**，这个模型基于当前观察和动作预测下一状态，模拟网页环境动态
    - 微调的数据是通过 Playwright （浏览器测试框架）控制的浏览器环境执行点击、输入等操作，记录动作和对应的网页可访问性树，生成微调数据
    - 然后微调好的世界模型与策略模型交互生成高质量的轨迹合成数据，然后用 GPT4o 作为打分器，筛选出最优的路径作为下一轮策略模型优化的数据
- [**UI-TARS: Pioneering Automated GUI Interaction with Native Agents**](https://arxiv.org/abs/2501.12326)**（字节）**
  - 基于 SFT 让模型生成思考-动作对
  - 基于 DPO 提高模型的推理能力
    - 假设在某个步骤出现错误，这个步骤的动作就会被看作无效或非最优，需要对这个错误步骤进行标注并给出纠正后的思考和动作
    - 收集很多对 错误的 思考-动作 vs 标注正确的 思考-动作 就可以做 DPO
- [**AppAgentX: Evolving GUI Agents as Proficient Smartphone Users**](https://arxiv.org/abs/2503.02268)**(腾讯)**
  - [github](https://github.com/TencentQQGYLab/AppAgent)
  - 通过使用 *OmniParser* 检测截图中的 UI 元素，拿带注释的图像进行推理规划
- [**Mobile-Agent-E: Self-Evolving Mobile Assistant for Complex Tasks**](https://arxiv.org/abs/2501.11733)**（阿里）**
  - [github](https://github.com/X-PLUG/MobileAgent)
- MobileUse: A GUI Agent with Hierarchical Reflection for Autonomous Mobile Operation (OPPO) 的，7 月份，Qwen2.5-VL-72B-Instruct 模型

### Search Autonomous Agent

- [**L0: Reinforcement Learning to Become General Agents**](https://arxiv.org/abs/2506.23667)

---

# 相关智能体实现框架

- [CAMEL](https://github.com/camel-ai/camel)：*多智能体框架*
- [**OWL**](https://github.com/camel-ai/owl)：*多智能体协作框架，构建于 CAMEL-AI 框架之上*

# 相关的 GitHub 仓库

- [**GUI-Agents-Paper-List**](https://github.com/OSU-NLP-Group/GUI-Agents-Paper-List)
- [**Awesome-GUI-Agent**](https://github.com/showlab/Awesome-GUI-Agent)
- [**awesome-ui-agents**](https://github.com/opendilab/awesome-ui-agents)

# 参考资料
