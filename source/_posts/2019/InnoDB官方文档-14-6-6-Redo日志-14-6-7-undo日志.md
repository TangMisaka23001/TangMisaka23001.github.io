---
title: InnoDB官方文档--14.6.6 Redo日志|14.6.7 undo日志
mathjax: false
date: 2019-03-30 15:24:30
categories: [技术]
tags: [MySQL, InnoDB]
---
#### 14.6.6 Redo日志
redo 日志是一个基于磁盘的数据结构,在崩溃恢复期间用于纠正由不完整事务写入的数据.在正常操作期间,redo日志对更改由SQL语句或低级API调用产生的表数据的请求进行编码.未完成更新数据文件的修改会在以外关闭自动重启的初始化期间和连接接受之前完成.

默认情况下,redo日志在磁盘上由两个名为ib_logfile0和ib_logfile1的文件表示.MySQL以循环方式写入redo日志文件.redo日志中的数据根据​​受影响的记录进行编码;这些数据统称为redo.通过redo日志的数据传递由不断增加的LSN值表示.

**改变InnoDB redo日志文件的数量或大小**

为了改变InnoDB redo日志文件的大小或数量,执行下面的步骤:
1. 停止MySQL服务并且保证关闭时没有错误.
2. 编辑my.cnf改变日志文件配置.修改` innodb_log_file_size`来改变日志文件的大小,修改`innodb_log_files_in_group`来增加日志文件的数量.
3. 再次启动MySQL服务.

InnoDB如果检测到redo日志文件大小和` innodb_log_file_size`不一样,会写下日志检查点,关闭和删除旧的日志文件,按照需要的大小创建新的日志文件并且打开新的日志文件(使用).

**redo日志刷新的分组提交(Group Commit for Redo Log Flushing)**

InnoDB和其他任何符合ACID标准的数据库引擎一样,在提交事务之前刷新事务的redo日志.InnoDB使用组提交功能将多个刷新请求组合在一起来避免每次只提交一个刷新.通过组提交,InnoDB会对日志文件发出一次写入操作来为同时提交的多个用户事务执行提交操作,从而显着提高吞吐量.
<!-- more -->
#### 14.6.7 undo日志
undo日志是与单个读写事务关联的undo日志记录的集合.undo日志包含了如何撤销最近由事务引起的聚簇索引记录变化的信息.如果另一个事务需要将原始数据视为一致读取操作的一部分,没有修改的数据可以从undo日志记录中恢复.undo日志存在于undo日志段中,包含在回滚段之内.回滚段位于系统表空间,undo表空间和临时表空间中.

临时表空间中的undo日志用来修改用户定义的临时表中的数据的事务.这些undo日志不会被redo日志记录,因为它们不是崩溃恢复必要的日志.它们只用来在服务器运行时的回滚.这种类型的undo日志的好处是避免了redo日志执行需要的I/O.

InnoDB支持最大128个回滚段,其中的32个用于临时表空间.剩余的96个回滚段用于正常表的事务数据修改.` innodb_rollback_segments`变量定义InnoDB使用的回滚段的数量.

回滚段中的撤消槽数根据InnoDB页面大小而不同.

![](https://i.loli.net/2019/03/25/5c98946a0bb1b.png) 

事务最多分配4个undo日志，每个日志对应于以下每种操作类型:
1. 用户定义表(user-defined tables)上的INSERT操作.
2. 用户定义表(user-defined tables)上的UPDATE和DELETE操作.
3. 用户定义临时表上的INSERT操作.
4. 用户定义临时表上的UPDATE和DELETE操作.

根据需要分配undo日志.例如,对常规表和临时表执行INSERT,UPDATE和DELETE操作的事务需要完全分配四个撤消日志.只对常规表执行INSERT操作的事务需要一个undo日志.

在常规表上执行的事务操作从分配的系统表空间或undo表空间回滚段中分配undo日志.在临时表上执行的事务操作从分配的临时表空间中分配undo日志.

分配给事务的undo日志在事务持续时间事务相关联.例如,分配给常规表上INSERT操作的事务的undo日志用于该事务执行的常规表上的所有INSERT操作.

鉴于上述因素,可以使用以下公式来估计InnoDB能够支持的并发读写事务的数量.
- 如果每个事务都执行INSERT或UPDATE或DELETE操作,InnoDB能够支持的并发读写事务的数量是:
    ```
    (innodb_page_size / 16) * (innodb_rollback_segments - 32)
    ```
- 如果每个事务分别执行INSERT和UPDATE或DELETE操作,则InnoDB能够支持的并发读写事务的数量是:
    ```
    (innodb_page_size / 16 / 2) * (innodb_rollback_segments - 32)
    ```
- 如果每个事务对临时表执行INSERT操作,则InnoDB能够支持的并发读写事务的数量是:
    ```
    如果每个事务对临时表执行INSERT操作，则InnoDB能够支持的并发读写事务的数量是
    ```
- 如果每个事务对临时表执行INSERT和UPDATE或DELETE操作,则InnoDB能够支持的并发读写事务的数量是:
    ```
    (innodb_page_size / 16 / 2) * 32
    ```
