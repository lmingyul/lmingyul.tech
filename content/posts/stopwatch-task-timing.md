---
title: "使用 StopWatch 统计任务执行耗时"
slug: "stopwatch-task-timing"
publishedAt: "2024-01-03T03:26:00.000Z"
categories:
  - "编程语言"
  - "Java"
description: "使用 Spring 的 StopWatch 工具类可以优雅地统计任务执行时间，支持多任务记录和格式化输出，适合性能监控和分析，但每个实例只能同时处理一个任务。"
cover: "/uploads/covers/stopwatch-task-timing.png"
readingTime: 7
mood: "neutral"
draft: false
id: "1fbb44d3-5440-8074-b6a3-f08c3de06489"
---
## 通常做法

```java
long startTime = System.currentTimeMillis();
long totalTime = System.currentTimeMillis() - startTime;
log.info("耗时：{} ms", totalTime)

```

这样做法好处是：简单快捷、容易理解，但是缺点是不够优雅，如果要精细的统计每个任务场景的执行时间，那么不同任务执行前都需要生成一个 startTime ，最后会导致代码里面到处都是 startTime

## StopWatch 是什么

> 是 Spring 框架提供的一个工具库，是 org.springframework.util 这个包下的一个工具类，用于记录执行时间，可以用于任务分阶段的时间记录，还支持一个比较好看的打印格式

## 使用案例

### 统计总耗时

```java
StopWatch sw = new StopWatch();
sw.start();
Thread.sleep(1000);
sw.stop();
System.out.println("总耗时：" + sw.getTotalTimeMillis() + " ms");

```

```java
总耗时：1000 ms

```

### 获取最后一个任务的执行耗时

```java
StopWatch sw = new StopWatch();

sw.start("A Task");
Thread.sleep(1000);
sw.stop();

sw.start("B Task");
Thread.sleep(2000);
sw.stop();

System.out.println("最后一个任务："+ sw.getLastTaskName() + "， 总耗时：" + sw.getLastTaskTimeMillis() + " ms");

```

```java
最后一个任务：B Task， 总耗时：2000 ms

```

### 以好看的格式打印出所有任务的耗时及占比

```java
@SneakyThrows
private static void getPrettyTime() {
  StopWatch sw = new StopWatch("Task");

  sw.start("A Task");
  aTask();
  sw.stop();

  sw.start("B Task");
  bTask();
  sw.stop();

  sw.start("C Task");
  cTask();
  sw.stop();

  System.out.println(sw.prettyPrint());
}

@SneakyThrows
private static void aTask() {
  Thread.sleep(1000);
}

@SneakyThrows
private static void bTask() {
  Thread.sleep(500);
}

@SneakyThrows
private static void cTask() {
  Thread.sleep(300);
}
```

```java
StopWatch 'Task': running time = 1000764700 ns
---------------------------------------------
ns         %     Task name
---------------------------------------------
500502500  050%  A Task
199905700  020%  B Task
300356500  030%  C Task
```

### 获取每个任务执行的情况和任务执行流向

```java
Arrays.stream(sw.getTaskInfo()).forEach(e -> {
    System.out.println("e.getTaskName() = " + e.getTaskName());
    System.out.println("e.getTimeMillis() = " + e.getTimeMillis() + " ms");
    System.out.println("---------------------------");
});
```

```java
e.getTaskName() = A Task
e.getTimeMillis() = 1000 ms
---------------------------
e.getTaskName() = B Task
e.getTimeMillis() = 500 ms
---------------------------
e.getTaskName() = C Task
e.getTimeMillis() = 300 ms
---------------------------
```

### 其他更多用法

- shortSummary() ：返回简短的总耗时描述—— StopWatch 'Task': running time = 1000818600 ns
- getTaskCount()：返回此次任务的总数量

## 实现原理

维护了一个任务链表，然后在任务开始的时候记一个时间，结束的时候记一个时间，最后的时候两个相减。

![](/uploads/posts/stopwatch-task-timing/01-image.png)

## 优缺点

### 优点

- spring 框架自带的工具类，可直接使用
- 代码实现比较简单，使用也比较更简单，只需要关注每段需要统计代码的开始和结束即可，不用关心是哪个时间减哪个时间。
- 可以进行统一归纳，展示每项任务耗时与占用总时间的百分比，展示结果更直观
- 性能消耗相对较小，并且最大程度的保证了 start 与 stop 之间的时间记录的准确性
- 可在每次在 start 时直接指定任务名字，从而更加直观的显示记录结果

### 缺点

- 一个 StopWatch 实例一次只能开启一个 task，不能同时 start 多个 task，并且在该 task 未 stop 之前不能 start 一个新的 task，必须在该 task stop 之后才能开启新的 task，若要一次开启多个，需要 new 不同的 StopWatch 实例

## 扩展用法

### 自定义拦截器

在 Controller 层将 `StopWatch` 放入 `ThreadLocal` 当中，确保每个线程都有自己的 StopWatch 实例。在整条 Service 调用链中，使用同一个 `StopWatch` 对象记录方法调用的耗时和路线。最后在结束时生成方法的耗时占比，以定位性能瓶颈。

```java
package com.mayabot.cmbmobile.component;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.StopWatch;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Objects;

/**
 * @author 80372617
 * @date 2023/12/29
 */
public class StopwatchInterceptor implements HandlerInterceptor {

    private static final Logger LOG = LoggerFactory.getLogger(StopwatchInterceptor.class);

    private static final ThreadLocal<StopWatch> stopWatchThreadLocal = ThreadLocal.withInitial(StopWatch::new);

    @Override
    public boolean preHandle(final HttpServletRequest request, final HttpServletResponse response, final Object handler) throws Exception {
        StopWatch stopWatch = getStopWatch();
        if (!stopWatch.isRunning()) {
            stopWatch.start();
        }
        LOG.info("[StopwatchInterceptor#preHandle] 开始统计 {} 接口调用耗时", request.getRequestURI());
        stopWatch.stop();
        return true;
    }

    @Override
    public void postHandle(final HttpServletRequest request, final HttpServletResponse response, final Object handler,
                           final ModelAndView modelAndView) throws Exception {
        StopWatch stopWatch = getStopWatch();
        if (!stopWatch.isRunning()) {
            long time = stopWatch.getTotalTimeMillis();
            final String requestURI = request.getRequestURI();
            LOG.info("[StopwatchInterceptor#postHandle] {} 接口调用耗时：{} ms", requestURI, time);
            LOG.info(stopWatch.prettyPrint());
        }
    }

    @Override
    public void afterCompletion(final HttpServletRequest request, final HttpServletResponse response, final Object handler, final Exception ex)
            throws Exception {
        // 释放资源
        reset();
    }

    public static StopWatch getStopWatch() {
        StopWatch stopWatch = stopWatchThreadLocal.get();
        if (Objects.isNull(stopWatch)) {
            stopWatch = new StopWatch();
            stopWatchThreadLocal.set(stopWatch);
        }
        return stopWatch;
    }

    public void reset() {
        stopWatchThreadLocal.remove();
    }
}

```

```java
package com.mayabot.cmbmobile.component;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * @author 80372617
 * @date 2023/12/29
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(final InterceptorRegistry registry) {
        registry.addInterceptor(new StopwatchInterceptor()).addPathPatterns("/**");
    }
}

```

```java
final StopWatch sw = StopwatchInterceptor.getStopWatch();
sw.start("scene Task");
boolean hasRecommendCard = processSceneTemplateData(keyword, mixSearchParm, re, extra, recommendDTO);
sw.stop();
```

```java
20231229 10:35:27 [Root-INFO] [StopwatchInterceptor#preHandle] 开始统计 /mix/search 接口调用耗时
20231229 10:35:28 [Root-INFO] TaskName: scene Task, CostTime: 4 ms
20231229 10:35:28 [Root-INFO] ---------------------------
20231229 10:35:28 [Root-INFO] TaskName: Main Task, CostTime: 629 ms
20231229 10:35:28 [Root-INFO] ---------------------------
20231229 10:35:28 [Root-INFO] TaskName: ReviewCard Task, CostTime: 36 ms
20231229 10:35:28 [Root-INFO] [StopwatchInterceptor#postHandle] /mix/search 接口调用耗时：670 ms
20231229 10:35:33 [Root-INFO] StopWatch '': running time = 471315299 ns
---------------------------------------------
ns         %     Task name
---------------------------------------------
000117400  000%
005368099  001%  scene Task
424502300  090%  Main Task
041327500  009%  ReviewCard Task
```

### 自定义注解

```java
package com.mayabot.cmbmobile.advice;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Timed {
}

```

```java
package com.mayabot.cmbmobile.component;

import org.springframework.util.StopWatch;

import java.util.Objects;

/**
 * @author 80372617
 * @date 2023/12/29
 */
public class StopWatchManager {

    private static final ThreadLocal<StopWatch> stopWatchThreadLocal = ThreadLocal.withInitial(StopWatch::new);

    public static void start() {
        StopWatch stopWatch = getStopWatch();
        if (!stopWatch.isRunning()) {
            stopWatch.start();
        }
    }

    public static void stop() {
        StopWatch stopWatch = getStopWatch();
        if (stopWatch.isRunning()) {
            stopWatch.stop();
        }
    }

    public static StopWatch getStopWatch() {
        StopWatch stopWatch = stopWatchThreadLocal.get();
        if (Objects.isNull(stopWatch)) {
            stopWatch = new StopWatch();
            stopWatchThreadLocal.set(stopWatch);
        }
        return stopWatch;
    }

    public static void reset() {
        stopWatchThreadLocal.remove();
    }
}
```

```java
package com.mayabot.cmbmobile.advice;

import com.mayabot.cmbmobile.component.StopWatchManager;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StopWatch;

/**
 * @author 80372617
 * @date 2023/12/29
 */
@Aspect
@Component
public class TimeMethodAspect {

    private static final Logger LOG = LoggerFactory.getLogger(TimeMethodAspect.class);

    @Pointcut("@annotation(com.mayabot.cmbmobile.advice.Timed)")
    public void pointcut() {
    }

    @Around("pointcut()")
    public Object measureExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        final String name = joinPoint.getSignature().getName();
        StopWatchManager.start();
        LOG.info("开始统计 {} 接口调用耗时", name);
        StopWatchManager.stop();
        try {
            return joinPoint.proceed();
        } finally {
            final StopWatch stopWatch = StopWatchManager.getStopWatch();
            if (stopWatch.isRunning()) {
                StopWatchManager.stop();
            }
            LOG.info("[TimeMethodAspect#measureExecutionTime] {} 接口调用耗时：{} ms", name, stopWatch.getTotalTimeMillis());
            LOG.info(stopWatch.prettyPrint());
            StopWatchManager.reset();
        }
    }
}
```

```java
@PostMapping(value = "/mix/search")
@Timed
public JSONObject search(@RequestBody MixSearchParm mixSearchParm) {
    return mixSearchService.mixSearch(mixSearchParm);
}
```

```java
final StopWatch sw = StopWatchManager.getStopWatch();
sw.start("scene Task");
boolean hasRecommendCard = processSceneTemplateData(keyword, mixSearchParm, re, extra, recommendDTO);
sw.stop();
```

```java
20231229 10:35:27 [Root-INFO] [StopwatchInterceptor#preHandle] 开始统计 /mix/search 接口调用耗时
20231229 10:35:28 [Root-INFO] TaskName: scene Task, CostTime: 4 ms
20231229 10:35:28 [Root-INFO] ---------------------------
20231229 10:35:28 [Root-INFO] TaskName: Main Task, CostTime: 629 ms
20231229 10:35:28 [Root-INFO] ---------------------------
20231229 10:35:28 [Root-INFO] TaskName: ReviewCard Task, CostTime: 36 ms
20231229 10:35:28 [Root-INFO] [StopwatchInterceptor#postHandle] /mix/search 接口调用耗时：670 ms
20231229 10:35:33 [Root-INFO] StopWatch '': running time = 471315299 ns
---------------------------------------------
ns         %     Task name
---------------------------------------------
000117400  000%
005368099  001%  scene Task
424502300  090%  Main Task
041327500  009%  ReviewCard Task
```
