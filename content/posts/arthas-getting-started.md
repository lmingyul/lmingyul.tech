---
title: "用好系列-arthas之入门篇"
slug: "arthas-getting-started"
publishedAt: "2023-05-10T16:34:00.000Z"
categories:
  - "工具"
  - "Java"
  - "用好系列"
description: "Arthas 是一款用于 Java 应用的在线监控诊断工具，支持实时查看应用状态和方法调用信息，提升故障排查效率。使用时需在支持 JDK 6 及以上的环境中，通过命令行交互进行操作，提供多种功能如监控方法执行、查看线程信息等。"
cover: "/uploads/covers/arthas-getting-started.png"
readingTime: 10
mood: "neutral"
draft: false
id: "1fab44d3-5440-8047-a0aa-ec0176a247d8"
---
在公司定位故障问题的时候，一般我们会采用在代码中关键代码中打印日志，然后采用在环境容器内换 Jar 包的形式进行问题定位分析。但是这样定位的问题流程很麻烦：

- 首先你要确保你打印日志的全面性，万一某个关键信息没有打印出来你就需要重新打印、换包、重启服务，一套流程下来浪费很多时间；
- 其次不是所有环境都运行换包和重启服务

所以最近我一直在找更好的故障问题定位方法，然后我发现阿里开源的 Java 服务诊断工具好像还不错，它可以查看方法调用入参、返回值，被调用的调用路径、调用耗时、方法调用次数、成功次数、失败次数等这些都可以记录，所以学习记录一下这个工具。

## 什么是 arthas

> 官方介绍：  
Arthas 是一款线上监控诊断产品，通过全局视角实时查看应用 load、内存、gc、线程的状态信息，并能在不修改应用代码的情况下，对业务问题进行诊断，包括查看方法调用的出入参、异常，监测方法执行耗时，类加载信息等，大大提升线上问题排查效率。

### 运行环境

- 只支持 JDK 6 + 的环境
- 由 Java 编写的，支持跨平台：支持 Linux（主要）、Mac、Windows

### 特性

- 采用命令行交互模式
- 提供 `Tab` 键自动补全的功能

---

## 初步使用

> 因为平时公司使用的环境主要是在容器中，所以以下就主要记录在 Linux 环境下如何使用这个工具

### 下载使用包

> 由于公司环境是内网环境，不支持直接访问连接 Github 进行安装包的下载，这里防止机器的网络问题无法下载，所以采用的是手动先从 Github 下载拷贝到服务容器内部的方式进行使用

在 Github 中下载完整的安装包，下载地址 ：`https://github.com/alibaba/arthas/releases`

![](/uploads/posts/arthas-getting-started/01-image.jpg)

### 容器环境下解压

![](/uploads/posts/arthas-getting-started/02-image.png)

```bash
# 创建一个专属于 arthas 的目录，因为解压后会产生很多文件
mkdir arthas

# 解压到刚才创建好的目录 arthas
unzip -d arthas arthas-bin.zip
```

### 卸载

> 定位完问题之后也要打扫好战场，那卸载这个工具的方法也记录一下

执行完以下三步即可卸载工具

```bash
rm -rf arthas

rm -rf ~/.arthas/

rm -rf ~/logs

```

### 运行

> 首先启动一个不会停止的 Java 程序服务，官方的安装包下就附带了一个给我们练手的 Jar 包：math-game.jar （不过一般我们的服务也是一直运行的，这里就使用官方的包作为记录）

```bash
# 启动这个 Java 程序，有自己的服务的可以跳过这一步
java -jar math-game.jar
```

然后再启动 arthas

```bash
# 1、启动
java -jar arthas-boot.jar

# 2、选择你要 attach 的 Java 服务, 输入进程号然后回车(这里只有一个进程，就是进程 1)
1

# 看到 arthas 标志就代表 arthas attach 上这个进程 1 服务
```

![](/uploads/posts/arthas-getting-started/03-image.jpg)

---

## 常用命令

### help

```bash
# 输入 help 可以获取到Arthas相关命令帮助信息。
[arthas@421554]$ help
 NAME         DESCRIPTION
 help         Display Arthas Help
 auth         Authenticates the current session
 keymap       Display all the available keymap for the specified connection.
 sc           Search all the classes loaded by JVM
 sm           Search the method of classes loaded by JVM
 classloader  Show classloader info
 jad          Decompile class
 getstatic    Show the static field of a class
 monitor      Monitor method execution statistics, e.g. total/success/failure count, average rt, fail rate, etc.
 stack        Display the stack trace for the specified class and method
 thread       Display thread info, thread stack
 trace        Trace the execution time of specified method invocation.
 watch        Display the input/output parameter, return object, and thrown exception of specified method invocation
 tt           Time Tunnel
 jvm          Display the target JVM information
 memory       Display jvm memory info.
 perfcounter  Display the perf counter information.
 ognl         Execute ognl expression.
 mc           Memory compiler, compiles java files into bytecode and class files in memory.
 redefine     Redefine classes. @see Instrumentation#redefineClasses(ClassDefinition...)
 retransform  Retransform classes. @see Instrumentation#retransformClasses(Class...)
 dashboard    Overview of target jvm's thread, memory, gc, vm, tomcat info.
 dump         Dump class byte array from JVM
 heapdump     Heap dump
 options      View and change various Arthas options
 cls          Clear the screen
 reset        Reset all the enhanced classes
 version      Display Arthas version
 session      Display current session information
 sysprop      Display and change the system properties.
 sysenv       Display the system env.
 vmoption     Display, and update the vm diagnostic options.
 logger       Print logger info, and update the logger level
 history      Display command history
 cat          Concatenate and print files
 base64       Encode and decode using Base64 representation
 echo         write arguments to the standard output
 pwd          Return working directory name
 mbean        Display the mbean information
 grep         grep command for pipes.
 tee          tee command for pipes.
 profiler     Async Profiler. https://github.com/jvm-profiling-tools/async-profiler
 vmtool       jvm tool
 stop         Stop/Shutdown Arthas server and exit the console.
 jfr          Java Flight Recorder Command

```

### dashboard

> 仪表板：显示当前系统的实时数据面板，平时没有这个 dashboard 的时候我们一般只能通过 Linux 自带的 top 命令查看系统运行的信息

输入`dashboard`，按回车/enter，会展示当前进程的信息，按 `ctrl+c `或输入 `q `可以中断执行。

![](/uploads/posts/arthas-getting-started/04-image.jpg)

显示的信息大概分为 3 大块：

- 最上面的是线程相关信息
- 中间区域是 JVM 内存相关的信息
- 最下面的是 Java 的运行环境信息  
具体每一列的信息可以参考[官方文档](https://arthas.aliyun.com/doc/dashboard.html#%E4%BD%BF%E7%94%A8%E5%8F%82%E8%80%83)

### thread

> 查看当前线程信息堆栈

### 当没有参数时，显示第一页线程的信息

```bash
thread
```

默认按照 CPU 增量时间降序排列，只显示第一页数据。

![](/uploads/posts/arthas-getting-started/05-image.png)

### 支持一键展示当前最忙的前 N 个线程并打印堆栈

```bash
thread -n N

```

### thread --all, 显示所有匹配的线程

```bash
# 显示所有匹配线程信息，有时需要获取全部 JVM 的线程数据进行分析。
thread --all
```

![](/uploads/posts/arthas-getting-started/06-image.jpg)

### thread id, 显示指定线程的运行堆栈

```bash
[arthas@421554]$ thread 1
"main" Id=1 TIMED_WAITING
    at java.lang.Thread.sleep(Native Method)
    at java.lang.Thread.sleep(Thread.java:342)
    at java.util.concurrent.TimeUnit.sleep(TimeUnit.java:386)
    at demo.MathGame.main(MathGame.java:17)

```

### thread -b, 找出当前阻塞其他线程的线程

```bash
thread -b

```

### watch

> 观察指定方法的调用情况  
可以观察到：  
方法返回值、入参、方法抛出的异常，还可以通过编写 OGNL 表达式进行对应变量的查看

### 观察函数调用返回时的参数、this 对象和返回值

```bash
# 观察维度的默认值是{params, target, returnObj}，下面观察的是函数调用返回时的参数、this 对象和返回值，-x 代表的是输出结果属性的遍历深度，即子对象的深度，深度最大值为 4

[arthas@421554]$ watch demo.MathGame primeFactors -x 2
Press Q or Ctrl+C to abort.
Affect(class count: 1 , method count: 1) cost in 28 ms, listenerId: 2
method=demo.MathGame.primeFactors location=AtExit
ts=2023-05-10 00:25:42; [cost=0.106133ms] result=@ArrayList[
    @Object[][
        @Integer[1],
    ],
    @MathGame[
        random=@Random[java.util.Random@254989ff],
        illegalArgumentCount=@Integer[85442],
    ],
    @ArrayList[
        @Integer[103],
        @Integer[1667],
    ],
]

# 将深度改为 3
[arthas@421554]$ watch demo.MathGame primeFactors -x 3
Press Q or Ctrl+C to abort.
Affect(class count: 1 , method count: 1) cost in 26 ms, listenerId: 3
method=demo.MathGame.primeFactors location=AtExit
ts=2023-05-10 00:26:17; [cost=0.34344ms] result=@ArrayList[
    @Object[][
        @Integer[1],
    ],
    @MathGame[
        random=@Random[
            serialVersionUID=@Long[3905348978240129619],
            seed=@AtomicLong[97774455668942],
            multiplier=@Long[25214903917],
            addend=@Long[11],
            mask=@Long[281474976710655],
            DOUBLE_UNIT=@Double[1.1102230246251565E-16],
            BadBound=@String[bound must be positive],
            BadRange=@String[bound must be greater than origin],
            BadSize=@String[size must be non-negative],
            seedUniquifier=@AtomicLong[-3282039941672302964],
            nextNextGaussian=@Double[0.0],
            haveNextNextGaussian=@Boolean[false],
            serialPersistentFields=@ObjectStreamField[][isEmpty=false;size=3],
            unsafe=@Unsafe[sun.misc.Unsafe@5d099f62],
            seedOffset=@Long[24],
        ],
        illegalArgumentCount=@Integer[85459],
    ],
    @ArrayList[
        @Integer[7],
        @Integer[21313],
    ],
]

```

### 同时观察函数调用前和函数返回后

```bash
[arthas@421554]$ watch demo.MathGame primeFactors "{params,target,returnObj}" -x 2 -b -s
Press Q or Ctrl+C to abort.
Affect(class count: 1 , method count: 1) cost in 39 ms, listenerId: 6
method=demo.MathGame.primeFactors location=AtEnter
ts=2023-05-10 00:30:00; [cost=0.036373ms] result=@ArrayList[
    @Object[][
        @Integer[163405],
    ],
    @MathGame[
        random=@Random[java.util.Random@254989ff],
        illegalArgumentCount=@Integer[85576],
    ],
    null,
]
method=demo.MathGame.primeFactors location=AtExit
ts=2023-05-10 00:30:00; [cost=1.4721136326180643E10ms] result=@ArrayList[
    @Object[][
        @Integer[1],
    ],
    @MathGame[
        random=@Random[java.util.Random@254989ff],
        illegalArgumentCount=@Integer[85576],
    ],
    @ArrayList[
        @Integer[5],
        @Integer[11],
        @Integer[2971],
    ],
]

```

### 观察当前对象中的属性

> 如果想查看函数运行前后，当前对象中的属性，可以使用target关键字，target 代表当前对象，然后使用target.field\_name访问当前对象的某个属性

```bash
[arthas@421554]$ watch demo.MathGame primeFactors 'target.illegalArgumentCount'
Press Q or Ctrl+C to abort.
Affect(class count: 1 , method count: 1) cost in 31 ms, listenerId: 7
method=demo.MathGame.primeFactors location=AtExit
ts=2023-05-10 00:33:50; [cost=0.081212ms] result=@Integer[85676]
method=demo.MathGame.primeFactors location=AtExceptionExit
ts=2023-05-10 00:33:51; [cost=0.102672ms] result=@Integer[85677]

```

### trace

> 方法内部调用路径，并输出路径上的每个节点上耗时，服务间调用时间过长时使用

```bash
[arthas@421554]$ trace demo.MathGame run
Press Q or Ctrl+C to abort.
Affect(class count: 1 , method count: 1) cost in 55 ms, listenerId: 9
`---ts=2023-05-11 00:24:38;thread_name=main;id=1;is_daemon=false;priority=5;TCCL=sun.misc.Launcher$AppClassLoader@74a14482
    `---[0.54719ms] demo.MathGame:run()
        +---[20.76% 0.113574ms ] demo.MathGame:primeFactors() #24
        `---[53.28% 0.29155ms ] demo.MathGame:print() #25

```

- 输出结果中 #24 表示 在源文件的第 24 行调用了 `primeFactors()` 函数
- 输出结果中 #25 表示 在源文件的第 25 行调用了 `print()` 函数

### stack

> 输出当前方法被调用的调用路径，当我们需要知道这个方法（被很多地方调用过）从那里开始执行了就可以使用这个命令（适合寻根溯源）

```bash
arthas@421554]$ stack demo.MathGame primeFactors
Press Q or Ctrl+C to abort.
Affect(class count: 1 , method count: 1) cost in 38 ms, listenerId: 12
ts=2023-05-11 00:32:43;thread_name=main;id=1;is_daemon=false;priority=5;TCCL=sun.misc.Launcher$AppClassLoader@74a14482
    @demo.MathGame.primeFactors()
        at demo.MathGame.run(MathGame.java:24)
        at demo.MathGame.main(MathGame.java:16)

```

### jad

> 反编译指定已加载类的源码，便于在线上理解业务逻辑，反编译出来的代码是带语法高亮的

```bash
jad demo.MathGame
```

![](/uploads/posts/arthas-getting-started/07-image.jpg)

---

## 参考资料

[🔗 https://arthas.aliyun.com/doc/](https://arthas.aliyun.com/doc/)
