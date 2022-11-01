---
title: Java GC简单整理
mathjax: false
date: 2022-11-01 13:58:57
categories: [笔记]
tags: [Java, GC, 垃圾回收]
---
# 00
不存在完美的GC

![](https://misakatang.oss-cn-beijing.aliyuncs.com/blog_picture/2022-09-26-7RkISl.png)

![GC停顿时间比较](https://misakatang.oss-cn-beijing.aliyuncs.com/blog_picture/2022-09-26-OrPcrg.png)

<!-- more -->
## 关注点

衡量垃圾收集器的三项最重要的指标是：内存占用（Footprint）、吞吐量（Throughput）和延迟（Latency），三者共同构成了一个“不可能三角”。

# 找到垃圾

## 引用计数

- 循环引用问题
  - C++ 智能指针

## 可达性分析
- GC Root
  - 在虚拟机栈（栈帧中的本地变量表）中引用的对象
  - 在方法区中类静态属性引用的对象
  - 在方法区中常量引用的对象
  - 在本地方法栈中JNI引用的对象
  - Java虚拟机内部的引用，如基本数据类型对应的Class对象
  - 所有被同步锁（synchronized关键字）持有的对象
  - 反映Java虚拟机内部情况的JM XBean、JVM TI中注册的回调、本地代码缓存等

- 非死不可
  - finalize()
  - 虽然有但是不推荐使用

- 并发可达性分析：三色标记
  - 并发扫描时的对象消失问题
    - 增量更新（Incremental Update）
    - 原始快照（Snapshot At The Beginning， SATB）
  - 浮动垃圾

# 如何回收

## 分代收集理论
- 弱分代假说（Weak Generational Hypothesis）：绝大多数对象都是朝生夕灭的。
- 强分代假说（Strong Generational Hypothesis）：熬过越多次垃圾收集过程的对象就越难以消亡。
- 跨代引用假说（Intergenerational Reference Hypothesis）：跨代引用相对于同代引用来说仅占极少数。

但是也有反例或者说不使用这个理论的对象：缓存（LRU）

### 算法
- 标记-清除算法
- 标记-复制算法
- 标记-整理算法

### 流程
- 根结点枚举
  - 必须STW
  - 安全点
    - 抢先式中断
    - 主动式中断
  - 安全区域：安全点的扩展

### 记忆集与卡表
为解决对象跨代引用所带来的问题，垃圾收集器在新生代中建立了名为记忆集（Remembered Set）的数据结构，用以避免把整个老年代加进GC Roots扫描范围

- 如何维护
  - 写屏障

### 垃圾收集器
- Serial收集器
  - 单线程
- Serial Old收集器
  - 老年代版本
- ParNew收集器
  - Serial的多线程版本
- Parallel Old收集器
  - 老年代版本
- Parallel Scavenge收集器
  - 关注吞吐量
  - 自适应调节策略
- CMS收集器
  - 以获取最短回收停顿时间为目标的收集器
  - CMS收集器对处理器资源非常敏感
  - CMS收集器无法处理“浮动垃圾”
  - 大量空间碎片产生
- Garbage First收集器
  - 基于Region的内存布局形式
  - 能够建立起“停顿时间模型”（Pause Prediction M odel）的收集器
  - 追求能够应付应用的内存分配速率（吞吐率优先）
- Shenandoah收集器
  - 在任何堆内存大小下都可以把垃圾收集的停顿时间限制在十毫秒以内的垃圾收集器
- ZGC收集器
  - 在尽可能对吞吐量影响不太大的前提下，实现在任意堆内存大小下都可以把垃圾收集的停顿时间限制在十毫秒以内的低延迟

### G1GC
- 极易调整，只需要设定最大停顿时间（默认200ms）
- 混合GC（Mixed GC）
- 在满足吞吐量的情况下尽可能少的GC
- 写屏障，脏卡队列，使用细分线程来更新记忆集（remember set）
- 避免full gc
- 避免大对象分配
- eden区会因为混合GC缩小，需要关注应用程序线程利用率

### Shenandoah GC

SATB屏障（**buffer**）和两段并发标记

![](https://misakatang.oss-cn-beijing.aliyuncs.com/blog_picture/2022-09-26-JktDUb.png)

实现并发拷贝的技术点：指针引用转发

![](https://misakatang.oss-cn-beijing.aliyuncs.com/blog_picture/2022-09-26-IoHzPc.png)

![](https://misakatang.oss-cn-beijing.aliyuncs.com/blog_picture/2022-09-26-j75qRr.png)

### ZGC

ZGC设计：

![](https://misakatang.oss-cn-beijing.aliyuncs.com/blog_picture/2022-09-27-QM6txT.png)

指针染色（colored pointers）

GC阶段STW过程：

![](https://misakatang.oss-cn-beijing.aliyuncs.com/blog_picture/2022-09-27-StTFgO.png)

堆外表维护引用 like 指针引用转发

线程本地握手

![](https://misakatang.oss-cn-beijing.aliyuncs.com/blog_picture/2022-09-27-WRSYzX.png)

