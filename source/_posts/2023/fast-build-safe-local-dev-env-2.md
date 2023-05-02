---
title: 快速构建安全的（HTTPS）本地开发环境（DNS Challenge版本）
mathjax: false
date: 2023-05-02 11:45:14
categories: [技术]
tags: [Docker, Traefik, Portainer, mkcert, tls]
---
上文使用了`dev.localhost`域名来进行本地开发的https配置，这次我们换用自购域名解析到127.0.0.1的形式来进行配置。

首先我们需要购买一个域名并且添加解析到127.0.0.1：

![](https://misakatang.oss-cn-beijing.aliyuncs.com/blog_picture/2023-05-02-8iOyNI.png)

因为我们的域名指向本地而不是公网可访问的IP，所以我们需要使用DNS challenge的形式来获取tls证书。各大厂商的DNS challenge的配置方式和需要的环境变量在这里：[dnsChallenge](https://doc.traefik.io/traefik/v1.7/configuration/acme/#dnschallenge) 可以找到。下面使用alidns来进行配置：

```yml
version: "3.3"

services:
  traefik:
    container_name: traefik
    image: "traefik:latest"
    command:
      - "--api.dashboard=true"
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
      - --providers.docker
      - --log.level=ERROR
      - "--certificatesresolvers.myresolver.acme.dnschallenge=true"
      - "--certificatesresolvers.myresolver.acme.dnschallenge.provider=alidns"
      - "--certificatesresolvers.myresolver.acme.email=xxx@xxx.com"
      - "--certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    networks:      
      - traefik-public
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "./letsencrypt:/letsencrypt"
    labels:
      - "traefik.http.routers.http-catchall.rule=hostregexp(`{host:.+}`)"
      - "traefik.http.routers.http-catchall.entrypoints=web"
      - "traefik.http.routers.http-catchall.middlewares=redirect-to-https"
      - "traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https"    
      - "traefik.http.routers.dashboard.rule=Host(`traefik.bilibill.site`) && (PathPrefix(`/api`) || PathPrefix(`/dashboard`))"
      - "traefik.http.routers.dashboard.service=api@internal"
      - "traefik.http.routers.dashboard.entrypoints=websecure"
      - "traefik.http.routers.dashboard.tls.certresolver=myresolver"
    environment:
      - "ALICLOUD_ACCESS_KEY=xxxxxxxxx"
      - "ALICLOUD_SECRET_KEY=xxxxxxxxx"

  portainer:
    image: portainer/portainer-ce:latest
    command: -H unix:///var/run/docker.sock
    restart: always
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer_data:/data
    networks:      
      - traefik-public
    labels:
      # Frontend
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`portainer.bilibill.site`)"
      - "traefik.http.routers.frontend.entrypoints=websecure"
      - "traefik.http.services.frontend.loadbalancer.server.port=9000"
      - "traefik.http.routers.frontend.service=frontend"
      - "traefik.http.routers.frontend.tls.certresolver=myresolver"

      # Edge
      - "traefik.http.routers.edge.rule=Host(`edge.bilibill.site`)"
      - "traefik.http.routers.edge.entrypoints=websecure"
      - "traefik.http.services.edge.loadbalancer.server.port=8000"
      - "traefik.http.routers.edge.service=edge"
      - "traefik.http.routers.edge.tls.certresolver=myresolver"


volumes:
  portainer_data:
networks:
  traefik-public:
    external: true
```

使用`docker network create traefik-public`创建外部网络后使用`docker-compose up`便可以启动服务，访问`https://traefik.bilibill.site/dashboard/#/`可以看到traefik自带的webUI。

![](https://misakatang.oss-cn-beijing.aliyuncs.com/blog_picture/2023-05-02-41yOR8.png)

