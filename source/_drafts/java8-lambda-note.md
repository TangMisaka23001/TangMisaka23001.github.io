---
title: java8-lambda-note
mathjax: false
date: 2019-10-10 10:28:37
categories:
tags:
---
# chp2.
## lambda表达式的几种形式
```java
// () -> 表示没有参数且Runnable接口只有一个run方法
Runnable noArguments = () -> System.out.println("Hello World");

// 只有一个参数的表达式可以省略括号
ActionListener oneArgument = event -> System.out.println("button clicked");

// 表达式可以为代码块，用{}括起来
Runnable multiStatement = () -> {
  System.out.print("Hello");
  System.out.println(" World");
};

// 包含多个参数，返回的add变量是代码 BinaryOperator而不是相加之后的结果（有点类似于将函数作为变量）
BinaryOperator<Long> add = (x, y) -> x + y;

// 括号内的参数也可以指定类型而不是让编译器来推断
BinaryOperator<Long> addExplicit = (Long x, Long y) -> x + y;
```
Lambda 表达式的类型依赖于上下文环境，是由编译器推断出来的。

## 变量引用：
在lambda表达式中可以引用非final变量但该变量在既成事实上必须是final。也就是只能给该变量赋值一次，也就是值引用。
  
## 函数接口： 
使用只有一个方法的接口来表示某特定方法并反复使用。

**Java中重要的函数接口:**

![](https://i.loli.net/2019/10/10/Nz1AqOGckvy6oQb.png)

# chp3.
## 外部迭代
![](https://i.loli.net/2019/10/10/kwthMAbH8qj3pxP.png)
## 内部迭代
![](https://i.loli.net/2019/10/10/EHnfu1btTY36jA9.png)

lambda表达式采用惰性求值，在没有进行及早求知(reduce)之前不会进行前面的求值操作。 ex:
```java
// 由于采用惰性求值，这个表达式并不会有输出
allArtists.stream()
  .filter(artist -> {
    System.out.println(artist.getName());
    return artist.isFrom("London");
});
```

## 常用流操作
- collect(toList()) : 由Stream里的值生成一个列表，是一个及早求值操作。
- map : 将一个流中的值转换成一个新的流。

  ![](https://i.loli.net/2019/10/10/c2jMov3WdPr9EBt.png)
- filter : 
  
  ![](https://i.loli.net/2019/10/10/itrKHuPpdFNwclO.png)
  ```java
  // ex
  List<String> beginningWithNumbers = Stream.of("a", "1abc", "abc1")
                                            .filter(value -> isDigit(value.charAt(0)))
                                            .collect(toList());
  ```
- flatMap : 用Stream替换值，然后将多个Stream连接成一个Stream
  
  ![](https://i.loli.net/2019/10/10/CXHNdA6qwcfIBTh.png)
- max,min
  ```java
  // ex:
  Track shortestTrack = tracks.stream()
                              .min(Comparator.comparing(track -> track.getLength()))
                              .get();
  ```
