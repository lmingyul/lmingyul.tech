---
title: "重构 Java 代码时可以找的帮手"
slug: "java-refactoring-helpers"
publishedAt: "2024-07-03T04:14:00.000Z"
categories:
  - "编程语言"
  - "Java"
description: "重构代码是软件开发的必要过程，常用方法包括提取、内联、封装、重命名和移动。使用IDE工具和静态代码扫描工具可以降低重构成本，确保代码质量。AI助手也可辅助检查，但需人工识别和处理。"
cover: "/uploads/covers/java-refactoring-helpers.png"
readingTime: 4
mood: "neutral"
draft: false
id: "1fcb44d3-5440-8080-8cf2-d41090046af9"
---
> 我们在软件开发的无时无刻都可以对代码进行重构，可以说重构时伴随着这个软件系统完整的生命周期。

# 为什么需要一直重构

- 每一次重构只能基于当前的情况做分析来设计代码的实现
- 只要业务一直在发展，就会有新的需求，随着需求的增多，旧的代码实现方式以及结构难免会出现不合适的情况，会导致现有的开发实现繁琐，甚至困难
- 不同的人员开发与改动，也会使现有的实现与原先设计背道而驰

既然是一个一直都需要做的，有没有一些方法或者工具可以减轻每次重构的成本和负担呢？

## 方法

重构代码的常见手段，能使用 IDE 提供的工具旧尽量使用，**非必要不要手动移动代码，减少出错的可能性**

- 抽取/提取代码（Extract）：常用手段，针对实现比较复杂，长的方法函数以及重复的代码。大化小，繁化简，提升代码的可读性
- 内联（Inline）：有一些独立的函数、变量，它的存在没有对提升代码可读性有帮助，这种就可以进行消除，将其放到对应的调用位置上。
- 封装（Encapsulate）：“对不变的部分进行包起来藏起来，经常变化的部分提供方法方便扩展修改”。
- 重命名（Rename）：函数/变量的重命名有助于提升代码的可读性，如果一个函数/变量无法用一个合适的单词表达，说明这个函数/变量违反了“单一职责”，需要重新进行设计。
- 移动（Move）：移动函数/变量，把负责同一个职责的函数/变量放在一起，提升代码的内聚。
- 精简：删除无用的注释，变量，方法，类

### 重构常用的几个快捷键

- **文件重命名：SHIFT+F6**
- **提取当前选择为变量（extract variable）：CTRL+ALT+V**
- **提取当前选择为常量（extract constant）：CTRL+ALT+C**
- **提取当前选择为方法（extract method）：CTRL+ALT+M**
- 提取当前选择为方法参数（extract parameter）：CTRL+ALT+P
- 构类、方法（change signarture）：CTRL+F
- 取代码块至if、try等结构中（surround with）：CTRL+ALT+T
- 建模块文件等（new）：CTRL+ALT+N
- 建测试用例（test）：CTRL+SHIFT+T
- 构菜单（refactor for this）：CTRL+T

## 工具

### 静态代码扫描工具

### idea 自带工具检查

**一、扫描存在的问题**

选中需要检查的目录或者文件，右键 Analyze—>Inspect Code

二、扫描重复代码

这种扫描会出现不太准，误判较多的问题，需要人工再次识别

使用 Maven 插件执行即可得到报告

可以针对问题清单的问题进行处理

### 单元测试工具

### 流水线 JaCoCo

重构时免不了写单元测试，为了保证重构质量，提高单元测试的覆盖率，可以使用流水线的 **Sonar静态代码扫描**

在系统代码的 Maven 插件中引入 JaCoCo 插件

```xml
<dependency>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>${jacoco.version}</version>
    <scope>test</scope>
</dependency>
```

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <version>2.22.1</version>
    <configuration>
        <skip>false</skip>
        <testFailureIgnore>true</testFailureIgnore>
    </configuration>
</plugin>
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-report-plugin</artifactId>
    <version>3.0.0-M8</version>
</plugin>
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>${jacoco.version}</version>
    <executions>
        <execution>
            <id>prepare-agent</id>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals>
                <goal>report</goal>
            </goals>

            <configuration>
                <outputDirectory>target/jacoco-reports</outputDirectory>
            </configuration>
        </execution>
    </executions>
</plugin>

```

### **ArchUnit 插件**

ArchUnit 是一个用于根据一组自定义代码和体系结构约束检查Java代码的库。 它可以通过单元测试框架来检查Java代码的架构，包括检查包和类、层和片之间的依赖关系

```xml
 < dependency >
    < groupId >com.tngtech.archunit</ groupId >
    < artifactId >archunit-junit5</ artifactId >
    < version >1.0.0</ version >
    < scope >test</ scope >
 </ dependency >

```

```java
@AnalyzeClasses(packages = "com.miya.hh.item", importOptions = {ImportOption.DoNotIncludeJars.class, ImportOption.DoNotIncludeTests.class})
public class ArchUnitTest5 {

    /**
     * DO需要放在data文件下
     */
    @ArchTest
    private static ArchRule pojo_need_in_data = classes().that().haveNameMatching(".*DO").should()
            .resideInAPackage("..data..").as("pojo should reside in a package '..data..'");

    /**
     * 设置统一的返回
     */
    @ArchTest
    private static ArchRule controller_nee_return_result = methods().that().areDeclaredInClassesThat().resideInAPackage("..controller..").and().arePublic()
            .should().haveRawReturnType(Result.class).because("this project requires a uniform return");

}

```

参考链接：

- [https://juejin.cn/post/6914584295390576647](https://juejin.cn/post/6914584295390576647)
- [https://blog.csdn.net/Taobaojishu/article/details/139692882](https://blog.csdn.net/Taobaojishu/article/details/139692882)

### AI 助手

最后目前最方便的就是调用 AI 帮你检查，但是生成的结果需要人工识别，进行二次处理

## 参考资料

对代码进行染色，通过统计生产环境请求，在 IDEA 插件显示方法函数的调用次数，但是目前行内并没有这种工具，待研究

- [https://blog.csdn.net/kangbin825/article/details/138998757](https://blog.csdn.net/kangbin825/article/details/138998757)
