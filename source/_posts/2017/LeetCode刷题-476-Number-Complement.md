---
title: LeetCode刷题--476. Number Complement
date: 2017-07-30 16:19:19
categories: [算法]
tags: [LeetCode]
---
[](#题目及理解 "题目及理解")题目及理解
=======================

题目链接:[476\. Number Complement](https://leetcode.com/problems/number-complement/description/)

Given a positive integer, output its complement number. The complement strategy is to flip the bits of its binary representation.

**Note:**

1.  The given integer is guaranteed to fit within the range of a 32-bit signed integer.
2.  You could assume no leading zero bit in the integer’s binary representation.

**Example 1:**  
```
Input: 5
Output: 2
Explanation: The binary representation of 5 is 101 (no leading zero bits), and its complement is 010. So you need to output 2.
```

**Example 2:**  
```
Input: 1
Output: 0
Explanation: The binary representation of 1 is 1 (no leading zero bits), and its complement is 0. So you need to output 0.
```
<!-- more -->
[](#理解 "理解")理解
--------------

水题,就是按位取反

[](#代码 "代码")代码
==============

```c++
class Solution {
    public:    
        int findComplement(int num) {        
            int flag = 0;        
            int ans=0,a=1;        
            while (num > 0){            
                flag = num % 2;            
                num /= 2;            
                ans += (flag==0?1:0) * a;            
                a*=2;        
            }        
        return ans;    
    }
};
```

[](#其他解法 "其他解法")其他解法
====================

看了Discuss里面的解法,还是有很多骚操作的大神的.这里贴出一个来看看.  
[链接](https://discuss.leetcode.com/topic/74627/3-line-c/2)  
```c++
class Solution {
    public:    
        int findComplement(int num) {        
            unsigned mask = ~0;        
            while (num & mask) mask <<= 1;        
            return ~mask & ~num;    
    }
};
```

[](#理解-1 "理解")理解
----------------

先让mask全部取1,然后对num取&操作,使得在对应前导0的地方全部置1,剩下的位全部是0,然后再对2个数进行&操作,就是取反了.