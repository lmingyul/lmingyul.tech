---
title: Let AI Run Through the Entire R&D Process
slug: ai-across-rd-workflow
publishedAt: '2025-11-18T15:21:00.000Z'
categories:
  - AI
  - Tools
description: >-
  AI plays a key role across R&D. DeepResearch helps quickly gather and learn
  information in relevant fields, NotebookLM helps break down and study
  materials, ChatGPT Atlas simplifies paper reading, models offer strong
  translation, OCR can extract code, and DeepWiKi and Code Wiki support code
  learning. AI also automates information collection and task management,
  improves documentation writing, and boosts efficiency. Overall, AI makes R&D
  work more efficient and convenient.
cover: /uploads/posts/ai-across-rd-workflow/01-2025-11-19-_00_26_30.jpg
readingTime: 21
mood: neutral
draft: false
id: 2afb44d3-5440-8083-b3a5-eaa9b2b4b91b
---
> Making AI a 24/7 companion in our daily life and work. The capabilities of current SOTA models generally exceed those of most people—whether in creative work, writing, or even coding, they often perform better than many people. The ceiling of many models' capabilities depends on the ceiling of the person using them. In this era of AI, learning to ask questions and collaborate better with AI is a skill that requires continuous learning.
>
> **The same tool has different effects in different people's hands.**

![](/uploads/posts/ai-across-rd-workflow/01-2025-11-19-_00_26_30.jpg)

# Making it easier to get started on researching a direction

## It all starts with DeepResearch

When you have a direction, question, or research field that you need to explore from scratch, you can use DeepResearch to get started.

![](/uploads/posts/ai-across-rd-workflow/02-imagespixpin_2025-11-17_00-44-07.png)

DeepResearch can collect every aspect of the question you want to understand through broad search, accelerating how quickly we get started, learn a discipline, or research a direction. It can mark all the relevant content found in the search with links, making it easier for you to learn more deeply.

```txt
Please help me research and collect the latest progress on GUI Agents over the past year:

Goal: comprehensively review the important papers, blogs, and models that have emerged, and identify the latest SOTA models for GUI Agents based on large-scale language/multimodal models (with a focus on mobile Agents, Mobile Agents).

Specific requirements
1. Collect literature and materials
   • For each item, provide: title, publication time, arXiv/DOI link, corresponding GitHub repository (if any), or source.

2. Implementation and training methods of SOTA models
   • Compare the different implementation approaches of current SOTA GUI Agents.
   • Summarize the model training plans (including how data is processed, how real or virtual environments are constructed, the training process, and algorithm analysis, etc.)
   • List their latest public metrics on recognized benchmarks such as AndroidWorld, ScreenSpotPro, ScreenSpot-v2, UI-I2E-Bench, etc.

3. Innovations
   • Summarize the core innovations of the work, and organize innovations in architecture, training paradigms, prompt engineering, data synthesis strategies, etc.

4. Difficulties and challenges
   • Summarize the key technical bottlenecks faced by current research.

5. Best practices
   • Provide the best implementation/training plans for the work (including data pipelines, model selection, reinforcement learning, or feedback mechanisms).

Output format
• It is recommended to use hierarchical headings and tables to summarize key information for easy retrieval and comparison.
```

Example: Collecting materials related to GRPO

![](/uploads/posts/ai-across-rd-workflow/03-imagespixpin_2025-11-17_11-20-30.png)

Things to pay attention to when using DeepResearch:

- Source quality: whether it is an authoritative official release, paper citation count, influence of the GitHub repository, etc.

![GPT](/uploads/posts/ai-across-rd-workflow/08-imagespixpin_2025-11-17_11-20-45.png)

![Gemini](/uploads/posts/ai-across-rd-workflow/09-imagespixpin_2025-11-17_11-33-45.png)

![Example DeepResearch result](/uploads/posts/ai-across-rd-workflow/10-imageschatgpt--grpo.png)

## Let the model help you break down what to learn

When the model helps you find a pile of learning materials and you feel you don't know where to start, you can use another capability of the model: getting you started.

Use NotebookLM to break down the problem for learning; it can generate mind maps, audio, videos, flashcards, and quizzes. You can upload files in various formats, websites, YouTube video links, and even use prompts to have it search in real time.

![](/uploads/posts/ai-across-rd-workflow/04-imagespixpin_2025-11-18_11-40-37.png)

![](/uploads/posts/ai-across-rd-workflow/05-imagespixpin_2025-11-17_16-24-27.png)

![Generate the corresponding mind map](/uploads/posts/ai-across-rd-workflow/11-imagespixpin_2025-11-17_16-26-43.png)

![Generate the corresponding video](/uploads/posts/ai-across-rd-workflow/12-imagespixpin_2025-11-17_18-47-31.png)

![Generate the corresponding questions and answers for reinforcement learning](/uploads/posts/ai-across-rd-workflow/13-imagespixpin_2025-11-17_18-51-20.png)

![Finally, use a quiz to test the learning results](/uploads/posts/ai-across-rd-workflow/14-imagespixpin_2025-11-17_18-52-20.png)

For example, you can try importing past Gaokao exam questions; it can not only generate a summary but also let you ask questions and learn from the uploaded materials.

![](/uploads/posts/ai-across-rd-workflow/06-imagespixpin_2025-11-18_11-36-41.png)

![](/uploads/posts/ai-across-rd-workflow/07-imagespixpin_2025-11-18_11-38-53.png)

Another example: import all the doc documents in the mindspeed-llm repository and ask it to generate training content.

```txt
Based on the provided content excerpts, write a detailed training manual that systematically explains the core principles involved in the provided content. The manual should adopt a professional and instructional tone, breaking down complex concepts into actionable steps and lessons. Ensure the content is entirely based on the source material and covers all aspects involved in the provided content.

The training manual should include the following:

Training objectives and expected outcomes
Training content and structure
Training methods and tools
Training evaluation and feedback
Training summary and follow-up actions
Training cases and examples
Training resources and references
```

![](/uploads/posts/ai-across-rd-workflow/15-imagespixpin_2025-11-18_14-07-31.png)

![](/uploads/posts/ai-across-rd-workflow/16-imagespixpin_2025-11-18_14-19-50.png)

### Use Cases

- Learn a subject
- Learn a language
- Learn a code framework
- Read a book
- Research a problem in a field
- Learn a new skill
- …

As long as you have relevant materials, you can feed in everything you can collect and break it down for learning.

# Make reading papers as easy as reading a novel

Just open an arXiv paper page and use the Agent feature in the ChatGPT Atlas browser to help you read the first 3 papers.

![](/uploads/posts/ai-across-rd-workflow/17-imagespixpin_2025-11-16_02-27-07.png)

You don’t even need to download the PDF and upload it again—you can ask questions directly about the paper in the browser through Atlas.

![](/uploads/posts/ai-across-rd-workflow/18-imagespixpin_2025-11-18_14-13-17.png)

## Let the model translate for you

The main job of Transformer models used to be translation, so today’s models are already very strong at translation—even more professional than professional translators.

Tools to use:

- Immersive Translate extension
- Trancy extension
- Hallucination Translation: translation and parsing based on the original PDF
- Tencent Yuanbao: it has a nice research report diagram format; entry: All Apps -> AI
- Doubao: better interaction, and it can parse within the original text

### Immersive Translate extension

![](/uploads/posts/ai-across-rd-workflow/19-imagespixpin_2025-11-17_09-43-01.png)

It can also translate an entire document.

![](/uploads/posts/ai-across-rd-workflow/20-imagespixpin_2025-11-17_09-47-36.png)

### Tencent Yuanbao

![](/uploads/posts/ai-across-rd-workflow/21-imagespixpin_2025-11-17_18-58-05.png)

## Use models to extract anything from a paper

Models have strong OCR capabilities. When you want to copy code, scripts, or prompts from a paper to run experiments, but they’re sometimes images in the paper and can’t be copied directly, you can have a large model extract them for you.

![](/uploads/posts/ai-across-rd-workflow/22-imagespixpin_2025-11-16_01-13-18.png)

For example, here a code snippet and a training script are both images and can’t be copied directly—that’s where a large model comes in.

![](/uploads/posts/ai-across-rd-workflow/23-imagespixpin_2025-11-16_01-10-38.png)

![](/uploads/posts/ai-across-rd-workflow/24-imagespixpin_2025-11-16_01-15-01.png)

## Use models to collect related work

If you still don’t quite understand a paper after translating it with a model, it’s very likely an optimization or improvement derived from other work. For example, GSPO proposed by Alibaba is an optimization and improvement built on GRPO proposed by DeepSeek.

At this point, you can have the model collect other work related to this paper so you can study the background.

```latex
Comprehensively organize the related work covered in this paper, and introduce each one in a single sentence.
```

![](/uploads/posts/ai-across-rd-workflow/25-imageschatgpt-related_work.png)

# Make reading code as natural as chatting

Reading the paper alone isn’t enough. Sometimes papers come with open-source code repositories, and running the code repository can help you better understand the paper’s implementation.

## DeepWiKi

This is an open-source project from Devin. It pre-indexes and parses many important GitHub repositories in advance, so anyone can use that parsing to learn the codebase.

![](/uploads/posts/ai-across-rd-workflow/26-imagespixpin_2025-11-17_19-33-56.png)

![](/uploads/posts/ai-across-rd-workflow/27-imagespixpin_2025-11-17_19-39-21.png)

## Code Wiki

> Google's recently launched Code Wiki is currently free.

- **Automatically generated and continuously updated**: When a code repository (public repo) changes, the documentation is updated as well.
- **Structured, intelligent documentation**: Not just function comments and API listings, but also concept explanations, architecture diagrams, class diagrams, sequence diagrams, and more.
- **Interactive Q&A / intelligent assistant**

![](/uploads/posts/ai-across-rd-workflow/28-imagespixpin_2025-11-18_08-43-37.png)

![](/uploads/posts/ai-across-rd-workflow/29-imagespixpin_2025-11-18_08-44-51.png)

![](/uploads/posts/ai-across-rd-workflow/30-imagespixpin_2025-11-18_08-48-45.png)

## [Codex](https://openai.com/zh-Hans-CN/codex/)

A Code Agent released by OpenAI that can serve as a VSCode plugin, indexing and retrieving the existing code and incorporating the retrieved context as part of the prompt.

When encountering a BUG, layering in the code produces better results than directly asking the large model and having it search the web.

![](/uploads/posts/ai-across-rd-workflow/31-imagespixpin_2025-11-18_09-07-44.png)

For example, it can generate a flowchart of the entire framework, making it easier to read the source code.

![](/uploads/posts/ai-across-rd-workflow/32-imagespixpin_2025-11-18_14-33-55.png)

![](/uploads/posts/ai-across-rd-workflow/33-imagespixpin_2025-11-18_14-52-21.png)

## [Claude Code](https://claude.com/product/claude-code)

> Claude Code is an "agentic" coding tool developed by Anthropic. It runs in your terminal (or IDE), understands your entire codebase, and performs a series of tasks based on that: such as explaining complex code, executing Git workflows, refactoring, writing tests, and so on.

It is based on the command-line terminal. Compared with plugins like codex, it has higher system permissions and can do more operations. Its coding capability is also currently the strongest.

## Cursor

---

# Making Tracking and Learning Effortless

In this era of rapid AI advancement, there are new developments and discoveries every day. Relying on our own human energy to find all the effective information is very difficult—after all, we are not doing research full-time. At such times, we can use AI to help us with automated summarization and collection, letting the model track, filter, and report for us, freeing up our time to do more meaningful things.

ChatGPT, Gemini, and Perplexity all have the feature or concept of a project. We can organize paper study and news collection by project as units.

## ChatGPT

You can configure this through prompts. Steps:

Create a new project in the sidebar.

![](/uploads/posts/ai-across-rd-workflow/34-imagespixpin_2025-11-16_01-34-12.png)

![](/uploads/posts/ai-across-rd-workflow/35-imagespixpin_2025-11-16_01-34-49.png)

![](/uploads/posts/ai-across-rd-workflow/36-imagespixpin_2025-11-16_01-35-47.png)

Then, in the schedules section of your personal settings, you can manage all these configured tasks in one place.

![](/uploads/posts/ai-across-rd-workflow/37-imagespixpin_2025-11-16_22-55-10.png)

## Gemini

Set it directly in the chat.

![](/uploads/posts/ai-across-rd-workflow/38-imagespixpin_2025-11-16_01-37-49.png)

## Perplexity

You can set up automated tasks under My -> Tasks.

![](/uploads/posts/ai-across-rd-workflow/39-imagespixpin_2025-11-16_01-29-53.png)

![](/uploads/posts/ai-across-rd-workflow/40-imagespixpin_2025-11-16_01-30-57.png)

![](/uploads/posts/ai-across-rd-workflow/41-imagespixpin_2025-11-16_01-31-40.png)

---

# Making document writing easier

First, if you want to optimize document writing, you need to look at what parts a document consists of, and which parts can be optimized with a model.

Parts of a document:

- Title: Brainstorm with a model to come up with title names
- Abstract: Use a model to summarize and abstract the content
- Writing outline: Let the model **participate in brainstorming the paper outline and refine the key points of each section**
- Body
  - Formulas
  - Illustrations

## Common prompts

```txt
# Title generation
Help me come up with 3 paper titles about XXX

# Abstract generation
Summarize the whole text, .....
Please rewrite the abstract and provide 10 different versions

# Grammar correction and formal tone
Please polish this sentence to make it more literary and clearly expressed

# For longer sentences, you can optimize sentence structure and wording
Rewrite the following paragraph to make its wording more accurate and its content richer: XXX

# Have the model check the reasonable ordering of each part to ensure the logical structure of the paper
Please check whether the order of the outline sections is reasonable, and explain how the parts connect

# Finally, you can use the model to review and revise
Please check whether the logical structure of the following paragraphs is reasonable, and suggest improvements

```

## Body

### Formulas

Use the model's OCR capability to better generate formulas and insert them into your own document.

For example, paste a screenshot of a formula from a paper into the large model and have it output the formula in LaTeX format, achieving more efficient, better-looking formula display and editing.

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

The steps to paste LaTeX into Word are also simple:

In Word, press the shortcut or click Insert -> Equation -> select LaTeX

- **Win: Alt + =**
- On Mac it's **Control + =**  
→ This opens the equation editor; paste your LaTeX into it.

![](/uploads/posts/ai-across-rd-workflow/44-imagespixpin_2025-11-15_17-15-14.png)

![](/uploads/posts/ai-across-rd-workflow/45-imagespixpin_2025-11-15_17-16-09.png)

![](/uploads/posts/ai-across-rd-workflow/46-imagespixpin_2025-11-15_17-16-33.png)

### Illustrations

General-purpose large models today can generate images directly; we can have a large model generate the image prompt and hand it off to the image model to produce the image.

```txt
Read through the entire paper. It doesn't include much additional visualization or plotting, so based on a full understanding of the text, please help me design some possible scientific figure concepts and output them as English text-to-image prompts, so that I can use these prompts directly with modern AI image generation tools to produce the corresponding complete scientific figures.
```

![](/uploads/posts/ai-across-rd-workflow/47-imagespixpin_2025-11-18_00-48-31.png)

```txt
# Plan 1: DeepSeek-R1's "Aha Moment"
Subject: A conceptual scientific illustration representing the "Aha Moment" of an Artificial Intelligence. Description: A complex, dark, and chaotic 3D neural network structure in the background. In the center, a distinct, glowing, golden-white path suddenly aligns perfectly, cutting through the chaos. This path represents a "Chain-of-Thought" reasoning process. Along this bright path, small nodes light up sequentially, symbolizing self-verification and reflection. Style: High-tech, cinematic lighting, macro photography style, depth of field, 8k resolution, unreal engine 5 render. Color Palette: Deep navy blues and blacks for the background, bright gold and electric blue for the active reasoning path. Composition: Central composition, highlighting the contrast between the chaotic surroundings and the orderly central beam.

# Plan 2: DeepSeek-R1's Four-Stage Training Pipeline (The Training Pipeline)
Subject: An isometric 3D diagram of a four-stage AI model training pipeline. Description: The image shows a futuristic assembly line with four distinct stations connected by data streams.
Station 1 (Cold Start): A small pile of glowing, high-quality document icons entering a raw AI model.
Station 2 (Reasoning RL): The model enters a blue cyclical loop structure, symbolizing reinforcement learning and self-optimization for math and code.
Station 3 (Rejection Sampling): A filter mechanism where bad data (red particles) is discarded and only pure, bright data (gold particles) passes through to a larger dataset pool.
Station 4 (Final RL): The model goes through a final, multi-colored alignment ring, representing safety and general capabilities. Style: Clean, minimalist 3D infographic style, similar to Apple or Google design aesthetics. Soft shadows, matte materials. Color Palette: White background, pastel blue, metallic silver, and soft green accents. Details: No text labels in the image, just visual geometric representations of the processes.

# Knowledge Distillation: From Giant Model to Small Models (Distillation Process)
Subject: A sci-fi illustration of "Knowledge Distillation" from a Large Language Model to smaller models. Description: A colossal, highly detailed, towering robot head or brain structure composed of millions of blue fiber-optic cables (representing DeepSeek-R1). It is projecting a concentrated, structured beam of geometric light and data symbols downwards into a row of smaller, sleek, compact crystalline structures (representing the dense models like 1.5B, 7B, 14B). The smaller structures absorb the light and begin to glow with the same intensity as the giant. Style: Cyberpunk, futuristic, digital art, volumetric lighting, glowing effects. Mood: Powerful, educational, transfer of wisdom. Color Palette: Electric blue, neon purple, and white.

# Plan 4: Abstract Diagram of the GRPO Algorithm's Principles (GRPO Algorithm Abstract)
Subject: An abstract data visualization of the Group Relative Policy Optimization (GRPO) algorithm. Description: A central node (the prompt) branches out into multiple parallel pathways (the group of outputs). These pathways are visualized as semi-transparent ribbons. Some ribbons are straight and reach a glowing target (high reward), while others are twisted or break off (low reward). A "selector" field surrounds the straightest ribbons, intensifying their brightness, while the twisted ribbons fade away. This illustrates the concept of estimating baseline from group scores without a critic model. Style: Abstract data art, glassmorphism, translucent textures, scientific visualization. Color Palette: Dark background, neon orange for high reward paths, faint grey for low reward paths.

# Plan 5: Pure RL vs. Supervised Fine-Tuning (Pure RL vs SFT)
Subject: A comparative metaphorical illustration of Supervised Fine-Tuning vs. Pure Reinforcement Learning. Description: A split composition or a dual-path landscape. Left side (SFT): A paved, rigid, artificial staircase going up a mountain, representing human-guided learning. Right side (Pure RL): A glowing, fluid energy trail that scales the sheer cliff face freely. The trail spirals and loops (representing thinking and self-correction) but reaches a higher peak than the staircase. Style: Digital painting, fantasy/sci-fi blend, epic scale. Meaning: The glowing trail represents the emergent reasoning capability of DeepSeek-R1-Zero exploring the solution space autonomously.
```

![](/uploads/posts/ai-across-rd-workflow/48-imagespixpin_2025-11-18_00-53-13.png)

![](/uploads/posts/ai-across-rd-workflow/49-imagespixpin_2025-11-18_00-55-03.png)

![](/uploads/posts/ai-across-rd-workflow/50-imagesgemini_generated_image_ifoy76ifoy76i.png)

![](/uploads/posts/ai-across-rd-workflow/51-imageschatgpt_image_2025-11-18-_00_55_18.png)

## Thumbnail

A small image placed next to the article.

![](/uploads/posts/ai-across-rd-workflow/52-imagespixpin_2025-11-18_10-56-50.png)

```txt
On the basis of fully understanding the paper, if you were to generate a teaser image and a poster for this academic article, with the images required to be generated in Nature and Science style, output the complete text-to-image prompts corresponding to the design.
```

![](/uploads/posts/ai-across-rd-workflow/53-imagespixpin_2025-11-18_09-31-13.png)

![](/uploads/posts/ai-across-rd-workflow/54-imagespixpin_2025-11-18_10-54-38.png)

![Gemini](/uploads/posts/ai-across-rd-workflow/60-imagesgemini_generated_image_c295ouc295ouc.png)

![GPT](/uploads/posts/ai-across-rd-workflow/61-imageschatgpt_image_2025-11-18-_11_00_22.png)

## Promotional Poster

![Gemini](/uploads/posts/ai-across-rd-workflow/62-imagesgemini_generated_image_3ns7vw3ns7vw3.png)

![GPT](/uploads/posts/ai-across-rd-workflow/63-imageschatgpt_image_2025-11-18-_11_02_17.png)

---

# Making Models Easier to Use

## Reusing Fixed Prompts

We need to maintain our own toolkit on a daily basis — that is, collect the prompts for the scenarios we commonly encounter and keep refining them.

For example:

- Article study and summary
- Code learning
- Bug fixing and optimization
- Prompt optimization
- ...

![](/uploads/posts/ai-across-rd-workflow/55-imagespixpin_2025-11-18_01-07-02.png)

![](/uploads/posts/ai-across-rd-workflow/56-imagespixpin_2025-11-18_01-07-58.png)

![](/uploads/posts/ai-across-rd-workflow/57-imagespixpin_2025-11-18_11-03-21.png)

## Sharing the Conversation

Sometimes a model's answer to you is really good and you want to share it with others, but taking a screenshot directly isn't very pretty. In that case, you can use a plugin to export the chat history directly as a PDF or image so you can share it right away.

Install the plugin ChatGPT Exporter

![](/uploads/posts/ai-across-rd-workflow/58-imagespixpin_2025-11-18_01-12-50.png)

![](/uploads/posts/ai-across-rd-workflow/59-imagespixpin_2025-11-18_01-13-25.png)

# Closing Thoughts

The following content is quoted from:

[🔗 https://weekly.tw93.fun/posts/245/?__readwiseLocation=](https://weekly.tw93.fun/posts/245/?__readwiseLocation=)

- Under the AI wave, what has changed in the criteria for evaluating excellent engineers / product people?
  - Before: code written fast and well, quickly completed, high quality, product, very familiar with the product business, requirements documents written very well and clearly, clear thinking about product development, able to make trade-offs, the output can actually have a business impact, has their own opinions.
  - After AI: you'll find that, when used well, AI writes better than most engineers and product managers. Gradually, what we need to solve becomes **how to break down problems, how to implement the architecture, how to design the business workflow, how to get AI to achieve the goal better, how to define the output quality of AI, and knowing how to optimize that quality to make it better**. In terms of ability, we've become all-round product engineers.
  - Although the technical barrier has become lower, the overall requirements for people have become higher.
- If a 3–5 year practitioner wants to move closer to being a "10x individual," what kinds of abilities should they build up?
  - **The ability to tinker** — the willingness to accept new things, to be willing to play with all kinds of new technologies, and to think of how they relate to the problems you want to solve.
  - Learn to integrate AI into your own business workflow, rather than simply asking AI as if it were Google.
  - Fundamental technical ability, computer science, design and interaction aesthetics, full-stack technical ability, operations and promotion ability.
  - Learn to communicate — whether communicating with people or with AI, there are great techniques to help the other party get your meaning well.

Tools are always changing — becoming more numerous and better. Tools are only there to help us live and work better; it's impossible for us to master every tool. What we need to master is the ability to use tools and the mindset of being willing to try. I hope everyone can find a way of using tools that suits them in the era of large models, and progress together with AI.
