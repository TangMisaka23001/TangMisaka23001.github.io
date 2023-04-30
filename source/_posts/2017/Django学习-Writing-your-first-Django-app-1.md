---
title: Django学习--Writing your first Django app(1)
date: 2017-07-30 11:20:40
categories: [技术]
tags: [Python, Django]
---
[](#简述 "简述")简述
==============

这一系列的博客是基于Django官方的Documentation—[Writing your first Django app](https://docs.djangoproject.com/en/1.11)而来的,主要是对文档的翻译和自己的实际操作,使用的IDE是**Pycharm**.  
对应项目每个part的代码可以在我的github仓库下载[django官方案例的实现](https://github.com/TangMisaka23001/mysite/tree/part1)

[](#开始 "开始")开始
==============

从一个例子来学习Django的简单内容,在这个教程中,我们将创建一个基本的投票应用.  
包含以下的两部分:

*   一个公开的网站能够进行投票和浏览
*   一个管理员网页可以用来添加,改变和删除投票信息.
<!-- more -->
首先要确认已经安装了Django.可以用以下的命令来查看Django的版本如果已经正确安装了.  
`$ python -m django --version`  
如果Django已经正确安装的话,就可以看到对应的版本信息了.如下:

> python -m django —version  
> 1.11.3

[](#创建一个项目 "创建一个项目")创建一个项目
==========================

[](#方法一-从命令行创建 "方法一:从命令行创建")方法一:从命令行创建
--------------------------------------

`$ django-admin startproject mysite`

这个命令会创建一个名为**mysite**的项目在当前的目录下.  
**注意:** 在创建项目的时候需要避免和django的内置项目重名,例如django或者test.  
创建之后可以看到如下的文件目录:  
```
mysite/    
manage.py    
mysite/        
    __init__.py        
    settings.py        
    urls.py        
    wsgi.py
```
[](#方法二-在Pycharm中创建 "方法二:在Pycharm中创建")方法二:在Pycharm中创建
-----------------------------------------------------

我们点击**File**->**New Project**->在选项卡中选择**Django**然后更改项目名称为mysite即可.如下:  
[![图片](http://misakatang.oss-cn-beijing.aliyuncs.com/201707301.jpg)](http://misakatang.oss-cn-beijing.aliyuncs.com/201707301.jpg "图片")  
创建完成之后会在ide中看到如下的目录:  
[![图片](http://misakatang.oss-cn-beijing.aliyuncs.com/201707302.jpg)](http://misakatang.oss-cn-beijing.aliyuncs.com/201707302.jpg "图片")

[](#文件的解释 "文件的解释")文件的解释
-----------------------

*   最外部的mysite/目录只是一个容器目录,名字和django无关,可以更改名称.
*   **manage.py**: 一个命令行工具来和django交互,对项目的很多操作都要通过该py文件来进行.关于该文件的详细信息可以[参考这里](https://docs.djangoproject.com/en/1.11/ref/django-admin/)
*   里面的mysite/目录是项目的实际Python包.
*   **mysite/ \_\_init.py\_\_**:一个空的文件来告诉Python这是一个包,对于项目没有太大的影响.
*   **mysite/settings.py**:django项目的配置文件.
*   **mysite/urls.py**:django项目的url信息.对于项目的所有url配置都在这里来写.
*   **mysite/wsgi.py**:现阶段不是很重要的一个文件,暂时忽略.

[](#运行服务器 "运行服务器")运行服务器
=======================

在mysite/目录下运行下面命令:  
`$ python manage.py runserver`  
可以看到如下的信息:  
```
Performing system checks...

System check identified no issues (0 silenced).

You have 13 unapplied migration(s). Your project may not work properly until you apply the migrations for app(s): admin, auth, contenttypes, sessions.Run 'python manage.py migrate' to apply them.
July 30, 2017 - 14:34:12
Django version 1.11.3, using settings 'mysite.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```
这样就启动了django的服务器了,要注意的是:**不要在生产环境使用该服务器,这个方式只适用于项目的开发**.  
如果想要改变服务器的启动端口的话可以使用以下的命令:  
`$ python manage.py runserver 8080`  
这个命令将在8080端口启动服务器.

[](#创建一个Polls应用 "创建一个Polls应用")创建一个Polls应用
=========================================

在进行了上述的步骤之后,我们就可以进行开发了.  
我们可以使用下面的命令在project里面创建一个app:  
`$ python manage.py startapp polls`  
这将创建一个polls应用.它的目录如下:  
```
polls/    
    __init__.py    
    admin.py    
    apps.py    
    migrations/        
        __init__.py    
    models.py    
    tests.py    
    views.py
```
[](#来写第一个view "来写第一个view")来写第一个view
===================================

打开polls/views.py然后添加下面的python代码:  
```python
from django.http import HttpResponse
def index(request):    
    return HttpResponse("Hello, world. You're at the polls index.")
```
这是一个最简单的view,为了响应这个view,我们需要将其映射到URL上,这时候我们需要在app中创建一个urls.py文件.你的项目目录就会变成如下形式:
```
polls/
    __init__.py
    admin.py
    apps.py
    migrations/
        __init__.py
    models.py
    tests.py
    urls.py
    views.py
```   

在polls/url.py中写如下的代码:
```python
from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
]
    
```
下一步就是在项目根目录的urlConfig中配置.在mysite/urls.py中,添加import->**django.conf.urls.include**,并且加入如下的代码:
```python
from django.conf.urls import include, url
from django.contrib import admin

urlpatterns = [
    url(r'^polls/', include('polls.urls')),
    url(r'^admin/', admin.site.urls),
]
```

**include()**函数允许引用其他的url配置.当django处理到include函数的时候,会将与这个url匹配的信息交给对应的url来处理.  
**在之前版本的django教程中,都是直接在根目录的urls文件中来直接写url映射的,在这一版本中,官方使用了这种方法来配置url信息,个人觉得这种方法可以使得url的可读性更高,维护也会变得更加的容易**  
下一步就可以运行服务器并且访问index目录.  
`$ python manage.py runserver`  
访问[http://localhost:8000/polls/](http://localhost:8000/polls/),就可以看到之前在view里面写的信息:  
_Hello, world. You’re at the polls index._

[](#url-参数-regex "url()参数:regex:")url()参数:regex:
------------------------------------------------

django使用正则表达式来对url进行匹配,这一部分的知识需要自己学习一些正则表达式的基本内容.

[](#url-参数-view "url()参数:view")url()参数:view
-------------------------------------------

当django匹配到正则表达式之后,会调用其对应的view函数,将HttpRequest对象作为第一个参数,将其他传入的值作为其他参数进行传入.

[](#url-参数-kwargs "url()参数:kwargs")url()参数:kwargs
-------------------------------------------------

在这个教程中没有使用到,暂时忽略.

[](#url-参数-name "url()参数:name")url()参数:name
-------------------------------------------

一个比较重要的参数,可以使用这个参数使得django的url信息变得更加的简单,在之后的教程中会提到.

[](#总结 "总结:")总结:
================

以上是对官方教程的简单的翻译和理解,自己也省略掉了一些内容,特别是在官方的文档中的绿色的note信息,主要是一些细节的问题,有需要的话还是需要自己仔细的看看英文的文档.