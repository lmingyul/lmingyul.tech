---
title: "Langchain 学习笔记"
slug: "langchain-notes"
publishedAt: "2025-07-29T06:24:00.000Z"
categories:
  - "AI"
  - "框架"
description: "专门为大语音模型应用设计的框架"
cover: "/uploads/posts/langchain-notes/01-image.png"
readingTime: 1
mood: "neutral"
draft: false
id: "23fb44d3-5440-801a-9641-e41a9aa8dbcb"
---
> 专门为大语音模型应用设计的框架

![](/uploads/posts/langchain-notes/01-image.png)

# 概念

## 特性

- 可以获取其他数据源的数据
- 让语言模型与其环境进行交互

## 6 大组件

- Models 模型：包含各种大模型的调用接口和结果输出解析机制
- Chain 链：核心机制，以特定的方式封装各种功能，构造调用序列，通过将功能组合实现各种用例，串联起 Model、Memory、Indexes，实现连续对话
- Agents 代理：核心机制，帮助大模型调用内外部工具
- Prompts 提示词模板：使提示词工程化、流水线化
- Indexes 数据检索：构建并操作外部数据（文档），构建知识库（存储在向量数据库中），根据用户的查询（向量查询）返回最相关的文档
- Memory 记忆：由短期记忆和长期记忆组成，在对话过程中存储和检索历史对话数据

# 入门
