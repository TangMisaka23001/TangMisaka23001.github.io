---
title: '翻译:Spring MVC Test Framework--MockMvc使用'
mathjax: false
date: 2018-10-18 20:44:18
categories: [技术]
tags: [Java, MockMvc, JavaTest, Test]
---
# 前言
国庆回来之后算是正是开始了Spring Boot的工作,而Java组里因为没有写任何的单元测试,每次测试都是靠Swagger的web页面自己填参数来测试,于是在这次新版本的迭代中我变成了第一个被要求贯彻实施每个controller都要写测试的人,不过**单元测试,从我做起**,真的很重要啊.

然后在选择的时候发现了MockMvc这个Spring自带的测试利器,个人认为主要的优势就在于可以直接在Java中模拟HTTP请求,而且对于模拟请求和参数的解析也是一把好手,*当然就是选择它啊!*,我当然是赞成的.然后在寻找资料的时候因为一开始没有看官方文档也是被搞懵了很久,在看了官方文档之后才豁然开朗,于是就为了自己,翻译一下记录一下,以防健忘的自己以后重复找轮子.

这里是文档地址:[https://docs.spring.io/spring/docs/current/spring-framework-reference/testing.html#testing-introduction](https://docs.spring.io/spring/docs/current/spring-framework-reference/testing.html#testing-introduction),因为这次只测试和服务器端的单元测试,所以文档也就翻了这部分.
# Spring MVC Test Framework
Spring MVC Test框架为使用流畅的API测试Spring MVC代码提供了最高级的支持,你可以使用JUnit,TestNG或者其他任何的测试框架.它被构建在`spring-test`模块的[Servlet API mock 对象](#jump)之上,因此不使用运行中的Servlet容器.它使用`DispatcherServlet`来提供完整的Spring MVC运行时的行为并且除了独立的模块之外还提供了使用TestContext框架来加载实际的Spring配置的支持,也就是说你可以手动执行Controller的实例并且一次测试一个.

Spring MVC Test还使用`RestTemplate`来提供客户端的代码测试.客户端的测试模拟服务端的响应所以也不会使用正在运行的服务.

> Spring Boot提供了一个选项来写一个完整的,端到端的包含运行中服务的集成测试.如果这是你的目标,查看[Spring Boot reference page](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-testing.html#boot-features-testing-spring-boot-applications).获取更多关于容器外和端到端集成测试的区别的信息,查看[Differences Between Out-of-Container and End-to-End Integration Tests](#jump)

## Server-Side Tests
你可以使用JUnit或者TestNG为Spring MVC controller编写一个普通的单元测试.如果要这么做的话,实例化conreoller,使用mocked或者stubbed依赖注入,然后使用它们的方法就行了(例如:`MockHttpServletRequest`,`MockHttpServletResponse`,和其他有必要用到的).然而,当你这样来写单元测试的时候,很多东西是测试不到的,例如:RequestMapping,数据绑定,类型转换,数据的合法性验证等等.此外,其他的controller方法,例如`@InitBinder`,`@ModelAttribute`和`@ExceptionHandler`也会作为请求过程生命周期中的一部分被请求到.

Spring MVC Test的目标是提供一个高效的方式来测试controller通过执行请求和生成response通过实际的`DispatcherServlet`.

Spring MVC Test构建在熟悉的`spring-test`模块的["mock” implementations of the Servlet API](https://docs.spring.io/spring/docs/current/spring-framework-reference/testing.html#mock-objects-servlet)之上.这也就允许我们不需要运行一个Servlet容器就可以模拟请求和生成response.在大部分情况下,一切都会像真实环境一样工作但是也有几个例外:[Differences Between Out-of-Container and End-to-End Integration Tests](### Differences Between Out-of-Container and End-to-End Integration Tests).下面的代码是基于JUnit Jupiter使用Spring MVC Test的例子:
```java
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringJUnitWebConfig(locations = "test-servlet-context.xml")
class ExampleTests {

    private MockMvc mockMvc;

    @BeforeEach
    void setup(WebApplicationContext wac) {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(wac).build();
    }

    @Test
    void getAccount() throws Exception {
        this.mockMvc.perform(get("/accounts/1")
        .accept(MediaType.parseMediaType("application/json;charset=UTF-8")))
        .andExpect(status().isOk())
        .andExpect(content().contentType("application/json"))
        .andExpect(jsonPath("$.name").value("Lee"));
    }
}
```
上面的测试依赖于TestContext框架提供支持的`WebApplicationContext`来从位于相同的package的xml配置文件中加载Spring的配置,基于Java和Groovy的配置文件也是支持的.[看这里](https://github.com/spring-projects/spring-framework/tree/master/spring-test/src/test/java/org/springframework/test/web/servlet/samples/context)

MockMVC实例模拟了一个`GET`请求了`/accounts/1`并且验证response的结果状态码是200,content-type是`application/json`,并且response body有一个JSON属性名`name`的key值是`Lee`.`jsonPath`的语法通过Jayway[JsonPath project](https://github.com/jayway/JsonPath)提供支持.更多其他的关于验证结果和模拟请求的选项在后面的文档中会讨论.

### Static Imports
上面例子代码中的API需要几个静态的imports,例如`MockMvcRequestBuilders.*`,`MockMvcResultMatchers.*`和`MockMvcBuilders.*`.下面导包操作就省略了.

### Setup Choices
你有2种主要的方式来创建`MockMVC`实例.第一种是通过TestContext框架加载Spring MVC配置文件,这样会加载Spring的配置信息并且通过注入`WebApplicationContext`到测试中来构建一个`MockMVC`实例.下面是示例代码:
```java
@RunWith(SpringRunner.class)
@WebAppConfiguration
@ContextConfiguration("my-servlet-context.xml")
public class MyWebTests {

    @Autowired
    private WebApplicationContext wac;

    private MockMvc mockMvc;

    @Before
    public void setup() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(this.wac).build();
 }

 // ...

}
```

第二种选择是手动创建一个controller实例而不加载Spring的配置信息.相对的,通过大致比较MVC JavaConfig或者MVC namespace来自动的创建一个默认的配置.你可以在一定程度上自定义.下面是实例代码:
```java
public class MyWebTests {

    private MockMvc mockMvc;

    @Before
    public void setup() {
        this.mockMvc = MockMvcBuilders.standaloneSetup(new AccountController()).build();
    }

    // ...

}
```
你会选择哪一种方式呢?#反正我是第二种hhh

`webAppContextSetup`会加载你实际的Spring MVC配置信息,导致一个更完整的集成测试.自从TestContext框架缓存加载Spring配置信息之后会让测试运行的更快,甚至在你引入了更多的测试的时候.此外,你可以通过Spring configuration注入mock service到你的controller以便于专注地在web层进行测试.下面的例子声明了一个mock service使用Mockito:
```xml
<bean id="accountService" class="org.mockito.Mockito" factory-method="mock">
    <constructor-arg value="org.example.AccountService"/>
</bean>
```
然后你可以把mock service注入到测试中并且配置成你想要的样子.下面是示例代码:
```java
@RunWith(SpringRunner.class)
@WebAppConfiguration
@ContextConfiguration("test-servlet-context.xml")
public class AccountTests {

    @Autowired
    private WebApplicationContext wac;

    private MockMvc mockMvc;

    @Autowired
    private AccountService accountService;

    // ...

}
```

这种`单独的设置`,从另一个方面看更接近一个单元测试,每次只测试一个controller.你可以使用mock依赖手动注入controller,并且这不涉及到加载Spring配置信息.这种测试更加关注于"style"并且让看到哪个controller正在被测试变得更容易,是否需要特定的Spring MVC配置文件才能运行,等等.这种`单独设置`的方式也是一种便利的写ad-hoc测试来验证具体的行为或者debug一个issue的方式.

在集成和单元测试的争论下,没有对的或者错的答案.然而使用`单独设置`就意味着需要额外的`webAppContextSetup`测试来验证你的Sring配置文件.或者你也可以用`webAppContextSetup`来写你的所有的测试,这样可以始终测试你的Spring配置信息.

### Setup Features
无论你使用那种方式来构建MockMVC,所有的`MockMvcBuilder`实现都提供了一些常见并且很实用的特性.例如,你可以为所有的请求声明一个`Accept`头并且对于所有的response希望返回200的状态码和`Content-Type`头.下面是示例代码:
```java
// static import of MockMvcBuilders.standaloneSetup

MockMvc mockMvc = standaloneSetup(new MusicController())
    .defaultRequest(get("/").accept(MediaType.APPLICATION_JSON))
    .alwaysExpect(status().isOk())
    .alwaysExpect(content().contentType("application/json;charset=UTF-8"))
    .build();
```

此外,第三方框架(和应用)可以预先打包设置声明,比如在`MockMvcConfigurer`.Spring框架有一个内置的实现可以通过请求来保存和重用HTTP session.你可以像下面一样使用:
```java
// static import of SharedHttpSessionConfigurer.sharedHttpSession

MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new TestController())
    .apply(sharedHttpSession())
    .build();

// Use mockMvc to perform requests...
```
查看[Javadoc for `ConfigurableMockMvcBuilder`](https://docs.spring.io/spring-framework/docs/5.1.1.RELEASE/javadoc-api/org/springframework/test/web/servlet/setup/ConfigurableMockMvcBuilder.html),列出了所有MockMvc内建的特性或者使用ide来查看.

### Performing Requests
你可以使用任何的HTTP方法来模拟请求:
```java
mockMvc.perform(post("/hotels/{id}", 42).accept(MediaType.APPLICATION_JSON));
```
你也可以使用`MockMultipartHttpServletRequest`内的模拟文件上传请求,这样就不会实际的解析一个多部分的请求.
```java
mockMvc.perform(multipart("/doc").file("a1", "ABC".getBytes("UTF-8")));
```
你可以添加一个请求参数使用URI template风格:
```java
mockMvc.perform(get("/hotels?thing={thing}", "somewhere"));
```
你还可以添加Servlet请求参数不管是请求参数还是表单参数.
```java
mockMvc.perform(get("/hotels").param("thing", "somewhere"));
```
如果应用的编码依赖于Servlet请求参数并且没有明确检查请求的字符串,你使用那个选项都没关系.但是请记住,提供的请求参数使用URI template的时候被编码,在请求参数经过`param()`方法的时候是预计已经被编码的.

在大多数的情况下,最好是把context path和Servlet path放在请求的URI外面.如果你必须要在完整的URI下测试,确定设置了`contextPath`和`servletPath`,request mapping才能正常工作.
```java
mockMvc.perform(get("/app/main/hotels/{id}").contextPath("/app").servletPath("/main"))
```
在上面的例子里,给每个模拟请求设置`contextPath`和`servletPath`是很笨重的.你可以设置默认的请求参数来代替:
```java
public class MyWebTests {

 private MockMvc mockMvc;

 @Before
 public void setup() {
 mockMvc = standaloneSetup(new AccountController())
    .defaultRequest(get("/")
    .contextPath("/app").servletPath("/main")
    .accept(MediaType.APPLICATION_JSON)).build();
 }
```
上面的设置会影响所有通过这个MockMvc实例模拟的请求.如果相同的属性也在给定的请求里出现了,会覆盖默认的值.这也就是为什么HTTP方法和URI在默认的请求下没有影响,因为必须在每个请求中指定它们.

### Defining Expectations
你可以定义预计的结果通过添加一个或者更多的`.andExpect(..)`在模拟请求之后:
```java
mockMvc.perform(get("/accounts/1")).andExpect(status().isOk());
```
`MockMvcResultMatchers.*`提供了大量的expectations,其中一些嵌套了更详细的expectations.

Expectations分为两大类,第一类断言验证响应的属性,这些都是最重要的结果断言.

第二类断言超出了response的范围,这些断言可以让你检查Spring MVC的特定方面,例如哪个controller的方法处理了请求,是否一个异常被抛出和处理,模型的content是什么,哪个view被选择,哪些属性被添加,等等..他们也运行检查Servlet的特定方面,例如请求和会话属性.

下面的测试断言绑定或者验证失败:
```java
mockMvc.perform(post("/persons"))
    .andExpect(status().isOk())
    .andExpect(model().attributeHasErrors("person"));
```

很多时候,当你在写测试,打印出模拟请求的结果是很有帮助的,可以使用`MockMvcResultHandlers`的静态方法`print()`来做到:
```java
mockMvc.perform(post("/persons"))
    .andDo(print())
    .andExpect(status().isOk())
    .andExpect(model().attributeHasErrors("person"));
```
只要请求过程没有造成一个没有处理的异常,`print()`方法就会打印出所有可得到的结果数据到`System.out`.Spring Framework 4.2引入了一个`log()`方法和两个附加的变种的`print()`方法,一个接收`OutputStream`一个接收`Writer`.例如,请求`print(System.err)`打印结果到`System.err`.当请求`print(myWriter)`的时候会打印数据到规定的地方.如果你想要使用结果数据日志来代替打印,使用`log()`方法,会把数据使用`DEBUG`打到`org.springframework.test.web.servlet.result`配置下.

在某些情况下,你也许想直接访问并且不想验证其他结果可以在后面加`.andReturn()`:
```java
MvcResult mvcResult = mockMvc.perform(post("/persons")).andExpect(status().isOk()).andReturn();
// ...
```

如果所有的测试有使用相同的expectations,你可以设置一个公共的expectations构建在`MockMvc`实例里面:
```java
standaloneSetup(new SimpleController())
    .alwaysExpect(status().isOk())
    .alwaysExpect(content().contentType("application/json;charset=UTF-8"))
    .build()
```
注意公用的expectations总是会被使用并且无法被覆盖.

当JSON响应内容包含使用[Spring HATEOAS](https://github.com/spring-projects/spring-hateoas)创建的超媒体链接时.你可以使用JsonPath表达式来验证结果连接:
```java
mockMvc.perform(get("/people").accept(MediaType.APPLICATION_JSON))
    .andExpect(jsonPath("$.links[?(@.rel == 'self')].href").value("http://localhost:8080/people"));
```

当xml被包含的时候可以使用xpath表达式来验证:
```java
Map<String, String> ns = Collections.singletonMap("ns", "http://www.w3.org/2005/Atom");
mockMvc.perform(get("/handle").accept(MediaType.APPLICATION_XML))
    .andExpect(xpath("/person/ns:link[@rel='self']/@href", ns).string("http://localhost:8080/people"));
```

### Filter Registrations
当设置一个`MockMvc`实例的时候,你可以注册一个或多个Servlet `Filter`实例:
```java
mockMvc = standaloneSetup(new PersonController()).addFilters(new CharacterEncodingFilter()).build();
```
注册过滤通过`spring-test`的`MockFilterChain`来调用,并且把最后一个过滤器委托给`DispatcherServlet`.

<span id="jump"></span>
### Differences Between Out-of-Container and End-to-End Integration Tests
就像之前提到的,Spring MVC Test构建在`spring-test`的Servlet API mock objects之上并且没有使用运行中的Servlet容器.因此,这和在客户端和服务器运行的完整的端到端的集成测试有一些很重要的区别.

最简单的方式就是从思考一个空白的`MockHttpServletRequest`开始.在这里面你添加什么,请求就会变成什么样.令你吃惊的也许是这里没有完整的上下文路径在默认情况下,没有`jsessionid`的cookie,没有转发,错误或是异步调度并且因此,没有实际的JSP转义.与此相对的,转发和重定向URL被保存在`MockHttpServletResponse`里并且可以使用表达式来断言它.

这也就意味着,如果你使用JSP,你可以验证请求转发到的JSP页面,但是没有HTML被呈现.换句话说,JSP不会被调用.但请注意，所有其他不依赖转发的渲染技术,例如Thymeleaf和Freemarker,会在response body里像期待的那样呈现HTML内容.相同的,JSON,XML和其他一切通过`@ResponseBody`注解传递的格式都可以.

另外,你也可以考虑通过使用Spring Boot的`@WebIntegrationTest`来实现完整的端到端的集成测试.查看[Spring Boot Reference Guide](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-testing.html#boot-features-testing-spring-boot-applications).

每种方法都有利弊.Spring MVC Test提供的选项和传统的单元测试的完整集成测试所停留的面是不一样的.可以肯定的是,Spring MVC中没有任何属于传统单元测试的选项,但是有一点接近它.例如,你可以通过把mock service注入到controller中的方式来隔离web层,在这种情况下你测试web层只需要通过`DispatcherServlet`但是实际上你是使用了Spring配置信息的,就像你可以隔离掉数据访问层之上的层面来测试数据访问层一样.当然,你也可以使用单独的配置,每次只关注一个controller并且手动提供使其运行所必须的配置文件.

使用Spring MVC的另一个重大的区别是,从概念上讲,这些测试是服务端的,所以你可以检查哪个Handler被使用了,如果一个异常被HandlerExceptionResolver处理了,这时候模型的内容是什么,绑定的是什么错误和其他的信息(可以很轻松的获取).这也就意味着写expectations会变得简单,因为server这时候就不是一个黑盒了,就像是通过实际的HTTP客户端去测试一样.传统的单元测试的优势是:易于编写,推理和调试但是不能完全取代完整的集成测试.同时,重要的是不要忽略了最重要的是要去检查response这件事.简而言之,即使在一个项目中,也存在多种的测试的风格和策略(条条大路通罗马).

### Further Server-Side Test Examples
这个框架自己的测试包含了[很多测试的例子](https://github.com/spring-projects/spring-framework/tree/master/spring-test/src/test/java/org/springframework/test/web/servlet/samples)为了展示如何使用Spring MVC Test.你可以打开这些例子来寻找更多的灵感.同时,[`spring-mvc-showcase`](https://github.com/spring-projects/spring-mvc-showcase)项目覆盖了完整的基于Spring MVC Test的测试.