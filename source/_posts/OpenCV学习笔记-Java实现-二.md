---
title: OpenCV学习笔记--Java实现(二)
date: 2017-07-08 18:20:48
categories: [课程笔记]
tags: [OpenCV, Java]
---
[](#简述 "简述")简述
==============

在OpenCV配置安装完成之后,先去看了一下官方的教程和例子,[Introduction to Java Development](http://docs.opencv.org/2.4/doc/tutorials/introduction/desktop_java/java_dev_intro.html),这是官方提供的一个面对Java开发者的快速的介绍,但是其中只有两个Demo,第一个就是配置时的测试代码.这里主要来看一下第二个例子.

[](#开始 "开始")开始
==============
<!-- more -->
在官方的这个介绍中还介绍了Scala以及SBT的知识,这里我并没有按照他的方式来进行第二个人脸检测例子的测试.

*   首先我们需要一个人脸识别的配置文件,官方是在构建时自动下载的,没有使用SBT的方式的话,可以直接在Github上来下载这个配置文件[lbpcascade_frontalface.xml](https://github.com/opencv/opencv/blob/master/data/lbpcascades/lbpcascade_frontalface.xml).
*   然后我们需要一张图片,官方的识别图片是_lena.png_,在下方贴出来:[![](http://docs.opencv.org/2.4/_images/lena1.png)](http://docs.opencv.org/2.4/_images/lena1.png)  
    准备好之后就是示例代码了.

```java
import org.opencv.core.*;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;
import org.opencv.objdetect.CascadeClassifier;
/** 
* Created by MisakaTang on 2017/7/5. 
* 官方的HelloOpenCV案例,做了一个人脸边缘检测的例子 
*/
public class DetectFaceDemo {    
    static{System.loadLibrary(Core.NATIVE_LIBRARY_NAME);}    
    public static void main(String[] args) {        
        new DetectFaceDemo().run();    
    }    
    public void run(){        
        System.out.println("\nRunning DetectFaceDemo");        //从图片中创建一个面部检测        
        /*        
        * 官方文档使用的opencv为2.4版本,所以没有采用示例中读取图片时的方法        
        * 文件放在工程目录下无法正常读取 会报空指针异常        
        * 解决办法是将文件移出工程文件(放在了E:/根目录下)        
        * 在3.0以后的版本取消了Highgui类,对于图片的读取都使用了Imgcodes类来进行处理        
        * 
        */        
        CascadeClassifier faceDetector = new CascadeClassifier("E:/lbpcascade_frontalface.xml");        
        Mat image = Imgcodecs.imread("E:/lena.png");        
        /*        
        * 下方为官方教程中的代码        
        * 
        */
        //Create a face detector from the cascade file in the resources
        //directory.
        //CascadeClassifier faceDetector = new CascadeClassifier(getClass().getResource("/lbpcascade_frontalface.xml").getPath());
        //Mat image = Highgui.imread(getClass().getResource("/lena.png").getPath());        
        MatOfRect faceDetetions = new MatOfRect();        
        faceDetector.detectMultiScale(image,faceDetetions);        
        System.out.println(faceDetetions.toArray().length);        
        //画图        
        for (Rect rect : faceDetetions.toArray()){            
            Imgproc.rectangle(image,new Point(rect.x,rect.y),new Point(rect.x+rect.width,rect.y+rect.height),new Scalar(0,255,0));        
        }        
        String filenanme = "faceDetection.png";        
        System.out.println(String.format("Writing %s", filenanme));        
        Imgcodecs.imwrite(filenanme,image);     //这里也采用了Imgcodes类来处理    
    }
}
```    

由于我下载的OpenCV版本是3.0以上的版本,而这个Demo的版本是2.4的,所以对于图像读取的类也发生了变化,要**注意开发环境的OpenCV版本**.

### [](#注意 "注意:")注意:

将xml配置文件和图片放在工程目录下会报错,StackOverFlow上的解决办法是不要将这两个文件放在工程目录下,我将其放在的E:\\的根目录下问题就解决了.

[](#运行结果 "运行结果")运行结果
--------------------

在人脸的图片上显示了识别到的面部信息并用矩形标识了出来.  
[![](http://docs.opencv.org/2.4/_images/faceDetection.png)](http://docs.opencv.org/2.4/_images/faceDetection.png)

[](#总结 "总结")总结
==============

> You’re done! Now you have a sample Java application working with OpenCV, so you can start the work on your own. We wish you good luck and many years of joyful life!

* * *

这是官方示例的结尾,拿来借用一下.主要的问题出在**Opencv版本**导致的类的使用方式变化以及**文件不能放在工程目录下**这两个问题.