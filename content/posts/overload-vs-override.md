---
title: "重载与重写"
slug: "overload-vs-override"
publishedAt: "2022-09-02T15:50:00.000Z"
categories:
  - "编程语言"
  - "Java"
description: "重载是指同名方法具有不同参数类型或顺序，常用于构造器。重写发生在父子类之间，子类方法覆盖父类同名方法，需遵循访问权限和返回类型的原则。使用@Override注解可检查重写合法性。"
cover: "/uploads/covers/overload-vs-override.png"
readingTime: 5
mood: "neutral"
draft: false
id: "1fab44d3-5440-8019-99dc-d1b7a2b43197"
---
# 重载

> 重载： 重载指的是方法的重载，重载的特征就是两个或多个方法具有同名。

## 经典的重载方法

重载多用于**构造器方法**，因为构造器作用是初始化构建对象的，构造器的名字必须与类名相同，这就形成经典的无参构造器与有参构造器这一对重载方法。

下面给出了示例：

```java
/**
 * @author mingyu
 */
public class User {

    private Integer id;

    private String userName;

  	//  无参构造器
    public User() {
    }

  	// 单个参数的构造器
    public User(Integer id) {
        this.id = id;
    }

  	// 全参构造器
    public User(Integer id, String userName) {
        this.id = id;
        this.userName = userName;
    }

}

```

## 为什么需要重载

我们都知道，Java 中最重要的一个概念就是：对象。那方法就是对象的一个个行为。一个对象在做相同名字的行为也可以是在做不同的事情，比如：小明打麻将。

字面意思：小明在和其他人一起玩麻将这类娱乐活动

其他意思：小明在 "打" 一个名字叫 "麻将" 的人

所以说，现实生活中语言当中的歧义也会出现在代码里。

还比如说，一个人在吃东西，我给他什么，他就在吃什么，我给他面条，他的行为就是吃苗条，我给他米饭，他就是在吃米饭，但是他的行为都叫**吃东西**。

总结：重载在代码当中是很必要的。

## 重载的区分

如果不同的方法都是一个名字，要怎么分辨它们呢？

分辨重载的重要原则：**每个重载的方法必须有独一无二的参数类型列表（即每个方法都有与其他同名方法不同的入参）**

那不同的参数列表，到底哪里不同呢？

### 参数类型的不同

```java
public class Test {

    public static void main(String[] args) {
      	// age 的类型不同可以区分两个同名的方法
        getPerson("mingyu", 18);
        getPerson("mingyu", "18");
    }

    static void getPerson(String name, int age) {
        System.out.println("name: " + name + ", " + "int_age: " + age);
    }

    static void getPerson(String name, String age) {
        System.out.println("name: " + name + ", " + "String_age: " + age);
    }

}

```

输出结果：

```java
name: mingyu, int_age: 18
name: mingyu, String_age: 18

```

### 参数顺序的不同

> 虽然参数顺序不同可以区分同名的重载方法，但是不推荐使用这种使用方式进行区分，因为这样写代码很难维护

```java
public class Test {

    public static void main(String[] args) {
        getPerson("mingyu", 18);
        getPerson(18,"mingyu");
    }

    static void getPerson(String name, int age) {
        System.out.println("name: " + name + ", " + "behind_age: " + age);
    }

    static void getPerson(int age, String name) {
        System.out.println("name: " + name + ", " + "first_age: " + age);
    }

}

```

输出结果：

```java
name: mingyu, behind_age: 18
name: mingyu, first_age: 18

```

### 返回值区分重载方法

除了参数列表的类型、顺序可以区分方法外，我们能否用方法的返回值来区分呢？

**答案是不行的**，下面给出了例子。

```java
 void f() {}

 int f() { return 1; }

```

当我们只想调用 `f()` 方法，但不需要该方法的返回值（如 `System.out.println` 方法），这时如果只是调用方法 `f()`，Java 是无法区分我们需要调用的是哪个方法的。

## 基本类型的重载

对于只有基本类型不同的重载方法，会出现基本类型可以从小类型自动提升到较大类型的情况

```java
public class Test {

    public static void main(String[] args) {
        int x = 5;
        checkBasicTypes(x);
    }

    static void checkBasicTypes(long x) {
        System.out.println("Type long: " + x);
    }

    static void checkBasicTypes(float x) {
        System.out.println("Type float: " + x);
    }

    static void checkBasicTypes(double x) {
        System.out.println("Type double: " + x);
    }

}

```

输出结果：

```java
Type long: 5

```

变量 x 为 int 类型，但是 `checkBasicTypes()` 方法并没有 int 类型的入参，当程序运行时，会找到类型比 int 类型大的方法进行调用，即传入数据类型小于方法的参数类型，传入的数据类型会自动被提升。（ int -> long）

# 重写

> 重写一般出现在父子类关系之间，父类与子类有两个名称与参数列表都相同的方法，由于它们具有相同的方法名称，所以在方法调用的时候，子类的方法会覆盖同名的父类方法。

下面是重写的一个例子

```java
public class Test {

    public static void main(String[] args) {
        Animal animal = new Dog();
        animal.say();
    }
}

class Animal {
    public void say() {
        System.out.println("I'm animal.");
    }
}

class Dog extends Animal {

    @Override
    public void say() {
        System.out.println("I'm Dog.");
    }

    public void eat() {
        System.out.println("Dog like eat meat.");
    }
}

```

输出结果：

```java
I'm Dog.

```

上面的例子中，父类与子类都定义了 `say()` 方法，实际上称之为子类重写了父类的 `say()`方法。

重写方法之后，当我们调用子类对象的 `say()` 方法，尽管 Dog 对象的类型是 Animal ，Java 依然会调用 Dog 的 `say()` 方法，因为子类的方法会覆盖同名的父类方法。

## 重写的原则

如果需要重写方法，需要满足里式替换原则：

- 子类方法的访问权限必须大于等于父类方法
  - 如父类方法修饰符为 protected，那子类方法的修饰符只能是 protected 或 public
- 子类方法的返回类型必须是父类方法返回类型或为其子类型。
  - 如 B extends A : 父方法返回类型为 A，那么子类方法可以返回 A类型，也可以是 B 类型
- 子类方法抛出的异常类型必须是父类抛出异常类型或为其子类型。

## @Override 注解

`@Override` 注解并不是 Java 中的关键字，但可以当做关键字一样使用，如果在重写方法上加上这个注解，编译器就会帮助你检查是否满足上面的三个限制条件，检测这个重写方法是否合法。有时候还可以有效的防止意外重载。

# 参考资料

[🔗 https://book.douban.com/subject/35751619/](https://book.douban.com/subject/35751619/)

[🔗 https://book.douban.com/subject/35879789/](https://book.douban.com/subject/35879789/)
