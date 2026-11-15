---
title: "Mac M1 Max 64G电脑本地部署开源 Qwen2.5-72B 模型"
slug: "qwen2-5-72b-mac-m1-max"
publishedAt: "2024-11-13T12:23:00.000Z"
categories:
  - "AI"
  - "Mac"
  - "LLM"
description: "在Mac M1 Max上安装Ollama以本地部署Qwen2.5-72B模型，提供了详细的安装步骤，包括下载Ollama和Text generation web UI，最终在本地成功运行模型并进行对话。模型能力与其他模型进行了简单对比。"
cover: "/uploads/posts/qwen2-5-72b-mac-m1-max/01-image.png"
readingTime: 2
mood: "neutral"
draft: false
id: "1fcb44d3-5440-80e2-b4f9-f2141cf69228"
---
**2024 年 11 月 12 日 阿里开源了最新的关于编码的模型 Qwen2.5-Coder-32B-Instruct , 代码能力媲美 GPT-4o**

# 安装 ollama

> Ollama 本身不是 LLM，而是一个服务于 LLM 的工具。它提供了一个平台和环境，使得开发者和研究人员能够在本地机器上轻松地运行、测试和部署各种大型语言模型

## 下载安装 Ollama

下载地址：[https://github.com/ollama/ollama](https://github.com/ollama/ollama)

![](/uploads/posts/qwen2-5-72b-mac-m1-max/01-image.png)

打开压缩包即可安装

```json
ollama --version
```

![](/uploads/posts/qwen2-5-72b-mac-m1-max/02-image_1.png)

# 终端下载模型

直接使用 run 模型下载模型，它会在运行之前自动检查模型是否下载，如果没有会自动下载

安装完成了就可以直接在终端进行对话

![](/uploads/posts/qwen2-5-72b-mac-m1-max/03-image_2.png)

但是直接在终端对话不太美观，这时候就可以安装一个 UI 界面

# 安装 UI 界面

下载 Text generation web UI 参考代码：[https://github.com/oobabooga/text-generation-webui](https://github.com/oobabooga/text-generation-webui)

解压后打开终端

输入命令安装

```json
./start_macos.sh

```

![](/uploads/posts/qwen2-5-72b-mac-m1-max/04-image_3.png)

然后输入电脑对应的芯片

![](/uploads/posts/qwen2-5-72b-mac-m1-max/05-image_4.png)

经过一系列的 python 包下载安装之后

看到 Running on local URL:  [http://127.0.0.1:7860](http://127.0.0.1:7860/) 就成功了

![](/uploads/posts/qwen2-5-72b-mac-m1-max/06-image_5.png)

![](/uploads/posts/qwen2-5-72b-mac-m1-max/07-image_6.png)

# 运行时内存情况

![](/uploads/posts/qwen2-5-72b-mac-m1-max/08-image_13.png)

![](/uploads/posts/qwen2-5-72b-mac-m1-max/09-image_14.png)

# 模型能力简单对比

## 千问

![](/uploads/posts/qwen2-5-72b-mac-m1-max/10-image_7.png)

![](/uploads/posts/qwen2-5-72b-mac-m1-max/11-image_8.png)

## Claude-3.5-sonnet

![](/uploads/posts/qwen2-5-72b-mac-m1-max/12-image_9.png)

![](/uploads/posts/qwen2-5-72b-mac-m1-max/13-image_10.png)

## ChatGPT-o1-mini

![](/uploads/posts/qwen2-5-72b-mac-m1-max/14-image_11.png)

![](/uploads/posts/qwen2-5-72b-mac-m1-max/15-image_12.png)
