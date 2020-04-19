---
title: 这周搞的一些新东西
mathjax: false
date: 2019-09-08 12:03:52
categories: [周报]
tags: [agile-learning, blog, windows]
---
话到嘴边又不知道该怎么描述,也算是拾起了很久没用的博客吧,这也算是自己少见的文字输出方式了所以还是来写一写.

之所以会写**这周搞的一些新东西**这样的博客,主要是这周摸🐟的时光似乎有些多了,也是四处搞了很多新东西和一些之前遗留的事,就来记录一下吧.

# 敏捷学习仓库合并
在许久之前看了[基于GitHub的敏捷学习方法之道与术](http://insights.thoughtworkers.org/agile-learning-method-base-on-github/)之后就深受影响然后搞了一个仓库[Agile-Learning](https://github.com/TangMisaka23001/Agile-Learning)也坚持搞了一段时间(MySQL文档翻译就是这样促成的),但是过年回来之后惰性发作也就许久没有再去动这个仓库也就闲置了许久,最近打算重新使用之后发现private的仓库不能无偿使用wiki,也就借着public的机会把这个仓库和github.io的仓库给合并了顺便整理了一下吧.

因为写博客的分支是在backup上的,所以对博客访问也没有什么影响,也是方便自己管理,之前没有public敏捷学习的仓库也是因为打算实践一段时间找到自己的使用方式之后再public出来,现在也是想用wiki就用public的方式来督促一下自己吧算是.
<!-- more -->
# 用wiki整合知识
承接上文现在也是打算吧一些开发和日常过程中自己Google过的不熟悉的东西整理到wiki里面去了(毕竟记性不好,还是写下来靠谱):
[个人知识点整理用wiki](https://github.com/TangMisaka23001/TangMisaka23001.github.io/wiki)

对于wiki的话其实也就是一个MarkDown文件的文件夹,大致的目录如下:
![](https://i.loli.net/2019/09/08/i32CrFwuNR9KgXA.png) 
主要是*_Footer.md*,*_Sidebar.md*,*Home.md*三个文件,需要注意的是没有*Home.md*这个文件的话进入wiki看到的就是文件列表了.还有一点需要吐槽的是wiki默认的git方式是*https*的,需要自己手动改成ssh方式的不然就还是需要账号密码而不能用密钥的方式了.

# 博客HTTPS
关于https,很早之前就已经用上了,当时使用的是[cloudflare](https://www.cloudflare.com/)的免费HTTPS方式,但是现在发现GitHub Pages已经自己支持HTTPS了,就改用GitHub自带的了:
![](https://i.loli.net/2019/09/08/DUvbmxSuV6efX2q.png) 

# VSCode remote
因为现在一直在用VSCode写MarkDown而在经历了整合仓库之后在clone的时候发现网速巨慢,大概需要10-30min才能把仓库clone下来,实在是无法忍受之后想到了用阿里云的服务器来写博客,之前也是对VSCode remote略有耳闻就Google并且尝试了一下,目前来看在写Markdown这一块还是很不错的并且由于文件保存在服务器上所以哪怕没有保存的修改也不会丢失.

## 步骤
1. 下载openssh:[OpenSSH-Win64.zip](https://github.com/PowerShell/Win32-OpenSSH/releases/download/v8.0.0.0p1-Beta/OpenSSH-Win64.zip)
2. 添加到Path
3. PowerShell使用`ssh xxx@xxx.xxx.xxx`尝试连接服务器
4. VSCode安装Remote的插件
5. 在本地的.ssh/config文件下进行服务器的配置:
![](https://i.loli.net/2019/09/08/8IgnytEAW3VuzLF.png)
6. 完成之后如下就已经可以了:
![](https://i.loli.net/2019/09/08/zc2Om3BN5KqdeRa.png) 

# Windwos Terminal && WSL
先来一个效果图吧(想自定义主题的但是目前好像文章不是很多还得好好研究一下):
![](https://i.loli.net/2019/09/08/bYMize3ckp8lst7.png) 

Win10下的安装也很简单就不在赘述了,下面就放一下配置文件好了:
```json
{
    "globals" : 
    {
        "alwaysShowTabs" : true,
        "copyOnSelect" : false,
        "defaultProfile" : "{9acb9455-ca41-5af7-950f-6bca1bc9722f}",
        "initialCols" : 120,
        "initialRows" : 30,
        "keybindings" : 
```
这里主要是`defaultProfile`这个字段,对应下面每个terminal类型的`guid`,我改成了默认启动WSL的窗口.

```json
"profiles" : 
    [
        {
            "acrylicOpacity" : 0.75,
            "closeOnExit" : true,
            "colorScheme" : "Vintage",
            "commandline" : "wsl.exe",
            "cursorColor" : "#FFFFFF",
            "cursorShape" : "bar",
            "fontFace" : "Fira Code",
            "fontSize" : 10,
            "guid" : "{9acb9455-ca41-5af7-950f-6bca1bc9722f}",
            "historySize" : 9001,
            "icon" : "ms-appx:///ProfileIcons/{9acb9455-ca41-5af7-950f-6bca1bc9722f}.png",
            "name" : "WSL",
            "padding" : "0, 0, 0, 0",
            "snapOnInput" : true,
            "startingDirectory" : "//wsl$/Ubuntu/home/tang",
            "useAcrylic" : true
        },
```
这是WSL的配置文件,`icon`这个是需要更换的,目录是在(我的文件夹权限有点问题就用命令行来查看了):
![](https://i.loli.net/2019/09/08/5bvTHJOGSzMClR7.png) 

把`guid`和`icon`一起改掉就ok了.

我还更换了一下字体:`"fontFace" : "Fira Code",` 关于字体可以自行Google.

终端主题在下面的`"schemes" : `里有自带默认的几个风格.修改到`"colorScheme" : "Vintage",`这个字段就可以应用.

可以看出这一次巨硬还是很良心的,而且配置文件也很容易修改,可以说是Win开发的一大福音了.
# id_rsa
> 以前的我只知道莽,无脑生成密钥就完事了.

但是在经历了许多环境和服务器的摧残之后,还是认识到了使用一套自己的密钥的重要性了,于是在生成了一套之后把GitHub和服务器都替换了一下,现在就very方便了(顺便保存在了1password里).
# Pi_hole
可以查看示例:[Pi_hole Admin](http://dns.misakatang.cn)

知道这东西是在老莱的频道发现的:[【官方双语】世界清净了...用树莓派屏蔽所有在线广告！#linus谈科技](https://www.bilibili.com/video/av65936575)

感觉还挺有意思的但是介于没有树莓派然后又想到*服务器不是有公网ip吗*,于是就在阿里服务器上搭了一个,一开始感觉还非常不错但是在经历了更多网页的洗礼之后发现还是不太行,现在用的是adblock+Pi hole的双重过滤方式.

需要注意的是如果在服务器上部署需要在安全组里开放53的UDP端口,是DNS需要的端口.

安装的话由于有一键脚本,直接跟着做就成了所以也就不在赘述了.
```bash
curl -sSL https://install.pi-hole.net | bash
```

(后期补充:docker脚本)
```bash
docker run -d \
    --name pihole \
    -p 53:53/tcp -p 53:53/udp \
    -p 8081:80 \
    -p 443:443 \
    -e TZ="Asia/Shanghai" \
    -v "$(pwd)/etc-pihole/:/etc/pihole/" \
    -v "$(pwd)/etc-dnsmasq.d/:/etc/dnsmasq.d/" \
    --dns=127.0.0.1 --dns=1.1.1.1 \
    --restart=unless-stopped \
    pihole/pihole:latest
```

# 自建RSS
我也算是个轻度的RSS使用者了吧,之前一直在使用Inoreader但是最近发现广告变多了而且免费账户着实有些弟弟,就想着反正有个服务器就克服一下懒癌尝试一下吧.

然后Google了一顿还是发现之前看过的:[如何搭建属于自己的 RSS 服务，高效精准获取信息](https://sspai.com/post/41302)感觉还不错就跟着做了,不得不说:真香. 在docker的加持之下安装是非常之简单了,唯一的坑是Mercury 的全文插件,现在已经需要自建了, 然后参考了:[通过Docker安装Tiny RSS，mercury全文插件及mercury-parser-api；申请域名通配符证书，安装nginx并配置ssl ](https://libertyleadingnetwork.blogspot.com/2019/03/dockertiny-rssmercurymercury-parser.html) 使用docker安装了Mercury Parser API.

直接使用
```
docker run -p 3000:3000 -d --restart=always  wangqiru/mercury-parser-api
```
然后配置API地址就可以了,当然之前是使用API KEY的形式.

然后把Inoreader的订阅源导入过来就成了,有一点值得吐槽的是Inoreader导出的opml文件竟然是xml格式的,然后直接导入ttrss就会失败,但是改一下后缀就ok了.
# [TabNine](https://tabnine.com/)
据说是**杀手级AI代码补全工具**,毕竟现在是"AI大数据"的时代就下载下来蹭一下热度呗,实际的使用体验还算是不错,写Markdown的时候竟然也会提示单词的补全,好评.

在idea也装了插件,补全智能程度还算是非常的不错,在填参数的时候甚至会帮你补全后面的')'.

介绍的文章也很多我也就不再唠叨用就完事了(毕竟我只是个记录贴 :)