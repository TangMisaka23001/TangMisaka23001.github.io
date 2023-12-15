---
title: 阿里云原生应用脚手架攀爬事故小记
mathjax: false
date: 2023-12-15 11:45:14
categories: [技术]
tags: [maven, Spring]
---
## 起源
这个事故来源于某个PHPer转职Javaer时发生的灵异事件，在[云原生应用脚手架](https://start.aliyun.com/)中选择了应用架构为MVC架构之后生成的脚手架打包的jar包启动之后无法访问Controller中配置的路径。

## 现象
据某PHPer所说，在IDEA中直接启动项目没有问题但是打包成jar之后就访问不到controller中定义的请求路径了。

## 第一次排障
面对这个bug的第一直觉就是maven打包有问题，应该是代码没有打包进去。但是在解压jar包之后发现代码确实已经在lib文件夹里，而且解压之后也能找到对应的class文件。

这时候怀疑对象就转到了spring bean装配有问题上，于是便使用ApplicationContext的getBean方法尝试在spring启动完成之后获取basicController的bean，然后发现果然是bean并没有成功装载。

于是死马当活马医的给启动类加上了@ComponentScan注解尝试抢救一下，结果抢救失败仍然没有装载。

这时候已经是万策尽放弃治疗了，直接劝退了PHPer。

## 第二次排障
一天之后这个bug迎来了专家会诊，某Java领域大神准备对其进行一番操作，但是失败了。于是又将项目clone下来看了一看，因为病因是IDEA启动时可以正确加载而maven打包之后有问题，于是又将嫌疑人锁定到了maven上，但是根据本人浅薄的maven知识并没有发现配置有任何有问题的地方。

于是又开始死马当活马医，准备使用SPI机制给spring强制注入bean试试。在spring.factories文件中配置`org.springframework.boot.autoconfigure.EnableAutoConfiguration`为controller之后发现IDEA正常启动。但是maven打包时springboot启动直接报错：找不到该class文件。

嗯，有错误是好事，说明并不是spring装配的时候有问题而是项目启动时根本没有这个class的文件。这时候随便找了一个自己项目里的SDK jar包解压看了一下目录，又看了一下多模块中web模块的jar包：`BOOT-INF`。凶手已经找到了。

## 破案
按照配置给web模块和service模块增加了`<skip>true</skip>`配置，跳过了springboot打包插件，项目正常启动并可以访问请求路径。

很明显，在创建模板的时候pom.xml直接被复制了三份放到了三个模块当中，导致了spring-boot-maven-plugin插件把三个子项目都打包成了可部署的jar包。

一开始解压jar包的时候并没有关注到这个细节导致多次抢救无效。

令人疑惑的是 https://github.com/alibaba/cloud-native-app-initializer/issues/65 官方仓库里竟然有这种issue，但是`<skip>true</skip>`在最外层完全是反作用导致打包失败，而内部web模块明明需要这个配置缺没有填写。属实神秘。