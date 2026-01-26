---
title: 更新NAS代理工具到mihomo
mathjax: false
tags:
  - 自托管
  - NAS
  - docker
  - 技术
pubDatetime: 2025-12-29T11:45:14.000Z
description: >-
  由于原先的clash版本过于古早且不太兼容新的管理面板，于是选择升级了一下clash内核 配置文件  管理面板
  https://board.zash.run.place
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

  zashboard:
    container_name: zashboard
    image: ghcr.io/zephyruso/zashboard:latest
    restart: unless-stopped
    ports:
      - '9091:80'
```
### 管理面板
https://board.zash.run.place

