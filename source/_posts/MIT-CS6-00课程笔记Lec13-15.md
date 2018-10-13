---
title: MIT-CS6.00课程笔记Lec13-15
date: 2018-06-18 11:23:20
categories: [笔记]
tags: [公开课, CS6.00]
---
[](#Lec-13-amp-Lec14 "Lec 13. & Lec14.")Lec 13. & Lec14.
========================================================

**Fibnacci:**在递归的方法来计算Fib的时候有非常多的重复的计算->重复子问题->可以优化  
**Overlapping subproblems:**

*   memoization(记忆化):record value 1st time,then look it up subsequently:记录计算的值,在之后的过程中先去查找有没有计算过,如果计算过,就直接使用
*   table lookup(查表)

**Optimal substructure(最优子结构):**Global optimal solution can be contructed from optimal solutions to sub-problems:全局最优解可以被分解成每一个子问题的最优解

**背包问题:(knapsack)**

*   decision tree(决策树): ==> 先序遍历 ==> 复杂度O(2**n)(爆炸增长)
    
    1.  深度左优先树
    2.  回溯
    3.  优化方式==>记忆化:存数组
*   虽然时间和空间复杂度都是O(nS),但是随着n和S的增大,算法的复杂度还是会接近爆炸(伪多项式)
    
*   背包问题的变种:增加约束条件

总结:

*   tarding time for space:基本理念就是空间换时间
*   don’t be intimidated by exponential problems
*   dynamic problems broadly useful:递归问题往往可以使用动态规划来降低复杂度(比最坏的好)
*   **problem reduction**:要有把复杂问题拆分和简单化的思想(important)

[](#Lec15 "Lec15.")Lec15.
=========================

**Module:**collection of related functions

object-oriented programming <==> data abstraction <==> abstract data types

object = collection of data and functions:将数据和操作数据的函数组织在一起(封装,Encapsulation)

**Message passing metaphor**:隐秘消息传递,在OOP的对象传递中包含了消息传递

**Class:**collection of objects with characteristics in common

*   template for creating instances of an object
*   instance has some internal attribues