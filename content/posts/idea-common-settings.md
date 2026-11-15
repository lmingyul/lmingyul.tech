---
title: "用好系列-IDEA之常用设置篇"
slug: "idea-common-settings"
publishedAt: "2023-02-09T16:26:00.000Z"
categories:
  - "工具"
  - "用好系列"
description: "记录了在IDEA中常用的设置，包括主题、字体、启动项、自动更新、项目编码、代码提示、文件头注释模板等，以提高编码效率和开发体验。文章将持续更新。"
cover: "/uploads/posts/idea-common-settings/01-image.png"
readingTime: 6
mood: "neutral"
draft: false
id: "1fab44d3-5440-80e3-86bf-fabf132e837b"
---
> 用好系列就是记录自己日常如何使用好软件工具，此文为用好系列-IDEA之常用设置篇，由于公司使用的内网环境，自己平时在公司使用 IDEA 觉得还挺不错的设置无法及时同步到自己的家里，所以特意写一个系列用于记录自己日常开发编程时对这个常用的IDE所做过的改造，以提高自己的编码效率和积极性。此系列会持续更新。

首先说明一下本文介绍 IDEA 的版本是 2022.3.2 （Ultimate Edition），电脑系统为 Mac OS 12.5 Monterry 版本

IDEA 几乎所有的设置都在详细设置菜单当中，打开设置菜单的快捷键为 `⌘ + ,`

![](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/CleanShot-2023-02-11-14-51-47@2x-2023-02-11-145344.png)

# 外观

> 首先一款称心得手的兵器也得要悦目

## 主题

个人偏向于使用暗黑的主题，用过这么多主题，还是最喜欢这个 [Xcode-Dark](https://plugins.jetbrains.com/plugin/13106-xcode-dark-theme) 主题

![](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/CleanShot-2023-02-11-14-57-11@2x-2023-02-11-145812.png)

盗用一下这个主题插件官网的一个展示图，这种粉粉感觉还是很好看的。

![](https://plugins.jetbrains.com/files/13106/screenshot_20379.png)

## 字体

> 对于程序员来说，自己写的代码就好像是自己的名片一样，所以一颗好看的字体也是很有必要的

之前一直在用一个很好看的字体：[JetBrains Mono](https://www.jetbrains.com/zh-cn/lp/mono/)，确实很好看，下面展示一下这个字体的具体代码

![](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/CleanShot-2023-02-11-15-12-39@2x-2023-02-11-151316.png)

但是最近又发现一款字体长在了我的审美上，它就是[Fira Code](https://github.com/tonsky/FiraCode)，同样给出同一段代码的展示

![](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/CleanShot-2023-02-11-15-17-14@2x-2023-02-11-151742.png)

字体的设置在 `Editor -> Font` 里面

![](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/CleanShot-2023-02-11-15-20-40@2x-2023-02-11-152219.png)

这个提一个关于鼠标调节字体的设置，使用 `Ctrl + 鼠标滚轮`设置字体大小

![](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/CleanShot-2023-02-11-15-51-59@2x-2023-02-11-155412.png)

![](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/CleanShot-2023-02-11-16-04-27-2023-02-11-160636.gif)

---

# 系统设置

## 软件相关

### 默认启动项

> 设置 IDEA 每次打开项目时的设置：
>
> - 新窗口
> - 当前窗口
> - 询问，*我比较喜欢这个*

![](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/CleanShot-2023-02-11-15-36-31@2x-2023-02-11-153709.png)

### 取消自动更新

> IDEA 软件本身的自动更新就不用勾选了，因为整个软件更新，容易引入兼容性文件，推荐不要选上
>
> 插件的更新可以勾上

![](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/CleanShot-2023-02-11-15-45-58@2x-2023-02-11-154657.png)

### 调整 IDEA 的启动参数

> 让 IDE 运行更流畅

在菜单找到 `Help -> Edit Custom VM Options` ，在打开的`idea.vmoptions` 文件中调整 `-Xms` 和 `-Xmx`等 JVM 相关参数

```java
-Xms2048m
-Xmx8192m
-XX:+UseConcMarkSweepGC
-Djava.net.preferIPv4Stack=true
-Dfile.encoding=UTF-8

```

- `Xms2048m`：指定 JVM 堆内存的初始大小
- `Xmx8192m`：指定 JVM 堆内存的最大值
- `XX:+UseConcMarkSweepGC` ：启动 Java 虚拟机时，选择 CMS 垃圾收集器作为垃圾回收器
- `Djava.net.preferIPv4Stack=true` ：表示应该优先使用 IPv4 地址，而不是 IPv6 地址。这个参数常用在在处理网络连接，因为一些旧的网络设备可能不支持 IPv6 地址，如果默认情况下使用 IPv6 地址，可能会导致连接不可用。通过设置该参数为 true，可以确保 Java 在处理网络连接时优先使用 IPv4 地址，从而避免连接不可用问题
- `Dfile.encoding=UTF-8` ：文件编码使用 UTF-8 编码格式

# 项目编码相关

### 显示代码行号与方法分割符

![](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/CleanShot-2023-02-11-16-10-16@2x-2023-02-11-161135.png)

### 代码智能提示功能

> 代码提示和补充有一个特性：区分大小写。建议去掉勾选，这样你不管输入大写还是小写都能出现代码提示

![](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/CleanShot-2023-02-11-16-15-45@2x-2023-02-11-161635.png)

### 项目文件编码设置为 UTF-8

> 有时候代码的错误就有可能是代码编码引起的，所以项目在开发前统一编码格式很有必要

![](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/CleanShot-2023-02-11-16-19-51@2x-2023-02-11-162104.png)

### 设置 Java 文件头注释信息

> 我们在创建新的 Java 文件的都免不了需要在这个文件头部写上注释，用于说明这个文件的一些基本信息，比如说创建人、创建时间、描述信息等等，但每次都自己手动输入就很麻烦，所以 IDEA 给出了创建文件时的模板，我们可以自定义属于自己的模板

由于我是 Java 的开发者，所以只设置了 `class`、`interface`、`Enum` 这 3 种文件，关于注释中的 `${USER}` 是预设的变量，其他的变量可以在官网查看

![](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/CleanShot-2023-02-11-16-29-02@2x-2023-02-11-162947.png)

```java
#if (${PACKAGE_NAME} && ${PACKAGE_NAME} != "")package ${PACKAGE_NAME};#end
#parse("File Header.java")
/**
 *
 * @author ${USER}
 * @date ${YEAR}/${MONTH}/${DAY}
 *
 **/
public class ${NAME} {
}

```

```java
#if (${PACKAGE_NAME} && ${PACKAGE_NAME} != "")package ${PACKAGE_NAME};#end
#parse("File Header.java")
/**
 *
 * @author ${USER}
 * @date ${YEAR}/${MONTH}/${DAY}
 *
 **/
public interface ${NAME} {
}

```

```java
#if (${PACKAGE_NAME} && ${PACKAGE_NAME} != "")package ${PACKAGE_NAME};#end
#parse("File Header.java")
/**
 *
 * @author ${USER}
 * @date ${YEAR}/${MONTH}/${DAY}
 *
 **/
public enum ${NAME} {
}

```

### 设置自动编译

> 设置自动编译的好处：
>
> - 能够节省时间，不需要手动编译
> - 可以及时发现代码中的语法错误，避免在运行代码时出现问题

![](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/CleanShot-2023-02-11-16-37-24@2x-2023-02-11-163847.png)

### 设置 Maven 的 Reload 操作

> 当 pom.xml 文件发生改动变更的时候，会自动触发 Maven 的 Reload 操作

![](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/CleanShot-2023-02-25-14-38-02@2x-2023-02-25-143856.png)

### 设置实现 Serializable 接口的提示

> 某个类实现了 Serializable 接口后 IDEA 提示添加 serialVersionUID

1. 打开设置
2. 搜索 `serialVersionUID`
3. 把 `Serialzable class without "serialVersionUID"` 勾上
4. 然后，光标选中在实现了 `Serializable` 接口的类，按下 `Option + Enter (Mac)` / `Alt + Enter (Win)` 就可以自动加上 `serialVersionUID`

![](/uploads/posts/idea-common-settings/01-image.png)

![](/uploads/posts/idea-common-settings/02-image.png)

---

这个文章应该会持续更新，只要我还在用 IDEA 这个软件 ♪(･ω･)ﾉ
