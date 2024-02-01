---
title: 《Programming Language Pragmatics》第三章笔记
mathjax: false
date: 2024-01-29 11:45:14
categories: [技术]
tags: [编译器, 'Programming Language Pragmatics']
---
## Names, Scopes, and Bindings
A name is a mnemonic character string used to represent something else.

Names allow us to refer to variables, constants, operations, types, and so on using symbolic identifiers rather than low-level concepts like addresses.

Subroutines are control abstractions.

Classes are data abstractions.

### The Notion of Binding Time
the notion of binding time, which refers not only to the binding of a name to the thing it represents, but also in general to the notion of resolving any design decision in a language implementation.

通常，早期绑定时机与更高的效率相关，而后期的绑定时机与更大的灵活性相关。

不同的东西的绑定时机是不一样的：
- Language design time：控制流结构，基本类型，复杂对象组织方法等语义方面的内容
- Language implementation time：基础类型大小，和操作系统交互，堆和栈的组织方式和大小
- Program writing time：算法，数据结构，命名
- Compile time：高级数据结构和机器码的映射，静态数据的内存布局
- Link time：引用其他的模块的绑定关系到链接时才能确定（增量编译）
- Load time：程序装载时才能确定实际的地址（虚实地址转换）
- Run time：变量值绑定，程序启动时机，模块装载时机，首次“看到”声明的时机，子程序调用时机，代码块进入时机，表达式求值、语句执行时机

Compiler-based language implementations tend to be more efficient than interpreter-based implementations because they make earlier decisions. 

### Object Lifetime and Storage Management
The period of time between the creation and the destruction of a name-to-object binding is called the binding’s lifetime. 

生命周期管理不正确肯能会导致“悬挂指针”

对象的生命周期取决于存储分配机制（对象空间）：
- 静态对象（绝对地址）
- 栈对象（栈上分配，通常在子程序调用）
- 堆对象（随时分配）

#### Static Allocation
Global variables are the obvious example of static objects, but not the only one.

Numeric and string-valued constant literals are also statically allocated.

Finally, most compilers produce a variety of tables that are used by run-time support routines for debugging, dynamic type checking, garbage collection, exception handling, and other purposes; these are also statically allocated.

Manifest constants can always be allocated statically, even if they are local to a recursive subroutine: multiple instances can share the same location.

#### Stack-Based Allocation
If a language permits recursion, static allocation of local variables is no longer an option. 

Fortunately, the natural nesting of subroutine calls makes it easy to allocate space for locals on a stack.

Each instance of a subroutine at run time has its own frame (also called an activation record) on the stack, containing arguments and return values, local variables, temporaries, and bookkeeping information. 

#### Heap-Based Allocation
A heap is a region of storage in which subblocks can be allocated and deallocated at arbitrary times.

Heaps are required for the dynamically allocated pieces of linked data structures, and for objects such as fully general character strings, lists, and sets, whose size may change as a result of an assignment statement or other update operation.

The principal concerns are speed and space, and as usual there are tradeoffs between them. 

堆内存管理方法：
- With a **first fit** algorithm we select the first block on the list that is large enough to satisfy the request.
- With a **best fit** algorithm we search the entire list to find the smallest block that is large enough to satisfy the request.

两者的对比：

Intuitively, one would expect a best fit algorithm to do a better job of reserving large blocks for large requests. At the same time, it has **higher allocation cost** than a first fit algorithm, because it must always search the entire list, and it tends to result in a larger number of very small “left-over” blocks.

##### 内存管理存在的问题：

内存分配效率和堆最小大小有关（多次申请）：

In effect, the heap is divided into “pools,” one for each standard size. The division may be static or dynamic. Two common mechanisms for dynamic pool adjustment are known as the **buddy system** and the **Fibonacci heap**.

内存碎片问题：

The problem with external fragmentation is that the ability of the heap to satisfy requests may degrade over time.

#### Garbage Collection
The run-time library for such a language must then provide a garbage collection mechanism to identify and reclaim unreachable objects.

手动 vs 自动：
- The traditional arguments in favor of explicit deallocation are implementation simplicity and execution speed.
- manual deallocation errors are among the most common and costly bugs in real-world programs.

### Scope Rules
The textual region of the program in which a binding is active is its scope. In most modern languages, the scope of a binding is determined statically, that is, at compile time.

作用域分为：
- statically scoped: compile time
- dynamically scoped: bindings depend on the flow of execution at run time

At any given point in a program’s execution, the set of active bindings is called the current **referencing environment**. The set is principally determined by static or dynamic scope rules.

binding rules:
- deep binding: the choice is made when the reference is first created
- shallow binding: the choice is made when the reference is finally used

#### Static Scoping
In a language with static (lexical) scoping, the bindings between names and objects can be determined at compile time by examining the text of the program, without consideration of the flow of control at run time. 

#### Nested Subroutines
a name that is introduced in a declaration is known in the scope in which it is declared, and in each internally nested scope, unless it is hidden by another declaration of the same name in one or more nested scopes. 

To find the object corresponding to a given use of a name, we look for a declaration with that name in the **current, innermost scope**. If there is one, it defines the active binding for the name. Otherwise, we look for a declaration in the **immediately surrounding scope**.

A name-to-object binding that is hidden by a nested declaration of the same name is said to have a hole in its scope.

作用域解析运算符：

In others, the programmer can access the outer meaning of a name by applying a qualifier or **scope resolution operator**.

#### Declaration Order
Put another way, can an expression E refer to any name declared in the current scope, or only to names that are declared before E in the scope?

Several early languages, required that all declarations appear at the beginning of their scope.

C++ and Java further relax the rules by dispensing with the define-before-use requirement in many cases. In both languages, members of a class (including those that are not defined until later in the program text) are **visible inside all of the class’s methods**.

##### Declarations and Definitions
如何处理两个类互相包含彼此？

Recursive types and subroutines introduce a problem for languages that require names to be declared before they can be used: how can two declarations each appear before the other?

- A declaration introduces a name and indicates its scope, but may omit certain implementation details. 
- A definition describes the object in sufficient detail for the compiler to determine its implementation.

#### Modules
模块化和信息隐藏，减少认识负荷：

This modularization of effort depends critically on the notion of **information hiding**, which makes objects and algorithms invisible, whenever possible, to portions of the system that do not need them. 

#### Module Types and Classes
An alternative solution to the multiple instance problem appeared in Euclid, which treated each module as a type. Given a module type, the programmer could declare an arbitrary number of similar module objects. 


#### Dynamic Scoping
In a language with dynamic scoping, the bindings between names and objects depend on the flow of control at **run time**, and in particular on the order in which subroutines are called. 

为什么动态作用域到运行时才能确定？

Because the flow of control cannot in general be predicted in advance, the bindings between names and objects in a language with dynamic scoping cannot in general be determined by a compiler.

### Implementing Scope
To keep track of the names in a statically scoped program, a compiler relies on a data abstraction called a **symbol table**.

In a language with dynamic scoping, an interpreter (or the output of a compiler) must perform operations analogous to symbol table **insert and lookup at run time**.

### The Meaning of Names within a Scope
A name that can refer to more than one object at a given point in the program is said to be overloaded. Overloading is in turn related to the more general subject of polymorphism.

- `aliases`: Two or more names that refer to the same object at the same point in the program are said to be aliases. 
- `overloaded`: A name that can refer to more than one object at a given point in the program is said to be overloaded
- Redefining Built-in Operators

### The Binding of Referencing Environments
When should scope rules be applied to such a subroutine: **when** the reference is first created, or **when** the routine is finally called?

动态作用域常使用 shallow binding：

This late binding of the referencing environment of a subroutine that has been passed as a parameter is known as **shallow binding**. 

静态作用域常使用 deep binding：

It therefore makes sense to bind the environment at the time the routine is first passed as a parameter, and then restore that environment when the routine is finally called.

This early binding of the referencing environment is known as **deep binding**.

#### Subroutine Closures
Deep binding is implemented by creating an explicit representation of a referencing environment (generally the one in which the subroutine would execute if called at the present time) and bundling it together with a reference to the subroutine. The bundle as a whole is referred to as a **closure**. 

#### Object Closures
An object that plays the role of a function and its referencing environment may variously be called an *object closure*, a function object, or a functor.

### Macro Expansion
Prior to the development of high-level programming languages, assembly language programmers could find themselves writing **highly repetitive code**. To ease the burden, many assemblers provided sophisticated macro expansion facilities.

So-called **hygienic macros(卫生宏)** implicitly encapsulate their arguments, avoiding unexpected interactions with associativity and precedence. 

### Summary and Concluding Remarks
这一章讨论了名称的主题，以及名称与对象的绑定（在广义上）。我们开始从绑定时间的一般讨论——名称与特定对象关联的时间，或更一般地说，任何开放问题在语言或程序设计或实现中与答案关联的时间。我们定义了对象和名称到对象绑定的生命周期的概念，并指出它们不必相同。然后，我们介绍了三种主要的存储分配机制——静态、栈、和堆——用于管理对象的空间。

在3.3节中，我们描述了名称与对象的绑定是如何受作用域规则的约束。在一些语言中，作用域规则是动态的：一个名称的含义是在最近进入的包含声明且尚未退出的作用域中找到的。然而，在大多数现代语言中，作用域规则是静态的，或者说是词法的：一个名称的含义是在最近的包含声明的词法环绕作用域中找到的。我们发现，词法作用域规则在不同语言之间以重要但有时是微妙的方式变化。我们考虑了哪些类型的作用域是允许嵌套的，作用域是开放的还是封闭的，一个名称的作用域是否包括其声明的整个块，以及是否必须在使用名称之前声明它。我们在3.4节探索了作用域规则的实现。

在3.5节中，我们检查了绑定之间关系的几种方式。别名产生于当在给定作用域中两个或更多名称绑定到同一个对象时。重载产生于一个名称绑定到多个对象时。我们注意到，尽管有时可以通过强制转换或多态性实现类似重载的行为，但底层机制实际上是非常不同的。在3.6节中，我们考虑了何时将引用环境绑定到作为参数传递、从函数返回或存储在变量中的子程序的问题。我们的讨论涉及了闭包和lambda表达式的概念，这两者在后续章节中都会反复出现。在3.7节和3.8节中，我们考虑了宏和分离编译。

词法作用域的一些更复杂的方面说明了对数据抽象的语言支持的发展，这是我们将在第10章回顾的主题。我们首先描述了像Fortran、Algol 60和C这样的语言中的own或静态变量，这些变量允许子程序中的局部变量在一次调用到下一次调用时保持其值。然后我们注意到，简单模块可以被看作是一种使长期存在的对象对一组子程序局部化的方式，这样它们对程序的其他部分来说是不可见的。通过选择性地导出名称，一个模块可以作为一个或多个抽象数据类型的“管理者”。在更高一层的复杂性中，我们注意到有些语言将模块视为类型，允许程序员创建由模块定义的抽象的任意数量的实例。最后，我们注意到面向对象语言通过提供一个继承机制，这个机制允许定义新的抽象（类）作为现有类的扩展或精化，从而扩展了模块作为类型的方法（以及词法作用域的概念）。

在本章考虑的主题中，我们看到了一些有用的特性的例子（递归、静态作用域、前向引用、一级子程序、无限范围），这些特性因为担心实现的复杂性或运行时成本而被某些语言省略。我们还看到了一个特性的例子（模块规范的私有部分），它是为了方便语言的实现而特别引入的，以及另一个（C语言中的独立编译）其设计显然是为了反映特定的实现。在语言设计的几个额外方面（晚绑定与早绑定、静态与动态作用域、对强制转换和转换的支持、对指针和其他别名的容忍），我们看到实现问题起着重要作用。

在类似的脉络中，看似简单的语言规则可能会有出人意料的含义。例如，在3.3.3节中，我们考虑了整个块作用域与名字必须在使用前声明的要求之间的相互作用。就像Fortran的do循环语法和空白规则（2.2.2节）或Pascal的if...then...else语法（2.3.2节），如果选择不当，作用域规则会使程序分析变得困难，这不仅对编译器如此，对人类同样如此。在未来的章节中，我们将看到几个既令人困惑又难以编译的特性示例。当然，语义的实用性和实现的容易程度并不总是一致的。许多容易编译的特性（例如，goto语句）其价值至少是值得怀疑的。我们还将看到几个非常有用且（概念上）简单的特性，比如垃圾收集（8.5.3节）和统一（7.2.4节，C 7.3.2节和12.2.1节），它们的实现却相当复杂。