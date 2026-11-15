---
title: "常用系列-Linux 常用命令"
slug: "linux-command"
publishedAt: "2022-06-26T15:54:00.000Z"
categories:
  - "Linux"
  - "命令"
  - "常用系列"
description: "常用系列就是记录自己编程常用的东西，此文为常用系列第 1 篇，用于记录自己日常开发编程时常用的 Linux 命令，以便需要时查找。\n"
cover: "/uploads/covers/linux-command.png"
coverLqip: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAIAAAAC64paAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEuElEQVR4nAXBWVMaBwAA4P0VfclMxmmaQ401mGg8SBAQQZFdFjl2uZZjWZZDLldulEOCgMGj3iIaqTE1Yo1GkqrkjqlH0kkyxo6d6WT6kOnkrdPpe78P+Pfrn19PD76cvD7d2zzIx0pp3YiOE1aw78fUn7ci/x2N/fNmdC/r6pczFA3lrbQK1tXq1oZrTEYTi98OHJfuHqxNvPppaCcXe5gy3XWLolJGCGnLedXvFnr+3kl82Rl4Pm6NoQy06XIHo0kGggoYVECCLpUaWL9F3g1hC355zo/OUeJBHdcD3oxL2rKktBTGP0xR72Y923F8VNli41w3CDvsWo0WUyGEweLzAGMOZMQuG3WhEz3odA9y2yYNYGAQZkVYtbPtjQ81giIp2dCBKxJWtoM+IeJmFLAHR8iQvWukDxiKUCMR11DYkQyQsR7M71RZCATr5BkaaX21l7Nt9PtywRIiWOQz7jXTlunf59jX5rTN+ahocVAO9MdCDsqBGLV8g4Knl8I6EYrBiFJCSKAQyLkt65i0YKNWwyDSOcWsy9VenK2/tCKreOGv2otcBiDC1ojgFyDxOYmoBhXCSq5B0aLXiLtIdczYmcDBJCFKGNCgEu2H+cN85hC7drr9YslW9jF6BrgKayuFmkuwtEYu4SlgtbTFhjSTynaLoTNo4oc1LQNS1i1RSzcCujHkll7RB7KDjPJl5dm3gW8Ak1CM4wbSgXsoTcSsDMoFvXKuV8216EHCJLMqhSGQExEy3RjPQaAupZRooRvqK+KCC/OaMmBZ17ngJpYSXVtpy+OgsWDTL1tUcwQUx0HcYkRwCyEWU2KmW8+x6sQYt0VVV21m0HxgnVdAA7YGnPle82LMujtEHcWsb/yWUm/3lte8apWPkRhFWgiV0ilm+SV0CmKbmuqdjbS0jJUh2h0IG3izXXhSyG3mhp7Np44zPR89mteUbttrLrrND+z4HKkZVEuHIWaKedXbUGOquxZkN6x2S1aHjf4IBhy8P/50/OHk6OXvT1dPf4z/1qs+tEL7JPSUlDw0oqtqeE3Muc9tyNRWUlUXjVWVnqYreatgMa239yqBlZX10qPi8d7O6ZN7b+9EN8PaXR9y0is/cYl+1fCeixnPO+rXm2mp6vPd58+az5810y4EhPReLc8kYwEzLtN8uHtnIX24lH7xg7sYNbxIm04X/SeT1KFPeahv3Rc3FpqrIpVllnNn8PIyTX21hndTJ2ATHc1ARieMY9CETbUSJB/ErLvp7mfjgcfz8fWZ2M9J524A3Xe2baA3YswaB73axaqxttNxIccobnMq+MCUF0+qobSIM62B7vjxXNo3nAqNpn3LY8HCD77CgLGUQJ/1q5d82LhTMWXrHDGDKZMwZYbjRhjI9xlzTkXejm4nraVp/8xgTyaCF4YMr+fdxZngXNqdS3QVx1wvs77iuGctadlKaB9ElZMOkRttBXwydsYEryXM7+/F/9hIHeYDe1PGw2ndfta+OekdTvnDMe9wyvN4yrM3Sz0aNK2GlWNdkAm8wb1OAzhXviN4tRkS2rpt+7QS/Wuj//Nq4OMd51HWsT/vXh/rSUbtFEWOh/SvRolfEuqkgY+11rNo5RXnvv0f/UAd6xKuIQsAAAAASUVORK5CYII="
coverBg: "#a1917b"
coverFg: "#fff"
mood: "neutral"
draft: false
id: "bc78672f-ddce-4c2d-87cf-d6b93f39e64c"
---
## 查看目录

### ls

```shell
# 回到上一个目录
cd - 

# 显示所有文件
ls -a

# 显示目录中的文件按照修改时间排序
ls -lht 
```

### tree

> 展示当前目录的文件结构

```shell
# 展示当前目录的文件结构
tree -FC /
  -a：展示隐藏文件
  -C: 颜色显示
  -L 2: 只显示2层
  -F: 显示目录后面的\；显示可执行文件*；功能类似ls -F
```



## 修改文件权限

```shell
# 修改文件权限
chmod

# 给xxx添加可写权限，常用于给需要运行的脚本赋予权限
chmod +x xxx

# 给xxx添加可读权限
chmod +r xxx

# 将xxx的权限改成777 ，所有人都对这个文件可读可写可运行
chmod 777 xxx

# 递归修改整个文件夹的权限
chmod 777 xxx -R
```



## 查看文件内容

### more

```shell
# 浏览文件内容
more <filename>  
回车：下一行
空格：下一页 # 页面进度增加36%
b：上一页
q：退出
```



### less

```shell
# 与more类似，功能更全
less  
回车：下一行
y：上一行
Page Down：下一页
Page Up：上一页
q：退出
```



### tail

```shell
# 展示文件末尾3行内容
tail -3 <filename>   

# 常用于观察日志写入过程
tail -f -n 1000 <filename>  
```



## 管道相关

### wc

```shell
# 输出结果依次为统计行数、单词数、字节数
wc

wc -l：统计行数
wc -w：统计单词数
wc -c：统计字节数
```



### grep

```shell
# 在文件中过滤出给定的match_patten
grep match_patten <file>
常用参数
-c 统计文件中包含文本的次数
-n 打印匹配的行号
-i 搜索时忽略大小写

# 从stdin中读入若干行数据，如果某行中包含xxx，则输出该行。--color代表高亮显示
grep xxx --color   

# 在多级目录中对文本递归搜索(程序员搜代码的最爱）
grep "class" . -R -n

# 找到使用过的命令
history | grep <命令>
```



### xargs

> xargs 能够将输入数据转化为特定命令的命令行参数；这样，可以配合很多命令来组合使用。比如 `grep`，`find`；

```shell
xargs参数说明

-d 定义定界符 （默认为空格 多行的定界符为 n）
-n 指定输出为多行
-I {} 指定替换字符串，这个字符串在xargs扩展时会被替换掉,用于待执行的命令需要多个参数时
-0：指定0为输入定界符

将多行输出转化为单行输出
cat file.txt| xargs

将单行转化为多行输出，-n：指定每行显示的字段数
cat single.txt | xargs -n 3

cat file.txt | xargs -I {} ./command.sh -p {} -1
```



### cut 

> 用于从每行中删除部分内容

```shell
#分割一行内容，从stdin中读入多行数据
示例：
echo $PATH | cut -d ':' -f 3,5 输出PATH用:分割后第3、5列数据

echo $PATH | cut -d ':' -f 3-5 输出PATH用:分割后第3-5列数据

echo $PATH | cut -c 3,5 输出PATH的第3、5个字符

echo $PATH | cut -c 3-5 输出PATH的第3-5个字符
```



## 查找文件

### locate

> 按照路径名查找文件，查找的范围在 /var/lib/mlocate/ 这个数据库中，存储在内存中，每天更新一次，所以无法用 locate 搜索新建的文件，可以使用 updatedb 来立即更新数据库。
>
> 系统如果没有自带`locate`命令，可以使用`yum install mlocate -y`安装，安装结束执行`updatedb`命令

```shell
# 查找名称含有 zip 文件
lcoate zip
```



### find命令

> 以文件名查找文件

```shell
# 搜索某个文件路径下的所有*.py文件
find /path/to/directory/ -name '*.py' 

# 忽略大小写搜索
find /home -iname "*.txt" 

# 当前目录及子目录下查找所有以.txt 和.pdf 结尾的文件
find . -name "*.txt" -o -name "*.pdf"  

# 查看当前目录下文件个数
find ./ | wc -l   

# 按类型搜索，只列出所有目录，-type f 文件 / l 符号链接 / d 目录
find . -type d -print

# 限定查找文件的大小，+1M 代表查找大于 1M 的文件
find ./ -type f -name "*.py" -size +1M

# 删除符合条件的文件，下面的命令能够当前删除当前目录下后缀为 .bak 的文件
find ./ -type f -name "*.bak" -delete
```



## sed文本替换

> sed一般用于对文本内容做替换，操作时是逐行操作

sed的基本工作方式是：

- 将文件以行为单位读取到内存（这个内存也叫模式空间）
- 使用sed的每个脚本对该行进行操作
- 处理完成后输出该行

格式

sed ‘操作命令’ 一个或多个文件

```shell
sed的替换命令s:
sed 's/旧的字符串/新的字符串/' 文件名

sed接多个指令
sed -e 's/旧的字符串/新的字符串/' -e 's/旧的字符串/新的字符串/' 文件名

首处替换
sed 's/text/replace_text/' file   //替换每一行的第一处匹配的text

全局替换
sed 's/text/replace_text/g' file

默认替换后，输出替换后的内容，如果需要直接替换原文件,使用-i:
sed -i 's/text/repalce_text/g' file

移除空白行
sed '/^$/d' file

第一个匹配的括号内容使用标记 1 来引用
sed 's/hello\([0-9]\)/\1/' file
```


## Bash键盘技巧

```shell
# 将光标移到行首第一个字符
Ctl + a

# 将光标移到行首第一个字符
Ctl + e

# 删除光标到行首的所有字符
Ctl + u   

# 常用： 
# 删除输入的内容
Ctl + e + Ctl + u   
```



## 归档与备份

### gzip

> 压缩单个或多个文件

```shell
gzip foo.text
```



### gunzip

> 解压文件

```shell
# 压缩，生成foo.txt.gz
gunzip foo.text
```



### zip

> 压缩和归档成 .zip 文件

```shell
zip -r text.zip text
```



### unzip

> 解压 .zip 的文件

```shell
unzip text.zip
```



### tar

> 归档多个文件或目录

```shell
# 打包与 gzip 配合
tar -zcvf <打包压缩后的文件名> <要打包压缩的文件> 
z：调用 gzip 压缩命令进行压缩
c：打包文件
v：显示运行过程
f：指定文件名

# 解压
tar -zxvf test.tar.gz -C /usr**（- C 代表指定解压的位置）
x：代表解包

```



## 查看磁盘空间

```shell
# 查看磁盘空间利用大小:-h: human缩写，以易读的方式显示结果
df -hT

# 查看当前目录所占空间大小，-s 递归整个目录的大小
du -sh

# 查看当前目录下所有子文件夹排序后的大小:
for i in `ls`; do du -sh $i; done | sort
或者：
du -sh `ls` | sort
```



## 查询进程

### ps

```shell
# 查询正在运行的进程信息:
# VSZ-虚拟内存大小 RSS-该进程占用的 RAM 数量
ps -aux/ ps -ef
```

### top

```shell
# 显示进程信息，并实时更新
top
打开后，输入M：按使用内存排序
打开后，输入P：按使用CPU排序,查看系统中使用CPU、使用内存最多的进程
打开后，输入i:使top不显示任何闲置或者僵死进程
打开后，输入q：退出
```

### lsof

```shell
# 查看端口占用的进程状态：
lsof -i:3306

# 查看用户username的进程所打开的文件
lsof -u username

# 查询init进程当前打开的文件
lsof -c init
```

### 其他 

```shell
# 查询进程ID（适合只记得部分进程字段）
pgrep -l <进程名>

# 查看占用端口的进程
netstat -anp | grep port
```

## 终止进程

```shell
# 杀死指定PID的进程 (PID为Process ID)
kill PID

# 杀死相关进程
kill -9 3434

# 杀死job工作 (job为job number)
kill %job
```

## 分析线程栈

> 使用命令pmap，来输出进程内存的状况，可以用来分析线程堆栈；

```shell
pmap PID
```

# 性能监控

## 监控CPU

```shell
# 查看CPU使用率
sar -u

eg:
$sar -u 1 2
后面的两个参数表示监控的频率，比如例子中的1和2，表示每秒采样一次，总共采样2次；

# 查看CPU平均负载，sar指定-q后，就能查看运行队列中的进程数、系统上的进程大小、平均负载等；
sar -q 1 2
```

## 查询内存

```shell
# 查看内存使用状况 sar指定-r之后，可查看内存使用状况;
sar -rh 1 2

# 查看内存使用量
free -mh
```

## 查询端口占用

```shell
# 查看当前系统端口使用情况
netstat -an

# 展示进程加被占用的端口
netstat -ntlp
```



## 查询页面交换

> 查看页面交换发生状况 页面发生交换时，服务器的吞吐量会大幅下降；服务器状况不良时，如果怀疑因为内存不足而导致了页面交换的发生，可以使用sar -W这个命令来确认是否发生了大量的交换；

```shell
sar -W 1 3
```

## 综合应用

> 当系统中sar不可用时，可以使用以下工具替代：linux下有 vmstat、Unix系统有prstat

eg： 查看cpu、内存、使用情况： vmstat n m （n 为监控频率、m为监控次数）

```shell
vmstat 1 3
procs -----------memory---------- ---swap-- -----io---- -system-- ----cpu----
r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa
0  0  86560  42300   9752  63556    0    1     1     1    0    0  0  0 99  0
1  0  86560  39936   9764  63544    0    0     0    52   66   95  5  0 95  0
0  0  86560  42168   9772  63556    0    0     0    20  127  231 13  2 84  0
```

使用watch 工具监控变化 当需要持续的监控应用的某个数据变化时，watch工具能满足要求； 执行watch命令后，会进入到一个界面，输出当前被监控的数据，一旦数据变化，便会高亮显示变化情况；

eg：操作redis时，监控内存变化：

```shell
watch -d -n 1 './redis-cli info | grep memory'
(以下为watch工具中的界面内容，一旦内存变化，即实时高亮显示变化）
Every 1.0s: ./redis-cli info | grep memory                                                                  Mon Apr 28 16:10:36 2014

used_memory:45157376
used_memory_human:43.07M
used_memory_rss:47628288
used_memory_peak:49686080
used_memory_peak_human:47.38M
```


## ping

> 向指定的主机发送 ICMP 数据包，用于确认与主机的网络连接。发送的时间间隔为 1 s，用 Ctrl + C中断发送，正常网络会显示 0% 的分组丢失率

```shell
# 检查是否连网
ping www.baidu.com
```



## traceroute

> 会列出网络从本地到注定主机经过的所有跳数

```shell
# 会显示经过路由器的主机名、IP地址及本地到该路由器3个往返时间采样数据
traceroute -I www.baidu.com
```



## ip

>是一个多功能的网络配置工具，用于检查系统的网络接口和路由表

- 会显示多个网络接口，常见接口：
  - lo：环回接口，是一个虚拟接口，系统用于 “和自己对话”
  - eth0: 以太网接口
- 接口第一行如果含有 `UP`字样，表明该接口已启用
- 第3行 inet 字段为该网络接口的 IP 地址

```shell
# 
~$ ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 00:16:3e:0e:a0:8b brd ff:ff:ff:ff:ff:ff
    inet 172.30.140.229/20 brd 172.30.143.255 scope global dynamic eth0
       valid_lft 310094870sec preferred_lft 310094870sec
    inet6 fe80::216:3eff:fe0e:a08b/64 scope link
       valid_lft forever preferred_lft forever
3: docker0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default
    link/ether 02:42:53:b2:cd:34 brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.1/16 brd 172.17.255.255 scope global docker0
       valid_lft forever preferred_lft forever
```



## netstat

> 用于检查各种网路设置和统计信息，需安装`net-tools yum install net-tools`

```shell
# 检查系统的网络接口
netstat -ie

# 查看所有网络连接
netstat -nt

```



## ssh

> 用于本地主机与远程主机进行通信

```shell
# 需要输入 remote-sys 主机 ubuntu 用户的登录密码
ssh ubuntu@remote-sys
```



## 其他常用命令

```shell
# 常与别名命令 alias 一起使用，=号两边不能有空格，被别名的命令需要用单引号包含
alias ll='ls -alh'

# 查看两个文件间的差别:
diff file1 file2

# 查看带有SVN的环境变量值：
env | grep SVN
```



# 参考资料

- [Linux基础 - Linux Tools Quick Tutorial](https://linuxtools-rst.readthedocs.io/zh_CN/latest/base/index.html)
- [Linux命令手册](http://linux.51yip.com/)
- [工作中常用的的 Linux 命令](https://www.cnblogs.com/michael-xiang/p/10404016.html)
- [Linux 命令搜索](https://wangchujiang.com/linux-command/)
