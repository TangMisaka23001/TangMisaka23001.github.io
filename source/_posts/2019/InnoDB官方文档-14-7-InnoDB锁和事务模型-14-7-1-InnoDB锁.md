---
title: InnoDB官方文档--14.7 InnoDB锁和事务模型|14.7.1 InnoDB锁
mathjax: false
date: 2019-03-30 15:33:05
categories: [技术]
tags: [MySQL, InnoDB]
---
### 14.7 InnoDB锁和事务模型
为了实现大规模,繁忙或高可靠的数据库应用,从不同的数据库系统移植大量代码或调整MySQL性能,理解InnoDB锁和InnoDB事务模型是很重要的.

这个部分讨论了几个你应该要熟悉的和InnoDB锁和InnoDB事务模型相关的主题.
- 14.7.1 InnoDB锁 描述了InnoDB中使用的锁类型.
- 14.7.2 InnoDB事务模型 描述了事务隔离级别和每个锁的使用策略.同时也讨论了autocommit的使用,一致的无锁读和锁定读取.
- 14.7.3 InnoDB中不同SQL语句设置的锁 讨论了InnoDB中为各种语句设置的特定锁类型.
- 14.7.4 幻想行 描述InnoDB如何使用下一个键锁定来避免幻像行
- 14.7.5 InnoDB中的死锁 提供了一个死锁示例,讨论了死锁检测和回滚,并提供了在InnoDB中最小化和处理死锁的技巧.

#### 14.7.1 InnoDB锁
**共享和独占锁(Shared and Exclusive Locks)**

InnoDB实现了标准的行级锁,包括两种类型:共享锁和独占锁.
- 共享锁(S锁)允许持有锁的事务读取行.
- 独占锁(X锁)允许持有锁的事务更新或删除行.

如果事务T1持有行r的共享锁,之后来自不同事务T2对行r的锁的请求处理如下:
- 可以立即授予T2一个共享锁.结果是T1和T2都持有对行r的共享锁.
- 对T2事务的独占锁请求不能马上授予.

如果事务T1持有行r的独占锁,来自不同事务T2的获取锁的请求不能立即授予.相反,T2要等到T1释放对行r的锁(才能获得锁).

**意图锁(Intention Locks)**

InnoDB支持多粒度锁定允许行级锁和表级锁共存.例如,语句`LOCK TABLES ... WRITE`在指定表上获取一个独占锁.为了在多个粒度上实现加锁,InnoDB使用意图锁.意图锁是一个表级锁,用来指明下一个事务对表中的行所需要的所类型(共享或独占).有两种类型的意图锁:
- 意图共享锁(IS锁)表示事务打算在表的行上设置共享锁.
- 意图独占锁(IX锁)表示事务打算在表的行上设置独占锁.

例如,`SELECT ... LOCK IN SHARE MODE`设置一个IS锁,`SELECT ... FOR UPDATE`设置一个IX锁.

意图锁的规则如下:
- 如果一个事务可以在表的行上获取共享锁,它一定要先在表上获取一个IS锁或更强的锁.
- 如果一个事务可以在表的行上获取独占锁,它一定要先在表上获取一个IX锁.

表级锁类型兼容总结如下:

![](https://i.loli.net/2019/03/26/5c99d3d734beb.png) 

如果请求事务与现有锁兼容,则授予锁,但如果它与现有锁冲突则不授予.事务会等待直到冲突的锁被释放.如果加锁请求和现有的锁冲突会无法授予,因为这会导致死锁而发生错误.

意图锁不会阻止任何请求除了对全表加锁的请求(例如`LOCK TABLES ... WRITE`).意图锁的主要用途是展示某人正在对行加锁或将要对表中的行加锁.

意图锁的事务数据在`SHOW ENGINE INNODB STATUS`和InnoDB监视器输出显示类似下面的内容:
```
TABLE LOCK table `test`.`t` trx id 10080 lock mode IX
```

**记录锁(Record Locks)**

记录锁是在索引记录上的锁.例如,`SELECT c1 FROM t WHERE c1 = 10 FOR UPDATE;`会阻止其他任何事务对t.c1=10的行的插入,更新或删除操作.

记录锁总是对索引记录加锁,甚至表定义中没有索引.在这种情况下,InnoDB创建一个隐藏的聚簇索引并用来作为记录锁的索引.

记录锁的事务数据在`SHOW ENGINE INNODB STATUS`和InnoDB监视器输出显示类似下面的内容:
```
RECORD LOCKS space id 58 page no 3 n bits 72 index `PRIMARY` of table `test`.`t` 
trx id 10078 lock_mode X locks rec but not gap
Record lock, heap no 2 PHYSICAL RECORD: n_fields 3; compact format; info bits 0
 0: len 4; hex 8000000a; asc     ;;
 1: len 6; hex 00000000274f; asc     'O;;
 2: len 7; hex b60000019d0110; asc        ;;
```

**间隙锁(Gap Locks)**

间隙锁是一个锁定两个索引记录之间间隙的锁,或是锁定第一个之前或最后一个索引记录之后的间隙.例如,`SELECT c1 FROM t WHERE c1 BETWEEN 10 and 20 FOR UPDATE;`会阻止其他事务插入15到列t.c1中,无论这一列中是否已经有这个值了,因为所有存在的值之间的间隙已经被锁定了.

间隙可能跨越一个索引值,多个索引值甚至为空.

间隙锁是性能和并发之间权衡的一部分,用于一些事务隔离级别中.

使用唯一索引锁定行搜索唯一行的语句不需要间隙锁.(这不包括搜索条件仅包括多列唯一索引的一些列的情况;在这种情况下,会发生间隙锁定).例如,如果ID列有一个唯一索引,下面的语句只对id值为100的行加索引记录锁而其他会话是否在前面的间隙中插入行都没关系:
```sql
SELECT * FROM child WHERE id = 100;
```
如果id列没有被索引或有一个非唯一索引,上面的语句会在前面的间隙加锁.

值得注意的是,冲突锁可以通过不同的事务保持在间隙上.例如,当事务A在a间隙上持有一个共享间隙锁(gap S-lock)上时B事务可以在相同的间隙上持有独占间隙锁(gap X-lock).允许间隙锁冲突的原因是如果索引上的记录被清除,则必须合并由不同事务保留在记录上的间隙锁.

InnoDB中的间隙锁是"单纯抑制(purely inhibitive)",也就是说其目的就是阻止其他事务插入数据到间隙.间隙锁可以共存.一个事务获取了间隙锁不会阻止其他事务在同一个间隙上获取间隙锁.在共享和独占的间隙锁上没有区别.它们彼此不冲突并且执行相同的功能.

可以明确禁用间隙锁.如果你改变事务隔离级别到 READ COMMITTED或启用` innodb_locks_unsafe_for_binlog`系统变量(现已弃用)就会发生.在这种情况下,间隙锁对搜索和索引扫描禁用并且只用在外键约束检查和重复键检查.

使用 READ COMMITTED事务隔离级别或启用` innodb_locks_unsafe_for_binlog`还有其他影响.MySQL求值WHERE条件之后会释放不匹配行的记录锁.对UPDATE语句,InnoDB会执行"半一致(semi-consistent)"读,这样就会将最新提交的版本返回给MySQL,以便MySQL确定该行是否与UPDATE的WHERE条件匹配.

**Next-Key锁**

next-key锁是索引记录上的记录锁和索引记录之前的间隙上的间隙锁的组合.

InnoDB以这样的方式执行行级锁定:当搜索或扫描表索引时,会在遇到的索引记录上设置共享锁或排它锁.因此,行级锁实际上是索引记录锁.索引记录上的next-key锁也会影响索引记录前的"间隙".也就是说,next-key锁是一个索引记录锁加上一个索引记录之前的间隙上的间隙锁.如果一个会话在索引的记录R上有一个共享或者独占锁,另一个会话不能在R的索引顺序前面的间隙里立即插入一个新的索引记录.

假设一个索引包含10,11,13和20.这个索引可能的next-key锁包含下面的范围,圆括号表示不包含边界,方括号表示包含边界:
```
(negative infinity, 10]
(10, 11]
(11, 13]
(13, 20]
(20, positive infinity)
```
对最后一个间隔,next-key锁在索引的最大值之上加锁并且这个"最大数"的伪记录比索引中实际存在的任何值都大.最大数不是一个真的索引记录,所以实际上,这个next-key锁只是对最大索引值之后加锁.

默认情况下,InnoDB在 REPEATABLE READ的事务隔离级别下操作.在这种情况下,InnoDB用next-key锁来搜索和扫描索引,这样可以防止幻影行(phantom rows).

next-key锁的事务数据在`SHOW ENGINE INNODB STATUS`和InnoDB监视器输出显示类似下面的内容:
```
RECORD LOCKS space id 58 page no 3 n bits 72 index `PRIMARY` of table `test`.`t` 
trx id 10080 lock_mode X
Record lock, heap no 1 PHYSICAL RECORD: n_fields 1; compact format; info bits 0
 0: len 8; hex 73757072656d756d; asc supremum;;

Record lock, heap no 2 PHYSICAL RECORD: n_fields 3; compact format; info bits 0
 0: len 4; hex 8000000a; asc     ;;
 1: len 6; hex 00000000274f; asc     'O;;
 2: len 7; hex b60000019d0110; asc        ;;
```

**插入意图锁(Insert Intention Locks)**

插入意图锁是在行插入前由INSERT操作设置的一种间隙锁.该锁以这样的方式来表示插入的意图:插入相同索引间隙的多个事务不需要互相等待如果它们没有插入到间隙内的相同位置的话.假设有4和7两个索引记录值.两个事务分别要插入值5和6,在获得插入行上的独占锁之前,每个事务都使用插入意图锁锁定4到7之间的间隙,但是不要因为行是不冲突的就不互相阻塞.

下面的例子展示了一个事务在获得插入记录的独占锁之前获取一个插入意图锁.这个例子涉及2个客户端,A和B.

客户端A创建了一个包含2个索引记录(90和102)的表并且开始了一个事务对ID大于100的索引加了独占锁.这个独占锁包含了记录102之前的间隙:
```sql
mysql> CREATE TABLE child (id int(11) NOT NULL, PRIMARY KEY(id)) ENGINE=InnoDB;
mysql> INSERT INTO child (id) values (90),(102);

mysql> START TRANSACTION;
mysql> SELECT * FROM child WHERE id > 100 FOR UPDATE;
+-----+
| id  |
+-----+
| 102 |
+-----+
```
客户端B开始一个事务并向间隙中插入记录.当其等待获取独占锁的时候获得了一个插入意图锁.
```sql
mysql> START TRANSACTION;
mysql> INSERT INTO child (id) VALUES (101);
```
插入意图锁的事务数据在`SHOW ENGINE INNODB STATUS`和InnoDB监视器输出显示类似下面的内容:
```
RECORD LOCKS space id 31 page no 3 n bits 72 index `PRIMARY` of table `test`.`child`
trx id 8731 lock_mode X locks gap before rec insert intention waiting
Record lock, heap no 3 PHYSICAL RECORD: n_fields 3; compact format; info bits 0
 0: len 4; hex 80000066; asc    f;;
 1: len 6; hex 000000002215; asc     " ;;
 2: len 7; hex 9000000172011c; asc     r  ;;...
```

**自增锁(AUTO-INC Locks)**

自增锁是由插入到具有自增(AUTO_INCREMENT)列的表中的事务所采用特殊的表级锁.在最简单的情况下,如果一个事务正在往一个表里插入数据,其他事务必须等待对该表执行插入以便第一个事务插入的行能得到连续的主键值.

`innodb_autoinc_lock_mode`配置选择控制了自增锁使用的算法.允许你在可预测的自动增量值序列和插入操作的最大并发之间进行权衡.

**空间索引谓词锁(Predicate Locks for Spatial Indexes)**

InnoDB支持包含空间列的空间(SPATIAL)索引.

为了处理涉及空间索引的操作的锁定,next-key锁在`REPEATABLE READ`或` SERIALIZABLE`事务隔离级别上运行不是很好.多维数据中没有绝对排序概念,因此不清楚哪个是"下一个(next-key)"主键.

为了支持具有空间(SPATIAL)索引的表的隔离级别,InnoDB使用谓词锁.空间索引包含最小边界矩形(MBR)值,因此InnoDB通过在用于查询的MBR值上设置谓词锁来强制对索引进行一致读取.其他事务无法插入或修改与查询条件匹配的行.
