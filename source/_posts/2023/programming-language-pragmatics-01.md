---
title: 《Programming Language Pragmatics》摘录翻译-其一
mathjax: false
date: 2023-11-15 11:45:14
categories: [技术]
tags: [编译器, 'Programming Language Pragmatics']
---
## The Art of Language Design
Today there are thousands of high-level programming languages, and new ones continue to emerge. Human beings use assembly language only for specialpurpose applications. In a typical undergraduate class, it is not uncommon to find users of scores of different languages. Why are there so many? There are several possible answers:

> 今天有成千上万种高级编程语言，而且新的语言不断涌现。人类只在特定应用中使用汇编语言。在典型的本科课程中，发现使用数十种不同语言的情况并不罕见。为什么会有这么多种语言？这有几个可能的答案：

### Evolution.
Computer science is a young discipline; we’re constantly finding better ways to do things. The late 1960s and early 1970s saw a revolution in “structured programming,” in which the goto-based control flow of languages like Fortran,Cobol,and Basic3 gave way to while loops, case (switch) statements, and similar higher level constructs. In the late 1980s the nested block structure of languages like Algol,Pascal,and Ada began to give way to the object-oriented structure of Smalltalk, C++, Eiffel, and the like.

> 计算机科学是一个年轻的学科；我们不断发现更好的做事方式。20世纪60年代末和70年代初，出现了“结构化编程”的革命，其中像Fortran、Cobol和Basic3这样基于goto的控制流让位给了while循环、case（switch）语句和类似的更高级构造。到了20世纪80年代末，像Algol、Pascal和Ada这样的语言的嵌套块结构开始让位于Smalltalk、C++、Eiffel等面向对象的结构。

### Special Purposes.
Many languages were designed for a specific problem domain. The various Lisp dialects are good for manipulating symbolic data and complex data structures. Icon and Awk are good for manipulating character strings. C is good for low-level systems programming. Prolog is good for reasoning about logical relationships among data. Each of these languages can be used successfully for a wider range of tasks, but the emphasis is clearly on the specialty.

> 许多编程语言是为特定的问题领域而设计的。各种Lisp方言适用于操纵符号数据和复杂数据结构。Icon和Awk适用于操纵字符串。C适用于低级系统编程。Prolog适用于推理数据之间的逻辑关系。这些语言都可以成功地用于更广泛的任务，但重点显然在于专业领域。

### Personal Preference.
Different people like different things. Much of the parochialism of programming is simply a matter of taste. Some people love the terseness of C; some hate it. Some people find it natural to think recursively; others prefer iteration. Some people like to work with pointers; others prefer the implicit dereferencing of Lisp, Clu, Java, and ML. The strength and variety of personal preference make it unlikely that anyone will ever develop a universally acceptable programming language.

> 不同的人喜欢不同的东西。编程中的很多偏见只是品味上的问题。有些人喜欢C的简洁性；有些人则讨厌。有些人觉得递归思考很自然；而其他人则更喜欢迭代。有些人喜欢使用指针；其他人则更喜欢Lisp、Clu、Java和ML中隐式解引用的方式。个人偏好的强大和多样性使得几乎不可能有人能够开发出一个被普遍接受的编程语言。

Of course, some languages are more successful than others. Of the many that have been designed, only a few dozen are widely used. What makes a language successful? Again there are several answers:

> 当然，一些语言比其他语言更成功。在众多被设计出来的语言中，只有几十种被广泛使用。是什么让一种语言成功？这个问题有几个答案：

### Expressive Power.
One commonly hears arguments that one language is more “powerful” than another, though in a formal mathematical sense they are all Turing complete—each can be used, if awkwardly, to implement arbitrary algorithms. Still, language features clearly have a huge impact on the programmer’s ability to write clear, concise, and maintainable code, especially for very large systems. There is no comparison, for example, between early versions of Basic on the one hand, and Common Lisp or Ada on the other. The factors that contribute to expressive power—abstraction facilities in particular—are a major focus of this book.

> 人们经常听到有关一种语言比另一种语言更“强大”的论点，尽管从正式的数学意义上讲，它们都是图灵完备的——每种语言都可以被使用（虽然有时会很笨拙）来实现任意算法。然而，语言特性显然对程序员编写清晰、简洁和易维护的代码能力产生巨大影响，特别是对于非常庞大的系统。例如，早期的Basic与Common Lisp或Ada之间是无法比较的。构成表达能力的因素——尤其是抽象设施——是本书的主要关注点。

### Ease of Use for the Novice.
While it is easy to pick on Basic, one cannot deny its success. Part of that success is due to its very low “learning curve.” Logo is popular among elementary-level educators for a similar reason: even a 5-year-old can learn it. Pascal was taught for many years in introductory programming language courses because, at least in comparison to other “serious” languages, it is compact and easy to learn. In recent years Java has come to play a similar role. Though substantially more complex than Pascal, it is much simpler than, say, C++.

> 虽然批评Basic很容易，但人们无法否认它的成功。它的成功部分归功于其非常低的“学习曲线”。类似的原因，Logo在小学教育者中很受欢迎：甚至5岁的孩子都可以学会。Pascal在很多年里被用来教授入门级编程语言课程，因为至少与其他“严肃”的语言相比，它更为简洁且易学。近年来，Java也开始扮演类似的角色。虽然比Pascal复杂得多，但它比如C++等语言简单得多。

### Ease of Implementation.
In addition to its low learning curve, Basic is successful because it could be implemented easily on tiny machines, with limited resources. Forth has a small but dedicated following for similar reasons. Arguably the single most important factor in the success of Pascal was that its designer, Niklaus Wirth, developed a simple, portable implementation of the language, and shipped it free to universities all over the world (see Example 1.15).4 The Java designers took similar steps to make their language available for free to almost anyone who wants it.

> 除了其低学习曲线之外，Basic之所以成功，还因为它可以轻松在资源有限的小型设备上实现。Forth也因类似的原因拥有一小部分忠实的追随者。可以说，Pascal成功的最重要因素之一是其设计者尼古拉斯·沃斯（Niklaus Wirth）开发了一种简单、可移植的语言实现，并免费提供给全球各地的大学（见示例1.15）。Java的设计者们也采取了类似的措施，让他们的语言几乎可以免费提供给任何想要使用它的人。

### Standardization.
Almost every widely used language has an official international standard or (in the case of several scripting languages) a single canonical implementation; and in the latter case the canonical implementation is almost invariably written in a language that has a standard. Standardization—of both the language and a broad set of libraries—is the only truly effective way to ensure the portability of code across platforms. The relatively impoverished standard for Pascal, which is missing several features considered essential by many programmers (separate compilation, strings, static initialization, random-access I/O), is at least partially responsible for the language’s drop from favor in the 1980s. Many of these features were implemented in different ways by different vendors.

> 几乎每种广泛使用的编程语言都有一个官方的国际标准，或者（在一些脚本语言的情况下）有一个单一的规范实现；而在后一种情况下，规范实现几乎总是用一种有标准的语言编写。标准化——无论是语言本身还是一套广泛的库——是确保代码在各种平台上可移植的唯一真正有效的方法。Pascal的标准相对较为简陋，缺少许多被许多程序员认为是必不可少的功能（如独立编译、字符串、静态初始化、随机访问I/O），这在一定程度上导致了该语言在20世纪80年代失宠。许多这些功能是由不同的供应商以不同的方式实现的。

### Open Source.
Most programming languages today have at least one open-source compiler or interpreter, but some languages—C in particular—are much more closely associated than others with freely distributed, peer-reviewed, community-supported computing. C was originally developed in the early 1970s by Dennis Ritchie and Ken Thompson at Bell Labs,5 in conjunction with the design of the original Unix operating system. Over the years Unix evolved into the world’s most portable operating system—the OS of choice for academic computer science—and C was closely associated with it. With the standardization of C, the language has become available on an enormous variety of additional platforms. Linux, the leading open-source operating system, is written in C. As of October 2008, C and its descendants account for 66% of the projects hosted at the sourceforge.net repository.

> 如今，大多数编程语言至少都有一个开源编译器或解释器，但有些语言——尤其是C语言——与自由分发、同行评审、社区支持的计算密切相关。C语言最初是在20世纪70年代初由贝尔实验室的丹尼斯·里奇（Dennis Ritchie）和肯·汤普逊（Ken Thompson）开发的，同时也是与最初的Unix操作系统的设计相关联的。多年来，Unix发展成为世界上最具可移植性的操作系统——成为学术计算机科学的首选操作系统，并与C语言密切相关。随着C语言的标准化，该语言已经可以在大量额外的平台上使用。领先的开源操作系统Linux就是用C语言编写的。截至2008年10月，在sourceforge.net代码库托管的项目中，C语言及其衍生版本占了66%。

### Excellent Compilers.
Fortran owes much of its success to extremely good compilers. In part this is a matter of historical accident. Fortran has been around longer than anything else, and companies have invested huge amounts of time and money in making compilers that generate very fast code. It is also a matter of language design, however: Fortran dialects prior to Fortran 90 lack recursion and pointers, features that greatly complicate the task of generating fast code (at least for programs that can be written in a reasonable fashion without them!). In a similar vein, some languages (e.g., Common Lisp) are successful in part because they have compilers and supporting tools that do an unusually good job of helping the programmer manage very large projects.

> Fortran的成功很大程度上归功于非常优秀的编译器。部分原因是历史的偶然性。Fortran的历史比其他任何语言都要悠久，许多公司投入了大量时间和资金来开发能够生成非常高效代码的编译器。然而，这也与语言设计有关：Fortran 90之前的方言缺乏递归和指针，这些特性会极大地复杂化生成高效代码的任务（至少对于可以在不使用它们的情况下以合理方式编写的程序来说是如此！）。类似地，一些语言（例如Common Lisp）之所以成功，部分原因在于它们具有编译器和支持工具，这些工具在帮助程序员管理非常大型项目方面做得异常出色。

### Economics, Patronage, and Inertia.
Finally, there are factors other than technical merit that greatly influence success. The backing of a powerful sponsor is one. PL/I, at least to first approximation, owes its life to IBM. Cobol and, more recently, Ada owe their life to the U.S. Department of Defense: Ada contains a wealth of excellent features and ideas, but the sheer complexity of implementation would likely have killed it if not for the DoD backing. Similarly, C#, despite its technical merits, would probably not have received the attention it has without the backing of Microsoft. At the other end of the life cycle, some languages remain widely used long after “better” alternatives are available because of a huge base of installed software and programmer expertise, which would cost too much to replace.

> 最后，除了技术优势之外，还有其他因素极大地影响着成功。强大赞助商的支持是其中之一。例如，PL/I至少在最初阶段，归功于IBM。Cobol和最近的Ada都归功于美国国防部：Ada包含了大量出色的特性和想法，但如果没有美国国防部的支持，其实现的复杂性很可能会使其难以生存。同样，尽管C#在技术上有其优点，但如果没有微软的支持，它可能不会得到如今的关注。另一方面，一些语言在更好的替代方案出现后仍然被广泛使用，这是因为已安装的软件和程序员的专业知识庞大，替换它们的成本太高。

Clearly no single factor determines whether a language is “good.” As we study programming languages, we shall need to consider issues from several points of view. In particular, we shall need to consider the viewpoints of both the programmer and the language implementor. Sometimes these points of view will be in harmony, as in the desire for execution speed. Often, however, there will be conflicts and tradeoffs, as the conceptual appeal of a feature is balanced against the cost of its implementation. The tradeoff becomes particularly thorny when the implementation imposes costs not only on programs that use the feature, but also on programs that do not.

> 显然，没有单一因素能决定一种语言是否“优秀”。在研究编程语言时，我们需要从多个角度考虑问题。特别是，我们需要考虑程序员和语言实现者的观点。有时这些观点会保持一致，比如对执行速度的渴望。然而，通常会存在冲突和权衡，比如某项特性的概念吸引力与其实现成本之间的平衡。当实现不仅给使用该特性的程序带来成本，而且也给不使用该特性的程序带来成本时，这种权衡变得特别棘手。

In the early days of computing the implementor’s viewpoint was predominant. Programming languages evolved as a means of telling a computer what to do. For programmers, however, a language is more aptly defined as a means of expressing algorithms. Just as natural languages constrain exposition and discourse, so programming languages constrain what can and cannot easily be expressed, and have both profound and subtle influence over what the programmer can think. Donald Knuth has suggested that programming be regarded as the art of telling another human being what one wants the computer to do [Knu84].6 This definition perhaps strikes the best sort of compromise. It acknowledges that both conceptual clarity and implementation efficiency are fundamental concerns. This book attempts to capture this spirit of compromise,by simultaneously considering the conceptual and implementation aspects of each of the topics it covers.

> 在计算机的早期发展阶段，实现者的观点占据主导地位。编程语言演变为告诉计算机该做什么的手段。然而，对于程序员来说，语言更恰当地被定义为表达算法的手段。就像自然语言限制了表述和交流一样，编程语言也限制了什么可以和不能轻松地表达，并对程序员的思维产生深远而微妙的影响。Donald Knuth曾建议将编程视为告诉另一个人想让计算机做什么的艺术。这个定义或许达到了最好的折衷。它承认了概念上的清晰和实现效率都是基本关注点。本书试图捕捉这种折衷的精神，同时考虑所涵盖主题的概念和实现方面。