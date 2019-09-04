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

消除类冗余的过程:
1. 把子类的公共代码移到父类中.
2. 对父类的其他子类进行简化.
3. 合并equals()函数到父类.

对equals()和hashCode()函数的覆盖和重写过程是发生在重构中的,并且已经有许多的测试来对重构做支撑.

在制造对象的时候使用工厂方法(factory method).

使用工厂模式和合理的构造器参数将重复代码移动到父类中去.

> With the tests you can decide whether an experiment would answer the question faster. Sometimes you should just ask the computer.

在TDD中,重构时由于有足够多的测试来支撑改动所以可以使用测试来迅速验证想法而如果没有测试验证想法就只能依赖思考和论证.

在重构的过程中将子类代码消除后就要将其删除.

使用多态来消除显式的类型判定.

# Section II: Example: xUnit
**对TDD测试的要求:**
- Easy to write for programmers. 易于编写
- Easy to read for programmers. 易于阅读
- Quick to execute. 快速执行
- Order independent. 顺序无关
- Deterministic. 确定的:执行结果不随执行次数变化
- Piecemeal. 零碎(足够小)
- Composable. 可组合:可以以各种组合方式运行测试
- Versionable. 多版本
- A priori. 先验(在代码能运行之前就写好测试)
- Automatic. 自动化
- Helpful when thinking about design. 对系统的设计的思考有帮助(测试先行需要对系统有良好的组织).

> Lots of refactoring has this feel—separating two parts so you can work on the separately. If they go back together when you are finished, fine, if not, you can leave them separate.

> Here is another general pattern of refactoring—take code that works in one instance and generalize it to work in many by replacing constants with variables. 

先用常量进行测试,通过之后将常量位置改为变量就能在更多情况下使用.

**测试模式:**
1. 创建对象
2. 激活(测试)对象
3. 检查结果

**测试的矛盾:**
- Performance 性能:测试的执行要越快越好
- Isolation 隔离:测试之间不要互相耦合并且测试执行不依赖于其执行顺序

# Section III: Patterns
- 自动化测试很重要
- 测试之间相互独立
- 开始编码之前列出测试清单
- 测试优先(测试先行)
- 使用断言
- 使用容易理解的测试数据
- 使测试数据的意图明显


从测试中发现问题:
- 冗长的设置(初始化)代码 -> 对象太大
- 冗余的设置 -> 对象间耦合
- 测试运行时间过长 -> 测试不会被运行或运行有问题

