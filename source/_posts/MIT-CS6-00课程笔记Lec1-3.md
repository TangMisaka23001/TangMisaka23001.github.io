---
title: MIT_CS6.00笔记Lec1-3
date: 2018-06-11 21:13:07
categories: [笔记]
tags: [公开课, CS6.00]
---
[](#计算机科学及编程导论-Lec1 "计算机科学及编程导论  Lec1.")计算机科学及编程导论 Lec1.
--------------------------------------------------------

#### [](#什么是计算思维-computation "什么是计算思维(computation)")什么是计算思维(computation)

#### [](#知识： "知识：")知识：

*   陈述性知识(declarative):描述事实 Ex: 若sqrt(x)=y则y^2=x
*   程序性知识(imperative):对推论过程的描述 Ex:GCD求法
<!-- more -->
#### [](#计算机 "计算机:")计算机:

##### [](#fixed-program-computer-固定程序用来做特定的运算 "fixed-program computer:  固定程序用来做特定的运算")fixed-program computer: 固定程序用来做特定的运算

*   calculator(计算器)
*   Atanasoff(解线性方程组)
*   Turing bombe(破译代码-图灵)

##### [](#stored-program-computer-提供一系列的指令-计算机来执行这些指令-现代计算机模型 "stored-program computer: 提供一系列的指令,计算机来执行这些指令(现代计算机模型)")stored-program computer: 提供一系列的指令,计算机来执行这些指令(现代计算机模型)

**program is a recipe**: given a fixed set of primitives -> can program anything

#### [](#讨论语言的三个维度 "讨论语言的三个维度:")讨论语言的三个维度:

*   **High vs Low:** 离计算机核心有多接近
*   **General vs targetted:** 被设计为通用还是面向目标群体(领域语言)
*   **interpreted vs compiled:** 编译型语言还是解释型语言

**Python**: High,General,Interpreted

##### [](#Syntax-语法-什么是这种语言中的合法表达 "Syntax(语法): 什么是这种语言中的合法表达")Syntax(语法): 什么是这种语言中的合法表达

##### [](#Semantics-语义 "Semantics(语义):")Semantics(语义):

*   **Static**: 那些程序是有意义的
*   **Full**:程序有什么意义(运行时意义)

[](#Lec2 "Lec2.")Lec2.
----------------------

#### [](#程序运行2种方式 "程序运行2种方式:")程序运行2种方式:

> *   Interpret(直接解释)->eval&print
> *   script(存储脚本)-> no print unless explict
>     
>     #### [](#类型检查 "类型检查:")类型检查:
>     
> *   weak vs strong typing
>     
>     #### [](#Typediscipline-代码规范 "Typediscipline(代码规范)")Typediscipline(代码规范)
>     
> *   A:检查运算符或程序来看他们在不同条件下做的操作是什么
> *   B:约束参数的类型
>     
>     #### [](#赋值 "赋值")赋值
> ```python
> x = 3 + 5
> y = 15
> ``` 

*   类型
*   类型转换
*   类型绑定(动态绑定)  
    建议:**Don’t change types arbitrary**

**Variable used any place it’s legal to required**

#### [](#Statements-声明 "Statements(声明):")Statements(声明):

> legal commands that Python can Interpret
> 
> #### [](#直线式-顺序-程序 "直线式(顺序)程序:")直线式(顺序)程序:
> 
> 按照顺序一条条代码执行
> 
> #### [](#分支式-条件-程序 "分支式(条件)程序:")分支式(条件)程序:
> 
> 改变程序执行的顺序通过一些条件Test(一般是变量的值)

[](#Lec3 "Lec3.")Lec3.
----------------------

#### [](#流程图 "流程图")流程图

#### [](#防卫性程序 "防卫性程序")防卫性程序

程序要覆盖所有的可能路径

#### [](#Tuple-一系列有序的元素的集合 "Tuple: 一系列有序的元素的集合")Tuple: 一系列有序的元素的集合

`foo=(1, 2, 3, 4)`