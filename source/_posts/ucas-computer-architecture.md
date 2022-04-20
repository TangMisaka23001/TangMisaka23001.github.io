---
title: UCAS-高级计算机体系结构笔记
mathjax: false
date: 2022-04-20 20:58:12
categories: [课程笔记]
---
# 经典技术回顾
cpu设计历史

- 流水线 ILP
- 功耗
- 存储系统结构设计
- 向量 SIMD GPU 大数据流并行结构
- 互联网数据中心
- 移动计算
- 面向领域硬件

体系结构经典技术

- 流水线
- 动态调度
- Cache
- 向量机
- RISC
- 多发射 乱序执行
- EPIC
- SMT 同时多线程
- CMP 片上多核
<!-- more -->
性能参数计算

- 程序执行时间 = 指令  x（周期/指令）x（时间/周期）：并不独立 互相相关
   - IC x CPI x CCT
   - CPI = base + stalls
- 功耗 = 动态功耗 （电容 x 电压 x 主频）+ 静态功耗 （漏电流功耗）

CPU指令类型

- logical
- loads store
- control flow

现代处理器核设计技术基础

- Pipelines
   - 5级流水线  MIPS R3000
   - 优点 提高主频
   - 缺点 长短指令时间一致 导致停滞
      - 改进： 更深的流水线 
      - 更宽的流水线 超标量流水线
      - 切分流水线 
      - 乱序执行 
      - 分支预测
   - 限制
      - 流水线寄存器延迟
      - 每个阶段不对等
      - 时钟漂移
      - 57级之后没有收益（功耗爆增）
   - Amdahl's Law
- Branch Prediction
   - BHT 转移历史表 + 译码
   - BTB 转移目标缓冲器
- Register Renaming
   - tomasulo algorithm
- Out-of-Order Execution
- Re-order Buffer
- Data Parallel Processing SIMD / Vector Extensions

# 存储系统设计：高速缓存
存储层次结构：

- 寄存器
   - 逻辑寄存器
   - 物理寄存器
- Cache TLB
   - why： memory wall
   - 经典组织结构
      - 三级缓存
   - 操作策略
      - 放置
         - 全关联	
         - 直接映射
         - 多路组关联
      - 识别
         - 低位index（增加辨识度） 高位tag
      - 替换
         - LRU
         - RAND
         - FIFO
      - 写策略
         - 写通过
         - 写回
   - 性能 AMAT
      - 降低缺失率
         - 必然缺失 冷启动缺失
         - 容量缺失 -> 增加块大小
         - 冲突缺失 -> 提高关联度
         - 一致性缺失（多核）
   - 功耗
- Memory
- Disk
- 网络存储

局部性原理：存储层次结构的基础

- 时间局部性
- 空间局部性

高速缓存优化策略

- multi-level cache 多级cache
   - 针对每级cache做不同的优化
- victim cache
   - 使用小cache保存L1丢弃的数据
- pseudo-associative cache 伪关联
   - cache分块 猜测多次（猜测预测）
   - 缺陷 流水线难设计 猜测算法难设计
- skew-associative cache 斜关联
   - 每路cache使用不同的index hashing
   - 缺点 hash函数延迟
- non-blocking cache
   - 缺失发生时继续提供命中
- critical word first 关键字优先
   - 优先发送缺失的字
- prefetching
   - 硬件预取
   - 软件预取
- multi-ported cache

优化方向

- 降低缺失率
- 降低缺失损失
- 降低cache命中时间
   - 片上多级cache
   - 加速地址翻译
   - cache访问流水线


# 存储系统设计：主存储器
没有miss rate 只关注命中时间
操作类型：

- LD/ST
- DMA（直接内存访问）

RAM：

- SRAM 用于L1/L2 cache
- DRAM 用于主存

Memory Bank：

- 解码读取一行
- 选中行
- 读取某些列
- 输出
- 回填数据

memory access：

- active
- read
- write
- precharge
- refresh

burst：

- 每次读多列
- channel时钟比核心快

时序约束

- tRCD  打开行读到行放大器时间
- tCAS 打开一列到数据选出
- tCCD 两次列命令时间间隔
- tRP precharge时间
- tRAS 行保持开放的时间
- tRC 行的周期时间 = tRP + tRAS  访问不同行的最小时间间隔

rank： 片选bank
channels： 内存通道
NUMA topology： non-uniform memory access
DRAM controller 功能：

- 翻译请求到dram命令
- 缓存和调度请求
- 保证操作正确（刷新）
- 管理功耗


# flash storage
是一种非易失存储器
是EPROM和EEPROM的升级产品
分类：

- NAND
- NOR


# ISA tradeoffs
提供给程序员使用的指令集合 
design point：

- leads to tradeoff in both ISA and uarch
- cost
- performance
- maximum power consumption
- energy consumption
- availability
- reliability and correctness
- time to market

soul of computer architecture：

- ISA level tradeoff
- 微体系结构权衡
- 系统和任务级权衡

different ISA：

- x86
- PDP
- VAX
- IBM 360
- CDC 6600
- SIMD
- VLIW
- Power PC
- RISC： alpha MIPS SPARC ARM

instruction：

- basic element of HW/SW interface
- 构成：
   - 操作码
   - 操作数

elements of ISA：

- sequencing model
   - control flow vs data flow
- processing style：
   - number of operands an instruction operates
   - 0，1，2，3 address machines
      - 0 stack machine
      - 1 accumulator machine
      - 2 2-operand machine
      - 3 3-operand machine
- instructions
   -  opcode
   - operand specifiers （addressing modes）
- data types
   - definition
   - integer floating point
   - doubly linked list， queue， string， bit，vector
- memory organization
   - address space
   - addressability
      - byte
      - bit
      - 64-bit
      - 32-bit
   - support for virtual memory
- registers
   - how many
   - size of each register
- load/store  vs memory/memory
- addressing modes
   - absolute
   - register indirect
   - displaced or based
   - indexed
   - memory indirect
   - auto inc/dec
- how to interface with I/O devices
   - memory mapped I/O
   - special I/O instructions
- privilege modes
   - user
   - supervisor
- exception and interrupt handling
- virtual memory
- access protection
- instruction length
   - fixed length
   - variable length
- uniform decode
   - uniform
   - non-uniform
- number of registers
- addressing mode


# availability & reliability
reliability：

- MTTF： mean time to failure
- MTTR： mean time to repair
- MTBF = MTTF + MTTR

availability = MTTF / （MTTF + MTTR）
types of faults：

- hardware
- software
- operator errors
- environment factors
- security breaches
- planned service events


# performance engineering
steps：

- measurement
- analysis
- improvements
- repeat

performance：

- IPC
- IPS
- QPS
- execution time
- AMAT： average memory access latency
- fairness，priorities

power：

- watts
- instructions

evaluation choices：

- real experiments
- using analytical models
- using a simulator


# on-chip networks
shift to multicore  单核很难提升
amdahl law：串行部分影响加速比
design：

- topology
   - bus 总线
   - crossbar 交叉开关网
- flow control
   - messages，packets，flits，phits
   - bufferless
      - circuit switching
      - dropping
      - misrouting
   - buffered
      - store and forward
      - virtual cut through
      - wormhole
      - virtual channel
- router microarchitecture
- routing
   - deterministic
   - adaptive
   - minimal
   - deadlock free


# cache coherence
communication models

- shared memory
- message passing

implementing
tow rules：

- write propagation 写传播
- write serialization 写顺序 有顺序且所有处理器都看到同一顺序

如何保证写传播

- 写无效
- 写更新

跟踪缓存状态和序列化

- 基于侦听
   - VI协议
   - MSI协议
   - MESI协议
   - MOSI
   - MOESI
- 基于目录


# memory consistency
顺序一致性模型
松散一致性模型：

- load 越过 load
- load 越过 store
- 允许store乱序执行
- store越过load

单核优化技术在多核存储一致性上遇到的问题：

- store buffer
- store lod bypassing
- non FIFO store buffers
- non blocking caches
- register renaming
- speculative execution 推测执行
- address speculation 地址推测
- store atomicity
- causality

弱一致性模型 + 内存保护指令
# 超算
# GPU
# 领域特定架构
