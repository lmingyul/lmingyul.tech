---
title: "用好系列-ChatGPT之编程篇"
slug: "chatgpt-for-coding"
publishedAt: "2023-05-20T16:44:00.000Z"
categories:
  - "AI"
  - "GPT"
  - "用好系列"
description: "ChatGPT在编程中的应用包括代码理解、编写、调试和优化，能够生成测试数据和单元测试用例，并为学习新技术提供支持和解决方案。使用时可分段交流，避免完全依赖其输出。"
cover: "/uploads/covers/chatgpt-for-coding.jpg"
readingTime: 6
mood: "neutral"
draft: false
id: "1fab44d3-5440-80c9-921d-f2662427f78a"
---
> 最近公司在程序员群体中推行试用 ChatGPT，有些人试用后觉得这个东西会影响自己编码的思路，降低效率；有些人试用后真香，天天离不开，电脑屏幕一天到晚都是 ChatGPT 生成文字的画面。我也顺便记录一下ChatGPT在编程这个方面我的使用场景。

## 代码

### 代码理解

> 在日常写需求的时候很多时候并不是重头开始写的，很多情况下都是基于其他人之前写过的代码基础上进行修改，每个人写代码的风格及复杂度都是不一样的，这个时候使用 ChatGPT 帮我们先进行代码逻辑的基本梳理。

```txt
关键词：代码解释，举个例子：{代码片段}
```

**例子**

```java
@Aspect
@Slf4j
@Component
public class LogAspect {

    public final static String TRACE_LOG_ID = "traceId";

    /**
     * 切面表达式  此次切面为service的实现类
     */
    @Pointcut("execution(* org.lmingyu.projects.cs.*.service.*.impl.*.*(..))")
    public void logPointcut() {

    }

    /**
     * 打印日志
     *
     * @param pjp 入参 traceId从第一个参数获取
     * @return 结果
     * @throws Throwable 异常
     */
    @Around("logPointcut()")
    public Object doAround(ProceedingJoinPoint pjp) throws Throwable {
        String traceId = MDC.get(TRACE_LOG_ID);
        if (StringUtils.isBlank(traceId)) {
            if (pjp.getArgs().length > 0 && pjp.getArgs()[0] instanceof BaseReq) {
                BaseReq req = (BaseReq) pjp.getArgs()[0];
                if (StringUtils.isNotBlank(req.getTraceId())) {
                    traceId = req.getTraceId();
                }
            }
            if (StringUtils.isNotBlank(traceId)) {
                MDC.put(TRACE_LOG_ID, traceId);
            } else {
                MDC.put(TRACE_LOG_ID, UUID.randomUUID().toString());
            }
        }

        long startTime = System.currentTimeMillis();
        // 打印请求参数
        log.info("入参:{}", JSON.toJSONString(pjp.getArgs()));

        Object result = pjp.proceed();
        // 打印出参
        log.info("耗时{}ms,出参:{}", System.currentTimeMillis() - startTime, JSON.toJSONString(result));
        return result;
    }

}

```

ChatGPT 的回答：

![](/uploads/posts/chatgpt-for-coding/01-image.jpg)

---

### 编写代码

> 有时候对于用没有学过的语言写一段代码还是非常困难的，这个时候就可以让 ChatGPT 帮你写。又或者你有大概实现的思路，但是不知道从何下手，也可以让 ChatGPT 替你写个 demo

```txt
# 告诉 ChatGPT 用什么语言，语言版本号，加上给我完成的代码
关键词：请用 python3.7 编写一个贪吃蛇游戏，给我完整的代码
```

![](/uploads/posts/chatgpt-for-coding/02-image.png)

- 如果给的代码没写完，ChatGPT 存在字数限制
  - 可以给出：`请继续提供后面的代码`
- 如果给出的代码有问题，运行报错
  - 可以给出：`描述问题，请完善代码`
  - 如果代码过长每次生成代码会浪费时间或者浪费字数 token，也可以这样描述：`描述问题，请指出需要修改哪一行代码`

有时候 ChatGPT 给出的代码一直都有问题，这个时候就需要我们人为地去理解代码（也可以让 ChatGPT 给你解释代码的意思），发现代码中的问题，清楚地给 ChatGPT 指出问题所在，这个能提升解决问题的速度。

---

### 提升代码质量

**让 ChatGPT 帮你解决 BUG**

> 当你写完一个需求，有好几段核心逻辑，这个时候可以让 ChatGPT 帮你检查一下代码有没有 BUG，又或者线上出现问题了，你知道具体是某一段代码出现了问题，但是你不清楚问题所在，可以尝试去问一下 ChatGPT，让它帮你去检查，给你解决问题提供思路

```txt
关键词： `修复 BUG：{代码片段}`
```

![](/uploads/posts/chatgpt-for-coding/03-image.png)

- 有时候故障会显示哪一行发生了报错，也可以告诉 ChatGPT 这段代码的哪一行出现了问题，这样它可以更精确地定位发现解决问题。
- 也可以在代码中加上比较详细的zhu

**让 ChatGPT 帮你优化代码**

> ChatGPT 也可以帮你优化代码

```txt
关键词： `优化代码：{代码片段}`
```

![](/uploads/posts/chatgpt-for-coding/04-image.png)

SQL 也可以帮你优化

```txt
关键词：SQL 优化：{SQL 片段}
```

```sql
-- 优化前 sql
SELECT COUNT(*) AS 'order_count',
SUM(amount) AS 'total_sales',
SUM(amount) / COUNT(*) AS'avg_sales_per_order'
FROM sales
WHERE user_id = 123
AND created_at BETWEENDATE_SUB(NOW(),INTERVAL 7 DAY) AND NOW();

--- 优化后 sql
SET @start_date = DATE_SUB(NOW(), INTERVAL 7 DAY);

SELECT
  COUNT(*) AS 'order_count',
  SUM(amount) AS 'total_sales',
  SUM(amount) / COUNT(*) AS 'avg_sales_per_order'
FROM sales
WHERE
  user_id = 123 AND
  created_at BETWEEN @start_date AND NOW();
```

![](/uploads/posts/chatgpt-for-coding/05-image.png)

---

## 测试场景

### 生成测试数据

> 在平时我们开发完需要自己测试一下功能，这个时候就可以让 ChatGPT 帮我们生成测试的数据，有时候这些数据也可让 ChatGPT 生成对应数据的 python 代码

![](/uploads/posts/chatgpt-for-coding/06-image.png)

### 生成单元测试用例

当我们写完一段代码之后需要编写对应的单元测试用例来保证代码的稳定性和准确性，但是这个单元测试用例的编写往往是很费时间的，有时候甚至是比原先的逻辑更复杂，这个时候也可以让 ChatGPT 帮我们编写好代码的单元测试用例

```txt
关键词：生成对应的单元测试用例 {代码片段}

```

---

## 解决问题的助手

当拿到一个需求的时候，你的情况往往是没有思路、或者存在多种实现方式，这个时候不妨可以问一下 ChatGPT，让它给你一个解决方案，给你提供一个解决问题的思路

## 学习编程的陪伴

在学习一门新的技术的时候，往往不清楚如何入手，也可以让 ChatGPT 给你一个学习大纲，给你安排一个学习计划，把你遇到的问题抛给它，何乐而不为呢

## 使用小技巧

- 当你的对话会持续很长的一段，可以分段跟它交流，然后在每一段对话中加上 `如果你明白了，请回答明白`
- 当 ChatGPT 回答的已经基本全面了，只有小部分地方需要修改，建议这部分还是要自己动手，要是你较劲非要 ChatGPT 给你一个完全符合的答案，可能会得不偿失

最后，ChatGPT 并不是万能的，不要指望你一点都不懂的情况下能靠着它横扫一切，它就像
