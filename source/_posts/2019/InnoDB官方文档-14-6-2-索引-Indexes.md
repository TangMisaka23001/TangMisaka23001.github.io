---
title: InnoDB官方文档--14.6.2 索引(Indexes)
mathjax: false
date: 2019-03-10 18:29:07
categories: [技术]
tags: [MySQL, InnoDB]
---
#### 14.6.2 索引(Indexes)
##### 14.6.2.1 聚簇和二级索引(Clustered and Secondary Indexes)
每个InnoDB表都有一个称作聚簇索引的特殊索引,存储了行的数据.通常情况下,聚簇索引是主键的代名词.为了从查询,插入和其他数据库操作中获得最好的性能,你必须了解InnoDB如何使用聚簇索引来优化每个表最常见的查找和DML操作.
- 当你在表上定义了主键,InnoDB用其作为聚簇索引.给你创建的每个表定义一个主键.如果没有逻辑上唯一和非空的列或列的集合,添加一个新的自增列(作为主键),它的值会自动填充.
- 如果你没有为表定义主键,MySQL会找到第一个唯一索引,其中所有的列键都是非空的并且InnoDB会将其作为聚簇索引.
- 如果表没有主键或合适的唯一索引,InnoDB会在包含行ID值的合成列内部生成一个名为`GEN_CLUST_INDEX`的隐藏的聚簇索引.行数据按照InnoDB给这类表分配的ID来排序.行ID是一个6位的字段,随着新行的插入单调递增.因此,行通过ID的排序顺序和物理插入顺序一致.

**聚簇索引如何加速查询(How the Clustered Index Speeds Up Queries)**

通过聚簇索引访问行很快,因为索引搜索直接指向包含所有行数据的页(page).如果表很大,聚簇索引架构与从不同页面索引记录来存储数据的组织方式相比可以节省磁盘的I/O操作.

**二级索引如何关联聚簇索引(How Secondary Indexes Relate to the Clustered Index)**

除了聚簇索引之外的索引都被成为二级索引.在InnoDB中,每个二级索引包含行的主键列和二级索引指定的其他列.InnoDB使用此主键来搜索聚簇索引中的行.

如果主键很长,二级索引会使用更多的空间,所以一个短的主键是有好处的.

##### 14.6.2.2 InnoDB索引的物理架构(The Physical Structure of an InnoDB Index)
除了索引空间之外,InnoDB索引使用B树数据结构.空间索引使用R树,是一种用于索引多维数据的特殊数据结构.索引记录存储在B树或R树数据结构的叶节点页面中.默认的索引页大小是16KB.

当在InnoDB聚簇索引中插入一个新记录时,InnoDB会尝试保留页面的1/16用来将来更新和插入索引记录.如果索引记录按序插入(升序或降序),生成的索引页面大约是15/16.如果记录按随机顺序插入,占页面1/2到15/16大小.

InnoDB在创建或重建B树索引时执行批量加载.这种索引创建方法称为排序索引构建(sorted index build).` innodb_fill_factor`配置选项定义在排序索引构建期间填充每个B树页面的百分比,剩余的空间用于未来的增长需要.空间索引不支持排序索引构建.` innodb_fill_factor`设置为100会为未来增长的数据保留1/16的页面大小.

如果InnoDB索引页的填充因子低于MERGE_THRESHOLD(默认情况下为50%),InnoDB会尝试收缩索引树来释放页面.MERGE_THRESHOLD设置适用于B树索引和R树索引.

你可以通过在初始化MySQL实例之前设置`innodb_page_size`配置选项来定义MySQL实例中所有InnoDB表空间的页面大小.定义实例的页面大小后,如果不重新初始化实例,则无法更改它.支持的大小有64KB,32KB,16KB(默认),8KB和4KB.

MySQL5.7添加了对32KB和64KB的支持.

使用指定InnoDB页面大小的MySQL实例无法使用来自使用不同页面大小的实例的数据文件或日志文件.

##### 14.6.2.3 (构建排序索引)Sorted Index Builds
在创建或重构索引的时候,InnoDB使用批量加载来代替一次插入一个记录的方式.这种创建索引的方式被称为排序索引构建.不支持构建索引空间.

索引构建有3个阶段.第一阶段,扫描聚簇索引并且生成索引条目然后添加到排序缓冲区.当排序缓冲区满的时候条目会被排序然后写到一个临时的中间文件中.此过程也被称为运行(run).第二阶段,一个或多个运行写入到临时中间文件的时候会对文件中的全部条目执行归并排序.第三阶段,排序过的条目被插入到B树中.

在引入排序索引构建之前,使用插入API来将条目一条条插入到B树索引中.这个方法设计打开B树游标用来查找插入位置,然后使用乐观插入将条目插入到B树页面中.如果由于页面已满导致插入失败,将会执行一个悲观插入,这会涉及打开B树游标并根据需要拆分和合并B树节点以找到该条目的空间.这种构建索引的"自上而下"方法的缺点是搜索插入位置的成本以及B树节点的常量拆分和合并.

排序索引构建使用自下而上方式来构建索引.使用这种方法,对最右侧叶节点的页面引用保留在B树的每一级上.分配必要B树深度的最右侧叶页,并根据其排序顺序插入条目.一旦叶节点的页面满了,节点指针将附加到父页面,并为下一个插入分配一个兄弟叶页面.此过程将继续到插入所有条目,可能导致插入到根节点级别.分配兄弟节点页面时,将释放对先前固定的叶子节点页面的引用,并且新分配的叶子节点页面将成为最右侧的叶子节点页面和新的默认插入位置.

**为未来的索引增长保留B树页面空间**

使用` innodb_fill_factor`配置B树保留页面空间的百分比来给未来增长的索引预留空间.例如,设置`innodb_fill_factor`为80可以在排序索引构建的时候保留B树页面空间的20%.此设置适用于B树叶节点和非叶节点页面.但不适用于TEXT和BLOB条目的外部页面.保留的空间总量可能和配置的不完全相同,因为` innodb_fill_factor`被解释为示意而不是强制限制.

**排序索引构建和全文索引支持**

全文索引支持排序索引构建.

**排序索引构建和压缩表**

对于压缩表,之前的索引创建方法是向压缩和未压缩的页面同时添加条目.当修改日志(表示压缩页面上的可用空间)变满时,压缩页面会被重新压缩.如果压缩因为空间不足失败,页面会被拆分.对于已排序的索引构建,条目只会添加到未压缩的页面上.当一个未压缩的页面变满时会被压缩.自适应填充用于确保在大多数情况下压缩成功,但如果压缩失败,则会拆分页面并再次尝试压缩.此过程将继续到压缩成功.

**排序索引构建和redo日志**

redo日志在排序索引构建期间是禁用的.相对的,有一个检查点来确保索引构建能够承受崩溃或故障.检查点强制将所有脏页写入磁盘.在排序索引构建期间,会定期发信号通知页面清理线程刷新脏页确保可以快速处理检查点操作.通常,当干净页面的数量低于设定的阈值时,页面清理线程会刷新脏页面.对于排序索引构建,会立即刷新脏页以减少检查点开销并且并行化I/O和CPU活动.

**排序索引构建和统计优化(Optimizer Statistics)**

排序索引构建可能导致统计优化与以前的索引创建方法生成的统计信息不同.统计数据的差异(不会影响工作负载性能)是由于用于填充索引的算法不同.

##### 14.6.2.4 (InnoDB全文索引)InnoDB FULLTEXT Indexes
在基于文本的列上(CHAR,VARCHAR,或TEXT列)创建全文索引(FULLTEXT index)可以加速包含这些列的查询和DML操作,省略任何被定义为停用词的单词.

全文索引可以定义为`CREATE TABLE`语句的一部分或使用`ALTER TABLE`或`CREATE INDEX`添加到已存在的表中.

全文索引使用`MATCH() ... AGAINST`语法来执行.

**InnoDB全文索引设计(InnoDB Full-Text Index Design)**

InnoDB全文索引具有反向索引设计.反向索引存储单词列表,并且为每个单词存储出现该单词的文档列表.为了支持邻近搜索还存储了每个单词的位置信息作为字偏移.

**InnoDB全文索引表(InnoDB Full-Text Index Tables)**

当创建全文索引的时候,一系列的索引表会被创建,如下:
```sql
mysql> CREATE TABLE opening_lines (
       id INT UNSIGNED AUTO_INCREMENT NOT NULL PRIMARY KEY,
       opening_line TEXT(500),
       author VARCHAR(200),
       title VARCHAR(200),
       FULLTEXT idx (opening_line)
       ) ENGINE=InnoDB;

mysql> SELECT table_id, name, space from INFORMATION_SCHEMA.INNODB_SYS_TABLES
       WHERE name LIKE 'test/%';
+----------+----------------------------------------------------+-------+
| table_id | name                                               | space |
+----------+----------------------------------------------------+-------+
|      333 | test/FTS_0000000000000147_00000000000001c9_INDEX_1 |   289 |
|      334 | test/FTS_0000000000000147_00000000000001c9_INDEX_2 |   290 |
|      335 | test/FTS_0000000000000147_00000000000001c9_INDEX_3 |   291 |
|      336 | test/FTS_0000000000000147_00000000000001c9_INDEX_4 |   292 |
|      337 | test/FTS_0000000000000147_00000000000001c9_INDEX_5 |   293 |
|      338 | test/FTS_0000000000000147_00000000000001c9_INDEX_6 |   294 |
|      330 | test/FTS_0000000000000147_BEING_DELETED            |   286 |
|      331 | test/FTS_0000000000000147_BEING_DELETED_CACHE      |   287 |
|      332 | test/FTS_0000000000000147_CONFIG                   |   288 |
|      328 | test/FTS_0000000000000147_DELETED                  |   284 |
|      329 | test/FTS_0000000000000147_DELETED_CACHE            |   285 |
|      327 | test/opening_lines                                 |   283 |
+----------+----------------------------------------------------+-------+
```
前面的6个表表示反向索引并被成为辅助索引表.当传入的文档被标记时,相应的单词(也称为标记(tokens))与其对应的位置信息和关联的文档ID(DOC_ID)一起被插入索引表中.根据单词的第一个字符的字符集的排序权重对6个索引表中的单词进行完全排序和分区.

反向索引被划分为六个辅助索引表以支持并行索引创建.默认情况下,两个线程对单词和关联数据进行标记,排序和插入索引表.线程的数量使用` innodb_ft_sort_pll_degree`来配置.在大表上创建全文索引的时候考虑增加线程的数量.

辅助索引表名称以FTS_为前缀，后缀为INDEX_ \*.每个索引表都通过索引表名称中与索引表的table_id匹配的十六进制值与索引表相关联.例如,test/opening_lines表的table_id是327,其十六进制值是0x147.如前面所示,"147"十六进制值出现在与test/opening_lines表关联的索引表名中.

表示全文索引的index_id的十六进制值也出现在辅助索引表名称中.例如,在辅助表名test/FTS_0000000000000147_00000000000001c9_INDEX_1中,16进制的1c9就是10进制的457.opening_lines表上的索引定义可以使用` INFORMATION_SCHEMA.INNODB_SYS_INDEXES`表上查询457来识别索引.
```sql
mysql> SELECT index_id, name, table_id, space from INFORMATION_SCHEMA.INNODB_SYS_INDEXES
       WHERE index_id=457;
+----------+------+----------+-------+
| index_id | name | table_id | space |
+----------+------+----------+-------+
|      457 | idx  |      327 |   283 |
+----------+------+----------+-------+
```
如果主表是在每个表的文件表空间中创建的,则索引表存储在它们自己的表空间中.

上例中显示的其他索引表称为公共索引表，用于删除处理和存储全文索引的内部状态.与为每个全文索引创建的反向索引表不同,这组表对于在特定表上创建的所有全文索引是通用的.

即使删除了全文索引,也会保留公共辅助表.删除全文索引时,将保留为索引创建的FTS_DOC_ID列,因为删除FTS_DOC_ID列将需要重建表.管理FTS_DOC_ID列需要下面的表:
-  FTS\_\*\_DELETED和FTS\_\*\_DELETED_CACHE

  包含已删除但尚未从全文索引中删除其数据的文档的文档ID(DOC_ID).FTS\_\*\_DELETED\_CACHE是 FTS\_\*\_DELETED在内存中的版本.
-  FTS\_\*\_BEING\_DELETED 和 FTS\_\*\_BEING_DELETED\_CACHE

  包含已删除文档的文档ID(DOC_ID),其数据当前正在从全文索引中删除.FTS\_\*\_BEING_DELETED\_CACHE是 FTS\_\*\_BEING\_DELETED的内存版本.
- FTS\_\*\_CONFIG

  存储和全文索引内部状态相关的信息.最重要的是其存储了`FTS_SYNCED_DOC_ID`,它标识已解析并刷新到磁盘的文档.在崩溃恢复的情况下,` FTS_SYNCED_DOC_ID`的值于标识尚未刷新到磁盘的文档,以便可以重新解析文档并将其添加回全文索引缓存.

**InnoDB全文索引缓存(InnoDB Full-Text Index Cache)**

当一篇文档被插入的时候会被识别,相关的单词和关联的数据会被插入到全文索引中.即使对于小型文档,此过程也可能导致在辅助索引表中进行大量小插入,从而使对这些表的并发访问成为争用的焦点.为避免此问题,InnoDB使用全文索引缓存临时缓存对最近插入的行进行的索引表插入.此内存缓存结构保留插入,直到缓存已满,然后批量将它们刷新到磁盘.你可以查询` INFORMATION_SCHEMA.INNODB_FT_INDEX_CACHE`表查看最近插入的行的标记数据.

缓存和批处理刷新避免了对辅助索引表的频繁更新而导致的繁忙的插入和更新时间内的并发访问问题.批处理技术还避免了对同一个单词的多次插入,并最大限度地减少了重复条目.不是单独刷新每个单词,而是将同一个单词的插入合并并作为单个条目刷新到磁盘,从而提高插入效率,同时保持辅助索引表尽可能小.

`innodb_ft_cache_size`用于配置全文索引缓存大小(基于每个表),这会影响全文索引缓存的刷新频率.你还可以使用`innodb_ft_total_cache_size`配置来定义全局的全文索引缓存的大小限制.

全文索引缓存存储与辅助索引表相同的信息.但是,全文索引缓存仅缓存最近插入的行的标记后的数据.已经刷到磁盘的数据在查询时不会返回到全文索引缓存中.对辅助索引表中的数据的查询会直接进行,并在返回之前将辅助索引表的结果与全文索引缓存的结果合并.

**InnoDB全文索引文档ID和FTS\_DOC\_ID列**

InnoDB使用唯一的文档标识符作为文档ID(DOC\_ID)来映射全文索引到文档中出现的单词记录.映射需要索引表中的`FTS_DOC_ID`列.如果FTS_DOC_ID 列没有被定义的话InnoDB会在全文索引被创建的时候添加一个隐藏的FTS_DOC_ID 列.下面的例子展示了这种行为:

下面是没有包括 FTS_DOC_ID 列的表定义:
```sql
mysql> CREATE TABLE opening_lines (
       id INT UNSIGNED AUTO_INCREMENT NOT NULL PRIMARY KEY,
       opening_line TEXT(500),
       author VARCHAR(200),
       title VARCHAR(200)
       ) ENGINE=InnoDB;
```
当你使用`CREATE FULLTEXT INDEX `语句来创建全文索引的时候会返回一个警告,报告InnoDB正在重建FTS_DOC_ID 列.
```sql
mysql> CREATE FULLTEXT INDEX idx ON opening_lines(opening_line);
Query OK, 0 rows affected, 1 warning (0.19 sec)
Records: 0  Duplicates: 0  Warnings: 1

mysql> SHOW WARNINGS;
+---------+------+--------------------------------------------------+
| Level   | Code | Message                                          |
+---------+------+--------------------------------------------------+
| Warning |  124 | InnoDB rebuilding table to add column FTS_DOC_ID |
+---------+------+--------------------------------------------------+
```
使用` ALTER TABLE`向没有 FTS_DOC_ID 列的表添加全文索引的时候也会返回相同的警告.如果你在`CREATE TABLE`中创建全文索引时没有指定FTS_DOC_ID 列的话,InnoDB会增加一个隐藏的FTS_DOC_ID 列而不产生警告.

在` CREATE TABLE`时指定FTS_DOC_ID 列比在已经加载了数据的表上创建全文索引代价要小.如果在加载数据之前在表上定义FTS_DOC_ID列的话,表和索引就不需要重建来添加新列.如果你不关心`CREATE FULLTEXT INDEX`性能,忽略FTS_DOC_ID列让InnoDB创建它.InnoDB在FTS\_DOC\_ID列上创建隐藏的FTS\_DOC\_ID列以及唯一索引(FTS_DOC_ID_INDEX).如果要创建自己的FTS\_DOC\_ID列,则必须将该列定义为`BIGINT UNSIGNED NOT NULL`并命名为FTS\_DOC\_ID(全部大写),如下例所示:
```sql
mysql> CREATE TABLE opening_lines (
       FTS_DOC_ID BIGINT UNSIGNED AUTO_INCREMENT NOT NULL PRIMARY KEY,
       opening_line TEXT(500),
       author VARCHAR(200),
       title VARCHAR(200)
       ) ENGINE=InnoDB;
```
如果你选择自己定义FTS_DOC_ID列,管理列以避免出现空值或重复值.无法重用FTS_DOC_ID值,这意味着FTS_DOC_ID值必须不断增加.

(可选)你可以在FTS_DOC_ID列上创建所需的唯一FTS_DOC_ID_INDEX(全部大写).
```sql
mysql> CREATE UNIQUE INDEX FTS_DOC_ID_INDEX on opening_lines(FTS_DOC_ID);
```
 如果你不创建FTS_DOC_ID_INDEX,InnoDB会自动创建它.
 
 在MySQL 5.7.13之前,最大使用的FTS_DOC_ID值与新的FTS_DOC_ID值之间的允许间隔为10000.在MySQL 5.7.13及更高版本中,允许的间隙为65535.
 
 为避免重建表,删除全文索引时将保留FTS_DOC_ID列.
 
 **InnoDB全文索引删除处理(InnoDB Full-Text Index Deletion Handling)**
 
 删除具有全文索引列的记录可能会导致辅助索引表中出现大量小删除,使这些表的并发访问成为性能瓶颈.为避免此问题,每当从索引表中删除记录时,已删除文档的文档ID(DOC_ID)将记录在特殊的FTS_\*\_DELETED表中,并且索引记录保留在全文索引中.在返回查询结果之前,FTS _ * _ DELETED表中的信息用于过滤掉已删除的文档ID.这种设计的好处是删除快速且廉价.缺点是删除记录后索引的大小不会立即减少.要删除已删除记录的全文索引条目,请使用`innodb_optimize_fulltext_only = ON`在索引表上运行`OPTIMIZE TABLE`以重建全文索引.
 
 **InnoDB全文索引事务处理(InnoDB全文索引事务处理)**
 
 由于其缓存和批处理行为,InnoDB 全文索引具有特殊的事务处理特性. 具体来说,全文索引的更新和插入在事务提交时处理,这意味着全文搜索只能看到提交的数据.以下示例演示了此行为.全文搜索仅在提交插入的行后返回结果.
 ```sql
 mysql> CREATE TABLE opening_lines (
       id INT UNSIGNED AUTO_INCREMENT NOT NULL PRIMARY KEY,
       opening_line TEXT(500),
       author VARCHAR(200),
       title VARCHAR(200),
       FULLTEXT idx (opening_line)
       ) ENGINE=InnoDB;

mysql> BEGIN;

mysql> INSERT INTO opening_lines(opening_line,author,title) VALUES
       ('Call me Ishmael.','Herman Melville','Moby-Dick'),
       ('A screaming comes across the sky.','Thomas Pynchon','Gravity\'s Rainbow'),
       ('I am an invisible man.','Ralph Ellison','Invisible Man'),
       ('Where now? Who now? When now?','Samuel Beckett','The Unnamable'),
       ('It was love at first sight.','Joseph Heller','Catch-22'),
       ('All this happened, more or less.','Kurt Vonnegut','Slaughterhouse-Five'),
       ('Mrs. Dalloway said she would buy the flowers herself.','Virginia Woolf','Mrs. Dalloway'),
       ('It was a pleasure to burn.','Ray Bradbury','Fahrenheit 451');

mysql> SELECT COUNT(*) FROM opening_lines WHERE MATCH(opening_line) AGAINST('Ishmael');
+----------+
| COUNT(*) |
+----------+
|        0 |
+----------+

mysql> COMMIT;

mysql> SELECT COUNT(*) FROM opening_lines WHERE MATCH(opening_line) AGAINST('Ishmael');
+----------+
| COUNT(*) |
+----------+
|        1 |
+----------+
```

**InnoDB全文索引监控**

您可以通过查询以下INFORMATION_SCHEMA表来监视和检查InnoDB 全文索引
- INNODB_FT_CONFIG
- INNODB_FT_INDEX_TABLE
- INNODB_FT_INDEX_CACHE
- INNODB_FT_DEFAULT_STOPWORD
- INNODB_FT_DELETED
- INNODB_FT_BEING_DELETED

你还可以通过查询INNODB_SYS_INDEXES和INNODB_SYS_TABLES查看全文索引和表的基本信息.
