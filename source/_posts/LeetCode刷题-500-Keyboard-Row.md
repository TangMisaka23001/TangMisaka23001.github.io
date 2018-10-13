---
title: LeetCode刷题--500. Keyboard Row
date: 2017-07-31 19:53:42
categories: [算法]
tags: [LeetCode]
---
[](#题目及理解 "题目及理解")题目及理解
=======================

Given a List of words, return the words that can be typed using letters of alphabet on only one row’s of American keyboard like the image below.  
[![](https://leetcode.com/static/images/problemset/keyboard.png)](https://leetcode.com/static/images/problemset/keyboard.png)  
**Example 1:**  
```
Input: ["Hello", "Alaska", "Dad", "Peace"]
Output: ["Alaska", "Dad"]
```

**Note:**

*   You may use one character in the keyboard more than once.
*   You may assume the input string will only contain letters of alphabet.

[](#理解 "理解")理解
--------------

水题,题目的意思就是那些单词可以只用一行上的字母来生成.先以单词的第一个字母来确定属于哪一行,然后逐个判断后面的字母是不是这一行的就可以了.

[](#代码 "代码")代码
==============
```c++
class Solution {
    public:    
        vector<string> findWords(vector<string>& words) {        
            vector<string> corr;        
            set<char> r1 = {'q','w','e','r','t','y','u','i','o','p'};        
            set<char> r2 = {'a','s','d','f','g','h','j','k','l'};        
            set<char> r3 = {'z','x','c','v','b','n','m'};        
            vector<set<char>> row = {r1,r2,r3};                
            for (int i=0; i<words.size(); i++){            
                int rows = 0;                        
                for (int j=0;j<3;j++){                
                    if (row[j].count(tolower(words[i][0])) > 0)  rows = j;                
                    continue;            
                }                        
                corr.push_back(words[i]);            
                for (int k = 1; k <words[i].size(); k++){                
                    if (row[rows].count(tolower(words[i][k])) == 0){                    
                        corr.pop_back();                
                        break;                
                    }                                
                }        
            }        
            return corr;    
    }
};
```

[](#其他的解法 "其他的解法")其他的解法
=======================

Discuss里面也有很多很简短的代码的解法,基本上都是用到了正则表达式和过滤的结合,这里贴一个Python版的:  
```python
def findWords(self, words):    
    return filter(re.compile('(?i)([qwertyuiop]*|[asdfghjkl]*|[zxcvbnm]*)$').match, words)
```
一行就解决了这个问题,正则还是强大啊~