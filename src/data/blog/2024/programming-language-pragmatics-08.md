---
title: 《Programming Language Pragmatics》第八章笔记
mathjax: false
tags:
  - 编译器
  - Programming Language Pragmatics
  - 技术
pubDatetime: 2024-07-15T11:45:14.000Z
description: >-
  Subroutines and Control Abstraction Subroutines are the principal mechanism
  for control abstraction in most programming languages.  - A subroutine that
  returns ...
---
## Subroutines and Control Abstraction
Subroutines are the principal mechanism for control abstraction in most programming languages.

- A subroutine that returns a value is usually called a *function*.
- A subroutine that does not return a value is usually called a *procedure*.

### Review of Stack Layout（栈内存布局）
the **stack pointer** register contains the address of either the last used location at the top of the stack, or the first unused location

The **frame pointer** register contains an address within the frame.

### Calling Sequences
Maintenance of the subroutine call stack is the responsibility of the calling sequence

Tasks that must be accomplished on the way **into** a subroutine include：
- passing parameters
- saving the return address
- changing the program counter
- changing the stack pointer to allocate space
- saving registers (including the frame pointer) that contain important values and that may be overwritten by the callee
- changing the frame pointer to refer to the new frame
- executing initialization code for any objects in the new frame that require it

Tasks that must be accomplished on the way **out** include：
- passing return parameters or function values
- executing finalization code for any local objects that require it
- deallocating the stack frame (restoring the stack pointer)
- restoring other saved registers (including the frame pointer)
- restoring the program counter

##### Saving and Restoring Registers
函数调用最棘手的部分就是保存和恢复寄存器。
> Perhaps the trickiest division-of-labor issue pertains to saving registers. 

A *simpler solution* is for the caller to save all registers that are in use, or for the callee to save all registers that it will overwrite.

调用约定：

strike something of a compromise: registers not reserved for special purposes are divided into two sets of approximately equal size. One set is the caller’s responsibility, the other is the callee’s responsibility. A callee can assume that there is nothing of value in any of the registers in the caller-saves set; a caller can assume that no callee will destroy the contents of any registers in the callee-saves set.

##### Maintaining the Static Chain
In languages with nested subroutines,at least part of the work required to maintain the static chain must be performed by the caller,rather than the callee,because this work depends on the lexical nesting depth of the caller. 

##### A Typical Calling Sequence
The caller：
1. saves any caller-saves registers whose values will be needed after the call
2. computes the values of arguments and moves them into the stack or registers
3. computes the static link (if this is a language with nested subroutines), and passes it as an extra, hidden argument
4. uses a special subroutine call instruction to jump to the subroutine, simultaneously passing the return address on the stack or in a register

the callee：
1. allocates a frame by subtracting an appropriate constant from the sp
2. saves the old frame pointer into the stack, and assigns it an appropriate new value
3. saves any callee-saves registers that may be overwritten by the current routine (including the static link and return address, if they were passed in registers)

After the subroutine has completed, the epilogue：
1. moves the return value (if any) into a register or a reserved location in the stack
2. restores callee-saves registers if needed
3. restores the fp and the sp
4. jumps back to the return address

Finally, the caller：
1. moves the return value to wherever it is needed
2. restores caller-saves registers if needed

#### Displays
One disadvantage of static chains is that access to an object in a scope k levels out requires that the static chain be dereferenced k times.

This number can be reduced to a constant by use of a display.

> 为了优化这一过程，可以引入一个叫做 display 的数据结构。display 是一个数组，其中的每个元素都是一个指针，指向不同嵌套层级的活动记录（activation record）。当进入一个函数时，编译器会更新 display 来反映当前的调用环境。具体来说，display[i] 会指向第 i 层嵌套的最近活动记录。
> 
> 使用 display 可以直接通过数组索引快速定位到任何层级的活动记录，从而让访问外层变量的操作更加高效。这种方法减少了通过多个静态链指针进行跳转的需要，因此可以显著提高程序的运行速度，尤其是在函数嵌套层次较深的情况下。

#### Case Studies: C on the MIPS; Pascal on the x86
Calling sequences **differ significantly** from machine to machine and even compiler tocompiler

- Compilers for CISC machines tend to pass arguments on the stack; compilers for RISC machines tend to pass arguments in registers.
- Compilers for CISC machines usually dedicate a register to the frame pointer; compilers for RISC machines often do not.
- Compilers for CISC machines often rely on special-purpose instructions to implement parts of the calling sequence; available instructions on a RISC machine are typically much simpler.

#### Register Windows
As an alternative to saving and restoring registers on subroutine calls and returns, the original Berkeley RISC machines introduced a *hardware mechanism* known as **register windows**. 

The basic idea is to *map* the ISA’s limited set of register names onto some subset (window) of a much larger collection of physical registers, and to change the mapping when making subroutine calls.

#### In-Line Expansion
many language implementations allow certain subroutines to be *expanded in-line* at the point of call：

> A copy of the “called” routine becomes a part of the “caller”; no actual subroutine calloccurs.

In-line expansion avoids a variety of overheads,including:
- space allocation, 
- branch delays from the call and return, 
- maintaining the static chain or display, 
- and (often) saving and restoring registers. 

It also allows the compiler to perform *code improvements* such as:
- global register allocation
- instruction scheduling
- common subexpression elimination across the boundaries between subroutines

### Parameter Passing
Most subroutines are parameterized: they take arguments that control certain aspects of their behavior, or specify the data on which they are to operate.

Parameter names that appear in the declaration of a subroutine are known as **formal parameters**. 

Variables and expressions that are passed to a subroutine in a particular call are known as **actual parameters**. 

#### Parameter Modes
The two most common parameter-passing modes, called：
- call-by-value
- call-by-reference

call-by-value只要在函数返回时把参数的值写回到调用方，就可以实现和call-by-reference类似的效果

#####  Call-by-sharing
不是值传递。因为：
> if we modify the object to which the formal parameter refers, the program will be able to see those changes through the actual parameter after the subroutine returns

也不是引用传递，因为：
> although the called routine can change the value of the object to which the actual parameter refers, it cannot change the identity of that object.

Call-by-sharing is thus commonly implemented the same as call-by-value for objects of immutable type.

##### The Purpose of Call-by-Reference
- 需要修改参数
- 传递地址比复制参数节约时间

#### Call-by-Name
Explicit subroutine parameters are not the only language feature that requires a closure to be passed as a parameter. 

In general, a language implementation must pass a closure whenever the eventual use of the parameter requires the **restoration of a previous referencing environment**. 

#### Special-Purpose Parameters
- Conformant Arrays
- Default (Optional) Parameters
- Named Parameters: A(name='xxx', age=24)
- Variable Numbers of Arguments: fun(string...)

### Generic Subroutines and Modules
需要泛型的原因：
> In a language like Pascal or Fortran, this static declaration of item type means that the programmer must create separate **copies** of enqueue and dequeue **for every type of item**, even though the entire text of these copies (other than the type names in the procedure headers) is the same.

#### Implementation Options
Generics can be implemented several ways.
- the compiler creates a **separate copy** of the code for every instance
- guarantees that all instances of a given generic will **share the same code** at run time.

#### Generic Parameter Constraints（泛型约束）
避免使用隐式泛型参数:
> To avoid surprises, it is best to avoid implicit use of the operations of a generic parameter type. 

### Exception Handling
exception handling generally requires the language implementation to “unwind” the subroutine call stack.

try catch语法：
> all provide exception-handling facilities in which handlers are lexically bound to blocks of code, and in which the execution of the handler replaces the yet-to-be-completed portion of the block.

In practice, exception handlers tend to perform three kinds of operations:
- First, ideally, a handler will compensate for the exception in a way that allows the program to recover and continue execution. 
- Second, when an exception occurs in a given block of code but cannot be handled locally, it is often important to declare a local handler that cleans up any resources allocated in the local block, and then “reraises”the exception, so that it will continue to propagate back to a handler that can (hopefully) recover.
- Third, if recovery is not possible, a handler can at least print a helpful error message before the program terminates.

#### Defining Exceptions
In many languages, dynamic semantic errors automatically result in exceptions, which the program can then catch. The programmer can also define additional, application-specific exceptions.

Most languages use a throw or raise statement,embedded in an if statement, to raise an exception at run time. 

已知和未知异常：

If a subroutine raises an exception but does not catch it internally, it may “return” in an unexpected way. 

include in each subroutine header a list of the exceptions that may propagate out of the routine. 

*Unchecked exceptions* are typically run-time errors that most programs will want to be fatal

#### Exception Propagation（异常传播）
When an exception arises, the handlers are examined in order; control is transferred to the first one that matches the exception. 

#### Implementation of Exceptions
The most obvious implementation for exceptions maintains a linked-list stack of handlers. When control enters a protected block, the handler for that block is added to the head of the list.

### Coroutines
vs continuation：
> a *continuation* is a constant—it does not change once created—while a *coroutine* changes every time it runs.

coroutines are execution contexts that exist concurrently, but that execute one at a time, and that transfer control to each other explicitly, by name. Coroutines can be used to implement iterators and threads. 

### Events
An event is something to which a running program (a process) needs to respond, but which occurs outside the program, at an unpredictable time. 

事件和回调：

Instead, the programmer usually wants a handler—a special subroutine—to be invoked when a given event occurs. Handlers are sometimes known as callback functions,because the run-time system calls back into the main program instead of being called from it.

### Summary and Concluding Remarks
这一章主要关注了控制抽象的主题，特别是子程序。子程序允许程序员将代码封装在一个狭窄的接口后面，然后可以不考虑其实现方式进行使用。控制抽象对于任何大型软件系统的设计和维护都至关重要。从审美的角度来看，像Lisp和Smalltalk这样的语言中，内置和用户定义的控制结构使用相同的语法，这使得控制抽象特别有效。

我们在8.1节开始研究子程序，首先回顾了子程序调用堆栈的管理。然后我们考虑了用于维护堆栈的调用序列，PLP CD的额外部分专门讨论了展示；MIPSpro C编译器和GNU x86 Pascal编译器（gpc）的案例研究；以及SPARC的寄存器窗口。在简要考虑内联扩展之后，我们在8.3节转向了参数的主题。我们首先考虑了参数传递模式，所有这些模式都是通过传递值、引用或闭包来实现的。我们注意到，语义清晰和实现速度的目标有时会有冲突：通常通过引用传递大参数最有效，但是由此产生的别名可能会导致程序错误。在8.3.3节，我们考虑了特殊的参数传递机制，包括一致的数组、默认（可选）参数、命名参数和可变长度的参数列表。我们注意到，默认和命名参数提供了一种对动态范围的有吸引力的替代方案。在8.4节，我们考虑了泛型子程序和模块的设计和实现。泛型允许在编译时将控制抽象参数化，以参数的类型而不仅仅是它们的值为基础。

在最后的三个主要部分，我们考虑了异常处理机制，这些机制允许程序以良好的结构方式从嵌套的子程序调用序列中“解开”；协程，它允许程序维护（并在两个或更多执行上下文之间切换）；以及事件，它允许程序响应异步外部活动。在PLP CD上，我们解释了协程如何用于离散事件模拟。我们还注意到，它们可以用来实现迭代器，但在这里存在更简单的替代方案。在第12章，我们将基于协程来实现线程，这些线程并行运行（或看起来并行运行）。

在几个情况下，我们可以看出关于语言应该提供哪些类型的控制抽象的观点正在形成共识。像Fortran和Algol 60这样的语言的有限参数传递模式已被更广泛或灵活的选项取代。Ada和C++等语言中，标准的位置记号法已被默认参数和命名参数所增强。较少结构化的错误处理机制，如标签参数、非局部goto和动态绑定处理器，已被结构化的异常处理器取代，这些异常处理器在子程序内部进行词法范围处理，并且在常见（无异常）情况下可以零成本实现。传统的信号处理机制中的自发子程序调用已被专用线程中的回调取代。在许多情况下，实现这些新特性需要编译器和运行时系统变得更复杂。偶尔，如call-by-name参数、标签参数或非局部goto的情况，语义上令人困惑的特性也难以实现，放弃它们使编译器变得更简单。在其他情况下，一些有用但难以实现的语言特性仍然在一些语言中出现，但在其他语言中则不出现。这一类别的例子包括一等子程序、协程、迭代器、续延和具有无限范围的局部对象。
