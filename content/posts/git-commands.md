---
title: "常用系列-Git命令"
slug: "git-commands"
publishedAt: "2022-08-05T16:43:00.000Z"
categories:
  - "运维"
  - "命令"
  - "常用系列"
description: "记录常用的 Git 命令，包括安装、配置用户信息、文件状态管理、提交更新、推送文件、分支操作等，帮助程序员更有效地使用 Git。"
cover: "/uploads/covers/git-commands.png"
readingTime: 12
mood: "neutral"
draft: false
id: "1fab44d3-5440-80f6-ae3e-ceadf052c43d"
---
> 常用系列就是记录自己编程常用的东西，此文为常用系列第 2 篇，用于记录自己日常常用的 Git 命令，以便需要时查找。Git 尽管提供了 GUI 界面进行操作，但是我觉得 Git 的 GUI 软件有很多，但是掌握最常用的命令还是一个合格的程序员应该做的，毕竟命令到哪里都一样，但 GUI 软件万一哪一天用不了了呢🐶，而且命令行模式可以执行 Git 的**所有命令**

# Git 最基本的操作

> 文件从本地到仓库流程：以下记录一下用哪些命令可以将一个文件从自己的本地推送到远端的仓库，我把这称为基本操作

## 安装 Git

> 如果想要在 Mac 电脑安装 Git，只需要输入查询 git 版本的命令就会提示你安装（如果你之前没装过的话）

```bash
git --version
```

## 配置用户信息

> 安装完 git 之后对 git 的环境进行配置，这些配置在每台计算机只需要配置一次，当然配置完以后也可以修改，git 最常用的配置就是对用户名和邮箱地址的设置，--global代表对系统上所有仓库都生效。

```bash
# 设置用户签名，可在 .gitconfig 文件中查看
git config --global user.name <用户名>

# 设置用户邮箱，可在 .gitconfig 文件中查看
git config --global user.email <注册git仓库邮箱>

```

Config 有三个作用域：当不明确设置是默认为 local

- local：只对某个仓库有效
- system：对系统所有登录的用户有效

## 显示 config 的配置

```bash
git config --list --local

git config --list --global

git config --list --system

```

## 获取 Git 仓库

> 通常获取仓库有两种方式：
>
> - 将本地目录转换为 Git 仓库
> - 从别的地方复制一个仓库到你的本地

### 在已存在目录中初始化仓库

```bash
git init

```

这个命令会在当前目录下创建一个`.git`的目录，目录中包括初始化仓库的所有文件

### 克隆仓库

```bash
git clone https://github.com/libgit2/libgit2

```

这个命令会从远端 GitHub 的 libgit2 仓库拉取所有东西到你当前目录

## 记录文件状态

> 文件的状态有 2 种：已被跟踪、未被跟踪，跟踪的意思是现在 git 可以记录这个文件发生的所有变化（被修改、被删除、重命名）

### 查询文件状态

```bash
git status

# 简洁输出文件状态，A-先添加到暂存区、M-修改过的文件、D-删掉的文件、R-重命名的文件、??-未被跟踪的文件
git status -s

```

### 跟踪新文件

```bash
# 使用以下命令之后，一般都会再使用 git status 查看文件是否被跟踪
git add <文件名>

# 将所有待加入暂存区的文件加入暂存区
git add . / git add -A

# 将已经被 git 追踪的文件的变更加入到暂存区(不包括未被追踪的文件，即新文件)
git add -u

```

使用该命令之后，文件就会被放入 git 的暂存区，暂存区里面的文件都是即将要推送到远端仓库的候选者。

### 对比区别

对比已暂存的文件与未暂存文件之间的区别

> 通常我们修改文件过多时就会容易忘记某个文件修改过的内容，这个时候就需要查看我们做过哪些修改就可以使用diff命令

```bash
# 文件需在暂存区，即被跟踪才能使用本命令
git diff <文件名>

# 如果不加文件名，则比较的是工作区与暂存区之间的区别
git diff

```

如果你想对比暂存区里的文件与上次提交时文件的区别，就可以使用以下命令

```bash
git diff --cached

```

也可以对比两次不同 commit 之间的区别

```bash
git diff <Commit id0> <Commit id1>

# 如果是对比两个 commit 之间某个文件的区别，则加上 --
git diff <Commit id0> <Commit id1> -- [文件名]

```

### 给文件和文件夹重命名

> git mv是Git中用来重命名或移动文件或文件夹的命令

```bash
# 这个命令会将文件从旧路径移动到新路径，并且将这个更改加入到 Git 的暂存区
git mv <old-filename> <new-filename>

```

## 提交更新

> 如果你的暂存区里面已经包括你本次想要提交的文件，就可以通过commit命令对文件的修改进行提交

```bash
# 每次commit都会清空暂存区
git commit -m "<双引号里面填的是本次提交文件的一个描述信息>"

```

## 推送文件到远端

### 添加远端仓库

> 如果你不是从远端仓库克隆 clone 的文件，而是自己在本地自己创建的 git 仓库，就需要在向远端仓库推送之前加上你要推送的仓库

```bash
git remote add https://github.com/paulboone/ticgit

```

### 推送

```bash
git push origin master

```

这个命令代表着将 master 分支的代码推送到远端的 origin 服务器

**到此一个文件从创建到最终同步到远端仓库的这个过程就圆满完成。**

下面就记录一下在使用 git 的过程中遇到一些情况该使用哪些命令。

## 提交操作

### 修改上一次（最近一次） Commit

- 修改上次 commit 填的信息
- 基于上次的 commit 再次添加修改或者添加文件

以上的情况都可以使用以下这个命令

```bash
# 这个命令是基于上次的 commit 的，不会生成新的 commit
git commit --amend

```

---

# 查询

> 这里的记录是使用 git 场景下各种需要查的情况

## 查提交历史

### 整个项目历史提交记录

```bash
git log

commit ca82a6dff817ec66f44342007202690a93763949
Author: Scott Chacon <schacon@gee-mail.com>
Date: Mon Mar 17 21:52:11 2008 -0700

			changed the version number

commit 085bb3bcb608e1e8451d4b2432f8ecbe6306e7e7
Author: Scott Chacon <schacon@gee-mail.com>
Date: Sat Mar 15 16:40:33 2008 -0700

			removed unnecessary test

# 以一行的形式展示过往所有的提交
git log --pretty=oneline

# 分支提交图
git log --graph
git log --graph --pretty=oneline --abbrev-commit

# 仅查看最近K次的提交
git log -n K

```

输出的内容依次是：

- 每个提交的 SHA-1 校验和
- 提交人的名字
- 邮箱地址
- 提交时间
- 提交说明

### 文件的历史提交记录

> 查看单个文件每次的提交记录

```bash
git log -p <文件名>

# 只显示最近 2 次提交
git log -p -2 <文件名>

```

### 每一行的提交记录

> 能显示任何文件中每行最后一次修改的提交记录

```bash
git blame <文件名>

# 限定显示哪一行
git blame -L 69,82 <文件名>

```

## 查找BUG

> 很多时候，当前分支出现问题了，但不清楚哪里出现了问题，就可以使用git bisect命令查找哪一次代码提交引入了错误

这个命令使用的原理是二分查找的原理：

通过二分【**代码是没问题的提交** \~ **当前有问题的分支**】这个范围找到可能有问题的那一次提交

`git bisect start`命令启动查错，它的格式如下:

```bash
$ git bisect start [终点] [起点]

```

**终点**是最近的提交，**起点**是更久以前的提交。它们之间的这段历史，就是差错的范围

当不清楚哪个起点提交时没问题的时候可以选择最开始的分支

```bash
# 终点是当期分支 HEAD，起点是第一次提交 4d83cf
git bisect start HEAD 4d83cf

```

执行上面的命令以后，当前的代码就会切换到这段范围当中中间的那一次提交

然后你就可以对当前代码进行测试，如果是没有问题就执行以下命令对本次提交进行标识

```bash
git bisect good

```

如果没问题就意味着错误是在代码历史的后半段引入的。执行上面的命令，Git 就自动切换到后半段的中点

然后再进行测试，如果是有问题的就标识这个提交是有问题的

```bash
git bisect bad

```

到这里不是就结束了哦，有问题只是这次有问题，但我们需要找到第一次有问题的提交

接下来，不断重复这个过程，直到成功找到出问题的那一次提交为止。这时，Git 会给出如下的提示。

```bash
b47892 is the first bad commit

```

然后就可以去分析这次都提交了哪些文件，从而分析错误是什么原因引起的

**注意：代码缺陷需要自己去判断的，git 是没办法帮你分析出哪里有问题**

然后，使用`git bisect reset`命令，退出查错，回到最近一次的代码提交。

## 查找内容

> 由于 git 与 Linux命令一样，同样可以与 grep搭配使用

```bash
git grep -n ""

```

---

# 撤销

> 我们在操作 Git 的时候难免会出现出错的时候，修改错误的办法一般不是重新修改就是回退到没问题的时候

## 文件的撤销

### 工作区的操作

1. 将文件尚未加入暂存区的修改全部撤销

```bash
# -- 很重要，没有--，就变成了“切换到另一个分支”的命令
git checkout -- <文件名>

# 恢复暂存区的所有文件到工作区
git checkout .

# 恢复 commit 的指定文件到暂存区和工作区
git checkout [commit] [file]

```

1. 将工作区相对于暂存区的修改撤销，如果暂存区没有对应的文件则回退到HEAD指向的版本

```bash
git restore <文件名>

```

### 暂存区区的操作

1. 将暂存区的文件修改撤销掉（unstage），重新放回工作区

```bash
git reset HEAD <文件名>

# 如果不加文件名，则是将暂存区的所以文件都重新放回工作区
git reset HEAD

```

## 版本的撤销

> 常用于提交版本之后，远端发生冲突无法 merge 分支，用git resrt回退版本处理完冲突后再进行推送

```bash
# 将commit过的代码库回滚到上一个版本
git reset --hard HEAD^ 或 git reset --hard HEAD~

# 往上回滚两次版本，以此类推
git reset --hard HEAD^^：

# 往上回滚100个版本
git reset --hard HEAD~100：

# 回滚到某一特定版本，版本号为前7位，使用git reflog可以查出
git reset --hard 版本号：

```

---

# 堆栈操作

> 平时开发的时候会经常出现一个需求开发到一定程度，本地代码已经修改很多了，但是突然有一个临时的 BUG 需要紧急处理，这个时候已经修改过的代码就可以通过放进 git 的堆栈中进行保存，等 BUG 处理完之后再恢复现场继续需求的开发

```bash
# 将本地的修改保存到堆栈中
git stash

# 查看堆栈中的情况
git stash list

# 将堆栈中的最顶部的修改恢复，不会将堆栈的信息删除掉
git stash apply

# 将堆栈中的最顶部的修改恢复，同时会将堆栈的信息删除掉
git stash pop

```

---

# 分支操作

## 分支基本操作

```bash
# 列出所有本地分支，当前分支前面会标一个*号
$ git branch

# 列出所有远程分支
$ git branch -r

# 列出所有本地分支和远程分支，并详细展示分支信息
$ git branch -av

# 新建一个分支，并切换到该分支
$ git checkout -b [branch]

# 切换到指定分支，并更新工作区
$ git checkout [branch-name]

# 切换到上一个分支
$ git checkout -

# 删除分支，删除的前提是要删除的这个分支的修改已经合并到上游分支，否则会删除失败
$ git branch -d [branch-name]

# 强制删除分支，无视警告
$ git branch -D [branch-name]

```

## merge

> 用于合并两个分支

```bash
# 合并指定分支到当前分支
$ git merge [branch]

```

## rebase

> 也用于分支合并

合并分支的操作与merge基本一样，

```bash
# 合并指定分支到当前分支
git rebase [branch]

```

如果git rebase遇到冲突:

1. 第一步手动解决冲突，然后把新修改的文件加入暂存区 `git add .`
2. 之后并不需要 `git commit`，而是直接运行`git rebase --continue`

至于`git merge` 与 `git rebase`有什么区别呢？

- `git merge`合并完之后会显示出来合并之前的分支，而`git rebase`合并之后看起来并不会有之前合并的分支记录
- 分支合并的顺序也不一样

详细可以看一下这个博客 [git merge 和 git rebase 小结](https://blog.csdn.net/wh_19910525/article/details/7554489)

## cherry-pick

> 合并指定提交到当前分支

```bash
# 选择一个 commit，合并进当前分支
git cherry-pick [commit]

# 合并多次提交到当前分支
git cherry-pick <HashA> <HashB>

# 合并联系一段的提交，A 提交必须早于 B，提交 A 不会包含本次提交
git cherry-pick A..B

# 合并联系一段的提交，A 提交必须早于 B，本次提交包含提交 A
git cherry-pick A^..B

```

如果 `cherry-pick`过程中发送冲突，则在手动处理完冲突之后使用`--continue`命令让过程继续

1. 解决代码冲突后，将修改的文件重新加入暂存区`git add .`
2. 使用下面的命令，让 Cherry pick 过程继续执行。

```bash
 git cherry-pick --continue

```

# 参考资料

- [Git 官网](https://git-scm.com/book/zh/v2)
- [git bisect 命令教程](http://www.ruanyifeng.com/blog/2018/12/git-bisect.html)
- [git cherry-pick 教程](https://www.ruanyifeng.com/blog/2020/04/git-cherry-pick.html)
- [Git 教程-开发者手册](https://cloud.tencent.com/developer/doc/1096)
- [一个一步一步显示 git 命令的网站](https://gitexplorer.com/)
