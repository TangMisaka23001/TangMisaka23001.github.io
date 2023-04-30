---
title: Python-Django学习(一)
date: 2017-07-20 16:43:54
categories: [技术]
tags: [笔记, Django, Web, Python]
---
[](#简述 "简述")简述
==============

开始学习Python的Django框架之后,马上就被这种开发方式吸引了,感觉十分的快以及简洁,就把自己的学习过程记录下来吧.  
主要的学习方式就是参考[官方文档](https://docs.djangoproject.com/en/1.11/intro/install/)(我安装的是最新的1.11版本),先跟着官方的**Writing your first Django app**来走一遍流程,然后再看详细的文档吧.

[](#开始 "开始")开始
==============
<!-- more -->
[](#安装Django "安装Django")安装Django
--------------------------------

直接在pip下安装Django模块是最快的方式了.

> pip install Django

或者也可以在官网查看[下载网页](https://www.djangoproject.com/download/),从源码安装也是一种方式.下载完成解压之后,执行`python setup.py install`就可以安装成功.

[](#检查是否安装成功 "检查是否安装成功")检查是否安装成功
--------------------------------

进入Python的终端,输入`import django`,没有报错的话就是已经安装成功了.

[](#Django的基本命令 "Django的基本命令")Django的基本命令
=========================================

[](#新建project "新建project")新建project
-----------------------------------

> django-admin.py startproject project_name

[](#新建app "新建app")新建app
-----------------------

app就是一个项目中的应用了,一个project可以有很多的app组成.  
**注意:**要先进入project目录下才可以进行app的新建

> cd project_name  
> django-admin.py startapp app_name

[](#启动服务器 "启动服务器")启动服务器
-----------------------

> python manage.py runserver

在命令行看到以下的消息就说明服务器已经启动:  

```shell
Performing system checks...

System check identified no issues (0 silenced).

You have unapplied migrations; your app may not work properly until they are applied.Run 'python manage.py migrate' to apply them.

July 19, 2017 - 15:50:53
Django version 1.11, using settings 'mysite.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```

[](#结束 "结束")结束
==============

第一部分的基础就到这里,之后的更新就会按照Django官方的**Writing your first Django app**的部分来自己实践了.

[](#参考博客 "参考博客")参考博客
====================

[Django 基础教程](http://code.ziqiangxuetang.com/django/django-tutorial.html) 非常推荐!!~ 很不错的中文教程

[Documentation-Quick install guide](https://docs.djangoproject.com/en/1.11/intro/install/) 官方的安装教程