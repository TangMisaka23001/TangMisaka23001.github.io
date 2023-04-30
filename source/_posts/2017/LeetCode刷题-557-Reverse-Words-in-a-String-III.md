---
title: LeetCode刷题--557. Reverse Words in a String III
date: 2017-08-01 20:54:46
categories: [技术]
tags: [算法, LeetCode]
---
[](#题目及理解 "题目及理解")题目及理解
=======================

**题目连接**[557\. Reverse Words in a String III](https://leetcode.com/problems/reverse-words-in-a-string-iii/description/)

Given a string, you need to reverse the order of characters in each word within a sentence while still preserving whitespace and initial word order.  
**Example 1:**  
```
Input: "Let's take LeetCode contest"
Output: "s'teL ekat edoCteeL tsetnoc"
```

**Note:** In the string, each word is separated by single space and there will not be any extra space in the string.
<!-- more -->
[](#理解 "理解")理解
--------------

水题,就是按照每个单词进行翻转.我的方法是遇到空格之前都压入栈中,然后遇到空格全部pop出来,结果自己僵化,最后没有空格的时候没有把最后一个单词pop出来,这里需要注意一下.

[](#代码 "代码")代码
==============
```c++
class Solution {
    public:    
        string reverseWords(string s) {        
            string news;        
            stack<char> stack;        
            for (int i=0; i<s.size(); i++){            
                stack.push(s[i]);            
                if (stack.top() == ' '){                
                    stack.pop();                
                    while(!stack.empty()){                    
                        news += (char)stack.top();                    
                        stack.pop();                
                    }                
                    news += ' ';            
                }        
            }        
            while(!stack.empty()){                    
                news += (char)stack.top();                    
                stack.pop();                
            }        
        return news;    
    }
};
```

[](#其他解法 "其他解法")其他解法
====================

看了别人dalao写的代码,用的是找空格然后整体翻转的思路,但是我这样写比较偷懒吧= =  
```c++
class Solution {
    public:    
        string reverseWords(string s) {        
            for (int i = 0; i < s.length(); i++) {            
                if (s[i] != ' ') {   // when i is a non-space
                    int j = i;                
                    for (; j < s.length() && s[j] != ' '; j++) { }  // move j to the next space                
                    reverse(s.begin() + i, s.begin() + j);                
                    i = j - 1;            
                }        
            }                
        return s;    
    }
};
```