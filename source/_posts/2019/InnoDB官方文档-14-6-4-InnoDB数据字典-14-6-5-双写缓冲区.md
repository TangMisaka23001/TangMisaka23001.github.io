---
title: InnoDB官方文档--14.6.4 InnoDB数据字典|14.6.5 双写缓冲区
mathjax: false
date: 2019-03-30 15:23:30
categories: [技术]
tags: [MySQL, InnoDB]
---
#### 14.6.4 InnoDB数据字典(InnoDB Data Dictionary)
InnoDB数据字典由内部系统表构成,包含用于跟踪对象如表,索引和表的列的元数据.元数据实际位于InnoDB系统表空间内.由于历史原因,数据字典元数据在某种程度上与InnoDB表元数据文件(.frm文件)中存储的信息重叠.
<!-- more -->
#### 14.6.5 双写缓冲区(Doublewrite Buffer)
双写缓冲区是位于系统表空间内的一块存储区域,InnoDB在页面被写到数据文件的正确位置之前会写入从InnoDB缓冲池中刷新的页面.只有在将页面刷新并写入双写缓冲区之后,InnoDB才将页面写到正确的位置上.如果在页面写入的过程中发生操作系统,存储子系统或mysqld进程崩溃,InnoDB可以在崩溃恢复之后从双写缓冲区中找到(之前写页面)的一个好的拷贝.

虽然数据总是要写两次,但是双写缓冲区不需要像两次写一样多的I/O负载或I/O操作.数据作为一个大的顺序块写入双写缓冲区,使用操作系统的单个fsync()调用.

在大多数情况下,默认启用双写缓冲区.设置` innodb_doublewrite=0`来禁用双写缓冲区.

如果系统表空间(.ibd文件)位于Fusion-io设备上支持自动写入,双写缓冲区会自动禁用并且Fusion-io自动写会应用于所有的数据文件.因为双写缓冲区设置是全局的,所以对于没有存储在Fusion-io硬件设备上的数据文件也会禁用双写缓冲区.此功能仅在Fusion-io硬件上受支持,仅适用于Linux上的Fusion-io NVMFS.要充分利用此功能,建议设置`innodb_flush_method`为O_DIRECT.
