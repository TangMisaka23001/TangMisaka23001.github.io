---
title: 使用Docker Compose快速折腾双11新买的服务器
mathjax: false
date: 2021-12-19 15:27:12
categories: [技术]
tags: [Docker, docker-compose, Nginx, Portainer, VuePress]
---
# 前言
许久没有折腾博客了，就借着双11买了台国内服务器建站的时机来水一篇，恢复一下节奏。因为很久没用才发现之前用的Travis CI已经不知道因为什么原因触发不了了，就正好也折腾一下，换成了Github Action。
<!-- more -->
# Github Action
鉴于之前根本没有接触过Github Action的写法，所以解决问题的核心就是找几个例子看一下，然后看看怎么改装现有的CI脚本。
## copy from
这里借鉴的是[如何使用Github+Actions实现Hexo博客自动化部署](https://sujie-168.top/2021/05/24/%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8Github-Actions%E5%AE%9E%E7%8E%B0Hexo%E5%8D%9A%E5%AE%A2%E8%87%AA%E5%8A%A8%E5%8C%96%E9%83%A8%E7%BD%B2/)里的CI yml配置文件。主要的变化也就是Secret的语法稍微有点不同，变成了
```
${{ secrets.TRAVIS_CI }}
```
而且也不知道为什么之前配置的Secret过期了就重新配置了一个，然后就把之前的shell直接搬运到RUN里，加入之前安装的插件就OK了。
# 快速搭建服务器
双11薅了TX云三年服务器的羊毛，然后买了个域名，计划着把之前一部分在HK服务器上和树莓派上的服务都整到国内的服务器上，一是访问速度更快，二是比家里的树梅派更稳定一点（老是断电）。由于之前用Docker Compose搭建了一部分的服务感觉很方便，所以就计划这次的服务器上所有的服务都基于Docker和Docker Compose来搭建。
## composerize
[网页版](https://www.composerize.com/)

一个用来转换docker run命令到Compose文件的工具，如果官方的docker镜像没有给出compose的话就用这个做一下转化，省的自己慢慢写了。
## Portainer
因为计划全部用Docker来搭建，所以就选择了一个Docker的Web管理工具，后面的全部应用都基于Portainer的Compose功能来启动和管理了。
### 启动
直接使用官方的命令：
```
docker volume create portainer_data
docker run -d \
-p 8000:8000 \
-p 9000:9000 \
--name portainer \
--restart=always \
-v /var/run/docker.sock:/var/run/docker.sock \
-v portainer_data:/data \
cr.portainer.io/portainer/portainer-ce
```
先启动项目然后开启服务器的9000端口用来临时访问（后面再关掉）。
## [bunkerized-nginx](https://github.com/bunkerity/bunkerized-nginx)
这是一个自带TLS证书签发续签的Nginx镜像，正好省了自己去配置续签定时任务的功夫就直接用上了。在Portainer的Stack里直接创建一个Stack：
```
version: '3'
services:
  mybunkerized:
    image: bunkerity/bunkerized-nginx
    ports:
      - 80:8080
      - 443:8443
    volumes:
      # - /bilibifun.cn/www:/www:ro
      - /bilibifun.cn/certs:/etc/letsencrypt
      - /bilibifun.cn/server-confs:/server-confs
      - /bilibifun.cn/modsec-crs-confs:/modsec-crs-confs
    environment:
      - SERVE_FILES=no
      - SERVER_NAME=www.bilibifun.cn
      - AUTO_LETS_ENCRYPT=yes
      - USE_REVERSE_PROXY=yes
      # - PROXY_REAL_IP=yes
      - DISABLE_DEFAULT_SERVER=yes
      - REDIRECT_HTTP_TO_HTTPS=yes
      - REVERSE_PROXY_WS=yes
      - USE_BAD_BEHAVIOR=no
      - USE_LIMIT_REQ=no
      - REVERSE_PROXY_KEEPALIVE=yes
      - BLOCK_USER_AGENT=no
      - ALLOWED_METHODS=GET|POST|HEAD|PROPFIND|DELETE|PUT|MKCOL|MOVE|COPY|PROPPATCH|REPORT
      - USE_MODSECURITY=no
```
关于voluems里的certs的文件夹映射**一定一定一定**要看一下[官方文档](https://bunkerized-nginx.readthedocs.io/en/latest/integrations.html)，因为有一定的文件权限问题（反正先看看官方Start肯定没有错）。modsec-crs-confs和下面一堆的配置是之前折腾Bitwarden的时候搞的，现在也不知道哪些是一定要配置的，建议先从最简单的配置出发然后逐渐改成能用的就行。`USE_MODSECURITY`这个配置项是安全相关的，建议在网站调试期间先关掉，不然会触发主动BAN IP的功能。
### server-confs
这个就是配置location转发的地方了，因为只签了www的二级域名，所以后面全部的功能的反向代理都用baseUrl的方式来进行。配置的时候就直接往里面丢conf就行
### server-confs/portainer.conf
先给portainer配上。不过因为修改server-conf都需要重启nginx,所以可以等最后再用域名形式访问。
```
location /portainer/ {
        proxy_pass  http://172.17.0.1:9000;
        rewrite ^/portainer/(.*) /$1 break;
        proxy_set_header Host $proxy_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
```
## v2rayA
建于某些不可知的原因，TTRSS里的有些订阅源需要进行特殊处理，所以在搭建ttrss之前就需要先整个这玩意儿了。
```
version: '3'
services:
    v2raya:
        privileged: false
        network_mode: host
        container_name: v2raya
        environment:
            - 'V2RAYA_ADDRESS=0.0.0.0:9002'
        volumes:
            - '/lib/modules:/lib/modules'
            - '/etc/resolv.conf:/etc/resolv.conf'
            - '/etc/v2raya:/etc/v2raya'
        image: mzz2017/v2raya
```
由于不使用host模式配置过于复杂，这里就直接给整成host模式了，当然最好Docker还是不要使用host模式。。
### server-confs/v2raya.conf
```
location /v2raya/ {
        proxy_pass  http://172.17.0.1:9002/;
        proxy_set_header Host $host;
        proxy_redirect off;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
```
只代理了web页面，因为暴露的socks5端口只在本地使用，就没有关系了。
## TTRSS
当然这玩意儿才是最核心的了，但是在[Awesome-TTRSS](https://github.com/HenryQW/Awesome-TTRSS)这个项目的加持之下，ttrss的安装已经变得非常简单了，直接拿文档里的Compose文件来改改就行。
```
version: "3"
services:
  service.rss:
    image: wangqiru/ttrss:latest
    container_name: ttrss
    ports:
      - 9001:80
    environment:
      - SELF_URL_PATH=https://www.bilibifun.cn #这里虽然是baseUrl但还是只要填域名就好
      - DB_PASS=AAAAAAAAAA # use the same password defined in `database.postgres`
      - PUID=1000
      - PGID=1000
      - SESSION_COOKIE_LIFETIME=720 # 增加session时长
      - HTTP_PROXY=172.17.0.1:20171 # 这里就是神秘软件的端口了
    volumes:
      - feed-icons:/var/www/feed-icons/
    networks:
      - public_access
      - service_only
      - database_only
    stdin_open: true
    tty: true

  service.mercury: # set Mercury Parser API endpoint to `service.mercury:3000` on TTRSS plugin setting page
    image: wangqiru/mercury-parser-api:latest
    container_name: mercury
    networks:
      - public_access
      - service_only

  service.opencc: # set OpenCC API endpoint to `service.opencc:3000` on TTRSS plugin setting page
    image: wangqiru/opencc-api-server:latest
    container_name: opencc
    environment:
      - NODE_ENV=production
    networks:
      - service_only

  database.postgres:
    image: postgres:13-alpine
    container_name: postgres
    environment:
      - POSTGRES_PASSWORD=AAAAAAAAAA # feel free to change the password
    volumes:
      - ttrss_postgres:/var/lib/postgresql/data # persist postgres data to ~/postgres/data/ on the host
    networks:
      - database_only

volumes:
  feed-icons:
  ttrss_postgres:

networks:
  public_access: # Provide the access for ttrss UI
  service_only: # Provide the communication network between services only
    internal: true
  database_only: # Provide the communication between ttrss and database only
    internal: true
```
### server-confs/ttrss.conf
```
location /ttrss/ {
        rewrite /ttrss/(.*) /$1 break;
        proxy_redirect https://$http_host https://$http_host/ttrss;
        proxy_pass http://172.17.0.1:9001;

        proxy_set_header  Host                $http_host;
        proxy_set_header  X-Real-IP           $remote_addr;
        proxy_set_header  X-Forwarded-Ssl     on;
        proxy_set_header  X-Forwarded-For     $proxy_add_x_forwarded_for;
        proxy_set_header  X-Forwarded-Proto   $scheme;
        proxy_set_header  X-Frame-Options     SAMEORIGIN;

        client_max_body_size        100m;
        client_body_buffer_size     128k;

        proxy_buffer_size           4k;
        proxy_buffers               4 32k;
        proxy_busy_buffers_size     64k;
        proxy_temp_file_write_size  64k;
    }
```
这个就直接按照官网的配置来就行，只是网页上有些功能还是不能正常使用，比如点标题的链接会404 = =。

## RSSHUB
这个也很简单，官方文档有Compose文件，直接用
```
version: '3'

services:
    rsshub:
        image: diygod/rsshub
        ports:
            - '9003:1200'
        environment:
            NODE_ENV: production
            CACHE_TYPE: redis
            REDIS_URL: 'redis://redis:6379/'
            PUPPETEER_WS_ENDPOINT: 'ws://browserless:3000'
        depends_on:
            - redis
            - browserless

    browserless:
        # See issue 6680
        image: browserless/chrome:1.43-chrome-stable
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
```
### rsshub.conf
```
location /rsshub/ {
        proxy_pass  http://172.17.0.1:9003/;
        proxy_set_header Host $host;
        proxy_redirect off;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
```
## Bitwarden
这个也是官方有Compose,拿来直接用
```
version: "3"

services:
    bitwarden:
        image: vaultwarden/server
        container_name: bitwarden-server
        ports:
            - "9004:80"
            - "9005:3012"
        volumes:
            - bitwarden:/data
        environment:
            WEBSOCKET_ENABLE: "true"
            SIGNUPS_ALLOWED: "true"
            WEB_VAULT_ENABLE: "true"
            DOMAIN: "https://bilibifun.cn/bitwarden"
            ADMIN_TOKEN: "AAAAAAAAAAA"
volumes:
    bitwarden:
```
### bitwarden.conf
```
location /bitwarden/ {
    proxy_pass http://172.17.0.1:9004;
    proxy_set_header Host $proxy_host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

location /bitwarden/notifications/hub {
        proxy_pass http://172.17.0.1:9005;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
}

location /bitwarden/notifications/hub/negotiate {
        proxy_pass http://172.17.0.1:9004;
}
```
这个似乎也是官方给出的配置，直接拿来用就行。

## NPS
用来穿透一下树莓派，挂一下WEBDAV用的。
```
version: '3.3'
services:
    nps:
        container_name: nps
        ports:
            - '9009:8024'
            - '9010:8080'
            - '10000-10020:10000-10020'
        volumes:
            - '/root/conf:/conf'
        image: ffdfgdfg/nps
```
### nps.conf
```
location /nps/ {
    proxy_pass  http://172.17.0.1:9010;
    proxy_set_header Host $proxy_host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

## VuePress
因为网站还是缺个首页，所以就打算用vuepress整一个试试水，本来是打算给博客直接从hexo搬到vuepress的，但是现在vuepress-next还没有很多主题跟进，就还是先用官方默认的搭一下首页就行。大致看了下官方文档，然后找了篇[1小时搞定vuepress快速制作vue文档/博客+免费部署预览](https://juejin.cn/post/6844903999129436174)直接拷贝一下，因为现在还没有内容，只是搞个首页然后给其他工具做个导航，就只做了一下config.
```
module.exports = {
  lang: 'zh-CN',
  title: '批哩FUN',
  description: '批哩FUN',
  head: [['link', { rel: 'icon', href: 'logo.jpg' }]],

  themeConfig: {
    logo: 'logo.jpg',

    //顶部导航栏
    navbar: [
      {text:'我的博客', link: 'https://misakatang.cn'},
      {text:'TTRSS', link: 'https://www.bilibifun.cn/ttrss'},
      {text:'Portainer', link: 'https://www.bilibifun.cn/portainer'},
      {text:'青龙面板', link: 'http://110.40.154.33:9006'},
      {text:'NPS', link: 'https://www.bilibifun.cn/nps'},
      {text:'Bitwarden', link: 'https://www.bilibifun.cn/bitwarden'},
      {text:'RSS Hub', link: 'https://www.bilibifun.cn/rsshub'},
      {text:'V2rayA', link: 'https://www.bilibifun.cn/v2raya'},
      {text:'WEBDAV', link: 'https://www.bilibifun.cn/webdav'},
    ],
  },
}
```
效果：[批哩FUN](https://www.bilibifun.cn)
### 部署
因为暂时没有什么功能，而且Github Action操作服务器还没研究过，暂时就先把项目clone到服务器上然后写个定时任务每天跑一次构建到docker就行了


Dockerfile
```
FROM node:17-alpine as builder

COPY . /workdir
WORKDIR /workdir
RUN ls
RUN npm install -g cnpm --registry=https://registry.npm.taobao.org
RUN cnpm -v
RUN cnpm i yarn tyarn -g
RUN tyarn -v
RUN tyarn
RUN tyarn docs:build

# 选择更小体积的基础镜像
FROM nginx:alpine
COPY --from=builder /workdir/docs/.vuepress/dist /usr/share/nginx/html
```

build.sh
```
git pull

docker build -t bilibifun-home .

(docker stop bilibifun-home && docker rm bilibifun-home) || true

docker run -p 9013:80 --name bilibifun-home -d bilibifun-home

echo y | docker system prune
```
### home.conf
```
location / {
        proxy_pass  http://172.17.0.1:9013/;
        proxy_set_header Host $host;
        #proxy_redirect off;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
```
## 后续升级
- 现在的server-conf还需要在服务器上通过shell来更改，如果有必要的话可以整一个运维工具或者装一个VSCode web版来进行在线的编辑
- 官网首页的内容规划，如果有更多的内容的话就找一个更好的CI方式。
- Jellyfin + Aria ： 因为树梅派还跑着Aria下电影和番剧，可以考虑webdav之外的播放形式
- 挂载阿里网盘为webdav用来存电影
- 把aria穿透出来并且搞成配置式的url