---
title: Redis分布式锁设计和实现
mathjax: false
date: 2020-04-19 17:25:09
categories: [笔记]
tags: [redis, 分布式锁]
---
![](https://misakatang.oss-cn-beijing.aliyuncs.com/blog_picture/distributed-locks-with-redis.png)
<!-- more -->
[Redlock.xmind](https://github.com/TangMisaka23001/TangMisaka23001.github.io/blob/source/xmind/Redlock.xmind)
# 参考文章
[Distributed locks with Redis](https://redis.io/topics/distlock)
# 分布式锁需求
1. 互斥
2. 过期锁的释放
3. 容错能力

# 算法设计(主要是获取锁)
1. 获取当前服务时间
2. 尝试从全部N个实例获取锁
3. 每个实例计算锁的有效时间为: 需要加锁时间-获取锁消耗时间
4. 只有大部分实例成功获取锁这次加锁才能成功
5. 如果加锁成功,锁的有效时间为所有实例有效时间中最短时间
6. 加锁失败就请求所有实例释放该锁(无论是否加锁)

# Java代码实现
[Redisson的RedLock实现--加锁部分](https://github.com/redisson/redisson/blob/bf8e9d358ed51407cc91ad146ac52e812918fc43/redisson/src/main/java/org/redisson/RedissonMultiLock.java#L353)
```java
    public boolean tryLock(long waitTime, long leaseTime, TimeUnit unit) throws InterruptedException {
        long newLeaseTime = -1;
        if (leaseTime != -1) {
            if (waitTime == -1) {
                newLeaseTime = unit.toMillis(leaseTime);
            } else {
                newLeaseTime = unit.toMillis(waitTime)*2;
            }
        }
        
        long time = System.currentTimeMillis();
        long remainTime = -1;
        if (waitTime != -1) {
            remainTime = unit.toMillis(waitTime);
        }
        long lockWaitTime = calcLockWaitTime(remainTime);
        
        int failedLocksLimit = failedLocksLimit();
        List<RLock> acquiredLocks = new ArrayList<>(locks.size());
        // 遍历所有的实例
        for (ListIterator<RLock> iterator = locks.listIterator(); iterator.hasNext();) {
            RLock lock = iterator.next();
            boolean lockAcquired;
            try {
                // 尝试加锁
                if (waitTime == -1 && leaseTime == -1) {
                    lockAcquired = lock.tryLock();
                } else {
                    long awaitTime = Math.min(lockWaitTime, remainTime);
                    lockAcquired = lock.tryLock(awaitTime, newLeaseTime, TimeUnit.MILLISECONDS);
                }
            } catch (RedisResponseTimeoutException e) {
                // 加锁失败全部释放
                unlockInner(Arrays.asList(lock));
                lockAcquired = false;
            } catch (Exception e) {
                lockAcquired = false;
            }
            
            // 获取锁成功加入acquiredLocks List
            if (lockAcquired) {
                acquiredLocks.add(lock);
            } else {
                if (locks.size() - acquiredLocks.size() == failedLocksLimit()) {
                    break;
                }

                if (failedLocksLimit == 0) {
                    unlockInner(acquiredLocks);
                    if (waitTime == -1) {
                        return false;
                    }
                    failedLocksLimit = failedLocksLimit();
                    acquiredLocks.clear();
                    // reset iterator
                    while (iterator.hasPrevious()) {
                        iterator.previous();
                    }
                } else {
                    failedLocksLimit--;
                }
            }
            
            if (remainTime != -1) {
                remainTime -= System.currentTimeMillis() - time;
                time = System.currentTimeMillis();
                if (remainTime <= 0) {
                    unlockInner(acquiredLocks);
                    return false;
                }
            }
        }
        // 遍历循环结束

        if (leaseTime != -1) {
            List<RFuture<Boolean>> futures = new ArrayList<>(acquiredLocks.size());
            // 循环全部成功获取锁的实例异步加锁
            for (RLock rLock : acquiredLocks) {
                RFuture<Boolean> future = ((RedissonLock) rLock).expireAsync(unit.toMillis(leaseTime), TimeUnit.MILLISECONDS);
                futures.add(future);
            }
            
            for (RFuture<Boolean> rFuture : futures) {
                rFuture.syncUninterruptibly();
            }
        }
        
        return true;
    }
```