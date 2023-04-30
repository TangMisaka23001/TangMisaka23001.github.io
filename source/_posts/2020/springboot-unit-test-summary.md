---
title: SpringBoot单元测试小结
mathjax: false
date: 2020-04-14 20:26:40
categories: [技术]
tags: [SpringBoot, Java, Mock]
---
## 前言

对于测试的重要性，虽然不想说什么漂亮话，但是作为敏捷开发实践的重要一环，以及本着对自己代码负责的理念，在项目中保证必要的单元测试和覆盖率还是非常重要的。

在研究怎么在SpringBoot中优雅的进行单元测试的过程中，主要参考了：

1. [有赞单元测试实践](https://tech.youzan.com/youzan-test-practice/):主要参考了工具选型的思路和整合的思路。
2. [SpringTest文档](https://docs.spring.io/spring/docs/current/spring-framework-reference/testing.html)
3. [SpringBoot Test文档](https://docs.spring.io/spring-boot/docs/current/reference/html/spring-boot-features.html#boot-features-testing)
4. [SpringBoot 中文翻译文档--测试](https://jack80342.gitbook.io/spring-boot/iv.-spring-boot-features/43.-testing)

在文档中主要参考了MockMvc的使用,关于MockMvc之前也写过blog:[翻译:Spring MVC Test Framework--MockMvc使用](https://misakatang.cn/2018/10/18/%E7%BF%BB%E8%AF%91-Spring-MVC-Test-Framework-MockMvc%E4%BD%BF%E7%94%A8/).在当时主要是尝试了对单个项目的端口测试,在这次研究中主要考虑如何方便的对单个服务中依赖的服务进行打桩(stub)和Mock.
<!-- more -->
## 续前言

原本是打算把每个框架的使用方法都写写的,但是在几天的整合实践之后发现官方的文档都很友善所以下面就当作一个内容的小结,把一些需要注意的点总结一下,详细的用法还是看官方文档就可以了.

## [PowerMock](https://github.com/powermock/powermock)

PowerMock在单测中的应用场景主要是对单测服务所依赖静态类的Mock.

[官方的文档地址](https://github.com/powermock/powermock/wiki/Mockito)(主要使用了Mockito接口)

使用方法官方也给出了例子,在静态方法Mock时主要需要`@PrepareForTest`注解:
```java
// 1.类注解@PrepareForTest
@PrepareForTest(Static.class) // Static.class contains static methods
// 2.指定需要mock的静态方法
PowerMockito.mockStatic(Static.class);
// 3.使用Mockito接口来mock
// 在mock返回值为`void`的静态方法时可以使用`PowerMockito`的`when()`来进行mock
Mockito.when(Static.firstStaticMethod(param)).thenReturn(value);
// 4.校验mock结果
PowerMockito.verifyStatic(Static.class); // 1
Static.firstStaticMethod(param); // 2
```

## SpringBoot集成Mock

整合主要参考了[有赞单元测试实践](https://tech.youzan.com/youzan-test-practice/)中的整合方法,主要是需要整合PowerMock使得能够对静态类进行mock.

由于mock静态方法需要

> `@PrepareForTest({Static.class})`

注解所以需要将`UnitRunner`指定为`PowerMockRunner`,而由于需要和Spring整合,则需要`SpringRunner`,整合结果:

> `@RunWith(PowerMockRunner.class)`
>
> `@PowerMockRunnerDelegate(SpringRunner.class)`

最终的整合结果为:

```java
// powermock
@RunWith(PowerMockRunner.class)
// 整合springtest
@PowerMockRunnerDelegate(SpringRunner.class)
// 排除java.security
@PowerMockIgnore( {"javax.management.*", "javax.net.ssl.*"})
// mock静态类注解
@PrepareForTest(Static.class)
// SpringBoot测试的注解
@SpringBootTest
```

参照有赞的单元测试基类代码:
![image-20200414201352164](https://misakatang.oss-cn-beijing.aliyuncs.com/blog_picture/image-20200414201352164.png)

## SpringBoot自带MockBean

主要基于SpringBoot的文档(发现SpringBoot相关的东西还是得多看官方文档才行)介绍的`@MockBean`注解.

```java
import org.junit.*;
import org.junit.runner.*;
import org.springframework.beans.factory.annotation.*;
import org.springframework.boot.test.context.*;
import org.springframework.boot.test.mock.mockito.*;
import org.springframework.test.context.junit4.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.BDDMockito.*;

@RunWith(SpringRunner.class)
@SpringBootTest
public class MyTests {

    @MockBean
    private RemoteService remoteService;

    @Autowired
    private Reverser reverser;

    @Test
    public void exampleTest() {
        // RemoteService has been injected into the reverser bean
        given(this.remoteService.someCall()).willReturn("mock");
        String reverse = reverser.reverseSomeCall();
        assertThat(reverse).isEqualTo("kcom");
    }

}
```



## MockMvc

主要是有了一个注解方法来代替之前的手动创建mockMvc的形式,在这里记录一下:

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class MockMvcExampleTests {

    @Test
    void exampleTest(@Autowired MockMvc mvc) throws Exception {
        mvc.perform(get("/")).andExpect(status().isOk()).andExpect(content().string("Hello World"));
    }

}
```

还有一个`@WebMvcTest`注解应该等价于之前的mockmvc的standalone启动模式:

```java
import org.junit.*;
import org.junit.runner.*;
import org.springframework.beans.factory.annotation.*;
import org.springframework.boot.test.autoconfigure.web.servlet.*;
import org.springframework.boot.test.mock.mockito.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.BDDMockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@RunWith(SpringRunner.class)
@WebMvcTest(UserVehicleController.class)
public class MyControllerTests {

    @Autowired
    private MockMvc mvc;

    @MockBean
    private UserVehicleService userVehicleService;

    @Test
    public void testExample() throws Exception {
        given(this.userVehicleService.getVehicleDetails("sboot"))
                .willReturn(new VehicleDetails("Honda", "Civic"));
        this.mvc.perform(get("/sboot/vehicle").accept(MediaType.TEXT_PLAIN))
                .andExpect(status().isOk()).andExpect(content().string("Honda Civic"));
    }

}
```



## Dubbo Service的Mock

// TODO

## 扩展

[easy-random](https://github.com/j-easy/easy-random):

> Easy Random is a library that generates random Java beans.

在项目中主要用在单测需要复杂的DTO的时候,如果项目中对现有的复杂DTO没用random工具的话还是非常不错的.