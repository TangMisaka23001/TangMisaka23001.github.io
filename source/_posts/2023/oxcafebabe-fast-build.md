---
title: 又一年双11之使用Traefik+Portainer快速搭建个人网站
mathjax: false
date: 2023-11-17 11:45:14
categories: [技术]
tags: [Docker, Traefik, Portainer]
---
## 前言
又又又到了self-hosted engineer最喜欢的建站时间，由于上次使用凉心云新用户薅的服务器的手机号废弃了，导致控制台无法登录，也不知道还剩多久时间到期。于是只能重新买了一台服务器再折腾一次。好在现代建站技术足够发达，迁移全部内容基本只是复制粘贴一下compose文件（没想到备案才是最麻烦的）。

原先还想给网站加一个雷池WAF，略微折腾了一下没搞定就放弃了。下次有时间再好好研究研究。
## 建站速通
### docker
```shell
curl -fsSL get.docker.com -o get-docker.sh
sudo sh get-docker.sh --mirror Aliyun
```
### BBR算法
```shell
echo net.core.default_qdisc=fq >> /etc/sysctl.conf
echo net.ipv4.tcp_congestion_control=bbr >> /etc/sysctl.conf
sysctl -p
sysctl net.ipv4.tcp_available_congestion_control
```
### portainer
```shell
docker network create traefik-public
docker volume create portainer_data
```
#### docker-compose.yml
```yaml
version: "3.3"

services:
  portainer:
    image: portainer/portainer-ce:latest
    command: -H unix:///var/run/docker.sock
    restart: always
    ports:
      - 9000:9000
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer_data:/data
    networks:
      - traefik-public
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.portainer.rule=Host(`portainer.oxcafebabe.cn`)"
      - "traefik.http.routers.portainer.entrypoints=websecure"
      - "traefik.http.services.portainer.loadbalancer.server.port=9000"
      - "traefik.http.routers.portainer.service=portainer"
      - "traefik.http.routers.portainer.tls.certresolver=leresolver"
volumes:
  portainer_data:
    external: true

networks:
  traefik-public:
    external: true
```
### traefik
启动portainer后通过端口访问，然后在portainer里创建stack：

注意： `acme.json`文件需要手动创建并`chmod 600`
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
      - traefik.http.routers.dashboard.rule=Host(`traefik.oxcafebabe.cn`) && (PathPrefix(`/api`) || PathPrefix(`/dashboard`))
      - traefik.http.routers.dashboard.service=api@internal
      - traefik.http.routers.dashboard.entrypoints=websecure
      - traefik.http.routers.dashboard.tls.certresolver=leresolver
    environment:
      - TZ=Asia/Shanghai

networks:
  traefik-public:
    external: true
```

### vaultwarden
```yaml
version: "3"

services:
  bitwarden:
    image: vaultwarden/server
    container_name: bitwarden-server
    volumes:
      - bitwarden:/data
    environment:
      TZ: "Asia/Shanghai"
      WEBSOCKET_ENABLE: "true"
      SIGNUPS_ALLOWED: "false"
      WEB_VAULT_ENABLE: "true"
      DOMAIN: "https://bitwarden.oxcafebabe.cn"
      ADMIN_TOKEN: "！！！！！！！！！！！！！！！"
    networks:
      - traefik-public
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.bitwarden.rule=Host(`bitwarden.oxcafebabe.cn`)"
      - "traefik.http.routers.bitwarden.entrypoints=websecure"
      - "traefik.http.services.bitwarden.loadbalancer.server.port=80"
      - "traefik.http.routers.bitwarden.service=bitwarden"
      - "traefik.http.routers.bitwarden.tls.certresolver=leresolver"
      - "traefik.http.routers.bitwarden-websocket.rule=Host(`bitwarden.oxcafebabe.cn`) && Path(`/notifications/hub`)"
      - "traefik.http.routers.bitwarden-websocket.entrypoints=websecure"
      
volumes:
  bitwarden:

networks:
  traefik-public:
    external: true
```
### RSSHUB
```yaml
version: '3'

services:
  rsshub:
    image: diygod/rsshub
    environment:
      ACCESS_KEY: !!!!!!!!!
      NODE_ENV: production
      CACHE_TYPE: redis
      REDIS_URL: 'redis://redis:6379/'
      PUPPETEER_WS_ENDPOINT: 'ws://browserless:3000'
      PROXY_URI: socks5h://172.17.0.1:20173
    depends_on:
      - redis
      - browserless
    networks:
      - traefik-public

    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.rsshub.rule=Host(`rsshub.oxcafebabe.cn`)"
      - "traefik.http.routers.rsshub.entrypoints=websecure"
      - "traefik.http.services.rsshub.loadbalancer.server.port=1200"
      - "traefik.http.routers.rsshub.service=rsshub"
      - "traefik.http.routers.rsshub.tls.certresolver=leresolver"
      
  browserless:
    image: browserless/chrome
    ulimits:
      core:
        hard: 0
        soft: 0
  redis:
    image: redis:alpine
    volumes:
        - redis-data:/data

volumes:
  redis-data:

networks:
  traefik-public:
    external: true
```
其余项目同理迁移，非常的迅速。
## 数据恢复
只有bitwarden和rss数据需要恢复，直接在网页上导入导出一次即可。
