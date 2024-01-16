---
title: 《Programming Language Pragmatics》第二章笔记
mathjax: false
date: 2023-11-16 11:45:14
categories: [技术]
tags: [编译器, 'Programming Language Pragmatics']
---
## Programming Language Syntax
Unlike natural languages such as English or Chinese,computer languages must be precise. Both their form (syntax) and meaning (semantics) must be specified without ambiguity, so that both programmers and computers can tell what a program is supposed to do. To provide the needed degree of precision, language designers and implementors use formal syntactic and semantic notation. To facilitate the discussion of language features in later chapters, we will cover this notation first: syntax in the current chapter and semantics in Chapter 4.

> 与英语或中文等自然语言不同，计算机语言必须要精确。它们的形式（语法）和含义（语义）必须要明确定义，以便程序员和计算机都能理解程序的预期行为。为了提供所需的精确度，语言设计者和实现者使用正式的语法和语义符号。为了便于后续章节中讨论语言特性，我们将首先介绍这些符号：本章介绍语法，第四章介绍语义。

### Specifying Syntax: Regular Expressions and Context-Free Grammars
编程语言的语法之所以使用BNF（巴科斯-诺尔范式）而不是正则表达式，主要是因为编程语言的语法复杂性通常超出了正则表达式的表达能力。以下是几个关键点来解释这一选择：

1. **表达能力**:
   - **正则表达式**：它们是用来描述正规语言的，只能表达有限的语法模式，通常用于简单的字符串匹配。正则表达式不能很好地处理递归模式，这是编程语言常见的结构，如嵌套的括号、if-else结构和函数调用等。
   - **BNF范式**：它是一种用于表示上下文无关文法（CFG）的符号，能够描述更复杂的语言结构，包括递归，这使得BNF非常适合表示编程语言的语法。

2. **递归结构**:
   - 编程语言中经常会有递归结构，比如在语言中可以有无限嵌套的函数调用或者循环结构。BNF范式自然而然地支持递归定义，而正则表达式则不支持。

3. **上下文无关文法**:
   - BNF是上下文无关文法的一种表示方法，它能够描述大多数编程语言的语法。上下文无关文法比正则表达式的表达能力更强，因为它允许使用非终结符和规则来定义语言的语法结构。

4. **解析算法**:
   - BNF范式定义的语法可以直接被转换成解析器，如LL或LR解析器，这些解析器可以构建出源代码的抽象语法树（AST）。正则表达式不适合这种用途，因为它们缺乏构建复杂结构的能力。

5. **可读性和维护性**:
   - BNF范式提供了一种清晰的方式来描述语法规则，这让语言设计者更容易定义、阅读和维护语言的语法。相比之下，复杂的正则表达式可以难以理解和维护。

总之，正则表达式在处理简单的文本模式时非常有用，但对于定义编程语言这样结构复杂、层次多、需要递归定义的语法来说，BNF范式提供了更强大、更灵活的语法描述能力。

### Scanning
By grouping input characters into tokens, the scanner dramatically reduces the number of individual items that must be inspected by the more computationally intensive parser. In addition, the scanner typically removes comments (so the parser doesn’t have to worry about them appearing throughout the context-free grammar); saves the text of “interesting” tokens like identifiers, strings, and numeric literals; and tags tokens with line and column numbers, to make it easier to generate high-quality error messages in subsequent phases.

> 通过将输入字符分组成标记，扫描器大大减少了需要由计算密集型的解析器检查的单个项的数量。此外，扫描器通常会移除注释（这样解析器就不必担心它们出现在上下文无关语法中）；保存“有趣”的标记的文本，比如标识符、字符串和数字字面量；并给标记添加行号和列号，以便在后续阶段生成高质量的错误消息变得更加容易。

#### Generating a Finite Automaton
While a finite automaton can in principle be written by hand, it is more common to build one automatically from a set of regular expressions, using a scanner generator tool. 

> 有限自动机原则上可以手动编写，但更常见的做法是利用扫描器生成工具从一组正则表达式自动构建。

As it turns out, however, there is no obvious one-step algorithm to convert a set of regular expressions into an equivalent deterministic finite automaton (DFA). The typical scanner generator implements the conversion as a series of three separate steps.

> 然而，事实证明，并没有明显的一步算法可以将一组正则表达式转换为等价的确定有限自动机（DFA）。典型的扫描器生成器将转换实现为三个单独步骤的系列。

- The first step converts the regular expressions into a nondeterministic finite automaton (NFA).
- the second step of a scanner generatortranslates the NFA into an equivalentDFA
- The third step is a space optimization that generates a final DFA with the minimum possible number of states.

#### Scanner Code
We can implement a scanner that explicitly captures the “circles-and-arrows” structure of a DFA in either of two main ways. One embeds the automaton in the control flow of the program using gotos or nested case (switch) statements; the other, described in the following subsection, uses a table and a driver.

> 我们可以通过两种主要方式之一，明确地捕获DFA的“圆圈和箭头”结构来实现扫描器。一种方式是利用goto或嵌套的case（switch）语句将自动机嵌入程序的控制流中；另一种方式在下一小节中描述，它使用表和驱动程序。

### Parsing
The parser is the heart of a typical compiler. It calls the scanner to obtain the tokens of the input program, assembles the tokens together into a syntax tree, and passes the tree (perhaps one subroutine at a time) to the later phases of the compiler, which perform semantic analysis and code generation and improvement. In effect, the parser is “in charge” of the entire compilation process; this style of compilation is sometimes referred to as syntax-directed translation.

> 解析器是典型编译器的核心。它调用扫描器以获取输入程序的标记，将这些标记组装成语法树，然后将语法树（可能一次一个子程序）传递给编译器的后续阶段，这些阶段执行语义分析、代码生成和优化。实际上，解析器“主导”整个编译过程；这种编译风格有时被称为语法定向翻译。

解析算法：
- LL（自顶向下）
- LR（自底向上）
- 递归下降
- 表驱动自顶向下解析

#### Syntax Errors
In general, the term syntax error recovery is applied to any technique that allows the compiler, in the face of a syntax error, to continue looking for other errors later in the program. High-quality syntax error recovery is essential in any production-quality compiler. The better the recovery technique, the more likely the compiler will be to recognize additional errors (especially nearby errors) correctly, and the less likely it will be to become confused and announce spurious cascading errors later in the program.

> 一般来说，“语法错误恢复”这个术语适用于任何允许编译器在面对语法错误时继续寻找程序中其他错误的技术。在任何生产级编译器中，高质量的语法错误恢复都是至关重要的。恢复技术越好，编译器识别额外错误（尤其是附近的错误）的准确性就越高，它混淆并在程序后期宣布虚假的级联错误的可能性就越小。

### Theoretical Foundations
Our understanding of the relative roles and computational power of scanners, parsers, regular expressions, and context-free grammars is based on the formalisms of automata theory. In automata theory, a formal language is a set of strings of symbols drawn from a finite alphabet. A formal language can be specified either by a set of rules (such as regular expressions or a context-free grammar) that generates the language, or by a formal machine that accepts (recognizes) the language. A formal machine takes strings of symbols as input and outputs either “yes” or “no.” A machine is said to accept a language if it says “yes” to all and only those strings that are in the language. Alternatively, a language can be defined as the set of strings for which a particular machine says “yes.”


> 我们对扫描仪、解析器、正则表达式和上下文无关文法的相对作用和计算能力的理解是基于自动机理论的形式主义。在自动机理论中，形式语言是从有限字母表中提取的一组符号串。形式语言可以通过一组规则（如正则表达式或上下文无关文法）来指定，这些规则生成语言，也可以通过一个接受（识别）语言的形式机来指定。形式机将符号串作为输入，并输出“是”或“否”。如果机器对于所有属于语言的字符串都回答“是”，则称该机器接受该语言。或者，语言可以被定义为一组字符串，对于这些字符串，特定的机器回答“是”。

### Summary and Concluding Remarks
- 正则表达式
- 上下文无关文法
- 实际编译器中的扫描和解析算法
- 语法错误恢复（painc）
- 自顶向下解析
- 自底向上解析
