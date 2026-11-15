---
title: "利用Surge把Mac变成家中网络枢纽"
slug: "mac-network-hub-with-surge"
publishedAt: "2022-07-02T07:03:00.000Z"
categories:
  - "运维"
  - "Surge"
  - "Mac"
description: "通过使用Surge将Mac电脑设置为家中网络枢纽，可以让其他设备科学上网，省去加速器的费用。需要配置静态IP、关闭路由器的DHCP，并启用Surge的DHCP服务器功能，确保Mac电脑始终开机以保持网络连接。"
cover: "/uploads/posts/mac-network-hub-with-surge/01-image.png"
readingTime: 11
mood: "neutral"
draft: false
id: "1fab44d3-5440-80a5-b723-cb8789dbc4e4"
---
> 本文记录如何使用 Surge 将家中的 Mac 电脑成为家中其他设备科学上网的中转站。

# 前情提要

> 今年 618 大促入手人生第一台掌机游戏机 Nintendo Switch OLED 版（日版），Switch 游戏可以从eshop 中下载，但是国内直接访问下载 eshop 中的游戏速度可以说是龟速。得知 Switch 中 eshop 需要和 Steam 一样开启游戏加速器才能正常使用。但是 UU 加速器使用包年需要 283 RMB，就不舍得（对，我就是那种买贵东西不眨眼，但是买便宜附属品时斤斤计较的人🙄）。
>
> 我记起来之前看过其他人用 Surge 把 Mac 当中代理转发让 Apple TV 可以顺利地访问（科学上网），我到网上查找教程，果然真的可以，于是就有了这篇教程，也是做一个记录，以便以后翻阅。

# 前期环境准备

- Surge for Mac （通过 Mac 电脑作为中间商为其他设备作为代理转发）
- Mac Studio （接着网线的，配置好之后是不能关机的，我试过 Mac 电脑休眠之后 Surge 软件是会自动退出的，所以需要保持电脑不要休眠，如果休眠了需要重新开启才能继续使用）
  - M1 Max
  - 运存：64 G
  - 系统：masOS Monterey 12.4
  - ![](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/ANNW94-2022-07-02-162212.png)

- 机场订阅地址（没有的话需要自己找一下😂，科学上网必备）

**以下教程默认已经准备好以上的 3 个条件**

---

# Surge

## Surge 介绍

### 总览

> Surge 是一个网络开发和代理工具。他是为开发者打造的工具，所以使用时需要具备一定的专业知识。

![](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/7xbnGO-2022-07-02-165248.png)

以下四种是 Surge 的核心工作流。

- 接管：接管设备发起的网络连接。Surge 支持代理服务器和虚拟网卡两种接管模式。
- 处理：可以修改已经接管的网络请求和响应。包括 URL 重定向、本地文件映射、使用 JavaScript 自定义修改等多种方法。
- 转发：可以将已接管的网络请求转发到其他代理服务器。这可以是全局转发，也可以通过灵活的规则系统来确定出站策略。
- 拦截：可以拦截并保存网络请求和响应的数据，也可以通过 MITM 解密 HTTPS 流量。

我们这里主要使用的是转发

### 特点

我使用 Surge 这个软件主要是被它这几个特点吸引的：

- 高性能、稳定、高效率：Surge 可以在耗费极少资源并且保持高稳定性的前提下轻松处理网络数据，配合 M1 芯片更加节能和稳定
- 增强模式：Surge 会设置一个虚拟网络去接管所有的网络请求，尤其是那些对 Web 代理支持不好的软件。
- 网关模式：**Surge Mac 可以当做三层网关去处理同网络下其他设备的网络请求。**（简单来说就可以当做一个路由器，成为家中网络枢纽）

## Surge 下载与购买

下载 Surge for Mac 可以直接在 [Surge 官网](https://nssurge.com/)下载，我下载的版本是最新版，Surge 4.6.1 (1718) ，下载完之后是一个压缩包，解压之后把 app 拖到应用程序中即可打开使用了。

![](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/enlBCc-2022-07-02-170049.png)

但是下载之后并不能直接科学上网的，还是需要花钱进行购买，到官网进行授权购买，购买 1 台设备授权 49.99 美刀，3 台设备授权 69.99 美刀，5 台设备授权 99.99 美刀，**支持支付宝付款**，这里我买的是 3 台设备授权（我是想在过年回家也可以给家里也弄一个就买的3台），实花 471.13 RMB （根据当时汇率波动，心疼啊），可以根据个人需求进行购买，至少购买 1 台。

购买之后就可以根据购买时的邮箱地址和购买之后给你邮箱发的激活码对 Surge 进行激活。

---

# Surge 接管 Mac 网络

> 接下来就可以让 Surge 接管 Mac 电脑的网络了（让 Mac 可以科学上网），这时候就需要你有机场的订阅地址了。

**往 Surge 中添加配置文件**

这里使用的是从 URL 安装配置文件，你也可以通过文件进行导入或者自己手动添加配置。

如果你订阅的机场是直接有 Surge 的订阅地址可以直接添加，如果没有，但是有v2ray、ss 、trojan 的订阅也是可以的，通过[第三方订阅转换](https://bianyuan.xyz/)生成 Surge 可以识别的 URL 。

![](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/5WspOo-2022-07-02-172841.png)

1. 选择基础模式，如果你想自定义你想要的特定节点可以选择进阶模式
2. 在订阅链接中粘贴上你订阅机场的订阅地址
3. 在客户端下拉框中选择 Surge4
4. 点击红色生成订阅链接就可以生成定制订阅 URL，点击复制

打开 Surge 主界面左下角更多，选择设置中的**配置**

![](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/FPlXiy-2022-07-02-173426.png)

选择**从 URL 安装配置文件**

![PFS43A-2022-07-02-173704](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/PFS43A-2022-07-02-173704.png)

粘贴你刚才由第三方生成的配置文件订阅地址，然后选择完成，等待一会 Surge 就会对规则策略进行导入

![](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/EgzLZb-2022-07-02-174004.png)

等 Surge 识别完成之后会出现一个新的托管配置，选中这个新的配置，并点击右下角**应用**

![](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/MePj6m-2022-07-02-175029.png)

回到 Surge 主界面，选中代理下的策略，选择 **规则判定** ，这时检测一下科学上网是否成功了，如果不行，点击标签栏的 Surge 检查一下是否勾选了 **设置为系统代理** 和 **增强模式**，没有勾选可以勾选上，并重启一下 Surge

![](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/9d3KT2-2022-07-02-175857.png)

**到此你的 Mac 就可以愉快地上网了**

---

# 让 Mac 成为家中网络枢纽

上面的步骤已经可以让 Mac 电脑愉快地上网了，但是独乐了不如众乐乐，那怎么让家里其他设备也可以愉快地上网呢？

这里就需要用到 Surge 的 DHCP 服务器这个功能了，也就是上面介绍过的**网关模式**。

## 设置电脑 IP 为静态IP

1. 打开 **系统偏好设置-网络**，选择以太网（也就是网线接口）
2. 配置 IPv4 选择 **使用 DHCP（手动设定地址）**
3. 我的路由器是 192.168.1.1 所以 IP 地址我就填 192.168.1.2，只用修改最后一位在 2-225 之间就行。（如果你的路由器是 192.168.0.1 你的 IP 地址就可以填 192.168.0.2，以此类推）
4. 随后选择 **应用**

注意：这里设置之前先把 Surge 设置为系统代理先关掉，开启会影响后面 ip 地址设置，建议先关掉，后面设置完之后再开启。

![](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/uTcDOP-2022-07-02-181712.png)

## 关闭路由器 DHCP

登录到你们家的路由器管理后台，在管理页面中找到 DHCP 服务器设置，把路由器的 DHCP 关掉（一般路由器都会有这个选项）

![](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/kiUr1q-2022-07-02-182242.png)

## 打开 Surge DHCP 选项

在Surge左侧 **设备** 里，点开后最下面有 **DHCP 服务器** 开关，点开后选择下一步。

![](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/XaJAvP-2022-07-02-183102.png)

![](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/AKpMao-2022-07-02-183144.png)

插网线的选择 **Ethernet** ，点击下一步。

![](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/uPhRre-2022-07-02-183408.png)

Surge 会检测当前网络环境是否有 DHCP 设置，如果上面你正确关闭了 路由器 DHCP 这里应该能直接生成配置

![](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/iME4T0-2022-07-02-183608.png)

选择 Surge 默认的设置点击**完成**即可，如果你发现这里路由地址为空（我一开始在这里卡了很久，后面发现选错了网络设备，选成了Ethernet Adapter (en6)），你就要检查一下哪里步骤出错了

![](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/eYfMhS-2022-07-02-183225.png)

![](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/0qFKq7-2022-07-02-183745.png)

启动完 DHCP 服务器之后可以看到设备列表没有任何设备，这时需要重启一下路由器或者让你想使用的设备重新连接一下wifi，就可以在新增设备中看到

![](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/R6rAZy-2022-07-02-184417.png)

## 添加设备成员

想要科学上网的设备可以右键选择设备名，然后选择 **使用 Surge 作为网关**，然后**设备重新连接wifi或者关闭路由器 wifi 再打开**即可。

没连接上会显示等待连接，这里建议把**设置固定 IP 地址**也选上，这时官网推荐的做法，方便以后设备管理和连接。

![](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/PLnbhq-2022-07-02-184957.png)

![](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/m9E18F-2022-07-02-184849.png)

苹果手机和平板，由于注重隐私的原因会默认在连接 Wifi 的时候选上使用私有无线局域网地址进行连接（使用私有地址有助于减少不同无线局域网对 iPhone 的跟踪），**这里需要把这个选项关掉重新连接 wifi 才能让 Surge 识别出你的设备**。

![](/uploads/posts/mac-network-hub-with-surge/01-image.png)

如果不清楚 IP 地址具体对应哪台设备，可以到路由器管理后台查看或者根据此 IP 的制造商进行推断。

最后推荐将设备连接Wifi的IPV4地址改为手动，因为你如果你启用了自动DHCP的话，有可能下次连接这个WIFI时IP地址就会改变，如果连接失败，可以按照以下的配置将IPV4地址改为手动即可。

![](/uploads/posts/mac-network-hub-with-surge/02-image.png)

**至此，家里的想要一起科学上网的设备都可以通过 Mac 电脑这个网络枢纽一起愉快玩耍了！**

# 特殊情况

> 一开始使用的时候，我遇到过用surge作为网关的 Mac 可以打开网页的 youtube 视频并且能观看，但是家里其他设备通过wifi连接的缺不能访问 google，检查一下是可以打开 youtube App，但是只能看到视频的缩略图，进一步点击打开视频观看，却始终是 loading状态，无法观看。奇怪的是可以打开Netflix，正常看剧。

这种情况查找到解决的办法是，在你需要访问 YouTube 的设备上把连接的 wifi 的 DNS配置修改一下，从自动改为手动，并添加一个 DNS 服务器 192.0.2.2

![](/uploads/posts/mac-network-hub-with-surge/03-image.png)

![](https://cdn.jsdelivr.net/gh/lmingyul/lmingyul.github.io@uPic/uPic/YrtDRs-2022-07-02-192758.png)

至于为什么设置为这个DNS地址我也不是很清楚，只知道手册上是这样写的🐶，这样就把 YouTube 不能访问的问题就解决了！

---

# 总结

以后有其他设备想要愉快上网，都可以通过这台被 Surge 附魔的 Mac 电脑作为转发代理，省下了加速器的年费，还比加速器好使，覆盖范围更广，但需要的是这台 Mac 电脑要一直开着，不然家里其他的设备都上不了网。

这篇文章只是简单使用了 Surge 的简单功能（规则访问策略并没有定制化），还可以对 Surge 进行很多定制化的改造，这些更深入的功能就等以后慢慢发掘吧，先去愉快地玩新到的 Switch 啦，有什么好玩的游戏，欢迎推荐！

---

# 参考资料

- [Surge 把你的 Mac 变成最强路由器](https://qust.me/post/MacSurgeRouter/#surge-dhcp-%E6%8E%A5%E7%AE%A1%E7%BD%91%E7%BB%9C)
- [Surge 使用手册](https://surge.mitsea.com/others/gateway-mode)
- [Surge 教程](https://github.com/bannedbook/fanqiang/blob/master/ios/Surge.md)
- [Surge 论坛](https://community.nssurge.com/)
- [家庭网络部署心得](https://blog.indigo.codes/2020/04/24/home-network-deployment/)
