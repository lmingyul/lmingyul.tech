---
title: "DeepSeekMath-V2 学习笔记"
slug: "deepseekmath-v2-notes"
publishedAt: "2025-12-05T01:31:00.000Z"
categories:
  - "AI"
  - "LLM"
  - "思考"
description: "今年 RL 训练主要都是围绕 Rule-Base （基于最终答案奖励机制）的形式进行训练的。但是这种训练形式存在缺陷，模型输出会出现答案正确+证明过程错误的情况。这篇论文提出需要将从基于最终答案的奖励机制（Outcome-based Reward）转向 “可自我验证的数学推..."
cover: "/uploads/posts/deepseekmath-v2-notes/01-gemini_generated_image_swlmixswlmixswlm.jpg"
readingTime: 19
mood: "neutral"
draft: false
id: "417b44d3-5440-8137-90a2-f908c57f59ff"
---
[📄 DeepSeekMath_V2.pdf](/uploads/posts/deepseekmath-v2-notes/13-deepseekmath_v2.pdf)

# 大致概览

![](/uploads/posts/deepseekmath-v2-notes/01-gemini_generated_image_swlmixswlmixswlm.jpg)

![](/uploads/posts/deepseekmath-v2-notes/02-gemini_generated_image_ziai76ziai76ziai.jpg)

![](/uploads/posts/deepseekmath-v2-notes/03-gemini_generated_image_4i1dud4i1dud4i1d.jpg)

![](/uploads/posts/deepseekmath-v2-notes/04-gemini_generated_image_i7a4ohi7a4ohi7a4.jpg)

![](/uploads/posts/deepseekmath-v2-notes/05-gemini_generated_image_lb9g29lb9g29lb9g.jpg)

![](/uploads/posts/deepseekmath-v2-notes/06-gemini_generated_image_tqebkttqebkttqeb.jpg)

# 主要观点

今年 RL 训练主要都是围绕 Rule-Base （基于最终答案奖励机制）的形式进行训练的。但是这种训练形式存在缺陷，模型输出会出现答案正确+证明过程错误的情况。这篇论文提出需要将从基于最终答案的奖励机制（Outcome-based Reward）转向 **“可自我验证的数学推理”（Self-Verifiable Mathematical Reasoning）**。最终使训练后的模型不仅能生成证明，还能根据严格的评估标准对自身的推理过程进行批判性验证和迭代改进，从而在不需要参考答案的情况下解决高难度的定理证明问题。

核心问题：

- **结果奖励的局限性**，无法解决仅靠推理过程的数据问题。
- **推理过程的不可靠性**：模型可能通过错误的逻辑或“幸运的错误”得出正确的最终答案，导致推理过程存在缺陷 。
- **缺乏自我验证能力**
- **人工标注瓶颈**：随着问题难度增加（如 IMO 级别），手动标注数据的成本极高且效率低下

![](/uploads/posts/deepseekmath-v2-notes/07-deepseekmath-v2-1.jpg)

# 实现的核心思路

**核心理念：以自我验证驱动进步，奖励模型不仅要给分数，更要建模评估分析过程，让生成与验证形成协同闭环，显著提升开放性问题的推理能力。**

加上验证的重要性

- 在处理开放性问题（没有标准答案的问题）没有参考解的时候，**看证明过程也能看出回答有没有问题**
  - 跟人类高考做题一样，做完题之后自己检查分析自己做的有没有问题，并进行打分，写评语，通过得分和分析出来的问题反过来优化做题过程。
- 如果从多个维度观察都没有发现问题，那这个证明是对的概率会**更高**

## **核心特点**

- **基础模型**：构建在 DeepSeek-V3.2-Exp-Base 之上
- **主要能力**：定理证明、逐步推导、自我验证
- **应用场景**：数学竞赛、学术研究、形式化验证

基于 DeepSeeK-V3.2 的微调版本同一个模型 -> 通过 RL 训练生成 3 个不同的模型 -> 学生模型（生成器）、老师模型（验证器）、督导主任模型（元验证器）

- 基于老师模型（验证器）的打分评语反馈

![](/uploads/posts/deepseekmath-v2-notes/08-deepseekmath-v2-2.jpg)

## 冷启动过程

### 冷启动第一阶段

#### 训练老师模型（验证器）

> **训练一个验证器来识别问题并对证明进行评分**

![](/uploads/posts/deepseekmath-v2-notes/09-gemini_generated_image_89ccfn89ccfn89cc.jpg)

数据收集流程：

- 爬取 17,503 道竞赛证明题 。
- 使用 DeepSeek-V3.2-Exp-Thinking 生成候选证明过程，由于模型并未针对定理证明进行优化，且容易生成简洁但易出错的回答，于是通过提示让它进行多轮迭代式的证明改写，提升证明的全面性与严谨性。
- 从不同类型的题目中（如代数、数论）随机抽取证明，并由数学专家根据评分标准对每份证明打分。

定了一个准则，让模型根据这个准则来生成评语与分数来评估证明过程，模仿数学专家的评估过程

评分等级分为 3 等

- 如果解决方案完全正确，所有步骤执行得当且展示清晰，则得分为 1。
- 如果解决方案大体正确，但遗漏了一些细节或有轻微错误，则得分为 0.5。
- 如果解决方案实际上没有解决所需问题、包含致命错误或有严重遗漏，则得分为 0。

RL 的 reward ：输出格式奖励 + 打分奖励（跟专家的评分越接近 reward 越大）

打分=`1-|s-s'|`，s 是标注的分数，s’ 是预测的分数。

$\max_{\pi_{\varphi}} \mathbb{E}_{(X_i, Y_i, s_i) \sim \mathcal{D}_v, (V'_i, s'_i) \sim \pi_{\varphi}(\cdot | X_i, Y_i)} \left[ R_{\text{format}}(V'_i) \cdot R_{\text{score}}(s'_i, s_i) \right]$

- 这里可以注意到：格式奖励和答案奖励是以乘法的形式结合的，和之前的相加形式不同，这样的奖励形式在格式不对、答案对 和 格式对、答案不对 这 2 中情况都拿不到高分，更强调了格式和答案必须同时都要对。

![](/uploads/posts/deepseekmath-v2-notes/10-deepseekmath-v2-3.jpg)

这一步先得到一个验证器，可以识别学生证明过程的问题，并给出评语 + 最终得分。

#### 训练督导主任模型（元验证器）

> 督导主任：监督老师模型输出是否有问题

上面经过训练后老师模型输出的得分跟人类专家比较接近，但是输出的打分评语并没有训练。

老师模型输出的评语与分数有可能有问题，可能会在 RL 过程出现学生给了一个有问题证明过程，但是老师给了这个证明一个正确的分数，来获取最大奖励。所以这个时候需要引入二次评估的过程，即让另一个人去检查老师的输出是否存在问题。

![](/uploads/posts/deepseekmath-v2-notes/11-deepseekmath-v2-4.jpg)

训练过程：

- 输入数学题 + 证明过程，让老师模型进行打分并给出评价文本
- 再找人类专家根据标准准则对老师模型的打分质量再打分
- 拿到这组数据去 RL 训练基座模型，得到另一个督导主任模型。
- 训练过程中让这个督导模型对老师模型的评价打分

#### 督导主任监督老师模型训练

训练好的督导模型可以用来强化原本老师模型， 原本 RL 奖励中加上督导主任的评分奖励，训练出更强的老师模型。

![](/uploads/posts/deepseekmath-v2-notes/12-gemini_generated_image_10xcg110xcg110xc.jpg)

注意这里有 2 个数据集：

- 一个是对解决问题的证明过程的评语 + 打分
- 一个是对评语的打分

使用第一个数据集对老师模型进行训练：

- 老师模型 RL 训练的 reward：格式 + 老师的对学生的评分与人类专家评分之间的相似程度 + 督导对老师评语的打分。

然后再使用第二个数据集也对老师模型进行训练

- 老师模型 RL 训练的 reward ：格式 + 对证明过程评语的打分。

```txt
We trained the enhanced verifier on both the verification dataset D𝑣 and the meta-verification dataset D𝑚𝑣, using the same reward mechanism on D𝑚𝑣 as used for training the meta-verifier.
The resulting model can perform both proof verification and meta-verification tasks.

我们在 验证数据集D𝑣 和 元验证数据集 D𝑚𝑣 上对增强验证器进行训练，采用与训练元验证器相同的奖励机制 D𝑚𝑣 。最终模型可同时执行证明验证和元验证任务。
```

到这一步，已经获得一个打分跟人类专家很像的，并且评语质量也很高（能发现学生答案过程中的问题）的老师模型（评语质量也是跟人类专家打分相近的），还会对别人的评语打分的老师。老师不仅在督导的监督下变得更会打分和写评语，还把督导的监督能力学到了手（这里学到手后面有大用处）。

#### 基于更强的老师模型训练学生

这个时候就可以训练学生模型了，学生模型做强化所获得的最大奖励就是老师给的打分。

当学生模型没办法一次性做对题目，学生可以根据老师给出的评语重新分析，一直迭代重新生成。

但是到这里论文作者说了一个现象：就是老师跟学生说你做的证明有问题，但是**学生模型还是坚持说自己的是对的**。

这里学生的证明过程得不到改进，就无法拿到更高的 RL 奖励。

所以作者想到可以让学生模型做题时不只输出证明过程 + 答案，还需要输出自评（对自己的输出做自我分析），评分标准 Iv 与老师模型一致。

有了自评之后就可以让老师模型对这个自评做打分，由于学生的自评也是对证明过程的评语，而老师已经学会了督导对评语打分的能力，所以这个时候老师对学生的自评的打分也可以作为学生 RL 过程的奖励。

![](/uploads/posts/deepseekmath-v2-notes/14-deepseekmath-v2-5.jpg)

总奖励：

$R = R_{\text{format}}(Y, Z) \cdot (\alpha \cdot R_Y + \beta \cdot R_Z)$

自评奖励:

$R_Z = R_{\text{score}}(s', s) \cdot R_{\text{meta}}(Z)$

- $R_{\text{score}}(s', s)$ 学生自己给自己的打分
- $R_{\text{meta}}(Z)$ 老师给学生自评的打分
- $R_Y$ 答题过程的得分
- $\alpha$: 0.76
- $\beta$: 0.24

这里面的奖励是有占比的：

证明得分/自评得分 = 3:1

有了自评打分后，学生模型就可以不坚持自己的看法（不认为自己有错），就会对自己的证明过程问题诚实面对。

![](/uploads/posts/deepseekmath-v2-notes/15-deepseekmath-v2-6.jpg)

### 思考

那督导主任模型（元验证器）的打分会不会也会有问题呢？老师从督导模型学到的技能会不会有问题呢？需不需要再加一个验证器去验证元验证器是否有问题呢？

这样搞的话，不就需要很多很多模型进行套娃了么？

- 督导模型的任务打分难度相对比较低，无需再监督

### 冷启动的第二阶段

#### 冷启动最后阶段——模型合并（RFT）

![](/uploads/posts/deepseekmath-v2-notes/16-deepseekmath-v2-7.jpg)

## RFT —— 数据自动化标注

> 如果生成器能力超过验证器，系统将失去自我纠错能力。DeepSeekMath-V2 通过动态扩展验证计算来解决这一问题。

随着生成器变强，验证难度增加，学生变强之后给自己打的自评老师都看不懂怎么办。作者就是说这些数据都可以作为验证器下一步优化的语料，但是这里老师都无法识别到的问题，该怎么打分呢，这里面使用到了自动化标注。

```txt
1. Scaling verifier samples increases the probability of catching real issues in flawed proofs. 
2. Reviewing the verifier’s identified issues is exactly meta-verification, which is easier than identifying issues from scratch. Meta-verification is also more sample-efficient for LLMs to master.

1.扩大验证器样本规模能提高在缺陷证明中发现实际问题的概率。
2.审核验证者发现的问题本质上就是元验证，这比从头开始识别问题要容易。对于大语言模
型而言，元验证也更具样本效率优势。
```

可以做自动化标注基于 2 个前提：

- 扩大验证规模，不管是老师验证还是督导主任验证（多搞一点老师来评分，一个老师不行就多叫几个，老师集体造反怎么办， 多叫几个主任来）能提高在缺陷证明中发现实际问题的概率。
- 审核验证者发现的问题本质上就是元验证，这比从头开始识别问题要容易。意思是说主任要干的活相对比较简单

![](/uploads/posts/deepseekmath-v2-notes/17-deepseekmath-v2-8.jpg)

RFT 阶段这个阶段就是让模型将做对的题切底记住，巩固先进经验。在测试阶段，通过并行生成大量候选证明（如 64 个）并进行多重验证，利用**多数投票机制**来确定最佳证明。

- 1 分数据被叫做拒绝采样的数据。
  - 只有当**所有**验证尝试都找不到合理漏洞时，才会被标记为满分（1分）。这体现了“宁缺毋滥”的严谨性，防止把错误的证明混入训练集。
- 如果多数的元验证器打分 0 分或 0.5 分的数据被叫错采样数据。

RFT 的阶段就是将 拒绝采样的数据拿去做训练

1 分的数据中也分为 3 类：

- 学生产生的数据
  - 输入：题目
  - 输出：解题过程 + 自我评价为 1 分
- 老师产生的数据
  - 输入：题目 + 解题过程  + 学生自我评价
  - 输出 ：评语 + 老师打分为 1 分
- 督导产生的数据
  - 输入：题目 + 解题过程 + 老师评价
  - 输出：对老师评价质量的打分

```sql
In each iteration, we first optimized proof verification. The proof generator was then
initialized from the verifier checkpoint and optimized for proof generation. Starting from the second iteration, the proof verifier was initialized with a checkpoint that consolidated both verification and generation capabilities from the previous iteration through rejection fine-tuning.

每轮迭代中，我们首先优化证明验证模块，随后从验证器检查点初始化证明生成器并进行优化。从第二轮迭代开始，证明验证器通过拒绝微调方式初始化，整合了前次迭代的验证与生成能力检查点。
```

3 类数据一起训练，可以让一个模型经过训练之后同时可以应对学生、老师、督导 3 个场景。这个训练好的模型就可以作为下一轮训练的基座模型。这样就可以让一个模型同时在解题、评分以及督导方面都得到当前最高水平的进化。

RFT 不仅仅是让模型记住“对的题”，更重要的是它**统一了模型的能力**。

DeepSeekMath-V2 的最终模型是 **One Single Model** 。通过 RFT，一个模型同时学会了“做题”（Generator）、“判卷”（Verifier）和“审判卷”（Meta-Verifier）。这大大降低了部署成本，不用维护三个模型。

![](/uploads/posts/deepseekmath-v2-notes/18-deepseekmath-v2-9.jpg)

后面的流程就是新增数据复刻这一流程持续进行。唯一的区别是不需要冷启动——人类专家标准的数据接入了。

![](/uploads/posts/deepseekmath-v2-notes/19-deepseekmath-v2-10.jpg)

# 最后总结

![](/uploads/posts/deepseekmath-v2-notes/20-gemini_generated_image_d8xogkd8xogkd8xo.jpg)

无论是奖励模型还是策略模型，最好不要只有分数，还要有过程，这样也便于人工参与。

核心是验证器，其实可以理解成一个复杂的 Reward 模型——既能输出对结果的打分，还能输出评估过程，还能输出对评估的分析，以及对分析的打分。就是一个评估+评估再评估的综合验证器。

# 相关的工作

最近观察到的工作，很多论文都提到了让模型评价自己，这可能是新的一个优化方向

- [Diffusion Model as a Noise-Aware Latent Reward Model for Step-Level Preference Optimization](https://arxiv.org/abs/2502.01051)
  - 快手的一篇工作：扩散模型自身也有自己的审美标准，使用扩散模型自己评价自己，最好让整体人类偏好得分、图文对齐能力、图像美学质量等多个维度均大幅提升模型性能
- Gemini 2.5 Deep Think：Towards Robust Mathematical Reasoning
  - 谷歌的一篇工作：采用了一种迭代式的“生成-验证-Debug”工作流。模型首先生成一个解，然后进入“自我改进”阶段，生成一份详细的 Bug Report（缺陷报告）。基于该报告，模型进行针对性的修正。这个过程可以循环多次，直到验证器通过或达到计算上限
- [How confessions can keep language models honest](https://openai.com/index/how-confessions-can-keep-language-models-honest/)
  - Openai 的最近的一篇文章：在强化学习中，如果模型发现隐瞒错误能获得更高的最终奖励，它就会学会欺骗验证器。
  - 为了打破这一悖论，OpenAI 引入了一种独立的“忏悔”输出通道。模型在回答后，需生成一份“忏悔报告”，自我披露是否采取了投机取巧的手段或违反了隐性指令。
  - “忏悔”通道的奖励与主任务奖励是分离的（Seal of Confession）。即便主任务失败，只要模型诚实地报告了失败原因，仍能获得“诚实奖励”。这确保了自我验证信号的真实性，防止模型演化出欺骗性的自我评估能力。

# 对我的启发

## 奖励函数的设计

- 在择优模型训练的时候之前都是只让模型输出答案，并没有让模型输出置信度分数（相当于让模型给自己打分）
- 在模型做 RL 时，可以将置信度分数也作为 RL 奖励的一部分。
- 然后在实际应用中，这个置信度分数也可以作为线上使用的阈值，比如当模型输出的置信度小于 0.8 时，我就当模型自己认为结果不确定，那这个结果我就不采用。

比如置信度奖励可以设置成：

$R_{置信度reward} = -(c - q)^2$

$R_{置信度reward} = -(c - q) * (c - q)$

- $c$: 学生自己对自己答案的打分（置信度）
- q：答案是否做对
- 第一个 $(c - q)$: 老师对学生打分的打分（没有老师模型）
- 第二个 $(c - q)$: 督导对老师的打分（也没有督导模型，那就再创建一个）

| **场景** | **模型行为** | **期望结果** | **奖励函数设计** | **奖励分析** |
| --- | --- | --- | --- | --- |
| **A** | **分类错误** | **置信度高** | **重罚** (Very Low Reward) | -(0.9 - 0)\^2 = -0.81 /  / 当 c=0.9, R=-0.81。 |
| **B** | **分类错误** | **置信度低** | **轻罚/中性** (Higher Reward) | -(0.1 - 0)\^2 = -0.01 / 当 c=0.1, R=-0.01。这是“好的失败”。 |
| **C** | **分类正确** | **置信度低** | **轻罚** (Low Reward) | -(0.6 - 1)\^2 = -(0.4)\^2 = -0.16 /  / 当 c=0.6, R=-0.16。 |
| **D** | **分类正确** | **置信度高** | **高奖** (Max Reward) | -(0.9 - 1)\^2 = -(0.1)\^2 = -0.01 /  / 当 c=0.9, R=-0.01（接近0），这是最优的 |

## 提示词结构的学习

```py
## Instruction
Your task is to evaluate the quality of a solution to a problem.
The problem may ask for a proof of statement, or ask for an
answer. If finding an answer is required, the solution
should present the answer, and it should also be a rigorous
proof of that answer being valid.

Please evaluate the solution and score it according to the
following criteria:

If the solution is completely correct, with all steps executed
 properly and clearly demonstrated, then the score is 1

If the solution is generally correct, but with some details
omitted or minor errors, then the score is 0.5

If the solution does not actually address the required problem,
contains fatal errors, or has severe omissions, then the
score is 0

Additionally, referencing anything from any paper does not save
the need to prove the reference.
It's okay IF AND ONLY IF
the solution also presents a valid proof of the reference
 argument(s);
otherwise, if the solution omits the proof or
if the proof provided is not completely correct, the
solution should be scored according to the criteria above,
and definitely not with a score of 1

Please carefully reason out and analyze the quality of the
solution below, and in your final response present a
detailed evaluation of the solution's quality followed by
your score.
Therefore,
your response should be in the
following format:

Here is my evaluation of the
solution:
// Your evaluation here. You are required to present in
detail the key steps of the solution or the steps for which
you had doubts regarding their correctness, and explicitly
analyze whether each step is accurate for correct steps,
explain why you initially doubted their correctness and why
they are indeed correct for erroneous steps, explain the
reason for the error and the impact of that error on the
solution.

Based on my evaluation, the final overall score should be:
\\boxed{{...}} // where ... should be the final overall score (0,
0.5, or 1, and nothing else) based on the above criteria

Here is your task input:
## Problem
{question}
## Solution
{proof}
```

## 自动化验证的思考

在做智驾时，是否可以参照这个论文的思路加一个模型作为验证器。

- 在做强化的时候，把验证器的反馈加入到提示词中作为模型的纠偏信号
- 在做自动化测试时，验证器的反馈可以作为整体步骤的打分或者最终步骤的判定
- 问题：
  - 验证器怎么训练
    - 验证的输入数据是什么：图片？页面描述？
    - 验证的数据集标注怎么做，即评语按照什么标准，怎么定
  - 需不需要督导模型再做进一步监督
  - 模型怎么选择
