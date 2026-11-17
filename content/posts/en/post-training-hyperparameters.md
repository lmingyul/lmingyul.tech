---
title: Post-Training Hyperparameter Settings
slug: post-training-hyperparameters
publishedAt: '2026-01-23T02:30:00.000Z'
categories:
  - AI
  - LLM
description: 'Reference: https://unsloth.ai/docs/zh/ru-men/fine-tuning-llms-guide'
cover: /uploads/covers/post-training-hyperparameters.png
readingTime: 18
mood: neutral
draft: false
id: 416b44d3-5440-8198-943d-d354f61bd5cd
---
Reference: [https://unsloth.ai/docs/zh/ru-men/fine-tuning-llms-guide](https://unsloth.ai/docs/zh/ru-men/fine-tuning-llms-guide)

![](/uploads/posts/post-training-hyperparameters/01-image_2.png)

# **Epochs**

## What different epoch counts do

- More epochs: helps the model learn better, but too many epochs can cause the model to over-memorize the training data, hurting its performance on new tasks — its generalization ability degrades.
- Fewer epochs: reduces training time and prevents overfitting, but too few epochs can leave the model undertrained, unable to learn the underlying patterns in the dataset.

## Magic values

Typically set to: 1–3. The higher the epoch count, the more the marginal benefit of training diminishes, and the greater the risk of overfitting.

# **Learning Rate**

## What different learning rates do

- Higher learning rate: makes the model converge faster, but if set too high, the training loss can become unstable or fail to find the optimal minimum.
- Lower learning rate:
  - Pros: leads to more stable and more precise training.
  - Cons:
    - Requires more epochs to converge, which increases overall training time.
    - Can lead to **overfitting**: even though each update is tiny, the model keeps **"polishing" details on the training set**, and may even fit the noise in the training data. At that point, the training loss looks very low, but the model's generalization to new data actually gets worse — that's "overfitting."
    - Can cause the model to learn nothing: if the learning rate is too low, each weight update is almost negligible, and the model essentially "barely changes" — loss gets stuck at one value and stops decreasing. The training process looks stable, but the model hasn't learned anything meaningful at all.

## Magic values

Typical range: between `2e-4` (0.0002) and `5e-6` (0.000005).

The commonly used values \[1e-6, 3e-6, 1e-5, 3e-5, 1e-4\] and anything in between are all fair game.

By training type:

- For regular LoRA/QLoRA fine-tuning, start with **`2e-4`**
- For reinforcement learning (DPO, GRPO, etc.), start with **`5e-6`**
- For full-parameter fine-tuning, you need to set a value lower than **`5e-6`**

By model size:

- **7B - 13B (small parameter count):**
  - Recommended 2e-4 \~ 5e-4
  - Smaller models tolerate higher learning rates better, and a high LR helps them escape local minima
- **30B - 70B (large parameter count)**
  - Recommended 1e-4 \~ 2e-5
  - Larger models have a more complex parameter space, so the LR needs to be lowered to prevent gradient explosion or divergence.

If you find the loss dropping too fast, you can lower the lr and retrain.

# **Warmup Steps / Warmup\_ratio**

> Gradually ramps the learning rate up from a slow start to the target learning rate at the beginning of training.

**The purpose of warmup**: let the model "warm up slowly" for the first few steps, and once the gradients stabilize, learn at full speed. The warmup phase prevents the AdamW optimizer from causing severe oscillations in the model weights early on due to inaccurate gradient estimates. In other words, during that short stretch at the start of training, you use a "gradually increasing learning rate" to give the optimization process a buffer zone — making training more stable and letting you safely use a larger learning rate, so the whole run converges faster with better results.

If you set it to the target learning rate (base lr) from the very start, you run into problems:

- Parameter updates jump too fast, causing **loss explosion (divergence)**;
- The model learns a bunch of early noise;
- Or the gradients are too large, the weights get damaged, and the model collapses.

Typical value: 5%–10% of total training steps, i.e. 0.05 \~ 0.1.

Rules of thumb:

- If the **batch is small** or the **model is large (e.g. 70B)**, use 10% to give the model more warmup time.
- If the model is smaller or the data is low-noise, 5% is enough to get into the learning phase faster.

# **Warmup Scheduler Type**

> The way the learning rate is dynamically adjusted during training, so convergence is faster and more stable, instead of using the same lr in a straight line from start to finish.

## linear

The learning rate decreases linearly from its initial value to 0 (or some minimum).

![](/uploads/posts/post-training-hyperparameters/02-image_4.png)

## cosine

After the rise, it enters a smooth decline in a cosine shape — slow at first, then slower and slower, approaching 0 at the end. Research and experience show that for tasks like CV and LLMs it often generalizes better than simple linear decay, so many frameworks default to cosine.

![](/uploads/posts/post-training-hyperparameters/03-image.png)

Generally, a good scheduler:

- Takes bigger steps early on, converging faster;
- Gradually reduces the lr later, fine-tuning the parameters for stable convergence and lower overfitting risk.

So just use cosine.

# Gradient Accumulation and Effective Batch Size

$$
Effective\_Batch\_Size = batch\_size * gradient\_accumulation\_steps
$$

Effective Batch Size represents **the number of samples the model actually sees each time the parameters are updated**.

For example, say you want the model to learn from 64 samples at a time (batch size = 64), but your GPU memory only lets you process 4 samples at once.  
What do you do? You use **Gradient Accumulation** to "compute in chunks and merge them into a single update."

In this case:

- Each forward/backward pass only processes 4 samples (batch\_size = 4);
- Only after accumulating 16 times (gradient\_accumulation\_steps = 16) does it update the model parameters once;
- This effectively "simulates" the effect of batch size = 4 × 16 = 64.

→ That 64 is the **Effective Batch Size**.

What difference does the effective batch size make?

- **Large Effective Batch Size** → smoother, more stable gradients with less fluctuation.
  - Better suited to large models: large models are more prone to memorizing noise, and the smoother gradients from a large batch size help generalization.
- **Small Effective Batch Size** → noisier gradients and a jittery training curve, but sometimes better generalization.
  - Better suited to small models.

It's like statistical averaging: if you only look at 2 samples each time, you can't see the relationships or patterns between samples, and the result is very random; if you look at 128 samples each time, the relationships and patterns become much clearer, and the trend is far smoother.

| Parameter | Description | Recommended setting |
| --- | --- | --- |
| batch\_size | The number of samples a single GPU processes in one forward/backward pass. (Number of samples per learning step.) / Setting a high value improves hardware utilization and speeds up training, provided it fits in memory. | 2 |
| gradient\_accumulation\_steps | The number of micro-batches to process before performing one model weight update. (How many rounds before you review and summarize.) The larger this value, the more memory you save, but it also increases the training time per epoch accordingly. | 8 |
| **Effective Batch Size (computed)** | The batch size actually used per gradient update. It directly affects training stability, quality, and final model performance. | 4 \~ 16 / general rule of thumb: 16 (2 \* 8) |

Always prioritize setting a small `batch_size` and increasing `gradient_accumulation_steps` to reach your target **Effective Batch Size**, because this avoids OOM (out-of-memory) errors.

For example, if you want to process 16 samples per training step, you can set:

- `batch_size = 16, gradient_accumulation_steps = 1`
- `batch_size = 8, gradient_accumulation_steps = 2`
- `batch_size = 4, gradient_accumulation_steps = 4`
- `batch_size = 2, gradient_accumulation_steps = 8`
- `batch_size = 1, gradient_accumulation_steps = 16`

Recommended setting: `batch_size = 2, gradient_accumulation_steps = 8`

# Regularization Parameters

## **Weight Decay**

A regularization term that penalizes large weights to prevent overfitting and improve generalization. Don't set it too high — too large a value causes underfitting.

Principle: add a penalty term to the loss; weight decay is the coefficient $\lambda$ of that penalty term.

$$
L^{\prime}=L+\lambda \sum_{i} w_{i}^{2}
$$

Value range: 0.01 (recommended) - 0.1

---

# Setting the LoRA Parameters

## How LoRA works

The idea behind LoRA: instead of directly updating the full weight matrix $W$ of the large model, insert a low-rank approximate incremental matrix alongside it.

$$
\Delta W=\frac{\alpha}{r} A B
$$

The new parameter matrix is $W + \frac{\alpha}{r} A B$.

## Rank r

A higher rank increases the model's training capacity — it can learn more information and improves accuracy on complex tasks, but it also increases memory usage.

- Possible values: 8, 16, 32, 64, 128
- Recommended to start with 16 or 32

## **LoRA Alpha**

Its role is to scale the strength of the fine-tuning adjustment according to the rank (`r`), controlling the "force" of the LoRA update.

`r` controls "how many dimensions of knowledge to learn"

`α` controls "how much influence each dimension has"

Suggested range: 0.5–3.0

- Standard: `α = r` \* 1

Here the scaling factor is 1, meaning **the LoRA incremental matrix AB is added directly back to the model**.
This setting is simple and stable, and is usually the default in papers or most frameworks.

- ✅ Heuristic (rule of thumb): `α = r * 2`

Here the scaling factor is α / r = 2, meaning **the LoRA update strength is amplified 2×**.
In practice, this lets the model learn task features faster, especially when:

- the number of training epochs is small;
- the learning rate is small;
- or the dataset is small and the task is relatively simple.

Because in these cases the signal learned by LoRA is weak, so amplifying it a bit helps the model converge faster and become more expressive.

## **LoRA Dropout**

A regularization operation that randomly zeroes out (drops) part of the LoRA activations during training to prevent overfitting.

Suggested value range: between 0 and 0.1.

## **Target Modules**

> Specifies which parts of the model to apply the LoRA adapter to — the attention layers, the MLP layers, or both.

- Attention layers: `q_proj, k_proj, v_proj, o_proj`
- MLP: `gate_proj, up_proj, down_proj`

| Module | Layer names | Main function |
| --- | --- | --- |
| Attention module | `q_proj, k_proj, v_proj, o_proj` | Determines "what the model looks at" and "what it pays attention to" |
| MLP feed-forward module | `gate_proj, up_proj, down_proj` | Determines "how the model thinks" and "how it transforms semantics" |

### q\_proj

Maps the input into Query (who I want to look at)

### k\_proj

Maps the input into Key (how others see me)

### v\_proj

Maps the input into Value (the information I carry)

If LoRA is inserted into layers like q\_proj, k\_proj, and v\_proj, it lets the model learn "new attention patterns" — for example:

- learning to focus on "more relevant context";
- learning to focus on numbers, entities, instruction words, etc. in a certain type of instruction.

### o\_proj

o\_proj is the output projection layer, which remaps the concatenated result of multi-head attention back to the model's hidden dimension (the original space).

Adding LoRA to o\_proj lets the model **adjust how attention information is fused back into the mainstream semantic space**, essentially "reorganizing the attention results."

### gate\_proj

Introduces a gating (Gate) mechanism that decides which neurons are activated; mainly responsible for activation.

### up\_proj

Expands the dimension, e.g., from 4096 → 11008, letting the model learn complex patterns; mainly responsible for feature expansion.

### down\_proj

Compresses it back down, 11008 → 4096, integrating the information into the main channel; mainly responsible for compression.

Adding LoRA to the gate\_proj, up\_proj, and down\_proj layers lets the model **learn new semantic transformations or generation styles**, for example:

- expressing emotions more delicately;
- more precisely matching the semantic structure of a specific domain;
- generating a text style that matches the task characteristics.

The general recommendation is to train all linear layers, i.e., `q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj`. In ms-swift, the corresponding parameter setting is `all-linear`.

**Because the attention layers are responsible for "looking" and the MLP layers are responsible for "thinking"**

- If you only change the attention layers, the model may learn to "pay attention" to new positions, but it won't change its "thinking logic";
- If you only change the MLP layers, the model may "think" better, but it may not see the input's focus accurately.
- **Only by adjusting both can you fully adapt to a new task.**

**The guide indicates: LoRA should be applied to all major linear layers.** [Research shows](https://unsloth.ai/docs/zh/ru-men/fine-tuning-llms-guide/lora-hyperparameters-guide#lora-target-modules-and-qlora-vs-lora) that targeting all major layers is crucial for matching the performance of full-model fine-tuning. Although you can remove modules to reduce memory usage, this is strongly discouraged, because the savings are very limited and it affects maximum quality.

| **Configuration** | **Advantages** | **Disadvantages** |
| --- | --- | --- |
| **Only q\_proj / v\_proj** | Smallest memory footprint, fast training | Can only change the attention "perspective", cannot optimize language generation logic; poor generalization |
| **Only Attention (q,k,v,o)** | Above-average performance, suitable for small-memory environments | Sufficient for text generation tasks (like chat), but lacks "depth of understanding" for knowledge and reasoning tasks |
| **All linear layers (q,k,v,o,g,u,d)** | Best performance, close to full fine-tuning | Slightly higher memory (about 5–10% more), slightly slower training |

---

# Common Hyperparameter Settings for RL (GRPO)

![](/uploads/posts/post-training-hyperparameters/04-image_3.png)

$$
\begin{aligned}
\mathcal{J}_{GRPO}(\theta) &= \mathbb{E} [q \sim P(Q), \{o_i\}_{i=1}^G \sim \pi_{\theta_{old}}(O|q)] \\
&\quad \frac{1}{G} \sum_{i=1}^G \frac{1}{|o_i|} \sum_{t=1}^{|o_i|} \left\{ \min \left[ \frac{\pi_\theta(o_{i,t}|q, o_{i,<t})}{\pi_{\theta_{old}}(o_{i,t}|q, o_{i,<t})} \hat{A}_{i,t}, \text{clip} \left( \frac{\pi_\theta(o_{i,t}|q, o_{i,<t})}{\pi_{\theta_{old}}(o_{i,t}|q, o_{i,<t})}, 1-\varepsilon, 1+\varepsilon \right) \hat{A}_{i,t} \right] - \beta \mathbb{D}_{KL} [\pi_\theta || \pi_{ref}] \right\}
\end{aligned}
$$

## beta

> `beta` is the KL coefficient in GRPO. It weights the KL divergence between the "current policy vs the reference policy," essentially a knob controlling how strongly the model is pulled back toward the original model.

beta is the $\beta$ in $- \beta \mathbb{D}_{KL} [\pi_\theta || \pi_{ref}]$, used as a penalty term.

- When `beta = 0.0`, the reference model is not loaded and the KL term is not computed, equivalent to "not constraining the model from deviating from the original policy"; this saves memory and trains faster, but it also means the model is freer during training and more likely to drift.
- As `beta` increases, the weight of the KL penalty term in the loss becomes higher, and the model is pulled more strongly back toward the reference policy (usually the original model / SFT model from the start), so it is less likely to "run wild" or reward hack, but the model's exploration space for outputs becomes smaller.

### Reasonable setting strategy

- Getting started: `beta = 0.0`
  - First turn off the KL penalty to verify whether the reward function and batch/throughput settings are normal, and whether the reward rises steadily (e.g., for the first 300–1000 steps).
- For a later stable training version: `beta` on the order of `0.01 – 0.1`
  - When doing small RL adjustments on a model that already works well after SFT, generally choose a very small KL coefficient so it only slightly constrains the distribution from deviating too much.
  - If you find that the model's generation style or output has clearly drifted, then slowly increase it (e.g., from 0.02 → 0.05 → 0.1) while watching the reward curve.
- High-constraint scenarios: `beta` can go up to `0.2 – 0.5`
  - For example, when the SFT model's behavior already highly matches your expectations and RL is only fine-tuning certain metrics (such as SERP ranking or tool-call success rate), strong constraints are safer, but you must accept that the training gains will be limited.

## **num\_iterations**

> Replays data within each gradient accumulation step. Generally this means "how many rounds of parameter updates to perform on the same batch of sampled data," i.e., how many times each rollout / generation batch is reused; in the PPO paper this corresponds to the epoch count *μ*.

- In ms-swift, `num_iterations: number of iterations per batch`, with a default value of 1.
- When `num_iterations = 1`, each time sampling is needed, a new completion is generated, one round of gradient updates is done with this batch of data, and then it is discarded, with new data sampled next time.
- When `num_iterations > 1`, the current policy model first samples and scores a batch of data, then caches this batch, and the following several steps directly reuse the cached data for multiple rounds of updates. This is equivalent to running multiple rounds of GRPO updates on the same batch, reducing sampling overhead, and training becomes faster.

The larger this value is set, the more it "squeezes out" the currently generated data, but it is also more prone to overfitting / instability.

## **epsilon**

> *(floating point, default 0.2)*: the clipping value for the token-level log-probability ratio (under the default ε, the typical ratio range ≈ \[-1.2, 1.2\])

The corresponding formula is:

$$
\text{clip} \left( \frac{\pi_\theta(o_{i,t}|q, o_{i,<t})}{\pi_{\theta_{old}}(o_{i,t}|q, o_{i,<t})}, 1-\varepsilon, 1+\varepsilon \right) \hat{A}_{i,t}
$$

The token-level log-prob ratio is $\frac{\pi_\theta(o_{i,t}|q, o_{i,<t})}{\pi_{\theta_{old}}(o_{i,t}|q, o_{i,<t})}$.

The clipping threshold applied to the ratio limits the magnitude of the policy update, ensuring the ratio does not deviate too far from 1, and preventing an excessively large ratio from causing training instability, gradient explosion, or overfitting to a single batch.

### Common setting strategies

Suggested range: $[0.1, 0.2, 0.3]$

- Just use 0.2 by default: this is the official default, corresponding to a ratio range of roughly \[−1.2, 1.2\] (from the log-ratio perspective), which is stable enough in most GRPO scenarios.
- To be more conservative (smaller step size): try 0.1–0.15. The policy updates more slowly and stays closer to the reference policy, suitable for early experiments where you're afraid of collapse, or when reward noise is high or the loss fluctuates sharply.
- To be more aggressive: try 0.25–0.3, but you need to monitor the KL / success-rate curve together; once you see loss or KL jittering badly, reduce it a bit.
- You can also set only the upper bound, e.g., enable `epsilon_high` (e.g., the 0.28 recommended by DAPO) and then keep the underlying `epsilon` at around 0.2, using the upper-bound parameter to fine-tune the upper region instead of greatly changing epsilon itself, increasing the model's chance of outputting low-probability tokens and encouraging exploration.

## **importance\_sampling\_level**

> `importance_sampling_level` determines whether the core ratio $r_t=\frac{\pi_\theta}{\pi_{\text{old}}}$ in GRPO/PPO (or the weight used for the loss) is computed/applied at the **token level**, or whether the per-token ratios are aggregated into a **sequence-level** ratio before being applied. In essence, it's a trade-off between "finer but noisier" vs "coarser but more stable"—especially when your reward is **sequence-level** (one score per sentence), in which case sequence-level is often more stable.

### token vs sequence: what's the actual difference?

The one you see in the formula: **every token has its own ratio, and then the loss is computed token by token (each token gets its own weight).**

$$
ratio =\frac{\pi_\theta}{\pi_{\text{old}}}
$$

This is the most fine-grained weighting for updates: whichever token the new policy increases/decreases in probability gets the corresponding penalty or encouragement.

But it's also the most prone to jitter: if any single token's probability denominator is tiny / its logprob fluctuates, that can produce a ratio spike → gradient jitter.

The core idea of sequence-level is: **aggregate the token-level ratios into a single sequence weight**, so the entire completion shares one ratio.

The common approach: compute a ratio for each token first, then average:

$$
\log r_{\mathrm{seq}} = \frac{1}{T}\sum_{t=1}^{T} \log r_{t}
\quad\Rightarrow\quad
r_{\mathrm{seq}} = \exp\!\left(\log r_{\mathrm{seq}}\right)
$$

This is more stable: the ratio of some extreme token won't directly cause an extreme gradient (it gets diluted by averaging), and it better matches "sequence-level reward" scenarios—if you give a reward only when a whole sentence is fully correct, then the sentence should share one ratio. The catch: you can't precisely pinpoint, at the token level, "where to penalize/encourage."

Under sequence-level rewards, sequence-level is more stable.

### When to use `"sequence"`

- Training is particularly unstable (loss/grad\_norm jitter is large)
- Reward noise is significant (the RM is unstable, rule-based rewards jump around)
- Completion sequences are very long (token-level ratios multiply over too many tokens, raising the risk of anomalous tails)
- You observe a clearly long-tailed ratio distribution (many extreme values)

### When to use `"token"`

- You want stronger "local credit assignment": e.g., doing reasoning chains, format constraints, tool calls—token-level is more sensitive
- Completions aren't long (within a few hundred tokens)
- Training is already stable and you're chasing peak performance / convergence speed

## **reward\_weights**

> `reward_weights` are the **linear weighting coefficients in multi-reward scenarios**, used to combine multiple rewards into a single total reward (or total advantage) for training GRPO. What it fundamentally does is not "make the reward bigger/smaller" but **control the preference of the optimization direction**, and prevent training drift caused by one reward being larger than the others.

- A reward with a large weight: training will prioritize satisfying it
- A reward with a small weight: acts more like a constraint/preference term

Suppose there are three types of reward:

- Answer: correctness (RM)
- Format: format (rule-based)
- Length penalty: length\_penalty (rule-based)

Recommended defaults:

- correctness: large weight, as the primary objective
- format: medium, to prevent going off the rails
- length\_penalty: small but essential, to prevent endless verbosity

A typical sensible starting point:

$$
[w_{\text{corr}}, w_{\text{format}}, w_{\text{len}}] = [1.0,\ 0.3,\ 0.1]
$$

But the precondition is: the raw magnitudes of each reward should be comparable.

## Generation parameters

| Parameter | Role and meaning | Default | Recommended setting |
| --- | --- | --- | --- |
| temperature | Controls the strength of sampling randomness. Higher values produce more random outputs. | 1.0 | **SFT/inference**: 0.1 \~ 0.8 (more stable and accurate) / **GRPO / RL generation**: commonly **1.0** or slightly higher (0.8\~1.2)—use a relatively high temperature (1.0) to get diversity during generation, which helps learning. |
| top\_p | Controls the set of selectable tokens: sort tokens by probability from high to low, keep the top p% of the probability mass | 1.0 | **Inference**: 0.8\~0.95 is common (more stable) / **GRPO**: many implementations just use **1.0** (no truncation, chasing exploration) |
| top\_k | Selects the top-k set: sort by probability and keep only the top k tokens as the candidate set |  | **Inference**: 20\~100 is common / **GRPO**: in many cases set to None (unused) or a larger value (e.g., 50\~200) to prevent overly scattered exploration |

# Debugging: Parameter Adjustments for Common Failures

## KL value

- **Symptom**: KL value spikes (e.g., > 10.0) or instantly drops to zero.
- **Cause**: A spike means the model has completely deviated from the reference, usually due to an excessively high LR or unreasonably set Beta/Clip Range; dropping to zero means the model has stopped learning (posterior collapse).
- **Countermeasure**: When it spikes, lower the LR or increase Beta; when it drops to zero, check data quality or increase the LR.

## **OOM (out of memory) / Saving memory**

- Reduce batch size, increase Gradient Accumulation Steps
- Enabling `gradient_checkpointing=True` can reduce memory usage by more than 60%, at the cost of 20% slower training. Only turn this on when Batch Size has already been pushed to 1 or even 1 still OOMs.
- Use quantization

## **Loss NaN**

- Lower the learning rate by 50%
- Increase `warmup_steps`

---

# References

[https://unsloth.ai/docs/zh/kai-shi-shi-yong/reinforcement-learning-rl-guide](https://unsloth.ai/docs/zh/kai-shi-shi-yong/reinforcement-learning-rl-guide)
