---
title: '补充:在MockMvc中使用各种POST提交数据的方式'
mathjax: false
date: 2018-10-18 21:44:29
categories: [Java]
tags: [MockMvc, Web]
---
# application/x-www-form-urlencoded
这是比较常用的提交数据的方式,在项目中也使用的是这一种,在MockMvc测试的参数准备时可以这样使用:
```java
UrlEncodedFormEntity form = new UrlEncodedFormEntity(Arrays.asList(
                new BasicNameValuePair("参数1", value1),
                new BasicNameValuePair("参数2", value2),
        ), "utf-8");
MvcResult result = mvc.perform(MockMvcRequestBuilders.post("/test")
        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
        .content(EntityUtils.toString(form))
)
        .andExpect(status().isOk()).andReturn();
```
主要使用的是`UrlEncodedFormEntity`类,要注意的是需要设置字符集否则传参的时候中文会变成`???`.

# application/json
我使用的是用阿里开源的fastjson直接转换的形式:
```java
Parm parm = new Parm(); //你要传的参数的对象
//设置参数对象的值
String requestJson = JSONObject.toJSONString(parm);
MvcResult result = mockMvc.perform(post("/softs")
        .contentType(MediaType.APPLICATION_JSON)
        .content(requestJson)
)
        .andDo(print())
        .andExpect(status().isOk()).andReturn(); 
```

# multipart/form-data
这个没有使用过,就借鉴Stack Overflow上的一个答案:
```java
MockMultipartFile file = new MockMultipartFile("data", "dummy.csv",
        "text/plain", "Some dataset...".getBytes());

MockMultipartHttpServletRequestBuilder builder =
        MockMvcRequestBuilders.fileUpload("/test1/datasets/set1");
builder.with(new RequestPostProcessor() {
    @Override
    public MockHttpServletRequest postProcessRequest(MockHttpServletRequest request) {
        request.setMethod("PUT");
        return request;
    }
});
mvc.perform(builder
        .file(file))
        .andExpect(status().ok());
```

# get请求传参
这个虽然不是POST也很简单,但是也记录一下
```java
MvcResult result = mvc.perform(MockMvcRequestBuilders.post("/v4/address/deleteAddress")
        .param("参数1", value1)
        .param("参数2", value2)
)
        .andExpect(status().isOk()).andReturn();
```
也可以使用params的方式使用Map来传参,但是我还是习惯这样来初始化,因为毕竟每个参数还是需要自己设置的,这样看起来也清晰一点.