---
title: "Stable Diffusion 学习上手"
slug: "stable-diffusion-getting-started"
publishedAt: "2023-07-16T02:30:00.000Z"
categories:
  - "AI"
  - "工具"
  - "AIGC"
description: "Stable Diffusion 是一个开源的 AI 绘画工具，通过提示生成图像。安装需要准备环境、下载模型和配置文件，并运行 WebUI。可以使用文本或图片生成图像，并通过调整提示词来控制图像特性和风格。"
cover: "/uploads/covers/stable-diffusion-getting-started.jpg"
readingTime: 8
mood: "neutral"
draft: false
id: "1fbb44d3-5440-80c3-a6d2-f4940662b694"
---
> 平时写文章有需要图片的需求，所以来学习记录一下 Stable Diffusion 这个开源的 AI 绘画工具

# Stable Diffusion 是什么

> 通过 Prompts （提示/描述）由文字信息转换为图像信息

Stable Diffusion （SD）是一个开源的 AIGC 绘画大模型，特点是开源、速度快、更新迭代快。

# 怎么使用

## 安装 GUI

为了方便使用，需要先安装 SD 的一个 WebGUI  
安装链接：[https://github.com/AUTOMATIC1111/stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui)  
安装分为 2 种，一种是部署到谷歌的 google.colab 上（一个线上的运行环境）、另一种是自己本地部署运行

### 本地安装步骤

由于我的电脑是 Mac 的，而且还是 Apple Silicon 芯片的，所以以下步骤仅供这种类型的机器参考

**全新安装**  
如果之前没有安装过可以通过 [Homebrew](https://brew.sh/index_zh-cn) 的方式进行安装。

> 如果没有 Homebrew 可以通过终端输入这个命令进行安装 `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`

安装 WebUI 之前首先需要把运行环境准备好，打开终端  
**1. 安装 python 3.10 以上版本**

```bash
brew install cmake protobuf rust python@3.10 git wget
```

**2.拉取 WebUI 在 Github 仓库上的代码**

> 拉取代码可以使 SD 更方便的实时更新，使用最新的功能

随便在一个目录下，运行以下命令

```bash
git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui
```

拉取完之后目录是这样的

![](/uploads/posts/stable-diffusion-getting-started/01-image.png)

**3. 下载 Stable Diffusion 模型**  
我下载的是目前比较新的模型，2.1 版本的，模型常见格式：`ckpt` 、`safetensors`格式的，下载地址: [https://huggingface.co/stabilityai/stable-diffusion-2-1](https://huggingface.co/stabilityai/stable-diffusion-2-1)

![](/uploads/posts/stable-diffusion-getting-started/02-image.png)

![](/uploads/posts/stable-diffusion-getting-started/03-image.png)

将下载好的模型放在刚才拉取的 WebUI 的`stable-diffusion-webui/models/Stable-diffusion` 目录下

由于 v2.1 版本还需要下载配置文件，配置文件的下载方法为：  
下载地址：[https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/Installation-on-Apple-Silicon#downloading-stable-diffusion-models](https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/Installation-on-Apple-Silicon#downloading-stable-diffusion-models)

按住键盘上的 option 键，鼠标点击`here`进行下载，下载好的文件名为: `v2-inference-v.yaml`

![](/uploads/posts/stable-diffusion-getting-started/04-image.png)

  
然后我们需要将这个文件进行重命名，把这个配置文件的名字与下载的模型名称保持一致，我下的模型名是 `v2-1_768-ema-pruned.ckpt`，所以配置文件名需要改为 `v2-1_768-ema-pruned.yaml`

![](/uploads/posts/stable-diffusion-getting-started/05-image.png)

**4.执行脚本运行 web UI**

```txt
# 进到根目录下
cd stable-diffusion-webui

# 运行脚本
./webui.sh
```

脚本执行过程中会自动下载运行所需的依赖文件，时间比较久，耐心等待即可，大概需要半小时到 2 小时不等

![](/uploads/posts/stable-diffusion-getting-started/06-image.png)

直到出现访问地址就成功了：`http://127.0.0.1:7860/`  
成功之后不要关闭或者停止终端，直接在浏览器中访问这个地址：[http://127.0.0.1:7860/](http://127.0.0.1:7860/)

![](/uploads/posts/stable-diffusion-getting-started/07-image.png)

以后每次打开就是执行 `webui.sh` 脚本，如果想更新就在根目录下执行 `git pull` 即可

![](/uploads/posts/stable-diffusion-getting-started/08-image.png)

### 特殊情况处理

执行生成图片的时候可能会出现以下的错误：

```bash
NansException: A tensor with all NaNs was produced in Unet. This could be either because there's not enough precision to represent the picture, or because your video card does not support half type. Try setting the "Upcast cross attention layer to float32" option in Settings > Stable Diffusion or using the --no-half commandline argument to fix this. Use --disable-nan-check commandline argument to disable this check.

```

如果你也和一样发生了同样的错误，可以这样解决：  
打开根目录下的 [webui-user.sh](http://webui-user.sh/) 文件  
将这个`COMMANDLINE_ARGS` 参数修改一下：

```txt
COMMANDLINE_ARGS="--lowvram --precision full --no-half --skip-torch-cuda-test"
```

![](/uploads/posts/stable-diffusion-getting-started/09-image.png)

- 重新执行一下 `./webui.sh`
- 最后将设置中的 Stable Deffusion -> Upcast cross attention layer to float32 勾选上即可正常运行

![](/uploads/posts/stable-diffusion-getting-started/10-image.png)

---

# 画出第一副画

## 以文本生成图

画图之前首先先认识一下这个界面各个地方分别是什么

![](/uploads/posts/stable-diffusion-getting-started/11-image.png)

界面中比较重要的几个参数

- **步长 （Sampling steps）**: 这个参数影响时间和效果，通常设置 30 左右，主要控制的是去噪的程度
- **随机因子 (Seed)** ：决定画面内容，主要影响的是画迭代是的随机噪声
- **CFG Scale** ：决定画家自由度
  - 2 \~ 6： 随机生成，基本不按照提示操作
  - 7 \~ 10 ：最常见的设置，会有一个不错的平衡
  - 10 \~ 15 ： 需要提示词很好、很具体，而且 10 以上饱和度会变高

## 以图片生成图片

> 根据提示词 + 图片生成图片

![](/uploads/posts/stable-diffusion-getting-started/12-image.png)

同样的，我们也看看这个界面的一些设置，滚动到页面下面会有设置区域

![](/uploads/posts/stable-diffusion-getting-started/13-image.png)

图生图最常见的用途是：转换图片的风格

## 图扩展图

> 根据提示词 + MASK（蒙版） + 图片生成图片  
常见场景：去水印，换装、扩展画边界

---

# 提示词 Prompts 怎么写

## 关键词

### 不同特性用逗号,分隔

```txt
a girl, long hair, twin ponytails
```

![](/uploads/posts/stable-diffusion-getting-started/14-image.jpg)

### 类似特性用 \| 分隔

```txt
a girl, long black | grey hair, twin ponytails
```

![](/uploads/posts/stable-diffusion-getting-started/15-image.jpg)

## 调整权重

如果想调整某个特性占画面的比例或权重可以通过这样调整  
*（提示词:权重数值）*

- 数值 < 1 ：减弱权重
- 数值 > 1 ：加强权重

```txt
a girl, long hair, (twin ponytails:0.2)
```

![](/uploads/posts/stable-diffusion-getting-started/16-image.jpg)

## 渐变效果

如果想要画面存在渐变，可以这样：  
*\[关键词 1:关键词2:百分比\]*

```txt
a girl, long [white:black:0.5] hair, (twin ponytails:0.2)
```

![](/uploads/posts/stable-diffusion-getting-started/17-image.jpg)

## 交替融合

如果想要画中一半有这个风格，另一半是另一种风格，可以这样  
\[关键词\|关键词\]

```txt
[cat|dog] in the field
```

![](/uploads/posts/stable-diffusion-getting-started/18-image.jpg)

## 强化效果

添加高质量的关键词，如：best quality、masterpiece

```txt
best quality, ultra-detailed, masterpiece, finely detail, high res, 8K wallpaper, a girl, long hair, (twin ponytails:0.2)
```

可以看出画面变得很艳丽

![](/uploads/posts/stable-diffusion-getting-started/19-image.jpg)

## 添加反向词

常用反向词：

- `nsfw`: 色情暴力的
- `bad face` : 不好的脸

## 强化形态

控制强调画面的整体形态：如是否是 **full body shot(全身照)** 之类的

- 光线
  - cinematic lighting （电影光）
  - dynamic lighting（动感光）
- 视线
  - looking at viewer
  - looking at another
  - looking away
  - looking back
  - looking up
- 画风
  - skatch
- 视角
  - dynamic angle
  - from above
  - from below
  - wide shot

```txt
Photo of real life girl, cinematic lighting, peeking from window, vibrant colors, bokeh, movie poster style
```

![](/uploads/posts/stable-diffusion-getting-started/20-image.jpg)

## 与 ChatGPT 结合

```txt
Boundless prairies, Verdant meadows, Azure skies and white clouds, Rushing rivers, Wildflowers aplenty, Majestic sunsets
```

![](/uploads/posts/stable-diffusion-getting-started/21-image.png)

---

# 进阶玩法

## 不同模型

- 常用模型搜索下载网站：
  - [huggingface](https://huggingface.co/models)
  - [civitai](https://civitai.com/)

市面上人们常用的模型：

- 二次元风格模型
  - [Anything V3](https://civitai.com/models/66/anything-v3)
- 国风风格模型
  - [国风3 GuoFeng3](https://civitai.com/models/10415/guofeng3) :中国华丽古风风格模型，具有 2.5 D的质感
- Midjourney 风格
- [Dreamlike Diffusion 1.0](https://civitai.com/models/1274/dreamlike-diffusion-10) : 颜色特别艳丽，画风特别炫
- 真人风格
  - [Protogen x3.4](https://civitai.com/models/3666/protogen-x34-photorealism-official-release)
  - [Protogen x5.3](https://civitai.com/models/3816/protogen-x53-photorealism-official-release)

可以将这些模型下载下来放到`stable-diffusion-webui/models/Stable-diffusion` 目录下，点击页面的模型选择旁边的刷新按钮即可使用这些模型啦

---

# 参考资料

[🔗 https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/Installation-on-Apple-Silicon](https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/Installation-on-Apple-Silicon)

[🔗 https://blog.csdn.net/hcaohr/article/details/130122398](https://blog.csdn.net/hcaohr/article/details/130122398)

---

![](/uploads/posts/stable-diffusion-getting-started/22-image.jpg)
