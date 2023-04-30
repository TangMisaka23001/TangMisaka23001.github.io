---
title: LeetCode刷题--461.Hamming Distance
date: 2017-07-18 15:49:46
categories: [技术]
tags: [算法, LeetCode]
---
从这个博客开始打算坚持在LeetCode上刷一点算法题,之后可能也会有Python版本的现在还是用C++在写了,就先从简单题开始刷起了.

[](#题目以及理解 "题目以及理解")题目以及理解
==========================

[题目链接-461\. Hamming Distance](https://leetcode.com/problems/hamming-distance/#/description)

The Hamming distance between two integers is the number of positions at which the corresponding bits are different.

Given two integers x and y, calculate the Hamming distance.  
Note:  
0 ≤ x, y < 231.  
Example:  
```
Input: x = 1, y = 4
Output: 2
Explanation:
1   (0 0 0 1)
4   (0 1 0 0)       
       ?   ?
The above arrows point to positions where the corresponding bits are different.
```
<!-- more -->
[](#理解 "理解")理解
--------------

很简单的题目,就是问两个数字的二进制有几位是不一样的.那就直接对两个数进行异或再判断有几位1就可以了.

[](#代码 "代码")代码
==============


```c++
class Solution {
    public:    
        int hammingDistance(int x, int y) {        
            int z = x ^ y;        
            int c = 0;        
            while (z > 0){            
                if ((z & 1) == 1)                
                c++;            
                z >>= 1;        
            }        
        return c;    
    }
};
```
