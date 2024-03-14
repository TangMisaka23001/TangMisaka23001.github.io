---
title: 《Programming Language Pragmatics》第四章笔记
mathjax: false
date: 2024-03-14 11:45:14
categories: [技术]
tags: [编译器, 'Programming Language Pragmatics']
---
## Semantic Analysis
semantics concerns its **meaning**. Meaning is important for at least two reasons: it allows us to enforce rules (e.g., type consistency) that go beyond mere form, and it provides the information we need in order to generate an equivalent output program.

Semantic rules are further divided into *static* and *dynamic* semantics

Both semantic analysis and intermediate code generation can be described in terms of annotation, or **decoration of a parse tree or syntax tree**. 

**Attribute grammars** provide a formal framework for the decoration of a tree. This framework is a useful conceptual tool even in compilers that do not build a parse tree or syntax tree as an explicit data structure. 

### The Role of the Semantic Analyzer
The role of the semantic analyzer is to enforce all static semantic rules and to annotate the program with information needed by the intermediate code generator. 

#### Dynamic Checks
Many compilers that generate code for dynamic checks provide the option of disabling them if desired.

#### Assertions
The compiler then generates code to check the assertions at run time. An assertion is a statement that a specified condition is expected to be true when execution reaches a certain point in the code. 

#### Static Analysis
In general, compile-time algorithms that predict run-time behavior are known as static analysis.

static analysis may enable code improvement:
- alias analysis
- escape analysis
- subtype analysis

### Attribute Grammars
To tie these expressions to mathematical concepts (as opposed to, say, floor tile patterns or dance steps), we need additional notation. The most common is based on attributes.

In a compiler or interpreter for a full programming language, the attributes of tree nodes might include:
- for an identifier, a reference to information about it in the symbol table
- for an expression, its type
- for a statement or expression, a reference to corresponding code in the compiler’s intermediate form
- for almost any construct, an indication of the file name, line, and column where the corresponding source code begins
- for any internal node, a list of semantic errors found in the subtree below

### Evaluating Attributes
The process of evaluating attributes is called annotation or decoration of the parse tree.

#### Synthesized Attributes 合成属性
synthesized attributes: their values are calculated (synthesized) only in productions in which their symbol appears on the left-hand side.

#### Inherited Attributes
In general, we can imagine (and will in fact have need of) attributes whose values are calculated when their symbol is on the right-hand side of the current production. Such attributes are said to be inherited.

#### Attribute Flow
they define a set of valid trees, but they don’t say how to build or decorate them.

the order in which attribute rules are listed for a given production is immaterial; attribute flow may require them to execute in any order.

An algorithm that decorates parse trees by invoking the rules of an attribute grammar in an order consistent with the tree’s attribute flow is called a **translation scheme**. 

#### One-Pass Compilers
A compiler that interleaves semantic analysis and code generation with parsing is said to be a one-pass compiler

### Action Routines
An ad hoc translation scheme that is interleaved with parsing takes the form of a set of action routines. 

An action routine is a semantic function that the programmer (grammar writer) instructs the compiler to execute at a particular point in the parse.

### Space Management for Attributes
If we are building an explicit parse tree, then the obvious approach is to store attributes in the nodes of the tree themselves. 

For a bottom-up parser with an S-attributed grammar, the obvious approach is to maintain an **attribute stack**

For a top-down parser with an L-attributed grammar, we have two principal options:
- uses an attribute stack
- “shortcutting” copy rules

### Tree Grammars and Syntax Tree Decoration
attribute grammars can also be used to decorate syntax trees.

### Summary and Concluding Remarks
本章讨论了语义分析的任务。我们回顾了可以分类为语法、静态语义和动态语义的语言规则类型，并讨论了是否生成代码以执行动态语义检查的问题。我们还考虑了语义分析器在典型编译器中的作用。我们指出，静态语义规则的执行和中间代码的生成都可以用解析树或语法树的注释或装饰来表达。然后，我们提出了属性文法作为这个装饰过程的形式化框架。

属性文法将属性与上下文无关文法或树文法中的每个符号关联，并将属性规则与每个产生式关联起来。在上下文无关文法中，综合属性只在其符号出现在产生式的左侧时计算。标记的综合属性由扫描器初始化。继承属性在其符号出现在右侧的产生式中计算；它们允许符号下子树中的计算依赖于符号出现的上下文。起始符号（目标）的继承属性可以表示编译器的外部环境。严格来说，属性文法只允许复制规则（一个属性分配给另一个属性）和对语义函数的简单调用，但我们通常放宽这一限制，以允许在某些现有编程语言中使用更多或更少任意的代码片段。

就像上下文无关文法可以根据可以使用它们的解析算法进行分类一样，属性文法可以根据其属性流模式的复杂性进行分类。在S-属性文法中，所有属性都是综合的，可以自然地在解析树上进行单次自底向上遍历，按照LR族解析器发现树的顺序精确计算。在L-属性文法中，所有属性流都是深度优先从左到右的，可以按照LL族解析器预测和匹配解析树的顺序精确计算。具有更复杂属性流模式的属性文法通常不用于生成编译器的解析树，但对于基于语法的编辑器、增量编译器和其他各种工具非常有价值。

虽然可以构建自动工具来分析属性流并装饰解析树，但大多数编译器依赖于动作例程，编译器编写者将这些例程嵌入到产生式的右侧，以在解析的特定点评估属性规则。在LL族解析器中，动作例程可以嵌入到产生式右侧的任意点。在LR族解析器中，动作例程必须遵循产生式的左角。自底向上编译器中的属性空间自然地与解析栈并行分配，但这使得继承属性的管理变得复杂。自顶向下编译器中的属性空间可以自动分配，或由动作例程的编写者显式管理。自动方法具有规律性的优势，并且更易于维护；而临时方法略快且更灵活。

在单遍编译器中，扫描、解析、语义分析和代码生成在对输入的单次遍历中交替进行。语义函数或动作例程负责所有的语义分析和代码生成。更常见的做法是，动作例程仅构建一个语法树，然后在后续的单独遍历中对其进行装饰。这些遍历的代码通常是手工编写的，以相互递归的子程序形式，使得编译器可以在语法树上实现基本上任意的属性流。

在接下来的章节（特别是第6至第10章），我们将考虑各种各样的编程语言构造。我们不会呈现实现这些构造所需的实际属性文法，而是会以非正式的方式描述它们的语义，并给出目标代码的示例。在第15章中，当我们更详细地考虑中间代码生成时，我们将回顾属性文法。