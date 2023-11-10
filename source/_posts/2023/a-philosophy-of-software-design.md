---
title: 《A Philosophy of Software Design》笔记
mathjax: false
date: 2023-11-10 11:45:14
categories: [技术]
tags: [笔记]
---
## 前言
作者的主要观念是关于系统解耦和信息隐藏，接口抽象就是隐藏不必要的细节防止对外暴露系统内的信息。作者提倡一个系统内的逻辑应该是“深”的而不是“宽”的（非常多的对外接口），这样会对外暴露更多的信息。

其余的内容大多是老生常谈的问题，例如如何写好注释。

这本书的另一个优点是行文简单，纯英文阅读很流畅，值得一读。

> The most fundamental problem in computer science is problem decomposition: how to take a complex problem and divide it up into pieces that can be solved independently.

> Writing computer software is one of the purest creative activities in the history of the human race. Programmers aren’t bound by practical limitations such as the laws of physics; we can create exciting virtual worlds with behaviors that could never exist in the real world. 

> There are two general approaches to fighting complexity, both of which will be discussed in this book.

> The first approach is to eliminate complexity by making code simpler and more obvious.

> The second approach to complexity is to encapsulate it, so that programmers can work on a system without being exposed to all of its complexity at once.

## 复杂性的本质

### 复杂性定义
> Complexity is anything related to the structure of a software system that makes it hard to understand and modify the system.

### 复杂性的症状
- Change amplification（变更放大）
- Cognitive load（认知负担）：开发者需要知道多少相关内容才能完成任务。代码长短并不能代表复杂度，更简单的实现方式可以降低认知负担（代码可能更长）
- Unknown unknowns（不知道还有什么是不知道的）：三个之中这个是最差的症状

> One of the most important goals of good design is for a system to be obvious.

好的系统应该是显而易见的。

### 造成复杂性的原因

> Complexity is caused by two things: dependencies and obscurity.

### 复杂度是逐渐递增的
复杂性不是由一个灾难性的错误导致的，而是大量的小块组成。复杂性的渐进性使其难以控制。

### 结论
复杂性来自依赖和模糊的积累。随着复杂性的增加，会导致变化放大、认知负荷增加以及未知的未知因素。因此，实现每个新功能需要更多的代码修改。此外，开发人员花费更多时间获取足够的信息以确保安全修改，甚至在最糟糕的情况下，他们甚至无法找到所需的所有信息。总之，复杂性使得修改现有代码基础变得困难且风险高。

## 能跑的代码是不够的（战略和战术编程）

### 战术编程
在实现新功能或修复bug时只关注让代码跑起来就行。 这是造成系统复杂度的根源。

### 战略编程
首先需要意识到能work的代码是不够的。为了快速完成当前的任务引入不必要的复杂性是不可接受的。

### 代价
每次付出开发时间的10%-20%来进行战略编程是合理的。

### 总结
天下没有免费的午餐。小错误累计会引发大错误。幸运的是，好的设计最终会证明他自己是值得的。

## 好的模块应该是“深”的

### 抽象
> An abstraction is a simplified view of an entity, which omits unimportant details. 

### Deep modules
对使用者暴露面越小越好

### Classitis(类的炎症)
类不是越小越好，无意义的拆分只会导致额外的复杂度。

### 总结
通过将模块的接口与其实现分离，我们可以将实现的复杂性对系统的其余部分进行隐藏。模块的用户只需要理解接口提供的抽象。在设计类和其他模块时，最重要的问题是使它们深入，这样它们就具有简单的接口用于常见用例，同时仍然提供重要的功能。这最大程度地隐藏了复杂性的量。

## 信息隐藏（和泄露）
> The most important technique for achieving deep modules is information hiding.

> Information hiding reduces complexity in two ways. 

> First, it simplifies the interface to a module. 

> Second, information hiding makes it easier to evolve the system.

### Temporal decomposition(时空分解)
通过功能执行的时间顺序来涉及代码容易导致信息泄露。

> Order usually does matter, so it will be reflected somewhere in the application.

> When designing modules, focus on the knowledge that’s needed to perform each task, not the order in which tasks occur.

### 总结
信息隐藏和深度模块密切相关。如果一个模块隐藏了大量信息，那往往会增加模块提供的功能数量，同时减少其接口。这使得模块更深。相反，如果一个模块没有隐藏太多信息，那么要么它功能不多，要么它的接口复杂；无论哪种情况，该模块都是浅的。在将系统分解为模块时，尽量不要受到运行时操作顺序的影响；这将使您进入时间分解的路径，导致信息泄露和浅层模块。相反，考虑一下执行应用程序任务所需的不同知识片段，并设计每个模块来封装其中的一个或几个知识片段。这将产生一个清晰简洁的设计，其中包含深度模块。

## 为通用目标设计的模块应该更“深”
通用接口相对于特定接口具有许多优势。它们往往更简单，方法更少但更深入。它们还能在类之间提供更清晰的分离，而特定接口往往会在类之间泄露信息。使您的模块具有一定的通用性是减少整个系统复杂性的最佳途径之一。

> One of the most important elements of software design is determining who needs to know what, and when.

### 何时需要一个更通用的模块？
- What is the simplest interface that will cover all my current needs?
- In how many situations will this method be used?
- Is this API easy to use for my current needs? 

## 不同的应用分层有不同的抽象内容

### Pass-through methods（透传的方法）
透传的方法会让模块变“浅”（将下层的方法提供出来，扩大了接口暴露面）。也会让类之间的职责拆分变得模糊。

### 什么时候重复的接口是ok的？
dispatcher（调度器）模式的时候是ok的。

### Decorators（装饰器模式）
> Decorator classes often contain many pass-through methods. 

> Sometimes decorators make sense, but there is usually a better alternative.

### Pass-through variables
使用context（上下文）来代替透传变量。

### 总结
每个添加到系统中的设计基础设施，比如接口、参数、函数、类或定义，都会增加复杂性，因为开发人员必须了解这个元素。为了使一个元素对抗复杂性产生净增益，它必须消除一些在设计元素缺失时会存在的复杂性。否则，最好不使用该特定元素来实现系统。例如，一个类可以通过封装功能来减少复杂性，这样类的使用者就不需要知道这些细节。

“不同层次，不同抽象”的规则只是这个想法的一种应用：如果不同层次具有相同的抽象，比如传递方法或装饰者，那么它们很可能没有提供足够的好处来补偿它们所代表的额外基础设施。同样，传递参数要求每个方法都意识到它们的存在（增加了复杂性），而并没有提供额外的功能。

## Pull Complexity Downwards（复杂度下放）
在开发模块时，要寻找机会多承担一些额外的困难，以减少用户的困难。

> it is more important for a module to have a simple interface than a simple implementation.

## 放在一起更好还是分开？
- Bring together if information is shared
- Bring together if it will simplify the interface
- Bring together to eliminate duplication
- Separate general-purpose and special-purpose code

> Each method should do one thing and do it completely.

## Define Errors Out Of Existence（通过定义来消除错误）
### 为什么异常会增加复杂度
错误处理会链式传递额外的信息。

消除异常处理复杂性的最佳方法是定义您的API，使其不产生需要处理的异常：通过定义消除错误存在的可能性。

ps: Linux设计哲学：没事的时候别乱报错。

> classes with lots of exceptions have complex interfaces, and they are shallower than classes with fewer exceptions.

> reduce the number of places where exceptions have to be handled. 

### Just crash
fail fast机制。

## Design it Twice（设计两次）
> The design-it-twice approach not only improves your designs, but it also improves your design skills. The process of devising and comparing multiple approaches will teach you about the factors that make designs better or worse. Over time, this will make it easier for you to rule out bad designs and hone in on really great ones.

## Why Write Comments? The Four Excuses
一次击破不写注释的四个借口：

### Good code is self-documenting.
接口文档是必须的，描述接口的功能和提供一些示例

> If users must read the code of a method in order to use it, then there is no abstraction: all of the complexity of the method is exposed.

### I don’t have time to write comments
注释先行，理清思路。

### Comments get out of date and become misleading
Code reviews的重要性。 AI生成文档也是一条路。

### All the comments I have seen are worthless
keep yourself simple and stupid.

后面几章都是对注释的啰嗦就不细写了。

- Comments Should Describe Things that Aren’t Obvious from the Code
- Choosing Names
- Write The Comments First

## 一致性（减少心智负担和增加团队规范）
一致性是投资思维的另一个例子。确保一致性需要额外的一些工作：需要努力确定惯例，创建自动检查器，寻找类似情况以在新代码中模仿，并在代码审查中进行团队教育。这项投资的回报是，您的代码将更加明显。开发人员将能够更快速、更准确地理解代码的行为，这将使他们能够更快地工作，减少错误。

## 代码应该是显而易见的
从信息角度来考虑明显性的另一种方式是，如果代码不明显，通常意味着读者缺乏关于代码的重要信息：在 RaftClient 示例中，读者可能不知道 RaftClient 构造函数创建了新的线程；在 Pair 示例中，读者可能不知道 result.getKey() 返回当前期数的数字。

要使代码明显，您必须确保读者始终拥有理解代码所需的信息。您可以通过三种方式实现这一点。最好的方式是减少所需信息的量，使用抽象和消除特殊情况等设计技术。其次，您可以利用读者在其他情境中已经获得的信息（例如，遵循惯例和符合期望），这样读者就不必为了理解您的代码而学习新的信息。第三，您可以在代码中向他们呈现重要信息，使用良好的命名和战略性注释等技术。

## 总结
本书讨论的是一个问题：复杂性。处理复杂性是软件设计中最重要的挑战。它是导致系统难以构建和维护的原因，而且通常也会使系统变得缓慢。在本书中，我试图描述导致复杂性的根本原因，如依赖性和晦涩性。我讨论了可以帮助您识别不必要复杂性的红旗，例如信息泄露、不必要的错误条件或过于通用的名称。我提出了一些通用的思路，可以用来创建更简单的软件系统，比如努力使类深入且通用，将错误定义为不存在，并将接口文档与实现文档分开。最后，我讨论了产生简单设计所需的投资思维。

所有这些建议的缺点在于它们会在项目的早期阶段增加额外的工作量。此外，如果您不习惯思考设计问题，那么在学习良好的设计技术时您会变得更加缓慢。如果对您来说唯一重要的是尽快让您当前的代码运行起来，那么思考设计将会显得像是妨碍您真正目标的苦差事。

另一方面，如果良好的设计对您来说是一个重要目标，那么本书中的理念应该会让编程变得更有趣。设计是一个迷人的谜题：如何用最简单的结构解决特定的问题？探索不同的方法是很有趣的，而且发现既简单又强大的解决方案是一种很棒的感觉。一个清晰、简单和明显的设计是一件美妙的事情。

此外，您在良好设计上所做的投资将很快得到回报。在项目开始阶段精心定义的模块将在以后反复重用时节省您的时间。您六个月前编写的清晰文档将在您返回代码以添加新功能时为您节省时间。您花在磨练设计技能上的时间也将得到回报：随着您的技能和经验的增长，您会发现自己能够越来越快地产生良好的设计。一旦掌握了技巧，良好的设计实际上并不比草率设计花费更多时间。

成为一个优秀的设计师的回报是，您可以将更多的时间花在有趣的设计阶段。糟糕的设计师大部分时间都在追踪复杂而脆弱的代码中的错误。如果您提高了自己的设计技能，不仅能更快地生产出更高质量的软件，而且软件开发过程也会更加愉快。


## Red Flag（坏味道）

### Shallow Module
> A shallow module is one whose interface is complicated relative to the functionality it provides. Shallow modules don’t help much in the battle against complexity, because the benefit they provide (not having to learn about how they work internally) is negated by the cost of learning and using their interfaces. Small modules tend to be shallow.

### Information Leakage
> Information leakage occurs when the same knowledge is used in multiple places, such as two different classes that both understand the format of a particular type of file.

### Temporal Decomposition
> In temporal decomposition, execution order is reflected in the code structure: operations that happen at different times are in different methods or classes. If the same knowledge is used at different points in execution, it gets encoded in multiple places, resulting in information leakage.

### Overexposure
> If the API for a commonly used feature forces users to learn about other features that are rarely used, this increases the cognitive load on users who don’t need the rarely used features.

### Repetition
> If the same piece of code (or code that is almost the same) appears over and over again, that’s a red flag that you haven’t found the right abstractions.

### Special-General Mixture
> This red flag occurs when a general-purpose mechanism also contains code specialized for a particular use of that mechanism. This makes the mechanism more complicated and creates information leakage between the mechanism and the particular use case: future modifications to the use case are likely to require changes to the underlying mechanism as well.

### Conjoined Methods
> It should be possible to understand each method independently. If you can’t understand the implementation of one method without also understanding the implementation of another, that’s a red flag. This red flag can occur in other contexts as well: if two pieces of code are physically separated, but each can only be understood by looking at the other, that is a red flag.

### Nonobvious Code
> If the meaning and behavior of code cannot be understood with a quick reading, it is a red flag. Often this means that there is important information that is not immediately clear to someone reading the code.