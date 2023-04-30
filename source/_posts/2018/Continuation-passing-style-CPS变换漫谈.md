---
title: Continuation-passing style--CPS变换漫谈
mathjax: false
date: 2018-10-04 13:46:52
categories: [生活]
tags: [函数式编程, CPS变换]
---
* * *

**Continuations 对于程序设计的意义，就像达芬奇密码对人类历史的意义：即对人类最大秘密的惊人揭示。也许不是，但他在概念上的突破性至少和负数平方根的意义等同**

* * *

看到CPS变换却不是在SICP学习的时候,而是在国庆前一天翻看王垠的[GTF-Great Teacher Friedman](http://www.yinwang.org/blog-cn/2012/07/04/dan-friedman)时,当看到:

> 一个例子就是课程进入到没几个星期的时候，我们开始写解释器来执行简单的 Scheme 程序。然后我们把这个解释器进行 CPS 变换，引入全局变量作为”寄存器” (register)，把 CPS 产生的 continuation 转换成数据结构（也就是堆栈）。最后我们得到的是一个抽象机 (abstract machine)，而这在本质上相当于一个真实机器里的中央处理器（CPU）或者虚拟机（比如 JVM）。所以我们其实从无到有，“发明”了 CPU！从这里，我才真正的理解到寄存器，堆栈等的本质，以及我们为什么需要它们。我才真正的明白了，冯诺依曼体系构架为什么要设计成这个样子。

的时候,被兴趣吸引然后顺手搜索了一下CPS是个什么东西,结果便在这之上消磨了2天的时光,也是做一下总结罢.

[](#What-什么是CPS "What:什么是CPS?")What:什么是CPS?
===========================================

在讨论CPS变换的时候我们在讨论什么,那就要从CPS开始讲起,既然(CPS)被称为一种style,那么可以认为它就是一种编码风格,而CPS变换也就是把我们的代码**格式化**成_Continuation-passing style_的过程.下面是一个关于CPS的解释:

> CPS，是Continuation Passing Style的缩写，它是一种编码风格，函数执行完以后，并不通过返回值，而是调用它自己的Continuation来完成计算。

[](#How-怎么做CPS-变换 "How:怎么做CPS(变换)")How:怎么做CPS(变换)
=================================================

知道了定义之后,就可以开始做CPS变换了,虽然定义很抽象但是在看了几个例子之后还是可以理解这种**书写代码的风格**的.

下面是一个简单的例子(并不对特定的语言讨论,可以看成是伪代码):  
```
// 一般的写法
func add(x, y) = x + y
print add(a,b)

// CPS风格的写法
func add(x, y, fun) = fun(x+y)
add(a, b, print)
```
对上面代码的解释:在一般的写法中我们定义了一个相加函数然后向控制台打印了a+b的结果.而CPS风格的写法是将一个print函数传递给函数add,在执行完add之后将结果**传递**给打印函数然后输出.也可以理解为add函数做完了自己的活之后将结果和控制权交到了print手里然后print输出了结果并返回了,但是print也可以继续传递这个结果给别人.

再举一个阶乘的例子:  
```
// 一般写法
func f(x) = x == 1 ? 1 : x * f(x-1)f(4)

// CPS风格写法
func f(x, k) = x == 1 ? k(1) : f(x-1, lamdba(v):k(v*x))f(4, lamdba(v):v)
```
因为CPS约定：每个函数都需要有一个参数kont，kont是continuation的简写，表示对计算结果的后续处理,而对kont的约定是:kont为一个单参数输入，单参数输出的函数(假定print符合要求).

[](#Why-为什么需要CPS变换 "Why:为什么需要CPS变换")Why:为什么需要CPS变换
==================================================

在例子中可以看到CPS的主要的功能就是:**在一个函数执行结束之后,将返回值交给下一个函数**,但是到现在为止,有一个很明显的问题是显而易见的,那就是我们可能会写出一个很长的函数调用串.也就是说这个看上去只是花哨了一点的代码风格在没有优势的情况下还带来了缺点,所以下面就整理一下我在浏览时看到的CPS的使用和优势(这个缺点其实不致命因为可以通过语法糖来解决).

[](#执行顺序 "执行顺序")执行顺序
--------------------

来考虑这样一个问题,现在我们有2行代码:  
```
print "enter something"
getInput()
```
很简单,在终端产生一个提示并且获取用户的下一个输入,但是问题是:我们不能保证代码执行的顺序,它们执行的顺序完全取决于编译器怎么安排.那么让我们来用CPS重写一下:  
`print ("enter something", getInput())`

结果是很明显的,我们可以用这种方法来强制决定函数的执行顺序,这一点在函数式编程中是很重要的.当然在并发中,这也可能会有点用(没深究).

[](#堆栈 "堆栈")堆栈
--------------

来考虑一下阶乘函数的调用链:  
```
// 一般写法
f(4) ==> 4*f(3) ==> 4*3*f(2) ==> 4*3*2*f(1) ==> 4*3*2*1

// CPS风格写法
f(4) = f(3, lamdba(v):(v*4))     
     = f(2, lamdba(v):(lamdba(v):(v*4)(v*3)))     
     = ...

改写之后可以化简为:v = 1 ==> 2*v ==> 3*v ==> 4*v ==> v
```
可以看到,第一种递归就是经典的递归模型,每次递归调用自己的时候都需要将当前的函数状态入栈然后进入到下一个函数中直到到递归终止情况然后逐一向上返回结果最后得出答案.**但是**在第二种CPS风格中,我们可以看到状态是顺序的,计算是从1开始向后乘到4然后返回,这是因为**k承载了每次计算的结果并向后传递**,也就是说我们不需要保存函数当前的状态而可以直接调用下一个函数,也就是说**CPS变换将普通递归函数变成了尾递归**.可以这么理解:递归中的保存状态的栈和kont函数是**等价**的,并且kont函数还有一个优势:**因为kont函数可以被显示调用,也就是说我们可以在任意时刻任意情况下,调用函数的某一时刻的状态,只要它是CPS风格的!!**

下面给出一段博客的引用,可能解释的更清楚:

> 这样我们就知道了什么是“当前 continuation”。它有什么意义？一旦我们得到了当前的 continuation 并将它保存在某处，我们就最终将程序当前的状态保存了下来——及时地冷冻下来。这就像操作系统进入休眠状态。一个 continuation 对象里保存了从我们获得它的地方重新启动程序的必要信息。操作系统在每次发生线程间的上下文切换时也是如此。唯一的区别是它保留着全部控制。请求一个 continuation 对象（在 Scheme 里，可以调用 call-with-current-continuation 函数）后，你就会获得一个包括了当前 continuation 的对象，也就是堆栈信息（在 CPS 程序里就是下一个要调用的函数），可以把这个对象保存在一个变量（或者是磁盘）里。当你用这个 continuation “重启”程序时，就会转回到你取得这个对象的那个状态，这就象切换回一个被挂起的线程或唤醒休眠的操作系统，区别是用 continuation，你可以多次地重复这一过程，而当操作系统被唤醒时，休眠信息就被销毁了，如果那些信息没有被销毁，你也就可以一次次地将它唤醒到同一点，就象重返过去一样。有了 continuation 你就有了这个控制力！

### [](#应用-消除JS回调地狱 "应用:消除JS回调地狱")应用:消除JS回调地狱

虽然还没有完整的学过JS和前端的技术,但是在学Django的过程中接触到的一些简短的JS也觉得这门语言”似乎”有很多的缺陷(个人感觉,主要是感觉各种{({()})}嵌套确实不够优雅),但是JS又确实是一门经常被拿来讨论一些FP问题的语言(可能因为JS支持函数作为first-class还能在浏览器直接运行的原因吧).在看CPS的过程中也看到了关于JS回调地狱的问题.

#### [](#回调地狱 "回调地狱")回调地狱

先来丢一段js代码:  
```js
fs.readdir(source, function (err, files) {  
    if (err) {    
        console.log('Error finding files: ' + err)  
    } else {    
        files.forEach(function (filename, fileIndex) {      
            console.log(filename)      
            gm(source + filename).size(function (err, values) {        
                if (err) {          
                    console.log('Error identifying file size: ' + err)        
                } else {          
                    console.log(filename + ' : ' + values)          
                    aspect = (values.width / values.height)          
                    widths.forEach(function (width, widthIndex) {            
                        height = Math.round(width / aspect)            
                        console.log('resizing ' + filename + 'to ' + height + 'x' + height)            
                        this.resize(width, height).write(dest + 'w' + width + '_' + filename, function(err) {              
                            if (err) console.log('Error writing file: ' + err)            
                        })          
                    }.bind(this))        
                }      
            })    
        })  
    }
})
```
#### [](#解决方案 "解决方案")解决方案

当然这一堆括号和大括号看着很让人抓狂而且也很难马上掌握执行的顺序,当然这里不会来优化这段代码(我不会,哈哈),来看一个简单的例子:  
```js
// 第一次ajax，查询出id
$.get('http://xxx/user?name=jxy', function(data){  
    var id = data.id;  
    // 第二次ajax，根据id查询出需要的数据  
    $.get('http://xxx/another?id='+id, function(data){    
        // 这里才是真正的处理逻辑    
        // do something...    
    });
});
```
用async/await优化之后可以变成(据说是**终极解决方案**):  
```js
// 伪代码
// 用async修饰一个函数
async function getData(){  
    // 用await标记异步操作，会自动等待异步操作执行完毕之后再继续向下执行  
    const user = await $.get('http://xxx/user?name=jxy');  
    const id = user.id;  
    const data = await $.get('http://xxx/another?id='+id);  
    // 真正处理data  
    // do something...
};
getData();
```
关于async/await或者说协程,讨论起来又是无止境的了,但是基本的思想和CPS很吻合,也就是我们需要在切换上下文的时候如何来保存状态和恢复之前的状态.而js的async/await其实也只是function*+yield的一个语法糖而已,其核心就是不断的将 yield 的 next 值追加到 promise 链中，达到“一步接一步”执行的效果.

在看资料的时候还看到github上有一个[Continuation.js](https://github.com/BYVoid/continuation)项目,是直接使用CPS来解决回调地狱问题的,给出的例子如下:

原始js代码:  
```js
function textProcessing(callback) {  
    fs.readFile('somefile.txt', 'utf-8', function (err, contents) {    
        if (err) return callback(err);    
        //process contents    
        contents = contents.toUpperCase();    
        fs.readFile('somefile2.txt', 'utf-8', function (err, contents2) {      
            if (err) return callback(err);      
            contents += contents2;      
            fs.writeFile('somefile_concat_uppercase.txt', contents, function (err) {        
                if (err) return callback(err);        
                callback(null, contents);      
            });    
        });  
    })
;}
textProcessing(function (err, contents) {  
    if (err)    
    console.error(err);
});
```
使用Continuation.js之后:  
```js
function textProcessing(ret) {  
    fs.readFile('somefile.txt', 'utf-8', cont(err, contents));  
    if (err) return ret(err);  
    contents = contents.toUpperCase();  
    fs.readFile('somefile2.txt', 'utf-8', 
    cont(err, contents2));  
    if (err) return ret(err);  
    contents += contents2;  
    fs.writeFile('somefile_concat_uppercase.txt', contents, cont(err));  
    if (err) return ret(err);  
    ret(null, contents);
}
textProcessing(cont(err, contents));
if (err)  
    console.error(err);
```
至少,看起来确实优雅了很多.

### [](#应用-Web应用 "应用:Web应用")应用:Web应用

试想这么一个场景:用户向服务器请求了一张表单比如是注册,然后用户在网页上进行了一系列的操作之后提交了这张表单,注册成功.

在开发的过程中,一般来说我们要写一个getForm的方法来响应请求表单和postFrom的方法来响应提交表单.但是如果我们用CPS来思考这个问题呢?就会变成下面这样:用户申请了一张表单,我们生成一个函数来处理它,然后将这个函数保存起来,等到用户提交的时候,我们再调用这个函数将参数给它就可以完成注册.

在这个场景中的优势就是,我们不需要分离get和post逻辑,因为这其实都是属于用户注册这个过程中的事,而且,因为continuation可以在任何时候被调用而且不止调用一次(只要被保存了),那么优势就很明显了,我们只要缓存continuation环境,就可以节省很多的服务器性能.

我相信在web上,这个理念迟早会流行,毕竟**计算机中十年不变的东西就是各种语言正在发布的新特性**(hhh).

### [](#应用-JavaFlow "应用:JavaFlow")应用:JavaFlow

这只是在Google的过程中搜到的一个算是副产物吧,但是也在这里记录一下,大致就是可以在Java里使用[JavaFlow](http://commons.apache.org/sandbox/commons-javaflow/tutorial.html)来实现continuation.  
```java
class MyRunnable implements Runnable {  
    public void run() {    
        System.out.println("started!");    
        for( int i=0; i<10; i++ )      
            echo(i);  
    }  
    private void echo(int x) {    
            System.out.println(x);    
            Continuation.suspend();  
    }
}
Continuation c = Continuation.startWith(new MyRunnable());
System.out.println("returned a continuation");
```
然后就可以调用c了:  
```
Continuation d = Continuation.continueWith(c);
System.out.println("returned another continuation");
```
[](#自动CPS变换 "自动CPS变换")自动CPS变换
-----------------------------

之所以将其放在最后,是因为我也还没有时间将其搞懂,而且**似乎**对于理解CPS变换来说影响并不大,这里就先暂时用一张图来代替吧(王垠40行代码的注释版)

![](https://i.loli.net/2018/10/13/5bc1d0edaa208.jpg)

[](#参考博客 "参考博客")参考博客
--------------------

[GTF - Great Teacher Friedman](http://www.yinwang.org/blog-cn/2012/07/04/dan-friedman)

[CPS变换与CPS变换编译](https://zhuanlan.zhihu.com/p/22721931)

[CPS的地位](https://thzt.github.io/2015/05/23/role-of-cps/)

[基于CPS变换的尾递归转换算法](https://www.bbsmax.com/A/obzbXnOy5E/)

[函数式编程与Continuation/CPS](http://www.nowamagic.net/academy/detail/1220553)

[用 continuation 开发复杂的 Web 应用程序](https://www.ibm.com/developerworks/cn/java/j-contin.html)

[时间倏忽而逝](http://jxy.me/2017/01/15/2017-and-redux/)

还有一篇文章先留个档,有时间再消化:  
[Representing Control—A Study of the CPS transformation](http://dotat.at/tmp/danvy-filinski-mscs92.pdf)