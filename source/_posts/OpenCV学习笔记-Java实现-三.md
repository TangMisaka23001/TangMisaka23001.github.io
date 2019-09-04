---
title: OpenCV学习笔记-Java实现(三)
date: 2017-07-08 20:59:27
categories: [Java]
tags: [OpenCV]
---
[](#简述 "简述")简述
==============

在配置完OpenCV以及尝试过官方的例子之后,就开始学习一些需要用到的对图片的操作了.  
因为对项目的功能实现有比较明确的需要使用的方法以及操作,所以就从这些需要的功能开始学习,在过程中再对其他的需要了解的知识进行补充吧.大致的学习范围是:

1.  对Mat类的了解和操作(在之后会学习)
2.  直方图以及直方图均衡化
3.  图像的降噪处理(主要是高斯滤波器)
4.  Canny边缘检测函数
5.  Sobel算子检测方向性的边缘
6.  霍夫变换(霍夫概率变换)提取直线
7.  图像细化(Zhang快速并行算法)

* * *

以上是需要学习的主要的功能,在理解上由于数学功力欠缺,只有对函数的很浅的理解和认识,在写博客的过程中也不会有太多的数学出现,主要还是以能够使用为主.
<!-- more -->
[](#官方帮助文档 "官方帮助文档")官方帮助文档
==========================

OpenCV的官方也提供了一份Java的API的文档,但是由于版本问题,在网上能够找到的大部分资料都是OpenCV2.*版本的函数,在3.0之后函数名称和某些函数的参数也发生了变化 ,故官方的文档在实际使用的时候并不是很好用,但是用来查看函数的参数和操作上还是有很大的帮助.  
[OpenCV官方3.0.0文档](http://docs.opencv.org/java/3.0.0/)

[](#主要使用到的Package的简介 "主要使用到的Package的简介")主要使用到的Package的简介
--------------------------------------------------------

[![图片](http://misakatang.oss-cn-beijing.aliyuncs.com/201707086.jpg)](http://misakatang.oss-cn-beijing.aliyuncs.com/201707086.jpg "图片")  
这是文档中所包含的全部的包名,主要使用到了以下的几个包:

*   **org.opencv.core**:里面包含了Core,CvType,Mat三个使用到的类.
*   **org.opencv.imgcodes**:主要是对于图片的读写,均在此包中
*   **org.opencv.imgproc**:是使用到的频率最高的也是我最主要使用的包,下面将提到的大部分的操作的函数均在此包中
*   **org.opencv.videoio**:主要包含了对于视频的操作

[](#开始-直方图均衡化 "开始-直方图均衡化")开始-直方图均衡化
===================================

[](#直方图 "直方图:")直方图:
-------------------

*   直方图是图像中像素强度分布的图形学表达式
*   它统计了每一个强度值所具有的像素个数

[](#直方图均衡化 "直方图均衡化:")直方图均衡化:
----------------------------

是通过拉伸像素强度分布范围来**增强图像对比度**的一种方法.

[](#均衡化函数-equalizeHist "均衡化函数:equalizeHist()")均衡化函数:equalizeHist()
------------------------------------------------------------------

`public static void equalizeHist(Mat src,Mat dst)`  
参数src为图像源,dst为转换之后的图像.**注:**函数只接受灰度图像,在图像处理之前要进行转换.  
例程:

```java
//加载图片源
Mat src = Imgcodecs.imread("img/fengjing.jpg");
//创建一个用来接受的Mat
Mat mat = new Mat(src.rows(),src.cols(),src.type());
//由于equalizeHist方法只能接受8UC1类型的图片,所以需要将图片转换成GRAY格式,
Imgproc.cvtColor(mat,mat,Imgproc.COLOR_RGB2GRAY);
Imgproc.cvtColor(src,src,Imgproc.COLOR_RGB2GRAY);
//应用直方图均衡化
Imgproc.equalizeHist(src,mat);
```
[](#参考教程 "参考教程")参考教程
--------------------

[OpenCV 2.3.2 documentation » OpenCV 教程 » imgproc 模块. 图像处理 »直方图均衡化](http://www.opencv.org.cn/opencvdoc/2.3.2/html/doc/tutorials/imgproc/histograms/histogram_equalization/histogram_equalization.html)

* * *

[](#图像的降噪处理-高斯滤波器 "图像的降噪处理-高斯滤波器")图像的降噪处理-高斯滤波器
===============================================

[](#简介 "简介")简介
--------------

高斯滤波是一种线性平滑滤波，适用于消除高斯噪声，广泛应用于图像处理的减噪过程。通俗的讲，高斯滤波就是对整幅图像进行加权平均的过程，每一个像素点的值，都由其本身和邻域内的其他像素值经过加权平均后得到。

[](#高斯滤波器函数 "高斯滤波器函数")高斯滤波器函数
-----------------------------

`public static void GaussianBlur(Mat src,Mat dst,Size ksize,double sigmaX,double sigmaY,int borderType)`  
参数说明:

*   Mat src:输入图像
*   Mat dst:输出图像
*   Size ksize:高斯内核的大小
*   double sigmaX:高斯核函数在X方向上的标准偏差
*   double sigmaY:高斯核函数在Y方向上的标准偏差,若不设置则与X方向上相同
*   int borderType:推断图像外部像素的某种便捷模式,一般不需要更改,默认值即可.  
    测试例子:
```java
//加载图片源
Mat src = Imgcodecs.imread("img/test.jpg", Imgproc.COLOR_RGB2GRAY);
//创建一个用来接受的Mat
Mat mat = new Mat(src.rows(),src.cols(),src.type());
//由于equalizeHist方法只能接受8UC1类型的图片,所以需要将图片转换成GRAY格式,
Imgproc.cvtColor(mat,mat,Imgproc.COLOR_RGB2GRAY);Imgproc.cvtColor(src,src,
Imgproc.COLOR_RGB2GRAY);
/*
* 首先进行高斯滤波处理
* */
Imgproc.GaussianBlur(src,mat,new Size(11,11),0);
```

参考教程:  
[opencv学习(二十)之高斯滤波GaussianBlur()](http://blog.csdn.net/keith_bb/article/details/54412493)  
[图像处理—高斯滤波](http://blog.csdn.net/l_inyi/article/details/8915116)

* * *

[](#Mat类的操作 "Mat类的操作")Mat类的操作
=============================

[](#Mat类的理解 "Mat类的理解")Mat类的理解
-----------------------------

对于Mat的理解,主要是对于该类内部是如何存储图片信息的理解.详细可以参照博客:[OpenCV学习之路（二）——Mat对象](http://www.jianshu.com/p/883684519e80)

[](#遍历Mat元素 "遍历Mat元素")遍历Mat元素
-----------------------------

对于Mat来说最主要的就是遍历其中的每个像素点然后进行操作了.Mat也提供了相应的方法来获取每个位置的元素.  
`public double[] get(int row,int col)`  
可以看到取出来的值是double\[\]数组的形式,我的理解是根据图片的类型的不同,数组中的信息也会不同,所以在操作的时候还是要根据当前操作的图片类型来进行区分.  
遍历的方法就十分简单了,在下面贴出来:  

```java
for (int i=0; i<size.height;i++){    
    for(int j=0;j<size.width;j++){        
        double[] data = mat.get(i,j);        
        //在这里对data数组进行操作    
    }
}
```
[](#参考文章 "参考文章")参考文章
--------------------

[Using get() and put() to access pixel values in JAVA](http://answers.opencv.org/question/14961/using-get-and-put-to-access-pixel-values-in-java/)

[](#Canny边缘检测 "Canny边缘检测")Canny边缘检测
===================================

[](#简介-1 "简介")简介
----------------

Canny 边缘检测算子是John F. Canny于 1986 年开发出来的一个多级边缘检测算法。更为重要的是 Canny 创立了边缘检测计（Computational theory of edge detection）解释这项技术如何工作。  
Canny 的目标是找到一个最优的边缘检测算法，最优边缘检测的含义是:

*   好的检测 \- 算法能够尽可能多地标识出图像中的实际边缘
*   好的定位 \- 标识出的边缘要尽可能与实际图像中的实际边缘尽可能接近
*   最小响应 \- 图像中的边缘只能标识一次，并且可能存在的图像噪声不应标识为边缘.

[](#Canny检测函数 "Canny检测函数:")Canny检测函数:
-------------------------------------

`public static void Canny(Mat image,Mat edges,double threshold1,double threshold2)`  
参数说明:

*   **Mat image**:输入的图像,为单通道的灰度图像
*   **Mat edges**:输出的图像,为单通道黑白图像
*   **double threshold1,double threshold2**:这两个参数表示阈值,这二个阈值中当中的小阈值用来控制边缘连接，大的阈值用来控制强边缘的初始分割.  
    使用方法还是十分简单的,在Java中函数的使用如下:  
    `Imgproc.Canny(src,mat,100,130);`

[](#参考博客 "参考博客")参考博客
--------------------

[【OpenCV入门指南】第三篇Canny边缘检测](http://blog.csdn.net/morewindows/article/details/8239625)

[](#Sobel算子 "Sobel算子")Sobel算子
=============================

关于sobel算子的详细介绍可以参照博客: [【opencv2】Sobel算子原理与实现](http://blog.csdn.net/autocyz/article/details/42676627)以及[Sobel算子及C++实现](http://blog.csdn.net/dcrmg/article/details/52280768).具体的细节就不再赘述.  
**注:**sobel算子对于垂直和水平方向的的边缘检测效果较好,而对于45°以及135°这样梯度的边缘检测来说,推荐先将图片旋转,使得要检测的边缘在竖直或者水平方向上效果会更好.

[](#Sobel算子函数 "Sobel算子函数")Sobel算子函数
-----------------------------------

`public static void Sobel(Mat src,Mat dst,int ddepth,int dx,int dy,int ksize,double scale,double delta)`  
参数说明:

*   **Mat src**:输入的图像
*   **Mat dst**:输出的图像,需要和输入图像有相同的尺寸类型
*   **int ddepth**:输出图像的深度,默认可填-1
*   **int dx,int dy**:x,y方向上的差分阶数.
*   **int ksize**:Sobel核的大小,必须取1,3,5,7.
*   **double scale**:计算导数时的缩放因子,默认为1
*   **double delta**:可选的delta值.默认为0

### [](#使用方法 "使用方法")使用方法

`Imgproc.Sobel(src,mat,-1,1,0);`

[](#参考博客-1 "参考博客")参考博客
----------------------

[【OpenCV入门教程之十二】OpenCV边缘检测：Canny算子,Sobel算子,Laplace算子,Scharr滤波器合辑](http://blog.csdn.net/poem_qianmo/article/details/25560901)  
[【opencv2】Sobel算子原理与实现](http://blog.csdn.net/autocyz/article/details/42676627)  
[Sobel算子及C++实现](http://blog.csdn.net/dcrmg/article/details/52280768)

[](#霍夫变换提取直线 "霍夫变换提取直线")霍夫变换提取直线
================================

[](#简介-2 "简介")简介
----------------

> 霍夫变换(Hough Transform)是图像处理中的一种特征提取技术，该过程在一个参数空间中通过计算累计结果的局部最大值得到一个符合该特定形状的集合作为霍夫变换结果。
> 
> 霍夫变换于1962年由PaulHough首次提出，最初的Hough变换是设计用来检测直线和曲线，起初的方法要求知道物体边界线的解析方程，但不需要有关区域位置的先验知识。这种方法的一个突出优点是分割结果的Robustness,即对数据的不完全或噪声不是非常敏感。然而，要获得描述边界的解析表达常常是不可能的。　后于1972年由Richard Duda & Peter Hart推广使用，经典霍夫变换用来检测图像中的直线，后来霍夫变换扩展到任意形状物体的识别，多为圆和椭圆。霍夫变换运用两个坐标空间之间的变换将在一个空间中具有相同形状的曲线或直线映射到另一个坐标空间的一个点上形成峰值，从而把检测任意形状的问题转化为统计峰值问题.

[](#Java中的霍夫变换函数 "Java中的霍夫变换函数")Java中的霍夫变换函数
--------------------------------------------

*   `static void HoughLines(Mat image, Mat lines, double rho, double theta, int threshold)`
*   `static void HoughLinesP(Mat image, Mat lines, double rho, double theta, int threshold)`
*   `static void HoughCircles(Mat image, Mat circles, int method, double dp, double minDist)`  
    一共有三种h函数,分别是标准霍夫变换,累计概率霍夫变换以及霍夫圆变换.  
    这里只介绍一下第二个累计概率霍夫变换的函数.  
    参数说明:
*   **Mat image**:表示输入的图像
*   **Mat lines**:表示经过检测之后得到的直线的矢量,存储的信息为x1,y1,x2,y2四个点的坐标.
*   **double rho**:直线搜索时的进步单位半径
*   **double theta**:直线搜索时进步单位角度
*   **int threshold**:累加平面的阈值参数,只有大于该阈值的结果才能被检测通过.

### [](#Java使用 "Java使用")Java使用

`Imgproc.HoughLinesP(src,mat,1,Math.acos(-1)/45,230);`

### [](#在图片上将所有的直线都画出来 "在图片上将所有的直线都画出来:")在图片上将所有的直线都画出来:

```java
for (int i=0; i<size.height;i++){            
    for(int j=0;j<size.width;j++){                
        double[] data = mat.get(i,j);                
        Imgproc.line(dstImage, new Point(data[0],data[1]),new Point(data[2],data[3]),new Scalar(255,0,0),1);            
    }        
}
```
[](#参考博客-2 "参考博客")参考博客
----------------------

[【OpenCV入门教程之十四】OpenCV霍夫变换：霍夫线变换，霍夫圆变换合辑](http://blog.csdn.net/poem_qianmo/article/details/26977557)

[](#图像细化-Zhang快速并行算法 "图像细化(Zhang快速并行算法)")图像细化(Zhang快速并行算法)
==========================================================

图像细化也称为图像的骨架化,简单的说就是把一条直线的轮廓变细,只剩下一条单位像素的直线.  
算法的核心解释如下:

*   首先定义一个矩阵:  
    [![](http://dl2.iteye.com/upload/attachment/0112/8663/0160307e-0e5e-37a6-b174-1539a4dbff19.png)](http://dl2.iteye.com/upload/attachment/0112/8663/0160307e-0e5e-37a6-b174-1539a4dbff19.png)
*   然后对于P1这个点进行讨论:

1.  2 <= N(P1) <= 6，N(x)为x的8领域中黑点（背景点）的个数
2.  A(P1) = 1，A(x)为P2-P8之间按序前后分别为0、1的对数
3.  P2\*P4\*P6 = 0
4.  P4\*P6\*P8 = 0  
    满足上述条件的P1点即可删去.

*   重复上述步骤直到没有可删除的点为止.

### [](#算法的Java实现 "算法的Java实现:")算法的Java实现:


```java
public void thinImage(Mat src, Mat thin, Integer maxIterations){        
    maxIterations = -1;        
    int width = src.cols();        
    int height = src.rows();        
    thin = src.clone();        
    int count = 0;        
    while (true){            
        count++;            
        if(maxIterations != -1 && count > maxIterations)//限制迭代次数                
        break;            
        Stack<Point> flag = new Stack<Point>();//存放要删除的点的信息            
        for(int i=0; i < height; i++){                
            Mat p = thin.row(i);                
            for(int j=0; j < width; j++){                    
                double[] zero = {0};                    
                double[] p1 = p.get(i,j);//p1里面只有一个元素 应该就是无符号整形的灰度值                    
                double[] p2 = (i==0)?zero:thin.get(i-1,j);                    
                double[] p3 = (i==0 || j==width-1)?zero:thin.get(i-1,j+1);                    
                double[] p4 = (j == width - 1) ? zero : thin.get(i, j + 1);                    
                double[] p5 = (i==height-1 || j==width-1)?zero:thin.get(i+1,j+1);                    
                double[] p6 = (i == height - 1) ? zero : thin.get(i + 1, j);                    
                double[] p7 = (i == height - 1 || j == 0) ? zero : thin.get(i + 1, j - 1);                    
                double[] p8 = (j==0)?zero:thin.get(i,j-1);                    
                double[] p9 = (i==0 || j==0)?zero:thin.get(i-1,j-1);                    
                if((p2[0]+p3[0]+p4[0]+p5[0]+p6[0]+p7[0]+p8[0]+p9[0])>=2 && (p2[0]+p3[0]+p4[0]+p5[0]+p6[0]+p7[0]+p8[0]+p9[0])<=6){                        
                    int ap = 0;                        
                    if(p2[0] == 0 && p3[0]== 1) ++ap;                        
                    if(p3[0] == 0 && p4[0]== 1) ++ap;                        
                    if(p4[0] == 0 && p5[0]== 1) ++ap;                        
                    if(p5[0] == 0 && p6[0]== 1) ++ap;                        
                    if(p6[0] == 0 && p7[0]== 1) ++ap;                        
                    if(p7[0] == 0 && p8[0]== 1) ++ap;                        
                    if(p8[0] == 0 && p9[0]== 1) ++ap;                        
                    if(p9[0] == 0 && p2[0]== 1) ++ap;                        
                    if(ap == 1){                            
                        if(p2[0]*p4[0]*p6[0] == 0){                                
                            if(p4[0]*p6[0]*p8[0] == 0){                                    
                                //标记                                    
                                flag.push(new Point(i,j));                                
                                }                            
                        }                        
                    }                    
                }                
            }            
        }            
        //删除标记的点            
        Iterator iterator = flag.iterator();            
        while (iterator.hasNext()){                
            byte[] zero = {0};                
            Point p = (Point) iterator.next();                
            thin.put((int)p.x,(int)p.y,zero);            
        }            
        //判断是否为空,若否则清空继续            
        if(flag.empty()) break;            
            else flag.clear();            
            /*            
            * 重复一遍            
            * */            
            for(int i=0; i < height; i++){                
            Mat p = thin.row(i);                
            for(int j=0; j < width; j++){                    
                double[] zero = {0};                    
                double[] p1 = p.get(i,j);//p1里面只有一个元素 应该就是无符号整形的灰度值                    
                double[] p2 = (i==0)?zero:thin.get(i-1,j);                    
                double[] p3 = (i==0 || j==width-1)?zero:thin.get(i-1,j+1);                    
                double[] p4 = (j == width - 1) ? zero : thin.get(i, j + 1);                    
                double[] p5 = (i==height-1 || j==width-1)?zero:thin.get(i+1,j+1);                    
                double[] p6 = (i == height - 1) ? zero : thin.get(i + 1, j);                    
                double[] p7 = (i == height - 1 || j == 0) ? zero : thin.get(i + 1, j - 1);                    
                double[] p8 = (j==0)?zero:thin.get(i,j-1);                    
                double[] p9 = (i==0 || j==0)?zero:thin.get(i-1,j-1);                    
                if((p2[0]+p3[0]+p4[0]+p5[0]+p6[0]+p7[0]+p8[0]+p9[0])>=2 && (p2[0]+p3[0]+p4[0]+p5[0]+p6[0]+p7[0]+p8[0]+p9[0])<=6){                        
                    int ap = 0;                        
                    if(p2[0] == 0 && p3[0]== 1) ++ap;                        
                    if(p3[0] == 0 && p4[0]== 1) ++ap;                        
                    if(p4[0] == 0 && p5[0]== 1) ++ap;                        
                    if(p5[0] == 0 && p6[0]== 1) ++ap;                        
                    if(p6[0] == 0 && p7[0]== 1) ++ap;                        
                    if(p7[0] == 0 && p8[0]== 1) ++ap;                        
                    if(p8[0] == 0 && p9[0]== 1) ++ap;                        
                    if(p9[0] == 0 && p2[0]== 1) ++ap;                        
                    if(ap == 1){                            
                        if(p2[0]*p4[0]*p6[0] == 0){                                
                            if(p4[0]*p6[0]*p8[0] == 0){                                    
                                //标记                                    
                                flag.push(new Point(i,j));                                
                            }                            
                        }                        
                    }                    
                }                
            }            
        }            
        //删除标记的点            
        while (iterator.hasNext()){                
            byte[] zero = {0};                
            Point p = (Point) iterator.next();                
            thin.put((int)p.x,(int)p.y,zero);            
        }            
        //判断是否为空,若否则清空继续            
        if(flag.empty()) break;            
        else flag.clear();        
    }    
}

```

[](#参考博客-3 "参考博客")参考博客
----------------------

[openCV综合运用 ———- 图像细化、线段长度、平行线距离检测](http://lps-683.iteye.com/blog/2254857)

[](#总结 "总结")总结
==============

到这里OpenCV的学习也告一段落了,对于OpenCV的学习还是十分的友好的,csdn上面的博客也非常的多以及详细,本人也只是在Java中再次尝试了一遍过程而已.对于算法的细节没有做太多的考究,因为现阶段只是能够使用即可.但是感觉上OpenCV对于Java的支持并不是特别的好,还是尝试使用C++来做算法的开发更加的好,而且3.0+版本的资料仍旧以英文为主,可能在一开始会在函数的使用上遇到一些困难,但是熟悉之后,和之前版本也没有太大的区别.就写到这里吧.