# PERFACE
TDD rules:
1. write new code only if you first have a failing automated test.
2. eliminate duplication. 消除重复设计

technical implications:
1. design organically: running code providing feedback between decisions.
2. write your own test.
3. development env must provide rapid response to small change.
4. design must be *highly cohesive, loosely coupled components(高内聚,低耦合)* to make **testing easy**.

programing order:
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

TDD cycle:
1. write a test.
2. make it run.
3. make it right.

the goal is clean code works.

