---
title: InnoDB官方文档--14.4 InnoDB 架构|14.5 InnoDB 在内存中的结构
mathjax: false
date: 2019-02-18 22:38:17
categories: [文档翻译]
tags: [MySQL, InnoDB]
---
### 14.4 InnoDB 架构

![](https://dev.mysql.com/doc/refman/5.7/en/images/innodb-architecture.png)
<!-- more -->
### 14.5 InnoDB 在内存中的结构

#### 14.5.1 缓冲池(Buffer Pool)

缓冲池是一个用来缓存被访问的表和索引数据的在主存储中的区域.缓冲池允许直接从内存中处理常用数据用来加快处理速度.在专用服务器上,通常给缓冲池分配80%的内存.

为了大量读操作的处理效率,缓冲池被分成了可能有多行数据的页面.为了缓存管理的效率,缓冲池被实现为页面相连为列表(list)的形式,使用LRU算法使得很少使用的数据在缓存中老化.

了解如何利用缓冲池将频繁访问的数据保存在内存中是MySQL调优的一个重要方面.

**缓冲池的LRU(最近最少使用)算法**

缓冲池是一个使用最近最少使用(least recently used)算法变种管理的列表.当需要空间来向缓冲池中插入新页面的时候,最近最少使用的页面被赶出,新页面被加到列表的中间.中间插入策略把列表看做两个子列表:

- 在头部是一个最近被访问的"年轻的"列表
- 在尾部是一个最近访问较少的列表

缓冲池列表示意图:

![](https://dev.mysql.com/doc/refman/5.7/en/images/innodb-buffer-pool-list.png)

该算法保留了新子列表(new sublist)中查询时大量使用的页面.旧子列表(old sublist)中包含了较少使用的页面,这些页面被视为驱逐(evicted)的候选.

默认情况下,算法的操作如下:

- 3/8的缓冲池被分给旧子列表
- 列表的中点是新子列表的尾部和旧子列表头部相交的地方.
- 当InnoDB从缓冲池中读取了一个页面,将其插入到中点(旧子列表的头部).一个页面被读取的原因是用户的特定操作例如一个SQL查询或者是InnoDB自动的预读(read ahead)操作.
- 访问旧子列表中的页面会使其变"年轻",将其移动到缓冲池的头部(新子列表的头部).如果页面是因为被需要而读取,第一次访问会立即发生并且页面变得"年轻".如果页面是因为预读被读取,第一次访问就不会立即执行.
- 随着数据库的运行,缓冲池中的页面会随着未访问年龄的增大而向列表尾部移动.新旧子列表中的页面都会随着其他页面的变化而变旧.旧子列表中的页面会随着页面向中点插入而逐渐老化.最终,未被使用的页面到达旧子列表的尾部后被赶出(内存).

在默认情况下,查询导致读取的页面会立即移动到新子列表中,意味着其可以在缓冲池中待得更久.一个表扫描(例如mysqldump或者没有where子句的select语句)会把大量的数据带进缓冲池并且赶出等量的旧数据哪怕这些新数据不会被再次使用.相似的,由后台预读线程加载页面移到新列表的头部然后只访问一次.这些情况会将经常使用的页面推到旧子列表中,在那里页面会被赶出内存.

InnoDB标准监视器输出包含几个和LRU算法相关的字段在`BUFFER POOL AND MEMORY`中.

**缓冲池配置**

你可以从多个方面配置缓冲池来提高性能

- 理想情况下,你可以在不影响服务器其他进程的情况下把缓冲池的内存设的尽可能的大.缓冲池越大InnoDB就越像一个内存型数据库,从磁盘上读取一次然后在后续的访问中从内存读取数据.
- 在有足够内存的64位系统上,你可以把缓冲池拆分为多个部分来最大限度减少并发操作对内存结构的竞争.
- 你可以把频繁访问的数据保留在内存中,无论来自操作的峰值是否将大量的不经常访问数据带入缓冲池.
- 你可以控制何时以及如何执行预读请求以异步读取预期很快就会需要的页面进入缓冲池.
- 你可以控制何时进行后台刷新操作以及是否根据工作负载动态调整刷新率.
- 你可以微调缓冲池刷新行为的各个方面以提高性能.
- 你可以配置InnoDB如何保留当前缓冲池状态,以避免服务器重新启动后的长时间预热.

**使用InnoDB标准监视器监控缓冲池**

使用`SHOW ENGINE INNODB STATUS`可以获取InnoDB标准监视器输出,缓冲池相关的信息在`BUFFER POOL AND MEMORY`部分:

```shell
----------------------
BUFFER POOL AND MEMORY
----------------------
Total large memory allocated 2198863872
Dictionary memory allocated 776332
Buffer pool size   131072
Free buffers       124908Database pages     5720
Old database pages 2071
Modified db pages  910
Pending reads 0
Pending writes: LRU 0, flush list 0, single page 0
Pages made young 4, not young 00.10 youngs/s, 0.00 non-youngs/s
Pages read 197, created 5523, written 50600.00 reads/s, 190.89 creates/s, 244.94 writes/s
Buffer pool hit rate 1000 / 1000, young-making rate 0 / 1000 not0 / 1000
Pages read ahead 0.00/s, evicted without access 0.00/s, Random read
ahead 0.00/s
LRU len: 5720, unzip_LRU len: 0
I/O sum[0]:cur[0], unzip sum[0]:cur[0]
```

缓冲池各项指标对照表:

![](https://i.loli.net/2019/02/14/5c653037ec928.png) 

#### 14.5.2 变更缓存区(Change Buffer)

变更缓存区是一个特殊的数据结构,当页面不在缓冲池里的时候它会缓存对这些页面二级索引的变更.缓存的变化可能是由于insert,update,delete操作(DML)引起的,在这些页面被其他读操作加载到缓冲池的时候会合并这些改变.

变更缓存区结构:

![](https://dev.mysql.com/doc/refman/5.7/en/images/innodb-change-buffer.png)

不像聚簇索引,二级索引通常不是唯一的,并且二级索引的插入顺序是相对随机的.同样,删除和更新可能会影响不在索引树中的相邻的二级索引页.变更缓存区的合并会被延迟到受影响的页面被其他操作读取到缓冲池的时候进行,避免从磁盘读取二级索引页面到缓冲池所需的大量随机访问I/O.

清除操作会在系统空闲或者缓慢关机的时候定期地把更新过的索引页写到磁盘上.在此期间,磁盘I/O会增加,可能会导致和磁盘相关的查询速度显著下降.缓存区变更的合并在事务被提交之后可能会继续发生,甚至在服务器关闭和重启的时候.

在内存里,变更缓存区拥有一部分缓冲池.在磁盘上,变更缓存区是系统表空间的一部分,当数据库服务关闭的时候被缓存的索引会变更.

`innodb_change_buffering`变量管理变更缓存区缓存的数据类型.

如果索引包含降序的索引列或者主键包含递减索引列的话二级索引就不支持变更缓存区.

**变更缓存区的配置**

当在表上执行insert,update和delete的时候,索引列的值(尤其是二级索引的值)通常是未排序的,需要大量的I/O才能更新二级索引.当相关页面不在缓冲池里的时候变更缓存区会改变二级索引的条目,以此来避免立即从磁盘上读取页面的大量的I/O操作消耗.当页面加载到缓冲池的时候,缓存的变更会被合并,然后被更新的页面会随后刷新到磁盘.InnoDB主线程会在服务器空闲以及慢关机(slow shutdown)期间合并缓存的变更.

由于可以减少磁盘的读写次数,变更缓存区功能对于I/O绑定的工作最有价值.例如有批量插入这样的大量的DML操作的应用.

然而,变更缓存区占据了一部分的缓冲池空间,减少了可以用来缓存数据页面的内存.如果工作完全适合于缓冲池或者你的表里二级索引很少,关闭变更缓存区可能更有用.如果工作中的数据集(的大小)完全适合缓冲池,变更缓存区不会增加额外的开销,因为它只适用于不在缓冲池的页面.

你可以使用`innodb_change_buffering`参数来控制InnoDB对变更缓存区的处理.你可以打开或关闭对插入,删除操作和清除操作的缓存.更新操作被分解为插入和删除操作.默认的`innodb_change_buffering`值是*all*.

合法的`innodb_change_buffering`参数如下:

- all
  默认值:缓存插入,标记删除操作和清除(purges)
- none
  不缓存任何操作
- inserts
  缓存插入操作
- deletes
  缓存标记删除操作
- changes
  缓存插入和标记删除
- purges
  缓存发生在后台的物理删除操作

通过MySQL配置文件(*my.cnf* 或*my.ini*)的`innodb_change_buffering`参数或者`SET GLOBAL`语句设置(需要权限).更改设置只会影响新的缓冲,现有的缓冲数据不受影响.

**设置变更缓存区的最大大小**

`innodb_change_buffer_max_size`变量可以设置变更缓存区占缓冲池的百分比大小.默认`innodb_change_buffer_max_size`是25,最大可以设置50.

考虑增加`innodb_change_buffer_max_size`如果服务器有大量的insert,update和delete操作.

考虑减少`innodb_change_buffer_max_size`如果服务器使用静态数据来做报告.

在典型的工作负载下测试不同的设置来决定使用哪一个配置.`innodb_change_buffer_max_size`可以在不重启服务器的情况下动态修改.

**监控变更缓存区**

- 标准监视器:

```mysql
mysql> SHOW ENGINE INNODB STATUS\G
```

信息如下:

```shell
-------------------------------------
INSERT BUFFER AND ADAPTIVE HASH INDEX
-------------------------------------
Ibuf: size 1, free list len 0, seg size 2, 0 merges
merged operations:
 insert 0, delete mark 0, delete 0
discarded operations:
 insert 0, delete mark 0, delete 0Hash table size 4425293, used cells 32, node heap has 1 buffer(s)13577.57 hash searches/s, 202.47 non-hash searches/s
```

- `INFORMATION_SCHEMA.INNODB_METRICS`表里提供了InnoDB标准监视器里的大部分数据,还有额外的数据.使用下面的sql查看变更缓存区的指标:
  > `mysql> SELECT NAME, COMMENT FROM INFORMATION_SCHEMA.INNODB_METRICS WHERE NAME LIKE '%ibuf%'\G`
- `INFORMATION_SCHEMA.INNODB_BUFFER_PAGE`提供了缓冲池里每个页面的元数据,包括变更缓存区索引和变更缓存区位图页面.变更缓存区由`PAGE_TYPE`标识,`IBUF_INDEX`是变更缓存区索引页面的页面类型,`IBUF_BITMAP`是变更缓存区位图页的页面类型.

> **警告:**
> 查询`INNODB_BUFFER_PAGE`表会带来显著的性能损耗.为了避免性能影响,请在测试实例上运行查询和排除问题.
例如,你可以查询`INNODB_BUFFER_PAGE`表来决定`IBUF_INDEX`和`IBUF_BITMAP`页面占总缓冲池页的百分比.

```mysql
mysql> SELECT (SELECT COUNT(*) FROM INFORMATION_SCHEMA.INNODB_BUFFER_PAGE
       WHERE PAGE_TYPE LIKE 'IBUF%') AS change_buffer_pages, 
       (SELECT COUNT(*) FROM INFORMATION_SCHEMA.INNODB_BUFFER_PAGE) AS total_pages,
       (SELECT ((change_buffer_pages/total_pages)*100)) 
       AS change_buffer_page_percentage;
+---------------------+-------------+-------------------------------+
| change_buffer_pages | total_pages | change_buffer_page_percentage |
+---------------------+-------------+-------------------------------+
|                  25 |        8192 |                        0.3052 |
+---------------------+-------------+-------------------------------+
```

- 性能概要(Performance Schema)提供变更缓存区互斥等待监控表进行高级性能监控.使用下面的查询:

```sql
mysql> SELECT * FROM performance_schema.setup_instruments
       WHERE NAME LIKE '%wait/synch/mutex/innodb/ibuf%';
+-------------------------------------------------------+---------+-------+
| NAME                                                  | ENABLED | TIMED |
+-------------------------------------------------------+---------+-------+
| wait/synch/mutex/innodb/ibuf_bitmap_mutex             | YES     | YES   |
| wait/synch/mutex/innodb/ibuf_mutex                    | YES     | YES   |
| wait/synch/mutex/innodb/ibuf_pessimistic_insert_mutex | YES     | YES   |
+-------------------------------------------------------+---------+-------+
```

#### 14.5.3 自适应哈希索引(Adaptive Hash Index)

自适应哈希索引特性使得InnoDB在合适的工作负载和提供给缓冲池(buffer pool)足够的内存的情况下表现的更像一个内存型数据库并且不会损失事务特性和可靠性.自适应哈希索引特性由` innodb_adaptive_hash_index`变量来控制,或者是在启动服务器时加上`--skip-innodb-adaptive-hash-index`.

根据观察到的搜索模式,使用索引键(index key)的前缀来构建哈希索引.前缀可以是任意长的,并且有可能只是B树中的一些值出现在哈希索引里.哈希索引是根据需要经常访问的页面索引构建的.

如果一张表几乎全部进入主存,哈希索引可以通过允许直接查找任何元素来加速,把索引的值转换为一种指针.InnoDB有一种监控索引搜索的机制.如果InnoDB注意到查询可以从构建哈希索引中受益就会自动进行(这个过程).

对于一些工作来说,从哈希索引获得的加速远远超过了监控索引查找和维护一个哈希索引结构的速度.在高工作负载下,对自适应哈希索引的访问有时会变成资源竞争的来源,例如多个连接的joins.LIKE操作和%符号的查询也不会受益.对于不能从自适应哈希索引中获益的工作,关闭以减少不必要的性能消耗.因为很难预测对一个特定的系统来说自适应哈希索引特性是否有用,考虑使用基准测试来比较开启和不开启的性能差距.MySQL5.6的架构变化使其更适于禁用自适应哈希索引相比于更早的版本来说.

在MySQL5.7中,自适应哈希索引特性是分区的.每一个索引绑定到一个特定的分区,每一个分区都由一个锁存器来保护.分区由`innodb_adaptive_hash_index_parts`来控制.在早期版本中,自适应哈希索引由一个锁存器来保护,这可能会成为高负载下的一个竞争点.`innodb_adaptive_hash_index_parts`默认值是8,最大可以设置512.

可以通过`SHOW ENGINE INNODB STATUS`的`SEMAPHORES`部分来监控自适应哈希索引.如果有大量的线程在等待*btr0sea.c*创建RW-latches,考虑增大自适应哈希索引分区的数量或者关闭自适应哈希索引特性.

#### 日志缓冲区(Log Buffer)

日志缓冲区是保存要写到磁盘上的日志文件的区域.日志缓冲区的大小由`innodb_log_buffer_size`定义.默认的大小是16MB.日志缓冲区的内容会定期刷新到磁盘上.一个大的日志缓冲区使大型的事务可以运行而无需在事务提交之前把重做日志(redo log)的数据写到磁盘上.因此,如果你有事务更新,插入或删除很多行的话,增大日志缓冲区来节省磁盘I/O.

`innodb_flush_log_at_trx_commit`变量控制日志缓冲区的内容如何写入和刷新到磁盘.`innodb_flush_log_at_timeout`控制日志刷新的频率.