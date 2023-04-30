---
title: "InnoDB官方文档--14.2\_InnoDB 和 ACID 模型"
mathjax: false
date: 2019-02-16 14:44:29
categories: [技术]
tags: [MySQL, InnoDB]
---
### 14.2 InnoDB 和 ACID 模型
ACID模型是一系列的数据库设计准则,强调对业务数据和关键应用非常重要的可靠性方面.MySQL包括了像InnoDB存储引擎这样遵守ACID模型的组件所以数据不会因为例如软件崩溃和硬件故障这样的意外情况而遭到破坏或者丢失.当你依赖ACID相关特性的时候,你不需要重新发明一致性检查和崩溃恢复机制.如果你有其他附加的软件保障,高可用的硬件或者一个可以容忍小部分数据的丢失或者不一致的话,你可以调整MySQL设置用ACID可靠性来交换更好的性能和吞吐量.

下面讨论MySQL的特性尤其是InnoDB存储引擎是如何与ACID模型关联的.
- A: 原子性(atomicity).
- C: 一致性(consistency).
- I:  隔离性(isolation).
- D: 持久性(durability).

#### 原子性
主要涉及InnoDB事务,相关MySQL特性:
- 自动提交(autocommit) 设置
- COMMIT子句
- ROLLBACK子句
- INFORMATION_SCHEMA表中的操作数据

#### 一致性
主要涉及InnoDB内部保护数据,相关特性:
- InnoDB 双写缓存(doublewrite buffer)
- InnoDB 崩溃恢复

#### 隔离性
主要涉及InnoDB事务,特别是每个事务的隔离级别,相关特性:
- 自动提交(autocommit) 设置
- SET ISOLATION LEVEL子句
- InnoDB锁的底层细节

#### 持久性
主要涉及到和MySQL所在物理硬件相关配置,相关特性:
- InnoDB 双写缓存(doublewrite buffer)
- innodb_flush_log_at_trx_commit 配置选项
- sync_binlog 选项
- innodb_file_per_table 选项
- 存储设备的写入缓存,例如磁盘驱动,SSD,RAID
- 存储设备的电池备份
- 用来运行MySQL的操作系统
- 不间断电源服务(UPS)用来保护MySQL服务器
- 你的备份策略
- 对于分布式应用取决于MySQL服务器在数据中心扮演的角色和数据中心之间的网络连接.