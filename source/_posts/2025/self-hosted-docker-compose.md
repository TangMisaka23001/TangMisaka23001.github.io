---
title: 更换管理工具Portainer到Dockge
mathjax: false
date: 2025-12-31 11:45:14
categories: [技术]
tags: ['自托管','docker']
---
在看了[我的 2025 年度自托管服务报告](https://blog.dejavu.moe/posts/my-2025-selfhosted-services-report/)这篇文章之后有了想把自托管服务的docker compose文件给版本化的想法，这样也更方便后续可能存在的服务器迁移。

而在[问了一通AI](https://chatgpt.com/s/t_6954879c85b08191beba5d28b6193fc1)之后，发现了Dockge这个工具可以以文件夹的形式来管理docker compose文件，那么就开始动手。

## git仓库
https://github.com/TangMisaka23001/self-hosted-docker-compose

通过.env文件来管理key之类的配置，顺便把配置放在了git仓库的变量配置中防止丢失。

## 迁移
迁移的过程非常的丝滑，因为目前托管的服务配置都比较简单，都可以直接迁移。只是简单的从Portainer停止并从Dockge启动就可以了。

## TODO
后续更新一下git仓库的readme