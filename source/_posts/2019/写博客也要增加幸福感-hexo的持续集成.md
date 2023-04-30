---
title: 写博客也要增加幸福感--hexo的持续集成
categories:
  - 技术
tags:
  - CI
  - hexo
mathjax: false
date: 2019-01-12 14:25:58
---

# 开始
之前写完博客需要:
```
hexo g
hexo d
hexo b
```
一系列的操作发布到github上之后再备份,这一点都不*cooooooooool!*,在之前做博客备份的时候就看到过有人使用CI来发布文章的,当时没有觉得很重要,而在经历了一次**博客源文件丢失**以及**换电脑环境**之后,才发现能够直接push一篇md就能完成整个流程是这么的美好,下面就记录一下整个配置流程(略有小坑)

# Travis CI
这里使用了[Travis CI](https://travis-ci.org/)来作为持续集成的工具,当然其他的工具也是同理
## 登录Travis CI
这里可以直接使用你的github帐号登录Travis CI不做赘述,登录之后执行下面的操作:
![](https://i.loli.net/2019/01/12/5c398a979e286.png) 

## 获取github的ACCESS_TOKEN
在github的Settings ==> Developer settings ==> Personal access tokens选择生成一个新的token,这里的token名字需要记住:
![](https://i.loli.net/2019/01/12/5c398b30e0e36.png) 

## 配置Travis CI环境
在刚才的setting页面下的环境中填写:
1. 刚才在github上设置的名字
2. update token之后复制的值
3. add到环境
![](https://i.loli.net/2019/01/12/5c398b61b26d7.png) 

# 博客配置
因为hexo需要将生成的文件推到github.io主页的master分支上才能正确展示,所以需要创建分支然后将hexo博客的文件上传上去,由于我之前做过backup,所以直接使用了backup分支.
## 创建.travis.yml文件
添加内容如下:
```yml
# 更新了脚本因为用了leancloud来统计访问次数
language: node_js   #设置语言
node_js: stable     #设置相应的版本
notifications:
  email:
    - mikasatang@gmail.com  #开启邮件通知
  on_success: always
  on_failure: always
cache:
    directories:
        - node_modules    #据说可以减少travis构建时间
before_install:
  - npm install -g hexo-cli
install:
  - npm install   #安装hexo及插件
  - npm install hexo-deployer-git --save
  - npm install hexo-git-backup --save
script:
  - hexo clean
  - hexo g   #生成
after_script:
# 替换同目录下的_config.yml文件中gh_token字符串为travis后台刚才配置的变量，注意此处sed命令用了双引号。单引号无效！
  - sed -i "s/gh_token/${Travis_CI}/g" ./_config.yml
  - grep "repo" ./_config.yml
  - touch ./public/CNAME
  - echo "misakatang.cn" >> ./public/CNAME
  - git config --global user.name "misakatang"
  - git config --global user.email "mikasatang@gmail.com"
  - hexo deploy
branches:
  only:
  - backup  #只监测这个分支，一有动静就开始构建
```

# 推送到分支开始构建
接下来只需要将文件推送到hexo文件的分支就会开始执行构建了. ex:
![](https://i.loli.net/2019/01/12/5c398ce5b4360.png) 

当然,每次都需要:
```
git add .
git commit -m "blog update"
git push origin backup
```
这也很不coooooool,所以直接如下:
`git config --global alias.blog '!git add . && git commit -m "blog update" && git push origin gh-pages'`
执行之后以后每次只需要执行`git blog`就可以推送博客到备份分支开始自动构建了,**这下真的coooooool了.**

# 一些小操作
1. [MarkdownPicPicker](https://github.com/kingname/MarkdownPicPicker):可以将剪切板的截图文件上传到(默认smms,可以自定义)图床并且直接返回md格式的链接,然后将其添加到path中,每次截图之后只需要运行命令就可以直接获得一个md格式的截图链接~~
2. 之前都是直接`hexo new`了博客就写,但是没写完需要修改之前的博客就很蛋疼,然后发现可以先`hexo new draft`打草稿,写好之后再`hexo publish <filename>`发布到_posts中区
