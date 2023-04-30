---
title: 用Jenkins pipeline(流水线)实现SpringBoot Application的docker构建和持续集成(CI)
mathjax: false
date: 2019-10-11 10:27:32
categories: [技术]
tags: [Jenkins, docker, CI]
---
# 写在前面
在看了许多CI的内容之后,正好碰上公司尝试把应用容器化以及进行持续集成(之前还是需要手动执行启停脚本),然后我便成了第一个吃螃蟹的人,在一阵折腾之后也勉强算是把整个流程给走通了便在这里记录一下大致的流程和踩到的坑,也是对最近许久不更新的博客增加一些新东西吧.
# 部署流程
首先描述一下整个部署的流程来理清一下整个逻辑，这里仅仅是给出我自己的暂时的解决方案，由于业务和环境的不同必定没有完全一样的流程，并且这也只是暂时的方案还是有很多可以优化的地方。

```
更新代码 ==> 触发Jenkins流水线的构建 ==> Maven打包项目 ==> 制作docker image ==> 
上传image(这里使用阿里的镜像服务) ==> 远程服务器执行部署脚本 ==> 判断部署状态(nacos api)
```
需要注意的是：
1. 项目的仓库中包含了Jenkinsfile和部署的脚本(全部交由版本控制)
2. 由于线上服务器为阿里ECS并且外网无法访问，所以使用了部署服务器(外网IP)来做跳转和部署
3. 因为项目使用了SpringCloud的微服务框架并且使用了NACOS注册中心，所以在服务的优雅下线重启阶段使用了nacos的服务调度API并没有使用SpringCloud自带的端点，当然本质都是通过接口调用告知注册中心下线服务
4. 由于线上服务器均没有使用root用户来发布应用所以在这里踩了小坑，暂时的解决方案可能并不完美
<!-- more -->
# Jenkins
## 安装
官方教程的链接：[Installing Jenkins](https://jenkins.io/doc/book/installing/)

当然这里还是用了docker安装的方式，官方的命令如下：
```bash
docker run \
  -u root \ 
  --rm \ 
  -d \ 
  -p 8080:8080 \ 
  -p 50000:50000 \ 
  -v jenkins-data:/var/jenkins_home \ 
  -v /var/run/docker.sock:/var/run/docker.sock \ 
  jenkinsci/blueocean
```
最主要的命令还是两个-v的参数了，一个是指定Jenkins文件的存放位置，第二个则是**docker in docker**的关键命令了，这个挂载能够让安装在docker里的Jenkins使用docker命令。

### not work？
没错，这个命令在我司的服务器上并没有生效，可能是因为安装的docker版本过低的原因，在一番面向Google编程之后找到了如下的方式：[How to build docker images inside a Jenkins container.](https://medium.com/@manav503/how-to-build-docker-images-inside-a-jenkins-container-d59944102f30)，本质还是docker in docker，不过需要自己制作镜像，Dockerfile文件如下：
```
FROM docker.io/jenkins/jenkins:latest

USER root
RUN apt-get update -qq \
    && apt-get install -qqy apt-transport-https ca-certificates curl gnupg2 software-properties-common 
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add -
RUN add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/debian \
   $(lsb_release -cs) \
   stable"
RUN apt-get update  -qq \
    && apt-get install docker-ce=17.12.1~ce-0~debian -y
RUN usermod -aG docker jenkins
```
构建镜像命令：
```
docker image build -t jenkins-docker .
```
docker run 命令和上面一样

## pipeline（流水线）
官方的文档：[流水线语法](https://jenkins.io/zh/doc/book/pipeline/syntax/)

在自己实践的过程中踩了不少的坑，到最后还是发现官方文档最靠谱，所以有什么解决不了的问题还是先求助官方文档为上。

这里给出测试和生产两个环境的Jenkinsfile用于参考：

测试环境
```
/*
在接触Jenkins流水线的时候最迷惑的就是语法中的pipelinee和node两种组织形式，
一开始使用的是pipeline，但是在看文档的时候又有很多node的写法就感到非常的难受，
总体感觉上node的写法似乎支持更多的插件并且语法更友好但是发现的时候已经差不多写完了也就没有更改
*/
def host() {
    def remote = [:]
    remote.name = 'test'
    remote.host = 'xxxx'
    remote.user = 'xxx'
    remote.password = 'xxxx'
    remote.allowAnyHosts = true
    return remote
}

pipeline {

    agent any

    environment {
        // 这里主要是配置整个流水线所需要的变量，核心思想是要复用流水线和部署脚本的代码而只更改参数
        ENV = 'xx'
        SERVICE_NAME = 'xx'
        SERVER_IP = 'xx'
        SERVER_PORT = 'xx'
        SERVER_USER = 'xx'
        SERVICE_VERSION = 'xx'
        DOCKER_REPO = 'xx'
        DOCKER_NAMESPACE = 'xx'
        DOCKER_USERNAME = 'xx'
        DOCKER_PASSWORD = 'xx'
        NACOS_IP = 'xx'
        NAMESPACE_ID = 'xx'
        // jvm参数
        JAVA_OPTS = 'xx'
    }

    stages {
        stage('构建MAVEN项目') {
            agent {
                // docker in docker就是应用在这里了，使用maven的docker镜像来执行构建
                docker {
                    image 'maven:3-alpine'
                    // 映射本地的maven仓库到docker里防止每次都去远程仓库下载jar
                    args '-v /var/jenkins_home/.m2:/root/.m2'
                }
            }
            steps {
                // maven package
                sh 'mvn clean install -Dmaven.test.skip=true -Dproject.type=jar -Ptest package'
            }
        }

        stage('构建docker镜像') {
            agent {
                docker {
                    image 'docker'
                    // 这里的挂载比较奇怪，因为在上一步maven构建完成之后并没有生成target(现在想来可能是docker的缘故)，
                    // 所以把本地的maven仓库给挂载进来获取jar包使用了
                    args '-v /var/jenkins_home/.m2/repository/com/ghaoqi:/root/jar'
                }
            }
            steps {
                sh '''
                    rm -f docker/*.jar
                    cp /root/jar/${SERVICE_NAME}/${SERVICE_VERSION}-${ENV}/${SERVICE_NAME}-${SERVICE_VERSION}-${ENV}.jar ./docker/${SERVICE_NAME}.jar
                    cd docker
                    docker build -t ${SERVICE_NAME}:${SERVICE_VERSION} .
                '''
            }
        }

        stage('推送构建的镜像') {
            steps {
                // 这里使用了阿里云的容器镜像服务
                sh '''
                    docker login -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD} ${DOCKER_REPO}
                    docker tag ${SERVICE_NAME}:${SERVICE_VERSION} ${DOCKER_REPO}/${DOCKER_NAMESPACE}/${SERVICE_NAME}:${SERVICE_VERSION}
                    docker push ${DOCKER_REPO}/${DOCKER_NAMESPACE}/${SERVICE_NAME}:${SERVICE_VERSION}
                    docker image rm ${SERVICE_NAME}:${SERVICE_VERSION}
                    docker image rm ${DOCKER_REPO}/${DOCKER_NAMESPACE}/${SERVICE_NAME}:${SERVICE_VERSION}
                '''
            }
        }

        stage('部署到远程机器') {
             steps {
                 // 使用sed的核心思路还是保证脚本能够复用而只需要修改参数
                sh """
                    sed -e 's/__nacos_ip__/${NACOS_IP}/' \
                    -e 's/__serviceName__/${SERVICE_NAME}/' \
                    -e 's/__ip__/${SERVER_IP}/' \
                    -e 's/__port__/${SERVER_PORT}/' \
                    -e 's/__docker_repo__/${DOCKER_REPO}/' \
                    -e 's/__docker_namespace__/${DOCKER_NAMESPACE}/' \
                    -e 's/__docker_username__/${DOCKER_USERNAME}/' \
                    -e 's/__docker_password__/${DOCKER_PASSWORD}/' \
                    -e 's/__version__/${SERVICE_VERSION}/' \
                    -e 's/__user__/${SERVER_USER}/' \
                    -e 's#__JAVA_OPTS__#${JAVA_OPTS}#' \
                    -e 's/__namespaceId__/${NAMESPACE_ID}/' deploy.sh > replace.sh;
                """

                // Jenkins自带的ssh插件
                sshScript remote: host(), script: "replace.sh"
             }
        }
    }
}
```
生产环境：
```
pipeline {

    agent any

    environment {
        // 环境
        ENV = 'PRO'
        // 服务名 ip 端口 版本
        SERVICE_NAME = 'xx'
        SERVER_IP = 'xx'
        SERVER_PORT = 'xx'
        SERVER_USER = 'xx'
        SERVICE_VERSION = 'xx'
        // docker repo 内网ip
        DOCKER_INTERNAL_REPO = 'xx'
        // docker repo 外网ip（上传镜像用）
        DOCKER_PUBLIC_REPO = 'xx'
        // docker repo 命令空间 帐号密码
        DOCKER_NAMESPACE = 'xx'
        DOCKER_USERNAME = 'xx'
        DOCKER_PASSWORD = 'xx'
        // 注册中心地址 命名空间
        NACOS_IP = 'xx'
        NAMESPACE_ID = 'xx'
        // ssh 密钥文件
        SECRET_FILE = credentials('xx')
        // jvm参数
        JAVA_OPTS = 'xx'
    }

    stages {

        stage('构建MAVEN项目') {
            agent {
                docker {
                    image 'maven:3-alpine'
                    args '-v /var/jenkins_home/.m2:/root/.m2'
                }
            }
            steps {
                sh 'mvn clean install -Dmaven.test.skip=true -Dproject.type=jar -Ppro package'
            }
        }

        stage('构建docker镜像') {
            agent {
                docker {
                    image 'docker'
                    args '-v /var/jenkins_home/.m2/repository/com/ghaoqi:/root/jar'
                }
            }
            steps {
                sh '''
                    rm -f docker/*.jar
                    cp /root/jar/${SERVICE_NAME}/${SERVICE_VERSION}-${ENV}/${SERVICE_NAME}-${SERVICE_VERSION}-${ENV}.jar ./docker/${SERVICE_NAME}.jar
                    cd docker
                    docker build -t ${SERVICE_NAME}:${SERVICE_VERSION} .
                '''
            }
        }

        stage('推送构建的镜像') {
            steps {
                sh '''
                    docker login -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD} ${DOCKER_PUBLIC_REPO}
                    docker tag ${SERVICE_NAME}:${SERVICE_VERSION} ${DOCKER_PUBLIC_REPO}/${DOCKER_NAMESPACE}/${SERVICE_NAME}:${SERVICE_VERSION}
                    docker push ${DOCKER_PUBLIC_REPO}/${DOCKER_NAMESPACE}/${SERVICE_NAME}:${SERVICE_VERSION}
                    docker image rm ${SERVICE_NAME}:${SERVICE_VERSION}
                    docker image rm ${DOCKER_PUBLIC_REPO}/${DOCKER_NAMESPACE}/${SERVICE_NAME}:${SERVICE_VERSION}
                '''
            }
        }

        stage('部署到远程机器') {
             steps {
                sh """
                    sed -e 's/__nacos_ip__/${NACOS_IP}/' \
                        -e 's/__serviceName__/${SERVICE_NAME}/' \
                        -e 's/__ip__/${SERVER_IP}/' \
                        -e 's/__port__/${SERVER_PORT}/' \
                        -e 's/__docker_repo__/${DOCKER_INTERNAL_REPO}/' \
                        -e 's/__docker_namespace__/${DOCKER_NAMESPACE}/' \
                        -e 's/__docker_username__/${DOCKER_USERNAME}/' \
                        -e 's/__docker_password__/${DOCKER_PASSWORD}/' \
                        -e 's/__version__/${SERVICE_VERSION}/' \
                        -e 's/__user__/${SERVER_USER}/' \
                        -e 's#__JAVA_OPTS__#${JAVA_OPTS}#' \
                        -e 's/__namespaceId__/${NAMESPACE_ID}/' deploy.sh > replace.sh;
                """
                // 和测试唯一的区别就是在这里，主要是需要跳板服务器去部署线上的服务器(没有外网IP)
                // $SECRET_FILE是在Jenkins中保存的凭证，原本是可以直接保持ssh凭证然后使用对应的函数来获取的
                // 但是无奈不知为何不能获取，就直接使用了这种简单暴力的文件的形式来读取了
                // -oStrictHostKeyChecking=no 这个参数比较重要因为脚本执行的时候可不会自动输入yes
                // ssh xxx@xxx -C "/bin/bash" < xx.sh 可以用来在远程服务器上执行脚本
                // 在写sh脚本的时候选择使用 “” 还是 '' 来包含参数是很重要的，'' 的形式是完全不转义的也就是说不能使用sh的变量
                // 注意: 需要在服务器上配置ssh免密
                sh """
                    cat $SECRET_FILE > pc-libs
                    chmod 400 pc-libs
                    scp -i pc-libs -oStrictHostKeyChecking=no replace.sh libs@47.110.85.172:/home/libs/${SERVICE_NAME}.sh
                    ssh -oStrictHostKeyChecking=no -i pc-libs libs@47.110.85.172 \
                        'ssh -oStrictHostKeyChecking=no webs@${SERVER_IP} -C "/bin/bash" < /home/libs/${SERVICE_NAME}.sh';
                """
             }
        }
    }
}
```

# docker
下面命令在需要部署的服务器上执行:
```
$ curl -fsSL get.docker.com -o get-docker.sh
$ sudo sh get-docker.sh --mirror Aliyun
# 将当前用户加入 docker 组
$ sudo usermod -aG docker $USER
```
## 常用命令
- docker ps : 查看运行中的容器
- docker ps -a: 查看全部容器
- docker start [容器id]: 启动容器
- docker stop [容器id]: 停止容器
- docker rm [容器id]: 删除容器
- docker iamge ls: 查看本地iamge
- docker rmi [镜像id]: 删除本地image

注意： 所有 [容器id] 的地方都可以用空格分割来对多个容器进行操作

## Dockerfile
```
FROM java:8

ENV TimeZone=Asia/Shanghai

USER root
# 这里添加组和用户主要是线上服务是不用root启动的
# 如果不修改用户的话应用生成的日志都是root权限的无法操作
# 注意：简单来说，容器内外的所有用户是一样的，容器内的root可以看作就是服务器上的root
RUN mkdir /data \
    && groupadd -r webs \
    && useradd -d /data/webs -r -g webs webs \
    && mkdir -p /data/webs/common-data/logs \
    && mkdir -p /data/webs/common-data/logs/jvm-log \
    && chown -R webs:webs /data/webs \
    # 应用的时区修改，否则日志时间相差8小时
    && ln -snf /usr/share/zoneinfo/$TimeZone /etc/localtime \
    && echo $TimeZone > /etc/timezone

USER webs
ADD common-data.jar common-data.jar
# 启动应用的命令， JAVA_OPTS 在启动脚本中配置，在上面的pipeline变量中应该已经看到
# 目的是为了将全部变量都放置在一起配置保证复用
ENTRYPOINT java ${JAVA_OPTS} -jar common-data.jar
```

# 部署脚本
deploy.sh
```bash
# 准备变量
nacos_ip='__nacos_ip__'
serviceName='__serviceName__'
ip='__ip__'
port='__port__'
namespaceId='__namespaceId__'
docker_repo='__docker_repo__'
docker_namespace='__docker_namespace__'
docker_username='__docker_username__'
docker_password='__docker_password__'
version='__version__'
JAVA_OPTS='__JAVA_OPTS__'
user='__user__'

# 停止spring应用
url='http://'$nacos_ip'/nacos/v1/ns/instance'
data='serviceName='$serviceName'&ip='$ip'&port='$port'&namespaceId='$namespaceId'&enabled=false'
echo "下线正在运行的服务"
curl $url -X PUT  --data $data

# 等待10s确保没有流量
sleep 10

# 停止并删除docker运行的服务容器
containerId=$(docker ps -a | grep $serviceName | awk '{print $1}')
if [[ $containerId ]]
then
  echo "删除正在运行的容器服务"
  docker stop -t 60 "$containerId"
  docker rm "$containerId"
fi

echo "删除本地服务镜像"
localimage=$(docker image ls | grep $serviceName | awk '{print $1":"$2}')
if [[ $localimage ]]
then
  docker image rm "$localimage"
fi

echo "从镜像仓库拉取最新镜像"
docker login -u $docker_username -p $docker_password $docker_repo
image_name=$docker_repo/$docker_namespace/$serviceName:$version
docker pull $image_name
echo "运行docker服务"
mkdir -p /data/webs/$serviceName/logs
mkdir -p /data/webs/$serviceName/logs/jvm-log/
# 获取webs用户uid和gid
uid=$(id $user | awk '{print $1}' | grep -o "[[:digit:]]\{4\}")
gid=$(id $user | awk '{print $2}' | grep -o "[[:digit:]]\{4\}")
docker_id=$(docker run -v /data/webs/$serviceName/logs:/data/webs/$serviceName/logs \
                        -e JAVA_OPTS="$JAVA_OPTS" \
                        -p $port:$port -u "$uid:$gid" -d \
                        --name $serviceName --net host $image_name)

# 等待docker中java服务正式启动
sleep 60
# 查看服务是否启动
url='http://'$nacos_ip'/nacos/v1/ns/catalog/instances?'
data='serviceName='$serviceName'&clusterName=DEFAULT&groupName=DEFAULT_GROUP&pageSize=10&pageNo=1&namespaceId='$namespaceId
server_list=$(curl "$url$data" | python2 -c "import sys, json; res = [(str(d['ip'])+':'+str(d['port'])) for d in json.load(sys.stdin)['list']]; print res" | grep $ip | grep $port)
if [[ $server_list ]]
then
    echo "--------服务启动成功-------"
else
    echo "没有在注册中心获取到上线的服务，查看docker进程：$docker_id"
    res=$(docker ps | grep $serviceName)
    if [[ $res ]]
    then
      echo "docker进程包含服务容器，请重新检查服务是否上线"
      echo "$res"
      exit 1;
    else
      echo "--------服务启动失败！-------"
      exit 1;
    fi
fi

```
**停止spring应用**和**查看服务是否启动**并不是必需的，但是也算是为了服务能够**优雅下线**做的尝试吧，也可以看到大部分的参数也是这两个步骤带进来的，如果只对docker容器进行操作的话整个脚本会简单很多

这也可以说是第一次写这么多行的脚本，但是实质还是不是很难的，主要用到的是`awk`,`grep`,`if`和管道`|`，还有一个一行处理json的python(还挺不错)

# 总体使用流程
1. 在项目中编写Jenkinsfile和deploy.sh
2. 在Jenkins中新建流水线项目,填写项目的地址并选择Jenkinsfile
3. 需要部署项目的服务器安装docker并配置ssh免密登陆
4. Jenkins中点击构建

# 总结
这次项目向docker化的持续集成的迁移改造，前前后后也大致是花费了一个多星期了，但是整个流程下来也算是能够对Jenkins和docker更加的熟悉一点了吧
## 不足
当然由于每个组的技术不可能完全一致，CI的方式也肯定不尽相同，上面的方案也是草草交了的答卷，肯定是有很多优化的地方的。

比如像构建并不是在监测到分支改动之后自动执行而是需要手动执行，代码并没有进行从单测到集成测试的任何测试，也没有经过代码质量审查，当然还有一些构建完成之后的工作也没有进行(比如没有通知构建)，等等....

并且对上面的解决方案自我感觉也并不是特别良好，或者说感觉不够优雅，也是局限于业务规模，并不需要深入使用compose或者容器编排之类的技术，毕竟ci也是代码，是代码就决定它肯定不是一成不变的，也只能说多多自勉吧

> 吾尝终日而思矣 不如须臾之所学也
