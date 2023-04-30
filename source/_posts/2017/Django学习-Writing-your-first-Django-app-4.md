---
title: Django学习--Writing your first Django app(4)
date: 2017-08-01 09:18:04
categories: [技术]
tags: [Python, Django]
---
接着第三部分的内容继续app的开发.  
代码同步在github上[mysite-part4](https://github.com/TangMisaka23001/mysite/tree/part4)

[](#写一个简单的表单 "写一个简单的表单")写一个简单的表单
================================

在**template/polls/detail.html**来添加一个form表单:  
```html
<h1>{'{ question.question_text }' }</h1>
{ % if error_message % }<p><strong>{'{ error_message }' }</strong></p>{ % endif % }
<form action="{ % url 'polls:vote' question.id % }" method="post">
{ % csrf_token % }
{ % for choice in question.choice_set.all % }    
    <input type="radio" name="choice" id="choice{'{ forloop.counter }' }" value="{'{ choice.id }' }" />    
    <label for="choice{'{ forloop.counter }' }">{'{ choice.choice_text }' }</label><br />
{ % endfor % }
<input type="submit" value="Vote" />
</form>
```
<!-- more -->
[](#解释 "解释")解释
--------------

在form表单中,input标签的**value**值是被选择的question的id,对应的name名为**choice**,也就是说在选择了表单中的一个选项并且提交的时候,会向服务器发送一个POST请求,来表示哪一个choice被选择并且vote了.  
**注意:**在向服务器提交表单的时候,使用POST请求是一个好的习惯  
现在我们来实现views.py中的vote函数:  
```python
def vote(request, question_id):    
    question = get_object_or_404(Question, pk=question_id)    
    try:        
        selected_choice = question.choice_set.get(pk=request.POST['choice'])    
    except (KeyError, Choice.DoesNotExist):        
        # Redisplay the question voting form.        
        return render(request, 'polls/detail.html', {            
            'question': question,            
            'error_message': "You didn't select a choice.",        
        })    
    else:        
        selected_choice.votes += 1        
        selected_choice.save()        
        # Always return an HttpResponseRedirect after successfully dealing        
        # with POST data. This prevents data from being posted twice if a        
        # user hits the Back button.        
        return HttpResponseRedirect(reverse('polls:results', args=(question.id,)))
```
[](#解释-1 "解释")解释
----------------

`pk=request.POST['choice']`这个参数表示,从request.POST请求中获取被选择的choice.  
如果不存在的话,就抛出一个**Choice.DoesNotExist**Choice不存在的异常,错误信息为**You didn’t select a choice.**.  
如果存在的话,那么这个choice的votes属性增加1并且使用save()函数写入数据库中.  
在完成数据库写入操作之后,向页面发送了一个HttpResponseRedirect,将网页重定向到polls的results上,并且带上了当前的question的id.  
这个函数也等效为重定向到`'polls/question.id/results'`这个页面.  
接着我们来完善一下results函数:  
```python
def results(request, question_id):    
    question = get_object_or_404(Question, pk=question_id)    
    return render(request, 'polls/results.html', {'question': question})
```
和resluts.html:  
```html
<h1>{'{ question.question_text }' }</h1>
<ul>
{ % for choice in question.choice_set.all % }    
    <li>{'{ choice.choice_text }' } -- {'{ choice.votes }' } vote{'{ choice.votes|pluralize }' }</li>
{ % endfor % }
</ul>
<a href="{ % url 'polls:detail' question.id % }">Vote again?</a>
```
现在我们就已经完成了一个完整的查看问题并且投票然后查看投票信息的页面了~  
接下来的操作只是对于代码的优化了.

[](#使用通用视图 "使用通用视图")使用通用视图
==========================

在我们之前写的代码中,有很多的步骤都是很重复但是又很简单的,比如从数据库获取信息,并且返回到页面,在django中,使用**通用视图(generic views)**来简化这些操作.  
下面是修改的过程:

[](#修改URL "修改URL")修改URL
-----------------------

在**polls/urls.py**中,修改代码如下:  
```python
urlpatterns = [    
    url(r'^$', views.IndexView.as_view(), name='index'),    
    url(r'^(?P<pk>[0-9]+)/$', views.DetailView.as_view(), name='detail'),    
    url(r'^(?P<pk>[0-9]+)/results/$', views.ResultsView.as_view(), name='results'),    
    url(r'^(?P<question_id>[0-9]+)/vote/$', views.vote, name='vote'),
]
```
把`<question_id>`换成了`<pk>`

[](#修改views "修改views")修改views
-----------------------------

将**polls/viwes.py**文件修改如下:  
```python
from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.views import generic
from .models import Choice, Question


class IndexView(generic.ListView):    
    template_name = 'polls/index.html'    
    context_object_name = 'latest_question_list'    
    
    def get_queryset(self):        
        """Return the last five published questions."""        
        return Question.objects.order_by('-pub_date')[:5]


class DetailView(generic.DetailView):    
    model = Question    
    template_name = 'polls/detail.html'


class ResultsView(generic.DetailView):    
    model = Question       
    template_name = 'polls/results.html'
    

def vote(request, question_id):    
    ... # same as above, no changes needed.
```
在这里使用了两个默认的视图:**ListView**和**DetailView**.和视图的名称一样,一个是返回对象的列表的视图,一个是详细信息的视图.

[](#踩了个小坑 "踩了个小坑")踩了个小坑
-----------------------

要把index.html中的detail改成polls:detail,不然会报错

*   **DetailView**使用pk来从URL中接受参数,所以在URLConfig中将question_id改成了pk