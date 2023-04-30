---
title: 深入浅出现代Web编程(全栈公开课 2020) 笔记
mathjax: false
date: 2020-08-30 14:58:27
categories: [技术]
tags: [课程, 笔记, Xmind, React, Javascript, Express]
---
# 深入浅出现代Web编程:[https://fullstackopen.com/zh/](https://fullstackopen.com/zh/)

![](https://misakatang.oss-cn-beijing.aliyuncs.com/blog_picture/fullstack.png)
<!-- more -->
[full_stack_open.xmind](https://github.com/TangMisaka23001/TangMisaka23001.github.io/blob/source/xmind/fullstackopen.xmind)
## 前端

### JavaScript

#### Variables
- const 
- let 
- var (不建议使用)

#### Arrays
- `const t2 = t.concat(5)`
- `const m1 = t.map(value => value * 2)`
- 解构赋值: `const [first, second, ...rest] = t`  
- 展开语法
    - [...numbers, 4, 5]

#### Objects
```js
  const object3 = {
    name: {
      first: 'Dan',
      last: 'Abramov',
    },
    grades: [2, 3, 5, 3],
    department: 'Stanford University',
  }
```
- 对象展开
    - `const changedNote = { ...note, important: !note.important }`

#### Functions
- 箭头函数
    - 完整过程
        ```js
        const sum = (p1, p2) => {
        console.log(p1)
        console.log(p2)
        return p1 + p2
        }
        ```
    - 只有一个参数
        ```js
        const square = p => {
        console.log(p)
        return p * p
        }
        ```
    - 只包含一个表达式
        - `const square = p => p * p`
- Object methods and "this"
    - 使用箭头函数可以解决与 this相关的一系列问题


#### Classes
```js
class Person {
constructor(name, age) {
    this.name = name
    this.age = age
}
greet() {
    console.log('hello, my name is ' + this.name)
}
}
const adam = new Person('Adam Ondra', 35)
adam.greet()
```
#### Destructuring (解构)
```js
  const Hello = ({ name, age }) => {  const bornYear = () => new Date().getFullYear() - age
    return (
      <div>
        <p>
          Hello {name}, you are {age} years old
        </p>
        <p>So you were probably born in {bornYear()}</p>
      </div>
    )
  }
```
- 解构使变量的赋值变得更加容易，因为我们可以使用它来提取和收集对象属性的值，将其提取到单独的变量中
- `const { name, age } = props`
- `const Hello = ({ name, age }) => {`

#### 对象的展开语法
```js
  const handleLeftClick = () => {
    const newClicks = { 
      ...clicks, 
      left: clicks.left + 1 
    }
    setClicks(newClicks)
  }
```
- `{ ...clicks, right: 1 }`
- `Math.max(...notes.map(n => n.id))`

#### promises(axios)
- 表示异步操作的对象
- 注册一个事件处理访问操作的结果 ==> .then()
    ```js
    axios
    .get('http://localhost:3001/notes')
    .then(response => {
        const notes = response.data
        console.log(notes)
    })
    ```
- 错误处理
    ```js
        .catch(error => {
            console.log('fail')
        })
    ```
#### template string

- `console.log(`importance of ${id} needs to be toggled`)`

#### Property definitions

- `export default { getAll, create, update }`

#### ESLint
- node_modules/.bin/eslint --init
- [Airbnb 的 ESlint](https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb)

#### async/await
- 错误处理
    - express-async-errors

#### local storage
- window.localStorage

#### TypeScript
- 主要语言特性
    - 类型注解
        - const birthdayGreeter = (name: string, age: number): string => {
    - 结构化类型
    - 类型推断
    - 类型擦除
- ts-node-dev
- [工具类型](https://www.typescriptlang.org/docs/handbook/Utility-types.html)
    - Pick
    - Omit

### React

#### Component 组件
- 语法
    - 箭头函数 + 代码简写
    ```js
    const App = () => (
    <div>
        <p>Hello world</p>
    </div>
    )
    ```
    - 不简写版本
    ```js
    const App = () => {
    return (
        <div>
        <p>Hello world</p>
        </div>
    )
    }
    ```
	- 多组件
		- React 的核心理念，就是将许多定制化的、可重用的组件组合成应用
	- props
		- 向组件传递数据
			- `const Hello = (props) =>`
			- `<Hello name="Maya" age={26 + 10} />`
		- 将状态传递给子组件
			- 状态提升
				- 将共享状态提升到它们最接近的共同祖先

	- 组件辅助函数: 在函数中定义函数
    ```js
    const Hello = (props) => {
    const bornYear = () => {    const yearNow = new Date().getFullYear()    return yearNow - props.age  }
    return (
        <div>
        <p>
            Hello {props.name}, you are {props.age} years old
        </p>
        <p>So you were probably born in {bornYear()}</p>    </div>
    )
    }
    ```
	- 将事件处理传递给子组件
		- `handleClick = { () => func() }`

	- 受控组件
        - 组件现在控制了元素的行为
		- 注册一个事件处理来同步对元素所做的更改和组件的状态
    ```js
	  <input
	  value={newNote}
	  onChange={handleNoteChange} />
	  
	  const handleNoteChange = (event) => {
	    console.log(event.target.value)
	    setNewNote(event.target.value)
	  }
    ```
	- 表单
    ```js
	  <form onSubmit={addNote}>
	    <input
	    value={newNote}
	    onChange={handleNoteChange}        />
	    <button type="submit">save</button>
	  </form>  
	  
	    const handleNoteChange = (event) => {    console.log(event.target.value)    setNewNote(event.target.value)  }
    ```
#### JSX
- [Babel](https://babeljs.io/repl/)
#### Hook
- Hook的规则
    - 不能从循环、条件表达式或任何不是定义组件的函数的地方调用 useState

-  [state hook](https://reactjs.org/docs/hooks-state.html)
    - 导入 useState 函数
        - `import React, { useState } from 'react'`
    - 定义组件的函数体
        - `const [ counter, setCounter ] = useState(0)`
    - 每次 setCounter 修改状态时，它都会导致组件重新渲染

- [effect hooks ](https://reactjs.org/docs/hooks-effect.html)
    - 从服务器获取数据时使用的正确工具
    ```js
        useEffect(() => {
        axios
        .get('http://localhost:3001/notes')     
        .then(response => {    
            setNotes(response.data)      
            })  
        }, [])
    ```
    - 在函数组件中执行副作用
    - 数据获取、设置订阅和手动更改 React 组件中的 DOM 

#### 事件处理
- 鼠标事件
    -  `<button onClick={() => console.log('clicked')}>`

#### 渲染
- 页面重渲染
    - ReactDOM.render 

- [条件渲染](https://reactjs.org/docs/conditional-rendering.html)

- 渲染集合
    - `notes.map(note => <li>{note.content}</li>)`
    - Key-属性
        - React 使用数组中对象的key属性来确定组件在重新渲染时，如何更新组件生成的视图
        - `<li key={note.id}>`
#### 调试
- React developer tools扩展

#### [React router](https://github.com/reacttraining/React-router)
- Parameterized route
- useHistory

### 样式
- CSS
- Inline styles
- UI libraries
    - [Bootstrap](https://getbootstrap.com/%20%E5%B7%A5%E5%85%B7%E5%8C%85)
    - [reactstrap](https://fullstackopen.com/zh/part7/reactstrap)
    - [MaterialUI](https://material-ui.com/)

### production build (生产构建)
- npm run build
	- 创建一个名为build 的目录
	- 代码的Minified版本将生成到static 目录
	- 所有的 JavaScript 都将被缩小到一个文件中

### Flux-架构
- redux
	- Action 
	- reducer
		- Reducer 状态必须由不可变 immutable 对象组成
	- store
	- dispatch
	- subscribe
	- immutable
- react-redux
	- Provider 
- [deep-freeze](https://github.com/substack/deep-freeze)
	- 确保 reducer 被正确定义为不可变函数
- Pure functions
- [redux-thunk](https://github.com/gaearon/redux-thunk)

### Webpack

## 后端

### Express

- 路由参数
    - `app.get('/api/notes/:id', ...)` 
    ```js
    app.get('/api/notes/:id', (request, response) => {
        const id = request.params.id
    }
    ```

- 错误处理
	- `response.status(404).end()`
- json-parser
	- `app.use(express.json())`
- Promise chaining

### REST

- 统一接口 uniform interface

### CORS

- `const cors = require('cors')`

### 部署静态文件

- `app.use(express.static('build'))`

### MongoDB

- [MongoDB Atlas](https://www.mongodb.com/cloud/Atlas)
- Schema
- model
- validation

### 错误处理

- `.catch(error => {`
- 移入中间件
	- [Sentry](https://sentry.io/welcome/)
- next 函数
	- `.catch(error => next(error))`

### 目录结构
```
├── index.js
├── app.js
├── build
│   └── ...
├── controllers
│   └── notes.js
├── models
│   └── note.js
├── package-lock.json
├── package.json
├── utils
│   ├── config.js
│   ├── logger.js
│   └── middleware.js
```
### 密钥认证

- [jsonwebtoken ](https://github.com/auth0/node-jsonwebtoken)

### GraphQL

- Apollo server

## Testing 
- Jest
    - afterAll
    - beforeEach
- mock
    - mongo-mock
- [supertest](https://github.com/visionmedia/supertest)

## 其余
### 模块提取 (单一职责原则)
- components
- service

### 教材
- [Mozilla's Javascript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [重新认识JavaScript(JS 教程)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/A_re-introduction_to_JavaScript)
- [You-Dont-Know-JS](https://github.com/getify/You-Dont-Know-JS)
- [Functional Javascript](https://www.youtube.com/watch?v=BMUiFMZr7vk&list=PL0zVEGEvSaeEd9hlmCXrk5yUyqUag-n84)

### Node.js
- 基于谷歌的 chrome V8 引擎的 JavaScript 运行时环境

### 资源
- [Functional Programming in JavaScript](https://www.youtube.com/playlist?list=PL0zVEGEvSaeEd9hlmCXrk5yUyqUag-n84)

### 工具 
- create-react-app
- JSONView
- npm
    - json-server
    - axios 
    - express 
    - nodemon (代码热更新)
        - `npm install --save-dev nodemon`
    - `npm install cors --save`
    - Mongoose
        - `npm install mongoose --save`
    - dotenv 
        - `npm install dotenv --save`
    - `npm install eslint --save-dev`
    - `npm install --save-dev jest`
    - `npm install --save-dev deep-freeze`
    - `npm install --save react-redux`
    - `npm install --save-dev redux-devtools-extension`
    - `npm install --save-dev ts-node-dev`
- Postman
- Visual Studio Code REST client
- [Redux DevTools](https://chrome.google.com/webstore/detail/Redux-DevTools/lmhkpmbekcpmknklioeibfkpmmfibljd)