---
title: 阿里云ODPS接入MybatisPlus动态数据源插件
tags:
  - 数据库
  - MybatisPlus
pubDatetime: 2026-01-29T11:45:14.000Z
---
## 背景

项目需要查询阿里云 ODPS（MaxCompute）数据源，原有方式使用 JDBC 直连或 SDK 方式查询。

## 解决方案

### 配置 ODPS 数据源

在 `application-qa.yml` 或 `application-prod.yml` 中配置：

```yaml
spring:
  datasource:
    dynamic:
      datasource:
        master:
          url: jdbc:mysql://localhost:3306/your_db
          username: xxx
          password: xxx
          driver-class-name: com.mysql.cj.jdbc.Driver
        odps:
          url: jdbc:odps:https://service.cn-hangzhou.maxcompute.aliyun.com/api?project=${aliyun.maxcompute.project}&useProjectTimeZone=true
          username: ${aliyun.maxcompute.keyId}
          password: ${aliyun.maxcompute.keySecret}
          driver-class-name: com.aliyun.odps.jdbc.OdpsDriver
          hikari:
            minimum-idle: 0
            maximum-pool-size: 10
```

### 添加 ODPS JDBC 依赖

在 `pom.xml` 中添加：

```xml
<dependency>
    <groupId>com.aliyun.odps</groupId>
    <artifactId>odps-jdbc</artifactId>
    <version>3.10.1</version>
</dependency>

<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>dynamic-datasource-spring-boot-starter</artifactId>
    <version>3.6.0</version>
</dependency>
```

---

### 自定义方言

为了支持 ODPS 数据源，需要自定义一个方言类 `ODPSDialect` 实现 `IDialect` 接口。

```java
public class DynamicDialect implements IDialect {

    private static final Map<String, IDialect> DIALECT_MAP = ImmutableMap.of(
            "master", new MySqlDialect(),
            "odps", new MySqlDialect()
    );

    @Override
    public DialectModel buildPaginationSql(String originalSql, long offset, long limit) {
        String ds = DynamicDataSourceContextHolder.peek();
        IDialect iDialect = DIALECT_MAP.get(ds);
        if (iDialect == null) {
            throw new BusinessException("数据源需要手动设置方言");
        }
        return iDialect.buildPaginationSql(originalSql, offset, limit);
    }

}
```
手动设置插件的方言处理：
```java
    @Bean
    public PaginationInterceptor paginationInterceptor() {
        PaginationInterceptor interceptor = new PaginationInterceptor();
        interceptor.setDialectClazz(DynamicDialect.class.getName());
        return interceptor;
    }
```

### Mapper 改造

```java
@DS("odps")
public interface ODPSMapper {

    List<Map<String, Object>> listOrder(@Param("ds") String ds, @Param("date") String date);
}
```

#### 创建对应的 XML 文件

在 `src/main/resources/mapper/odps/` 下创建 `ODPSMapper.xml`：

### LocalDate 转 Timestamp 异常

**问题**：Cannot transform ODPS-SDK Java class java.time.LocalDate to java.sql.Timestamp

官方文档引用：

Currently, 16 ODPS data types are supported. Please see the following table for supported ODPS data
types and corresponding JDBC interfaces.

|   ODPS Type   |          JDBC Interface          | JDBC Type |
|:-------------:|:--------------------------------:|:---------:|
|    TINYINT    |    java.sql.ResultSet.getByte    |  TINYINT  |
|   SMALLINT    |   java.sql.ResultSet.getShort    | SMALLINT  |
|      INT      |    java.sql.ResultSet.getInt     |  INTEGER  |
|    BIGINT     |    java.sql.ResultSet.getLong    |  BIGINT   |
|     FLOAT     |   java.sql.ResultSet.getFloat    |   FLOAT   |
|    DOUBLE     |   java.sql.ResultSet.getDouble   |  DOUBLE   |
|    DECIMAL    | java.sql.ResultSet.getBigDecimal |  DECIMAL  |
|    VARCHAR    |   java.sql.ResultSet.getString   |  VARCHAR  |
|     CHAR      |   java.sql.ResultSet.getString   |   CHAR    |
|    STRING     |   java.sql.ResultSet.getString   |  VARCHAR  |
|    BOOLEAN    |  java.sql.ResultSet.getBoolean   |  BOOLEAN  |
|     DATE      |    java.sql.ResultSet.getDate    |   DATE    |
|   DATETIME    | java.sql.ResultSet.getTimestamp  | TIMESTAMP |
|   TIMESTAMP   | java.sql.ResultSet.getTimestamp  | TIMESTAMP |
| TIMESTAMP_NTZ | java.sql.ResultSet.getTimestamp  | TIMESTAMP |
|    BINARY     |   java.sql.ResultSet.getBytes    |  BINARY   |
|     ARRAY     |   java.sql.ResultSet.getArray    |   ARRAY   |

When the `getObject()` method is called, what is obtained is the Java type directly corresponding to
each ODPS type without any conversion operation. Please see the following table for he
correspondence between ODPS types and Java types.

|   ODPS Type   |           Java Type           |
|:-------------:|:-----------------------------:|
|    TINYINT    |        java.lang.Byte         |
|   SMALLINT    |        java.lang.Short        |
|      INT      |       java.lang.Integer       |
|    BIGINT     |        java.lang.Long         |
|     FLOAT     |        java.lang.Float        |
|    DOUBLE     |       java.lang.Double        |
|    DECIMAL    |     java.math.BigDecimal      |
|    VARCHAR    | com.aliyun.odps.data.Varchar  |
|     CHAR      |   com.aliyun.odps.data.Char   |
|    STRING     |            byte[]             |
|    BOOLEAN    | java.sql.ResultSet.getBoolean |
|     DATE      |      java.time.LocalDate      |
|   DATETIME    |    java.time.ZonedDateTime    |
|   TIMESTAMP   |       java.time.Instant       |
| TIMESTAMP_NTZ |    java.time.LocalDateTime    |
|    BINARY     |  com.aliyun.odps.data.Binary  |
|     ARRAY     |    java.util.List<Object>     |


NOTE: Possible timezone issue

DATETIME in MaxCompute is actually defined as EPOCH in milliseconds, which is UTC, and so is
TIMESTAMP in JDBC. This driver fill the DATETIME value directly into JDBC TIMESTAMP and do no parse
or format action. When application that using JDBC display a DATETIME as a human-readable string
format, it is the application itself did the format using application defined or OS defined
timezone. It is suggested to keep your application/OS timezone setting same to MaxCompute to avoid
inconsistent datetime parse/format.

## 附录

### 相关文件清单

| 文件                                            | 说明              |
|-----------------------------------------------|-----------------|
| `application.yml`                             | MyBatis 配置      |
| `application-qa.yml` / `application-prod.yml` | 数据源配置           |
| `pom.xml`                                     | Maven 依赖        |
| `src/main/java/.../mapper/odps/*.java`        | ODPS Mapper 接口  |
| `src/main/resources/mapper/odps/*.xml`        | ODPS Mapper XML |

### 数据源类型支持

| 数据库   | 配置名称   | 说明             |
|-------|--------|----------------|
| MySQL | master | 主数据源           |
| ODPS  | odps   | 阿里云 MaxCompute |

### 版本信息
- Spring Boot: 2.1.5.RELEASE
- MyBatis-Plus: 3.x
- dynamic-datasource: 3.6.0
- odps-jdbc: 3.10.1