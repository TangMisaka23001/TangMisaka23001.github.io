---
title: 使用Yarr和ChatGPT翻译插件高效阅读RSS内容
mathjax: false
date: 2023-04-01 21:33:12
categories: [效率]
tags: [Docker, Nginx, RSS, ChatGPT, Chrome插件]
---
## 为什么放弃inoreader
在经过漫长的鸽期之后吾辈又回到了博客上，也只有慢节奏的生活享受得起写博客这么奢侈的消遣了。秉持着高效摸鱼（bushi）获取信息的原则一直在使用RSS订阅各种新闻源和博客，从Feedly到TTRSS再到Inoreader再到Yarr也算是经过了许多番的折腾。在订阅了Inoreader一年的基础会员快到期的时候为什么又换用（折腾）了Yarr，下面是吾辈的理由（借口 bushi）。
<!-- more -->
### 到期了
这是一个很现实的问题，特别是放在**降本增效，开源节流**大行其道的今天。虽然inoreader基础版的会员并不贵但是由于薅了腾讯云3年服务器的羊毛，作为一个高级**self hosted OPS**工程师，还是更倾向于使用一个能够自建的RSS工具。
### 基础版功能有点弱
虽然说吾辈对于RSS工具的要求没有那么高，但是在Inoreader订阅即将到期的时候却被其狠狠的伤害了一通。
#### 惰性加载的RSS源
**lazy load**作为一个经典技术一直被大家所使用，但是却被inoreader用在了不应该出现的地方，因为吾辈订阅了淘宝的**数据库内核月报**但是却许久没有收到，在一个神秘的午后受到RSS之神的号召点开订阅源看了一下更新频率竟然是**0/周**，当我以为是淘宝也鸽了的时候inoreader却像感受到了什么一样一口气把之前遗漏的内容一口气全都推了过来。啊，这。。
#### 信任危机
当信任危机出现之后就很难弥补了，毕竟我也不知道还有哪些应该在更新的内容被你**lazy load**了。而看了一眼PRO会员之后我就决定开始再次背上行囊寻找新的RSS工具了。
## 为什么放弃TTRSS
TTRSS作为一个自建RSS领域不得不提的工具，确实久经考验。在inoreader之前吾辈也是他的忠实用户，而当时抛弃他的原因有以下两个：

### 自建使用子路径反代有问题
当时作为一个初级self hosted OPS工程师对Nginx并没有那么的熟练，而且大学的时候TLS证书还是一个稀罕玩意儿，所以当时只签了www这一个二级域名的证书放在服务器上，于是便尝试把TTRSS放在`/ttrss`的子路径之上，期间历经波折甚至还fix了一波[Awesome TTRSS](https://ttrss.henry.wang/)的[文档错误](https://github.com/HenryQW/Awesome-TTRSS/commit/ec6f6b01b1925a8f7fc8bcc5a5cd51ff2e0475b5)。不过最终也没有能够完美的解决这个问题，还是有许多请求会404（比如点标题不能去原网页）。

### CF 5秒盾
虽然折腾了很久的反代而且问题没有完美解决，但是也勉强能用。而真正让我放弃TTRSS转投inoreader并给他打钱的原因是某个新闻源加上了CF的5秒盾，这一下就导致了内容完全没办法看。于是在遍历了许多其他的RSS工具之后还是凉心发现投入了inoreader的怀抱。

## Yarr - 简单才是最好的
第一次看到这个工具的时候觉得其过于的**简单**了，但是在看到作者的这个issue-[yarr is feature complete](https://github.com/nkanaev/yarr/issues/57)之后，便勾起了我的好奇心。我倒要试试是不是complete了。

启动，导入，刷新订阅源。

虽然界面简洁，但是确实包含了全部需要的功能。

![](https://misakatang.oss-cn-beijing.aliyuncs.com/blog_picture/2023-04-02-puF2iC.png)

并且还有**read here**这么杀手级的feature，直接就给我拿下了。
### 沉浸式翻译插件
在ChatGPT风靡的这段时间，无意中看到了这个[沉浸式双语网页翻译扩展](https://immersive-translate.owenyoung.com/)的插件。当使用PPAP法则对这两者进行操作之后，我意识到，革命确实到了。

#### GPT3.5
之前很少看英文网页的原因无非是英文水平太差（queshi），而谷歌翻译也是非常的拉胯，作为翻译日常信息源来说。但是GPT3.5的翻译质量不能说原地踏步吧只能说是突飞猛击了，在整合上这个网页内翻译的插件，对于阅读英文信息源来说，只能是，诶，起飞，怎么说

#### 革命的见证者
当然眼见为实，在**read here**配合上**沉浸式翻译插件**之后，我的阅读体验提升了九倍甚至十倍有余。

![](https://misakatang.oss-cn-beijing.aliyuncs.com/blog_picture/2023-04-02-J7HobC.png)


## 总结
当然，折腾之路永不停止，这也只是可能今年最好的方案。如inoreader的pro会员可以整合GPT翻译甚至**量子速读**功能的话，我也必然会继续乖乖交钱。因为GPT确实是这几年以来令我最激动并且能够带给我最多实质性收益的科技进步了。