---
title: OpenCV学习笔记--Java实现(一)
date: 2017-07-08 18:20:48
tags: [OpenCV]
categories: [Java]
---
[](#概述 "概述")概述
==============

最近有一个项目需要用到OpenCV的库来做图像处理的工作,然后就自学了一些基础的OpenCV知识,由于项目用Java语言开发,所以为了方便在OpenCV的调用上也使用了Java版的API来操作.

[](#环境配置 "环境配置")环境配置
====================
<!-- more -->
[](#JDK "JDK")JDK
-----------------

JDK去官方网站下载JDK并安装即可.

[](#IDE "IDE")IDE
-----------------

IDE使用的是IDEA开发

[](#OpenCV的安装以及导入 "OpenCV的安装以及导入")OpenCV的安装以及导入
-----------------------------------------------

### [](#安装 "安装")安装

在[OpenCV官网](http://opencv.org/)下载OpenCV的安装包,我安装了最新的OpenCV版本[3.2.0](https://sourceforge.net/projects/opencvlibrary/files/opencv-win/3.2.0/opencv-3.2.0-vc14.exe/download),平台是Windows64位,安装完成后会在指定安装的目录下有opencv的文件夹.

### [](#IDEA配置 "IDEA配置")IDEA配置

在IDEA的**Project Structure**窗口中选择**Libraries**选项,添加opencv目录下的jar包即可.对应opencv目录下jar包的路径为:\\opencv\\build\\java.  
[![opencv文件路径](http://misakatang.oss-cn-beijing.aliyuncs.com/201707081.jpg)](http://misakatang.oss-cn-beijing.aliyuncs.com/201707081.jpg "opencv文件路径")  
[![IDEA配置路径](http://misakatang.oss-cn-beijing.aliyuncs.com/201707082.jpg)](http://misakatang.oss-cn-beijing.aliyuncs.com/201707082.jpg "IDEA配置路径")  
成功之后会在Libraries中出现OpenCV的Jar包  
[![成功](http://misakatang.oss-cn-beijing.aliyuncs.com/201707083.jpg)](http://misakatang.oss-cn-beijing.aliyuncs.com/201707083.jpg "成功")

### [](#运行环境配置 "运行环境配置")运行环境配置

在IDEA右上角的**Run/Debug Configurations**选项中的**VM options**中添加如下代码:`-Djava.library.path=D:\opencv\opencv\build\java\x64;D:\opencv\opencv\build\x64\vc14\bin`  
[![图示](http://misakatang.oss-cn-beijing.aliyuncs.com/201707084.jpg)](http://misakatang.oss-cn-beijing.aliyuncs.com/201707084.jpg "图示")

[](#测试代码 "测试代码")测试代码
====================

在IDEA中创建_Test.java_文件,测试下述代码.
```java
    import org.opencv.core.Core;
    import org.opencv.core.CvType;
    import org.opencv.core.Mat;
    import org.opencv.core.Scalar;
    
    public class Test {
    
        static{ System.loadLibrary(Core.NATIVE_LIBRARY_NAME); }
    
        public static void main(String[] args) {
            System.out.println("Welcome to OpenCV " + Core.VERSION);
            Mat m = new Mat(5, 10, CvType.CV_8UC1, new Scalar(0));
            System.out.println("OpenCV Mat: " + m);
            Mat mr1 = m.row(1);
            mr1.setTo(new Scalar(1));
            Mat mc5 = m.col(5);
            mc5.setTo(new Scalar(5));
            System.out.println("OpenCV Mat data:\n" + m.dump());
        }
    }
```    

显示运行结果为:  
[![运行结果](http://misakatang.oss-cn-beijing.aliyuncs.com/201707085.jpg)](http://misakatang.oss-cn-beijing.aliyuncs.com/201707085.jpg "运行结果")  
至此,OpenCV在Java环境下的配置就结束了.

[](#参考文章 "参考文章")参考文章
====================

[在IntelliJ IDEA 13中配置OpenCV的Java开发环境](http://www.cnblogs.com/yezhang/p/4006134.html)