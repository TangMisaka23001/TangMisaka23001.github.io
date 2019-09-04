---
title: OpenResty+Flume+Hbase+Hive搭建日志收集系统
date: 2018-08-07 22:09:00
categories: [Linux]
tags: [Flume, Nginx, Hive]
---
最近因为需要,自己尝试了一波日志收集系统的搭建,这一部分只是做离线分析使用的HBase的数据,Kafka的实时数据消费还没有尝试部署,主要流程是从Nginx服务器接收请求的方式打印日志,由Flume收集之后进入HBase,Hive提供一个SQL的接口功能.

数据格式方面url请求接收GET请求,数据为data=xxxxxx(前端JSON做的URL编码),字段视业务而定.

[](#日志收集框架搭建流程 "日志收集框架搭建流程")日志收集框架搭建流程
======================================

[](#nginx-Lua收集上传日志并生成日志文件 "nginx+Lua收集上传日志并生成日志文件")nginx+Lua收集上传日志并生成日志文件
--------------------------------------------------------------------------
<!-- more -->
### [](#Lua环境安装 "Lua环境安装")Lua环境安装

1.  [Lua官网](http://luajit.org/download.html)下载Lua安装包,当前版本为LuaJIT-2.0.5.
2.  解压安装包,cd进入目录
3.  make
4.  sudo make install
5.  验证luajit安装:
    ```
    luajit -vLuaJIT 2.0.5 -- Copyright (C) 2005-2017 Mike Pall. http://luajit.org/
    ```


### [](#OpenResty环境搭建 "OpenResty环境搭建")OpenResty环境搭建

nginx采用OpenResty框架,可以在nginx嵌入使用Lua脚本

1.  在[官网](http://openresty.org/)下载安装OpenResty,当前版本为openresty-1.13.6.1
2.  安装依赖包(Ubuntu环境):
    ```
    apt-get install libreadline-dev libncurses5-dev libpcre3-dev \    
    libssl-dev perl make build-essential
    ```
3.  解压安装包进入目录
    
4.  进行编译配置:
    ```
    # 如下命令，OpenResty 将配置安装在 /opt/openresty 目录下（注意使用 root 用户）,并激活luajit、http_iconv_module 并禁止 http_redis2_module 组件
    ./configure --prefix=/opt/openresty\             
    --with-luajit\             
    --without-http_redis2_module \  
    #Guide给出的配置,具体配置按照需求来定             
    --with-http_iconv_module
    ```
5.  这一步出错基本都是依赖库的问题,查看控制台的报错信息并安装对应的依赖包.一般依赖库为:
    
    1.  PCRE库:`sudo apt-get install libpcre3 libpcre3-dev`
    2.  zlib库:`sudo apt-get install zlib1g-dev`
    3.  openssl库(选配):`sudo apt-get install openssl libssl-dev`
6.  正确执行configure之后会提示依赖pcre,zlib,openssl成功并且无报错信息
7.  执行`make&sudo make install`
8.  将nginx添加到PATH变量,在/etc/profile文件末添加`export PATH=$PATH:/opt/openresty/nginx/sbin`(视上面的安装路径而定),然后source /etc/profile更新环境变量,在终端里就可以使用nginx了.(可以使用`ps -e |grep "nginx"`看到进程,kill可能会用到)

### [](#配置OpenResty接受日志信息 "配置OpenResty接受日志信息")配置OpenResty接受日志信息

1.  首先要创建一个OpenResty项目文件夹,nginx启动的时候启动的就是该项目.
    ```
    # 这里文件夹按照Guide使用了test,实际按项目而定
    mkdir ~/openresty-test ~/openresty-test/logs/ ~/openresty-test/conf/
    ```
2.  在~/openresty-test/conf/下创建一个nginx.conf文件,日志采集和写入日志文件的操作都在这里面完成,现在直接将Lua代码写入了配置文件中,为了更好的维护和可读性可以提取Lua脚本出来单独维护.配置文件中主要Lua代码:
    ```
    # 前面还有配置信息,这里只是http配置
    http {    
        server {    
            #监听端口，若你的6699端口已经被占用，则需要修改    
            listen 6699;    
            # 采集url为/get    
            location /get{        
                content_by_lua_block{            
                    local msg = ""            
                    local arg = ngx.req.get_uri_args()			            
                    for k,v in pairs(arg) do                
                        local cjson = require "cjson"                
                        -- 解析好的url参数序列化成JSON并拼接需要打成日志信息的格式                
                        -- 使用\0x01做分隔符(本来用\0x02做每串分割后来直接\n了))                
                        local json = cjson.decode(v) -- 用cjson直接decode                
                        msg = json.pid..string.char('0x01')..json.oid..string.char('0x01')                    
                            ..json.eid..string.char('0x01')..json.epid.."\0x01"                    
                            ..json.rand..string.char('0x01')..json.tid..string.char('0x01')                
                        -- 测试用打印信息                
                        ngx.say("pid:"..json.pid.."  oid:"..json.oid.."  eid:"..json.eid..                    
                            "  epid:"..json.epid.."  rand:"..json.rand.."  tid:"..json.tid)                
                        if (json.r5 ~= nil) then                    
                            for key, value in pairs(json.r5) do                        
                                msg = msg..key..":"..value..","                        
                                -- 测试用打印信息                        
                                ngx.say("key:"..key.."  value:"..value)                    
                            end                                    
                        end                
                        msg = msg.."\0x02\n"            
                    end            
                    -- 替换掉r5串里最后一个, 否则在HBase表中会多一个null的字段(也可以在Flume中的正则处理)            
                    msg = string.gsub(msg, ",\0x02", '')            
                    -- 测试用打印信息            
                    ngx.say(msg)            
                    -- 写入文件操作            
                    local file = io.open("/home/tang/openresty-test/lualog.txt","a+")            
                    file:write(msg)            
                    file:flush()            
                    file:close()        
                }    
            }
        }
    }
    ```
3.  启动Nginx,命令为:`nginx -p ~/openresty-test`,向端口发送请求就会在项目文件夹下生成一个_lualog.txt_文件并已经记录了请求的信息.
    

[](#Flume进行日志采集 "Flume进行日志采集")Flume进行日志采集
-----------------------------------------

### [](#安装Flume "安装Flume")安装Flume

1.  Java安装,略过.安装版本为1.8.
2.  在[官网](https://flume.apache.org/download.html)下载Flume,当前版本为apache-flume-1.8.0.
3.  解压安装包
4.  配置flume-ng环境变量,在/etc/profile中添加
    ```profile
    export JAVA_HOME=/usr/local/jdk  # 自己的JDK目录,版本为1.8
    export FLUME_HOME=/opt/apache-flume-1.8.0-bin
    export FLUME_CLASSPATH=$FLUME_HOME/lib/*
    ```
5.  配置flume-env.sh,暂时没有配置该sh文件,网上教程似乎也只是配置java路径
    
6.  启动flume测试:
    ```
    # flume-ng version
    Flume 1.8.0
    Source code repository: https://git-wip-us.apache.org/repos/asf/flume.git
    Revision: 99f591994468633fc6f8701c5fc53e0214b6da4f
    Compiled by denes on Fri Sep 15 14:58:00 CEST 2017
    From source with checksum fbb44c8c8fb63a49be0a59e27316833d
    ```
7.  **重要**在conf文件夹中配置Flume启动参数,source,sink,channels在这里配置,现在使用的hbase-flume.conf文件信息:
    ```yml
    # 从文件读取实时消息，不做处理直接存储到Hbase
    agent.sources = logfile-source
    agent.channels = file-channel
    agent.sinks = hbase-sink
    
    # logfile-source配置
    agent.sources.logfile-source.type = exec
    # source源为Lua脚本中生成的日志文件lualog.txt
    agent.sources.logfile-source.command = tail -f /home/tang/openresty-test/lualog.txt
    agent.sources.logfile-source.checkperiodic = 10
    
    # defined channel,可以配置文件形式和内存形式,内存形式效率高但是出错会导致数据丢失,文件形式效率慢但是数据不会丢失
    agent.channels.file-channel.type = memory
    #设置channel的容量
    agent.channels.file-channel.capacity = 1000
    #设置sink每次从channel中拉取的event的数量
    agent.channels.file-channel.transactionCapacity = 100
    
    # sink 配置为 Hbase
    agent.sinks.hbase-sink.type = logger
    agent.sinks.hbase-sink.type = hbase
    # Habse表名和列族名
    agent.sinks.hbase-sink.table = table_log
    agent.sinks.hbase-sink.columnFamily  = cf_info
    agent.sinks.hbase-sink.serializer = org.apache.flume.sink.hbase.RegexHbaseEventSerializer
    # 对nginx日志做分割，然后按列存储HBase,日志格式为...\0x01...\0x01...   \0x01从日志文件复制一个过来 vscode好像不显示\0x02
    agent.sinks.hbase-sink.serializer.regex = (.*?)\0x01(.*?)\0x01(.*?)\0x01(.*?)\0x01(.*?)\0x01(.*?)\0x01(.*?)
    # 列族中每一个列的名称,注意:row key为自动生成
    agent.sinks.hbase-sink.serializer.colNames = pid,oid,eid,epid,rand,tid,r5
    
    # # 组合source、sink和channel
    agent.sources.logfile-source.channels = file-channel
    agent.sinks.hbase-sink.channel = file-channel
    ```
8.  启动flume,cd到flume目录下:(还没有配置HBase时会报错,需要先在HBase中建表才行)
    ```
    # flume-ng agent --name agent --conf ./conf/ --conf-file ./conf/hbase-flume.conf -Dflume.root.logger=DEBUG,console
    
    --name为配置文件中agent名 --conf为flume/conf文件夹 --conf-file为前面写的配置文件,现在以DEBUG模式向控制台打印调试信息
    ```

[](#Hbase持久化日志信息-Hive提供数据库查询功能 "Hbase持久化日志信息,Hive提供数据库查询功能")Hbase持久化日志信息,Hive提供数据库查询功能
--------------------------------------------------------------------------------------

### [](#安装HBase-当前都为单机环境 "安装HBase(当前都为单机环境)")安装HBase(当前都为单机环境)

#### [](#安装Hadoop "安装Hadoop")安装Hadoop

安装HBase需要安装Hadoop,使用的是[大数据学习系列](http://www.panchengming.com/page/3/)的Hadoop和Hbase的搭建流程,博客中的流程可以走通,需要注意的是若在/root目录下创建Hadoop的一系列文件夹需要在root权限下执行全部操作,否则会导致没有权限报各种错误.或是将/root/hadoop文件夹分给当前用户组(现在采用这种方式).

现在采用的Hadoop版本为:hadoop-2.9.1,HBase版本为:hbase-1.2.6.1.

**注意**:Hadoop和HBase和Hive版本一定要匹配,不兼容会导致很多错误.

主要环境变量配置如下:(Hadoop安装路径在 ~ 下)  
core-site.xml  
```xml
<configuration>        
    <!-- 现在只是在单机情况下配置了Hadoop和HBase 集群配置文件需要修改 -->        
    <property>             
        <name>hadoop.tmp.dir</name>             
        <value>file:/root/hadoop/tmp</value>             
        <description>Abase for other temporary directories.</description>        
    </property>        
    <property>             
        <name>fs.defaultFS</name>             
        <value>hdfs://localhost:9000</value>        
    </property>
    <!-- 这是为了hive服务启动之后可以远程连接hive数据库的配置,
    hadoop.proxyuser.{user.name}.hosts user.name为登陆服务器的用户名,现在没有任何安全配置 -->
    <property>   
        <name>hadoop.proxyuser.tang.hosts</name>   
        <value>*</value>
    </property>
    <property>   
        <name>hadoop.proxyuser.tang.groups</name>   
        <value>*</value>
    </property>
</configuration>
```
hdfs-site.xml配置文件  
```xml
<configuration>    
    <!-- 在root文件夹下配置了Hadoop且不是root用户的话,一定要注意权限问题!! -->    
    <property>           
        <name>dfs.name.dir</name>           
        <value>/root/hadoop/dfs/name</value>           
        <description>Path on the local filesystem where theNameNode stores the namespace and transactions logs persistently.</description>    
    </property>    
    <property>           
        <name>dfs.data.dir</name>           
        <value>/root/hadoop/dfs/data</value>           
        <description>Comma separated list of paths on the localfilesystem of a DataNode where it should store its blocks.</description>    
    </property>    
    <property>           
        <name>dfs.replication</name>           
        <value>2</value>    
    </property>    
    <property>           
        <name>dfs.permissions</name>          
        <value>false</value>          
        <description>need not permissions</description>    
    </property>
</configuration>
```
/etc/profile中配置  
```profile
export HADOOP_HOME=/home/tang/hadoop
export PATH=$PATH:$HADOOP_HOME/bin
export PATH=$PATH:$HADOOP_HOME/sbin
export HADOOP_MAPRED_HOME=$HADOOP_HOME
export HADOOP_COMMON_HOME=$HADOOP_HOME
```
#### [](#启动Hadoop "启动Hadoop")启动Hadoop

运行`~/hadoop/sbin`下的`start-all.sh`.启动之后使用`jps`可以看到下面的进程(保证NameNode和DataNode启动完成,没有进程的话需要查看log文件夹下的报错信息并解决错误):  
```
# jsp
2243 NodeManager
1974 SecondaryNameNode
2278 Jps1642 NameNode
2123 ResourceManager
1790 DataNode
```
#### [](#安装HBase "安装HBase")安装HBase

依旧使用[大数据学习系列之二 ——\- HBase环境搭建(单机)](http://www.panchengming.com/2017/12/09/pancm57/)文章中的搭建过程.

hbase-site.xml配置信息:  
```xml
<configuration>    
    <!-- 存储目录 -->    
    <property>          
        <name>hbase.rootdir</name>          
        <value>hdfs://localhost:9000/hbase</value>          
        <description>The directory shared byregion servers.</description>      
    </property>      
    <!-- hbase的端口 -->    
    <property>          
        <name>hbase.zookeeper.property.clientPort</name>          
        <value>2181</value>          
        <description>Property from ZooKeeper'sconfig zoo.cfg. The port at which the clients will connect.      </description>      
    </property>          
    <!--  超时时间 -->        
    <property>          
        <name>zookeeper.session.timeout</name>          
        <value>120000</value>      
    </property>      
    <!--  zookeeper 集群配置。如果是集群，则添加其它的主机地址 -->    
    <property>          
        <name>hbase.zookeeper.quorum</name>          
        <value>localhost</value>      
    </property>      
    <property>          
        <name>hbase.tmp.dir</name>          
        <value>/root/hbase/tmp</value>      
    </property>      
    <!-- false是单机模式，true是分布式模式  -->    
    <property>          
        <name>hbase.cluster.distributed</name>          
        <value>false</value>      
    </property>
</configuration>
```
#### [](#启动HBase "启动HBase")启动HBase

运行hbase/bin下的start-hbase.sh,正确运行之后使用`jps`命令可以看到HMaster,且需要保证DataNode和NameNode没有死掉:  
```
2243 NodeManager
4613 Jps
1974 SecondaryNameNode
2697 HMaster  # 主要是HMaster
1642 NameNode
2123 ResourceManager
3515 Application
1790 DataNode
3071 RunJar
```
#### [](#HBase建表 "HBase建表")HBase建表

在hbase/bin目录下运行:`./hbase shell`进入shell终端  

`create 'table_log','cf_info'`

就可以建表,指定表名和列族名.这时候运行flume-ng就可以将日志信息打入HBase了.  
使用`scan 'table_log'`可以扫描HBase表看到数据.

### [](#安装Hive "安装Hive")安装Hive

参考[大数据学习系列之四 ——\- Hadoop+Hive环境搭建图文详解(单机)](http://www.panchengming.com/2017/12/16/pancm61/)

安装Mysql后主要是权限的坑,授予远程连接权限之后要是不能访问,需要修改`/etc/mysql/mysql.conf.d/mysqld.cnf`将bind-address修改为`0.0.0.0`

Hive版本为:apache-hive-2.1.0.

hive-site.xml主要配置信息:  
```xml
<configuration>
    <!-- 注意注意:: 一定要把配置信息写在最下面!!!或者自己删掉xml下面重复的配置信息字段,否则覆盖之后配置信息不生效!!! 巨坑 -->    
    <property>          
        <name>hive.metastore.warehouse.dir</name>          
        <value>/root/hive/warehouse</value>      </property>      
    <property>        
        <name>hive.exec.scratchdir</name>        
        <value>/root/hive</value>    
    </property>    
    <property>          
        <name>hive.metastore.uris</name>          
        <value></value>      
    </property>      
    <property>        
        <!-- mysql的链接路径和驱动信息 -->        
        <name>javax.jdo.option.ConnectionURL</name>        
        <value>jdbc:mysql://127.0.0.1:3306/hive?createDatabaseIfNotExist=true</value>    
    </property>    
    <property>        
        <name>javax.jdo.option.ConnectionDriverName</name>        
        <value>com.mysql.jdbc.Driver</value>    
    </property>    
    <property>        
        <!-- mysql的用户名密码 -->        
        <name>javax.jdo.option.ConnectionUserName</name>        
        <value>hive</value>    
    </property>    
    <property>        
        <name>javax.jdo.option.ConnectionPassword</name>        
        <value>hive</value>    
    </property>    
    <property>        
        <name>hive.metastore.schema.verification</name>        
        <value>false</value>        
        <description>        </description>    
    </property> 
</configuration>
```

#### [](#启动Hive和hivesrever2 "启动Hive和hivesrever2")启动Hive和hivesrever2

运行`hive/bin`目录下的hiveserver2服务之后就可以远程连接hive数据库.网页端口为:`10002`

现在使用的远程连接工具为:SQuirrel SQL,安装教程[Squirrel SQL Client连接hive安装部署](https://blog.csdn.net/vfgbv/article/details/51014256),现在默认连接没有安全控制,可以直接访问Hive数据库.

主要是需要1.8的Java版本,10版本在程序启动是会有版本不匹配的坑,而新版的软件十分不稳定,安装1.8版本Java就没有问题.

#### [](#Hive建表关联HBase "Hive建表关联HBase")Hive建表关联HBase

Hive优势在于Map等复杂的数据结构,在Hive配置成功之后可以直接建表关联HBase,SQL语句如下:  
```sql
## r5为Map复杂数据类型,主键为Flume插入日志信息时自动生成
## SERDEPROPERTIES ("hbase.columns.mapping" = ":key,cf_info:pid,cf_info:oid,cf_info:eid,cf_info:epid,cf_info:rand,cf_info:tid,cf_info:r5")中需要保证Hive中的字段和HBase表中对应,现在HBase中只有一个列族cf_info.
## TBLPROPERTIES ("hbase.table.name" = "table_log"); 配置HBase中对应的表名.
create table loginfo( 
    key string, 
    pid string, 
    oid string, 
    eid string, 
    epid string, 
    rand string, 
    tid string, 
    r5 map<string,string> ) 
    row format delimited fields terminated by "\t" 
    collection items terminated by "," 
    map keys terminated by ":" 
    STORED BY 'org.apache.hadoop.hive.hbase.HBaseStorageHandler' 
    WITH SERDEPROPERTIES ("hbase.columns.mapping" = ":key,cf_info:pid,cf_info:oid,cf_info:eid,cf_info:epid,cf_info:rand,cf_info:tid,cf_info:r5")
    TBLPROPERTIES ("hbase.table.name" = "table_log");
```
#### [](#完成 "完成")完成

之后请求Nginx端口发送信息就可以在Hive中直接select到了.

[](#总结-踩坑 "总结(踩坑)")总结(踩坑)
=========================

坑主要是出在各个框架之间的版本选择上,在安装之前**一定一定一定**要选好你的Hadoop+HBase+Hive版本保证互相兼容,剩下的就十分的简单了.还有在xml配置上**要写在默认配置下面**来覆盖原有的默认配置,Hive写了一堆默认配置而且是非注释状态,在连接Mysql的时候卡了好久.

不得不说Flume还是一个我十分喜欢的东西,非常的强大而且拓展性十分强悍,也看到了美团在其之上的改进的文章获益匪浅:[基于Flume的美团日志收集系统(一)架构和设计](https://tech.meituan.com/mt_log_system_arch.html)和[基于Flume的美团日志收集系统(二)改进和优化](https://tech.meituan.com/mt_log_system_optimization.html).这次只是搭建和初步的尝试,后续的细节和改进会继续跟进.