---
title: Django学习--Writing your first Django app(5)
date: 2017-08-01 11:24:33
categories: [技术]
tags: [Python, Django]
---
中间还有自动化测试和自定义CSS的部分被我先忽略了,最后一块是讲自定义admin后台的内容的.  
代码同步在github上[mysite-part5](https://github.com/TangMisaka23001/mysite/tree/part7)

[](#开始 "开始")开始
==============

在一开始的时候,我们把Question引入了admin模块,如果我们需要对字段进行更改的话,可以在admin.py文件中自己来定义,比如字段的顺序:  
```python
class QuestionAdmin(admin.ModelAdmin):    
    fields = ['pub_date', 'question_text']
    admin.site.register(Question, QuestionAdmin)
```
这样就可以交换2个字段的位置了~  
<!-- more -->
[![](https://docs.djangoproject.com/en/1.11/_images/admin07.png)](https://docs.djangoproject.com/en/1.11/_images/admin07.png)  
如果说表单的字段很多的话,可能就需要分块来处理了,这时候就可以这么写:  

```python
class QuestionAdmin(admin.ModelAdmin):    
    fieldsets = [        
        (None,               {'fields': ['question_text']}),        
        ('Date information', {'fields': ['pub_date']}),    
    ]

admin.site.register(Question, QuestionAdmin)
```
这样就把字段分成了空和**Date information**两个部分,显示的效果就是这样的:  
[![](https://docs.djangoproject.com/en/1.11/_images/admin08t.png)](https://docs.djangoproject.com/en/1.11/_images/admin08t.png)

[](#把Choice添加进来 "把Choice添加进来!")把Choice添加进来!
===========================================

如果我们需要在admin里面修改choice,当然需要把它添加进来,简单的方法,可以直接  
`admin.site.register(Choice)`  
这样就可以最简单的将其引入,但是我们要注意到一个问题,那就是choice和Question是有外键关联的,我们应该是对对应的Question来添加choice,虽然上述的代码也可以实现这一功能,但是不够直观,而且比较麻烦. 我们可以用下面的方法来实现:  

```python
class ChoiceInline(admin.StackedInline):    
    model = Choice    
    extra = 3


class QuestionAdmin(admin.ModelAdmin):    
    fieldsets = [        
        (None,               {'fields': ['question_text']}),        
        ('Date information', {'fields': ['pub_date'], 'classes': 
        ['collapse']}),    
    ]    
    inlines = [ChoiceInline]
    
admin.site.register(Question, QuestionAdmin)
```
我们在这里添加了一个**ChoiceInline**的类,设置对应的**model**为**Choice**,**extra**属性表示在页面上显示几条信息,效果如下:  
[![](https://docs.djangoproject.com/en/1.11/_images/admin10t.png)](https://docs.djangoproject.com/en/1.11/_images/admin10t.png)  
这样的效果已经达到了我们的预期,修改起来已经很简便了.  
我们也可以更改一下显示的样式,比如:  
`class ChoiceInline(admin.TabularInline):`  
这样的:  
[![](https://docs.djangoproject.com/en/1.11/_images/admin11t.png)](https://docs.djangoproject.com/en/1.11/_images/admin11t.png)

[](#改变Question为列表显示 "改变Question为列表显示")改变Question为列表显示
=====================================================

只要在**QuestionAdmin**类中添加一行:  

`list_display = ('question_text', 'pub_date')`

就可以显示成列表的样式了,当然我们也可以把里面的方法显示出来,比如:  

`list_display = ('question_text', 'pub_date', 'was_published_recently')`

就可以让Question显示成如下的样子:  
[![](https://docs.djangoproject.com/en/1.11/_images/admin12t.png)](https://docs.djangoproject.com/en/1.11/_images/admin12t.png)  
我们还可以用下面的代码让样式变得更好看,并且变得可以排序:  

```python
def was_published_recently(self):        
    now = timezone.now()        
        return now - datetime.timedelta(days=1) <= self.pub_date <= now    
    was_published_recently.admin_order_field = 'pub_date'    
    was_published_recently.boolean = True    
    was_published_recently.short_description = 'Published recently?'
```

我们还可以添加一个**list_filter**属性来对日期进行筛选:  
`list_filter = ['pub_date']`  
效果如下:  
[![](https://docs.djangoproject.com/en/1.11/_images/admin13t.png)](https://docs.djangoproject.com/en/1.11/_images/admin13t.png)  
我们还可以在里面增加一个搜索框:  
`search_fields = ['question_text']`

[](#自定义admin外观 "自定义admin外观")自定义admin外观
======================================

我们需要在项目目录下创建一个**template**文件夹(和**manage.py**同级),然后修改settings.py文件的TEMPLATES属性的DIRS字段,修改之后如下:  
```python
TEMPLATES = [    
    {        
        'BACKEND': 'django.template.backends.django.DjangoTemplates',        
        'DIRS': [os.path.join(BASE_DIR, 'templates')],        
        'APP_DIRS': True,        
        'OPTIONS': {            
            'context_processors': [                
                'django.template.context_processors.debug',                
                'django.template.context_processors.request',                
                'django.contrib.auth.context_processors.auth',                
                'django.contrib.messages.context_processors.messages',            
                ],        
            },    
        },
]
```
这样,django就可以识别并且读取到templates文件夹了,接着在templates文件夹里创建一个**admin**文件夹,把**django/contrib/admin/templates**目录下的**admin/base_site.html**文件拷贝到刚才新建的admin文件夹中.

> 查看Django文件的路径: `python -c "import django; print(django.__path__)"`

然后把base_site.html文件中的`{'{ site_header|default:_('Django administration') }' }`改成例如**Polls Administration**,就可以在admin后台看到页面上的管理后台名称已经变成了**Polls Administration**.  
这是最简单的修改admin的样式的方法,我们还可以自己来增加更多的模板文件来替换各种样式.

[](#总结 "总结")总结
==============

这一节的主要内容就是自定义admin的各种信息,对于admin模块的使用有一个初步的了解,在这一部分之后,我们已经有了初步使用Django的基础,用这点知识,搭建一个例如个人博客也已经不是问题了.~