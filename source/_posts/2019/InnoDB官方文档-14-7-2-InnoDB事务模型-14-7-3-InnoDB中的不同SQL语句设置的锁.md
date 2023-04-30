---
title: "InnoDB官方文档--14.7.2 InnoDB事务模型|14.7.3 InnoDB中的不同SQL语句设置的锁"
mathjax: false
date: 2019-09-02 12:01:22
categories: [技术]
tags: [MySQL, InnoDB]
---
#### 14.7.2 InnoDB事务模型
在InnoDB事务模型里,其目标就是把多版本数据库的最佳属性和传统的两段锁相结合.InnoDB在行级进行加锁并且默认情况下将查询作为非锁定的一致性读取来运行,这是Oracle的风格.InnoDB中的锁信息是高效存储的所以不需要升级.通常允许多个用户锁定InnoDB表中的每一行,或行的任何随机子集而不会导致InnoDB内存耗尽.

##### 14.7.2.1 事务隔离级别
事务隔离是数据库处理的基础之一.隔离(Isolation)是ACID中I的缩写;隔离级别是在多个事务同时进行更改和执行查询时对性能和可靠性,一致性和结果的可重复性进行平衡的细微调整的设置.

InnoDB提供SQL:1992标准描述的四种事务隔离级别:` READ UNCOMMITTED`,` READ COMMITTED`,` REPEATABLE READ`和` SERIALIZABLE`.InnoDB默认的事务隔离级别是` REPEATABLE READ`.

用户可以改变单个会话(session)的隔离级别或使用`SET TRANSACTION`语句为连接后面所有的语句设置.为了对所有的连接设置服务器默认的隔离级别,在命令行使用` --transaction-isolation`选项或在配置文件中.

InnoDB支持对每个事务隔离级别使用不同的锁策略.你可以对符合ACID规范很重要的关键数据的操作使用默认的`REPEATABLE READ`级别来强制执行高一致性.或者你可以使用` READ COMMITTED`或` READ UNCOMMITTED`放松一致性要求,在例如批量报告等情况下,精确的一致性和可重复结果不如最小化锁的开销那么重要.` SERIALIZABLE`比` REPEATABLE READ`更严格,且主要用于特殊情况,例如XA事务以及并发和死锁的故障问题排除上.
<!-- more -->
下面列出了MySQL支持的不同事务隔离级别.排列顺序由最常使用到不经常使用:.
- REPEATABLE READ(可重复读)

  这是InnoDB默认的隔离级别.同一事务中的一致读读取第一次读取建立的快照.这意味着如果在同一事务中发出几个普通(非锁定)SELECT语句,这些SELECT语句也相互一致.

  对加锁读(`SELECT ... FOR UPDATE`或`SELECT ... LOCK IN SHARE MODE`),UPDATE和DELETE语句,根据是否语句使用了有唯一搜索条件的唯一索引或范围类型搜索条件.
  - 对使用唯一索引的唯一搜索条件,InnoDB只对找到的索引记录加锁,不对之前的间隙加锁.
  - 对其他搜索条件,InnoDB对扫描到的索引范围加锁,使用间隙锁或next-key锁来阻止其他会话插入覆盖的范围的间隙.

- READ COMMITTED(已提交读)

  即使在同一事务中,每个一致的读取也会设置和读取自己的新快照.

  对加锁读(`SELECT ... FOR UPDATE`或`SELECT ... LOCK IN SHARE MODE`),UPDATE和DELETE语句,InnoDB只锁定索引记录而不是之前的间隙,因此允许在锁定的记录边上自由插入新记录.间隙锁只用于外键约束检查和重复键检查.

  因为间隙锁被禁用,可能会引起幻读问题,因为其他会话可以在间隙中插入新的行.

  只有基于行的二进制日志(row-based logging)支持READ COMMITTED隔离级别.如果你在` binlog_format=MIXED`时使用READ COMMITTED,服务器会自动使用基于行的日志.

  使用READ COMMITTED还有其他影响:
  - 对UPDATE和DELETE语句,InnoDB只对update或delete的行保持锁.MySQL评估WHERE条件后,将释放不匹配行的记录锁.这大大降低了死锁的可能性,但仍然可能发生.
  - 对UPDATE语句,如果行已经被加锁,InnoDB会执行"半一致性"读,将最新提交的版本返回给MySQL,以便MySQL可以确定该行是否与UPDATE的WHERE条件匹配. 如果行匹配(必须更新),MySQL再次读取该行,这次InnoDB将其锁定或等待锁定.

  考虑下面的例子,从这个表开始:
  ```sql
  CREATE TABLE t (a INT NOT NULL, b INT) ENGINE = InnoDB;
  INSERT INTO t VALUES (1,2),(2,3),(3,2),(4,3),(5,2);
  COMMIT;
  ```
  在这个情况下,表没有索引所以搜索和索引扫描使用隐藏的聚簇索引进行记录加锁而不是被索引的列.

  假设一个会话使用下面的语句执行了一个UPDATE:
  ```sql
  # Session A
  START TRANSACTION;
  UPDATE t SET b = 5 WHERE b = 3;
  ```
  假设第二个会话在第一个会话之后执行UPDATE语句:
  ```sql
  # Session B
  UPDATE t SET b = 4 WHERE b = 2;
  ```
  当InnoDB执行每个UPDATE时,首先对读取的每一行获取一个独占锁,然后来决定是否修改.如果InnoDB没有修改行就会释放锁.换句话说,InnoDB会持有这些锁直到事务结束.对事务处理的影响如下.

  当使用默认的REPEATABLE READ隔离级别时,第一个UPDATE需要对读取的每一行加独占锁(X-lock)并且不释放任何一个:
  ```
  x-lock(1,2); retain x-lock
  x-lock(2,3); update(2,3) to (2,5); retain x-lock
  x-lock(3,2); retain x-lock
  x-lock(4,3); update(4,3) to (4,5); retain x-lock
  x-lock(5,2); retain x-lock
  ```
  第二个UPDATE在尝试获取任何锁时会立刻阻塞(因为第一个update对所有行持有锁),并且在第一个UPDATE提交或回滚之前不会继续执行:
  ```
  x-lock(1,2); block and wait for first UPDATE to commit or roll back
  ```
  如果改为使用READ COMMITTED,第一个UPDATE会对读取的每一行加独占锁(x-lock)并且释放不需要修改的行的锁:
  ```
  x-lock(1,2); unlock(1,2)
  x-lock(2,3); update(2,3) to (2,5); retain x-lock
  x-lock(3,2); unlock(3,2)
  x-lock(4,3); update(4,3) to (4,5); retain x-lock
  x-lock(5,2); unlock(5,2)
  ```
  对第二个UPDATE,InnoDB进行"半一致性"读,返回它读取到MySQL的每一行的最新提交版本,以便MySQL可以确定该行是否与UPDATE的WHERE条件匹配:
  ```
  x-lock(1,2); update(1,2) to (1,4); retain x-lock
  x-lock(2,3); unlock(2,3)
  x-lock(3,2); update(3,2) to (3,4); retain x-lock
  x-lock(4,3); unlock(4,3)
  x-lock(5,2); update(5,2) to (5,4); retain x-lock
  ```
  然而,如果WHERE条件包含被索引的列并且InnoDB使用索引列,在获取和保留记录锁的时候只有被索引的列会被考虑.在下面的例子里,第一个UPDATE获取和保留了b=2的所有行的独占锁(x-lock).第二个UPDATE在尝试获取相同记录的独占锁时阻塞,因为其也使用了在b列上定义的索引.
  ```sql
  CREATE TABLE t (a INT NOT NULL, b INT, c INT, INDEX (b)) ENGINE = InnoDB;
  INSERT INTO t VALUES (1,2,3),(2,2,4);
  COMMIT;

  # Session A
  START TRANSACTION;
  UPDATE t SET b = 3 WHERE b = 2 AND c = 3;

  # Session B
  UPDATE t SET b = 4 WHERE b = 2 AND c = 4;
  ```
  使用READ COMMITTED隔离级别的效果与启用不推荐使用的`innodb_locks_unsafe_for_binlog`配置选项相同,但有以下例外:
  - 启用`innodb_locks_unsafe_for_binlog`是一个全局设置并影响所有会话,而隔离级别可以为所有会话全局设置,也可以为每个会话单独设置.
  - `innodb_locks_unsafe_for_binlog`只能在服务器启动时设置,而隔离级别可以在启动时设置或在运行时更改.

- READ UNCOMMITTED(未提交读)

  SELECT语句以非锁定方式执行,但可能使用行的早期版本.因此,使用此隔离级别读取可能不一致.这也被称为脏读.除了这点之外,此隔离级别与READ COMMITTED类似.

- SERIALIZABLE(可串行化)

  这个级别就像REPEATABLE READ,但InnoDB隐式地将所有普通SELECT语句转换为`SELECT ... LOCK IN SHARE MODE`如果禁用自动提交(autocommit).如果启用了自动提交,则每个SELECT都是事务.因此,已知它是只读的,并且如果作为一致(非锁定)读取执行则可以序列化,并且不需要阻止其他事务.(要强制普通SELECT阻止其他事务已修改所选行,请禁用自动提交.)

##### 14.7.2.2 自动提交,提交和回滚
在InnoDB中,所有用户活动都发生在事务里.如果启用自动提交,每个SQL语句自己形成一个事务.默认情况下,MySQL为每个新的连接开启一个启用自动提交的会话,所以如果语句执行没有返回错误的话,MySQL会在每个SQL后执行一个提交(commit).如果语句返回错误,根据错误信息会进行提交或者回滚.

启用了自动提交的事务可以使用以` START TRANSACTION`或` BEGIN`开始,以`COMMIT`或`ROLLBACK`结束的语句来显式执行多语句的事务.

如果在一个会话中`SET autocommit = 0`来禁用自动提交的话,会话会始终打开一个事务.`COMMIT`或`ROLLBACK`语句结束当前的事务然后会打开一个新的.

如果禁用自动提交的事务没有显式的提交来结束事务的话,MySQL会回滚改事务.

某些语句会隐式的结束一个事务,就像你在执行完语句之前执行了一个`COMMIT`一样.

COMMIT表示当前事务中所做的更改是永久性的,并且对其他会话可见.另一方面,ROLLBACK语句取消当前事务所做的所有修改.COMMIT和ROLLBACK都释放在当前事务期间设置的所有InnoDB锁.

**使用事务对DML操作分组(Grouping DML Operations with Transactions)**

默认情况下,与MySQL服务器的连接始于启用自动提交模式,该模式会在你执行时自动提交每个SQL语句.如果你有其他数据库系统的经验,可能不熟悉此操作模式,其中标准做法是发出一系列DML语句并将它们提交或一起回滚.

为了使用多语句事务,使用SQL语句`SET autocommit = 0`关闭自动提交并且每个事务都以COMMIT或ROLLBACK结束.要启用自动提交,使用START TRANSACTION开始每个事务,使用COMMIT或ROLLBACK结束.下面的例子展示了两个事务.第一个被提交,第二个回滚了.
```
shell> mysql test
```

```sql
mysql> CREATE TABLE customer (a INT, b CHAR (20), INDEX (a));
Query OK, 0 rows affected (0.00 sec)
mysql> -- Do a transaction with autocommit turned on.
mysql> START TRANSACTION;
Query OK, 0 rows affected (0.00 sec)
mysql> INSERT INTO customer VALUES (10, 'Heikki');
Query OK, 1 row affected (0.00 sec)
mysql> COMMIT;
Query OK, 0 rows affected (0.00 sec)
mysql> -- Do another transaction with autocommit turned off.
mysql> SET autocommit=0;
Query OK, 0 rows affected (0.00 sec)
mysql> INSERT INTO customer VALUES (15, 'John');
Query OK, 1 row affected (0.00 sec)
mysql> INSERT INTO customer VALUES (20, 'Paul');
Query OK, 1 row affected (0.00 sec)
mysql> DELETE FROM customer WHERE b = 'Heikki';
Query OK, 1 row affected (0.00 sec)
mysql> -- Now we undo those last 2 inserts and the delete.
mysql> ROLLBACK;
Query OK, 0 rows affected (0.00 sec)
mysql> SELECT * FROM customer;
+------+--------+
| a    | b      |
+------+--------+
|   10 | Heikki |
+------+--------+
1 row in set (0.00 sec)
mysql>
```

**客户端语言中的事务(Transactions in Client-Side Languages)**

在例如PHP,Perl DBI,JDBC,ODBC或其他MySQL标准C调用接口,你可以将事务控制语句(如COMMIT)作为字符串发送到MySQL服务器,就像任何其他SQL语句(如SELECT或INSERT)一样.某些API还提供单独的特殊事务提交和回滚功能或方法.


##### 14.7.2.3 一致性非锁定读(Consistent Nonlocking Reads)
一致性读意味着InnoDB使用多版本控制(multi-versioning)在某个时间点向查询提供数据库的快照.查询将查看在该时间点之前提交的事务所做的更改,并且不会对以后或未提交的事务所做的更改进行更改.此规则的例外是查询会查看同一事务中更早提交的语句所做的更改.这个例外会导致下面的问题:如果你更新了表中的某些行,一个`SELECT`会查看最近更新的行,但它也可能查找到任何行的旧版本.如果其他会话同时更新相同的表,问题出现在你可能会看到一个从没在数据库中存在过的该表的状态.

如果事务的隔离级别是REPEATABLE READ(默认配置),同一事务中的所有一致性读都读取该事务第一次创建的快照.你可以在执行了新的查询之后提交该事务来获得一个更新的快照.

在READ COMMITTED隔离级别下,事务的每个一致性读都读取其自己的新快照.

一致性读是InnoDB的` READ COMMITTED`和` REPEATABLE READ`隔离级别默认的SELECT语句的处理模式.一致性读不在访问的表上设置任何锁,因此其他会话可以在一致性读在表上执行的同时自由地修改这些表.

假设你运行在默认的 REPEATABLE READ事务隔离级别下.当你发起一个一致性读(也就是普通的SELECT语句)的时候,InnoDB给你一个事务的时间点,根据这个时间点来查询你要查看的数据库.如果其他事务在你被授予的时间点之后删除了一行数据然后提交的话,你是不会看见这行数据被删除的.INSERT和UPDATE也是相似的.

你可以通过提交事务来更新你的时间点然后进行新的`SELETE`或` START TRANSACTION WITH CONSISTENT SNAPSHOT`.

这被称为多版本并发控制(multi-versioned concurrency control).

在下面的例子里,会话A只有在B提交了insert数据并且A自己也进行了提交之后才能看到B插入的数据(因为时间节点更新到了B提交之后).
```
             Session A              Session B

           SET autocommit=0;      SET autocommit=0;
time
|          SELECT * FROM t;
|          empty set
|                                 INSERT INTO t VALUES (1, 2);
|
v          SELECT * FROM t;
           empty set
                                  COMMIT;

           SELECT * FROM t;
           empty set

           COMMIT;

           SELECT * FROM t;
           ---------------------
           |    1    |    2    |
           ---------------------
```
如果你想始终查看"最新鲜"的数据库,使用` READ COMMITTED`事务隔离级别或者加锁读:
```sql
SELECT * FROM t FOR SHARE;
```
在READ COMMITTED隔离级别下,一个事务下的每个一致性读都会设置和读取自己最新的快照.使用`LOCK IN SHARE MODE`会发生加锁读:SELECT会阻塞直到包含有最新行的事务结束(才执行).

一致性读对某些DDL语句不起作用:
- 一致性读对`DROP TABLE`不起作用,因为MySQL不能使用已被删除的表而且InnoDB会破坏该表.
- 一致性读对`ALTER TABLE`不起作用,因为这个语句会制作一个原表的临时拷贝然后在临时拷贝构建之后删除原表.当在事务中重新发出一致读时,新表中的行不可见,因为在执行事务快照时这些行不存在.在这种情况下,事务会返回一个错误: ER_TABLE_DEF_CHANGED,"表定义被修改,请重试事务".

不指定`FOR UPDATE`或`LOCK IN SHARE MODE`的select的读取类型因`INSERT INTO ... SELECT`,`UPDATE ...(SELECT)`和`CREATE TABLE ... SELECT`等子句中的选择而异.
- 默认情况下,InnoDB使用更强的锁(粒度更大),SELECT部分​​的作用类似于READ COMMITTED,即使在同一事务中,每个一致的读取也会设置和读取自己的新快照.
- 要在这种情况下使用一致的读取,启用`innodb_locks_unsafe_for_binlog`选项并将事务的隔离级别设置为READ UNCOMMITTED,READ COMMITTED或REPEATABLE READ.在这种情况下,不会对从所选表中读取的行设置锁.

##### 14.7.2.4 加锁读(Locking Reads)
如果你在同一个事务里查询数据然后插入或更新相关的数据,常规SELECT语句没有提供足够的保护.其他事务可以更新或删除你刚刚查询的行.InnoDB支持两种类型的加锁读来提供额外的安全性:
- SELECT ... LOCK IN SHARE MODE

  在读取的所有行上设置一个共享模式锁.其他会话可以读取这些行,但是直到你的事务提交之前都不能修改它们.如果这些行中的任何一行被其他没有提交的事务修改的话,你的查询会等到这些事务结束然后使用最新的值.
- SELECT ... FOR UPDATE

  对于搜索遇到的索引记录,锁定行和任何关联的索引条目,就像对这些行使用UPDATE语句一样.其他事务更新这些行会被阻塞,从`SELECT ... LOCK IN SHARE MODE`,或从某些事务隔离级别读取数据.一致性读取将忽略在读取视图中存在的记录上设置的任何锁.(无法锁定旧版本的记录;它们通过在记录的内存中副本上应用撤消日志来重建).

这些子句在处理树形结构或图形结构数据时非常有用,无论是在单个表中还是在多个表中分割.你将边缘或树的分支从一个地方遍历到另一个地方,同时保留返回的权限并更改任何这些"指针"值.

在提交或回滚事务时,将释放由LOCK IN SHARE MODE和FOR UPDATE查询设置的所有锁.

外部语句中的锁定读取子句不会锁定嵌套子查询中的表行,除非在子查询中也指定了锁定读取子句.例如,以下语句不会锁定表t2中的行:
```
SELECT * FROM t1 WHERE c1 = (SELECT c1 FROM t2) FOR UPDATE;
```
要锁定表t2中的行,请在子查询中添加一个锁定读取子句:
```
SELECT * FROM t1 WHERE c1 = (SELECT c1 FROM t2 FOR UPDATE) FOR UPDATE;
```

**加锁读的例子**

假设你想要插入一个新行到子表中,确认对应的子表行在父表中有父行.你的应用程序代码可确保整个操作序列中的引用完整性.

首先,使用一个一致性读查询父表并且确认父表中的行存在.你可以将子行安全的插入到子表吗?不,因为其他会话可以在你的SELECT和INSERT语句之间删除父表中的行而你不会意识到.

为了避免上面的问题,使用`LOCK IN SHARE MODE`来执行SELECT:
```sql
SELECT * FROM parent WHERE NAME = 'Jones' LOCK IN SHARE MODE;
```
在LOCK IN SHARE MODE查询返回父表数据'Jones'之后,你可以安全的添加子记录到子表中然后提交事务.尝试获取父表中适用行的独占锁的任何事务都会等到完成后,即直到所有表中的数据都处于一致状态.

对另一个例子,考虑表CHILD_CODES中的一个整数计数字段,用于为添加到CHILD表中的数据分配唯一标识符.不要使用一致读取或共享模式读取来读取计数器的当前值,因为数据库的两个用户可以看到计数器的相同值,如果两个事务尝试将具有相同标识符的行添加到CHILD表,则会发生重复键错误.

在这里 LOCK IN SHARE MODE不是一个好的解决方法因为如果两个用户同时读取计数器,当它尝试更新计数器时,至少有一个用户会死锁.

要实现读取和递增计数器,首先使用FOR UPDATE执行计数器的锁定读取,然后递增计数器.例如:
```sql
SELECT counter_field FROM child_codes FOR UPDATE;
UPDATE child_codes SET counter_field = counter_field + 1;
```
`SELECT ... FOR UPDATE`读取最新的可用数据,在其读取的每一行上设置独占锁.因此,它设置搜索的SQL UPDATE将在行上设置的相同锁.

前面的描述仅仅是`SELECT ... FOR UPDATE`如何工作的一个例子.在MySQL中,生成唯一标识符的具体任务实际上只需对表进行一次访问即可完成:
```sql
UPDATE child_codes SET counter_field = LAST_INSERT_ID(counter_field + 1);
SELECT LAST_INSERT_ID();
```
SELECT语句仅检索标识符信息(特定于当前连接).它不访问任何表.

#### 14.7.3 InnoDB中的不同SQL语句设置的锁
加锁读,UPDATE或DELETE会在正在处理的SQL语句中被扫描到的每个索引记录上设置锁.这跟WHERE子句中是否会排除行数据无关.InnoDB不会记住精确的WHERE语句,(它)只知道索引要扫描的范围.锁通常是next-key锁同时也会阻止插入到记录之前的间隙(gap)中.然而间隙锁可以被显式禁用,这会导致next-key锁不被使用.

如果在搜索中使用了二级索引并且索引记录被设置为独占,InnoDB也会检索相应的聚簇索引并且对其加锁.

如果对你的语句没有合适的索引,MySQL必须扫描整张表来处理语句,表中的每一行都会被加锁,这会使得其他用户对这张表的insert操作全部阻塞.创建一个好的索引非常重要,这样你的查询就不会扫描到很多不必要的行.

InnoDB设置特定类型的锁,如下:
- `SELECT...FROM`是一个一致性读,会读取数据库的一个快照并且不会加锁,除非事务的隔离级别被设置成`SERIALIZABLE`.对`SERIALIZABLE`级别,搜索会在遇到的索引记录上设置一个共享的next-key锁.但是,对于使用唯一索引锁定行以搜索唯一行的语句,只需要索引记录锁定.
- 对`SELECT...FOR UPDATE`或`SELECT...LOCK IN SHARE MODE`,会对需要扫描的行加锁,并且对预计不会出现在结果集中的行释放锁(例如,如果其不符合where子句中的要求).然而,在某些情况下,行也许不会被立刻解锁因为在查询期间结果行和原始数据之间的关系可能会丢失.例如,从表中扫描(和锁定)的行可能会在评估它们是否符合结果之前插入临时表中. 在这种情况下,临时表中的行与原始表中的行的关系将丢失,并且在查询执行结束之前不会解锁后面的行.
- `SELECT...LOCK IN SHARE MODE`在搜索遇到的所有的索引记录上设置共享next-key锁.但是,对于使用唯一索引锁定行以搜索唯一行的语句,只需要索引记录锁定.
- `SELECT...FOR UPDATE`在搜索遇到的所有索引记录上设置一个独占的next-key锁.但是,对于使用唯一索引锁定行以搜索唯一行的语句,只需要索引记录锁定.

    对搜索遇到的索引记录,`SELECT...FOR UPDATE`会阻止其他会话执行`SELECT...LOCK IN SHARE MODE`或从其他事务隔离级别读取.一致性读取将忽略在读取视图中存在的记录上设置的任何锁定.

- `UPDATE...WHERE...`在搜索遇到的所有索引记录上设置独占的next-key锁.但是,对于使用唯一索引锁定行以搜索唯一行的语句,只需要索引记录锁定.
- 当UPDATE修改一个聚簇索引记录时,对受影响的二级索引记录采用隐式锁定.在插入新的辅助索引记录之前以及插入新的辅助索引记录时,UPDATE操纵同时也获取受影响的二级索引记录上的共享锁.
- `DELETE FROM...WHERE...`在搜索遇到的所有索引记录上设置独占的next-key锁.但是,对于使用唯一索引锁定行以搜索唯一行的语句,只需要索引记录锁定.
- INSERT在被插入的行上设置独占锁.该锁是一个索引记录锁,不是一个next-key锁并且不会阻止其他会话插入数据到这已经插入的行之前的间隙中.

    在插入行之前,一个被称为插入意图锁的间隙锁被设置.此锁定表示插入的意图,即插入到相同索引间隙中的多个事务如果不插入间隙内的相同位置则不需要彼此等待.假设有索引记录4和7.分别有2个事务要向4和7之间插入5和6,这两个事务都会在获取插入行的独占锁之前对4和7之间的插入意图锁进行加锁,但是他们不会互相阻塞因为这两行是非冲突的.

    如果发生了重复键错误,会在重复的索引记录上设置共享锁.如果有多个会话尝试插入同一行,如果另一个会话已经具有独占锁,则使用共享锁可能导致死锁.如果另一个会话删除该行,则会发生这种情况.假设InnoDB表t1具有以下结构：
    ```sql
    CREATE TABLE t1 (i INT, PRIMARY KEY (i)) ENGINE = InnoDB;
    ```
    现在假设三个会话按顺序执行以下操作:

    Session1:
    ```sql
    START TRANSACTION;
    INSERT INTO t1 VALUES(1);
    ```
    Session2:
    ```sql
    START TRANSACTION;
    INSERT INTO t1 VALUES(1);
    ```
    Session3:
    ```sql
    START TRANSACTION;
    INSERT INTO t1 VALUES(1);
    ```
    Session1:
    ```sql
    ROLLBACK;
    ```

    session1的第一个操作需要一个行的独占锁.session2和3同时引起了重复键错误并且都请求了该行的共享锁.当session1回滚的时候,会释放独占锁并且session2和3的共享锁请求会被授予.在这个时候,session2和3会死锁:无论谁都无法获取行的独占锁因为它们都持有对方的共享锁.

    如果表已经包含了键值为1的行然后三个会话执行下面的操作的话也会出现类似的情况:

    session1:
    ```sql
    START TRANSACTION;
    DELETE FROM t1 WHERE i = 1;
    ```
    session2:
    ```sql
    START TRANSACTION;
    INSERT INTO t1 VALUES(1);
    ```
    session3:
    ```sql
    START TRANSACTION;
    INSERT INTO t1 VALUES(1);
    ```
    session1:
    ```sql
    COMMIT;
    ```

    session1的第一个操作需要一个行的独占锁.session2和3都会引起一个重复键错误并且都请求了该行的共享锁.当session1提交的时候会释放行上的独占锁并且会授予session2和3共享锁.在这个时候session2和3会死锁:无论谁都无法获取行的独占锁因为它们都持有对方的共享锁.

- `INSERT...ON DUPLICATE KET UPDATE`与简单的INSERT的不同之处在于,当发生重复键错误时,在要更新的行上放置独占锁而不是共享锁.对重复的主键值采用独占索引记录锁定.对于重复的唯一键值,采用独占的下一键锁定.
- 如果唯一键没有冲突,REPLACE就像INSERT一样.否则,将在要替换的行上放置专用的next-key锁.
- `INSERT INTO T SELECT ... FROM S WHERE ...`在插入T的每一行上设置一个独占索引记录锁.如果事务隔离级别是`READ COMMITTED`或`innodb locks unsafe for binlog`启用并且事务隔离级别不是`SERIALIZABLE`,InnoDB会在s的搜索上使用一致性读.换句话说,InnoDB在从s读取的行上设置共享的next-key锁.InnoDB必须在后一种情况下设置锁定:在使用基于语句的二进制日志进行前滚恢复期间,每个SQL语句必须以与最初完成时相同的方式执行.

    `CREATE TABLE...SELECT...`执行带有共享next-key锁或一致性读的SELECT,类似`INSERT...SELECT`.

    当SELECT用来构造`REPLACE INTO t SELECT...FROM s WHERE ...` 或 `UPDATE t ... WHERE col IN (SELECT ... FROM s)`, InnoDB在表s的行上设置共享的next-key锁.

- 在初始化表上的先前指定的AUTO_INCREMENT列时,InnoDB在与AUTO_INCREMENT列关联的索引的末尾设置独占锁.在访问自增计数器时,InnoDB使用特定的AUTO-INC表锁定模式,其中锁定仅持续到当前SQL语句的末尾,而不是整个事务的结束.在保持AUTO-INC表锁时,其他会话无法插入表中.

    InnoDB在不设置任何锁定的情况下获取先前初始化的AUTO_INCREMENT列的值.

- 如果在表上定义了FOREIGN KEY约束,则需要检查约束条件的任何插入,更新或删除都会在其查看的记录上设置共享记录级锁定以检查约束.InnoDB还在约束失败的情况下设置这些锁.
- LOCK TABLES设置表锁,但它是设置这些锁的InnoDB层之上的更高的MySQL层.如果innodb_table_locks = 1(默认值)和autocommit = 0，InnoDB知道表锁，并且InnoDB上方的MySQL层知道行级锁.

    否则,InnoDB的自动死锁检测无法检测到涉及此类表锁的死锁.此外,因为在这种情况下,较高的MySQL层不知道行级锁,所以可以在另一个会话当前具有行级锁的表上获得表锁.但是，这不会危及事务的完整性.
