---
title: 重新折腾了一下博客的CI脚本
mathjax: false
date: 2020-04-25 13:58:28
categories: [问题解决]
tags: [Travis CI, CI, hexo]
---
**leancloud_counter_security插件生成的leancoud.memo问题**

之前在配置了leancloud_counter_security插件之后就没有在意了,但是最近注意到没有收到ci的构建邮件了就去重新看了一下ci配置,果然还是问题重重.
<!-- more -->
## Travis CI 整合 leancloud_counter_security
因为一开始做ci的整合的时候对ci脚本并没有很深的理解,所以也就是拿来就用,在熟悉了ci后的现在再来审视脚本就感觉有很多可以调整的地方.

首先是完全忘记了安装插件 ... 因为之前集成的时候只是在本地测试了一下,并没有注意到ci脚本需要修改而遗留的问题
> `npm install hexo-leancloud-counter-security`

### leancloud.memo
这个文件主要是因为在blog过多之后如果继续使用白嫖的leancoud服务的话就容易报`Too Many Request`的问题而做的改进,在每次deploy的时候会对数据做一个本地备份,而在ci脚本中,之前完全没有意识到这个问题,从而导致了每次在ci服务器上生成的.memo文件生成完就被丢弃了,可以说完全没有起作用,所以主要也是要解决leancloud.memo的持久化问题.

#### 思路
因为在配置Travis CI的时候已经授权过一个access token了,所以可以直接借用这个token来进行操作.

直接使用https的形式来进行文件的push:
> `git push -u https://${Travis_CI}@github.com/TangMisaka23001/TangMisaka23001.github.io.git source`

只需要每次在deploy之后往源文件的仓库把memo文件的更新push进去就可以了.

添加的脚本如下:
```yml
  # leancloud统计相关
  # checkout命令比较玄学,个人并不是很理解因为clone下来的应该就是source分支的代码
  # 当时也被这个坑了很久,猜测可能是在deploy的时候影响了仓库的分支吧
  - git checkout source
  - git add source/leancloud.memo
  # [skip ci] 用于跳过因为这次commit而产生的ci构建防止构建套娃 (因为现在只检测 source分支有变动就会进行一次构建)
  - git commit -m "update leancloud.memo [skip ci]"
  - git push -u https://${Travis_CI}@github.com/TangMisaka23001/TangMisaka23001.github.io.git source
```
所以说**持续保持ci脚本的正确性**还是很重要的 !!!

### 现在ci脚本
```yml
language: node_js   #设置语言
node_js: stable     #设置相应的版本
notifications: #开启邮件通知
  email:
    recipients:
    - mikasatang@gmail.com  
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
  - npm install hexo-leancloud-counter-security
script:
  - hexo clean
  - hexo g   #生成
after_script:
  # 替换同目录下的_config.yml文件中gh_token字符串为travis后台刚才配置的变量，注意此处sed命令用了双引号。单引号无效！
  - sed -i "s/gh_token/${Travis_CI}/g" ./_config.yml
  # 部署博客相关命令
  - echo "misakatang.cn" > ./public/CNAME
  - cp LICENSE ./public
  - cp README.md ./public
  - git config --global user.name "misakatang"
  - git config --global user.email "mikasatang@gmail.com"
  - hexo deploy
  # leancloud统计相关
  - git checkout source
  - git add source/leancloud.memo
  - git commit -m "update leancloud.memo [skip ci]"
  - git push -u https://${Travis_CI}@github.com/TangMisaka23001/TangMisaka23001.github.io.git source
branches:
  only:
  - source  #只监测这个分支，一有动静就开始构建
```