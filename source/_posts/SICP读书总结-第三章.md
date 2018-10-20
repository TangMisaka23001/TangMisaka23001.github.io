---
title: SICP读书总结-第三章
mathjax: false
date: 2018-10-20 15:51:54
categories: [笔记]
tags: [SICP, 函数式编程, Lisp]
---
> Even while it changes, it stands still
---
# 前言
第三章的阅读之路也算是比较漫长了,和计划的SICP进度可能还是差距很大,但是好歹也是在慢慢推进了..第三章内容算是比较杂的但是挺重要的吧,特别是在这个流和分布式被越来越重视的8102年,而且在工作之后再来看这些问题也是有很多的新收获,确实很多知识虽然过了几十年,其实本质上是没有什么变化的,而我的感觉就是SICP提供给我一种从语言的角度来看待计算机问题的角度,从而使得对很多问题的思考更加全面和多样了.

# 总结
在前两章的基础上,在我们构建系统的时候,还需要一些知识来使得我们在构建大型的系统时使得系统更具模块性,我们希望这种策略能够在有新的对象或者动作添加进系统的时候不需要修改原有的代码,只需要加一些额外的代码(symbolic analogs)就能够解决问题.

在我们构建系统的时候有两种看待事物的角度:
- 第一种是把一个大型系统视为对象的集合,而对象的行为可能随时间变化
- 第二种是像电子工程师一样把系统看作是信号处理系统,把系统看成是信号在元件之间流动.

## 赋值和局部状态
看待系统中状态变化的一种观点是:状态变化可以被分组成几个紧密相关的子系统并且子系统之间的关系要保持松散.这也就导致我们想到要使得每个对象都有其局部的状态(local state varibles)
### 引入set!
比如在取钱的时候,我们的流程应该是下面这样的:假设我们有100块钱
```
(withdraw 25)
75
(withdraw 25)
50
(withdraw 60)
"Insufficient funds"
(withdraw 15)
35
```
而这样的求值方式前面没有状态的函数肯定是做不到的了,因为每次调用相同的函数都会产生不同的结果了.这时候就需要引入**赋值**,也就是set!.代码的实现如下:
```
(define balance 100)
(define (withdraw amount)
    (if (>= balance amount)
        (begin (set! balance (- balance amount))
            balance)
        "Insufficient founds"))
```
而set!的引入也导致前面的替换模型的规则就失效了.因为balance变成了一个绑定在全局环境里的变量.
### 引入赋值的好处
> It is tempting to conclude this discussion by saying that, by introducing assignment and the technique of hiding state in local variables, we are able to structure systems in a more modular fashion than if all state had to be manipulated explicitly, by passing additional parameters.

通过局部状态可以使得我们更加模块化的来构建系统.

### 引入赋值的代价
那么,代价是什么呢?
1. 替换模型在这里不再适用了
2. 由于引入了赋值,函数的执行顺序变得重要了,我们也失去了函数式编程的一部分优雅
3. 我们不得不接受命令式编程一样的复杂性

> programming with assignment forces us to carefully consider the relative orders of the assignments to make sure that each statement is using the correct version of the variables that have been changed.This issue simply does not arise in functional programs

## 求值的环境模型
为了应付set!这个需求,我们需要引入一个叫做环境的结构,环境就是一系列的帧(frames)构成的.而相对应的,环境模型的求值规则是:
1. Evaluate the subexpressions of the combination.
2. Apply the value of the operator subexpression to the values of the operand subexpressions.

大致就是为每一个子表达式创建一个自己的环境,然后绑定它的父表达式,子表达式内的变量自己用,求值的时候的感觉就是自底向上求值.
### 用帧来存储局部状态
根据上面的规则翻译一下上面从银行取钱的函数就是这样的:
```
(define (make-withdraw balance)
  (lambda (amount)
    (if (> amount balance)
      "Insufficient"
      (begin
        (set! balance (- balance amount))
        balance))))

(define W1 (make-withdraw 100))
(W1 50)
```
![](https://img.alicdn.com/imgextra/i2/581166664/TB2WwebiVXXXXcxXXXXXXXXXXXX_!!581166664.png)

求值`(W1 50)`的过程如下图:

![](https://img.alicdn.com/imgextra/i1/581166664/TB2mo5iiVXXXXa.XXXXXXXXXXXX_!!581166664.png)

环境模型解释了使得局部过程定义变成模块化编程中实用技巧的两个关键特性:
- 局部过程被绑定在自己的帧中,只在运行时被创建,优于全部绑定在全局变量中的方式
- 局部过程可以轻松访问绑定环境中的参数,因为这是一个对其封闭的过程.

## 对可变的数据进行模块化
主要还是讲一些数据结构,但是使用了新的技术.
### Mutable List Structure
主要是借助set!来实现对List进行可变的操作.下图就是把x的cdr变成y的图片(set-cdr! x y)

![](https://i.loli.net/2018/10/20/5bcaee4fd0b08.png)

### 表示队列
队列的概念和操作就不写了,大致就是用set!来修改队首和队尾来实现一个队列.

![](https://img.alicdn.com/imgextra/i3/581166664/TB27OhWiVXXXXcjXpXXXXXXXXXX_!!581166664.png)

### 表示表格(Tables)
key-value的形式,和字典或者JSON比较相似.

![](https://img.alicdn.com/imgextra/i1/581166664/TB2G54UiVXXXXcNXpXXXXXXXXXX_!!581166664.png)

### 模拟数字电路
这也就是开始提到的使用电子工程师的眼光来看待问题的例子,在课程上老师也讲到了他认为电气系统是最完美的系统.

用与非门来构造一个半加器:

![](https://ws1.sinaimg.cn/large/753800a6ly1fwesz6wx4qj20g705d0te.jpg)
![](https://img.alicdn.com/imgextra/i2/581166664/TB2O48ZiVXXXXcnXpXXXXXXXXXX_!!581166664.png)

数字电路的优势就在于可以使用简单的模块构造出具有复杂功能的模块,然后使用复杂的模块构造出更复杂的模块,比较类似于第一章讲到pair时pair的闭包性质一样.

而数字电路设计的难点就在于信号在电路中的传输是有延迟的.

### 约束传播
在之前我们都把代码组织成单向的计算,而这里就举了一个可以从任何方向来求值的约束传播的例子.

![](https://img.alicdn.com/imgextra/i1/581166664/TB2jEGbiVXXXXXDXpXXXXXXXXXX_!!581166664.png)

而这其实也是一种新的抽象问题的方式.

## 并发:时间是本质问题
> The central issue lurking beneath the complexity of state, sameness, and change is that by introducing assigment we forced to admit time to our computational models.

> what makes this complicated is that more than one process may be trying to manipulate the shared state at the same time.

一个两个人同时从银行中取钱的例子:

![](https://img.alicdn.com/imgextra/i3/581166664/TB2lzajiVXXXXcHXXXXXXXXXXXX_!!581166664.png)

使得事情变得复杂的原因就在于多个进程可以同时操作同一个共享的状态,重要的就是如何**保证操作的原子性**,一种解决的办法就是使用**Serializer**(串行化),也就是类似于锁的机制.

而一旦引入了锁也就会有**deadlock**(死锁)的存在(这里就略过).

### 并发,时间和交流
> The basic phenomenon here is that synchronizing different processes, establishing shared state, or imposing an order on events requires communication among the process.

一旦涉及到并发也就涉及到了通讯的问题,也就是进程之间分享同一个状态的方式,当然这就有很多的取舍可以做了,是要大家都能同时获取状态的变化还是可以延时获取状态的变化,而这个问题到了分布式中就会变得越发的明显,而Hadoop最大的性能瓶颈其实也就是在于网络的IO.

> 从本质上看,在并发控制中,任何时间概念都必然与通信有内在的密切联系.有意思的是,时间与通信之间的这种联系也出现在相对论里,在那里的光速(可能用于同步事件的最快信号)是与时间和空间有关的基本常量.在处理时间和状态时,我们在计算模型领域所遭遇的复杂性,事实上,可能就是物理世界中最基本的复杂性的一种反映.

可能这就是科学的共性吧.虽然感觉有点玄乎,但是这也是SICP的魅力所在吧.

## Streams(流)
> streams are a clever idea that allows one to use sequence manipulations without incurring the cost of manipulating sequence as lists.

简单的说流就是延时求值,也可以说是需求驱动(demand-driven)的,就是你要一个就给你一个,Python中的yield就是这种感觉.

### Infinite Streams
而使用`delay`和`force`来实现延时求值也使得我们可以做一些以前办不到的事,比如一个表示正整数的无穷流:
```
(define (integers-starting-from n)
  (cons-stream n (integers-starting-from (+ n 1))))
(define integers (integers-starting-from 1))
```

### 信号系统中的流
把积分过程看作是一个信号处理系统:
```
(define (integral integrand initial-value dt)
    (define int
        (cons-stream initial-value
            (add-streams (scale-stream integrand dt)
                            int)))
int)
```

![](https://img.alicdn.com/imgextra/i2/581166664/TB2KcaeiVXXXXXtXpXXXXXXXXXX_!!581166664.png)

### 函数式编程的模块化和对象的模块化
如果我们把合并请求交易模块化的话,就像下面这样:

![](https://img.alicdn.com/imgextra/i4/581166664/TB2o7KviVXXXXarXXXXXXXXXXXX_!!581166664.png)

问题在于我们每次都要接收Peter和Paul的请求才能进行一次合并,如果两个人请求的频率相差很大的话,那么频繁请求的人就会堆积很多请求不能处理,而一旦引入显式的同步来保证事件发生顺序的正确性的话,又会引入函数式编程中的一个大问题(因为显式同步引入了赋值和时间,这是函数式编程想避免的):也就是在没有时间这个属性的情况下如何去"公平"的合并两个请求.

# 总结
> We can model the world as a collection of separate, time-bound, interacting objects with state, or we can model the world as a single, timeless, stateless unity.

我们面临的不是编程方法的挑战,而是两种不同的世界观的挑战,看待世界不同的方法导致了OO和FP两种分支,如果两个分支在将来能够融合的话是坠吼的.
> 你问我支不支持,我肯定是支持的

第三章的总结也到此结束了,可以说在SICP的这一段历程是玄幻的和充满乐趣的,这也是这本魔法书的魅力所在吧.而在项目中遇到的包括并发,分布式的问题也增加了对这些CS中基本的问题的思考:
> 吾尝终日而思矣,不如须臾之所学也