---
title: 《Programming Language Pragmatics》第七章笔记
mathjax: false
tags:
  - 编译器
  - Programming Language Pragmatics
  - 技术
pubDatetime: 2024-07-10T11:45:14.000Z
---
## DataTypes
Types serve two principal purposes:
- Types provide implicit context for many operations, so that the programmer does not have to specify that context explicitly. 让编译器知道是整数还是浮点数加减、自定义类型申请正确的堆空间、执行用户自定义的类型构造器（constructor）
- Types limit the set of operations that may be performed in a semantically valid program.

### Type Systems
硬件层面所有bit没有区别：
> Computer hardware can **interpret bits in memory in several different ways**: as instructions, addresses, characters, and integer and floating-point numbers of various lengths. 

高级语言必须使用类型系统来提供某一块bit的类型上下文信息和错误检查（整数加浮点数。。。）
> High-level languages, on the other hand, almost always associate types with values, to provide the contextual information and error checking alluded to above.

a type system consists：
- a mechanism to define types and associate them with certain language constructs
- a set of rules for type equivalence, type compatibility, and type inference. 

#### Type Checking
Type checking is the process of ensuring that a program obeys the language’s type compatibility rules.

几种分类：
- 强类型
- 弱类型
- 静态类型
- 动态类型
- 编译时绑定
- 运行时绑定

#### Polymorphism（多态）
Polymorphism allows a single body of code to work with objects of multiple types.

多态、动态类型会造成运行时消耗并且延迟暴露类型错误

explicit parametric polymorphism（泛型）

#### The Meaning of “Type”
There are at least three ways to think about types, which we may call the *denotational*, *constructive*, and *abstraction-based* points of view. 

- denotational（表示意义）：A value has a given type if it belongs to the set
- constructive（构造）：a type is either one of a small collection of built-in types, or a composite type created by applying a type constructor 
- abstraction-based（基于抽象）：a type is an interface consisting of a set of operations with well-defined and mutually consistent semantics

**Types are domains**, and the meaning of an expression is a value from the domain that represents the expression’s type. 

One of the nice things about the denotational view of types is that it allows us in many cases to describe user-defined composite types.

#### Classification of Types
Most languages provide built-in types similar to those **supported in hardware** by most processors: integers, characters, Booleans, and real (floating-point) numbers.

- Numeric Types
- Enumeration Types
- Subrange Types: 0..100
- Composite Types
  - Records (structures) 
  - Variant records (unions)
  - Arrays
  - Sets
  - Pointers
  - Lists
  - Files

#### Orthogonality（正交性）
Orthogonality is equally important in type system design. A highly orthogonal language tends to be easier to understand, to use, and to reason about in a formal way. 

### Type Checking

#### Type Equivalence
there are two principal ways of defining type equivalence. 
- Structural equivalence is based on the content of type definitions（结构一样就一样）
- Name equivalence is based on the lexical occurrence of type definitions（结构一样换个名字也不一样）

#### Type Compatibility
Most languages do not require equivalence of types in every context. Instead, they merely say that a value’s type must be **compatible** with that of the context in which it appears.

In general, modern compiled languages display a trend toward static typing and away from type coercion.

For systems programming,or to facilitate the writing of general-purpose container (collection) objects (lists, stacks, queues, sets, etc.) that hold references to other objects, several languages provide a universal reference type. 

### Records (Structures) and Variants (Unions)
Record types allow related data of heterogeneous types to be stored and manipulated together.

#### Memory Layout and Its Impact
The fields of a record are usually stored in adjacent locations in memory. In its symbol table,the compiler keeps track of the **offset** of each field within each record type.

#### Variant Records (Unions)
Many allowed the programmer to specify that certain variables (presumably ones that would never be used at the same time) should be allocated “on top of” one another, *sharing the same bytes in memory*.

### Arrays
Arrays are the most common and important composite data types. They have been a fundamental part of almost every high-level language.

接下来的章节包含下面的内容：
- Syntax and Operations
- Dimensions, Bounds, and Allocation
  - Stack Allocation
  - Heap Allocation
- Memory Layout
  - row-major
  - column-major
  - Row-Pointer Layout
  - Address Calculations

### Strings
### Sets
### Pointers and RecursiveTypes
- Dangling References
- Garbage Collection
  - Reference Counts
  - Tracing Collection
  - Mark-and-Sweep
  - Pointer Reversal
  - Stop-and-Copy
  - Generational Collection
  - Conservative Collection

### Lists
### Files and Input/Output
### EqualityTesting and Assignment
### Summary and Concluding Remarks
这一节结束了我们关于语言设计五个核心章节中的第三章（第一部分的名称、控制流、类型、子程序和类）。在前两节中，我们讨论了类型系统和类型检查的一般问题。在剩余的章节中，我们检查了最重要的复合类型：记录和变体、数组和字符串、集合、指针和递归类型、列表和文件。我们注意到类型有两个主要目的：它们为许多操作提供了隐式上下文，使程序员无需明确指定该上下文，并且它们允许编译器捕捉各种常见的编程错误。类型系统包括一组内置类型、定义新类型的机制以及类型等价、类型兼容性和类型推断的规则。类型等价确定两个名称或值何时具有相同的类型。类型兼容性确定何时可以在“期望”另一类型的上下文中使用某一类型的值。类型推断基于其组件的类型或（有时）周围上下文来确定表达式的类型。如果一个语言从不允许对不支持它的对象进行操作，则称该语言为强类型语言；如果一个语言在编译时强制执行强类型，则称该语言为静态类型语言。

在我们关于类型的一般讨论中，我们区分了表示性、构造性和基于抽象的观点，分别从它们的值、它们的子结构以及它们支持的操作来看待类型。我们为常见的内置类型、枚举、子范围以及常见的类型构造器引入了术语。我们讨论了几种不同的类型等价、兼容性和推断方法，包括（在PLP CD上）对ML的推断规则的详细检查。我们还检查了类型转换、强制和非转换类型转换。在类型等价的领域内，我们对比了结构性和基于名称的方法，指出虽然名称等价似乎越来越受欢迎，但结构等价仍有其拥护者。

在我们对复合类型的调查中，我们花了最多的时间在记录、数组和递归类型上。记录的关键问题包括变体记录的语法和语义、整个记录的操作、类型安全以及每个与内存布局的交互。内存布局对数组也很重要，在其中它与形状的绑定时间相互作用；静态、栈和基于堆的分配策略；数值应用中高效的数组遍历；C中指针和数组的互操作性；以及可用的整个数组和基于切片的操作集。

对于递归数据类型，很多都取决于变量/名称的值模型和引用模型之间的选择。递归类型是引用模型的自然结果；使用值模型时，它们需要指针的概念：其值为引用的变量。从实现角度来看，值与引用之间的区别很重要：将内置类型实现为引用是浪费的，因此具有引用模型的语言通常会以不同方式实现内置和用户定义的类型。Java在语言语义中反映了这种区别，要求内置类型采用值模型，用户定义的类类型的对象采用引用模型。

递归类型通常用于创建链接数据结构。在大多数情况下，这些结构必须从堆中分配。在一些语言中，程序员负责释放不再需要的堆对象。在其他语言中，语言运行时系统自动识别并回收这种垃圾。显式释放是对程序员的一种负担，并会导致内存泄漏和悬挂引用的问题。尽管语言实现几乎从不尝试捕捉内存泄漏（参见探索3.32和练习7.36，不过，有一些关于这个主题的想法），但有时会使用墓碑或锁和钥匙来捕捉悬挂引用。自动垃圾回收可能代价高昂，但已被证明越来越受欢迎。大多数垃圾回收技术要么依赖于引用计数，要么依赖于某种形式的递归探索（追踪）当前可访问的结构。这一类别中的技术包括标记-清扫、停止-复制和分代收集。

语言设计的几个领域中，I/O显示出了极大的变化。我们的讨论（主要在PLP CD上）区分了交互式I/O，这往往非常具有平台特定性，以及基于文件的I/O，后者又细分为临时文件，用于单次程序运行中的大量数据，以及用于离线存储的持久文件。文件还细分为那些以二进制形式表示信息的文件，这些文件模仿内存中的布局，以及那些转换为字符基础文本和从字符基础文本转换回来的文件。与二进制文件相比，文本文件通常会产生时间和空间的开销，但它们具有可移植性和人类可读性的重要优势。

在我们对类型的检查中，我们看到了许多语言创新的例子，这些创新有助于提高程序的清晰度和可维护性，而且通常几乎没有或根本没有性能开销。例子包括用户定义类型的原始想法（Algol 68）、枚举和子范围类型（Pascal）、记录和变体的整合（Pascal）以及Ada中子类型和派生类型之间的区别。在第9章中，我们将检查许多人认为过去30年中最重要的创新，即面向对象。

在某些情况下，语言之间的区别不太是进化的问题，而是哲学上的根本差异。我们已经提到了变量/名称的值模型和引用模型之间的选择。同样地，大多数语言采用了静态类型，但Smalltalk、Lisp和许多脚本语言则与动态类型配合得很好。大多数静态类型语言采用了名称等价，但ML和Modula-3则与结构等价配合得很好。大多数语言已经远离了类型强制转换，但C++却接受了它们：结合运算符重载，它们使得在语言本身之外定义简洁、类型安全的I/O例程成为可能。

正如上一章中所看到的，为了简化编译器，或使编译后的程序更小或更快，一种语言的便利性、正交性或类型安全似乎已经受到了妥协。例子包括大多数语言中缺乏对记录的相等性测试，Pascal和Ada要求记录的变体部分位于末尾的要求，许多语言对集合最大尺寸的限制，C语言中缺乏对I/O的类型检查，以及许多语言实现中通常缺乏动态语义检查。我们还看到了几个至少部分是为了高效实现而引入的语言特性的例子。这些包括打包类型、多长度数值类型、with语句、十进制算术和C风格的指针算术。

与此同时，可以看出语言设计者和用户越来越愿意接受语言实现中的复杂性和成本，以改善语义。这里的例子包括Ada的类型安全变体记录；Java和C#的标准长度数值类型；Icon、Java和C#的变长字符串和字符串操作符；Ada中数组边界的后期绑定；以及Fortran 90中丰富的整个数组和基于切片的数组操作。也可以包括ML的多态类型推断。当然，还应该包括自动垃圾回收的趋势。曾经被认为对于生产质量的命令式语言来说太昂贵的垃圾回收，现在不仅在Clu和Cedar等实验性语言中是标准配置，而且在Ada、Modula-3、Java和C#中也是如此。许多这样的特性，包括变长字符串、切片和垃圾回收，已被脚本语言所采纳。
