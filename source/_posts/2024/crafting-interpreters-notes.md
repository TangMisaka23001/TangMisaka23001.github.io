---
title: 《Crafting Interpreters》笔记
mathjax: false
date: 2024-01-18 11:45:14
categories: [技术]
tags: [编译器, 'Crafting Interpreters']
---
## Scanning
任何编译器或解释器的第一步都是扫描。扫描器将原始源代码作为一系列字符输入，并将其分组为一系列我们称之为标记的块。这些是构成语言语法的有意义的“单词”和“标点符号”。

这一阶段的重点是把字符数组转换成token序列，通过“双指针”的方式逐步消耗字符。

Token类：
```java
class Token {
  final TokenType type;
  final String lexeme;
  final Object literal;
  final int line; 
}
```

TokenType:
```java
enum TokenType {
  // Single-character tokens.
  LEFT_PAREN, RIGHT_PAREN, LEFT_BRACE, RIGHT_BRACE,
  COMMA, DOT, MINUS, PLUS, SEMICOLON, SLASH, STAR,

  // One or two character tokens.
  BANG, BANG_EQUAL,
  EQUAL, EQUAL_EQUAL,
  GREATER, GREATER_EQUAL,
  LESS, LESS_EQUAL,

  // Literals.
  IDENTIFIER, STRING, NUMBER,

  // Keywords.
  AND, CLASS, ELSE, FALSE, FUN, FOR, IF, NIL, OR,
  PRINT, RETURN, SUPER, THIS, TRUE, VAR, WHILE,

  EOF
}
```
处理方式：
```java
  private void scanToken() {
    char c = advance();
    switch (c) {
      case '(': addToken(LEFT_PAREN); break;      
      case '!':
        addToken(match('=') ? BANG_EQUAL : BANG);
        break;
    }
  }
```
## Representing Code
在上一章中，我们将原始源代码作为字符串，并将其转换为稍微更高级的表示形式：一系列标记。我们将在下一章中编写的解析器将获取这些标记，并再次将它们转换为更丰富、更复杂的表示形式。

在我们能够生成该表示之前，我们需要定义它。

我们需要一把更大的锤子，而那把锤子就是上下文无关文法（CFG）。它是形式文法工具箱中的下一个最重要的工具。形式文法使用一组称为“字母表”的原子片段。然后它定义了一组通常是无限的“字符串”，这些字符串“属于”文法。每个字符串都是字母表中的“字母”序列。

语言语法的BNF表示：
```
expression     → literal
               | unary
               | binary
               | grouping ;

literal        → NUMBER | STRING | "true" | "false" | "nil" ;
grouping       → "(" expression ")" ;
unary          → ( "-" | "!" ) expression ;
binary         → expression operator expression ;
operator       → "==" | "!=" | "<" | "<=" | ">" | ">="
               | "+"  | "-"  | "*" | "/" ;
```

## Parsing Expressions
在解析之前除了语法规则还需要确定关键字的运算优先级和结合性（左结合、右结合）。

将优先级加入语法规则之后变成下面的形式：
```
expression     → equality ;
equality       → comparison ( ( "!=" | "==" ) comparison )* ;
comparison     → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
term           → factor ( ( "-" | "+" ) factor )* ;
factor         → unary ( ( "/" | "*" ) unary )* ;
unary          → ( "!" | "-" ) unary
               | primary ;
primary        → NUMBER | STRING | "true" | "false" | "nil"
               | "(" expression ")" ;
```

### Recursive Descent Parsing
递归下降核心步骤：
```java
  private Stmt declaration() {
    try {
//> Classes match-class
      if (match(CLASS)) return classDeclaration();
//< Classes match-class
//> Functions match-fun
      if (match(FUN)) return function("function");
//< Functions match-fun
      if (match(VAR)) return varDeclaration();

      return statement();
    } catch (ParseError error) {
      synchronize();
      return null;
    }
  }
```
```java
  private Stmt classDeclaration() {
    Token name = consume(IDENTIFIER, "Expect class name.");
//> Inheritance parse-superclass

    Expr.Variable superclass = null;
    if (match(LESS)) {
      consume(IDENTIFIER, "Expect superclass name.");
      superclass = new Expr.Variable(previous());
    }

//< Inheritance parse-superclass
    consume(LEFT_BRACE, "Expect '{' before class body.");

    List<Stmt.Function> methods = new ArrayList<>();
    while (!check(RIGHT_BRACE) && !isAtEnd()) {
      methods.add(function("method"));
    }

    consume(RIGHT_BRACE, "Expect '}' after class body.");

/* Classes parse-class-declaration < Inheritance construct-class-ast
    return new Stmt.Class(name, methods);
*/
//> Inheritance construct-class-ast
    return new Stmt.Class(name, superclass, methods);
//< Inheritance construct-class-ast
  }
```
解析的结果是返回一个语句列表：
```
List<Stmt> statements = parser.parse();
```
stmt类是一个抽象类，被各个具体的语法声明实现，class的实现如下：
```java
  static class Class extends Stmt {
    Class(Token name,
          Expr.Variable superclass,
          List<Stmt.Function> methods) {
      this.name = name;
      this.superclass = superclass;
      this.methods = methods;
    }

    @Override
    <R> R accept(Visitor<R> visitor) {
      return visitor.visitClassStmt(this);
    }

    final Token name;
    final Expr.Variable superclass;
    final List<Stmt.Function> methods;
  }
```

## Evaluating Expressions
语言实现有各种方式让计算机执行用户源代码的命令。它们可以将其编译成机器码，翻译成另一种高级语言，或将其简化为某种字节码格式，以便虚拟机运行。然而，对于我们的第一个解释器，我们将选择最简单、最直接的路径，直接执行语法树。

使用访问者模式来遍历上面产生的stmt列表直接进行求值，一个操作符遍历的例子：
```java
  @Override
  public Object visitBinaryExpr(Expr.Binary expr) {
    Object left = evaluate(expr.left);
    Object right = evaluate(expr.right); 

    switch (expr.operator.type) {
      case MINUS:
        return (double)left - (double)right;
      case SLASH:
        return (double)left / (double)right;
      case STAR:
        return (double)left * (double)right;
    }

    // Unreachable.
    return null;
  }
```

## Statements and State
为了支持绑定，我们的解释器需要内部状态。当你在程序开头定义一个变量并在结尾处使用它时，解释器必须在此期间保留该变量的值。因此，在本章中，我们将赋予我们的解释器一个不仅能处理，还能记住的大脑。

状态和语句是相辅相成的。由于语句根据定义不会评估为一个值，它们需要做一些其他的事情才能发挥作用。这个事情被称为副作用。它可能意味着产生用户可见的输出或修改解释器中的一些状态，以便以后可以检测到。后者使它们非常适合定义变量或其他命名实体。

### Environments
将变量与值关联的绑定需要存储在某个地方。自从Lisp的发明者发明了括号以来，这种数据结构就被称为环境。

```java
class Environment {
  private final Map<String, Object> values = new HashMap<>();
}
```

### Scope
作用域定义了一个区域，其中一个名称映射到某个实体。多个作用域使得同一个名称可以在不同的上下文中指代不同的事物。

词法作用域（或较少听到的静态作用域）是一种特定的作用域风格，程序文本本身显示了作用域的开始和结束位置。

通过对求值环境增加嵌套来实现作用域的效果：

```java
class Environment {
  final Environment enclosing; // 求值环境嵌套
  private final Map<String, Object> values = new HashMap<>();
}
```

## Control Flow
目前，我们的解释器只不过是一个计算器。Lox程序只能在完成之前做固定数量的工作。要使其运行时间加倍，必须使源代码长度加倍。我们即将解决这个问题。在本章中，我们的解释器迈出了向编程语言主要联赛迈进的重要一步：图灵完备性。

### IF
```java
  private Stmt ifStatement() {
    consume(LEFT_PAREN, "Expect '(' after 'if'.");
    Expr condition = expression();
    consume(RIGHT_PAREN, "Expect ')' after if condition."); 

    Stmt thenBranch = statement();
    Stmt elseBranch = null;
    if (match(ELSE)) {
      elseBranch = statement();
    }

    return new Stmt.If(condition, thenBranch, elseBranch);
  }
```
如何对IF求值：
```java
  @Override
  public Void visitIfStmt(Stmt.If stmt) {
    if (isTruthy(evaluate(stmt.condition))) {
      execute(stmt.thenBranch);
    } else if (stmt.elseBranch != null) {
      execute(stmt.elseBranch);
    }
    return null;
  }
```

## Functions
一旦我们准备好被调用者和参数，剩下的就是执行调用。我们通过将被调用者转换为LoxCallable，然后在其上调用一个 call() 方法来实现这一点。任何可以像函数一样被调用的Lox对象的Java表示都将实现这个接口。这包括自定义函数，当然也包括类对象，因为类被“调用”来构造新实例。

```java
interface LoxCallable {
  Object call(Interpreter interpreter, List<Object> arguments);
}
```
### Function Objects
这基本上就是 Stmt.Function 类的作用。我们能不能直接使用它？几乎可以，但还不够。我们还需要一个实现 LoxCallable 接口的类，这样我们才能调用它。我们不希望解释器的运行时阶段渗入前端的语法类，所以我们不希望 Stmt.Function 本身实现这一点。相反，我们将其包装在一个新的类中。

```java
class LoxFunction implements LoxCallable {
  private final Stmt.Function declaration;
  LoxFunction(Stmt.Function declaration) {
    this.declaration = declaration;
  }
}
```
call的实现如下：
```java
  @Override
  public Object call(Interpreter interpreter,
                     List<Object> arguments) {
    Environment environment = new Environment(interpreter.globals);
    for (int i = 0; i < declaration.params.size(); i++) {
      environment.define(declaration.params.get(i).lexeme,
          arguments.get(i));
    }

    interpreter.executeBlock(declaration.body, environment);
    return null;
  }
```
我们在每次调用时创建一个新的环境，而不是在函数声明时。我们之前看到的方法就是这样做的。在调用开始时，它创建一个新的环境。然后它以步调一致地遍历参数和参数列表。对于每一对，它都会使用参数的名称创建一个新的变量，并将其绑定到参数的值。

## Classes
类的解析方式：
```java
  private Stmt classDeclaration() {
    Token name = consume(IDENTIFIER, "Expect class name.");
    consume(LEFT_BRACE, "Expect '{' before class body.");

    List<Stmt.Function> methods = new ArrayList<>();
    while (!check(RIGHT_BRACE) && !isAtEnd()) {
      methods.add(function("method"));
    }

    consume(RIGHT_BRACE, "Expect '}' after class body.");

    return new Stmt.Class(name, methods);
  }
```

### Creating Instances
使用callable来实现类的初始化：
```java
class LoxClass implements LoxCallable {
  final String name;
  final LoxClass superclass; // 类的继承
  private final Map<String, LoxFunction> methods; // 类方法

  @Override
  public Object call(Interpreter interpreter,
                     List<Object> arguments) {
    LoxInstance instance = new LoxInstance(this);
    // 构造器约定为特殊的函数 名为init
    LoxFunction initializer = findMethod("init");
    if (initializer != null) {
      initializer.bind(instance).call(interpreter, arguments);
    }
}
```
类的实例包含：
```java
class LoxInstance {

  private LoxClass klass;

  private final Map<String, Object> fields = new HashMap<>(); // 类属性
}
```


