---
title: 更新NAS代理工具到mihomo
mathjax: false
date: 2025-12-29 11:45:14
categories: [技术]
tags: ['self hosted']
---
由于原先的clash版本过于古早且不太兼容新的管理面板，于是选择升级了一下clash内核
### 配置文件
```yaml
services:
  mihomo:
    image: docker.1ms.run/metacubex/mihomo:v1.19.18
    container_name: mihomo
    restart: unless-stopped
    ports:
      - 7890:7890
      - 7891:7891
      - 9090:9090
    volumes:
      - /volume1/docker/mihomo:/root/.config/mihomo
    environment:
      - TZ=Asia/Shanghai

```
### 管理面板
https://board.zash.run.place

