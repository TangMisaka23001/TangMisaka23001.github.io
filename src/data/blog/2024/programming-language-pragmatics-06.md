---
title: 《Programming Language Pragmatics》第六章笔记
mathjax: false
tags:
  - 编译器
  - Programming Language Pragmatics
  - 技术
pubDatetime: 2024-07-09T11:45:14.000Z
---
## Control Flow
the language mechanisms used to specify ordering into several categories:
- Sequencing
- Selection
- Iteration
- Procedural abstraction
- Recursion
- Concurrency
- Exception handling and speculation
- Nondeterminacy

### Expression Evaluation
An expression generally consists of either a simple object (e.g., a literal constant, or a named variable or constant) or an operator or function applied to a collection of operands or arguments, each of which in turn is an expression. 

#### Precedence and Associativity
运算符的优先级和结合性

#### Assignments
computation typically consists of an ordered series of changes to the values of variables in memory. **Assignments** provide the principal means by which to make the changes.

##### side effect
Assignment is perhaps the most fundamental **side effect**: while the evaluation of an assignment may sometimes yield a value, what we really care about is the fact that it changes the value of a variable, thereby influencing the result of any later computation in
which the variable appears.

##### References and Values
there are some subtle but important differences in the semantics of assignment in different imperative languages. These differences are often invisible, because they do not affect the behavior of simple programs.

- 值传递和引用传递
- 左值和右值

##### Boxing
基础类型的拆装箱

#### Initialization
There are several reasons, however, why such initial values may be useful:
- 静态变量需要初始化
- 编译器预分配初始化值优化（Java Integer预分配）
- 使用未初始化变量引起的问题

It should be emphasized that initialization saves time **only** for variables that are **statically allocated**. 

If a variable is not given an initial value explicitly in its declaration, the language may specify a **default value**. 

##### Dynamic Checks
Instead of giving every uninitialized variable a default value, a language or implementation can choose to define the use of an uninitialized variable as a **dynamic semantic error**, and can catch these errors at run time. 

##### Definite Assignment
通过控制流分析静态检测未初始化变量：

This notion is based on the control flow of the program, and can be statically checked by the compiler.

##### Constructors
构造器默认初始化：

Many object-oriented languages (Java and C# among them) allow the programmer to define types for which initialization of **dynamically allocated variables occurs automatically**, even when **no initial value is specified in the declaration**.

#### Ordering within Expressions
表达式内求值重要的原因：
- Side effects: 表达式内函数求值副作用
- Code improvement: 求值顺序和编译器优化

#### Applying Mathematical Identities（数学恒等式）
表达式优化影响求值顺序会导致精度问题

#### Short-Circuit Evaluation（短路表达式）
A compiler that performs *short-circuit evaluation* of Boolean expressions will generate code that skips the second half of both of these computations when the overall value can be determined from the first half.

### Structured and Unstructured Flow
汇编中使用的goto（非结构化）编程被高级语言抛弃（结构化编程）

#### Structured Alternatives to goto
Where once a goto might have been used to escape from the middle of a loop, most modern languages provide a **break** or **exit** statement for this purpose.

#### Multilevel Returns
return和 local goto都可以从当前子程序中返回，但是 nonlocal goto会破坏这种情况，如果直接goto到其他子程序中会破坏当前子程序堆栈，还需要立刻加载另一个子程序的堆栈。如果使用return这些都是在执行到return关键字时才发生的。

#### Errors and Other Exceptions
需要Exceptions的原因：
> In a related and arguably more common situation, a deeply nested block or subroutine may discover that it is **unable to proceed with its usual function**, and moreover lacks the contextual information it would **need to recover** in any graceful way. 

As a structured alternative, many modern languages provide an **exception-handling** mechanism for convenient, nonlocal recovery from exceptions.

大多数语言只提供异常机制而不提供从多级调用中直接return的机制（想直接跳出多级调用只能抛异常）。

#### Continuations
The notion of nonlocal gotos that unwind the stack can be generalized by defining what are known as continuations.

call/cc => 控制流变换：

> 在 Scheme 中，假设 call/cc 捕捉到的 current continuation 为 cc(位于 lambda 中)，如果 cc 作为过程 直接或间接地被调用（即给它传值），call/cc 会立即返回，返回值即为传入 cc 的值。即一旦 current continuation 被调用，控制流会跳到 call/cc 处。因此，利用 call/cc，我们可以摆脱顺序执行的限制，在程序中跳来跳去，非常灵活。

### Sequencing
Like assignment, sequencing is central to imperative programming. It is the principal means of controlling **the order in which side effects** (e.g.,assignments) occur

顺序和副作用，无副作用函数可以进行指令重排提升性能。

### Selection

#### Short-Circuited Conditions
虽然if else语句中包含一个布尔表达式，但是通常不需要将其结果解析出来放在寄存器中，而是拆分布尔表达式用来控制代码跳转（通过短路表达式来优化代码）。

#### Case/Switch Statements
if else语句过长时可能会被优化成 switch/case 语句（通过查表来优化代码性能）。

case查表也需要优化性能（如果静态值范围稀疏。。。）

### Iteration
Iteration and recursion are the two mechanisms that allow a computer to perform similar operations repeatedly. 

#### Enumeration-Controlled Loops（for循环）
在编译器生成代码时的一个可能的优化是预先计算迭代次数：`max([last-first+step]/step, 0)`

枚举控制循环的几个设计问题：
1. Can control enter or leave the loop in any way other than through the enumeration mechanism? => break/exit
2. What happens if the loop body modifies variables that were used to compute the end-of-loop bound? => 不允许
3. What happens if the loop body modifies the index variable itself? => 禁止在循环体内自己更新索引
4. Can the program read the index variable after the loop has completed, and if so, what will its value be? => 循环结束后索引值是未定义的

#### Combination Loops
自定义步长的for循环

#### Iterators
- range()
- 对象迭代器
- 惰性迭代流

### Recursion 递归

#### Iteration and Recursion
Iteration is in some sense the more “natural” of the two in imperative languages, because it is based on the repeated modification of variables. 

Recursion is the more natural of the two in functional languages, because it does not change variables.

通常认为迭代比递归更高效，但是编译器优化也可以生成高效的递归代码，特别是尾递归代码的优化（不需要额外生成新的函数堆栈，可以重用当前函数的栈空间）

编译器也可以优化非尾递归代码，转换为尾递归代码执行。

使用递归思想思考代码（没有副作用的递归）可以产生更少的bug。

#### Applicative- and Normal-Order Evaluation
Throughout the discussion so far we have assumed implicitly that arguments are **evaluated before passing them to a subroutine**. This need not be the case. It is possible to **pass a representation of the unevaluated arguments to the subroutine** instead, and to evaluate them only when (if) the value is actually needed.

惰性求值

### Nondeterminacy
不确定的控制流（运行时才能确定）。

### Summary and Concluding Remarks
在本章中，我们介绍了编程语言中发现的主要控制流形式：顺序、选择、迭代、程序抽象、递归、并发、异常处理和推测以及不确定性。顺序指定某些操作按顺序发生，一个接一个。选择表达了在两个或更多控制流替代方案之间的选择。迭代和递归是重复执行操作的两种方式。递归以自身的简单实例定义操作；它依赖于程序抽象。迭代重复一个操作以获得其副作用。顺序和迭代是命令式（特别是冯·诺依曼）编程的基础。递归是函数式编程的基础。不确定性允许程序员故意不指定控制流的某些方面。我们只简要地触及了并发；它将是第12章的主题。程序抽象（子程序）是第8章的主题。异常处理和推测将在第8.5节和第12.4.4节中介绍。

在我们对控制流机制的调查之前，我们讨论了表达式评估。我们考虑了左值和右值之间的区别，以及变量的值模型和引用模型之间的区别，在值模型中，变量是数据的命名容器，在引用模型中，变量是对数据对象的引用。我们考虑了表达式内的优先级、结合性和排序问题。我们检查了短路布尔评估及其通过跳转代码的实现，这既是一个影响表达式正确性的语义问题（其子部分并非总是定义良好），也是一个影响评估复杂布尔表达式所需时间的实现问题。

构造的发展受到了许多目标的驱动，包括编程的便利性、语义的优雅性、实现的便利性和运行时效率。在某些情况下，这些目标被证明是互补的。例如，我们已经看到短路评估既导致更快的代码，也（在许多情况下）导致更清晰的语义。同样地，为枚举控制循环的索引变量引入一个新的局部作用域，避免了循环后索引值的语义问题和（在某种程度上）潜在溢出的实现问题。

在其他情况下，语言语义的改进被认为值得在运行时效率上付出一点小代价。我们在迭代器的发展中看到了这一点：像许多形式的抽象一样，它们在许多情况下增加了适度的运行时成本（例如，与显式嵌入枚举集合的实现到循环的控制流中相比），但却带来了模块化、清晰性和代码重用机会的巨大回报。同样地，Java的开发者会辩称，对于许多应用程序来说，通过广泛的语义检查、标准格式的数值类型等提供的可移植性和安全性远比速度更重要。

在一些情况下，编译器技术的进步或设计者构建更复杂编译器的简单意愿，使得整合曾被认为过于昂贵的功能成为可能。Ada中的案例语句的标签范围要求编译器准备生成采用二进制搜索的代码。C++中的内联函数消除了在微小函数的低效率和宏的混乱语义之间选择的需要。异常（如我们将在第8.5.3节中看到）可以以这样一种方式实现，即在常见情况下（当它们不发生时）不会产生任何成本，但实现相当复杂。迭代器、装箱、泛型（第8.4节）和一级函数同样相当复杂，但在主流命令式语言中越来越常见。

一些实现技术（例如，重新排列表达式以发现公共子表达式，或者在找到可接受的选择后避免在不确定性构造中评估守卫）足够重要，以至于可以证明对程序员施加适度负担是合理的（例如，在必要时添加括号以避免溢出或确保数值稳定性，或确保守卫中的表达式没有副作用）。其他在语义上有用的机制（例如，惰性评估、续体或真正随机的不确定性）通常被认为足够复杂或昂贵，只在特殊情况下才值得使用（如果有的话）。

在相对原始的语言中，我们通常可以通过编程约定获得一些缺失功能的好处。例如，在早期的Fortran方言中，我们可以限制goto的使用，以模仿更现代语言的控制流。在没有短路评估的语言中，我们可以编写嵌套的选择语句。在没有迭代器的语言中，我们可以编写一组提供等效功能的子程序。
