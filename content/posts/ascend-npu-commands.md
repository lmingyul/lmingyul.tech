---
title: "华为昇腾环境常用命令"
slug: "ascend-npu-commands"
publishedAt: "2025-04-01T09:38:00.000Z"
categories:
  - "运维"
  - "命令"
  - "LLM"
description: "提供华为昇腾环境的常用命令，包括OBS文件的上传、下载和管理，以及npu-smi命令用于监控NPU状态和性能，确保环境正常运行的验证方法。"
cover: "/uploads/posts/ascend-npu-commands/01-image.png"
readingTime: 6
mood: "neutral"
draft: false
id: "1fcb44d3-5440-8035-9e04-ca24c8f41db4"
---
# obs 文件上传、下载、拷贝

使用的是华为云开发的工具库，适用于 ModelArts 平台上进行文件操作（如 OBS 文件的上传、下载和管理），简化了与 OBS（对象存储服务） 交互的过程

使用前必须要安装：

```shell
# 环境镜像中有也可以不用安装
pip install moxing
```

## 上传

从本地环境上传到 OBS

- 进入python 交互式环境
- 输入以下代码：

```py
import moxing as  mox

local_path = "/cache/my-file.txt"
obs_path = "obs://<桶名>/path/"

# 上传单个文件
mox.file.copy(local_path，obs_path)

# 如果上传的是目录，可以使用 copy_parallel
mox.file.copy_parallel(local_path，obs_path)

```

## 下载

下载与上传类似，将 local\_path 与 obs\_path 位置互换即可

## obs 内部不同桶之间拷贝文件

```py
import moxing as  mox

src_obs_path = "obs://<桶名>/path/"
target_obs_path = "obs://<桶名>/path/"

# 上传单个文件
mox.file.copy(local_path，obs_path)

# 如果上传的是目录，可以使用 copy_parallel
mox.file.copy_parallel(src_obs_path，target_obs_path)
```

## 删除

```py
# 删除单个文件
moxing.file.remove(file_name)

# 递归删除
moxing.file.remove(src_dir, recursive=True)
```

# npu-smi 命令

## 什么是 npu-smi

npu-smi 是华为提供的一个命令行工具，专门用于管理和监控华为昇腾（Ascend）系列神经网络处理器（NPU）的状态和性能，似于 NVIDIA 的 nvidia-smi。

## npu-smi 字段含义

![](/uploads/posts/ascend-npu-commands/01-image.png)

| 字段 | 说明 |
| --- | --- |
| npu-smi | npu-smi 工具版本 |
| Version | 驱动版本 |
| NPU | 设备 id |
| Name | 芯片名称 |
| Health | 芯片的健康状态, 有如下五种状态: OK、Warning、Alarm、Critical 和 UNKNOWN |
| Power(W) | 芯片功率 |
| Temp | 芯片温度 |
| Hugepages Usage(page) | 大页占比 (单位 page)，每一个 page 的大小是 2048KB。 |
| Chip | 芯片 id |
| Device | 芯片操号 |
| Bus-Id | BUS ID |
| AICore(%) | AICore 占用率 |
| Memory-Usage(MB) | 内存占比 |

## npu-smi 可以使用的命令

可以使用的命令是：

- `-v` 查询工具的版本信息
- info 可以查看各种信息
- set 修改设备配置属性
- clear 清除设备信息
- upgrade 升级 MCU 固件

```shell
[HwHiAiUser@llmservice-37pw7-master-0 ~]$ npu-smi --help
Usage: npu-smi <Command|-h|-v> [Options...]

npu-smi Command:
        -h            This command's help information
        --help        This command's help information
        -v            Show npu-smi version information
        info          Show hardware details
        set           Modify device configuration properties
        clear         Clear device information
        upgrade       Upgrade MCU firmware

```

### npu-smi info 常用命令

```shell
[HwHiAiUser@llmservice-37pw7-master-0 ~]$ npu-smi info --help
Usage: npu-smi info <watch|proc|-h|-m|-l|-t type> [Options...]

Commands:
       watch          Show all device's status in scrolling format
       proc           Show device's matrix process status in scrolling format
       -h, --help     Show this help text and exit
       -m             Show all device's mapping information
       -l             Show all device's topology information
       -t type        Show information for type
                      type: board, flash, memory, usages, sensors, temp, power, volt, mac-addr,
                            common, health, product, ecc, ip, sys-time, i2c_check, work-mode,
                            ecc-enable, p2p-enable, ssh-enable, license, customized-info,
                            device-share, nve-level, aicpu-config, pcie-err, mcu-monitor,
                            err-count, boot-area, vnpu-mode, info-vnpu, vnpu-svm, cpu-num-cfg,
                            first-power-on-date, proc-mem, phyid-remap, vnpu-cfg-recover, key-manage,
                            template-info, pkcs-enable, p2p-mem-cfg, pwm-mode, pwm-duty-ratio,
                            boot-select, topo, hccs.

Options:
       -i %d          Card ID
       -c %d          Chip ID
       -p %d          Chip Physical ID

```

```shell
# 查询芯片监控数据
npu-smi info watch

[HwHiAiUser@llmservice-37pw7-master-0 ~]$ npu-smi info watch
NpuID(Idx)  ChipId(Idx) Pwr(W)      Temp(C)     AI Core(%)  AI Cpu(%)   Ctrl Cpu(%) Memory(%)   Memory BW(%)
3           0           88.1        35          0           0           0           5           0
5           0           92.8        40          0           0           0           5           0
3           0           88.1        35          0           0           0           5           0
5           0           92.9        40          0           0           1           5           0

# 固定间隔时间监控数据(-d 间隔时间 s)
npu-smi info watch -d 5
NpuID(Idx)  ChipId(Idx) Pwr(W)      Temp(C)     AI Core(%)  AI Cpu(%)   Ctrl Cpu(%) Memory(%)   Memory BW(%)
5           0           118.9       43          6           0           4           63          4
6           0           113.4       39          6           0           2           55          4
5           0           120.6       43          6           0           2           63          4
6           0           115.8       40          6           0           0           55          4

# 固定间隔时间监控详细信息(每 5 秒更新一次)
watch -n 5 npu-smi info

Every 5.0s: npu-smi info                                                                 llmservice-ncmwl-69bc54b874-rx2vz: Mon Mar 10 10:04:56 2025

+------------------------------------------------------------------------------------------------+
| npu-smi 24.1.rc1                 Version: 24.1.rc1                                             |
+---------------------------+---------------+----------------------------------------------------+
| NPU   Name                | Health        | Power(W)    Temp(C)           Hugepages-Usage(page)|
| Chip                      | Bus-Id        | AICore(%)   Memory-Usage(MB)  HBM-Usage(MB)        |
+===========================+===============+====================================================+
| 5     910B3               | OK            | 121.7       43                0    / 0             |
| 0                         | 0000:02:00.0  | 6           0    / 0          41486/ 65536         |
+===========================+===============+====================================================+
| 6     910B3               | OK            | 116.1       40                0    / 0             |
| 0                         | 0000:41:00.0  | 7           0    / 0          37316/ 65536         |
+===========================+===============+====================================================+
+---------------------------+---------------+----------------------------------------------------+
| NPU     Chip              | Process id    | Process name             | Process memory(MB)      |
+===========================+===============+====================================================+
| 5       0                 | 161201        | python3                  | 34463                   |
| 5       0                 | 3655444       | python3                  | 3652                    |
| 5       0                 | 161202        | python3                  | 99                      |
| 5       0                 | 3078747       | python3                  | 119                     |
+===========================+===============+====================================================+
| 6       0                 | 3655444       | python3                  | 1303                    |
| 6       0                 | 161202        | python3                  | 32689                   |
+===========================+===============+====================================================+

# 查询单个卡常用利用率信息，common 对应的是常规利用率，usages 对应的是详细的利用率
npu-smi info -t common -i 3

[HwHiAiUser@llmservice-37pw7-master-0 ~]$ npu-smi info -t common -i 3
        NPU ID                         : 3
        Chip Count                     : 1

        Chip ID                        : 0
        Memory Usage Rate(%)           : 0
        HBM Usage Rate(%)              : 5
        Aicore Usage Rate(%)           : 0
        Aicore Freq(MHZ)               : 1800
        Aicore curFreq(MHZ)            : 800
        Aicore Count                   : 20
        Temperature(C)                 : 36
        NPU Real-time Power(W)         : 88.0

        Chip Name                      : mcu
        Temperature(C)                 : 33

# 查看设备 CPU 和 NPU 的亲和性关系，多 NPU 之间的拓扑结构
npu-smi info -t topo

           NPU3       NPU5       CPU Affinity
NPU3       X          HCCS       96-143
NPU5       HCCS       X          0-47

Legend:

  X    = Self
  SYS  = Path traversing PCIe and NUMA nodes. Nodes are connected through SMP, such as QPI, UPI.
  PHB  = Path traversing PCIe and the PCIe host bridge of a CPU.
  PIX  = Path traversing a single PCIe switch
  PXB  = Path traversing multipul PCIe switches
  HCCS = Connection traversing HCCS.
  NA   = Unknown relationship.

```

---

# 常用命令

## 查看操作系统信息

可以看到是华为默认的操作系统 EulerOS （基于 CentOS）

```py
[HwHiAiUser@llmservice-37pw7-master-0 LR43.10_trl]$ cat /etc/os-release
NAME="openEuler"
VERSION="22.03 (LTS-SP3)"
ID="openEuler"
VERSION_ID="22.03"
PRETTY_NAME="openEuler 22.03 (LTS-SP3)"
ANSI_COLOR="0;31"

```

## 查看 CPU 信息

```py
cat /proc/cpuinfo

...
processor       : 191
model name      : Unknown(jws) Model
model type      : General Arm64 Type(jws)
BogoMIPS        : 200.00
Features        : fp asimd evtstrm aes pmull sha1 sha2 crc32 atomics fphp asimdhp cpuid asimdrdm jscvt fcma dcpop asimddp asimdfhm ssbs
CPU implementer : 0x48 <- 这个是 ARM 架构实现厂商列表编号，其中 0x48 对应的是 华为海思
CPU architecture: 8
CPU variant     : 0x1
CPU part        : 0xd01
CPU revision    : 0

```

---

# 验证环境是否正常

## 检验 NPU 是否正常

使用 pytorch 测试

```py
import torch
import torch_npu

x = torch.randn(2,2).npu()
y = torch.randn(2,2).npu()
z = x.mm(y)
print(z)

```

```shell
[HwHiAiUser@llmservice-37pw7-master-0 LR43.10_trl]$python
Python 3.8.10 (default, Aug  2 2024, 18:14:32)
[GCC 10.3.1] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> import torch
>>> import torch_npu
/usr/local/lib/python3.8/site-packages/torch_npu/utils/path_manager.py:82: UserWarning: Warning: The /usr/local/Cann/ascend-toolkit/8.0.RC2.2/aarch64-linux/ascend_toolkit_install.info owner does not match the current user.
  warnings.warn(f"Warning: The {path} owner does not match the current user.")
>>> x = torch.randn(2,2).npu()
[W compiler_depend.ts:623] Warning: expandable_segments currently defaults to false. You can enable this feature by `export PYTORCH_NPU_ALLOC_CONF = expandable_segments:True`. (function operator())
>>> y = torch.randn(2,2).npu()
>>> z = x.mm(y)
>>> print(z)
Warning: Device do not support double dtype now, dtype cast repalce with float.
tensor([[ 1.1999, -1.5731],
        [-2.9989, -0.0475]], device='npu:0')
>>>

```

# 参考地址

[🔗 https://support.huawei.com/enterprise/zh/doc/EDOC1100079287/10dcd668](https://support.huawei.com/enterprise/zh/doc/EDOC1100079287/10dcd668)
