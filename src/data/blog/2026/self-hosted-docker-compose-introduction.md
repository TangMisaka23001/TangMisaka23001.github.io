---
title: "自托管服务管理：我的 docker-compose 归集项目"
pubDatetime: 2026-05-30T00:00:00.000Z
tags:
  - Docker
  - Self-hosted
  - Homelab
  - write by ai
---

## 前言

在折腾各种自托管服务的过程中，我遇到了一个很现实的问题：服务越来越多，每个服务有自己的 `docker-compose.yaml`，部署到新服务器时需要逐个迁移、逐个配置，既繁琐又容易出错。

为了解决这个问题，我把所有自托管服务的 Docker Compose 配置统一汇集到一个仓库中：**self-hosted-docker-compose**。

这个项目地址是 [github.com/TangMisaka23001/self-hosted-docker-compose](https://github.com/TangMisaka23001/self-hosted-docker-compose)，采用 Apache 2.0 开源协议。

---

## 项目结构

项目采用**一个服务一个目录**的结构，每个服务目录下包含：

- `docker-compose.yaml` - 服务配置文件
- `.env.example` - 环境变量模板（敏感信息用占位符替代）
- 其他必要文件（如 nginx 配置文件等）

```
self-hosted-docker-compose/
├── traefik/          # 反向代理
├── dockge/           # Docker Compose 管理界面
├── bitwarden/        # 密码管理
├── memos/            # 轻量笔记
├── rsshub/           # RSS 订阅服务
├── yarr/             # RSS 阅读器
├── openlist/         # 多存储管理（类 AList）
├── pocket-id/        # OIDC 身份提供商
├── beszel/           # 服务器监控
├── bichon/           # 邮件服务
├── cliproxy/         # 代理服务
├── octopus/         # 文件管理
└── subconverter/     # 订阅转换
```

---

## 核心服务介绍

### 基础设施

**Traefik** - 云原生反向代理和负载均衡器，支持自动 Let's Encrypt 证书、自动发现 Docker 服务。配合路由器实现 HTTPS 和 HTTP 重定向。

**Dockge** - 来自 Uptime Kuma 作者的 Docker Compose 图形化管理界面，相比 Portainer 更轻量，专为 docker-compose 设计。

### 数据与服务

**Bitwarden** - 开源密码管理器，可自托管，所有数据存储在自己的服务器上，支持导入导出、两步验证。

**Memos** - 轻量级笔记服务，类似 flomo，支持 Markdown、自定义标签、全文搜索。

**OpenList** - 多存储管理工具，可以统一管理阿里云盘、Google Drive、OneDrive 等多种云存储，支持 WebDAV。

**Octopus** - 文件管理服务，提供 web 界面管理服务器上的文件。

### 订阅与媒体

**RSSHub** - 开源 RSS 生成器，可以为不支持 RSS 的网站（微博、微信、B站 等）生成 RSS 订阅源。

**Yarr** - RSS 阅读器，支持导入/导出 OPML，可以配合 RSSHub 使用。

**Subconverter** - 订阅转换工具，支持将 Clash、V2Ray、Trojan 等格式互相转换。

### 身份与安全

**Pocket ID** - 轻量级自托管 OIDC 身份提供商，支持 Passkey（无密码登录），可以为自托管服务提供统一认证。

### 监控运维

**Beszel** - 轻量级服务器监控系统，来自 henrygd，支持监控 CPU、内存、磁盘、网络，支持报警。

### 邮件服务

**Bichon** - 自托管邮件服务，支持收发邮件。

---

## 设计理念

### 1. 敏感信息分离

所有 `.env` 配置文件都不直接提交到仓库，只保留 `.env.example`。实际使用的 `.env` 文件通过以下方式管理：

1. 复制 `.env.example` 为 `.env`
2. 填写实际的敏感信息（数据库密码、API Key 等）
3. `.env` 文件已加入 `.gitignore`

### 2. 便于迁移

将整个仓库克隆到新服务器后：

```bash
# 进入服务目录
cd traefik

# 一键启动
docker compose up -d
```

所有服务配置统一管理，不需要逐个回忆每个服务的启动命令和环境变量。

### 3. Traefik 集成

所有需要域名的服务都配置了 Traefik 标签，实现：

- 自动 HTTPS 证书
- HTTP 跳转到 HTTPS
- 服务自动发现

### 4. 容器隔离

每个服务尽量使用独立的 Docker 网络，避免服务之间的不必要通信。

---

## 快速上手

### 1. 克隆仓库

```bash
git clone https://github.com/TangMisaka23001/self-hosted-docker-compose.git
cd self-hosted-docker-compose
```

### 2. 初始化环境变量

```bash
# 以 traefik 为例
cd traefik
cp .env.example .env
# 编辑 .env 填入实际值
```

### 3. 启动服务

```bash
docker compose up -d
```

### 4. 查看日志

```bash
docker compose logs -f
```

---

## 未来计划

- 添加更多常用自托管服务
- 完善每个服务的详细配置文档
- 考虑加入 Ansible playbook 实现自动化部署
- 优化网络配置，提高安全性

---

## 结语

自托管服务的魅力在于数据完全可控、不依赖第三方服务。通过 Docker Compose 统一管理这些服务，可以让部署和迁移变得简单高效。

如果你也在自托管各种服务，欢迎参考这个项目，或者提出建议和改进意见。也欢迎 Star 和 Fork！

项目地址：[https://github.com/TangMisaka23001/self-hosted-docker-compose](https://github.com/TangMisaka23001/self-hosted-docker-compose)