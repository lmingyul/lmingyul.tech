---
title: "这次我真的能搞懂单例模式了吗？"
slug: "singleton-pattern-deep-dive"
publishedAt: "2023-07-26T10:45:00.000Z"
categories:
  - "编程语言"
  - "Java"
description: "单例模式确保一个类只有一个实例，适用于需要唯一标识的情况。实现方式包括饿汉式、懒汉式、双重检测、静态内部类和枚举，各有优缺点，选择应根据具体场景。"
cover: "/uploads/covers/singleton-pattern-deep-dive.png"
readingTime: 15
mood: "neutral"
draft: false
id: "1fbb44d3-5440-80c1-8fa8-fffbda310d99"
---
> 学习一下常见的设计模式，作为最”简单“入门的设计模式，先拿它练练手

# 灵魂拷问

## 什么是单例模式？

> 只允许只存在这个类的唯一一个实例对象

什么意思呢？平时我们在 Java 中新建一个对象实例一般是下面这样的

```java
// 类名 实例名称 = new 类名();
Demo demo = new Demo();

```

如果只能允许只有一个对象实例，即 `new Demo()` 只能被调用一次。  
那这个怎么保证呢？**使用单例模式！**

## 为什么需要单例模式

> 什么情况下我们需要只有一个对象的情况呢？

可以考虑一下这个问题，在一个复杂系统中每天都存在着大量的数据和消息需要处理，这个时候就需要对大量的数据和消息用一个唯一的标识做区分，这个时候我们的主要常见的实现手段：[UUID](https://www.ietf.org/rfc/rfc4122.txt)、自定义递增 ID 生成器等。

使用 UUID 生成的 ID 太长，不易于存储，其次我们是为了研究单例模式，所以就考虑一下自定义递增 ID 生成器怎么实现，可以看一下以下代码

```java
public static void main(String[] args) {
    IDGenerator idGenerator = new IDGenerator();
    long firstId = idGenerator.getId();
    long secondId = idGenerator.getId();
    printWithTreadName("firstId: " + firstId);
    printWithTreadName("secondId: " + secondId);
}

public static void printWithTreadName(String msg) {
    System.out.println("TreadName: " + Thread.currentThread().getName() + ", " + msg);
}

```

```java
public class IDGenerator {

    private AtomicLong id = new AtomicLong(0);

    public IDGenerator() {
        printWithTreadName("IDGenerator init");
        printWithTreadName("id hashcode: " + System.identityHashCode(id));
        printWithTreadName("id value: " + id.get());
    }

    public long getId() {
        return id.incrementAndGet();
    }
}

```

**输出结果：**

```java
TreadName: main, IDGenerator init
TreadName: main, id hashcode: 1808253012
TreadName: main, id value: 0
TreadName: main, firstId: 1
TreadName: main, secondId: 2

```

- AtomicLong 是 Java 中 `java.util.concurrent.atomic` 包下的一个类，它用于对 long 类型的值进行原子操作。AtomicLong 通过使用底层的无锁机制（在 Java 中称为 CAS，Compare and Swap），来实现对一个 long 类型的变量进行并发控制。这意味着 AtomicLong 中的多个线程可以在不使用 synchronized 或 Lock 的情况下安全地进行操作。
- incrementAndGet 是 AtomicLong 的一个方法，它对当前的值进行原子加 1 操作，并返回增加后的值。原子性保证了在多线程环境中，这个增加操作不会被其他线程中断。
- System.identityHashCode 会返回一个基于对象地址的（但不是实际的内存地址）整数哈希码，可以简单通过这个哈希值判断对象是否相等（不考虑哈希冲突的情况）

可以看到当 IDGenerator 这个类实例化的时候 AtomicLong 类也已经实例化完成，id 的值为 0，然后通过 IDGenerator 实例调用 2 次 `getId()` 方法，实现了 ID 自增唯一的目的。

但是现在如果这个 IDGenerator 被实例多次会发生什么现象呢？AtomicLong 类也会重新实例化多次，这样就会出现**重复的 ID**，这样这个 ID 生成器就做不到唯一性标识了！  
那什么情况下 IDGenerator 类会被实例多次呢？

- 不同人进行开发，不清楚 IDGenerator 的实际用法，直接实例化进行使用
  - 有些人说可以将这个 IDGenerator 类实例化定义为全局静态变量，这样直接使用这个静态变量就可以避免实例化多次 IDGenerator 啦
  - 这个只能靠程序员之间互相约定，这个太不靠谱了，有没有一些强制的手段只允许实例化一次呢？
- 在多线程的情况下，2 个线程同时执行一个方法，这个方法里面会调用生成 ID，这个时候就很容器出现 ID 重复的现象

下面就看一下多线程并发的情况

```java
public class Main {
    public static void main(String[] args) {
        testWithoutSingleton();
    }

    public static void testWithoutSingleton() {
        // 创建 2 个线程
        DemoTread t1 = new DemoTread();
        DemoTread t2 = new DemoTread();
        t1.start();
        t2.start();
    }

    public static void doSomething() {
        printWithTreadName("generator id: " + new IDGenerator().getId());
    }

    public static void printWithTreadName(String msg) {
        System.out.println("TreadName: " + Thread.currentThread().getName() + ", " + msg);
    }
}

```

```java

public class DemoTread extends Thread {

    static int threadNo = 1;

    public DemoTread () {
        super("DemoTread-"  + threadNo++);
    }

    @Override
    public void run () {
        doSomething();
    }
}

```

先定义一个样例线程，线程执行的任务就是调用 Main 类中的 `doSomething()` 方法，而`doSomething()` 方法就是生成 ID  
**输出结果:**

```java
TreadName: DemoTread-2, IDGenerator init
TreadName: DemoTread-1, IDGenerator init
TreadName: DemoTread-2, id hashcode: 359513719
TreadName: DemoTread-1, id hashcode: 2107584424
TreadName: DemoTread-1, id value: 0
TreadName: DemoTread-2, id value: 0
TreadName: DemoTread-1, generator id: 1
TreadName: DemoTread-2, generator id: 1

```

从输出结果可以看出：

- hashcode不同，代表 2 个线程分别生成了 2 个不同的 AtomicLong 类对象
- 生成 id 重复一样  
2 个不同的线程分别生成 2 次 IDGenerator 类对象 -> 导致生成了 2 个不同的 AtomicLong 类对象 -> 出现了生成 id 重复一样的现象

那单例模式到底是怎么做到只生成一个实例给不同的线程使用的呢？

## 单例模式怎么实现？

首先需要先修改 IDGenerator 类

```java
public class IDGenerator {

    private AtomicLong id = new AtomicLong(0);
    // 初始化唯一的 IDGenerator 实例对象
    private static final IDGenerator instance = new IDGenerator();
    // 构造函数改为 private 私有
    private IDGenerator() {
        printWithTreadName("IDGenerator init");
        printWithTreadName("id hashcode: " + System.identityHashCode(id));
        printWithTreadName("id value: " + id.get());
    }
    // 新增一个公共可以访问的方法，返回唯一的 IDGenerator 实例对象
    public static IDGenerator getInstance() {
        return instance;
    }

    public long getId() {
        return id.incrementAndGet();
    }
}

```

修改点：

- 定义一个静态常量，将 IDGenerator 实例对象赋给这个静态常量，注意是常量，有 `final` 修饰的
- 将 IDGenerator 的构造函数改为 private 私有
- 新增一个公共可以访问的方法，返回唯一的 IDGenerator 实例对象

然后修改一下外部访问调用生成 ID 的方式

```java
public static void doSomething() {
    printWithTreadName("generator id: " + IDGenerator.getInstance().getId());
}

```

**输出结果：**

```java
TreadName: DemoTread-2, IDGenerator init
TreadName: DemoTread-2, id hashcode: 359513719
TreadName: DemoTread-2, id value: 0
TreadName: DemoTread-2, generator id: 1
TreadName: DemoTread-1, generator id: 2

```

可以看出 IDGenerator 类只被线程 DemoTread-2 初始化了一次，而且 2 个线程生成 ID 没有出现重复了

这个就是单例模式起的作用：

1. 静态常量 instance 只会在 IDGenerator 类加载的时候进行初始化，而且只会初始化一次，不能被修改，这保证了全局只能有一个 IDGenerator 对象和 AtomicLong 对象
2. 将 IDGenerator 的构造函数改为 private 私有是不让这个类之外的其他类访问，拒绝了其他外部类主动实例化 IDGenerator 对象的情况
3. 只提供一个唯一公共访问的静态方法给外部调用返回唯一的 IDGenerator 对象

简单来说就是：***我不让你来创建了，我创建好唯一的一个对象，你用我这个就可以啦***

---

# 不同实现单例的方式

> 实现单例的方式有很多种，包括：饿汉式、懒汉式、双重检测、静态内部类、枚举

## 饿汉式

其实上面实现就是饿汉式，为什么叫饿汉式呢？  
*那是因为对象是在类加载的时候就被创建好了，没等到对象需要用的时候就初始化好了，看起来很迫不及待，所以称为”**饿汉式**“*

饿汉式的经典写法：

```java
public class IDGenerator {

    private static final IDGenerator instance = new IDGenerator();

    private IDGenerator() {}

    public static IDGenerator getInstance() {
        return instance;
    }
}

```

### 饿汉式的优点

- **线程安全**：对象在类加载的时候就完成了创建，不存在其他线程能创建多个对象，线程安全是由JVM来保证的，无需额外处理多线程同步问题。
- **代码简单**

### 饿汉式的缺点

- **资源浪费**：对象在类加载的时候就创建好了，那如果我后续程序运行过程中不用了，就会造成资源的浪费
- **引起类加载变慢**：如果这个类初始化操作复杂，那可能会增加类加载耗费的时间，影响程序启动速度
- **无法处理突发的异常**：如果在类加载过程中，构造方法执行抛异常了，这个异常就没法进行捕获处理

既然提前初始化有问题，那有没有什么方法可以延迟加载呢？  
有的，懒汉式。

---

## 懒汉式

> 跟饿汉式反着来，要等到这个对象要被用到的时候再进行初始化，那怎么做呢？

```java
public class IDGenerator {

    private AtomicLong id = new AtomicLong(0);

    private static IDGenerator instance;

    private IDGenerator() {
        Instant instant = Instant.ofEpochMilli(System.currentTimeMillis());
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
                .withZone(ZoneId.systemDefault());
        String formattedTime = formatter.format(instant);
        printWithTreadName("当前时间：" + formattedTime);
        printWithTreadName("IDGenerator init");
        printWithTreadName("id hashcode: " + System.identityHashCode(id));
        printWithTreadName("id value: " + id.get());
    }

    public static IDGenerator getInstance() {
        if (instance == null) {
            instance = new IDGenerator();
        }
        return instance;
    }

    public long getId() {
        return id.incrementAndGet();
    }
}

```

修改点：

- 将静态常量 instance 改为静态变量，这个变量的初始化改到 `getInstance()` 方法中
- `getInstance()`方法加上 null 判断，如果 instance 变量为空则进行实例化  
**输出结果**：

```java
TreadName: DemoTread-2, 当前时间：2023-07-25 21:28:09
TreadName: DemoTread-2, IDGenerator init
TreadName: DemoTread-1, 当前时间：2023-07-25 21:28:09
TreadName: DemoTread-1, IDGenerator init
TreadName: DemoTread-1, id hashcode: 1457402119
TreadName: DemoTread-1, id value: 0
TreadName: DemoTread-2, id hashcode: 822717100
TreadName: DemoTread-2, id value: 0
TreadName: DemoTread-2, generator id: 1
TreadName: DemoTread-1, generator id: 1

```

**哎，为什么会生成出 2 个实例对象出来的呢？**  
其实以上的代码是有点问题的，看上起我们加了是否为 null 的判断，防止会多次实例化 IDGenerator 对象，但是在多线程并发的情况下，如果一个线程正在初始化 IDGenerator 这个对象的同时，还没完成初始化，另一个线程也调用了 `getInstance()` 方法，就会导致 IDGenerator 对象初始化多次。  
从输出结果我们可以看到 DemoTread-2 和 DemoTread-1 线程都在 `2023-07-25 21:28:09`  开始初始化  IDGenerator 对象，这就会导致发生出错。

那怎么避免呢？在 `getInstance()` 方法上加 `synchronized` 关键字，保证同一时刻只有一个线程访问这个方法。

```java
public static synchronized IDGenerator getInstance() {
    if (instance == null) {
        instance = new IDGenerator();
    }
    return instance;
}

```

### 懒汉式的优点

- 可以做到延迟加载，需要才创建，避免了不必要的资源浪费

### 懒汉式的缺点

- 需要加上Synchronized关键字来确保线程安全，这就导致了每次访问时都需要进行同步，频繁加锁、释放锁及并发度低等问题，会影响性能。

那能不能有两全其美的方法，既要有延迟加载，又没有性能问题呢？有，双重检测！

---

## 双重检测

直接看代码：

```java
public static IDGenerator getInstance() {
    if (instance == null) {
        synchronized (IDGenerator.class) {
            if (instance == null) {
                instance = new IDGenerator();
            }
        }
    }
    return instance;
}

```

修改点：将修饰方法的 synchronized 改为修改类，实现一个类级别的锁

这个方法怎么做到不会执行多次的 synchronized 的线程同步操作？

- 首先，线程进入到 `getInstance()`方法内部，会检测当前状态：只有 2 种状态，IDGenerator 已经实例化完了（当前 instance 不为 null）、IDGenerator 还没实例化（当前 instance 为 null）
  - 如果 instance 为 null，则进行一次 synchronized 同步初始化操作，实例化对象
  - 如果 instance 不为 null，则直接返回，则不进行 synchronized 同步初始化操作  
这样就把懒汉式每次调用都会进行同步初始化操作的问题解决掉了

第一层 null 检测知道是干什么用的，那第 2 层 null 判断是干嘛用的呢？去掉行不行呢，试一下。我们将代码改为下面的

```java
public static IDGenerator getInstance() {
    if (instance == null) {
        printWithTreadName("进入第一层 null 判断");
        synchronized (IDGenerator.class) {
            printWithTreadName("进入 synchronized 代码块");
            instance = new IDGenerator();
        }
    }
    return instance;
}

```

**输出结果**：

```java
TreadName: DemoTread-2, 进入第一层 null 判断
TreadName: DemoTread-1, 进入第一层 null 判断

TreadName: DemoTread-2, 进入 synchronized 代码块
TreadName: DemoTread-2, 当前时间：2023-07-26 00:48:24
TreadName: DemoTread-2, IDGenerator init
TreadName: DemoTread-2, id hashcode: 26262847
TreadName: DemoTread-2, id value: 0
TreadName: DemoTread-2, generator id: 1

TreadName: DemoTread-1, 进入 synchronized 代码块
TreadName: DemoTread-1, 当前时间：2023-07-26 00:48:24
TreadName: DemoTread-1, IDGenerator init
TreadName: DemoTread-1, id hashcode: 1846522864
TreadName: DemoTread-1, id value: 0
TreadName: DemoTread-1, generator id: 1

```

出现异常现象了，去掉第 2 层判断之后对象初始化了 2 次。

- 可以看出 DemoTread-2 、DemoTread-1 线程几乎同时通过第一层 null 检测
- 然后 DemoTread-2 线程拿到了锁进行了一次对象的实例化
- 那这个时候 DemoTread-1 线程在干嘛呢，它在等待 DemoTread-2 释放锁，等 DemoTread-2 创建新的实例后，它会释放锁
- 接下来，线程 DemoTread-1 **也会获取到锁进行实例的创建！**

所以，第二次检查`if (instance == null)`是为了在当前线程获取到锁之后，再次确认 instance 是否仍然为 null。如果不为 null，则直接返回这个实例，避免了创建多个实例的情况。

好了，到这里是不是以为这个就是完美的单例模式实现了？  
还不是，上面的代码还有点问题。需要给静态变量 instance 加上一个 volatile 关键字，加这个有什么用呢？

```java
private static volatile IDGenerator instance;

```

保证这个静态变量的**可见性**和**禁止指令重排序**

- **可见性** ： volatile 关键字保证了一个线程写入的值，其他线程会立马看到，防止生成多次实例对象
- **禁止指令重排序**：JVM在优化代码时，可能将对象的初始化和实例的引用赋值这两个操作进行重排序，导致其他线程在读取instance时，看到的是一个已经非空对象但还没有完成初始化（执行构造函数中的其余代码逻辑），如果其余线程直接使用就会是使用不完整的对象，所以要加上 volatile 关键字来禁止指令重排序

---

## 静态内部类

双重检测的方法是能解决问题，但是基于加同步操作，又要加判断，有点复杂，有没有代码实现起来简单一点的呢？有，使用静态内部类  
具体实现的方式是：在需要实现单例的类中额外定义另一个静态内部类

```java
public class IDGenerator {

    private AtomicLong id = new AtomicLong(0);

    private static class SingletonHolder {
        private static final IDGenerator INSTANCE = new IDGenerator();
    }

    private IDGenerator() {
        printWithTreadName("IDGenerator init");
        printWithTreadName("id hashcode: " + System.identityHashCode(id));
        printWithTreadName("id value: " + id.get());
    }

    public static IDGenerator getInstance() {
        return SingletonHolder.INSTANCE;
    }

    public long getId() {
        return id.incrementAndGet();
    }
}

```

这又是怎么保证实现单例的呢？

- 基于静态内部类的特性，只会被加载一次，这能保证 INSTANCE 只会被初始化一次
- 其次也保证了懒加载，因为只有在调用 `getInstance()` 方法的时候才会被加载  
那会不会有线程安全的问题呢，不会，因为静态内部类的加载由 JVM 实现的，所以也是线程安全的

使用静态内部类的方式实现单例，既高效、避免了不必要的线程同步操作，又实现了懒加载，还保证了线程安全，完美！  
唯一美中不足的是它需要多定义一个类，那还有没有更简单的呢？有的，枚举！

---

## 枚举

直接看代码

```java
public enum IdGenerator {
  INSTANCE;
  private AtomicLong id = new AtomicLong(0);

  public long getId() {
    return id.incrementAndGet();
  }
}

```

你看，是不是代码很简单，为什么说枚举可以实现单例呢  
因为 Java 在处理枚举类型的时候采用了类加载的机制来保证枚举类的唯一和线程安全

- 线程安全：Java的类加载过程中，在加载一个类的时候，Java虚拟机会对这个类加锁，防止其他线程同时加载，只有在类加载完成之后，这个锁才会被释放，保证了线程安全
- 唯一：枚举类型的实例是在枚举类型加载的时候一次性全部创建的，后续不会再改变，保证了唯一性

但是这个实现看起来简单，它也有不完美的地方，就是它不支持懒加载，因为它都是在类加载阶段把所有的类都实例化完了，无法做到"随叫随到"。

所以，有这么多种实现方式，应该使用哪一种最好呢？  
**没有最好的，最有最适合的，不同场景具体分析**

---

# 参考资料

[🔗 https://time.geekbang.org/column/intro/100039001?tab=catalog](https://time.geekbang.org/column/intro/100039001?tab=catalog)

[🔗 https://book.douban.com/subject/2243615/](https://book.douban.com/subject/2243615/)
