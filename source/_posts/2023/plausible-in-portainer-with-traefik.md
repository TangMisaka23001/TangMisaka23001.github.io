---
title: 使用Portainer+traefik部署Plausible替换Google Analytics
mathjax: false
date: 2023-05-12 11:45:14
categories: [技术]
tags: [Docker, Traefik, Portainer, Plausible, Google Analytics]
---
## 开头
最近Google Analytics一直在催着升级到GA4，于是作为高级selfshosted OPS工程师当然需要将其部署到自己服务器上了。以下便是吾辈的快速启动配置。

## traefik配置
traefik配置没有特殊之处，只是配置了自动tls。

```yaml
version: "3.3"

services:
  traefik:
    container_name: traefik
    image: traefik:latest
    command:
      - --providers.docker
      - --log.level=INFO
      - --accesslog=true
      - --api.dashboard=true
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
      - --certificatesresolvers.leresolver.acme.httpchallenge=true
      - --certificatesresolvers.leresolver.acme.email=tangbin97@outlook.com
      - --certificatesresolvers.leresolver.acme.storage=./acme.json
      - --certificatesresolvers.leresolver.acme.httpchallenge.entrypoint=web
    ports:
      - 80:80
      - 443:443
    networks:
      - traefik-public
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /root/acme/acme.json:/acme.json
    labels:
      - traefik.http.routers.http-catchall.rule=hostregexp(`{host:.+}`)
      - traefik.http.routers.http-catchall.entrypoints=web
      - traefik.http.routers.http-catchall.middlewares=redirect-to-https
      - traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https
      - traefik.http.routers.dashboard.rule=Host(`traefik.bilibifun.cn`) && (PathPrefix(`/api`) || PathPrefix(`/dashboard`))
      - traefik.http.routers.dashboard.service=api@internal
      - traefik.http.routers.dashboard.entrypoints=websecure
      - traefik.http.routers.dashboard.tls.certresolver=leresolver

    environment:
      - TZ=Asia/Shanghai

networks:
  traefik-public:
    external: true
```


## plausible配置
[plausible官方提供了docker compose文件](https://github.com/plausible/hosting/blob/master/docker-compose.yml)，但是我们需要做一些改进：

1. 首先我们是在Portainer中进行compose文件的编写，所以`env_file`配置就需要转换成`environment`。
2. clickhouse-server的额外配置看了一下只是禁用了一部分log所以先忽略这部分的自定义配置。
3. 其余就是需要配置`network`了，我们需要将plausible本体连接到traefik网络中，但是内部service也需要互相访问，所以就需要两个network。所以我们就需要在plausible的`labels`配置中指定traefik的网络：`- "traefik.docker.network=traefik-public"`。

```yaml
version: "3.3"
services:
  mail:
    image: bytemark/smtp
    networks:
      - plausible-private

  plausible_db:
    image: postgres:14-alpine
    volumes:
      - db-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=postgres
    networks:
      - plausible-private

  plausible_events_db:
    image: clickhouse/clickhouse-server:22.6-alpine
    volumes:
      - event-data:/var/lib/clickhouse
    networks:
      - plausible-private
    ulimits:
      nofile:
        soft: 262144
        hard: 262144

  plausible:
    image: plausible/analytics:v1.5
    command: sh -c "sleep 10 && /entrypoint.sh db createdb && /entrypoint.sh db migrate && /entrypoint.sh run"
    depends_on:
      - plausible_db
      - plausible_events_db
      - mail
    networks:
      - plausible-private
      - traefik-public
    labels:
      - "com.centurylinklabs.watchtower.enable=false"
      - "traefik.enable=true"
      - "traefik.docker.network=traefik-public"
      - "traefik.http.routers.plausible.rule=Host(`plausible.bilibifun.cn`)"
      - "traefik.http.routers.plausible.entrypoints=websecure"
      - "traefik.http.services.plausible.loadbalancer.server.port=8000"
      - "traefik.http.routers.plausible.service=plausible"
      - "traefik.http.routers.plausible.tls.certresolver=leresolver"
    environment:
      - DISABLE_REGISTRATION=true
      - BASE_URL=replace me
      - SECRET_KEY_BASE= replace me

volumes:
  db-data:
    driver: local
  event-data:
    driver: local
  geoip:
    driver: local

networks:
  plausible-private:
  traefik-public:
    external: true
```