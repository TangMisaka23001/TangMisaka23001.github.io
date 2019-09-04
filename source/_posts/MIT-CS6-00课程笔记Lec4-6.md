---
title: MIT_CS6.00课程笔记Lec4-6
date: 2018-06-11 21:17:18
categories: [笔记]
tags: [公开课, CS6.00]
---
[](#Lec4 "Lec4.")Lec4.
======================

*   Decomposition(分解)
*   Abstraction(抽象)

[](#Function "Function")Function
--------------------------------

*   block up into modules
*   suppress detail
*   create “new primitive”(原语)

抽象和规格化在模块化和构造函数时的重要性
<!-- more -->
[](#作用域和值绑定 "作用域和值绑定")作用域和值绑定
-----------------------------

**Interpretes:** -\> golbal binding  
**call function**-\> local table

[](#穷举算法-brute-force-algorithm "穷举算法(brute force algorithm)")穷举算法(brute force algorithm)
----------------------------------------------------------------------------------------

遍历每一种情况找到答案

[](#Recursion-递归 "Recursion(递归)")Recursion(递归)
----------------------------------------------

-\> base case: -simplest possible solution  
-\> induction step: break problem into a simple version

[](#Lec5-amp-Lec6 "Lec5 & Lec6.")Lec5 & Lec6.
=============================================

*   大数
*   浮点数精度
*   浮点数的’==’
*   牛顿法求根号
*   逐次逼近法(guess, check, improve)
*   二分法(Bisection method)
*   回归测试
*   牛顿法和二分法对于求解sqrt问题的复杂度对比: 二分的迭代次数随着x的增加明显增加
*   浮点数的上溢和下溢问题