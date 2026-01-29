---
title: 《Programming Language Pragmatics》第九章笔记
mathjax: false
tags:
  - 编译器
  - Programming Language Pragmatics
  - 技术
pubDatetime: 2024-07-17T11:45:14.000Z
---
## Data Abstraction and Object Orientation
### Object-Oriented Programming
he abstraction provided by modules and module types has at least three important benefits:
1. It **reduces conceptual load** by minimizing the amount of detail that the programmer must think about at one time.
2. It provides fault containment by preventing the programmer from using a program component in inappropriate ways, and by limiting the portion of a program’s text in which a given component can be used, thereby limiting the portion that must be considered when searching for the cause of a bug.
3. It **provides a significant degree of independence among program components**, making it easier to assign their construction to separate individuals, to modify their internal implementations without changing external code that uses them, or to install them in a library where they can be used by other programs.

Object-oriented programming can be seen as an attempt to enhance opportunities for code reuse by making it easy to define new abstractions as **extensions or refinements of existing abstractions**. 

- Public and Private Members
- Tiny Subroutines（get set）
- Derived Classes
- General-Purpose Base Classes
- Overloaded Constructors
- Modifying Base Class Methods
- Containers/Collections

### Encapsulation and Inheritance（封装与继承）
Encapsulation mechanisms enable the programmer to **group** data and the subroutines that operate on them together in one place, and to **hide irrelevant details** from the users of an abstraction. 

#### Modules
When the header and body of a module appear in separate files, a change to a module body never requires us to recompile any of the module’s users.

#### Classes
With the introduction of inheritance,object-oriented languages must supplement the scope rules of module-based languages to cover additional issues. 

类之间的可见性讨论

#### Nesting (Inner Classes)
内部类的可见性？

### Initialization and Finalization
Several important issues arise:
- Choosing a constructor
- References and values
- Execution order
- Garbage collection

### Dynamic Method Binding
动态方法绑定会造成开销，动态和静态每个语言的选择不一样，Java选择可以用final来固定一些方法。

Unfortunately, as we shall see in Section 9.4.3, dynamic method binding imposes run-time overhead.While this overhead is generally modest,it is nonetheless a concern for small subroutines in performance-critical applications. Smalltalk, Objective-C, Modula-3, Python, and Ruby use dynamic method binding for all methods. Java and Eiffel use dynamic method binding by default, but allow individual methods and (in Java) classes to be labeled final (Java) or frozen (Eiffel), in which case they cannot be overridden by derived classes, and can therefore employ an optimized implementation.

- Virtual and Nonvirtual Methods
- Abstract Classes
- Member Lookup
- Polymorphism
- Object Closures

### Multiple Inheritance（多重继承）

### Object-Oriented Programming Revisited
we characterized object-oriented programming in terms of three fundamental concepts: encapsulation, inheritance, and dynamic method binding. 
- Encapsulation allows the implementation details of an abstraction to be hidden behind a simple interface.
- Inheritance allows a new abstraction to be defined as an extension or refinement of some existing abstraction,obtaining some or all of its characteristics automatically.
- Dynamic method binding allows the new abstraction to display its new behavior even when used in a context that expects the old abstraction.

### Summary and Concluding Remarks
这是我们关于语言设计的五个核心章节中的最后一个：名称（第3章）、控制流（第6章）、类型（第7章）、子程序（第8章）和对象（第9章）。

我们在第9.1节开始，通过确定面向对象编程的三个基本概念：封装、继承和动态方法绑定。我们还介绍了类、对象和方法的术语。我们已经在第3章的模块中看到了封装。封装允许复杂数据抽象的细节被隐藏在比较简单的接口后面。继承通过使程序员能够轻松定义新的抽象作为现有抽象的细化或扩展，扩展了封装的实用性。继承为多态子程序提供了一个自然的基础：如果一个子程序期望一个给定类的实例作为参数，那么可以使用从预期类派生的任何类的对象来代替（假设它保留了整个现有接口）。动态方法绑定通过安排对参数方法之一的调用在运行时使用与实际对象的类相关联的实现，而不是与参数的声明类相关联的实现，扩展了这种形式的多态性。我们注意到，包括Modula-3、Oberon、Ada 95和Fortran 2003在内的一些语言，通过一种类型扩展机制支持面向对象，其中封装与模块相关联，但继承和动态方法绑定与一种特殊形式的记录相关联。

在后续章节中，我们详细讨论了对象的初始化和终结、动态方法绑定以及（在PLP CD上的）多重继承。在许多情况下，我们发现功能性与一方面的简洁性和执行速度之间存在权衡。将变量视为引用而非值，通常会导致更简单的语义，但需要额外的间接性。垃圾收集，如第7.7.3节前所述，极大地简化了软件的创建和维护，但带来了运行时的成本。动态方法绑定通常要求（在一般情况下）通过vtables或其他查找机制来分派方法。多重继承的简单实现即使未使用也会带来开销。

在多个案例中，我们也看到了时间/空间的权衡。如第8.2.4节先前提到的，内联子程序可以显著提高代码性能，这不仅是通过消除子程序调用本身的开销，还允许寄存器分配、公共子表达式分析以及其他“全局”代码改进在调用间应用。同时，内联扩展通常会增加对象代码的大小。练习9.28和9.30探讨了在实现多重继承中的类似权衡。

尽管Smalltalk缺乏多重继承，但它仍被广泛认为是最纯粹和最灵活的面向对象语言之一。然而，它缺乏编译时类型检查，加上其“基于消息”的计算模型以及对动态方法查找的需求，使得其实现相对较慢。C++，具有对象值变量、默认的静态绑定、最小的动态检查和高质量的编译器，很大程度上负责面向对象编程日益增长的普及性。可靠性、可维护性和代码重用的改进，可能会也可能不会证明Smalltalk的高性能开销是合理的。它们几乎肯定证明了C++的相对适度开销，可能也证明了Eiffel略高的开销。随着软件系统规模的不断增加，互联网上分布式计算的爆炸性增长，以及高度可移植的面向对象语言（Java）、面向对象的脚本语言（Python、Ruby、PHP、JavaScript）和二进制对象标准（.NET [WHA03]、CORBA [Sie96]、JavaBeans [Sun97]）的开发，面向对象编程将在21世纪的计算中显然扮演核心角色。
