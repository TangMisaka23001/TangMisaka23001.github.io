---
title: 服务器迁移到树莓派
categories:
  - 运维
tags:
  - 树莓派
  - docker
  - Linux
mathjax: false
date: 2020-09-12 12:04:50
---

# 前言
看了一下在阿里云买的hk服务器每个月得34,算下来一年也不少钱了

而且内存也开始不是很够用了就打算把服务都迁移到树莓派上(主要是ttrss),然后就折腾了将近一个星期都差不多迁移完成了.

唯一的深坑就是某些docker镜像不支持arm架构没法继续使用了吧(比如Huginn).
<!-- more -->
# 安装Ubuntu Server
官方文档:[How to install Ubuntu on your Raspberry Pi](https://ubuntu.com/tutorials/how-to-install-ubuntu-on-your-raspberry-pi#1-overview)
## 镜像源
/etc/apt/sources.list
```
deb-src http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ b#  清华
deb http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ bionic main restricted universe multiverse
deb http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ bionic-security main restricted universe multiverse
deb http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ bionic-updates main restricted universe multiverse
deb http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ bionic-proposed main restricted universe multiverse
deb http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ bionic-backports main restricted universe multiverse
deb-src http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ bionic main restricted universe multiverse
deb-src http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ bionic-security main restricted universe multiverse
deb-src http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ bionic-updates main restricted universe multiverse
deb-src http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ bionic-proposed main restricted universe multiverse
deb-src http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ bionic-backports main restricted universe multiverse
```
# [NPS](https://github.com/ehang-io/nps)
[文档](https://ehang-io.github.io/nps/#/install)

安装直接下载二进制文件执行
## 服务端配置
```
## 因为服务器上配置了nginx所以取消监听80和443端口
#HTTP(S) proxy port, no startup if empty
http_proxy_ip=0.0.0.0
#http_proxy_port=80
#https_proxy_port=443
#https_just_proxy=true
#default https certificate setting
#https_default_cert_file=conf/server.pem
#https_default_key_file=conf/server.key

## 指定服务端连接时的端口 
##bridge
bridge_type=tcp
bridge_port=444
bridge_ip=0.0.0.0

## 管理面板配置
#web
web_host= 1.1.1.1
web_username=admin
web_password=admin
web_port = 8080
```
## 客户端
```
./npc -server=1.1.1.1:444 -vkey=key
./npc install -server=1.1.1.1:444 -vkey=key
sudo npc start
```
# v2ray安装
在没有代理的情况下哪怕配置了docker的国内镜像源,下载v2ray的镜像还是非常的折磨,所以选择直接从官网下载了二进制包直接使用.
## 启动脚本
偷了服务器上原来的service配置

/etc/systemd/system/v2ray.service
```
[Unit]
Description=V2Ray Service
After=network.target
Wants=network.target

[Service]
# This service runs as root. You may consider to run it as another user for security concerns.
# By uncommenting the following two lines, this service will run as user v2ray/v2ray.
# More discussion at https://github.com/v2ray/v2ray-core/issues/1011
# User=v2ray
# Group=v2ray
Type=simple
PIDFile=/run/v2ray.pid
ExecStart=/usr/bin/v2ray/v2ray -config /etc/v2ray/config.json
Restart=on-failure
# Don't restart in the case of configuration error
RestartPreventExitStatus=23

[Install]
WantedBy=multi-user.target
```
## 客户端配置
```json
{
  "log": {
    "access": "/var/log/v2ray/access.log",
    "error": "/var/log/v2ray/error.log",
    "loglevel": "warning"
  },
  "inbounds": [
    {
      "port":"7892",
      "protocol":"http",
      "settings":{},
      "tag":"in-1"
    }
  ],
  "outbounds": [
    {
      "tag": "proxy",
      "protocol": "vmess",
      "settings": {
        "vnext": [
          {
            "address": "",
            "port": 443,
            "users": [
              {
                "id": "",
                "alterId": 64,
                "security": "auto"
              }
            ]
          }
        ]
      },
      "streamSettings": {
        "network": "ws",
        "security": "tls",
        "tlsSettings": {
          "allowInsecure": true,
          "serverName": ""
        },
        "tcpSettings": null,
        "kcpSettings": null,
        "wsSettings": {
          "connectionReuse": true,
          "path": "",
          "headers": {
            "Host": ""
          }
        },
        "httpSettings": null,
        "quicSettings": null
      },
      "mux": {
        "enabled": true
      }
    }
  ]
}
```
因为大部分的软件配置代理都无法通过socks,所以直接配置了http的代理使用
# docker安装
一键脚本
```
curl -fsSL get.docker.com -o get-docker.sh
sudo sh get-docker.sh --mirror Aliyun
```
配置docker的代理(镜像源感觉并没有什么卵用, pull v2ray的时候还是跟爬一样)
```sh
sudo mkdir -p /etc/systemd/system/docker.service.d
## 文件写入下面配置
/etc/systemd/system/docker.service.d/http-proxy.conf
/etc/systemd/system/docker.service.d/https-proxy.conf
## 配置 v2ray配置的http代理
[Service]
Environment="HTTPS_PROXY=http://127.0.0.1:1080/"

sudo systemctl daemon-reload
sudo systemctl restart docker
## 查看配置
systemctl show --property=Environment docker
```
# TTRSS
使用了[Awesome TTRSS](https://ttrss.henry.wang/zh/#%E5%85%B3%E4%BA%8E)
## 通过 docker-compose 部署
主要增加了代理配置,直接配置了全局的http代理(毕竟有些订阅源)
```yml
    environment:
      - HTTP_PROXY=http://172.17.0.1:7892
```
这个ip是主机上的docker0的虚拟网卡地址:(总比那些动不动就叫人-h的好多了)

`IPv4 address for docker0:         172.17.0.1`
# 挂载硬盘
查看设备:

`sudo lsblk -o UUID,NAME,FSTYPE,SIZE,MOUNTPOINT,LABEL,MODEL`

安装驱动:

`sudo apt-get install ntfs-3g`

手动mount:

`sudo mount /dev/sdc2 /mnt/share`

并没有配置开机自动挂载,因为连接硬盘启动一次失败之后就懒得折腾了,毕竟一直开着启动次数也不多,唯一的坑是如果把某些docker镜像设置了always启动而服务器启动之后硬盘没有正确挂载的话-v的文件夹内外会不一致,暂时的解决办法是把always启动关闭手动启动docker镜像在挂载硬盘之后

# [Aria2 Pro](https://p3terx.com/archives/docker-aria2-pro.html)
```sh
docker run -d \
    --name aria2-pro \
    --restart unless-stopped \
    --log-opt max-size=1m \
    --network host \
    -e PUID=$UID \
    -e PGID=$GID \
    -e RPC_SECRET=<TOKEN> \
    -e RPC_PORT=6800 \
    -e LISTEN_PORT=6888 \
    -v ~/aria2-config:/config \
    -v ~/aria2-downloads:/downloads \
    p3terx/aria2-pro
```
```sh
docker run -d \
    --name ariang \
    --restart unless-stopped \
    --log-opt max-size=1m \
    -p 6880:6880 \
    p3terx/ariang
```
因为下载文件配置在了挂载的机械盘上面,所以启动之后需要在面板的高级设置里把**文件分配方法**改为**prealloc**,否则下载失败

# Git ssh代理配置
git clone时使用ssh方式clone需要在ssh中配置:

~/.ssh/config
```sh
# 必须是 github.com
Host github.com
   HostName github.com
   User git
   # 走 HTTP 代理
   ProxyCommand connect -H 127.0.0.1:7892 %h %p
   # 走 socks5 代理（如 Shadowsocks）
   # ProxyCommand nc -v -x 127.0.0.1:1080 %h %p
```

# [ajenti](https://ajenti.org/)
```
sudo pip3 install --proxy http://127.0.0.1:7892 --cache-dir=/home/ubuntu/piptmp --build /home/ubuntu/piptmp ajenti-panel ajenti.plugin.ace ajenti.plugin.augeas ajenti.plugin.auth-users ajenti.plugin.core ajenti.plugin.dashboard ajenti.plugin.datetime ajenti.plugin.filemanager ajenti.plugin.filesystem ajenti.plugin.network ajenti.plugin.notepad ajenti.plugin.packages ajenti.plugin.passwd ajenti.plugin.plugins ajenti.plugin.power ajenti.plugin.services ajenti.plugin.settings ajenti.plugin.terminal
```
--cache-dir=/home/ubuntu/piptmp --build /home/ubuntu/piptmp

用来解决/var/tmp空间不足的问题,自行决定路径

# 磁盘空间管理
## journalctl 命令自动维护文件大小
`journalctl --vacuum-size=500M`

## docker磁盘分析
```sh
docker system df
## 清理
docker system prune
```
## df du使用
```
df -h 
du -h -d 1 | grep G
```
## ncdu
`sudo apt install ncdu`