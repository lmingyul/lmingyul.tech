---
title: "这 2 个对象一样吗"
slug: "java-equals-and-hashcode"
publishedAt: "2022-09-11T05:21:00.000Z"
categories:
  - "编程语言"
  - "Java"
description: "在Java中，判断两个对象是否相等可以使用==、equals()和hashCode()方法。==比较对象地址，equals()默认行为与==相同，重写后可比较对象内容。hashCode()用于提高集合操作效率，重写equals()时必须同时重写hashCode()以确保一致性。"
cover: "/uploads/covers/java-equals-and-hashcode.png"
readingTime: 10
mood: "neutral"
draft: false
id: "1fab44d3-5440-8068-bd88-f3c67814ac60"
---
> 在写业务代码的时候我们经常需要判断 2 个 Java 对象是否一样，常用判断对象是否相等可以使用 == 、equals、hashcode 这 3 个方法，本文试图搞清楚这三者的用法。

# 关系操作符`==`

使用 `==` 判断 2 个对象是否相等，判断的是这 2 个对象的地址是否相等。

示例代码：

```java
public class Test {

    public static void main(String[] args) {
        Person jack = new Person();
        Person tom = new Person();
        Person bob = jack;

        System.out.println("jack == tom ? " + (jack == tom));
        System.out.println("jack == bob ? " + (jack == bob));

        System.out.println("jack 地址: " + jack);
        System.out.println("tom 地址: " + tom);
        System.out.println("bob 地址: " + bob);
    }
}

```

输出结果：

```java
jack == tom ? false
jack == bob ? true

jack 地址: com.mingyu.javalearn.Person@1b2c6ec2
tom 地址: com.mingyu.javalearn.Person@4edde6e5
bob 地址: com.mingyu.javalearn.Person@1b2c6ec2

```

可以看出 jack 和 tom 虽然是 new 新建同一个 Person，但是新建出来的 Person 的对象地址是不一样的，所以 jack 是不等于 tom 的，可以从打印出来的地址结果看出 jack 与 bob 的对象地址一样，所以它俩比较的结果为 true

---

# `Equals()` 方法

> Java 中所有类都有一个父类是 Object 这个类，每个类都会继承这个类的方法，包括 equals() 方法

## Equals() 的本质

继承父类的方法后，子类可以对父类的同名方法进行重写，在没有对 `equals()` 方法重写的情况下，使用 `equals` 方法判断 2 个对象是否相等与使用 上面所述的用 `==` 操作符判断结果是一样的，**判断的都是这 2 个对象的地址是否相等**

示例代码：

```java
public class Test {

    public static void main(String[] args) {
        Person jack = new Person();
        Person tom = new Person();
        Person bob = jack;

        System.out.println("jack == tom ? " + (jack.equals(tom)));
        System.out.println("jack == bob ? " + (jack.equals(bob)));
    }
}

```

输出结果：

```java
jack == tom ? false
jack == bob ? true

```

其实看一下 equals() 方法的底层源码，其实使用的就是 `==` 对 2 个对象进行判断的

```java
public boolean equals(Object obj) {
      return (this == obj);
}

```

## 重写 equals() 方法

> 有时候我们不仅是要比较  2 个对象的地址是否一样，还需要判断这 2 个对象的内容是的一样，这个时候就需要对 equals 方法进行重写

可以对 `equals` 进行以下的重写

```java
@Override
public boolean equals(Object o) {
    // 检查是否为同一个对象的引用，如果是直接返回 true
    if (this == o) {
      return true;
    }
    // 检查是否是同一个类型，如果不是，直接返回 false
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    // 将 Object 对象进行转型
    Person person = (Person) o;
    // 判断对象内容是否相等，这里判断的是 name 的内容
    return Objects.equals(name, person.name);
}

```

这样对对象的判断就会不一样，这次判断的是对象的内容是否一样

```java
public class Test {

    public static void main(String[] args) {
        Person jack = new Person("jack");
        Person tom = new Person("jack");

        System.out.println("jack == tom ? " + (jack.equals(tom)));
        System.out.println("jack 地址: " + jack);
        System.out.println("tom 地址: " + tom);
    }
}

```

输出结果：

```java
jack == tom ? true
jack 地址: com.mingyu.javalearn.Person@1b2c6ec2
tom 地址: com.mingyu.javalearn.Person@4edde6e5

```

可以看出，jack 对象实例与 tom 对象实例虽然对象地址不一样，但是由于我们重写了 equals() 方法，使得比较的重点是对象的内容，所以比较的结果是 true

## 其他 equals() 重写写法

> 有许多其他封装好的工具包都对equals()进行了重写

### Apache Commons Lang 框架

```java
@Override
public boolean equals(Object o) {
    // 检查是否为同一个对象的引用，如果是直接返回 true
    if (this == o) {
      return true;
    }
    // 检查是否是同一个类型，如果不是，直接返回 false
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    // 将 Object 对象进行转型
    Person person = (Person) o;
    // 判断对象内容是否相等，这里判断的是 name 的内容
    return new EqualsBuilder().append(name, person.name).isEquals();
}

```

## equals 与 `==` 的区别

- 对于基本类型，`==` 判断两个值是否相等，基本类型没有 equals() 方法。
- 对于引用类型，`==` 判断两个变量是否引用的是同一个对象，而 equals() 没有重写时 ，和`==` 一样，重写之后判断引用的对象内容是否一样。

---

# `hashCode()`方法

> hashCode 也是 Object 类中定义的 方法，也可以比较两个对象是否相等，方法的返回值是调用对象的哈希值，这个哈希值的类型是 int

## hashCode() 的实现

我们看 Object 类的源码，可以发现 hashCode() 这个方法没有具体实现的，因为它是一个本地方法，是使用 C 系语言实现的，这个方法返回的哈希值是通过将对象的内存地址转换为整数得到的。

```java
public native int hashCode();
```

## 为什么需要 hashCode() 方法

上述说过的 equals 方法可以判断对象之间是否相等，为什么还需要 hashCode 方法呢？

在源码的注释中提到了这个原因:

- 支持这个方法是为了让哈希表受益，比如`java.util.HashMap`提供的哈希表

我们知道 HashSet 和 HashMap 等集合类在往集合中添加元素的时候，都会进行一个操作：**判断当前需要加到集合的对象是都已经存放在当前集合中**，这个时候就涉及到了对象之间的比较

而 HashSet 和 HashMap 都使用了 hashCode() 方法来计算对象应该存储的位置，因此要将对象添加到这些集合类之前，都需要求出将要存储 key 的hashCode 值

以下是 HashMap 源码中求 key 的 hashCode 值的方法

```java
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
```

那为什么要用 hashCode 方法，而不用 equals 方法呢?

原因是调用 equals 方法更加耗时

下面做了的实验

```java
public class Test {

    public static void main(String[] args) {
        // 开始时间
        long stime = System.currentTimeMillis();

        // 计算执行时间
        Person jack = new Person();
        Person tom = new Person();
        System.out.println("jack == tom ? " + (jack.equals(tom)));

        // 结束时间
        long etime = System.currentTimeMillis();
        System.out.printf("equals()执行时长：%d 毫秒.", (etime - stime));

        System.out.println();
        System.out.println("========== 明显的分割线 =========");

        // 开始时间
        stime = System.currentTimeMillis();

        // 计算执行时间
        Person mingyu = new Person();
        Person bob = new Person();
        System.out.println("mingyu == bob ? " + (mingyu.hashCode() == bob.hashCode()));

        // 结束时间
        etime = System.currentTimeMillis();
        System.out.printf("hashCode()执行时长：%d 毫秒.", (etime - stime));
    }
}

```

输出结果：

```java
jack == tom ? true
equals()执行时长：3 毫秒.
========== 明显的分割线 =========
mingyu == bob ? false
hashCode()执行时长：0 毫秒.

```

从输出结果可以看出调用 hashCode 方法几乎不耗时，因为本质上是比较的是 2 个 int 整型值，所以使用 hashCode 方法比较两个对象是很快的

## 为什么需要 equals() 方法

> 既然 hashCode 方法这么快，为什么还需要 equals 方法呢？这是因为 hashCode 方法具有局限性

局限性：**两个对象的 hashCode 值相等并不代表两个对象就相等**。

这是因为 hashCode 值是通过哈希函数计算出来的，一般的计算过程是：通过对数组长度进行取模，这个的数组可以是内存数组、也可是集合数组，由于长度是有限的，就很难避免每次计算出来的哈希值都不一样，就会产出"哈希冲突"，越糟糕的哈希算法越容易产生冲突。

哈希冲突对于比较两个对象是否相等是有影响的，即两个不同的对象哈希值也可能是一样的。

所以单单通过 hashCode 方法是不够的，还需要使用 equals 方法进行进一步的判断

HashSet 在添加元素到集合中的过程中就同时使用到这 2 个方法

- 添加元素的步骤：
  - 计算对象的 hashCode 值来判断对象加入的位置
  - 与其他已经加入的对象的 hashCode 值作比较
    - 如果没有一样的 hashCode 值，证明对象没有在当前集合中，因为**两个相等的对象的 hashCode 值一定是相等**
    - 如果存在一样的 hashCode 值，再通过 equals 方法进行进一步判断
  - 如果对象没有在当前集合中，就把对象存放进集合

这个过程通过先用 hashCode 方法进行判断，拦截了很多已经存在于集合中的元素调用 equals 方法的次数，提高程序执行的速度

# equals 与 hashCode 的关系

> 在《Effective Java》中写到：
>
> **覆盖 equals 时总要覆盖 hashCode**
>
> 在每个重写了 equals 方法的类中，都必须重写 hashCode 方法

如果只重写了 equals，没有重写 hashCode，当这个类的对象作为元素加到基于散列的集合（包括 HashMap、HashSet 和 Hashtable）中就会出现问题

示例代码：

```java
public class Test {

    public static void main(String[] args) {

        Person person1 = new Person("jack");
        Person person2 = new Person("jack");
        HashSet<Person> set = new HashSet<>();
        set.add(person1);
        set.add(person2);

        System.out.println("person1 equals person2: " + person1.equals(person2));
        System.out.println("person1.hashCode == person2.hashCode: " + (person1.hashCode() == person2.hashCode()));
        System.out.println("person1 hashCode: " + person1.hashCode());
        System.out.println("person2 hashCode: " + person2.hashCode());

        System.out.println("set 集合元素个数: " + set.size());
        for (Person person : set) {
            System.out.println("person: " + person.getName());
        }
    }
}

```

输出结果：

```java
person1 equals person2: true
person1.hashCode == person2.hashCode: false
person1 hashCode: 455896770
person2 hashCode: 1323165413
set 集合元素个数: 2
person: jack
person: jack

```

由于没有重写 hashCode 方法，每次创建对象的时候，都会调用 Object 类的 hashCode 方法，该方法会生成不一样的哈希值

而前面已经提到过，HashSet 判断一个对象是否存在当前集合，就是根据对象的哈希值判断的，所以会导致 equals 方法与 hashCode 对比的结果不一样，导致 HashSet 存在 2 个我们认为重复的对象

所以在重写 equals 方法时，一定要同时重写 hashCode 方法

**那该如何重写 hashCode方法？**

- 重写应该遵循的原则：
  - 如果对象的 equals 方法中比较时用到的信息没有被修改的话，那么多次调用这个对象的 hashCode 方法必须始终返回同一个值
  - 如果 2 个对象 equals 方法比较时相等的，那这 2 个对象的 hashCode 方法都返回同样的结果

```java
public class Person {

    private String name;

    @Override
    public boolean equals(Object o) {
        // 检查是否为同一个对象的引用，如果是直接返回 true
        if (this == o) {
            return true;
        }
        // 检查是否是同一个类型，如果不是，直接返回 false
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        // 将 Object 对象进行转型
        Person person = (Person) o;
        // 判断对象内容是否相等，这里判断的是 name 的内容
        return new EqualsBuilder().append(name, person.name).isEquals();
    }

    @Override
    public int hashCode() {
      // 返回的是对 name 这个字段取哈希值
        return Objects.hash(name);
    }
}

```

输出结果：

```java
person1 equals person2: true
person1.hashCode == person2.hashCode: true
person1 hashCode: 3254270
person2 hashCode: 3254270
set 集合元素个数: 1
person: jack

```

重写后两个对象的 hashCode 值一样，set 集合元素个数也是我们预想中的结果：1 个元素

---

# 参考资料

- [On Java 中文版 基础卷](https://book.douban.com/subject/35751619/)
- [深入理解Java核心技术：写给Java工程师的干货笔记（基础篇）](https://book.douban.com/subject/35879789/)
- [Effective Java中文版（第3版）](https://book.douban.com/subject/30412517/)
