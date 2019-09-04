---
title: MIT-CS6-00课程笔记Lec19-21
date: 2018-06-22 15:53:56
categories: [笔记]
tags: [公开课, CS6.00]
---
[](#Lec19 "Lec19.")Lec19.
=========================

**biased random walks:有偏好的随机运动** 子类继承Drunk并且修改move的规则但是调用父类的move来实现移动.

**polymorphism(多态性)**:继承的优势

在只能在两个相反的方向上走动的随机模拟时,结果不是像想的那样会在原点附近徘徊(其实和四方向同理),所以说在随机事件中,在一系列的随机之后是很难回到初始的状态的,因为当你向某一方向走动一次之后,你的起点就发生了变化,已经不再是原点而是你现在站的点位.

**图像化:**更好的看到结果并且可以对结果进行可视化的分析来判断结果的正确性

**模拟的优势:**生成一个有代表性的样本来进行测试,可以用来模拟真实的问题,但是又比穷举节省了更多的时间和性能.

*   generate a simple of representation scenarios
*   experimental devices
*   description not prescriptive:optimization,描述性
<!-- more -->
[](#Lec20 "Lec20.")Lec20.
=========================

分析问题的分歧:

*   stochastic vs deterministic:确定性问题还是非确定性问题
*   static vs dynamic:在动态的情况下时间变得很重要
*   discrete vs continues:离散 vs 连续

蒙特卡洛:inferential statistics,推论统计(演绎),random smaple tonds to exhisit same properties as the population from which it is drawn:可以从一些简单的样本看到事物中的共同的地方(共性).

[](#Lec21 "Lec21.")Lec21.
=========================

如何选择一个合理的样本对于实验很重要.我们需要知道在选择的样本上进行的实验是否能够很好的模拟问题.  
一个答案是统计可靠的并不代表是正确的答案.==>检查答案和物理现实是不是符合

*   data
*   models that explain data
*   consequence of models

直线拟合:

*   objective function:目标函数
*   least squares fit:最小二乘法

Liner regression:线性回归

*   评估一个拟合:R2
*   并不是越高次的多项式永远是拟合更好的.(过拟合?)
*   closer != better:我们不需要一个模型解释已经测量的数据都出现在哪里,而是需要模型有更好的预测能力,能够更好的解释未知的数据.