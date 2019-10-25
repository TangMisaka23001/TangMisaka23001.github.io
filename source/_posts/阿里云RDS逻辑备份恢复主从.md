---
title: 阿里云RDS逻辑备份恢复主从
categories:
  - 问题解决
tags:
  - MySQL
  - 阿里云
mathjax: false
date: 2019-03-02 15:59:20
---

# 问题产生
在主从备份恢复没多久之后,从库又出现了新的错误:
```shell
The manual page at http://dev.mysql.com/doc/mysql/en/crashing.html contains
information that should help you find out what is causing the crash.
190220 00:00:01 mysqld_safe Number of processes running now: 0
190220 00:00:01 mysqld_safe mysqld restarted
2019-02-20 00:00:02 0 [Warning] TIMESTAMP with implicit DEFAULT value is deprecated. Please use --explicit_defaults_for_timestamp server option (see documentation for more details).
2019-02-20 00:00:02 0 [Note] /usr/sbin/mysqld (mysqld 5.6.39-log) starting as process 31815 ...
2019-02-20 00:00:02 31815 [Note] Plugin 'FEDERATED' is disabled.
2019-02-20 00:00:02 31815 [Note] InnoDB: Using atomics to ref count buffer pool pages
2019-02-20 00:00:02 31815 [Note] InnoDB: The InnoDB memory heap is disabled
2019-02-20 00:00:02 31815 [Note] InnoDB: Mutexes and rw_locks use GCC atomic builtins
2019-02-20 00:00:02 31815 [Note] InnoDB: Memory barrier is not used
2019-02-20 00:00:02 31815 [Note] InnoDB: Compressed tables use zlib 1.2.3
2019-02-20 00:00:02 31815 [Note] InnoDB: Using Linux native AIO
2019-02-20 00:00:02 31815 [Note] InnoDB: Using CPU crc32 instructions
2019-02-20 00:00:02 31815 [Note] InnoDB: Initializing buffer pool, size = 128.0M
2019-02-20 00:00:02 31815 [Note] InnoDB: Completed initialization of buffer pool
2019-02-20 00:00:02 31815 [Note] InnoDB: Highest supported file format is Barracuda.
2019-02-20 00:00:02 31815 [Note] InnoDB: Log scan progressed past the checkpoint lsn 17886034157
2019-02-20 00:00:02 31815 [Note] InnoDB: Database was not shutdown normally!
2019-02-20 00:00:02 31815 [Note] InnoDB: Starting crash recovery.
2019-02-20 00:00:02 31815 [Note] InnoDB: Reading tablespace information from the .ibd files...
2019-02-20 00:00:02 31815 [Note] InnoDB: Restoring possible half-written data pages 
2019-02-20 00:00:02 31815 [Note] InnoDB: from the doublewrite buffer...
InnoDB: Doing recovery: scanned up to log sequence number 17886040149
InnoDB: Last MySQL binlog file position 0 5052574, file name mysql-bin.000002
2019-02-20 00:00:02 31815 [Note] InnoDB: 128 rollback segment(s) are active.
2019-02-20 00:00:02 31815 [Note] InnoDB: Waiting for purge to start
2019-02-20 00:00:02 31815 [Note] InnoDB: 5.6.39 started; log sequence number 17886040149
2019-02-20 00:00:02 31815 [Note] Recovering after a crash using /data/log/mysql/mysql-bin
2019-02-20 00:00:02 31815 [Note] Starting crash recovery...
2019-02-20 00:00:02 31815 [Note] Crash recovery finished.
2019-02-20 00:00:02 31815 [Note] Server hostname (bind-address): '*'; port: 3306
2019-02-20 00:00:02 31815 [Note] IPv6 is available.
2019-02-20 00:00:02 31815 [Note]   - '::' resolves to '::';
2019-02-20 00:00:02 31815 [Note] Server socket created on IP: '::'.
2019-02-20 00:00:02 31815 [Warning] 'user' entry 'root@izbp127nd1c1ngjebt90o3z' ignored in --skip-name-resolve mode.
2019-02-20 00:00:02 31815 [Warning] 'user' entry '@izbp127nd1c1ngjebt90o3z' ignored in --skip-name-resolve mode.
2019-02-20 00:00:02 31815 [Warning] 'proxies_priv' entry '@ root@izbp127nd1c1ngjebt90o3z' ignored in --skip-name-resolve mode.
2019-02-20 00:00:02 31815 [Warning] Neither --relay-log nor --relay-log-index were used; so replication may break when this MySQL server acts as a slave and has his hostname changed!! Please use '--relay-log=mysqld-relay-bin' to avoid this problem.
2019-02-20 00:00:02 31815 [Warning] Storing MySQL user name or password information in the master info repository is not secure and is therefore not recommended. Please consider using the USER and PASSWORD connection options for START SLAVE; see the 'START SLAVE Syntax'
 in the MySQL Manual for more information.
2019-02-20 00:00:02 31815 [Note] Slave I/O thread: connected to master 'slave-001-read@rm-bp16vmecn3tzzl51u.mysql.rds.aliyuncs.com:3306',replication started in log 'mysql-bin.001423' at position 4492905
2019-02-20 00:00:02 31815 [Note] Event Scheduler: Loaded 0 events
2019-02-20 00:00:02 31815 [Note] /usr/sbin/mysqld: ready for connections.
Version: '5.6.39-log'  socket: '/data/mysql/mysql.sock'  port: 3306  MySQL Community Server (GPL)
2019-02-20 00:00:02 31815 [Warning] Slave SQL: If a crash happens this configuration does not guarantee that the relay log info will be consistent, Error_code: 0
2019-02-20 00:00:02 31815 [Note] Slave SQL thread initialized, starting replication in log 'mysql-bin.001422' at position 1778562, relay log './mysqld-relay-bin.000006' position: 1778732
2019-02-20 00:00:02 7f3b7850e700  InnoDB: Assertion failure in thread 139893398365952 in file pars0pars.cc line 865
InnoDB: Failing assertion: sym_node->table != NULL
InnoDB: We intentionally generate a memory trap.
InnoDB: Submit a detailed bug report to http://bugs.mysql.com.
InnoDB: If you get repeated assertion failures or crashes, even
InnoDB: immediately after the mysqld startup, there may be
InnoDB: corruption in the InnoDB tablespace. Please refer to
InnoDB: http://dev.mysql.com/doc/refman/5.6/en/forcing-innodb-recovery.html
InnoDB: about forcing recovery.
16:00:02 UTC - mysqld got signal 6 ;
This could be because you hit a bug. It is also possible that this binary
or one of the libraries it was linked against is corrupt, improperly built,
or misconfigured. This error can also be caused by malfunctioning hardware.
We will try our best to scrape up some info that will hopefully help
diagnose the problem, but since we have already crashed, 
something is definitely wrong and this may fail.

key_buffer_size=8388608
read_buffer_size=131072
max_used_connections=0
max_threads=2000
thread_count=2
connection_count=0
It is possible that mysqld could use up to 
key_buffer_size + (read_buffer_size + sort_buffer_size)*max_threads = 801785 K  bytes of memory
Hope that's ok; if not, decrease some variables in the equation.

Thread pointer: 0x7f3b48000990
Attempting backtrace. You can use the following information to find out
where mysqld died. If you see no messages after this, something went
terribly wrong...
stack_bottom = 7f3b7850d9d0 thread_stack 0x40000
/usr/sbin/mysqld(my_print_stacktrace+0x3b)[0x8e986b]
/usr/sbin/mysqld(handle_fatal_signal+0x491)[0x675b01]
/lib64/libpthread.so.0(+0xf5e0)[0x7f3bb5b895e0]
/lib64/libc.so.6(gsignal+0x37)[0x7f3bb47831f7]
/lib64/libc.so.6(abort+0x148)[0x7f3bb47848e8]
/usr/sbin/mysqld[0x988ce7]
/usr/sbin/mysqld(_Z7yyparsev+0x1e7f)[0xabecdf]
/usr/sbin/mysqld[0x98af81]
/usr/sbin/mysqld[0xaba9f8]
/usr/sbin/mysqld[0xaa0786]
/usr/sbin/mysqld[0xaad730]
/usr/sbin/mysqld[0xaad985]
/usr/sbin/mysqld[0xaadf10]
/usr/sbin/mysqld[0x9b1d78]
/usr/sbin/mysqld[0x921478]
/usr/sbin/mysqld(_ZN7handler12ha_write_rowEPh+0xaa)[0x5bdbfa]
/usr/sbin/mysqld(_ZN20Write_rows_log_event9write_rowEPK14Relay_log_infob+0x135)[0x8804d5]
/usr/sbin/mysqld(_ZN20Write_rows_log_event11do_exec_rowEPK14Relay_log_info+0x19)[0x8807f9]
/usr/sbin/mysqld(_ZN14Rows_log_event12do_apply_rowEPK14Relay_log_info+0x26)[0x870586]
/usr/sbin/mysqld(_ZN14Rows_log_event14do_apply_eventEPK14Relay_log_info+0x566)[0x87e616]
/usr/sbin/mysqld(_ZN9Log_event11apply_eventEP14Relay_log_info+0x6a)[0x877dfa]
/usr/sbin/mysqld(_Z26apply_event_and_update_posPP9Log_eventP3THDP14Relay_log_info+0x258)[0x8affa8]
/usr/sbin/mysqld(handle_slave_sql+0x17ce)[0x8b3dde]
/usr/sbin/mysqld(pfs_spawn_thread+0x146)[0xb417a6]
/lib64/libpthread.so.0(+0x7e25)[0x7f3bb5b81e25]
/lib64/libc.so.6(clone+0x6d)[0x7f3bb484634d]

Trying to get some variables.
Some pointers may be invalid and cause the dump to abort.
Query (0): Connection ID (thread ID): 2
Status: NOT_KILLED
```
<!-- more -->
并且大量出现了这个错误日志,同时MySQL的目录下relay_log大量堆积.并且服务器一直处于无法正常启动的情况下,在参考了[mysql的killed mysql数据启动大量报错且无法启动故障排查](https://m.fuwuqizhijia.com/mysql/201704/33120.html)之后,使用下面的方法正常启动的MySQL的进程:
```sql
/mysql/bin/mysqld_safe --relay-log nor --relay-log-index
```
个人估计原因是由于主从同步一直失败导致MySQL目录下relay_log堆积过多导致的,思路来自这个错误信息:
```
2019-02-20 00:00:02 31815 [Warning] Neither --relay-log nor --relay-log-index were used; so replication may break when this MySQL server acts as a slave and has his hostname changed!! Please use '--relay-log=mysqld-relay-bin' to avoid this problem.
```
启动成功之后执行下面的命令:
```sql
stop slave;
reset slave all;
```
并且清空了relay_log之后就可以正常启动MySQL的服务了.
# 尝试恢复主从
在经历了上一次的折腾之后,本以为可以轻松恢复主从同步,没想到还是踩了很多的坑.

## 基于逻辑备份
使用上次基于物理备份恢复单库的时候出现了致命的问题,数据恢复之后指定了对应的GTID,但是relay_log的位置并没有和主库对齐导致数据无法继续同步.于是换用了逻辑备份的方式,再次之前查看了GTID相关的内容.

## GITD
> **什么是GTID**
>
> GTID (Global Transaction ID) 是对于一个已提交事务的编号，并且是一个全局唯一的编号。 GTID 实际上 是由 UUID+TID 组成的。其中 UUID 是一个 MySQL 实例的唯一标识。TID 代表了该实例上已经提交的事务数量，并且随着事务提交单调递增。


> **什么是GTID Replication**
>
> 从 MySQL 5.6.5 开始新增了一种基于 GTID 的复制方式。通过 GTID 保证了每个在主库上提交的事务在集群中有一个唯一的ID。这种方式强化了数据库的主备一致性，故障恢复以及容错能力。
>
> 在原来基于二进制日志的复制中，从库需要告知主库要从哪个偏移量进行增量同步，如果指定错误会造成数据的遗漏，从而造成数据的不一致。借助GTID，在发生主备切换的情况下，MySQL的其它从库可以自动在新主库上找到正确的复制位置，这大大简化了复杂复制拓扑下集群的维护，也减少了人为设置复制位置发生误操作的风险。另外，基于GTID的复制可以忽略已经执行过的事务，减少了数据发生不一致的风险。

# 进行主从同步
在查看了阿里云RDS下载的逻辑备份数据sql之后发现其中已经包括了GTID相关的设置:
```sql
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;
...
SET @@GLOBAL.GTID_PURGED='GTID_PURGED的值';
...
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
```
所以进行数据备份和开启主从同步就变得更加简单了,只需要在导入sql之前
```sql
stop slave;
reset master;
```
保证sql中的GTID能够正确设置就可以了~

没有reset会产生的错误如下:
```
ERROR 1840 (HY000) at line 24: @@GLOBAL.GTID_PURGED can only be set when @@GLOBAL.GTID_EXECUTED is empty.
```
如此一来,只需要导入dump.sql然后设置主从同步,整个过程就ok了!
```sql
CHANGE MASTER TO MASTER_HOST='host', MASTER_USER='user', MASTER_PASSWORD='passwd', MASTER_AUTO_POSITION = 1;
```

在过程中还遇到了下面的错误:
```
: Error: 
Table "mysql"."innodb_table_stats"
 not found. InnoDB: Recalculation 
of persistent statistics requested for table "mydatabase"."mytable" 
but the required persistent statistics storage is not present or is corrupted. 
Using transient stats instead.
```
检查之后发现mysql库文件中的**innodb_index_stats**,**innodb_table_stats**,**slave_master_info**,**slave_relay_log_info**,**slave_worker_info**全部都损坏了,解决方法是删除这5张表然后进行重建,建表sql如下:
```sql
CREATE TABLE `innodb_index_stats` (
  `database_name` varchar(64) COLLATE utf8_bin NOT NULL,
  `table_name` varchar(64) COLLATE utf8_bin NOT NULL,
  `index_name` varchar(64) COLLATE utf8_bin NOT NULL,
  `last_update` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `stat_name` varchar(64) COLLATE utf8_bin NOT NULL,
  `stat_value` bigint(20) unsigned NOT NULL,
  `sample_size` bigint(20) unsigned DEFAULT NULL,
  `stat_description` varchar(1024) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`database_name`,`table_name`,`index_name`,`stat_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin STATS_PERSISTENT=0;

CREATE TABLE `innodb_table_stats` (
  `database_name` varchar(64) COLLATE utf8_bin NOT NULL,
  `table_name` varchar(64) COLLATE utf8_bin NOT NULL,
  `last_update` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `n_rows` bigint(20) unsigned NOT NULL,
  `clustered_index_size` bigint(20) unsigned NOT NULL,
  `sum_of_other_index_sizes` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`database_name`,`table_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin STATS_PERSISTENT=0;

CREATE TABLE `slave_master_info` (
  `Number_of_lines` int(10) unsigned NOT NULL COMMENT 'Number of lines in the file.',
  `Master_log_name` text CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT 'The name of the master binary log currently being read from the master.',
  `Master_log_pos` bigint(20) unsigned NOT NULL COMMENT 'The master log position of the last read event.',
  `Host` char(64) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '' COMMENT 'The host name of the master.',
  `User_name` text CHARACTER SET utf8 COLLATE utf8_bin COMMENT 'The user name used to connect to the master.',
  `User_password` text CHARACTER SET utf8 COLLATE utf8_bin COMMENT 'The password used to connect to the master.',
  `Port` int(10) unsigned NOT NULL COMMENT 'The network port used to connect to the master.',
  `Connect_retry` int(10) unsigned NOT NULL COMMENT 'The period (in seconds) that the slave will wait before trying to reconnect to the master.',
  `Enabled_ssl` tinyint(1) NOT NULL COMMENT 'Indicates whether the server supports SSL connections.',
  `Ssl_ca` text CHARACTER SET utf8 COLLATE utf8_bin COMMENT 'The file used for the Certificate Authority (CA) certificate.',
  `Ssl_capath` text CHARACTER SET utf8 COLLATE utf8_bin COMMENT 'The path to the Certificate Authority (CA) certificates.',
  `Ssl_cert` text CHARACTER SET utf8 COLLATE utf8_bin COMMENT 'The name of the SSL certificate file.',
  `Ssl_cipher` text CHARACTER SET utf8 COLLATE utf8_bin COMMENT 'The name of the cipher in use for the SSL connection.',
  `Ssl_key` text CHARACTER SET utf8 COLLATE utf8_bin COMMENT 'The name of the SSL key file.',
  `Ssl_verify_server_cert` tinyint(1) NOT NULL COMMENT 'Whether to verify the server certificate.',
  `Heartbeat` float NOT NULL,
  `Bind` text CHARACTER SET utf8 COLLATE utf8_bin COMMENT 'Displays which interface is employed when connecting to the MySQL server',
  `Ignored_server_ids` text CHARACTER SET utf8 COLLATE utf8_bin COMMENT 'The number of server IDs to be ignored, followed by the actual server IDs',
  `Uuid` text CHARACTER SET utf8 COLLATE utf8_bin COMMENT 'The master server uuid.',
  `Retry_count` bigint(20) unsigned NOT NULL COMMENT 'Number of reconnect attempts, to the master, before giving up.',
  `Ssl_crl` text CHARACTER SET utf8 COLLATE utf8_bin COMMENT 'The file used for the Certificate Revocation List (CRL)',
  `Ssl_crlpath` text CHARACTER SET utf8 COLLATE utf8_bin COMMENT 'The path used for Certificate Revocation List (CRL) files',
  `Enabled_auto_position` tinyint(1) NOT NULL COMMENT 'Indicates whether GTIDs will be used to retrieve events from the master.',
  PRIMARY KEY (`Host`,`Port`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 STATS_PERSISTENT=0 COMMENT='Master Information';

CREATE TABLE `slave_relay_log_info` (
  `Number_of_lines` int(10) unsigned NOT NULL COMMENT 'Number of lines in the file or rows in the table. Used to version table definitions.',
  `Relay_log_name` text CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT 'The name of the current relay log file.',
  `Relay_log_pos` bigint(20) unsigned NOT NULL COMMENT 'The relay log position of the last executed event.',
  `Master_log_name` text CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT 'The name of the master binary log file from which the events in the relay log file were read.',
  `Master_log_pos` bigint(20) unsigned NOT NULL COMMENT 'The master log position of the last executed event.',
  `Sql_delay` int(11) NOT NULL COMMENT 'The number of seconds that the slave must lag behind the master.',
  `Number_of_workers` int(10) unsigned NOT NULL,
  `Id` int(10) unsigned NOT NULL COMMENT 'Internal Id that uniquely identifies this record.',
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 STATS_PERSISTENT=0 COMMENT='Relay Log Information';

CREATE TABLE `slave_worker_info` (
  `Id` int(10) unsigned NOT NULL,
  `Relay_log_name` text CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `Relay_log_pos` bigint(20) unsigned NOT NULL,
  `Master_log_name` text CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `Master_log_pos` bigint(20) unsigned NOT NULL,
  `Checkpoint_relay_log_name` text CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `Checkpoint_relay_log_pos` bigint(20) unsigned NOT NULL,
  `Checkpoint_master_log_name` text CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `Checkpoint_master_log_pos` bigint(20) unsigned NOT NULL,
  `Checkpoint_seqno` int(10) unsigned NOT NULL,
  `Checkpoint_group_size` int(10) unsigned NOT NULL,
  `Checkpoint_group_bitmap` blob NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 STATS_PERSISTENT=0 COMMENT='Worker Information';
```
之后主从同步恢复正常~

# 参考链接
[MySQL 5.7 基于 GTID 的主从复制实践](https://www.hi-linux.com/posts/47176.html#%E6%B5%8B%E8%AF%95gtid%E4%B8%BB%E4%BB%8E%E5%A4%8D%E5%88%B6)

[StackOverflow:mysql error: Table “mysql”.“innodb_table_stats” not found](https://stackoverflow.com/questions/15767652/mysql-error-table-mysql-innodb-table-stats-not-found)

[RDS for MySQL 逻辑备份文件恢复到自建数据库](https://help.aliyun.com/knowledge_detail/97438.html)