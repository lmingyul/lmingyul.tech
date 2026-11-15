---
title: "AI 的使用技巧（2026 第 3 周）"
slug: "ai-tips-2026-w3"
publishedAt: "2026-01-22T02:59:00.000Z"
categories:
  - "AI"
  - "工具"
  - "用好系列"
description: "在之前 Apple Pay 一直仅支持绑定国内的银联卡，但就在上周 Apple Pay 终于是支持绑定国内银行发行的 Visa 信用卡（目前是 8 大行支持，我一般用的就是招行的）。"
cover: "/uploads/posts/ai-tips-2026-w3/01-abc9803f-b913-4c5c-a549-0b622a485ee1_1_101.jpg"
readingTime: 8
mood: "neutral"
draft: false
id: "417b44d3-5440-8195-8082-d15788610cfa"
---
# 关于使用国内支付方式订阅国外模型的方式

在之前 Apple Pay 一直仅支持绑定国内的银联卡，但就在上周 Apple Pay 终于是支持绑定国内银行发行的 Visa 信用卡（目前是 8 大行支持，我一般用的就是招行的）。

能绑定有啥好处呢？国内都是用扫码的，使用场景比较少，但是如果你有国外购物消费场景就会有很大改善。

- 国外很多国家消费场景很大部分都是支持信用卡的，但是直接拿信用卡的实体卡去消费就会有被盗刷的风险，因为信用卡只要拿着就可以刷，而且只要有卡背面的 CVV  编号就可以，国外有很多地下灰色的产业，通过你结账的时候，偷偷的把你的卡正反面拍照，在你走了之后就会开始发生盗刷的情况。去年我就盗刷了，直接被封了 2 张卡。手机支持 Apple pay 之后就可以直接刷手机了，手机碰一下 POS 机就可以，不会出现盗刷的问题，出国也不用怕带实体卡会弄丢了。

![](/uploads/posts/ai-tips-2026-w3/01-abc9803f-b913-4c5c-a549-0b622a485ee1_1_101.jpg)

- 总所周知的原因，国外是不支持中国的 VISA 卡直接在官网进行支付订阅的，但是可以通过迂回的方式，通过苹果的礼品卡充值的方式给美国的 Apple ID 账号进行充值，然后再进行订阅的，但是在没有 Apple pay 的时候一般我都是通过支付宝购买礼品卡再进行充值，这样的话除了汇率之外还会有手续费，不是很划算，有了 Apple pay 之后就可以直接在美国 Apple 官网直接购买了，是没有手续费的。

![](/uploads/posts/ai-tips-2026-w3/02-b8849b1e-6659-4f4e-ba30-e598f7a33bce_1_101.jpg)

![](/uploads/posts/ai-tips-2026-w3/03-8e7d7b18-7e08-4777-874d-659a57b3545f_1_101.jpg)

![](/uploads/posts/ai-tips-2026-w3/04-a210036d-5547-4f0b-a641-7c87ce914185_1_101.jpg)

![](/uploads/posts/ai-tips-2026-w3/05-0918b539-6bcb-41d7-9801-6af2eafb357a_1_101.jpg)

![](/uploads/posts/ai-tips-2026-w3/06-4e70113a-0cf9-4f0a-bbba-5e5ee8fedeab_1_101.jpg)

![](/uploads/posts/ai-tips-2026-w3/07-image_6.png)

![](/uploads/posts/ai-tips-2026-w3/08-929287a5-2b6c-4196-99f2-a66a5c7bfab1_1_101.jpg)

---

# 成为网络数字公民

在订阅国外服务的时候经常会发现卡在注册或者访问阶段，一个是需要国外手机号，一个是我们的 IP 地区不在可用的地区（属于中国的领域都不行，机房 IP 不纯 ——我们常用的订阅 VPN 提供方，很多人用，就会很容易被模型厂商检测出来）

上周末我研究了一下，发现了有 2 种方式可以获得比较纯的 IP 的方式，一个是 esim, 一个是 VPS + 家宽（这个比较复杂，感兴趣的可以自行了解）。

大家出国的都会发现国内的流量卡在国外无法上网

- 需要买过国外流量卡到目的地之后换当前的实体卡
- 或者说需要通过漫游的方法，比如去香港的时候都需要提前购买流量包

这些方法都比较麻烦，费用还比较贵，而且换上之后大家会发现国内应用、网络是可以访问的，但是国外的应用照样还是无法访问，大家有没有想过国外的人来到我们中国旅游的时候为什么还是可以照常能访问 Youtube, Google 这些应用呢，其实还是使用的是漫游技术。

![](/uploads/posts/ai-tips-2026-w3/09-image_3.png)

![](/uploads/posts/ai-tips-2026-w3/10-image_1.png)

其实原理就是使用国外很普遍的 esim 技术，让我们成为来到中国的外国人。国外的 esim 跟国内的 sim 卡申请不一样，是不需要实名认证的。所以很轻松就可以申请到，而且提供 esim 卡的运营商有很多，流量套餐也很多。

有些人说我手机没有 esim 功能

这个时候就可以借助写卡技术，常用的有这些 eUICC、estk、beesim

- 安卓手机可以安装 EasyEUICC 这个应用给白卡进行写卡

![](/uploads/posts/ai-tips-2026-w3/11-3ed1ba6a-84d2-4b7a-ac9a-fa2c13df2064_1_101.jpg)

- 苹果的话可以使用 beesim, 它是通过蓝牙协议在小程序操作进行写卡的

![](/uploads/posts/ai-tips-2026-w3/12-8bcde915-c5af-4773-a1df-67045bb5efbf_1_101.jpg)

![](/uploads/posts/ai-tips-2026-w3/13-22a3c71a-a65e-4185-bffb-9f1de7451996_1_101.jpg)

![](/uploads/posts/ai-tips-2026-w3/14-dc58b72a-7f36-4280-8695-b894b7f1cd5e_1_101.jpg)

怎么写卡有了，哪里去获取卡呢，这里提供一些比较常见的运营商提供方，购买套餐之后就会有 esim 写入的二维码，按步骤激活就好

- Redteago （红茶）：提供很多地区的流量套餐

![](/uploads/posts/ai-tips-2026-w3/15-image.png)

![](/uploads/posts/ai-tips-2026-w3/16-image_11.png)

![](/uploads/posts/ai-tips-2026-w3/17-image_8.png)

![](/uploads/posts/ai-tips-2026-w3/18-image_7.png)

- 3HK：是香港四大核心移动运营商之一，很多深港往返通勤人士常用的运营商

![](/uploads/posts/ai-tips-2026-w3/19-image_9.png)

在写入完 esim 卡之后打开漫游功能，就可以直接开始使用国外流量了，像我是没有插在手机使用（因为我本身就有 2 张卡），而是插在移动 wifi 里面

![](/uploads/posts/ai-tips-2026-w3/20-image_2.png)

![](/uploads/posts/ai-tips-2026-w3/21-image_4.png)

![](/uploads/posts/ai-tips-2026-w3/22-image_10.png)

![](/uploads/posts/ai-tips-2026-w3/23-image_5.png)

---

# 自定义打造苹果手机的 AI 助手

目前国行苹果手机上没有一个很好用的 AI 助手，就算有了，国内苹果手机也无法使用到最顶级的模型。这个时候可以借助快捷指令构建一个自己手机上的 AI 助手，而且可以随时切换不同的模型。很多模型厂商的 APP 应用都推出了快捷调用方式，比如 ChatGPT、Gemini、Claude、Perplexity、Monica、豆包

![](/uploads/posts/ai-tips-2026-w3/24-e7182137-38f9-4110-a763-36895ce4ee5b_1_101.jpg)

![](/uploads/posts/ai-tips-2026-w3/25-23aefeaa-4ec4-494c-92b9-856044258eed_1_101.jpg)

![](/uploads/posts/ai-tips-2026-w3/26-d9a73b6e-c684-48ed-8ab5-6a04efac26a0_1_101.jpg)

![](/uploads/posts/ai-tips-2026-w3/27-9f81eabd-92dd-4fb2-9510-21dcecc64aab_1_101.jpg)

![](/uploads/posts/ai-tips-2026-w3/28-41065a22-efb9-4edd-9115-8a1e7f1c59f5_1_101.jpg)

![](/uploads/posts/ai-tips-2026-w3/29-c3f5cdb4-6330-45db-a8b1-f2a322f3f4a0_1_101.jpg)

下面以豆包为例展示一下

![](/uploads/posts/ai-tips-2026-w3/30-d7d06188-6615-4cc8-afc6-32180226a175_1_101.jpg)

![](/uploads/posts/ai-tips-2026-w3/31-af2296e7-143c-4c1b-9add-bdd6c62b9a39_1_101.jpg)

![](/uploads/posts/ai-tips-2026-w3/32-aa5452ef-b5ef-4a79-95f9-75dcde477244_1_101.jpg)

![](/uploads/posts/ai-tips-2026-w3/33-1a40e96a-f092-4e6b-87eb-ebdb753d9f72_1_101.jpg)

![](/uploads/posts/ai-tips-2026-w3/34-8bf04531-c8c9-4d0f-a583-12688985167b_1_101.jpg)

![](/uploads/posts/ai-tips-2026-w3/35-5e49ad0e-df30-459a-aad9-63e24b232046_1_101.jpg)

这个就可以一键唤醒 AI 助手，马上也过年啦，这个强烈推荐家里长辈是苹果手机的，可以让他们更轻松的使用 AI 应用，可以很有限的解决长辈的很多问题，比如健康问题，防诈骗等等
