---
title: Spring Boot自定义参数处理实体ID
mathjax: false
tags:
  - Spring Boot
  - 技术
pubDatetime: 2024-11-13T11:45:14.000Z
---
## Spring Boot自定义参数处理实体ID
在实际业务中经常需要判断接收的实体ID是否在表中存在和向线程中注入该实体ID对应的数据，下面摘录了两种思路：
### 实现Converter来获取主键ID
```java
@RestController
class GitRepositoryController {

  @GetMapping("/repositories/{repoId}")
  String getSomething(@PathVariable("repoId") GitRepositoryId repositoryId) {
    // ... load and return repository
  }

}

```
```java
@Value
class GitRepositoryId {
  private final long value;

  public static GitRepositoryId valueOf(String value){
    return new GitRepositoryId(Long.parseLong(value));
  }
}

```
```java
@Component
class GitRepositoryIdConverter implements Converter<String, GitRepositoryId> {

  @Override
  public GitRepositoryId convert(String source) {
    // TODO 这里可以增加 exist 检测 和 在线程上下文中注入实体信息
    return new GitRepositoryId(Long.parseLong(source));
  }
}

```
### 实现 HandlerMethodArgumentResolver 
```java
@RequiredArgsConstructor
class GitRepositoryArgumentResolver implements HandlerMethodArgumentResolver {

  private final GitRepositoryFinder repositoryFinder;

  @Override
  public boolean supportsParameter(MethodParameter parameter) {
    return parameter.getParameter().getType() == GitRepository.class;
  }

  @Override
  public Object resolveArgument(
      MethodParameter parameter,
      ModelAndViewContainer mavContainer,
      NativeWebRequest webRequest,
      WebDataBinderFactory binderFactory) {

    String requestPath = ((ServletWebRequest) webRequest)
      .getRequest()
      .getPathInfo();

    String slug = requestPath
        .substring(0, requestPath.indexOf("/", 1))
        .replaceAll("^/", "");
    
    return gitRepositoryFinder.findBySlug(slug)
            .orElseThrow(NotFoundException::new);
  }
}

```
```java
@Component
@RequiredArgsConstructor
class GitRepositoryArgumentResolverConfiguration implements WebMvcConfigurer {

  private final GitRepositoryFinder repositoryFinder;

  @Override
  public void addArgumentResolvers(
      List<HandlerMethodArgumentResolver> resolvers) {
    resolvers.add(new GitRepositoryArgumentResolver(repositoryFinder));
  }

}

```
### REF
- [Custom Web Controller Arguments with Spring MVC and Spring Boot](https://reflectoring.io/spring-boot-argumentresolver/)
- [ 小伙伴同学们写的 TTL实际业务使用场景 与 设计实现解析的文章（写得都很好！ ）❤️ #123 ](https://github.com/alibaba/transmittable-thread-local/issues/123)
