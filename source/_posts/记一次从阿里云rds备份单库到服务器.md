---
title: 记一次从阿里云rds备份单库到服务器
categories: [笔记]
tags: [Mysql,阿里云]
mathjax: false
date: 2019-02-16 15:57:42
---

# 问题产生
在线上主从同步的slave数据库中产生了如下的错误：
```
ERROR 1787 (HY000): When @@GLOBAL.ENFORCE_GTID_CONSISTENCY = 1, the statements CREATE TEMPORARY TABLE and 
DROP TEMPORARY TABLE can be executed in a non-transactional context only, and require that AUTOCOMMIT = 1.
```
使用`show slave status`可以查看从库当前的同步状态,发现I/O状态已经变为NO,尝试使用:
```sql
set global sql_slave_skip_counter = 1;
```
之后产生如下的问题:
```
ERROR 1858 (HY000): sql_slave_skip_counter can not be set when the server is running with @@GLOBAL.GTID_MODE = ON. Instead, for each transaction that you want to skip, generate an empty transaction with the same GTID as the transaction
```
根据错误说明使用一个空事务来跳过异常,代码如下:
```sql
STOP SLAVE;
SET GTID_NEXT=# binlog中事务的下一个位置;
BEGIN; COMMIT; # 产生一个空事务并提交
SET GTID_NEXT="AUTOMATIC";
START SLAVE;
```
然而这样会导致主从的数据可能产生不一致的情况,这是我们想要避免的,并且希望主库可以不锁表导出数据即可进行备份.
<!-- more -->
# Xtrabackup
查看阿里云的官方文档:[RDS for MySQL 物理备份文件恢复到自建数据库](https://help.aliyun.com/knowledge_detail/41817.html)发现可以使用[Xtrabackup](https://www.percona.com/doc/percona-xtrabackup/2.4/installation.html?spm=a2c4g.11186623.2.12.3f4d237434ZMpZ)来进行恢复.
> 操作系统中已安装数据恢复工具Percona XtraBackup。MySQL 5.6及之前的版本需要安装 Percona XtraBackup 2.3。MySQL 5.7版本需要安装 Percona XtraBackup 2.4。可以从Percona XtraBackup官网下载安装，安装指导请参见官方文档 Percona XtraBackup 2.3、Percona XtraBackup 2.4。

# Xtrabackup的单表恢复
但是上面的官方文档中仍旧有一个问题,在文档中写到:
> 说明 由于软件限制，目前只支持将云数据库MySQL的备份文件恢复到安装在Linux系统中的自建MySQL数据库中。

而在恢复数据的时候,我们想要只对**业务用到的数据库进行恢复,mysql的配置信息库不希望恢复到从库中去**(由于主从用户信息等都不相同).也就是说从备份的源上无法进行库的指定(Xtrabackup支持表的指定但是阿里云RDS没有这个选项).

在查看了Xtrabackup网站上的教程之后,发现Xtrabackup可以单独对一张表进行恢复,即在阿里云文档的:
```shell
## 解包
cat <数据备份文件名>_qp.xb | xbstream -x -v -C /home/mysql/data
## 解压
innobackupex --decompress --remove-original /home/mysql/data
```
操作也就是解压了需要同步的数据之后:
## 创建新表
使用sql语句创建对应需要恢复的表(没有数据库就先创建数据库):
```sql
-- 官方例子中用到的表
mysql> CREATE TABLE `name_p4` (
`id` int(11) NOT NULL AUTO_INCREMENT,
`name` text NOT NULL,
`imdb_index` varchar(12) DEFAULT NULL,
`imdb_id` int(11) DEFAULT NULL,
`name_pcode_cf` varchar(5) DEFAULT NULL,
`name_pcode_nf` varchar(5) DEFAULT NULL,
`surname_pcode` varchar(5) DEFAULT NULL,
PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2812744 DEFAULT CHARSET=utf8
```
## 删除表空间
```sql
mysql>  ALTER TABLE name_p4 DISCARD TABLESPACE;
```
## 拷贝数据
```shell
# 将对应的数据库的对应的表(备份数据目录下)拷贝到mysql文件夹下同数据库的同表目录下
$ cp /mnt/backup/2012-08-28_10-29-09/imdb/name#P#p4.exp /var/lib/mysql/imdb/name_p4.exp
$ cp /mnt/backup/2012-08-28_10-29-09/imdb/name#P#p4.ibd /var/lib/mysql/imdb/name_p4.ibd
```
## 导入表空间
```sql
mysql>  ALTER TABLE name_p4 IMPORT TABLESPACE;
```

# 导入指定的库
知道了上面的对单表导入的原理,那么对指定的库的数据导入过程其实就是重复导入表的过程直至全部的表都恢复到库中为止.
## mysqlfrm介绍
> mysqlfrm 是一个恢复性质的工具，用来读取.frm文件并从该文件中找到表定义数据生成CREATE语句。在大多数情况下，生成的CREATE语句用于在另一个服务器上创建表或进行诊断等。

我们使用mysqlfrm来生成数据表创建语句.
## 恢复单库的脚本
```shell
#!/bin/bash
# 注意:只能用在InnoDB表引擎的数据库上
# Usage: inno_restore_database.sh <db_name_to_restore_to> <db_backup_directory> 末尾不需要 /

# mysql数据库磁盘位置
datadir=/var/lib/mysql
myport=3306
# 随意指定
mysqlfrmport=3310
#username=dbrestoredude
#password=dbrestoredudespasswd

#######################################################################################
# Gotta be root.
if [ $UID -ne 0 ]; then echo "Run this as root" ; exit ; fi

database=$1
restoredir=$2

# mysqlfrm检查
which mysqlfrm > /dev/null 2>&1
if [ $? -ne 0 ] ; then echo "Could not find the mysqlfrm utility. Install mysql-utilities."; exit ; fi
# mysql目录检查
if [ ! -f $datadir/mysql/user.frm ] ; then echo "MySQL datadir not correct" ; exit ; fi
# Check the restore directory, looking for a cfg/exp/idb for each frm.
if [ ! -f $restoredir/db.opt ] ; then echo "Restore directory invalid, couldn't find db.opt in it"; exit ; fi
stoperror=0
for restorename in $restoredir/*.frm
do
    chkname=$(echo $restorename|sed s/.frm$//)
    for exten in cfg exp ibd
    do
        if [ ! -f $chkname.$exten ] ; then stoperror=1 ; fi
    done
done
if [ $stoperror -eq 1 ] ; then
    echo "Could not file valid restore directory files (need a cfg, exp and ibd for each frm)"
    echo "Did you specify a valid database directory within a backup?"
    echo "Did you prepare or apply-log to the backup directory?"
    exit
fi

# Get username and password if the fields are blank.
if [ -z $username ] ; then read -p "Username: " username ; fi
if [ -z $password ] ; then read -s -p "Password: " password ; echo ; fi
# Check mysql permissions for the given user.
stoperror=0
grants=$(mysql -B -u $username -p$password mysql -e "show grants for current_user"|grep 'ON *.* TO')
if [ $? -ne 0 ] ; then exit ; fi
if [[ $grants == *"ALL PRIVILEGES"* ]] ; then stoperror=1 ; fi
if [[ $grants == *CREATE* ]] && [[ $grants == *DROP* ]] && [[ $grants == *ALTER* ]] ; then stoperror=1 ; fi
if [ $stoperror != 1 ] ; then echo "User $username does not have global CREATE, DROP and ALTER" ; exit ; fi

################################################################################
# 删除存在的数据库
mysql -B -u $username -p$password -e "DROP DATABASE IF EXISTS $database"
# 创建数据库
mysql -B -u $username -p$password -e "CREATE DATABASE $database"
# get directory for the original DB name
backupdb=$(find $restoredir -maxdepth 0 -type d -printf "%f\n" |cut -d '/' -f 1)

# 使用mysqlfrm来生产建表语句并且执行 流程:
# mysqlfrm生成语句-管道->mysql
# | sed s/'ENGINE=InnoDB' / 'ENGINE=InnoDB ROW_FORMAT=compact' | 用来指定行格式
echo "Importing create table statements from frm files..." ; echo
mysqlfrm -q --user=root --server=$username:$password@localhost:$myport --port=$mysqlfrmport $restoredir |
    grep -vE "^#|WARNING: Using a password on the command line interface can be insecure." |
    sed s/^$/';'/ | sed s/^'CREATE TABLE `'$backupdb/'CREATE TABLE `'$database/ |
    mysql -B -u $username -p$password
echo "Table structure imported."

# 主要代码,循环执行删除表空间,移动文件,恢复表空间
for frmname in $restoredir/*.frm
do
    tablename=$(find $frmname -printf "%f\n"|sed s/.frm$//)
    # ALTER TABLE ... DISCARD TABLESPACE
    mysql -B -u $username -p$password $database -e "ALTER TABLE $tablename DISCARD TABLESPACE"
    for exten in exp ibd #cfg :: exp ibd cfg 文件取决于数据库版本
    do
        which rsync > /dev/null 2>&1
        if [ $? -eq 0 ]
        then
            rsync --progress $restoredir/$tablename.$exten $datadir/$database/$tablename.$exten
        else
            \cp -v $restoredir/$tablename.$exten $datadir/$database/$tablename.$exten
        fi
        chown $(find $datadir/$database/$tablename.frm -printf "%u.%g") $datadir/$database/$tablename.$exten
    done
    # ALTER TABLE ... IMPORT TABLESPACE
    mysql -B -u $username -p$password $database -e "ALTER TABLE $tablename IMPORT TABLESPACE"
done
echo "All done"
```

# 注意
1. 一开始由于部分表仍旧使用MyISAM引擎导致行格式不一致而使得表空间更改语句不生效,而MyISAM表也不支持compact,所以从库全部使用的InnoDB作为存储引擎.
2. 如果数据库用户配置比较复杂,可以优先尝试mysql相关命令是否生效,不生效则进行调整.

# 启动主从同步
在启动之前,需要设置GTID相关信息(仅限于自己的生产服务器,文档中没有提到):
```sql
slave1> reset master;
slave1 > show global variables like 'GTID_EXECUTED';
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| gtid_executed |       |
+---------------+-------+
slave1 > set global GTID_PURGED="9a511b7b-7059-11e2-9a24-08002762b8af:1-14";
slave1> start slave io_thread;
slave1> show slave status\G
[...]
Slave_IO_Running: Yes
Slave_SQL_Running: Yes
[...]
```

然后使用`CHANGE MASTER`语句来进行主从同步设置.

参见[How to create/restore a slave using GTID replication in MySQL 5.6](https://www.percona.com/blog/2013/02/08/how-to-createrestore-a-slave-using-gtid-replication-in-mysql-5-6/)

# 参考连接
[xtrabackup restore specific database from a full backup(单库的恢复方法)](https://www.percona.com/forums/questions-discussions/percona-xtrabackup/12802-xtrabackup-restore-specific-database-from-a-full-backup)

[MySQL管理工具MySQL Utilities — mysqlfrm](http://www.ttlsa.com/mysql/mysql-utilities-mysqlfrm/)

[Backing Up and Restoring Individual Partitions](https://www.percona.com/doc/percona-xtrabackup/2.3/howtos/recipes_ibkx_partition.html)