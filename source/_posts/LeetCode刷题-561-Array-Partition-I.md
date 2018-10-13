---
title: LeetCode刷题--561. Array Partition I
date: 2017-07-20 16:15:33
categories: [算法]
tags: [LeetCode]
---
[](#题目及理解 "题目及理解")题目及理解
=======================

[题目链接](https://leetcode.com/problems/array-partition-i/#/description)  
Given an array of 2n integers, your task is to group these integers into n pairs of integer, say (a1, b1), (a2, b2), …, (an, bn) which makes sum of min(ai, bi) for all i from 1 to n as large as possible.

**Example 1:**  
```
Input: [1,4,3,2]
Output: 4
Explanation: n is 2, and the maximum sum of pairs is 4 = min(1, 2) + min(3, 4).
```

**Note:**

1.  n is a positive integer, which is in the range of \[1, 10000\].
2.  All the integers in the array will be in the range of \[-10000, 10000\].

[](#理解 "理解")理解
--------------

题目很简单,就是对每两个数进行min操作,然后全部相加得到的数要最大.直接对数组进行排序,然后按顺序两两取最小(循环+2)然后相加即可.

[](#代码 "代码")代码
==============
```c++
class Solution {
    public:    
    int arrayPairSum(vector<int>& nums) {        
        sort(nums.begin(), nums.end());        
        int maximum = 0;        
        for(int i = 0; i < nums.size(); i+=2){            
            maximum += nums[i];        
        }        
        return maximum;    
    }
};
```