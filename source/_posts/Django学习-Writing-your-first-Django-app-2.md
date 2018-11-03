---
title: Django学习--Writing your first Django app(2)
date: 2017-07-30 20:49:20
categories: [Python]
tags: [Django, Web]
---
[](#开始 "开始")开始
==============

这是**Writing your first Django app, part 2**  
接着第一部分的例子继续,在这个部分我们要设置数据库,创建第一个模型并且快速介绍一下django的自动生成的admin管理页面.  
自己写的代码也同步在github的仓库里:[mysite-part2](https://github.com/913647909/mysite/tree/part2)

[](#数据库设置 "数据库设置")数据库设置
=======================

现在,打开mysite/settings.py文件,这是一个默认的python模型的设置.  
Python默认使用的是SQLite数据库,如果不需要自己配置数据库的话,使用默认的即可.而且SQLite数据库已经在Python的模块里,不需要额外的安装.  
这里对于其他数据库的配置不做解释,因为只是入门程序,之后在用到如Mysql的时候会再讲到.  
现在只要输入如下的命令就可以生成对应的数据库(第一次使用):  
`$ python manage.py migrate`  
看到如下的信息的话,就说明生成完成了:  
```
Operations to perform:  
    Apply all migrations: admin, auth, contenttypes, sessions
Running migrations:  
Applying contenttypes.0001_initial... OK  
Applying auth.0001_initial... OK  
Applying admin.0001_initial... OK  
Applying admin.0002_logentry_remove_auto_add... OK  
Applying contenttypes.0002_remove_content_type_name... OK  
Applying auth.0002_alter_permission_name_max_length... OK  
Applying auth.0003_alter_user_email_max_length... OK  
Applying auth.0004_alter_user_username_opts... OK  
Applying auth.0005_alter_user_last_login_null... OK  
Applying auth.0006_require_contenttypes_0002... OK  
Applying auth.0007_alter_validators_add_error_messages... OK  
Applying auth.0008_alter_user_username_max_length... OK  
Applying sessions.0001_initial... OK
```
[](#创建模型 "创建模型")创建模型
====================

在这个简单的app里,需要创建2个模型,Question和Choice.Question里包含了问题和提问的时间,Choice里包含了选择的文字和投票的信息.  
在**polls/models.py**文件里添加如下的信息:  
```python
from django.db import models


class Question(models.Model):    
    question_text = models.CharField(max_length=200)    
    pub_date = models.DateTimeField('date published')


class Choice(models.Model):    
    question = models.ForeignKey(Question, on_delete=models.CASCADE)    
    choice_text = models.CharField(max_length=200)    
    votes = models.IntegerField(default=0)
```
对应每一个class都会在数据库中生成对应的表和字段.而在对字段添加属性和限制的时候,使用的是Field类.对于Field的详细信息不做过多的描述.

[](#激活模型 "激活模型")激活模型
====================

首先需要在settings.py文件里将app导入项目中,在**INSTALLED_APPS**属性中添加**polls.apps.PollsConfig**路径即可,如下:  
```python
INSTALLED_APPS = [    
    'polls.apps.PollsConfig',    
    'django.contrib.admin',    
    'django.contrib.auth',    
    'django.contrib.contenttypes',    
    'django.contrib.sessions',    
    'django.contrib.messages',    
    'django.contrib.staticfiles',
]
```

接下来就可以在命令行中输入:  
`$ python manage.py makemigrations polls`  
当看到如下的信息的时候,就表示正确运行了.  

```
for 'polls':

polls/migrations/0001_initial.py:  
    - Create model Choice  
    - Create model Question  
    - Add field question to choice
```

接下来就可以在代码中对这2个对象进行操作了,在官方的文档中还介绍了如何在shell中来对数据库进行操作,这里就不写出来了,需要的话在官网可以看到.

[](#注意 "注意")注意
--------------

在模型中添加\_\_str\_\_() 很重要,这样就不会在读取对象的时候只看到对象的class名了.  
```python
from django.db import models
from django.utils.encoding import python_2_unicode_compatible


class Question(models.Model):    
    # ...这里是之前已经写好的代码,只需要在后面添加一个str的方法即可    
    def __str__(self):        
        return self.question_text


class Choice(models.Model):    
    # ...这里是之前已经写好的代码,只需要在后面添加一个str的方法即可    
    def __str__(self):        
        return self.choice_text
```

至此,对于简单的数据库模型的操作就可以进行了,在代码中直接使用如:**Question.objects.all()**来查询所有的对象,用**save()**函数就可以向数据库中插入对象,Django推荐在查询的时候使用filter来进行限定条件的查询,比如:  
```python
Question.objects.filter(id=1)
Question.objects.filter(question_text__startswith='What')
```

**注:**\_\_startswith这类的方法是更高级的查询限制的方法,详细的可以查看官方的文档,这里的意思很明显就是,查询question\_text字段中以what开头的信息.

[](#介绍Django-Admin "介绍Django Admin")介绍Django Admin
==================================================

这也算是我非常喜欢的一个Django的特性了,对后台管理的操作可以直接使用内置的模块来很简单的生成,简直是快速开发的福音.

[](#创建 "创建")创建
--------------

只需要下面的一行命令就可以:  
`$ python manage.py createsuperuser`  
接下来就会需要你填写Username,Email和password,输入正确之后就打开了Django的admin模块了.  
接下来启动服务器,然后在浏览器中输入[http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)就可以访问admin后台了.  
[![图片](http://misakatang.oss-cn-beijing.aliyuncs.com/201707311.jpg)](http://misakatang.oss-cn-beijing.aliyuncs.com/201707311.jpg "图片")  
进入之后就可以看到如下的页面:  
[![tupian](http://misakatang.oss-cn-beijing.aliyuncs.com/201707312.jpg)](http://misakatang.oss-cn-beijing.aliyuncs.com/201707312.jpg "tupian")

[](#添加管理模块 "添加管理模块")添加管理模块
--------------------------

在polls/admin.py文件中添加**一行代码**,就可以把Question这个表添加在admin管理中,简直不要太爽了.  
```python
from django.contrib import admin
from .models import Question

admin.site.register(Question)
```
刷新页面之后,就可以在后台页面看到polls app中多了Questions的管理页面:  
[![图片](http://misakatang.oss-cn-beijing.aliyuncs.com/201707313.jpg)](http://misakatang.oss-cn-beijing.aliyuncs.com/201707313.jpg "图片")  
然后就可以对Question进行操作了~

[](#总结 "总结")总结
==============

Django确实非常的方便,在对于简单的页面的开发的时候,确实是很快.特别是类似于admin一样的现成的模块,拿来就可以直接使用.