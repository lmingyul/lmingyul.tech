---
title: DeepSeekMath-V2 Study Notes
slug: deepseekmath-v2-notes
publishedAt: '2025-12-05T01:31:00.000Z'
categories:
  - AI
  - LLM
  - Thinking
description: >-
  This year, RL training has mainly revolved around Rule-Based approaches
  (reward based on the final answer). But this training paradigm has flaws: the
  model can produce a correct final answer together with an incorrect proof.
  This paper proposes shifting from outcome-based reward to "self-verifiable
  mathematical reasoning..."
cover: >-
  /uploads/posts/deepseekmath-v2-notes/01-gemini_generated_image_swlmixswlmixswlm.jpg
readingTime: 19
mood: neutral
draft: false
id: 417b44d3-5440-8137-90a2-f908c57f59ff
---
[📄 DeepSeekMath_V2.pdf](/uploads/posts/deepseekmath-v2-notes/13-deepseekmath_v2.pdf)

# General Overview

![](/uploads/posts/deepseekmath-v2-notes/01-gemini_generated_image_swlmixswlmixswlm.jpg)

![](/uploads/posts/deepseekmath-v2-notes/02-gemini_generated_image_ziai76ziai76ziai.jpg)

![](/uploads/posts/deepseekmath-v2-notes/03-gemini_generated_image_4i1dud4i1dud4i1d.jpg)

![](/uploads/posts/deepseekmath-v2-notes/04-gemini_generated_image_i7a4ohi7a4ohi7a4.jpg)

![](/uploads/posts/deepseekmath-v2-notes/05-gemini_generated_image_lb9g29lb9g29lb9g.jpg)

![](/uploads/posts/deepseekmath-v2-notes/06-gemini_generated_image_tqebkttqebkttqeb.jpg)

# Main Points

This year, RL training has mostly revolved around Rule-Based setups (reward based on the final answer). But this training paradigm has a flaw: the model's output can end up with a correct answer plus a flawed proof. This paper argues that we need to move from Outcome-based Reward to **"Self-Verifiable Mathematical Reasoning."** The end goal is a trained model that not only generates proofs, but can also critically verify and iteratively improve its own reasoning against strict evaluation criteria — so it can solve hard theorem-proving problems without needing reference answers.

Core problems:

- **The limitations of outcome rewards**: they can't handle problems where only the reasoning-process data is available.
- **The unreliability of the reasoning process**: the model may reach a correct final answer through faulty logic or a "lucky mistake," leaving the reasoning process flawed.
- **Lack of self-verification ability**
- **The human annotation bottleneck**: as problem difficulty increases (e.g., IMO level), manually annotating data becomes extremely costly and inefficient

![](/uploads/posts/deepseekmath-v2-notes/07-deepseekmath-v2-1.jpg)

# Core Implementation Ideas

**Core philosophy: let self-verification drive progress. The reward model should not just hand out scores — it should model the evaluation and analysis process, so that generation and verification form a collaborative closed loop, significantly improving reasoning on open-ended problems.**

Why verification matters

- When dealing with open-ended problems (problems with no standard answer) and no reference solution, **you can still spot problems by reading the proof process**
  - It's like taking the gaokao as a human: after finishing, you check and analyze your own work, score it, write comments, and then use the score and the problems you identified to improve your problem-solving process in turn.
- If no issues turn up when you look from multiple angles, the probability that the proof is correct is **higher**

## Core Features

- **Base model**: built on DeepSeek-V3.2-Exp-Base
- **Main capabilities**: theorem proving, step-by-step derivation, self-verification
- **Application scenarios**: math competitions, academic research, formal verification

Starting from the same fine-tuned version of DeepSeek-V3.2 -> RL training produces 3 different models -> student model (generator), teacher model (verifier), supervisor model (meta-verifier)

- Feedback based on the teacher (verifier) model's scores and comments

![](/uploads/posts/deepseekmath-v2-notes/08-deepseekmath-v2-2.jpg)

## The Cold Start Process

### Cold Start Phase 1

#### Training the Teacher Model (Verifier)

> **Train a verifier to identify issues and score proofs**

![](/uploads/posts/deepseekmath-v2-notes/09-gemini_generated_image_89ccfn89ccfn89cc.jpg)

Data collection process:

- Crawled 17,503 competition proof problems.
- Used DeepSeek-V3.2-Exp-Thinking to generate candidate proofs. Since the model wasn't optimized for theorem proving and tends to produce concise but error-prone answers, prompting was used to make it rewrite proofs iteratively over multiple rounds, improving their comprehensiveness and rigor.
- Proofs were randomly sampled from different problem types (e.g., algebra, number theory), and math experts scored each proof against the scoring rubric.

They defined a rubric and had the model generate comments and scores according to it to evaluate proofs, mimicking the evaluation process of math experts

Scores fall into 3 levels

- If the solution is completely correct, all steps are executed properly, and the presentation is clear, the score is 1.
- If the solution is largely correct but misses some details or has minor errors, the score is 0.5.
- If the solution does not actually solve the required problem, contains fatal errors, or has serious omissions, the score is 0.

RL reward: output format reward + scoring reward (the closer to the expert's score, the larger the reward)

score = `1-|s-s'|`, where s is the annotated score and s' is the predicted score.

$\max_{\pi_{\varphi}} \mathbb{E}_{(X_i, Y_i, s_i) \sim \mathcal{D}_v, (V'_i, s'_i) \sim \pi_{\varphi}(\cdot | X_i, Y_i)} \left[ R_{\text{format}}(V'_i) \cdot R_{\text{score}}(s'_i, s_i) \right]$

- Note here: the format reward and the answer reward are combined multiplicatively, unlike the earlier additive form. With this reward shape, neither of these 2 cases — wrong format with correct answer, or correct format with wrong answer — can earn a high score, which puts more emphasis on getting both the format and the answer right at the same time.

![](/uploads/posts/deepseekmath-v2-notes/10-deepseekmath-v2-3.jpg)

This step first gives us a verifier that can spot problems in a student's proof and give comments + a final score.

#### Training the Supervisor Model (Meta-Verifier)

> Supervisor: checks whether the teacher model's output has problems

After the training above, the teacher model's scores are fairly close to human experts', but the scoring comments it outputs were never trained.

The teacher model's comments and scores may have issues. During RL, it could happen that a student submits a flawed proof, yet the teacher gives that proof a correct score, and the student then reaps maximum reward. So at this point we need to introduce a second round of evaluation — have another model check whether the teacher's output has problems.

![](/uploads/posts/deepseekmath-v2-notes/11-deepseekmath-v2-4.jpg)

Training process:

- Input a math problem + proof, have the teacher model score it and produce evaluation text
- Then have human experts score the quality of the teacher model's scoring against the standard rubric
- Take this dataset and RL-train the base model to get another model: the supervisor
- During training, this supervisor model scores the teacher model's evaluations

#### The Supervisor Oversees Teacher Model Training

The trained supervisor can be used to strengthen the original teacher model: add the supervisor's scoring reward to the original RL reward, and train a stronger teacher model.

![](/uploads/posts/deepseekmath-v2-notes/12-gemini_generated_image_10xcg110xcg110xc.jpg)

Note there are 2 datasets here:

- One is comments + scores on the proofs that solve the problems
- The other is scores on the comments

Train the teacher model with the first dataset:

- Teacher model RL reward: format + how similar the teacher's score of the student is to the human expert's score + the supervisor's score of the teacher's comments.

Then train the teacher model with the second dataset as well

- Teacher model RL reward: format + the score given to the comments on the proof.

```txt
We trained the enhanced verifier on both the verification dataset D𝑣 and the meta-verification dataset D𝑚𝑣, using the same reward mechanism on D𝑚𝑣 as used for training the meta-verifier.
The resulting model can perform both proof verification and meta-verification tasks.
```

At this point we have a teacher model whose scores closely resemble human experts' and whose comments are also high quality (able to spot problems in the student's answer process — comment quality is likewise close to human expert scoring), and which can additionally score other people's comments. Under the supervisor's supervision, the teacher not only got better at scoring and writing comments, it also picked up the supervisor's supervision ability (which will come in very handy later).

#### Training the Student with a Stronger Teacher Model

Now the student model can be trained. The biggest reward the student gets from RL is the score the teacher gives it.

When the student model can't get a problem right in one shot, it can re-analyze based on the comments the teacher gives, and keep iterating and regenerating.

But here the authors point out a phenomenon: the teacher tells the student its proof has problems, yet **the student model still insists it is right.**

If the student's proof doesn't improve, it can't earn a higher RL reward.

So the authors came up with this: when solving problems, the student model should output not just the proof + answer, but also a self-evaluation (its own analysis of its output), using the same scoring rubric Iv as the teacher model.

Once there's a self-evaluation, the teacher model can score that self-evaluation. Since the student's self-evaluation is also a comment on the proof, and the teacher has already learned the supervisor's ability to score comments, the teacher's score of the student's self-evaluation can now also serve as a reward in the student's RL process.

![](/uploads/posts/deepseekmath-v2-notes/14-deepseekmath-v2-5.jpg)

Total reward:

$R = R_{\text{format}}(Y, Z) \cdot (\alpha \cdot R_Y + \beta \cdot R_Z)$

Self-evaluation reward:

$R_Z = R_{\text{score}}(s', s) \cdot R_{\text{meta}}(Z)$

- $R_{\text{score}}(s', s)$ is the score the student gives itself
- $R_{\text{meta}}(Z)$ is the teacher's score of the student's self-evaluation
- $R_Y$ is the score for the answering process
- $\alpha$: 0.76
- $\beta$: 0.24

The rewards here are weighted:

proof score / self-evaluation score = 3:1

With the self-evaluation score in place, the student model no longer digs in on its own view (no longer insisting it isn't wrong), and will face the problems in its proof honestly.

![](/uploads/posts/deepseekmath-v2-notes/15-deepseekmath-v2-6.jpg)

### Reflections

Could the supervisor model's (meta-verifier's) scores also be problematic? Could the skill the teacher learned from the supervisor be problematic? Do we need to add yet another verifier to check whether the meta-verifier has problems?

If we went that way, wouldn't we need a whole stack of nested models?

- The supervisor's scoring task is relatively easy, so no further supervision is needed

### Phase 2 of Cold Start

#### The Final Stage of Cold Start — Model Merging (RFT)

![](/uploads/posts/deepseekmath-v2-notes/16-deepseekmath-v2-7.jpg)

## RFT — Automated Data Annotation

> If the generator's capability outstrips the verifier's, the system loses its ability to self-correct. DeepSeekMath-V2 solves this by dynamically scaling verification compute.

As the generator gets stronger, verification gets harder — once the student gets strong, what happens when even the self-appointed grading teacher can't understand it? The authors' point is that all of this data can serve as corpus for the verifier's next round of optimization, but how do you score problems that even the teacher can't identify? That's where automated annotation comes in.

```txt
1. Scaling verifier samples increases the probability of catching real issues in flawed proofs. 
2. Reviewing the verifier’s identified issues is exactly meta-verification, which is easier than identifying issues from scratch. Meta-verification is also more sample-efficient for LLMs to master.

1. Expanding the verifier's sample size increases the probability of catching real issues in flawed proofs.
2. Reviewing the issues the verifier finds is essentially meta-verification, which is easier than identifying issues from scratch. For large language models, meta-verification is also more sample-efficient.
```

Automated annotation can be done based on 2 premises:

- Scaling verification — whether it's the teacher verifying or the supervising director verifying (bring in more teachers to grade; if one teacher isn't enough, call in a few more; what if the teachers revolt? then call in a few more directors) — increases the probability of catching real issues in flawed proofs.
- Reviewing the issues the verifier finds is essentially meta-verification, which is easier than identifying issues from scratch. Meaning the director's job is relatively simple.

![](/uploads/posts/deepseekmath-v2-notes/17-deepseekmath-v2-8.jpg)

The RFT stage is about getting the model to thoroughly memorize the problems it got right, consolidating the advanced experience. At test time, it generates a large number of candidate proofs in parallel (e.g., 64) and performs multi-layer verification, using a **majority voting mechanism** to determine the best proof.

- 1-point data is called rejection-sampling data.
  - Only when **all** verification attempts fail to find a legitimate flaw is it marked as a full score (1 point). This reflects the rigor of "better to have nothing than something flawed," preventing erroneous proofs from slipping into the training set.
- Data where the majority of meta-verifiers score 0 or 0.5 is called mis-sampled data.

The RFT stage is about taking the rejection-sampled data and training on it.

1-point data also falls into 3 categories:

- Student-generated data
  - Input: the problem
  - Output: the solution process + a self-evaluation of 1 point
- Teacher-generated data
  - Input: the problem + the solution process + the student's self-evaluation
  - Output: comments + the teacher's score of 1 point
- Director-generated data
  - Input: the problem + the solution process + the teacher's evaluation
  - Output: a score for the quality of the teacher's evaluation

```sql
In each iteration, we first optimized proof verification. The proof generator was then
initialized from the verifier checkpoint and optimized for proof generation. Starting from the second iteration, the proof verifier was initialized with a checkpoint that consolidated both verification and generation capabilities from the previous iteration through rejection fine-tuning.

In each iteration, we first optimize the proof verification module, then initialize the proof generator from the verifier checkpoint and optimize it. Starting from the second iteration, the proof verifier is initialized via rejection fine-tuning, consolidating the verification and generation capabilities from the previous iteration's checkpoint.
```

Training the 3 types of data together lets a single model, once trained, handle all three scenarios at the same time: student, teacher, and director. This trained model can then serve as the base model for the next round of training. That way one model can simultaneously reach the current state of the art in solving problems, grading, and supervising.

RFT isn't just about making the model memorize "the problems it got right" — more importantly, it **unifies the model's capabilities**.

DeepSeekMath-V2's final model is **One Single Model**. Through RFT, a single model learns to "solve the problems" (Generator), "grade the papers" (Verifier), and "judge the grading" (Meta-Verifier) all at once. This greatly lowers deployment cost — no need to maintain three models.

![](/uploads/posts/deepseekmath-v2-notes/18-deepseekmath-v2-9.jpg)

The rest of the pipeline is repeating this process with newly added data. The only difference is that no cold start is needed — data at human-expert standard is plugged in.

![](/uploads/posts/deepseekmath-v2-notes/19-deepseekmath-v2-10.jpg)

# Final Summary

![](/uploads/posts/deepseekmath-v2-notes/20-gemini_generated_image_d8xogkd8xogkd8xo.jpg)

Whether it's a reward model or a policy model, it's best not to have only a score — you want a process too, which also makes human involvement easier.

The core is the verifier, which can really be understood as a complex Reward model — it can output a score for the result, an evaluation process, an analysis of the evaluation, and a score for that analysis. It's a comprehensive verifier that does evaluation + evaluation of the evaluation.

# Related Work

Recent work I've noticed — many papers mention having the model evaluate itself, which may be a new direction for optimization.

- [Diffusion Model as a Noise-Aware Latent Reward Model for Step-Level Preference Optimization](https://arxiv.org/abs/2502.01051)
  - A Kuaishou paper: the diffusion model has its own aesthetic standards, so using the diffusion model to evaluate itself — best of all, it substantially improves model performance across multiple dimensions such as overall human preference score, text-image alignment, and image aesthetic quality.
- Gemini 2.5 Deep Think: Towards Robust Mathematical Reasoning
  - A Google paper: it adopts an iterative "generate-verify-debug" workflow. The model first generates a solution, then enters a "self-improvement" phase and produces a detailed Bug Report. Based on that report, the model makes targeted corrections. This process can loop multiple times until the verifier passes or the compute limit is reached.
- [How confessions can keep language models honest](https://openai.com/index/how-confessions-can-keep-language-models-honest/)
  - A recent OpenAI post: in reinforcement learning, if the model finds that concealing mistakes yields a higher final reward, it will learn to deceive the verifier.
  - To break this paradox, OpenAI introduces an independent "confession" output channel. After answering, the model must produce a "confession report" disclosing whether it took shortcuts or violated implicit instructions.
  - The reward for the "confession" channel is separate from the main task reward (Seal of Confession). Even if the main task fails, as long as the model honestly reports the reason for failure, it still earns an "honesty reward." This ensures the truthfulness of the self-verification signal and prevents the model from evolving deceptive self-evaluation capabilities.

# What This Inspires in Me

## Reward Function Design

- When training the preference (selection) model, previously we only had the model output the answer, and never had it output a confidence score (equivalent to having the model grade itself).
- When doing RL with the model, the confidence score can also be part of the RL reward.
- Then in practical applications, this confidence score can also serve as an online threshold — for example, when the model's output confidence is below 0.8, I treat it as the model itself thinking the result is uncertain, and I won't use that result.

For example, the confidence reward can be set as:

$R_{confidence reward} = -(c - q)^2$

$R_{confidence reward} = -(c - q) * (c - q)$

- $c$: the student's own score for its own answer (confidence)
- q: whether the answer is correct
- the first $(c - q)$: the teacher's score of the student's score (no teacher model)
- the second $(c - q)$: the director's score of the teacher (no director model either — so create one)

| **Scenario** | **Model Behavior** | **Expected Result** | **Reward Function Design** | **Reward Analysis** |
| --- | --- | --- | --- | --- |
| **A** | **Classification wrong** | **Confidence high** | **Heavy penalty** (Very Low Reward) | -(0.9 - 0)\^2 = -0.81 /  / when c=0.9, R=-0.81. |
| **B** | **Classification wrong** | **Confidence low** | **Light penalty/neutral** (Higher Reward) | -(0.1 - 0)\^2 = -0.01 / when c=0.1, R=-0.01. This is a "good failure." |
| **C** | **Classification correct** | **Confidence low** | **Light penalty** (Low Reward) | -(0.6 - 1)\^2 = -(0.4)\^2 = -0.16 /  / when c=0.6, R=-0.16. |
| **D** | **Classification correct** | **Confidence high** | **High reward** (Max Reward) | -(0.9 - 1)\^2 = -(0.1)\^2 = -0.01 /  / when c=0.9, R=-0.01 (close to 0), which is optimal |

## Learning from Prompt Structure

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

## Reflections on Automated Verification

When working on intelligent driving, could we borrow the idea from this paper and add a model as a verifier?

- During reinforcement, feed the verifier's feedback into the prompt as a correction signal for the model
- During automated testing, the verifier's feedback can serve as a score for the overall steps or as the judgment for the final step
  - Questions:
    - How to train the verifier
      - What is the input data for verification: images? page descriptions?
      - How to annotate the verification dataset — i.e., what standard should the comments follow, and how should it be defined
    - Do we need a supervisory model to provide further supervision
    - How to choose the model
