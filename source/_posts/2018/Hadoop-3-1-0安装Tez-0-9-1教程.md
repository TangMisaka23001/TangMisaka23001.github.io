---
title: Hadoop-3.1.0安装Tez-0.9.1教程
date: 2018-09-15 19:37:18
categories: [技术]
tags: [Hadoop, Java, Tez]
---
[](#需知 "需知")需知
==============

本文主要的内容是Hadoop-3.1.0安装Tez-0.9.1的坑和细节,详细的安装过程请参照官网的安装教程.

Hadoop生态的安装还是坑很多,很多时候安装配置之后能启动起来现在想想都还是运气好,个人感觉Hadoop生态最坑的还是各个框架之间的版本配合问题了,因为看文档说Hadoop升级到3之后性能提升了很多,也就在正式环境上部署了Hadoop-3.1.0的版本,结果在尝试更换MR为Tez的时候还是遇到了  
坑.**最主要的就是:**安装各个软件的时候一定要看好版本.

[](#安装 "安装")安装
==============

因为Hadoop的版本为3.1.0,所以**一定一定**要选择0.9.1版本的Tez,因为在0.9.1版本的org.apache.tez.runtime.api的InputInitializerContext接口中才有_addCounters(TezCounters tezCounters)_这个方法,不然在启动Tez的时候会报NoSuchMethodError这个错误(个人感觉这个巨坑,0.9.0版本的API中就没有这个方法).[Tez-0.9.1版本-org.apache.tez.runtime.api](https://tez.apache.org/releases/0.9.1/tez-api-javadocs/index.html)

[](#下载 "下载")下载
--------------

所以Hadoop3.1.0个人现在推荐下载0.9.1版本的包,更老版本的Tez在其他地方也出过一些问题,最后选择了0.9.1版本成功安装了.

[Tez-0.9.1官网下载](https://tez.apache.org/releases/apache-tez-0-9-1.html)

下载时需要下载源码自己进行编译,因为官网的编译好的bin包默认的_Hadoop版本_是**2.6**的,安装时参照[官网的安装教程](https://tez.apache.org/install.html)

[](#安装protobuf-2-5-0 "安装protobuf-2.5.0")安装protobuf-2.5.0
--------------------------------------------------------

在源码编译的时候,需要安装maven和protobuf(Tez依赖),在pom.xml中可以看到Hadoop version和protobuf版本的需求,protobuf version:2.5.0.

```shell
# 下载
wget https://github.com/google/protobuf/releases/download/v2.5.0/protobuf-2.5.0.tar.gz
# 解压
tar -xzvf ./protobuf-2.5.0.tar.gz 
# 编译及安装
cd protobuf-2.5.0
# --prefix为安装位置
./configure --prefix=/usr/local/protobuf
make
make check
# make install时要使用root账户，否则会因为权限的问题报错
sudo make install
```

[](#修改pom-xml "修改pom.xml")修改pom.xml
-----------------------------------

在tez目录下修改pom.xml,首先将hadoop version改为当前运行的Hadoop版本.

_(可选):_因为tez-ui依赖node.js以及bower, bower install时间过久而且报错,可以在pom.xml中搜索tez-ui模块并且注释掉.

### [](#安装node-js以及bower "安装node.js以及bower")安装node.js以及bower

```shell
# 环境为centOS,其他linux版本请修改命令
rpm -ivh http://download.fedoraproject.org/pub/epel/6/x86_64/epel-release-6-8.noarch.rpm
rpm --import /etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-6
rpm -ivh http://rpms.famillecollet.com/enterprise/remi-release-6.rpm
rpm --import /etc/pki/rpm-gpg/RPM-GPG-KEY-remi
yum -y install nodejs npm --enablerepo=epel
npm install -g bower
```

[](#开始编译 "开始编译")开始编译
--------------------
`mvn clean package -DskipTests=true -Dmaven.javadoc.skip=true -Phadoop28 -Dhadoop.version=3.1.0`

注意:一定要带版本 不然编译出错

package结束之后,文件在tez-dict/target目录中,将_tez-0.9.1-minimal.tar.gz_解压之后就是Tez的本体了,可以cp出来放到软件目录下,然后将_tez-0.9.1.tar.gz_放到Hadoop的HDFS中,接下来的配置_tez.lib.uris_在官网的教程和其他的安装教程中都可以找到,这里就不再赘述了.

[](#总结 "总结")总结
==============

_版本问题很重要!版本问题很重要!版本问题很重要!_,在历次的Hadoop的坑中都是被版本所困扰,在选择Hadoop和其他的软件的时候一定要先考虑清楚版本的兼容性再开始安装,在兼容正确的情况下安装是非常非常的轻松的,但是一旦兼容出了问题,各种问题就会从各个地方出现.(血泪教训)

[](#安装过程中报错调试常用的技巧 "安装过程中报错调试常用的技巧")安装过程中报错调试常用的技巧
--------------------------------------------------

hive.log是最常用的查看错误的地方,但是在这次的安装中也查看了yarn的报错信息,主要是因为yarn节点没有能够正常启动起来导致报错信息不会向上抛出,直接使用yarn命名查看log会发现没有对应的错误信息,但是在Hadoop的log文件下面还是找到了yarn启动时的log

`tail -f /tmp/{username}/hive.log`

yarn报错之后信息在hadoop/logs/userlog下面的app中的container中的syslog文件中  
因为启动时失败,直接使用yarn查看log是看不到错误信息的