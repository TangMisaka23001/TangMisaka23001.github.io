---
title: 使用Hexo以及GithubPage搭建个人博客历程
date: 2017-07-04 13:06:51
categories: [Hexo]
---
[](#简介 "简介")简介
==============

暑假开始了，自己打算在暑假自学的同时写点博客，为的是能够再以后想要回忆一些学过的东西的时候有一个可以翻看的地方，感觉之前学习的时候没有记录的原因，很多东西学完许久不用之后再学习成本还是很高，若是有一个博客的话，应该可以解决这个问题。再一个以这种方式来自学可以更好的梳理一些内容。  
所以在开始之前就先来搭一个博客，自己选择的是Hexo以及GithubPage的方式来搭建博客，Hexo的安装以及使用都很方便，可以直接使用的主题也能够满足我的需求，GithubPage也省去了自己买服务器的钱以及搭建环境的时间。

[](#开始-环境准备 "开始-环境准备")开始-环境准备
=============================

[](#安装Node-js "安装Node.js")安装Node.js
-----------------------------------

安装Node.js还是很简单的，到[Node.js](https://nodejs.org/en/)官网下载系统对应的安装包然后选择默认一路安装下来就好。

[](#安装Git "安装Git")安装Git
-----------------------

Git是早已经安装好了的，可以查阅[官方自带的教程](https://git-scm.com/book/zh/v2/%E8%B5%B7%E6%AD%A5-%E5%AE%89%E8%A3%85-Git) 下载可执行文件安装之后配置一下Path路径，在cmd中可以启动git就可以了。

[](#安装Visual-Studio-Code "安装Visual Studio Code")安装Visual Studio Code
--------------------------------------------------------------------

在这之前我都还是主要在使用sublime来写代码，但是发现vs code还是挺好用的，而且对于Markdown的自带支持也比较好，就选择用vs code来作为写博客的工具了。  
[下载地址](https://code.visualstudio.com/)贴在这里，直接一路安装就好。

[](#Github "Github")Github
--------------------------

*   在[Github官网](https://github.com/)注册一个Github帐号
*   在帐号下创建一个代码仓库，格式为**github用户名.github.io**(有些教程中创建的仓库为com结尾的，现在github好像只支持io结尾的网址了)
*   添加SSH公钥到git账户（具体操作方式查看[Github官方提供的说明](https://help.github.com/articles/connecting-to-github-with-ssh/)）  
    生成的SSHKey默认会在User目录当前用户的.ssh文件夹下（文件夹为隐藏文件夹），也可以在生成的时候指定生成到指定目录，但是我直接生成在.ssh文件夹下了。然后将SSHKey添加到Git账户中就好了。

[](#安装Hexo "安装Hexo")安装Hexo
==========================

在cmd中直接输入

> $ npm install -g hexo-cli

进行安装

之后在本地创建一个文件夹来存放Hexo初始化的文件，如：

> hexo init hexo

或者创建文件夹之后在里面运行

> hexo init

[](#生成静态页面 "生成静态页面")生成静态页面
--------------------------

在安装结束之后cd进入文件夹执行

> hexo g 或者 hexo generate

执行之后会生成一个public的目录，里面存放的就是博客的内容。  
然后执行

> npm install

就可以新建完成。

[](#本地测试 "本地测试")本地测试
--------------------

> hexo s 或者 hexo server

执行上述命令便可以在本地的_localhost:4000/_端口启动一个服务器，可以看到一个hexo自带的博客页面。

### [](#自己踩的坑 "自己踩的坑")自己踩的坑

在服务启动之后在4000端口始终无法访问到博客的页面，后来才发现是因为4000端口已经被占用了！！略坑  
在cmd中输入

> netstat -ano|findstr “4000”

可以查看是哪个进程占用了4000端口，然后打开任务管理器找到对应pid的进程，先打开所在文件夹确定是什么软件占用的，然后直接结束进程就好，之后在启动项管理里面找到了这个应用的启动服务，直接禁止启动（我找到的是福昕阅读器的启动项服务占了4000端口）。之后再重新开启服务应该就可以在4000端口看到博客页面了。  
还有一个解决办法是在启动hexo服务的时候更换端口，但是这样可能遇到别的端口冲突问题。启动方式如下：

> hexo server -p 5000(自己修改端口)

[](#开始写文章 "开始写文章")开始写文章
=======================

现在就可以开始写文章了，最基本的命令是

> hexo new “文章名”

这样就会生成一个对应文章名称的Markdown文件，就可以开始写东西了。

[](#config-yml配置文件 "_config.yml配置文件")_config.yml配置文件
====================================================

关于_config.yml配置文件的详细信息可以直接在[官方文档](https://hexo.io/zh-cn/docs/configuration.html)中查看，配置文件里也有详细的注释。

### [](#关于站点信息的配置文件 "关于站点信息的配置文件")关于站点信息的配置文件
```yml
# Site
title: MisakaTang's Blog
subtitle:
description:
author: MisakaTang
language:
timezone:
```
### [](#关于生成的public目录中文件夹名的配置 "关于生成的public目录中文件夹名的配置")关于生成的public目录中文件夹名的配置
```yml
# Directory
source_dir: source
public_dir: publi
ctag_dir: 标签
archive_dir: 归档
category_dir: 分类
code_dir: downloads/code
i18n_dir: :
langskip_render:
```
[](#主题安装 "主题安装")主题安装
====================

主题可以在Hexo官方的[Theme](https://hexo.io/themes/)中自己来找喜欢的主题安装。  
安装命令：

> git clone [https://github.com/A-limon/pacman.git](https://github.com/A-limon/pacman.git) themes/pacman

_[Pacman主题介绍](http://a-limon.github.io/pacman/hello/introducing-pacman-theme/)_

安装成功之后将_config.yml配置文件中的theme改成对应主题的名字  
```yml
# Extensions
## Plugins: https://hexo.io/plugins/
## Themes: https://hexo.io/themes/
theme: pacman
```
[](#自己踩的坑-1 "自己踩的坑")自己踩的坑
-------------------------

主要是主题的坑

*   第一个是主题的author图片加载不出来将_themes/pacman/_config.yml_文件中的author_img修改成如下：
    
    > author_img: ../img/author.jpg ## size:220px*220px.
    
*   第二个是代码高亮没有显示在上面的配置文件里面添加：

```yml    
highlight:    
    enable: true
```


即可。

[](#一些主题配置文件中的配置 "一些主题配置文件中的配置")一些主题配置文件中的配置
============================================

官方给的介绍和配置文件中的注释都写的很详细了，就不再做过多的描述，贴一下配置文件（主要是社交帐号的）  

```yml
author:  
google_plus: 112654764759361777634  ##eg:116338260303228776998 for https://plus.google.com/u/0/116338260303228776998  
intro_line1: "This is MisakaTang'Blog" ## eg: "Hello ,I'm Larry Page in Google."  
intro_line2: "while true: forever love you;" ## eg: "This is my blog,believe it or not."  
weibo:      u/1966604454 ## e.g. 436062867 for http://weibo.com/436062867  
twitter:    ## e.g. yangjiansky for https://twitter.com/yangjiansky  
github:     913647909 ## e.g. A-limon for https://github.com/A-limon  
facebook:   ## e.g. yangjian for https://favebook.com/yangjian  
tsina:      1966604454 ## e.g. 1664838973  Your weibo ID,It will be used in share button.  
linkedin:   ## e.g. in/jeffweiner08 for https://www.linkedin.com/in/jeffweiner08
```

[](#404页面 "404页面")404页面
=======================

这个用来做一下公益，看过的博客里面都提到过，在public目录下面创建404.html文件然后引入js即可。  
[腾讯公益](http://www.qq.com/404/?r=1499168271827)

[](#图床 "图床")图床
==============

图床选择了七牛云，现在实名认证之后可以几乎免费使用，而且速度也非常不错。  
在官网注册好之后创建一个对象存储（记得选公开的仓库），windows端可以下载官方提供的[同步工具](https://developer.qiniu.com/kodo/tools/1666/qsunsync)来将本地文件夹中的图片同步到七牛云，要使用的时候只需要点击内容管理中对应图片的操作，然后选择复制外链，就可以直接填写在Markdown的DataUrl里面。

[七牛云官网网站](https://portal.qiniu.com)  
[来贴一个自己的推广链接](https://portal.qiniu.com)

[](#自己申请域名 "自己申请域名")自己申请域名
==========================

现在我使用的是[腾讯云](https://www.qcloud.com/)，购买域名很优惠，我领券之后可以免费使用一年，解析也可以直接在腾讯云里面进行，很方便。

[](#github-io绑定自己的域名 "github.io绑定自己的域名")github.io绑定自己的域名
========================================================

*   首先来将Hexo写的博客push到自己的github.io的仓库。

只需要在_config.yml文件里添加  
```yml
deploy:
    type: 
    gitrepo: git@github.com:913647909/913647909.github.io.
    gitbranch: master
    message: "update"
```
repo填写自己的github仓库对应的地址就可以。

*   然后在public目录下面添加一个CNAME文件，里面写上自己购买的域名就好 [![](http://osjwl2nd9.bkt.clouddn.com/cnamejietu.jpg)](http://osjwl2nd9.bkt.clouddn.com/cnamejietu.jpg)
*   接着在cmd里使用ping来确定自己githubPage的IP地址，然后对于该IP在域名里创建一个A记录的解析  
    [![](http://osjwl2nd9.bkt.clouddn.com/jiexi1.jpg)](http://osjwl2nd9.bkt.clouddn.com/jiexi1.jpg)
*   接着在hexo的博客目录下面输入
    
    > hexo d  
    > 就可以将本地的博客文件上传到对应的github.io仓库
    

### [](#小坑 "小坑")小坑

要先安装一个插件

> npm install hexo-deployer-git —save

接下来就可以通过自己的域名来访问博客页面了。  
[![](http://osjwl2nd9.bkt.clouddn.com/2017741.jpg)](http://osjwl2nd9.bkt.clouddn.com/2017741.jpg)  
**注：** 之后可以在写完博客之后使用`hexo s -g`调试或者`hexo d -g`来提交，可以少敲一行代码。

[](#自己的搭建体会以及注意点 "自己的搭建体会以及注意点")自己的搭建体会以及注意点
============================================

一开始的时候被4000端口先整了一下，排除问题之后在写CNAME的时候将域名写错了，又小坑了一下，所以域名还是**直接复制比较好**！！。接着在配置hexo d命令的时候，在配置文件写的时候**少加了一个空格**，命令总是没用，之后又爬了出来，接下来关于七牛云自带的同步软件也是略坑，第一次同步结束之后自己就停止运行了，但是之后还好没有出现问题，但是每次打开这个软件只能同步一次，第二次报错**获取空间列表时出错**，现在还没有找到问题所在。再然后，其实github的仓库根本是不需要clone下来的，也就是在hexo init 的时候**文件夹一定要是空的**，不然init不了。在这些都解决之后，现在勉强可以开始写博客了，但是可能还是会有一些小问题。之后会仔细看一下hexo和主题的配置文件，尽量把网站做的鲁棒一点。

[](#参考链接（特别鸣谢） "参考链接（特别鸣谢）")参考链接（特别鸣谢）
======================================

[手把手教你使用Hexo + Github Pages搭建个人独立博客](https://linghucong.js.org/2016/04/15/2016-04-15-hexo-github-pages-blog/)  
[hexo你的博客](http://ibruce.info/2013/11/22/hexo-your-blog/)  
[Window 通过cmd查看端口占用、相应进程、杀死进程等的命令](http://blog.csdn.net/jiangwei0910410003/article/details/18967441)  
[Pacman主题介绍(以及对应的github主页)](http://a-limon.github.io/pacman/hello/introducing-pacman-theme/)  
[神秘的程序员们表情包和头像包](http://mp.weixin.qq.com/s?__biz=MzAxMzMxNDIyOA==&mid=508061199&idx=1&sn=634eeb11d11376147d428025e3e29bcc&chksm=0018b7d4376f3ec2430b92840269d9edf0ef884d4d6ee49eaf47679adc079722da4859ba5743&mpshare=1&scene=23&srcid=0704d4AsNI5YWyBSk6xmSppn#rd)

[](#写在后面 "写在后面")写在后面
====================

这也算是暑假的开始了，用了两天时间把博客搭了起来，希望自己可以坚持写下去，能在暑假给自己更多的收获吧。