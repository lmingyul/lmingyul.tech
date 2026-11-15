---
title: "Passkeys 的初体验"
slug: "passkeys-first-experience"
publishedAt: "2023-07-21T07:42:00.000Z"
categories:
  - "工具"
description: "Passkeys 是一种无需密码的登录方式，通过 Touch ID 和 Face ID 验证用户身份，简化了登录过程。使用 GitHub 的 Passkeys 功能，可以轻松设置和使用，支持多设备同步和共享，提升了安全性和便利性。"
cover: "/uploads/covers/passkeys-first-experience.jpg"
readingTime: 3
mood: "neutral"
draft: false
id: "1fbb44d3-5440-80d8-a469-c8536c788108"
---
> 每天使用各种产品的时候都需要账号密码，一开始使用的产品少还能记得住，但随着使用的应用产品越多，后面都不记得了。最近各大厂商都在推行一种机制，就是使用 Passkeys 登录的方式代替密码，我初体验了一下使用 PassKeys 登录 GitHub，觉得还不错，记录一下！👍

# 什么是 PassKeys

是一种新的登录方式，完全无需密码。它可以通过使用 Touch ID 和 Face ID 等设备的安全验证方式去验证用户身份。

## 有什么特点

- 简化登录，无需密码
  - 使用面容 ID （Face ID）或触控 ID （Touch ID）快速轻松地保存和使用通行密钥，无需创建或管理密码。通行密钥与 iCloud 钥匙串同步，可以在各种 Apple 设备上同步使用，并且可以使用 iPhone 来登录非 Apple 设备上的 App 和网站。
- 通行密钥基于 FIDO 联盟和 W3C 标准，使用加密密钥对来替换密码。这些密钥对极大地提高了安全性，并且在 iCloud 钥匙串中，通行密钥是端到端加密的
- 密钥和密码可以同时使用，互不干扰

# 设置使用 Passkeys 登录 Github

## 开启特性预览

Github 这个功能这个月刚公测，所以可能需要先把功能打开才可以体验

1. 打开 Github 页面
2. 点击右上角头像
3. 选择 Feature preview
4. 选择 Passkeys
5. 设置为 enable

![](/uploads/posts/passkeys-first-experience/01-image.png)

## 添加新的 Passkeys

1. 打开 Github 页面
2. 点击右上角头像
3. 选择 Settings
4. 选择 Access 下的 Password and authentication
5. 点击 add a passkey，就会跳出另一个页面
6. 继续点击添加 passkey
7. 它会让你选择以哪种方式创建 passkey，这里我选的是手机（也可以选电脑）
8. 拿出你的 iphone ，打开相机扫描弹出来的二维码把密钥存储到 icloud 密码串当中
9. 成功之后它会再弹出一个框让你给刚才创建的密钥起个名字，方便后面识别

![](/uploads/posts/passkeys-first-experience/02-image.png)

![](/uploads/posts/passkeys-first-experience/03-image.png)

![](/uploads/posts/passkeys-first-experience/04-image.png)

## 体验

登录的时候选择以密钥登录，同样会让你选择用哪台设备中保存的密钥登录  
同样拿出手机相机扫描，这个时候使用手机的面容 ID 就可以进行登录，无密码登录完成！😜 由于密码串可以通过 icloud 云同步，后续可以使用平板登录也可以，也可以选择共享给你的家人！

![](/uploads/posts/passkeys-first-experience/05-image.png)

![](/uploads/posts/passkeys-first-experience/06-image.png)

![](/uploads/posts/passkeys-first-experience/07-image.png)

后续：后面我设置了保存在电脑的密钥，登录时选择电脑的密钥登录直接手机相机都不需要扫，直接 Apple Watch 双击即可登录，快捷！

# 参考资料

- [Introducing passwordless authentication on GitHub.com](https://github.blog/2023-07-12-introducing-passwordless-authentication-on-github-com/)
- [https://www.passkeys.io/](https://www.passkeys.io/)
- [https://developer.apple.com/cn/passkeys/](https://developer.apple.com/cn/passkeys/)
- [https://docs.github.com/en/authentication/authenticating-with-a-passkey/about-passkeys](https://docs.github.com/en/authentication/authenticating-with-a-passkey/about-passkeys)
