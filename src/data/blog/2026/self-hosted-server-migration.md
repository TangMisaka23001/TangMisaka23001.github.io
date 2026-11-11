---
title: "60 美元一年的小服务器：从下单、验机到把服务搬上去"
pubDatetime: 2026-11-11T00:00:00.000Z
tags:
  - 自托管
  - VPS
  - Docker
  - write by ai
description: "以 $59.99/年 的 RackNerd VPS 为地基，从下单、验机到用 Traefik + Dockge + EasyTier 把自托管服务搬上去的全过程，附踩坑清单。"
---

## 起因

手头攒了一堆想自托管的小服务：对象存储、笔记、个人数据库，还有几个最近想试的 AI 助理工具。家里那台群晖 DS224+ 能当存储和备份，却当不了公网入口——服务要从外面访问，家里的机器还得跟云上的机器组网，中间缺一台便宜、常开的 VPS 来兜底。加上旧的服务器也正好到期，索性借这个机会把地基整个换一遍。

买之前在 netcup 和 RackNerd 之间纠结了很久。netcup 的 VPS Lite 系列一直在候选名单里，性价比确实好，但 Lite 线的机房只能在欧洲三地之间由系统分配、不能自选，国内访问延迟注定不低；真正想买的 Lite 2 又得等黑五看有没有限时特供款。等来等去，先花小钱上车练手的心思占了上风——最后选了 RackNerd 的常驻特价年付档。

## 下单：$59.99/年的 3 核 4G

配置如下：

| 项目 | 规格 |
|---|---|
| CPU | 3 核 |
| 内存 | 4 GB |
| 硬盘 | 60 GB SSD |
| 机房 | 美国 Buffalo（ColoCrossing） |
| 价格 | $59.99/年（约 ¥400） |
| 周期 | 2026-11-06 至 2027-11-05 |

同系列还有 $35.99 的 2 核 2G 档和 $119.99 的 7 核 8G 档。2G 跑我这一摊服务肯定不够；8G 才是“主力机”的规格，但价格翻倍还要年付锁定。4G 这档的定位就很明确：**练手 + 分流，不当主力**。主力继续蹲 netcup 黑五，这台先把摊子支起来。

域名是同一天在 Spaceship 注册的 misakatang.xyz，$2.06/年，DNS 托管在 Cloudflare，通配 `*` 和根域名 `@` 都解析到这台机器，并开了橙云代理。

## 验机：IP 是真干净，线路是真普通

开机后跑了一份 NodeQuality 报告，结论很分裂：

- **性能平平**：Geekbench 6 单核 767，4K 随机读只有 1.51 MB/s，硬盘是明显的短板；
- **没有 IPv6**；
- **线路普通**：到国内延迟 200–300ms，也没有 CN2/9929 之类的优化回程；
- **但 IP 非常干净**：IPQS 风险分 12，无黑名单记录，原生解锁 ChatGPT、Claude、Gemini、Netflix。

于是这台机器的定位就定死了：**不适合当主力梯子，也不适合任何对延迟敏感的节点，但放自托管服务正合适**——服务对延迟不敏感，干净的原生 IP 反倒是很多服务的刚需。

系统用开源的 reinstall 脚本 DD 重装成了 Debian 12。RackNerd 这类机器没有官方一键重装，DD 前先确认面板有 VNC / 救援模式兜底；重装过程中那十几分钟 SSH 连不上是正常现象，别手贱强重启。

网上流传很广的一键运维脚本我也认真读了一遍源码：功能确实全，但埋点默认开启、信任链太长，最后还是决定不用，老老实实手写 Docker Compose。

## 地基：Traefik + Dockge

所有服务统一用 Docker Compose 部署，Dockge 负责网页端管理，Traefik 做反向代理：容器全部接进同一张 external 网络（`traefik-public`），证书由 Traefik 的 `leresolver` 自动签 Let's Encrypt。每个服务分一个 `xxx.misakatang.xyz` 子域名，labels 写在各自的 compose 里。这套地基的好处是后面每加一个服务都是复制粘贴改几行——先苦后甜。

## 组网：EasyTier 把 VPS 和家里的 NAS 拉进同一局域网

服务之间、家里和云上之间需要一条不经过公网的通道，于是用 EasyTier 组了网：VPS 做公网锚点节点，群晖做成员节点，网段 `10.144.144.0/24`。VPS 上只对公网开放 11010（TCP+UDP），本地 RPC 端口绝不开放。

实测两节点是 P2P 直连（没有走中继），延迟约 213ms、丢包 0%。这个延迟看着高，但它是 Buffalo 到国内的物理距离决定的，组网本身没毛病。从此敏感服务（比如数据库）可以只走组网地址，公网入口能关就关。

## 服务迁移与新装

### Memos + RustFS：这次的主菜

先把笔记应用 Memos 搬了上来，附件存储顺手换成自建的 RustFS——选它而不是 MinIO，是因为 MinIO 社区版的管理控制台已经被砍得不成样子。

RustFS 一共开了三个入口，全部走 Traefik：

- `s3.misakatang.xyz`：S3 API
- `s3-console.misakatang.xyz`：管理控制台
- `dav.misakatang.xyz`：WebDAV 网关（默认不启用，得靠环境变量打开；控制台里也没有对应设置页，找不到很正常）

Memos 的附件切到 RustFS 的桶之后，踩了个经典坑：S3 客户端默认用虚拟主机样式地址（`桶名.域名`），和通配证书、Traefik 路由打架，必须在 Memos 的存储设置里打开“使用路径样式链接”，附件 URL 变成 `s3.misakatang.xyz/memo/...` 才通。

RustFS 这一趟花了整整大半天，其中两个坑值得单独写，见文末踩坑清单。

### PostgreSQL：个人数据库

一个自用的 PostgreSQL 17，不装任何管理界面，数据放命名卷。外网直连走 Traefik 的 TCP 入口点：新增 `pg` 子域名（注意必须设成灰云“仅 DNS”，橙云代理不转发裸 TCP），DBeaver 里填 `pg.misakatang.xyz:5432` 就能连。

丑话说前面：这种接法等于把数据库端口对全网开放，唯一的一道门禁是强密码（SCRAM）。不敏感的自用数据可以这么图方便，敏感数据请老老实实走 EasyTier 的组网地址。

### DeepSeek Harness（dsh）：没有官方镜像的 AI 工具

想把在用的 AI 编程助理 dsh 也搬上服务器，结果发现它只以 npm 包分发、**没有官方 Docker 镜像**。自拼 compose 踩了个 502：dsh 的 Web UI 在容器里只监听 127.0.0.1，而 Traefik 是从另一个容器按容器 IP 连过来的，直接被拒。最后换了社区打包的镜像（源码公开、还在持续更新的那家，特意挑了带 git/pnpm 的 devtools 款，不然插件装不上），前面再垫一层镜像自带的代理和 Basic Auth 才跑通。

它启动时内存偏高，后来又补了限制：容器硬顶 1G、Node 堆上限 512MB——4G 的小机器必须这么精打细算，不然一个服务发疯就能把整台机拖死。

### 其他尝鲜

- **PicoClaw / ZeroClaw**：两个轻量个人 AI 助理，先后试装。ZeroClaw 的快速配置向导在它的精简镜像里会调用系统编辑器，而镜像里根本没装任何编辑器，直接报错退出——这类小坑只有真上手才知道。
- **Super Productivity**：冲着它的 AI 建任务能力折腾了一下午，自建同步服务、WebDAV、Dropbox 三条同步链路各有各的别扭，最后放弃，待办还是用回滴答清单。自托管的隐性成本就是这样：功能免费，时间不免费。

## 配置归集：仓库跟着搬了一次家

平时服务的 compose 基本都归集在 [self-hosted-docker-compose](https://github.com/TangMisaka23001/self-hosted-docker-compose)（之前写过一篇[介绍](https://misakatang.cn/2026/05/30/self-hosted-docker-compose-introduction)），仓库里现在有十几个服务目录。换服务器最能体现它的价值：新机器上 `git clone` 下来，每个目录 `cp .env.example .env` 填一遍，按 README 的顺序先起 Traefik，剩下的挨个 `docker compose up -d`，不用再回旧机器翻配置。

搬家的另一半工作其实落在仓库里——既要把新服务补进去，也得把旧的收拾干净，所以这两天的提交都花在这上面（11 月 10 日、11 月 11 日各一次）：

- **域名统一迁到 `misakatang.xyz`**：Beszel、Bitwarden、Dockge、Memos、RSSHub、Yarr 六个服务的 Traefik `Host(...)` 规则（以及 Bitwarden 这类容器内的 `DOMAIN`）一起换掉——新域名本来就是下单那天注册的，正好借搬家一次换干净。Bichon、OpenList、Pocket ID、Subconverter 暂时还挂在原来的 `oxcafebabe.cn` 上，README 里只写了句“按需自行统一”，先不折腾。
- **敏感信息出库**：Traefik 的 ACME 通知邮箱原来硬编码在启动参数里，这次抽成 `TRAEFIK_ACME_EMAIL`；`beszel-agent`、`easytier`、`rustfs`、`openlist` 几个目录也都配好了 `.env.example` 模板，密钥一律走 `.env`（`.gitignore` 里早就有 `**/.env`）。这样仓库能放心公开，新机器上把 `.env` 填好就是一套能跑的环境。不过 `.gitignore` 只管以后——早期提交里带进去的 `.env` 还留在 git 历史里（那会儿基本都是占位或空值），哪天要把仓库交给别人用，记得先清一遍历史。
- **新服务跟着落地**：`beszel-agent` 从 Beszel 里拆成独立目录（host 网络、只读挂 `docker.sock`）；`easytier` 收进仓库（host 网络 + `NET_ADMIN` + `/dev/net/tun`，锚点节点名 `vps-anchor`，组网 IP `10.144.144.1`）；`rustfs` 的 S3 / 控制台 / WebDAV 三个入口全写成 Traefik labels，数据落在 `/nas/rustfs`；`deepseek-harness` 单独一个目录，镜像 `smanx/deepseek-harness:devtools-min-latest`，监听 3080，代理凭据走 `.env`，内存限制也写进了 compose。
- **过时服务清掉**：`cliproxy`、`octopus` 直接删目录；Memos 镜像从 `latest` 换成 `stable`；Yarr 的镜像从 `ghcr.io/wakeful-cloud/yarr` 换成 `nkanaev/yarr`；RSSHub 和 Yarr 里用不上的代理变量（`PROXY_URI`、`HTTP_PROXY` 之类）也一并删掉。README 则补全了前置要求、启动顺序、服务清单表、环境变量表和目录结构，末尾还留了“已移除的服务”清单（`cliproxy`、`octopus`、`picoclaw`）——相当于给下一次搬家提前写好说明书。

这一轮改动谈不上什么技术含量，但把“搬家”变成了可复制的操作：clone、填 `.env`、按顺序起服务，半小时就能把一台新机器上的服务重新拉起来。

## 账单小结

| 项目 | 费用 |
|---|---|
| RackNerd VPS（3C/4G/60G） | $59.99/年 |
| 域名 misakatang.xyz | $2.06/年 |
| 合计 | 约 $62/年，¥420 上下 |

## 踩坑清单（这一趟最值钱的部分）

1. **Traefik 一个容器多个 service 时，每个 router 必须显式写 `.service=`**。漏写不会只坏那一个路由，而是整组 router 被丢弃，所有域名一起 404。我在这上面先错判了一次，最后是 Traefik 的实时报错日志把我纠正过来的。
2. **在 Dockge 里改了 compose 文件 ≠ 容器已更新**。保存只是改了文件，必须重新部署或强制重建，运行中的容器才带得上新配置。RustFS 的 WebDAV 和 dsh 的 502 各有一次“改了没生效”，判据都是日志和进程证据——比如启动日志打印的 token 还是旧的那串，说明跑的还是旧进程。
3. **WebDAV 各家实现的成熟度差距很大**。RustFS 的 WebDAV 网关年轻，同步类客户端容易在桶根目录的方法上吃 405；真要重度用 WebDAV，前面再套一层 OpenList 才是正经解法。
4. **截图和日志贴给任何人之前先打码**。这一趟我两次把令牌带进了截图里——都按泄露处理、重建作废。养成习惯，省事得多。

## 结尾

到这一步，这台 60 美元的小机器上已经跑着：反代地基、组网、对象存储、笔记、数据库和一个 AI 助理，外加家里 NAS 随时能从组网里摸到它。它的定位从第一天就很清楚——练手和分流，不指望它扛大活，就这么用着吧。

这套摊子反正都是 compose 文件，一份份都躺在仓库里——这大概也是自托管折腾到最后，唯一让人踏实的东西。
