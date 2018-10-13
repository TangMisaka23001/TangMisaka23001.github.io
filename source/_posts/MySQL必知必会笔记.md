---
title: MySQL必知必会笔记
mathjax: false
date: 2018-09-18 21:25:09
categories: [笔记]
tags: [Mysql]
---
[](#主键 "主键")主键
==============

*   总是应该定义主键
*   主键要求:
    1.  不更新主键的值
    2.  不重用主键的值
    3.  不在主键中使用可能会更改的值

[](#连接 "连接")连接
==============

*   连接数据库: `mysql -u{username} -p{password}`
*   选择表: `USE tables;`
*   查看表/数据库: `SHOW tables/databases;`
*   查看列: `SHOW COLUMNS FROM tables;`

[](#检索数据 "检索数据")检索数据
====================

*   单列: `SELECT col FROM tables;`
*   多列: `SELECT col1, col2 FROM tables;`
*   所有列: `SELECT * FROM tables;`
*   检索不同的行: `SELECT DISTINCT col FROM tables;`
*   限制结果: `SELECT col FROM tables LIMIT 1,1`

注意:

1.  检索出来的数据都是未排序的,并且原始数据没有格式
2.  一般不要使用*通配符,指出需要检索的列提高性能
3.  通配符用处:检索未知列
4.  不能部分使用DISTINCT
5.  LIMIT第一个参数为开始位置,第二个为检索的行数,开始位置从0开始

[](#排序检索数据 "排序检索数据")排序检索数据
==========================

*   单列排序: `SELECT col FROM table ORDER BY col`
*   多列排序: `SELECT col1,col2 FROM table ORDER BY col1,col2`
*   指定排序方向: `SELECT col FROM table ORDER BY col DESC`
*   多列指定方向: `SELECT col1, col2 FROM table ORDER BY col1 DESC, col2`

注意:

1.  如果不明确排序顺序,不应假定检索出来的数据有顺序
2.  多列时排序关键字有主次顺序之分
3.  MySQL默认为升序排序
4.  如果想要对多个列降序排序,需要对每个列指定DESC关键字
5.  位置: FROM ORDER BY LIMIT

[](#过滤数据 "过滤数据")过滤数据
====================

*   检查单个值: `SELECT col FROM table WHERE col = ?`
*   检查不匹配: `SELECT col FROM table WHERE col <> ?`
*   检查范围值: `SELECT col FROM table WHERE col < ?`
*   空值检查: `SELECT col FROM table WHERE col IS NULL`
*   组合WHERE子句:
    1.  AND操作符: `SELECT col FROM table WHERE col1 = ? AND col2 = ?`
    2.  OR操作符: `SELECT col FROM table WHERE col1 = ? OR col2 = ?`
    3.  IN操作符: `SELECT col FROM table WHERE col IN (val1, val2)`
    4.  NOT操作符: `SELECT col FROM table WHERE col NOT IN (val1, val2)`

[![](https://i.loli.net/2018/09/13/5b99c5336019b.png)](https://i.loli.net/2018/09/13/5b99c5336019b.png)

注意:

1.  数据检索和过滤应在数据库中完成,以提高应用的性能和减少带宽消耗
2.  AND和OR计算次序:AND会被优先计算,优先级需要使用圆括号来提升
3.  IN的功能和OR相当,但是IN的执行更快且可以包含其他SELECT语句建立子句

[](#用通配符过滤数据 "用通配符过滤数据")用通配符过滤数据
================================

*   百分号(%)通配符: `SELECT col FROM table WHERE col LIKE 'xx%'`
*   下划线(_)通配符: `SELECT col FROM table WHERE col LIKE '_ xx'`

注意:

1.  尾空格会干扰通配符匹配
2.  %不能匹配NULL的值
3.  下划线只匹配单个字符
4.  不要过度使用通配符

[](#使用正则表达式过滤 "使用正则表达式过滤")使用正则表达式过滤
===================================

*   `SELECT col FROM table WHERE col REGEXP 'reg'`
*   匹配字符类
*   定位符

[![](https://i.loli.net/2018/09/14/5b9b199943397.png)](https://i.loli.net/2018/09/14/5b9b199943397.png)  
[![](https://i.loli.net/2018/09/14/5b9b19c08323b.png)](https://i.loli.net/2018/09/14/5b9b19c08323b.png)

注意:

1.  MySQL只支持正则的一个很小的子集
2.  区分大小写需要在REGEXP后加BINARY关键字

[](#计算字段 "计算字段")计算字段
====================

*   拼接字段: `SELECT Concat(col1, 'str', col2, 'str2') FROM table`
*   使用别名: `SELECT col AS name FROM table`
*   执行算术计算: `SELECT col*col2 AS name FROM table`

注意:

1.  计算字段用于格式化检索出的数据
2.  LTrim()和RTrim()函数可以去除字段左右两边空格

[](#数据处理函数 "数据处理函数")数据处理函数
==========================

[](#常用文本处理函数 "常用文本处理函数:")常用文本处理函数:
----------------------------------

[![](https://i.loli.net/2018/09/14/5b9b22b3c6f95.png)](https://i.loli.net/2018/09/14/5b9b22b3c6f95.png)  
[![](https://i.loli.net/2018/09/14/5b9b22d98dcc9.png)](https://i.loli.net/2018/09/14/5b9b22d98dcc9.png)

[](#常用日期处理函数 "常用日期处理函数:")常用日期处理函数:
----------------------------------

[![](https://i.loli.net/2018/09/14/5b9b232127827.png)](https://i.loli.net/2018/09/14/5b9b232127827.png)

*   检索时间: `SELECT col FROM table WHERE Date(col2) = 'xxxx-xx-xx'`
*   检索时间段: `SELECT col FROM table WHERE Date(col) BETWEEN 'xxxx-xx-xx' AND 'xxxx-xx-xx'`

注意:

1.  总是应该使用4位数的年份

[](#数值处理函数 "数值处理函数:")数值处理函数:
----------------------------

[![](https://i.loli.net/2018/09/14/5b9b2412bd014.png)](https://i.loli.net/2018/09/14/5b9b2412bd014.png)

[](#汇总数据 "汇总数据")汇总数据
====================

[](#聚集函数 "聚集函数")聚集函数
--------------------

[![](https://i.loli.net/2018/09/14/5b9b244e99eb3.png)](https://i.loli.net/2018/09/14/5b9b244e99eb3.png)

注意:

1.  使用COUNT(*)计数包括NULL值,COUNT(col)则不包含NULL值

[](#分组数据 "分组数据")分组数据
====================

*   创建分组: `SELECT col FROM table GROUP BY col`
*   HAVING过滤分组: `SELECT col, COUNT(*) FROM table GROUP BY col HAVING COUNT(*) > 2`

[![](https://i.loli.net/2018/09/14/5b9b2b8d79cac.png)](https://i.loli.net/2018/09/14/5b9b2b8d79cac.png)

注意:

1.  GROUP BY子句可以包含任意数目的列
2.  建立分组时,指定的所有列都一起计算
3.  GROUP BY子句中列出的每个列都必须是检索列或有效表达式
4.  除计算语句外, SELECT的每个列都需要在GROUP BY中给出
5.  如果分组中有NULL值,将NULL作为一个分组返回
6.  GROUP BY子句必须出现在WHERE之后,ORDER BY之前
7.  WHERE在分组之前过滤,HAVING在分组之后过滤
8.  GROUP BY之后应该

[](#使用子查询 "使用子查询")使用子查询
=======================

*   利用子查询进行过滤: `SELECT col FROM table1 WHERE col IN (SELECT col2 FROM table2 WHERE col2=?)`
*   作为计算字段: `SELECT col,(SELECT COUNT(*) FROM table2 WHERE col3=col4) FROM table1`

注意:

1.  列必须匹配,子查询SELECT和WHERE应保持相同的列
2.  使用子查询时需要考虑效率和性能

[](#联结表 "联结表")联结表
=================

*   创建联结: `SELECT col1, col2 FROM table1, table2 WHERE table1.col=table2.col`
*   内部联结: `SELECT col1, col2 FROM table1 INNER JOIN table2 ON table1.col=table2.col`
*   外部联结: `SELECT col1, col2 FROM table1 LEFT OUTER JOIN table2 ON table1.col=table2.col`

注意:

1.  在引用的列名可能出现二义性时需要使用完全限定列名
2.  没有WHERE语句限定的结果将返回笛卡尔积
3.  WHERE为内部联结,是等值联结
4.  可以使用表别名缩短sql语句和重复使用一张表

[](#组合查询 "组合查询")组合查询
====================

*   使用UNION: `SELECT col FROM table1 WHERE col2=? UNION SELECT col FROM table1 WHERE col3=?`

注意:

1.  UNION必须由两条或以上的SELECT组成
2.  UNION中的每个查询必须包含相同的列,表达式或聚集函数
3.  列数据必须兼容
4.  UNION默认会去重,取消去重使用UNION ALL查询
5.  UNION只能使用一条排序语句出现在最后一个SELECT之后

[](#全文本搜索 "全文本搜索")全文本搜索
=======================

*   `SELECT col FROM table WHERE Match(col) Against('text')`
*   对结果排序: `SELECT col,Match(col) Against('text') AS rank FROM table`

[](#使用视图 "使用视图")使用视图
====================

*   `CREATE VIEW view1 AS SELECT col FROM table`