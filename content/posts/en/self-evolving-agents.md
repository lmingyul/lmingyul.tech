---
title: The World of Autonomous Agent Evolution
slug: self-evolving-agents
publishedAt: '2025-07-30T07:46:00.000Z'
categories:
  - AI
  - Agent
description: >-
  GUI Agents are language agents (fundamentally powered by Language Models) that
  operate on graphical interfaces with autonomous capabilities. They can solve
  sequential decision-making problems by mimicking human behavior to interact
  across different graphical interfaces (such as mobile phones and web pages),
  performing actions like clicking, typing, and navigating via visual elements.
cover: /uploads/posts/self-evolving-agents/01-image.png
readingTime: 14
mood: neutral
draft: false
id: 240b44d3-5440-80b7-81b7-db68ac7b0e1b
---
# GUI Agent

Currently, a GUI Agent is a language agent based on a graphical interface with autonomous capabilities (all fundamentally Language Models at their core). It can solve sequential decision-making problems, simulate human behavior interacting on different graphical interfaces (such as phones, web pages, etc.), and perform operations such as clicking, typing, and navigating through visual elements.

## Differences from API Agents

Reference: [**API Agents vs. GUI Agents: Divergence and Convergence**](https://arxiv.org/abs/2503.11069)

![](/uploads/posts/self-evolving-agents/01-image.png)

- Different models are used
  - API Agents generally use language models
  - GUI Agents generally use vision models
- Operations (actions) they can perform
  - API Agent: outputs tool and function calls
    - Tools Call (MCP)
    - Function Call
  - GUI Agent: outputs actions and the parameters corresponding to those actions (such as click coordinates, input text, swipe distance, etc.)
    - Click + click coordinates
    - Swipe + start point coordinates + end point coordinates
    - Input + input text
    - Long press + long-press coordinates
    - Double click + double-click coordinates
    - Back
- Different execution flows
  - API Agent: understand input text → output execution action → judge execution result through text
  - GUI Agent: first obtain interface information and elements → understand the page and executable actions → comprehensively understand page information combined with input text → output execution action → judge execution result through the page

Operable UI elements can be identified through HTML and the DOM tree, but the computation cost is huge at every step. This approach can be used for particularly difficult page identification or element localization.

References:

- [**A Real-World WebAgent with Planning, Long Context Understanding, and Program Synthesis**](https://arxiv.org/abs/2307.12856)
- [**Mind2Web: Towards a Generalist Agent for the Web**](https://papers.nips.cc/paper_files/paper/2023/hash/5950bf290a1570ea401bf98882128160-Abstract-Datasets_and_Benchmarks.html)

## Architecture Design

![](/uploads/posts/self-evolving-agents/02-image.jpg)

- Planning Agent: generates **task progress** based on historical operations, and stores the core content of each single step as memory
- Decision Agent: refers to the memory unit and task progress to generate **operations**
- Reflection Agent: observes screen changes before and after an operation, and takes measures to **re-execute** when necessary

![](/uploads/posts/self-evolving-agents/03-image.jpg)

![](/uploads/posts/self-evolving-agents/04-image.png)

Classified by the number of agents:

- Single-agent
  - VLM
- Multi-agent: high latency
  - Page element information (DOM structure, page summary) + LLM
  - VLM (perception) + LLM (reasoning and planning) + VLM (action) + LLM (reflection)
  - Pure VLM: completes perception, planning, and decision-making tasks simultaneously
    - Capabilities the model needs:
      - Element grounding ability (e.g., describe an element and have the model output its coordinates)
      - Referring ability (e.g., give element coordinates and have the model describe and identify what it is)
      - Fine-grained OCR ability: supports high-resolution images
      - UI interface understanding ability: can answer UI-related questions (e.g., what is above the green button)
      - UI task execution and reasoning ability

### Classic Representative Multi-Agent Implementations

- [**Mobile-Agent-v2: Mobile Device Operation Assistant with Effective Navigation via Multi-Agent Collaboration**](https://arxiv.org/abs/2406.01014)
- [**AppAgentX: Evolving GUI Agents as Proficient Smartphone Users**](https://arxiv.org/abs/2503.02268)

## Training Methods

- Directly prompt-based (Manus recommends this approach)
- Fine-tuning training

### Fine-tuning Training

- **Instruction tuning**: use larger-scale models to annotate higher-quality annotated data, and replicate the teacher model's behavior through instruction fine-tuning
  - Drawback: lacks a large amount of data
  - Representative papers:
    - [**AutoGUI: Scaling GUI Grounding with Automatic Functionality Annotations from LLMs**](https://arxiv.org/abs/2502.01977)
    - [**AutoAct: Automatic Agent Learning from Scratch for QA via Self-Planning**](https://arxiv.org/abs/2401.05268)
- **Reinforcement learning**: the model explores autonomously and learns from a series of action trajectories (rewarding the task trajectory sequence that finally completes the task). This depends on the design of the reward function and is mainly used to enhance long-term planning and decision-making capabilities in complex task scenarios.
  - Common reinforcement learning approaches:
    - GRPO + Rule-based Reward
  - Scenarios that can use GRPO reinforcement training generally have deterministic standards, for example:
    - In the current step, the next action (where to click, what the coordinates are) is generally deterministic, so this action can be used as the criterion for the reward function
  - Drawbacks and problems:
    - Page layout:
      - For the same search, different search results each time can cause inconsistent page layouts
      - Software updates, component updates, and different system versions can all cause inconsistent interface elements
      - Pages for specific users or specific times (holidays, events) can have different colors and layouts
    - High training cost
  - Representative papers:
    - [**DigiRL: Training In-The-Wild Device-Control Agents with Autonomous Reinforcement Learning**](https://arxiv.org/abs/2406.11896)
      - The GUI agent first learns simple tasks, then learns difficult tasks
    - [**DistRL: An Asynchronous Distributed Reinforcement Learning Framework for On-Device Control Agents**](https://arxiv.org/abs/2410.14803)
      - Uses an asynchronous distributed framework to decouple data collection and training, improving training efficiency
      - Proposes distributed prioritized replay technology to determine which trajectories are more valuable and prioritize repeated learning on them
    - [**Agent Q: Advanced Reasoning and Learning for Autonomous AI Agents**](https://arxiv.org/abs/2408.07199)
    - [**UI-R1: Enhancing Efficient Action Prediction of GUI Agents by Reinforcement Learning**](https://arxiv.org/abs/2503.21620)
    - [**GUI-R1 : A Generalist R1-Style Vision-Language Action Model For GUI Agents**](https://arxiv.org/abs/2504.10458)
      - Uses the GRPO algorithm for RL
    - [**InfiGUI-R1: Advancing Multimodal GUI Agents from Reactive Actors to Deliberative Reasoners**](https://arxiv.org/abs/2504.14239)

## Components of the Implementation Architecture

![](/uploads/posts/self-evolving-agents/05-image.png)

### Perception

> Perceive and understand the current environment information

Different methods for perceiving the environment:

![](/uploads/posts/self-evolving-agents/06-image.png)

**Text-based perception:**

- Obtain page information through interfaces: accessibility pages have specific interfaces that can obtain element information from the accessibility page, but the obtained information is incomplete
- Obtain page information based on page structure: pages based on **HTML/DOM** have a hierarchical structure

Drawbacks:

- Contains a lot of other redundant information and distracting noise
  - Simplify HTML page information: [**AutoWebGLM: A Large Language Model-based Web Navigating Agent**](https://arxiv.org/abs/2404.03648)
- Information is incomplete or no interface is provided and it cannot be obtained

**Multimodal perception:**

- Obtain page information based on vision: parse phone screenshots into a structured representation of UI elements to facilitate model understanding
  - OCR
  - Page summarization
  - UI element recognition, which can be converted into XML or code
- Tool-augmented
  

- OCR information
- Grounding DINO
- YOLO detector

**Representative work & papers**

- [**OmniParser for Pure Vision Based GUI Agent**](https://arxiv.org/abs/2408.00203)
- [**OmniParser V2: Structured-Points-of-Thought for Unified Visual Text Parsing and Its Generality to Multimodal Large Language Models**](https://arxiv.org/abs/2502.16161)
- [**Screen2AX: Vision-Based Approach for Automatic macOS Accessibility Generation**](https://arxiv.org/abs/2507.16704)
- [**Grounding DINO: Marrying DINO with Grounded Pre-Training for Open-Set Object Detection**](https://arxiv.org/abs/2303.05499)
  - Grounding DINO can detect specified targets based on text descriptions. For example, if you ask it to detect the lion on the left, it will only box the lion on the left. It can be combined with a VLM (when the VLM's operation position is inaccurate, Grounding DINO can box the target)

### Exploration

External data (MCP, Tools), knowledge base

**Memory**

- Short-term memory
- Long-term memory
  - Historical similar operations (task trajectories, skill library)

Common usage: based on natural language descriptions, summarize each step, store information such as the current environment description, reasoning notes, and actions, and then in subsequent processes retrieve the Top-k results through vector search and append them to the prompt

**Representative work & papers**

- [**Agent Workflow Memory**](https://arxiv.org/abs/2409.07429)

### Reasoning & Planning

> Based on the user task, current state, and historical operations, reason and formulate future plans, and give the subsequent actions

- Break the task into subtasks based on structured text and formulate an execution plan
  - Based on prompts + knowledge internal to pretraining for reasoning and thinking
  - Based on prompts + Tools + external data (MCP)
  - Based on prompts + searching after browsing page information
  - World model: correct errors in long-term planning
- Acting: interact with the environment

**Representative work & papers**

- [**ClickAgent: Enhancing UI Location Capabilities of Autonomous Agents**](https://arxiv.org/abs/2410.11872)
  - The decision module uses InternVL2.0-76B for reasoning, action planning, and reflection (used to determine whether the task is completed). The UI Location Model (0.27B model) uses TinyClick to produce precise click coordinates for the "CLICK" action
- [**Lightweight Neural App Control**](https://arxiv.org/abs/2410.17883)
  - Consists of a pipeline of AcT (predicts action type and parameters) and VLM (generates text strings) to execute UI tasks

### Interaction

Based on the task and understanding of the user interface, generate actions and action targets through GUI element localization, thereby performing precise operations

- Available tools:
  - OCR
  - IconNet for icon detection
  - CLIP for visual element recognition
- Element recognition methods
  - Use numbered element markers, and point the operation output by the model to a specific numbered element
  - Coordinate-based

---

# Difficulties in Implementing GUI Agents

## Data-related

- OOD (out-of-distribution) problem: scenarios beyond the training scope, with insufficient generalization ability:
  - Page issues:
    - GUI page layouts are inconsistent across different systems; page banner images and the like cause the page to change dynamically
    - Various unpredictable distractions: prompt + ad pop-ups, login requests
    - Complex interface elements are too rich and diverse, making them hard for the model to recognize
    - Difficulty in locating subtle interactive elements on the page; the model's operations always end up offset
    - Missing page content (still loading) due to network issues, etc.
  - A GUI Agent trained on static data cannot adapt well to new online applications, tools, or interfaces
  - A GUI Agent trained on a specific operating system lacks the ability to execute tasks on other operating systems
- Over-execution problem: simple problems are made complicated (for page summarization or description questions, it still makes action plans)
- Single-agent training suffers from delayed reward: planned tasks or decomposed subtasks cannot be tied to long-term reward (you can't immediately know whether the current action is effective; the final reward is only certain once the task is complete)
- Multi-agent training has the problem that rewards cannot be reasonably allocated

![](/uploads/posts/self-evolving-agents/07-image.png)

## Common Optimization Approaches

- **Memory + knowledge base injection for improvement**: continuously refine memory and knowledge-augmentation techniques so the agent can better leverage historical experience and knowledge for decision-making.
- **Optimize page perception capability**: including improving element localization, recognition, and fine-grained OCR. For example, by improving image partitioning methods (sub-images/patches), adding extra modules to handle high-resolution images, or adopting dynamic-resolution techniques
- Obtain higher-quality data via MCP + Tools Call or improved retrieval methods (such as MCTS, tree search, etc.)
- Optimize training methods
  - Reinforcement learning training to improve reasoning and planning capabilities
- Engineering optimizations:
  - [**Context Engineering for AI Agents: Lessons from Building Manus**](https://manus.im/zh-cn/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus)
    - Inference acceleration:
      - Design prompts fully around the KV cache; using contexts with the same prefix can hit the KV Cache, reducing TTFT and speeding up inference
        - For example, during each execution, the previous step's action and result are appended to the next prompt
  - Need the ability to roll back plans, avoiding further execution along a wrong path
  - Need the ability to proactively ask questions: when the current scenario lacks information or offers multiple choices, it should proactively interact with the user
    - [**OS-Kairos: Adaptive Interaction for MLLM-Powered GUI Agents**](https://arxiv.org/abs/2503.16465)

# Autonomous Evolution of Agents

![](/uploads/posts/self-evolving-agents/08-image.png)

## Difficulties in Achieving Self-evolution

How can a model continuously learn and evolve without relying on external supervision? How can generalization be ensured across multi-task environments? How can safety and controllability be ensured during evolution, and how can human alignment be guaranteed throughout the evolution process?

## What Can Evolve

- Model evolution: autonomously propose tasks, self-reward, self-improve
  - Self-Challenging Agent (SCA) [Self-challenging language model agents](https://arxiv.org/abs/2506.01716): in code tasks, the model is both the problem solver and the challenger, fine-tuning its parameters from successful solution trajectories
  - AgentGen: based on curriculum learning, dynamically adjusts task execution difficulty to ensure the model keeps learning continuously
    - [Agentgen: Enhancing planning abilities for large language model based agent via environment and task generation.](https://arxiv.org/abs/2408.00764)
  - Many others, such as SELF, SCoRe, and PAG, use execution trajectories and post-reflection results as data and reward signals for SFT and RL
    - SELF: Self-evolution with language feedback
    - Training language models to self-correct via reinforcement learning.
    - PAG: Multi-turn reinforced llm self-correction with policy as generative verifier.

- Tool evolution: autonomously discover or create tools
  - Through RAG, searching open-source code or implementing code from scratch; the execution results and functions of the current task are saved, and through iteration they are continuously optimized (handling code exceptions, supplementing function documentation, merging skill libraries, etc.), forming the model's skill library
    - Toolgen: Unified tool retrieval and calling via generation.
      - Encodes tools as unique tokens in the language model's vocabulary, optimizing search performance over huge skill libraries
- Architecture evolution: the model dynamically optimizes single-agent and multi-agent collaboration patterns, and optimizes workflows
  - Autoflow: Automated workflow generation for large language model agents.
    - *Automatically creating linear workflows from natural language*

## When Can Evolution Happen

- At test time, dynamically adjusting and optimizing during task execution
- Outside testing, optimizing performance through offline learning

## How to Evolve

- Reward-based evolution
- Imitation and demonstration
- Drawing on biological evolution mechanisms, exploring through operations such as selection and mutation

## The Environment for Evolution

There are 2 types of environments:

- Closed environment: static screenshot datasets and manual annotations
- Open environment: the model needs to browse the web and call external APIs to obtain data

### Android Devices

- Real Android devices:
  - Control a physical device connected to a computer via command line using the Android Debug Bridge (ADB)
    - [**Android Debug Bridge (adb)**](https://developer.android.com/tools/adb?hl=zh-cn)
- Virtual Android devices:
  - Use Android Virtual Devices (AVD) to run virtual Android devices in parallel on a machine

### Computer Devices

Convert the agent's output into pyautogui-compatible commands to control the mouse and keyboard, simulating the user's various GUI operations

| Action purpose | ADB command | Pyautogui library format |
| --- | --- | --- |
| Simulate click | `adb shell input tap <x> <y>` | pyautogui.click(x, y) |
| Screenshot | adb shell screencap + adb pull | pyautogui.screenshot("screen.png") |
| Input text | adb shell input text "hello” | pyautogui.typewrite("hello") |
| Simulate key press | adb shell input keyevent 3 | pyautogui.press('home') |

## Related Papers

- [**A Survey of Self-Evolving Agents: On Path to Artificial Super Intelligence**](https://arxiv.org/abs/2507.21046)

### GUI Autonomous Agent

- [**WebEvolver: Enhancing Web Agent Self-Improvement with Coevolving World Model**](https://arxiv.org/abs/2504.21024)**(Tencent)**
  - A **World Model** fine-tuned from **Llama-3.3-70B**; this model predicts the next state based on the current observation and action, simulating the dynamics of the web environment
    - The fine-tuning data is generated by using Playwright (a browser testing framework) to control a browser environment, performing operations such as clicking and typing, recording actions and the corresponding web accessibility trees
    - Then the fine-tuned world model interacts with the policy model to generate high-quality synthetic trajectory data; GPT4o is then used as a scorer to select the optimal paths as data for the next round of policy model optimization
- [**UI-TARS: Pioneering Automated GUI Interaction with Native Agents**](https://arxiv.org/abs/2501.12326)**(ByteDance)**
  - Use SFT to make the model generate thought-action pairs
  - Use DPO to improve the model's reasoning ability
    - Suppose an error occurs at a certain step; that step's action is then regarded as invalid or non-optimal, and the erroneous step needs to be annotated along with the corrected thought and action
    - By collecting many pairs of "wrong thought-action vs. correctly annotated thought-action," DPO can be performed
- [**AppAgentX: Evolving GUI Agents as Proficient Smartphone Users**](https://arxiv.org/abs/2503.02268)**(Tencent)**
  - [github](https://github.com/TencentQQGYLab/AppAgent)
  - Use *OmniParser* to detect UI elements in screenshots, then perform reasoning and planning with the annotated images
- [**Mobile-Agent-E: Self-Evolving Mobile Assistant for Complex Tasks**](https://arxiv.org/abs/2501.11733)**(Alibaba)**
  - [github](https://github.com/X-PLUG/MobileAgent)
- MobileUse: A GUI Agent with Hierarchical Reflection for Autonomous Mobile Operation (OPPO), in July, with the Qwen2.5-VL-72B-Instruct model

### Search Autonomous Agent

- [**L0: Reinforcement Learning to Become General Agents**](https://arxiv.org/abs/2506.23667)

---

# Related Agent Implementation Frameworks

- [CAMEL](https://github.com/camel-ai/camel): *Multi-agent framework*
- [**OWL**](https://github.com/camel-ai/owl): *Multi-agent collaboration framework built on top of the CAMEL-AI framework*

# Related GitHub Repositories

- [**GUI-Agents-Paper-List**](https://github.com/OSU-NLP-Group/GUI-Agents-Paper-List)
- [**Awesome-GUI-Agent**](https://github.com/showlab/Awesome-GUI-Agent)
- [**awesome-ui-agents**](https://github.com/opendilab/awesome-ui-agents)

# References
