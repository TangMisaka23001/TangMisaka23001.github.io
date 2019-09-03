---
title: '阅读:Test-Driven Development By Example'
mathjax: false
date: 2019-09-03 17:00:13
categories: [笔记]
tags: [TDD, 看书]
---
# Perface
**TDD rules:**
1. write new code only if you first have a failing automated test.
2. eliminate duplication. 消除重复设计

**Technical implications:**
1. design organically: running code providing feedback between decisions.
2. write your own test.
3. development env must provide rapid response to small change.
4. design must be *highly cohesive, loosely coupled components(高内聚,低耦合)* to make **testing easy**.

**Programing order:**
1. Red-write a little that doesn't work.
2. Green-make the test work quickly.
3. Refactor-eliminate all the duplication created.

- 红:写测试
- 绿:写代码通过测试
- 重构:消除重复设计,优化结构

![](https://i.loli.net/2019/09/02/4znXftjkJRSgiYp.jpg)

# Section I: MoneyExample
- a **to-do list** to remind what need to do.
- when write a test,imagine the perfect interface for operation.
- Dependency is the key problem in software development at all scales.
- If you can make steps too small, you can certainly make steps the right size.(为什么测试要足够小)

**TDD cycle:**
1. write a test.
2. make it run.
3. make it right.

the goal is clean code works.

> First we can talk about whether the system should work like this or like that. Once we decide on the correct behavior, we can talk about the best way of achieving that behavior

首先需要考虑系统是怎么样的,确定实现的思路之后就找到最佳的实现办法.(TDD难点:对系统的总体认识和设计)

> That is a risk you actively manage in TDD. We aren’t striving for perfection. By saying everything two ways, as both code and tests, we hope to reduce our defects enough to move forward with confidence.

TDD开发的风险:测试和编码同时进行会引入缺陷.

> The different phases have different purposes. They call for different styles of solution, different aesthetic viewpoints.

不同的阶段所注重的点是不同的,所以在初期设计阶段我们可以忍受重复的设计和复制粘贴代码,一切都是为了尽快完成这个阶段(clean code是重构的任务).