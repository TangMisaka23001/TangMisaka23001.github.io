---
title: LeetCode刷题--617. Merge Two Binary Trees
date: 2017-07-19 18:55:16
categories: [技术]
tags: [算法, LeetCode]
---
[](#题目及理解 "题目及理解")题目及理解
=======================

[题目链接](https://leetcode.com/problems/merge-two-binary-trees/#/description)  
Given two binary trees and imagine that when you put one of them to cover the other, some nodes of the two trees are overlapped while the others are not.

You need to merge them into a new binary tree. The merge rule is that if two nodes overlap, then sum node values up as the new value of the merged node. Otherwise, the NOT null node will be used as the node of new tree.

**Example 1:**  
```
Input: 	
            Tree 1                     Tree 2                 
                1                         2                                      
               / \                       / \                                    
              3   2                     1   3                               
             /                           \   \                            
            5                             4   7                  
Output: Merged tree:	     
                3	    
               / \	   
              4   5	  
             / \   \ 	 
            5   4   7

**Note:** The merging process must start from the root nodes of both trees.
```

[](#读题 "读题")读题
--------------

简单题目,就是把两棵二叉树的各个结点加起来生成一棵新的树.只要遍历每个结点然后将值相加就好.

[](#代码 "代码")代码
==============
```c++
/** 
* Definition for a binary tree node. 
* struct TreeNode { 
*     int val; 
*     TreeNode *left; 
*     TreeNode *right; 
*     TreeNode(int x) : val(x), left(NULL), right(NULL) {} 
* }; 
*/
class Solution {
    public:    
    TreeNode* mergeTrees(TreeNode* t1, TreeNode* t2) {        
        TreeNode* t3;        
        if(t1 == NULL)            
        return t2;        
        if(t2 == NULL)            
        return t1;        
        t3 = new TreeNode(t1->val+t2->val);        
        t3->left = mergeTrees(t1->left,t2->left);        
        t3->right = mergeTrees(t1->right,t2->right);        
        return t3;    
    }
};
```