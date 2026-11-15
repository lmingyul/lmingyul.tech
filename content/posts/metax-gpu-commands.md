---
title: "沐曦卡环境常用命令"
slug: "metax-gpu-commands"
publishedAt: "2026-01-20T03:32:00.000Z"
categories:
  - "运维"
  - "命令"
  - "LLM"
description: "沐曦卡环境常用命令"
cover: "/uploads/covers/metax-gpu-commands.png"
readingTime: 3
mood: "neutral"
draft: false
id: "416b44d3-5440-81b3-bb34-fc58cc77dd65"
---
# 监控工具 mx-smi

## 常用命令

### 显示 GPU 的显存、功耗、温度、利用率及进程列表

```bash
# 显示 GPU 的显存、功耗、温度、利用率及进程列表
mx-smi

mx-smi  version: 2.2.9

=================== MetaX System Management Interface Log ===================
Timestamp                                         : Mon Jan 19 19:20:17 2026

Attached GPUs                                     : 1
+---------------------------------------------------------------------------------+
| MX-SMI 2.2.9                       Kernel Mode Driver Version: 3.4.4            |
| MACA Version: 2.33.1.8             BIOS Version: 1.30.0.0                       |
|------------------+-----------------+---------------------+----------------------|
| Board       Name | GPU   Persist-M | Bus-id              | GPU-Util      sGPU-M |
| Pwr:Usage/Cap    | Temp       Perf | Memory-Usage        | GPU-State            |
|==================+=================+=====================+======================|
| 0     MetaX C500 | 0           Off | 0000:45:00.0        | 0%          Disabled |
| 69W / 350W       | 50C          P0 | 826/65536 MiB       | Available            |
+------------------+-----------------+---------------------+----------------------+

+---------------------------------------------------------------------------------+
| Process:                                                                        |
|  GPU                    PID         Process Name                 GPU Memory     |
|                                                                  Usage(MiB)     |
|=================================================================================|
|  no process found                                                               |
+---------------------------------------------------------------------------------+

End of Log

```

### 每秒刷新一次状态

```bash
# 每 1000 毫秒刷新一次状态，按 ctrl + c 退出
mx-smi -l 1000

=================== MetaX System Management Interface Log ===================
Timestamp                                         : Mon Jan 19 19:24:48 2026

Attached GPUs                                     : 1
+---------------------------------------------------------------------------------+
| MX-SMI 2.2.9                       Kernel Mode Driver Version: 3.4.4            |
| MACA Version: 2.33.1.8             BIOS Version: 1.30.0.0                       |
|------------------+-----------------+---------------------+----------------------|
| Board       Name | GPU   Persist-M | Bus-id              | GPU-Util      sGPU-M |
| Pwr:Usage/Cap    | Temp       Perf | Memory-Usage        | GPU-State            |
|==================+=================+=====================+======================|
| 0     MetaX C500 | 0           Off | 0000:45:00.0        | 0%          Disabled |
| 69W / 350W       | 51C          P0 | 826/65536 MiB       | Available            |
+------------------+-----------------+---------------------+----------------------+

+---------------------------------------------------------------------------------+
| Process:                                                                        |
|  GPU                    PID         Process Name                 GPU Memory     |
|                                                                  Usage(MiB)     |
|=================================================================================|
|  no process found                                                               |
+---------------------------------------------------------------------------------+
```

### 查看指定 GPU 信息

```bash
# 查看指定 GPU 信息
mx-smi -i 0

mx-smi  version: 2.2.9

=================== MetaX System Management Interface Log ===================
Timestamp                                         : Mon Jan 19 19:25:25 2026

Attached GPUs                                     : 1
+---------------------------------------------------------------------------------+
| MX-SMI 2.2.9                       Kernel Mode Driver Version: 3.4.4            |
| MACA Version: 2.33.1.8             BIOS Version: 1.30.0.0                       |
|------------------+-----------------+---------------------+----------------------|
| Board       Name | GPU   Persist-M | Bus-id              | GPU-Util      sGPU-M |
| Pwr:Usage/Cap    | Temp       Perf | Memory-Usage        | GPU-State            |
|==================+=================+=====================+======================|
| 0     MetaX C500 | 0           Off | 0000:45:00.0        | 0%          Disabled |
| 69W / 350W       | 51C          P0 | 826/65536 MiB       | Available            |
+------------------+-----------------+---------------------+----------------------+

+---------------------------------------------------------------------------------+
| Process:                                                                        |
|  GPU                    PID         Process Name                 GPU Memory     |
|                                                                  Usage(MiB)     |
|=================================================================================|
|  no process found                                                               |
+---------------------------------------------------------------------------------+

End of Log
```

### 显示 GPU 和 VPU 利用率

```bash
# 显示 GPU 和 VPU 利用率
mx-smi --show-memory

mx-smi  version: 2.2.9

=================== MetaX System Management Interface Log ===================
Timestamp                                         : Mon Jan 19 19:27:37 2026

Attached GPUs                                     : 1
GPU#0  MXC500  0000:45:00.0
    Memory
        vis_vram total                            : 67108864 KB
        vis_vram used                             : 846264 KB
        vis_vram usage                            : 1.2 %
        vram total                                : 67108864 KB
        vram used                                 : 846264 KB
        vram usage                                : 1.2 %
        xtt total                                 : 1575403896 KB
        xtt used                                  : 465184 KB
        xtt usage                                 : 0 %

End of Log
```

### 查看显存详情

```bash
# 查看显存详情
mx-smi --show-usage 

mx-smi  version: 2.2.9

=================== MetaX System Management Interface Log ===================
Timestamp                                         : Mon Jan 19 19:27:59 2026

Attached GPUs                                     : 1
GPU#0  MXC500  0000:45:00.0
    Utilization
        GPU                                       : 0 %
        VPUE                                      : 0 %
        VPUD                                      : 0 %

End of Log
```

```bash
# 查看进程
mx-smi --show-process
mx-smi  version: 2.2.9

=================== MetaX System Management Interface Log ===================
Timestamp                                         : Mon Jan 19 19:30:40 2026

Attached GPUs                                     : 1

+---------------------------------------------------------------------------------+
| Process:                                                                        |
|  GPU                    PID         Process Name                 GPU Memory     |
|                                                                  Usage(MiB)     |
|=================================================================================|
|  no process found                                                               |
+---------------------------------------------------------------------------------+

End of Log
```
