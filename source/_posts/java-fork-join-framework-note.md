---
title: Fork/Join框架论文笔记和总结
mathjax: false
date: 2020-04-15 19:45:42
categories: [笔记]
tags: [Java, concurrent, Doug Lea]
---
![](https://misakatang.oss-cn-beijing.aliyuncs.com/blog_picture/join%E8%AE%BE%E8%AE%A1%E4%B8%8E%E5%AE%9E%E7%8E%B0.png)
<!-- more -->

## 前言
这篇blog主要是在看了Doug Lea的fork/join实现的paper之后的一个总结.

文章主要参考了: 
1. [A Java Fork/Join Framework(PDF)](http://gee.cs.oswego.edu/dl/papers/fj.pdf)
2. [Java Fork/Join框架--翻译](https://github.com/oldratlee/translations/tree/master/a-java-fork-join-framework)
3. [Overview of package util.concurrent Release 1.3.4.](http://gee.cs.oswego.edu/dl/classes/EDU/oswego/cs/dl/util/concurrent/intro.html)(Doug Lea的fork/join代码实现)

整个paper笔记的思维导图就是上面的图片,这里也留一下xmind的文件: https://www.jianguoyun.com/p/DVJEwqQQ08fbBxj8o48D  (访问密码: 8kejk5)

## 代码
由于paper以及翻译对实现的思路讲解已经很详细了,这里就不再赘述,主要还是结合代码实现再看一下整个框架.

就像论文中提到的,Java部分的实现主要为下面三个类:
1. FJTask(implement Runnable)
2. FJTaskRunner(extends Thread)
3. FJTaskRunnerGroup

下面就分别看一下三个类的代码实现.
### FJTask
fork/join代码都非常的简单,因为这只是一个实现了Runnable接口的轻量线程类
```java
    // 下面贴出来的是论文中讲到的FJTask有的方法,其余的一些辅助的方法也就不加进来了

    private volatile boolean done; // = false;

    public final boolean isDone() { return done; }

    public static FJTaskRunner getFJTaskRunner() {
        return (FJTaskRunner)(Thread.currentThread());
    }

    public void fork() { getFJTaskRunner().push(this);  }

    public void join() { getFJTaskRunner().taskJoin(this);  }

    public static void coInvoke(FJTask task1, FJTask task2) {
        getFJTaskRunner().coInvoke(task1, task2);
    }
```

### FJTaskRunner
这个类是整个fork/join框架的核心,代码也比较多
#### push
```java
  /**
   * Push a task onto DEQ.
   * Called ONLY by current thread.
   **/

  protected final void push(final FJTask r) {
    int t = top;

    /*
      This test catches both overflows and index wraps.  It doesn't
      really matter if base value is in the midst of changing in take. 
      As long as deq length is < 2^30, we are guaranteed to catch wrap in
      time since base can only be incremented at most length times
      between pushes (or puts). 
    */
    // 这里是重点,注释中也已经讲的很清楚了
    if (t < (base & (deq.length-1)) + deq.length) {

      deq[t & (deq.length-1)].put(r);
      top = t + 1;
    }

    else  // isolate slow case to increase chances push is inlined
      slowPush(r); // check overflow and retry
  }

  // slowPush主要是为了应对数组的resize
  /**
   * Handle slow case for push
   **/

  protected synchronized void slowPush(final FJTask r) {
    checkOverflow();
    push(r); // just recurse -- this one is sure to succeed.
  }
```
#### pop
```java
  /**
   * Return a popped task, or null if DEQ is empty.
   * Called ONLY by current thread.
   * <p>
   * This is not usually called directly but is
   * instead inlined in callers. This version differs from the
   * cilk algorithm in that pop does not fully back down and
   * retry in the case of potential conflict with take. It simply
   * rechecks under synch lock. This gives a preference
   * for threads to run their own tasks, which seems to
   * reduce flailing a bit when there are few tasks to run.
   **/

  protected final FJTask pop() {
    /* 
       Decrement top, to force a contending take to back down.
    */

    int t = --top;      

    /*
      To avoid problems with JVMs that do not properly implement
      read-after-write of a pair of volatiles, we conservatively
      grab without lock only if the DEQ appears to have at least two
      elements, thus guaranteeing that both a pop and take will succeed,
      even if the pre-increment in take is not seen by current thread.
      Otherwise we recheck under synch.
    */

    if (base + 1 < t) 
      return deq[t & (deq.length-1)].take();
    else
      // 这就是论文中提到的pop失败之后会重试,直到队列真的为空
      return confirmPop(t);

  }

  /**
   * Check under synch lock if DEQ is really empty when doing pop. 
   * Return task if not empty, else null.
   **/

  protected final synchronized FJTask confirmPop(int provisionalTop) {
    if (base <= provisionalTop) 
      return deq[provisionalTop & (deq.length-1)].take();
    else {    // was empty
      /*
        Reset DEQ indices to zero whenever it is empty.
        This both avoids unnecessary calls to checkOverflow
        in push, and helps keep the DEQ from accumulating garbage
      */

      top = base = 0;
      return null;
    }
  }
```
#### take
```java
  /** 
   * Take a task from the base of the DEQ.
   * Always called by other threads via scan()
   **/

  
  protected final synchronized FJTask take() {

    /*
      Increment base in order to suppress a contending pop
    */
    
    int b = base++;     
    
    if (b < top) 
      return confirmTake(b);
    else {
      // back out
      // take的机制就是类似于fail fast, 会去尝试窃取其他线程的taks
      base = b; 
      return null;
    }
  }


  /**
   * double-check a potential take
   **/
  
  protected FJTask confirmTake(int oldBase) {

    /*
      Use a second (guaranteed uncontended) synch
      to serve as a barrier in case JVM does not
      properly process read-after-write of 2 volatiles
    */

    synchronized(barrier) {
      if (oldBase < top) {
        /*
          We cannot call deq[oldBase].take here because of possible races when
          nulling out versus concurrent push operations.  Resulting
          accumulated garbage is swept out periodically in
          checkOverflow, or more typically, just by keeping indices
          zero-based when found to be empty in pop, which keeps active
          region small and constantly overwritten. 
        */
        
        return deq[oldBase & (deq.length-1)].get();
      }
      else {
        base = oldBase;
        return null;
      }
    }
  }

```
剩下的代码就是对dqueue的resize和一些辅助的函数
### FJTaskRunnerGroup
主要是对FJTaskRunner的管理的一些辅助函数
```java
  /** The threads in this group **/
  protected final FJTaskRunner[] threads;

  /** Group-wide queue for tasks entered via execute() **/
  protected final LinkedQueue entryQueue = new LinkedQueue();

  /** 
   * Create a FJTaskRunnerGroup with the indicated number
   * of FJTaskRunner threads. Normally, the best size to use is
   * the number of CPUs on the system. 
   * <p>
   * The threads in a FJTaskRunnerGroup are created with their
   * isDaemon status set, so do not normally need to be
   * shut down manually upon program termination.
   **/

  public FJTaskRunnerGroup(int groupSize) { 
    threads = new FJTaskRunner[groupSize];
    initializeThreads();
    initTime = System.currentTimeMillis();
  }

  /**
   * Arrange for execution of the given task
   * by placing it in a work queue. If the argument
   * is not of type FJTask, it is embedded in a FJTask via 
   * <code>FJTask.Wrap</code>.
   * @exception InterruptedException if current Thread is
   * currently interrupted 
   **/

  public void execute(Runnable r) throws InterruptedException {
    if (r instanceof FJTask) {
      entryQueue.put((FJTask)r);
    }
    else {
      entryQueue.put(new FJTask.Wrap(r));
    }
    signalNewTask();
  }
```
## whats else
首先,Doug Lea的论文真的很牛逼,可以说把整个框架的实现细节都讲的很清楚了,而且在代码中无处不在的各种注释也对于框架的理解非常有用.在源码包里还有对应生产的JavaDoc可以说阅读Java基础代码的整体体验都是非常不错的(集合包中的注释也是非常的完整).

其次,最近开始尝试使用思维导图来整理知识,这算是第一次尝试,总体感觉还是很不错的.