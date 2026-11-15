---
title: "后训练（Post training）超参数设置"
slug: "post-training-hyperparameters"
publishedAt: "2026-01-23T02:30:00.000Z"
categories:
  - "AI"
  - "LLM"
description: "参考：https://unsloth.ai/docs/zh/ru-men/fine-tuning-llms-guide"
cover: "/uploads/covers/post-training-hyperparameters.png"
readingTime: 18
mood: "neutral"
draft: false
id: "416b44d3-5440-8198-943d-d354f61bd5cd"
---
参考：[https://unsloth.ai/docs/zh/ru-men/fine-tuning-llms-guide](https://unsloth.ai/docs/zh/ru-men/fine-tuning-llms-guide)

![](/uploads/posts/post-training-hyperparameters/01-image_2.png)

# **Epochs  训练轮数**

## 不同轮数的作用

- 更多轮次（Epochs）：可以帮助模型更好地学习，但过多的轮次可能导致模型过度记住训练数据，从而损害其在新任务上的表现，模型的泛化能力会变差
- 更少的轮次：减少训练时间并可防止过拟合，但如果轮次不足，可能导致模型训练不足，无法学到数据集的潜在模式。

## 魔法值

一般设置为：1-3，轮次越高训练得到的边际收益会递减且会增加过拟合的风险

# **Learning Rate  学习率**

## 不同学习率的作用

- 较高的学习率：会使模型更快的收敛，但如果设置过高，可能使训练 Loss 会不稳定或无法找到最优极值。
- 较低的学习率：
  - 优点：带来更稳定且更精确的训练
  - 缺点：
    - 需要更多轮次才能收敛，从而增加整体训练时间。
    - 可能会导致**过拟合**，模型尽管更新地很细微，但是会**在训练集上不断“打磨”细节**，甚至去拟合训练数据中的噪声。这时，虽然训练 loss 看起来很低，但模型对新数据的泛化能力反而变差，也就是“过拟合”。
    - 会导致模型学不到东西：如果学习率太低，权重每次更新几乎可以忽略不计，模型等于“几乎不变”，就会出现 loss 卡在一个值上不下降的情况——训练过程看似稳定，但模型根本没学到任何有意义的东西。

## 魔法值

一般设置范围：`2e-4` (0.0002) 到 `5e-6` (0.000005) 之间

常用的几个值 \[1e-6, 3e-6, 1e-5, 3e-5, 1e-4\] 以及它们之间的范围都可以进行调整

针对训练类型：

- 对于常规的 LoRA/QLoRA 微调，建议以 **`2e-4`** 作为起点
- 对于强化学习（DPO、GRPO 等），建议以 **`5e-6`** 作为起点
- 对于全参微调，需要设置比 **`5e-6`** 更低的值

针对训练模型参数大小：

- **7B - 13B （小参数）：**
  - 推荐 2e-4 \~ 5e-4
  - 较小模型对高学习率耐受度较高，高LR有助于跳出局部极小值
- **30B - 70B（大参数）**
  - 推荐 1e-4 \~ 2e-5
  - 大模型参数空间更复杂，需降低LR以防止梯度爆炸或发散 ()。

如果发现 Loss 下降过快，可以降低 lr 再训练

# **Warmup Steps / Warmup\_ratio 升温步数**

> 让训练一开始的学习率在缓慢逐步增加到目标设定学习率

**Warmup 的目的**：让模型前几步先“慢慢热身”，等梯度稳定下来，再全速学习。预热阶段能防止AdamW优化器在初始阶段因梯度估计不准而导致模型权重发生剧烈震荡，相当于在训练刚开始的那一小段时间里，用「逐步升高学习率」来给优化过程一个缓冲区，让训练更稳定、能安全地用更大的学习率，从而整体更快收敛、效果更好。

如果一开始设置为目标学习率 base lr 会导致问题：

- 参数更新跳得太快，导致 **loss 爆炸（发散）**；
- 学到一堆早期噪声；
- 或者梯度太大，权重被破坏，模型崩掉。

一般设置值为：总训练步数的 5%–10%，即 0.05 \~ 0.1

经验法则

- 如果 **batch 很小** 或 **模型很大（比如 70B）**，建议取 10%，让模型有更充分的热身时间。
- 如果模型较小或数据噪声低，可以只用 5%，让它更快进入学习阶段。

# **Warmup Scheduler Type （调度器类型）**

> 在训练期间动态调整学习率的方式，让收敛更快、更稳，避免一条直线从头到尾用同一个 lr

## linear （线性衰减）

学习率从初始值按直线逐步减到 0（或一个最小值）。

![](/uploads/posts/post-training-hyperparameters/02-image_4.png)

## cosine

上升后进入一个余弦形状的平滑下降，前期降得慢、后期越来越慢，末尾接近 0，有研究和经验表明在 CV、LLM 等任务中往往比简单线性衰减泛化更好，因此不少框架默认用 cosine

![](/uploads/posts/post-training-hyperparameters/03-image.png)

一般比较好的 Scheduler 是：

- 初期步子大一点，收敛得快
- 后期逐步减小 lr，细调参数，稳定收敛并减小过拟合风险

所以使用 consine 就可以了

# Gradient Accumulation （梯度累计） and Effective Batch Size（有效批次大小）

$$
Effective\_Batch\_Size （有效批次大小） = batch\_size （批次大小）* gradient\_accumulation\_steps （梯度累计步数）
$$

Effective Batch Size 代表的是 **每次参数更新时，模型实际看到的样本数量**

例如想让模型每次学习 64 条数据（batch size=64），但的显卡显存限制一次只能同时处理 4 条样本。  
那怎么办？那就用 **梯度累积（Gradient Accumulation）** 来“分批算完然后合并成一次更新”。

这时：

- 每次 forward/backward 只处理 4 条样本（batch\_size=4）；
- 累积 16 次后（gradient\_accumulation\_steps=16），才更新一次模型参数；
- 相当于“模拟”了 batch size = 4 × 16 = 64 的效果。

→ 这个 64 就是 **Effective Batch Size**。

不同大小的 effective batch size 有什么区别

- **大 Effective Batch Size** → 梯度波动更小，更平滑、更稳定。
  - 更适合大模型，大模型更容易记住噪声，大Batch Size提供的梯度更平滑，有助于泛化。
- **小 Effective Batch Size** → 梯度噪声更大，训练曲线抖动，但有时能带来更好的泛化。
  - 更适合小模型

这就像做统计学平均，如果你每次只看 2 个样本，看不出样本之间的关联性或规律，结果会非常随机；如果每次看 128 个样本，样本之间的关联与规律会更加清晰，趋势就平滑得多。

| 参数 | 描述 | 推荐设置 |
| --- | --- | --- |
| batch\_size | 单个 GPU 在一次前向/反向传播中处理的样本数量。（每次学习的样本数） / 设置高的值可以提高硬件利用率并加快训练速度，但前提是能装入内存。 | 2 |
| gradient\_accumulation\_steps | 在执行一次模型权重更新之前要处理的微批次数。（经过几次之后再进行复盘总结）。这个值越大越节省内存，但是也会相应增加单个轮次的训练时间。 | 8 |
| **Effective Batch Size （计算得出）** | 每次梯度更新时实际使用的批量大小。它直接影响训练的稳定性、质量和最终模型性能。 | 4 ～ 16 / 一般经验值推荐设置: 16 (2 \* 8) |

始终优先设置较小的 `batch_size` 并增加 `gradient_accumulation_steps` 以达到你的目标 **有效批次大小（Effective Batch Size），因为可以避免 OOM（显存溢出）错误**

比如你想在每个训练步骤中处理 16 个样本，可以设置

- `batch_size = 16, gradient_accumulation_steps =1`
- `batch_size = 8, gradient_accumulation_steps = 2`
- `batch_size = 4, gradient_accumulation_steps = 4`
- `batch_size = 2, gradient_accumulation_steps = 8`
- `batch_size = 1, gradient_accumulation_steps = 16`

推荐设置：`batch_size = 2, gradient_accumulation_steps = 8`

# 正则化参数

## **Weight Decay（权重衰减）**

一种正则化项，用于惩罚较大的权重以防止过拟合并提高泛化能力，不要设置过大的数值，过大的值会导致模型欠拟合

原理：在 Loss 上添加惩罚项，weight decay 就是惩罚项的系数 $\lambda$

$$
L^{\prime}=L+\lambda \sum_{i} w_{i}^{2}
$$

设置值范围：0.01 (推荐) - 0.1

---

# LoRA 参数的设置

## LoRA 的原理

LoRA 的思想是：不直接更新大模型的全部权重矩阵 $W$，而是在它旁边插入一个低秩近似的增量矩阵

$$
\Delta W=\frac{\alpha}{r} A B
$$

新的参数矩阵为 $W + \frac{\alpha}{r} A B$

## Rank r（秩）

高的秩（rank）会提高模型参数训练的容量，可以学更多信息，提升模型在处理复杂任务的准确度，但也会增加内存使用量。

- 可以设置的值：8, 16, 32, 64, 128
- 推荐一开始使用 16 或 32

## **LoRA Alpha**

作用是按秩（ `r` ）缩放微调调整的强度，控制 LoRA 更新的“力度”。

r 是控制“学多少维度的知识”

α 控制“每一维的影响力大小”

设置范围：0.5-3.0

- 标准：`α = r` \* 1

此时缩放因子是 1，即 **LoRA 的增量矩阵 AB 会被直接加回模型**。  
这种设定简单、稳定，通常是论文或大多数框架的默认值。

- ✅ 启发式（经验值）：`α = r * 2`

此时缩放因子是 α / r  = 2，即 **放大了 2 倍 LoRA 的更新强度**。  
实践上，这样模型能更快地学到任务特征，特别是在：

- 训练轮次较少；
- 学习率较小；
- 或数据集较小、任务较简单时。

因为此时 LoRA 学到的信号较弱，放大一点反而能帮助模型收敛得更快、更有表现力。

## **LoRA Dropout**

正则化操作，在训练期间随机将部分 LoRA 激活置为零（丢弃掉）以防止过拟合。

可以设置的值范围：0～0.1 之间。

## **Target Modules**

> 指定要在哪些模型部分应用 LoRA 适配器—— attention 层、MLP 层，或两者都有。

- Attention 层： `q_proj, k_proj, v_proj, o_proj`
- MLP: `gate_proj, up_proj, down_proj`

| 模块 | 层名 | 主要功能 |
| --- | --- | --- |
| Attention 注意力模块 | `q_proj, k_proj, v_proj, o_proj` | 决定模型“看什么”“关注什么” |
| MLP 前馈网络模块 | `gate_proj, up_proj, down_proj` | 决定模型“怎么思考”“如何转化语义” |

### q\_proj

把输入映射成 Query（我想看谁）

### k\_proj

把输入映射成 Key（别人怎么看我）

### v\_proj

把输入映射成 Value（我带的信息）

LoRA 如果插入到 p\_proj 、k\_proj 、v\_proj 这些层，会让模型学会“新的注意力模式”——比如：

- 学会关注“更相关的上下文”；
- 学会在某类指令中重点关注数字、实体、指令词等。

### o\_proj

o\_proj 是输出投影层，把多头注意力拼接后的结果重新映射到模型隐层维度（原空间）

在 o\_proj 加 LoRA，可以让模型**调整注意力信息如何融合回主流语义空间**，相当于“重新组织关注结果”。

### gate\_proj

引入门控控制（Gate）机制，决定哪些神经元激活，主要负责激活的。

### up\_proj

把维度扩展，比如从 4096 → 11008，让模型学习复杂模式，主要负责特种扩展的

### down\_proj

再压缩回来 11008 → 4096，把信息整合成主通道，主要负责压缩的

在 gate\_proj up\_proj down\_proj 层上加 LoRA，可以让模型**学到新的语义变换或生成风格**，比如：

- 更细腻地表达情感；
- 更精准地匹配特定领域的语义结构；
- 生成符合任务特征的文本风格。

一般建议是训练所有线性层，即 `q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj`。对应到 ms-swift 的参数设置就是 `all-linear`

**因为注意力层负责“看”，MLP层负责“想”**

- 如果只改注意力层，模型可能学会“关注”新的位置，但不会改变“思考逻辑”；
- 如果只改 MLP 层，模型能“思考”得更好，却可能看不准输入重点。
- **同时调整才能全面适配新任务。**

**指南表明：应将 LoRA 应用于所有主要线性层**. [研究表明](https://unsloth.ai/docs/zh/ru-men/fine-tuning-llms-guide/lora-hyperparameters-guide#lora-target-modules-and-qlora-vs-lora) 针对所有主要层对于匹配全模型微调的性能至关重要。虽然可以移除模块以减少内存使用，但强烈不建议这样做，因为节省非常有限且会影响最大质量。

| **配置** | **优点** | **缺点** |
| --- | --- | --- |
| **仅 q\_proj / v\_proj** | 显存占用最小，训练速度快 | 只能改变注意力“视角”，无法优化语言生成逻辑；泛化能力差 |
| **仅 Attention（q,k,v,o）** | 性能中等偏上，适合小显存环境 | 对文本生成类任务（如聊天）足够，但知识类、推理类任务会缺点“理解深度” |
| **全部线性层（q,k,v,o,g,u,d）** | 性能最优，接近全量微调 | 显存略高（约多 5–10%），训练略慢 |

---

# RL (GRPO) 常用的超参设置

![](/uploads/posts/post-training-hyperparameters/04-image_3.png)

$$
\begin{aligned}
\mathcal{J}_{GRPO}(\theta) &= \mathbb{E} [q \sim P(Q), \{o_i\}_{i=1}^G \sim \pi_{\theta_{old}}(O|q)] \\
&\quad \frac{1}{G} \sum_{i=1}^G \frac{1}{|o_i|} \sum_{t=1}^{|o_i|} \left\{ \min \left[ \frac{\pi_\theta(o_{i,t}|q, o_{i,<t})}{\pi_{\theta_{old}}(o_{i,t}|q, o_{i,<t})} \hat{A}_{i,t}, \text{clip} \left( \frac{\pi_\theta(o_{i,t}|q, o_{i,<t})}{\pi_{\theta_{old}}(o_{i,t}|q, o_{i,<t})}, 1-\varepsilon, 1+\varepsilon \right) \hat{A}_{i,t} \right] - \beta \mathbb{D}_{KL} [\pi_\theta || \pi_{ref}] \right\}
\end{aligned}
$$

## beta

> `beta` 是 GRPO 里控制 KL 系数，用来给「当前策略 vs 参考策略」之间的 KL 散度加权，相当于一个“回归原模型”的强度控制旋钮。

beta 就是$- \beta \mathbb{D}_{KL} [\pi_\theta || \pi_{ref}]$ 里面的 $\beta$，是作为惩罚项

- 当 `beta = 0.0` 时，不加载参考模型，不算 KL 项，等价于「不约束模型偏离原始策略」；这样更省显存、训练也更快，但也意味着模型训练更放飞、更容易漂。
- 随着 `beta` 变大，损失里 KL 惩罚项的权重变高，模型会被更强地拉回参考策略（通常是刚开始的原始模型 / SFT 模型），这样不容易「跑飞」或 reward hacking，但模型输出的探索空间会变小。

### 合理的设置策略

- 起步：`beta = 0.0`
  - 先关掉 KL 惩罚，验证 reward 函数、batch/throughput 设置是否正常，reward 是否能稳定上升（比如前 300–1000 step）。
- 后续稳定训练版本：`beta` 在 `0.01 – 0.1` 的量级
  - 对已有 SFT 好用的模型做小幅 RL 时，一般选一个很小的 KL 系数，只是轻微约束，让分布别偏太狠。
  - 如果发现模型生成风格、输出跑偏明显，再缓慢增大（比如从 0.02 → 0.05 → 0.1），观察 reward 曲线。
- 高约束场景：`beta` 可到 `0.2 – 0.5`
  - 比如 SFT 模型行为已经高度符合你的预期，RL 只是微调某些指标（如 SERP 排序、工具调用成功率），强约束更安全，但要接受训练提升效果有限。

## **num\_iterations**

> 在每个梯度累积步骤内重放数据。一般指“同一批采样数据要用来做几轮参数更新”，也就是每次 rollout / generation 的多轮复用次数，PPO 论文里对应的是轮次 *μ*

- 在 ms-swift 中，`num_iterations: number of iterations per batch`，默认值是 1。
- 当 `num_iterations = 1` 时，每到一次需要采样的时候就重新生成 completion，用这批数据做一轮梯度更新，然后丢弃，下次再采样新数据。
- 当 `num_iterations > 1` 时，会先用当前策略模型采样并打分一批数据，然后把这批数据缓存起来，后续若干 step 直接重复使用缓存数据做多轮更新，相当于在同一 batch 上跑多轮 GRPO 更新，减少采样开销，训练会更快

这个值设置越大越“榨干”当前生成的数据，但也更容易过拟合 / 不稳定。

## **epsilon**

> *（浮点数，默认 0.2）*：用于标记级别对数概率比的裁剪值（在默认 ε 下，典型 ratio 比值范围 ≈ \[-1.2, 1.2\]）

对应的公式是：

$$
\text{clip} \left( \frac{\pi_\theta(o_{i,t}|q, o_{i,<t})}{\pi_{\theta_{old}}(o_{i,t}|q, o_{i,<t})}, 1-\varepsilon, 1+\varepsilon \right) \hat{A}_{i,t}
$$

token 级 对数概率比（log-prob ratio） 是 $\frac{\pi_\theta(o_{i,t}|q, o_{i,<t})}{\pi_{\theta_{old}}(o_{i,t}|q, o_{i,<t})}$

对 ratio 做裁剪阈值，用来限制策略更新幅度，保证 ratio 不会偏离 1 太多，防止比率过大导致训练不稳定、梯度爆炸或过拟合单次 batch

### 常见设置策略

设置范围： $[0.1, 0.2, 0.3]$

- 默认直接用 0.2：这是官方默认值，对应 ratio 大致范围在 \[−1.2,1.2\]（log-ratio 视角），在多数 GRPO 场景下足够稳定。
- 想保守一点（更小步长）：可以尝试 0.1–0.15，策略会更新得更慢一些，更贴近参考策略，适合早期怕崩的实验、reward 噪声较大或 Loss 波动剧烈的情况。
- 想更激进一点：可以尝试 0.25–0.3，但需要配合监控 KL / 成功率曲线，一旦看到 loss、KL 抖得很厉害就要减少一点。
- 也可以单独设置上界，如开启 `epsilon_high`（例如 DAPO 推荐的 0.28）然后把底层的 `epsilon` 保持在 0.2 左右，用上界参数去微调上限区域，而不是大幅改 epsilon 本身，增加模型输出小概率 token 的机会，鼓励模型探索。

## **importance\_sampling\_level**

> `importance_sampling_level` 决定你在 GRPO/PPO 的核心比值 $r_t=\frac{\pi_\theta}{\pi_{\text{old}}}$（或其用于 loss 的权重）是用**token 级别**计算/作用，还是把 token 的比值聚合成序列**sequence 级别**再作用，它本质是在“更精细但更抖” vs “更粗糙但更稳”之间做取舍，尤其当你的 reward 是**序列级**（一句话一个分数）时，sequence 级往往更稳定。

### token vs sequence：区别到底是什么？

在公式里看到的那种：**每个 token 都有一个 ratio 比值，然后计算 loss 就在 token 维度上逐个处理（每个 token 一个权重）。**

$$
ratio =\frac{\pi_\theta}{\pi_{\text{old}}}
$$

这种方式更新权重是最精细的：哪个 token 被新策略改大/改小，都能被对应惩罚或鼓励

但也曲线也最容易抖：任何一个 token 的概率分母很小 / logprob 波动，都可能带来 ratio 尖峰 → 梯度抖动

sequence-level 的核心做法是：**把 token-level 的 ratio 聚合成一个序列权重**，让整条 completion 共用一个 ratio。

常见就是：对每个 token 先计算一个 ratio 再做平均：

$$
\log r_{\mathrm{seq}} = \frac{1}{T}\sum_{t=1}^{T} \log r_{t}
\quad\Rightarrow\quad
r_{\mathrm{seq}} = \exp\!\left(\log r_{\mathrm{seq}}\right)
$$

这种方式更稳：某些极端 token 的 ratio 不会直接导致极端梯度（会被平均稀释）更符合“序列级 reward”的场景：你给一句话完全对了才是一个奖励，那就该让一句话共享一个 ratio，但是无法精确到 token 层面“哪里该被惩罚/鼓励”

sequence-level 在序列级奖励下更稳定

### 什么时候建议用 `"sequence"`

- 训练特别不稳定（loss/grad\_norm 抖动大）
- reward 噪声较大（RM 不稳定、规则 reward 有跳变）
- completion 序列很长（token-level ratio 乘太多 token，异常尾部出现风险更大）
- 你观察到 ratio 分布长尾明显（极端值多）

### 什么时候建议 `"token"`

- 希望更强的“局部 credit assignment”：比如在做推理链、格式约束、工具调用，token-level 更敏感
- completion 不长（几百 token 内）
- 训练已经稳定，且追求极限性能/收敛速度

## **reward\_weights**

> `reward_weights` 是 **多奖励（multi-reward）场景下的线性加权系数**，用于把多个 reward 合成一个总 reward（或总 advantage）来训练 GRPO；它的本质作用不是“让 reward 变大/变小”，而是**控制优化方向的偏好**，以及避免某个 reward 更大而导致训练漂移。

- 权重大的 reward ：训练会优先满足它
- 权重小的 reward ：更像是一个约束/偏好项

假设有三类 reward：

- 答案：correctness（RM）
- 格式：format（规则）
- 长度惩罚：length\_penalty（规则）

建议默认：

- correctness：权重大，作为主目标
- format：中等，防止跑偏
- length\_penalty：小但必须有，防止无限啰嗦

一个典型合理初值：

$$
[w_{\text{corr}}, w_{\text{format}}, w_{\text{len}}] = [1.0,\ 0.3,\ 0.1]
$$

但前提是：各原始 reward 量级要接近

## 生成参数

| 参数 | 作用及含义 | 默认值 | 推荐设置值 |
| --- | --- | --- | --- |
| temperature | 用于控制采样随机的强度。值越高，生成的结果越随机。 | 1.0 | **SFT/推理**：0.1 \~ 0.8（更稳更准） / **GRPO / RL 生成**：常见 **1.0** 或更高一点（0.8\~1.2）使用相对较高（1.0）的温度以在生成中获得多样性，这有助于学习。 |
| top\_p | 控制可以选 token 的集合，按 token 概率从高到低排序，留概率质量的前 p% 的 token | 1.0 | **推理**：0.8\~0.95 常见（更稳） / **GRPO**：很多实现直接 **1.0**（不截断，追求探索） |
| top\_k | 选择前多少的集合，按概率排序，只保留前 k 个 token 作为候选集合 |  | **推理**：20\~100 常见 / **GRPO**：很多情况设 None（不用）或给一个较大值（如 50\~200）以防太分散的探索 |

# 调试、常见故障对应参数调整

## KL 值

- **现象**：KL值激增（如 > 10.0）或瞬间归零。
- **原因**：激增意味着模型彻底偏离了Reference，通常是因为LR过高或Beta/Clip Range设置不合理；归零则意味着模型停止了学习（Posterior Collapse）。
- **对策**：激增时降低 LR 或增大 Beta；归零时检查数据质量或增大LR 。

## **OOM（显存溢出）/ 节省显存**

- 减少 batch size , 增大 Gradient Accumulation Steps
- 开启 `gradient_checkpointing=True` 可以让显存占用减少 60% 以上，代价是训练速度慢 20%，当 Batch Size 已经被压到 1 甚至 OOM 时再打开这个配置
- 使用量化

## **Loss NaN**

- 降低学习率 50%
- 增加`warmup_steps`

---

# 参考资料

[https://unsloth.ai/docs/zh/kai-shi-shi-yong/reinforcement-learning-rl-guide](https://unsloth.ai/docs/zh/kai-shi-shi-yong/reinforcement-learning-rl-guide)
