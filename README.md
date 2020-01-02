# 手写webpack

- 安装库 
- cnpm i -D tapable mkdirp ejs babylon babel-types babel-generator babel-traverse


## webpack工作流程
- $$=>表示发射事件
- 1、配置
  - 解析shell和webpack的配置项
  - 激活webpack插件的加载
- 2、webpack初始化 入口文件(`index.js/webpack-cli/bin/webpack.js compiler = new Webpack(options)`) 
  - 1、创建 `Compiler` 对象,在启动`webpack`时候被一次性建立,所有的插件都是基于 Compiler 的hooks
  - 2、注册 `NodeEnvironmentPlugin` 插件,往 `Compiler`上挂载`node`相关的理模块(fs等) 
  - 3、获取`options`中的`plugin`(外部插件),挂载插件,等待后面各个环节触发插件钩子
  - 4、使用 `WebpackOptionsApply` 促使化基础插件
    - $$ `Compiler:entryOption` 在 webpack 中的 entry 配置处理过之后 
- 3、run 开始编译(`Compiler.js/webpack-cli/bin/webpack.js compiler.run(compilerCallback)`)
  - 1、run函数里面 调用 `this.compile`开启编译
  - 2、`compile`编译的时候 实例化一个`Compilation` 他负责整个编译过程
    - 1、内部`this.compiler`对象执行了`Compiler`实例,他里面有options已经一些工具方法
    - 2、初始化`this.entries=[]` 入口列表
    - 3、初始化`this.chunks=[]` 代码块
    - 4、初始化`this.modules=[]` 所有模块
    - 5、初始化`this.assets=[]` 所有资源
    - 6、template
      - this.mainTemplate 编译主体模板
    - $$ `Compiler:beforeRun`  开始正式编译之前
    - $$ `Compiler:beforeCompile` compilation 实例化需要的参数创建完毕之后
    - $$ `Compiler:compile` 一次 compilation 编译创建之前
    - $$ `Compiler:thisCompilation` 触发 compilation 事件之前执行
    - $$ `Compiler:compilation` compilation创建成功之后	
- 4、make 制作
  - 1、执行make钩子 触发`SingleEntryPlugin`的插件 执行`compilation.addEntry(添加入口)`
  - 2、`_addModuleChain(增加模块链)`,根据入口文件通过对应的工厂方法创建模块,保存到`Compilation.entries`中
  - 3、对`module`进行`build`(Compilation),递归处理依赖的模块 => 对源码的解析处理(以下都是在NormalModule.js处理)
    - 1、`getSource` 调用loader处理源码
    - 2、使用`acorn`生成AST 遍历AST,
    - 3、如果源码里遇到`require`依赖,创建`dependencies`加入依赖数组,只要遇到`require`就会一直加入到依赖项,`Dependency`加入的数据结构与`NormalModule`类 接收的参数一致
    - 4、module处理完毕后,接着就是处理依赖项`buildDependencies(Compilation里)`接收两参数,第二个参数是依赖项,若里面有数据 就会一致递归
  - $$ `Compilation:buildModule` 在模块构建开始之前触发	
  - $$ `Compilation:successModule` 模块构建成功时执行
  - $$ `Compilation:finishModule` 所有模块都完成构建

- 5、seal 封包
  - 1、调用`compilation.seal` 对每个module和chunk进行整理,生成编译后的代码,合并,拆分。`chunks`里面存放着 同一个入口文件 所有require的资源
    - 1、`this.entries`存放所有的入口列表()
    - 2、`this._modules`存放的模块代码(每一个路径对应着,require 解析后的code)
    - 3、`this.modules`存放所有的模块(所有require的都会push进去)
    - 4、`this.chunks`存放的代码块 将获取的`module`用`Chunk`进行了封装
    - 5、`this.files`存放的所有入口的路径
    - 6、`this.assets`存放每个入口的打包资源文件
  - 2、`this.createChunkAssets`建立代码块资源,用ejs(源码是字符串数组拼接)和模板渲染生成打包文件,所有打包的资源文件 都存放在 this.assets(file+source)
  - $$ `Compilation:seal`         编译（compilation）停止接收新模块时触发
  - $$ `Compilation:optimize`       优化阶段开始时触发	       
  - $$ `Compilation:optimizeTree`     异步优化依赖树	
  - $$ `Compilation:afterOptimizeTree`  异步优化依赖树完成时	 
  - $$ `Compilation:optimizeChunkModulesBasic`  基础优化单个chunk中的 modules 开始	
  - $$ `Compilation:reviveModules`    从 records 中恢复模块信息	
  - $$ `Compilation:reviveChunks`   从 records 中恢复 chunk 信息	
  - $$ `Compilation:beforeChunks`   开始生成代码块	
  - $$ `Compilation:beforeHash`     在编译被哈希（hashed）之前	
  - $$ `Compilation:afterHash`      在编译被哈希（hashed）之后	
  - $$ `Compilation:beforeModuleAssets`  在创建模块的资源之前	
  - $$ `Compilation:chunkAsset`  一个 chunk 中的一个资源被添加到编译中	
- 6、最后执行回调函数,把Assets输出到output的path中,`Compiler.emitAssets`是回调的写入文件的方法
  - $$ `Compiler:emit`  生成资源到 output 目录之前	
  - $$ `Compiler:afterEmit` 生成资源到 output 目录之后	
  - $$ `Compiler:done` compilation完成之后	
  - $$ `Compiler:afterSeal`  seal之后	

- 流程图
<img src="img/webpackcode.jpg" >

## plugin 插件 
- webpack内部通过`tapable`申明的
- 第一步 创建一个钩子实例`environment : new SyncHook(['name'])` 有参数就往数组内添加(发布订阅)
- 第二步 往实例上 挂载(订阅)钩子`environment.tap('MyPlugin',()=>{})`
- 第三部 在各个环节 触发(发布)钩子`environment.call('123123')`
### 创建插件
- 组成
  - 插件函数的prototype 上定义一个apply方法
  - 执行一个绑定webpack自身事件的钩子
  - 处理webpack内部实例的特定数据
  - 功能完成后调用webpack提供回调
### compiler
  - 代表了完整的webpack环境配置,这个对象在启动webpack时被一次性建立,并配置好所有可操作性的设置,包括options,loader和plugin.在webpack环境中应用一个插件时,插件将受到此compiler对象的引用.可以是用它来访问webpack的主环境
### compilation
  - 代表一次资源版本构建,当运行webpack开发环境中间件时,每当检测到一个文件变化,就会创建一个新的compilation,从而生成一组新的编译资源,一个compilation队表现了当前的模块资源,编译生成资源,变化文件,以及被跟踪依赖的状态信息,compilation对象也提供了很多关键的时机的回调

### MyPlugin
```js
class MyPlugin{
  apply(complier){
    complier.hooks.environment.tap('MyPlugin',(data)=>{
      console.log('MyPlugin-->',data)
    })
  }
}
module.exports = MyPlugin;
```
### EmitPlugin
```js
// 我们想知道如果获取到 compilation 对象
class EmitPlugin{
  constructor(options){
    this.options = options
  }
  apply(complier){
    // AsyncSeriesHook 异步的串行钩子    
    complier.hooks.emit.tapAsync('EmitPlugin',(compilation,callback)=>{
      // 获取到 compilation 对象
      setTimeout(()=>{
        callback();
      },3000)
    })
  }
}
module.exports = EmitPlugin
```
### DonePlugin
```js
// 插件就是一个类  有一个apply方法 接收一个compiler对象
// 我们会在compiler对象的钩子上挂载一些监听函数,当compiler这个对象上这些钩子触发的时候 会执行对应的监听函数
class DonePlugin{
  constructor(options){
    this.options = options
  }
  // 内部会调用 apply 方法
  apply(compiler){
    // 每次编译完成后,都会call done这个事件
    compiler.hooks.done.tap('DonePlugin',()=>{
      console.log(this.options.message||'编译完成')
    })
  }
}

module.exports = DonePlugin
```
### OptimizePlugin
```js
// 我们想知道如果获取到 compilation 对象
class OptimizePlugin{
  constructor(options){
    this.options = options
  }
  apply(complier){
    // 获取到 compilation 对象 每当compiler对象创建出来一个compilation编译对象 那么就会触发回调 参数是compilation
    complier.hooks.compilation.tap('OptimizePlugin',compilation=>{
      compilation.hooks.optimize.tap('OptimizePlugin',()=>{
        console.log('webpack 编译对象正则优化中。。。。。。')
      })
    })
  }
}

module.exports = OptimizePlugin
```
### ZipPlugin
```js
const JSZip = require('jszip')
const {RawSource} = require('webpack-sources')
class ZipPlugin{
  constructor(options){
    this.options = options
  }
  apply(complier){
    // 当资源已经准备就绪 准备向输出的目录里写入的时候 会触发这个钩子
    // tapAsync/tapPromise 都可以
    // complier.hooks.emit.tapAsync('ZipPlugin',(compilation,callback)=>{
    //   // 获取到 compilation 对象
    //   // compilation.assets 代表有哪些资源要打包  source 是打包的内容
    //   // console.log(compilation.assets) 
    //   var zip = new  JSZip();
    //   for(let filename in compilation.assets){
    //     zip.file(filename,compilation.assets[filename].source())
    //   }
    //   // 把所有的文件压成一个压缩包 得到压缩包的二进制内容
    //   zip.generateAsync({type:'nodebuffer'}).then(content=>{
    //     // 向assets 上挂载了一个新的属性和值
    //     // compilation.assets[this.options.name] = {
    //     //   source(){return content},
    //     //   size(){return content.length}
    //     // };
          // 两种写法  RawSource 就是一个class 进行了封装 实际和上面是一样
    //     compilation.assets[this.options.name] = new RawSource(content);
    //     callback(null,compilation);
    //   })
    // })
    // tapPromise
    complier.hooks.emit.tapPromise('ZipPlugin',(compilation)=>{
      // 获取到 compilation 对象
      // compilation.assets 代表有哪些资源要打包  source 是打包的内容
      // console.log(compilation.assets) 
      var zip = new  JSZip();
      for(let filename in compilation.assets){
        zip.file(filename,compilation.assets[filename].source())
      }
      return  zip.generateAsync({type:'nodebuffer'}).then(content=>{
        // 往文件内写东西 不用直接写  将要写的内容挂载到 compilation.assets里面 内部会自动写入
        compilation.assets[this.options.name] = {
          source(){return content},
          size(){return content.length}
        };
        return Promise.resolve(compilation)
      })
    })
  }
}
class RawSource{
  constructor(content){
    this.content = content
  }
  source(){return content}
  size(){return content.length}
}
module.exports = ZipPlugin
/**
  写插件的一般思路
  1、找到插件代码 需要执行的钩子
  2、知道钩子函数的参数和数据结构,进行加工
 * 
 */
```
## loader 原理解析
- loader 原理
  - 每一个loader都是一个函数,loader包含 pitch 和 normal,当配置`use:['style-loader','css-loader']` 我们常说从右往左执行,实际这个指的是 normal loader,loader的执行顺序是: `style-loader.pitch => css-loader.pitch => css-loader.normal(普通) => style-loader.normal`。平常很少用到pitch但实际情况是他先执行，如果他返回一个不为`undefined` 那么会结束后面的要执行的loader,直接进入上一个loader的pitch方法中。
  - 下面附带 webpack内部 resource和loader 之间的关系,当路径匹配上后(`content = loader(content)`) resource会将自己传入loader内进行处理,后面返回resource,注意传递进去的是 string(可执行的js) 传出来的也是 string 
    - 下面第二个js 是loader内部解析,先分析 resource 的处理 整体情况后面再分析
    - pitch 核心处理 `pitchFn.apply(loaderContext,[loaderContext.remindingRequest,loaderContext.previousRequest,loaderContext.data])`
    - normal 核心处理 `normalFn.apply(loaderContext,[args])`
    - 上面2个处理 最终都会进入到`if(loaderContext.loaderIndex<0){  return  finallyCallback(null,args) }`,将他们执行后的结果返回出去 这样就将webpack 内部的 resource 进行的处理
  - 整个loader处理和webpack就关联起来了
- 解刨 normal 和 pitch
  - 调用 runLoaders 函数 接收配置参数 和 回调函数,注意`context`是loader内的上下文 可以传递数据`pitch`的第三个参数和this.data 同一个对象(都是上下文),在`pitch`内给第三个参数设置 在其他loader和 normal 都是可以通过`this.data`获取到的
  -  runLoaders 函数 主要处理了3件事
    - 1、将参数全部保存到`loaderContext`(也是指向context)对象上 
    - 2、`defineProperty(loaderContext)` 给上下文 增加属性 `request`(所有请求的loader) `remindingRequest`(剩下的loader) `previousRequest`(之前请求的loader) `currentRequest`(当前的loader)`data`(当前的上下文)
    - 3、`loaderContext.async`处理异步问题 他async 挂载到上下文
    - 4、执行`iteratePitchingLoaders` pitch
    - 剩下的就是 `iteratePitchingLoaders`和`iterateNormalLoaders`之间的一点逻辑判断
    - pitch loader 函数处理 `let args = pitchFn.apply(loaderContext,[loaderContext.remindingRequest,loaderContext.previousRequest,loaderContext.data])`这个是处理pitch loader 接收的参数 第一个是 剩下的loader(也就是当前loader之后的loader) 第二个是 之前的loader 第三个是 当前的上下文 最后返回的还是一个 字符串 (可执行的js)
    - normal loader 函数处理 `normalFn.apply(loaderContext,[args])` 他接收的就是上一个传递过来的 resource 是一个字符串 (可执行的js),同样他返回也是这样的 字符串  
- pitch 作用:让两个loader配合使用(在css-loader和style-loader体现明显)
```js
// loader1
function loader(inputSource){
  return inputSource +'//loader1'
}

loader.pitch = function(remindingRequest,previousRequest,data){
  data.pitch1 = 'pitch1'
}

module.exports = loader

// loader2
function loader(inputSource){
  let cb = this.async()
  setTimeout(()=>{
    cb(null,inputSource)
  },2000)
}

loader.pitch = function(remindingRequest,previousRequest,data){
  console.log('pitch2')
}
module.exports = loader

// loader3
function loader(inputSource){
  console.log('loader3',inputSource)
  return inputSource
}

loader.pitch = function(remindingRequest,previousRequest,data){
  console.log('pitch3')
  
}
// 默认情况下loader得到的内容是字符串 如果想要的得到二进制文件 需要把raw=true
loader.raw = true

module.exports = loader

// loader  pitch/normal
let path = require('path')
let fs = require('fs')

function createLoaderObject(loaderPath){
  let obj = {data:{}};//data是用来在pitch和normal里面传递数据的
  obj.request = loaderPath;//loader这个文件绝对值
  obj.normal = require(loaderPath);//正常的loader函数
  obj.pitch = obj.normal.pitch;//pitch函数
  return obj
}

function defineProperty(loaderContext){
  // 当index为1的时候
  Object.defineProperty(loaderContext,'request',{
    get:function(){// request loader1!loader2!loader3!hello.js
      return loaderContext.loaders.map(loader=>loader.request).concat(loaderContext.resource).join('!')
    },
  })
  Object.defineProperty(loaderContext,'remindingRequest',{
    get:function(){// request loader3!hello.js
      return loaderContext.loaders.slice(loaderContext.loaderIndex+1).map(loader=>loader.request).concat(loaderContext.resource).join('!')
    },
  })
  Object.defineProperty(loaderContext,'previousRequest',{
    get:function(){// request loader1
      return loaderContext.loaders.slice(0,loaderContext.loaderIndex).join('!')
    },
  })
  Object.defineProperty(loaderContext,'currentRequest',{
    get:function(){// request loader2!loader3!hello.js
      return loaderContext.loaders.slice(loaderContext.loaderIndex).map(loader=>loader.request).concat(loaderContext.resource).join('!')
    },
  })
  Object.defineProperty(loaderContext,'data',{
    get:function(){
      return loaderContext.loaders[loaderContext.loaderIndex].data
    },
  })
}

function iterateNormalLoaders(loaderContext,args,finallyCallback){
  if(loaderContext.loaderIndex<0){
    return  finallyCallback(null,args)
  }else{
    let currentLoaderObject = loaderContext.loaders[loaderContext.loaderIndex];
    let normalFn = currentLoaderObject.normal
    args = normalFn.apply(loaderContext,[args]);
    if(isSync){
      loaderContext.loaderIndex--
      iterateNormalLoaders(loaderContext,args,finallyCallback)
    }
  }
}

function processResource(loaderContext,finallyCallback){
  // 默认读出来的是buffer
  let result = loaderContext.readResource(loaderContext.resource)
  if(!loaderContext.loaders[loaderContext.loaderIndex].normal.raw){
    result = result.toString('utf8')
  }
  iterateNormalLoaders(loaderContext,result,finallyCallback)
}

function iteratePitchingLoaders(loaderContext,finallyCallback){
  if(loaderContext.loaderIndex >= loaderContext.loaders.length){
    loaderContext.loaderIndex--;
    return processResource(loaderContext,finallyCallback)
  }
  let currentLoaderObject = loaderContext.loaders[loaderContext.loaderIndex];
  let pitchFn = currentLoaderObject.pitch
  if(!pitchFn){
    loaderContext.loaderIndex++;
    return  iteratePitchingLoaders(loaderContext,finallyCallback)
  }
  // 剩下的 request 前面的 request 
  let args = pitchFn.apply(loaderContext,[loaderContext.remindingRequest,loaderContext.previousRequest,loaderContext.data])
  if(args){
    loaderContext.loaderIndex--;
    iterateNormalLoaders(loaderContext,args,finallyCallback)
  }else{
    loaderContext.loaderIndex++;
    return  iteratePitchingLoaders(loaderContext,finallyCallback)
  }
}

var isSync = true

function runLoaders(options,finallyCallback){
  let loaderContext = options.context||{};// loader的上下文环境
  loaderContext.resource = options.resource;// 要加载的资源 hello.js
  loaderContext.loaders = options.loaders.map(createLoaderObject);
  loaderContext.loaderIndex = 0;// loaderIndex是正在执行loader的索引
  loaderContext.readResource = options.readResource;// fs.readFile
  defineProperty(loaderContext)
  
  function asyncCallback(err,result){
    isSync = true
    loaderContext.loaderIndex--;
    iterateNormalLoaders(loaderContext,result,finallyCallback)
  }
  loaderContext.async = function(){
    isSync = false;
    return asyncCallback;
  }
  iteratePitchingLoaders(loaderContext,finallyCallback)
}

runLoaders({
  resource:path.resolve(__dirname,'src','hello.js'),//要加载的资源
  loaders:[// 我们要用这三个loader去转换hello.js
    path.resolve('loader','loader1.js'),
    path.resolve('loader','loader2.js'),
    path.resolve('loader','loader3.js'),
  ],
  context:{ },
  readResource:fs.readFileSync.bind(fs)
},function(err,rs){
  console.log('=>',rs)
})
```
### style-loader
- style-loader 主要作用将css 代码插入到页面的style标签中
```js
const loaderUtils = require('loader-utils')
// 不配合 css-loader 时候用
function loader(source){
  let style= `
    let style = document.createElement('style')
    style.innerHTML = ${JSON.stringify(source)}
    document.head.appendChild(style)
    `
    style = style.replace(/(\\+n|\+r)/g,'')
    return style
}
// pitch 作用是 让两个loader配合使用
      
// ** 最后 require是在浏览器执行的

// 如果不加 !! 会出现死循环

// 处理 css 的时候  会先执行 style pitch 如果用loader处理(他无法处理js) 在pitch处理的时候他能通过`remindingRequest`获取剩下的loader 这里要在loader加!! 表示 只能当前的loader(或者叫内联loader处理) 如果不他 他还会走到`style-loader`内 会造成无线循环
// 配合 css-loader 时候用
loader.pitch = function(remainingRequest){
  let script =(`
      let style = document.createElement('style')
      style.innerHTML = require(${loaderUtils.stringifyRequest(this,"!!"+remainingRequest)})
      document.head.appendChild(style)
    `)
    return script
}
module.exports = loader
```
### postcss
  - [ast](https://astexplorer.net/#/2uBU1BLuJ1)
  - [api](http://api.postcss.org/)
  - postcss 是用来解析css 转换成ast(类似)  主要功能是插件做的
    - 他和babel一样只有分解功能 没有变化功能,具体操作需要插件 
    - 用法(下面是固定格式,具体例子看下面 css-loader)
  - 基础用法
```js
  // 插件
  function createPlugin(options){
    return function(css){ 
      // 遍历每一条规则
      // css.walkDecls 
    })
    }
  }
  postcss([createPlugin(options)]).process(inputSource,{from:undefined}).then(rs=>{console.logo('rs',rs)}
```
### sprite-loader
- spritesmith 用法
```js
let path = require('path')
const SpriteSmith = require('spritesmith')
let fs = require('fs')
let sprites = [
  path.resolve('../img/1.jpg'),
  path.resolve('../img/2.jpg'),
  path.resolve('../img/3.jpg'),
];
SpriteSmith.run({src:sprites},(err,result)=>{
  console.log(err)
  console.log(result)
  fs.writeFileSync('sprite.jpg',result.image)
})
```
```js
const postcss = require('postcss')
const path = require('path')
const loaderUtils = require('loader-utils')
const SpriteSmith = require('spritesmith')
const Tokenizer = require('css-selector-tokenizer')
function loader(inputSource){
    let callback = this.async();
    let that = this;//this.context 代表被加载资源的上下文目录
  function createPlugin(postcssOptions){
    return function(css){
      css.walkDecls(function(decl){
        let values = Tokenizer.parseValues(decl.value)
        values.nodes.forEach(value=>{
          value.nodes.forEach(item=>{
            if(item.type == 'url' && item.url.endsWith('?sprite')){
              // 拼一个路径 找到的是这个图片的绝对路径
              let url = path.resolve(that.context,item.url)
              item.url = postcssOptions.spriteFilename;
              // 案例说我要在当前规则下面添加一条background-position
              postcssOptions.rules.push({
                url,// 原始图片的绝对路径,未来合并雪碧图用
                rule:decl.parent // 
              })
            }
          })
        })
        decl.value = Tokenizer.stringifyValues(values)
      })
      // css 添加数据 先给他们一个占位符 在替换 
      postcssOptions.rules.map(item=>item.rule).forEach((rule,index)=>{
        // 注意这个的 index 用法 首次数组为空  加一个数组内容对应的index 就会变化
        rule.append(
          postcss.decl({
            prop:'background-position',
            value:`_BACKGROUND_POSITION_${index}_`
          })
        )
      })
    }
  }
  const postcssOptions = {spriteFilename:'sprite.jpg',rules:[]}
  let pipeline = postcss([createPlugin(postcssOptions)]);
  pipeline.process(inputSource,{from:undefined}).then(rs=>{
    let cssStr = rs.css
    let sprites = postcssOptions.rules.map(item=>item.url.slice(0,item.url.lastIndexOf('?')))

    SpriteSmith.run({src:sprites},(err,result)=>{
      let coordinates = result.coordinates
      Object.keys(coordinates).forEach((key,index)=>{
        cssStr = cssStr.replace(`_BACKGROUND_POSITION_${index}_`,`-${coordinates[key].x}px -${coordinates[key].y}px`)
      })
      that.emitFile(postcssOptions.spriteFilename,result.image)
      // 注意 导出的是模块是字符串 要加'' JSON.stringify功能就是加''但是他比直接加'' 要好,他可以出来\n  
      callback(null,`module.exports = ${JSON.stringify(cssStr)}`);
    })
  })
}
loader.raw = true
module.exports = loader
```
### px2rem-loader
```js
const postcss = require('postcss')
const path = require('path')
const loaderUtils = require('loader-utils')
const SpriteSmith = require('spritesmith')
const Tokenizer = require('css-selector-tokenizer')
function loader(inputSource){
    let callback = this.async();
    let {remUnit=75,remPrecision=8} = loaderUtils.getOptions(this)
    let that = this;//this.context 代表被加载资源的上下文目录
  function createPlugin(postcssOptions){
    return function(css){
      css.walkDecls(function(decl){
        let values = Tokenizer.parseValues(decl.value)
        values.nodes.forEach(value=>{
          value.nodes.forEach(item=>{
            if(item.name.endsWith('px')){
              let px =  parseInt(item.name);
              let rem = (px/remUnit).toFixed(remPrecision);
              item.name = rem+'rem';
            }
          })
        })
        decl.value = Tokenizer.stringifyValues(values)
      })
    }
  }
  const postcssOptions = {}
  let pipeline = postcss([createPlugin(postcssOptions)]);
  pipeline.process(inputSource,{from:undefined}).then(rs=>{
    let cssStr = rs.css
    callback(null,`module.exports = ${JSON.stringify(cssStr)}`);
  })
}
module.exports = loader
```
### css-loader
  - 作用是处理css中的 @import 和 url 这样的外部资源
  - 安装`postcss` 将css 转换成ast语法树
  - css-loader的原理 解析css 语法 找到 url 个 @import 将他们替换成 `require` 语法,将处理的数据 返回给 style-loader 处理
```js
const postcss = require('postcss')
const Tokenizer = require('css-selector-tokenizer')
const loaderUtils = require('loader-utils');

function createPlugin(options){
  return function(css){
    let {urlItems,importItems} = options
    // 遍历 import等规则
    css.walkAtRules(/^import$/,function(rule){
      let values = Tokenizer.parseValues(rule.params)
      let url = values.nodes[0].nodes[0]  //{value:'./base.css'}
      importItems.push(url.value)
      
    })
    // 遍历每一条规则
    css.walkDecls(function(decl){
      // 将字符串转成对象
      let values = Tokenizer.parseValues(decl.value)// '75px solid red'
      values.nodes.forEach(value=>{
        value.nodes.forEach(item=>{
          if(item.type === 'url'){
            let url = item.url
            item.url = `_CSS_URL_${urlItems.length}_`
            urlItems.push(url) // .avatar.gif
          }
        })
      })
      // 将对象转成字符串
      decl.value = Tokenizer.stringifyValues(values)
    })
  }
}

function loader(inputSource){
  let callback = this.async()
  let options = {
    importItems:[],
    urlItems:[]
  };
  // loaderUtils.stringifyRequest他 可以把一个绝对路径 转换成合适loader的相对路径
  // background-img:url(./avatar.gif)
  postcss([createPlugin(options)]).process(inputSource,{from:undefined}).then(rs=>{
    let importJs = options.importItems.map(imp=>{
      // return '"+require("'+imp+'")+"'
      return "require("+loaderUtils.stringifyRequest(this,imp)+")"
    }).join('\n')// @import './base.css';
    let cssString = JSON.stringify(rs.css)// url('_CSS_URL_0_')
  
    // 替换 @import './base.css'
    cssString = cssString.replace(/@import\s+?.+?;/,"")
    // 替换 url('_CSS_URL_0_')
    cssString = cssString.replace(/_CSS_URL_(\d+?)_/g,function(matched,group1){
      let imageUrl = options.urlItems[+group1];
      //  打包的时候 imageUrl 变成真实的地址  最后 require是在浏览器执行的
      return '"+require("'+imageUrl+'")+"';
    });
      // ${importJs}
    callback(null,`
      ${importJs}
      module.exports = ${cssString};
    `)
  })
}

module.exports = loader
```
### url-loader
```js
/*
  读取源文件的内容,并且重命名 写入到新的输出目录下
  如果文件的大小小于limit的话,就不在拷贝新的文件到输出目录,而是直接返回base64字符串
*/
const {getOptions,interpolateName} = require('loader-utils')
const fileLoader = require('file-loader');
const mime = require('mime');
function loader(content){// this = loaderContext
  let {filename='[name].[hash].[ext]',limit=1024*64} = getOptions(this)||{};
  console.log(limit,content.length)
  if(content.length<limit){
  
    // base64 格式 data:image/jpeg;base64,xxxxxxxxx
    const contentType = mime.getType(this.resourcePath);// 返回次图片的内容类型
    let base64 = `data:${contentType};base64,${content.toString('base64')}`;
    // JSON.stringify 作用是在外面包裹一层 字符串 module.exports = ${JSON.stringify(base64)} 这个是要在浏览器跑的  
    // 浏览器 自己模拟了一套commonjs规范 module.exports 所以 module.exports 能在浏览器执行
    return `module.exports = ${JSON.stringify(base64)}`;
  }
  return fileLoader.call(this,content)
}
loader.raw = true
module.exports = loader
```
### file-loader
```js
/*
  读取源文件的内容,并且重命名 写入到新的输出目录下
*/
const {getOptions,interpolateName} = require('loader-utils')
function loader(content){
  let options = getOptions(this)||{};
  // [name].[hash].[ext]这些占位符 都在 loader-utils 里面文档有写
  let filename = options.filename||'[name].[hash].[ext]';
  
  // 生成文件名字 第一个是this 第二个是一个字符串 第三个是content 内容
  let outputFilename =  interpolateName(this,filename,{content})
  // 写文件 把content内容输出到outputFilename 里
  this.emitFile(outputFilename,content)
  /*
    1、使用 require('xxx') 
    2、使用 url('xxxx') 
    
    首先遇到 url 的时候 css 会处理他 将他url 转换成require 的格式
    图片都是require 进去的 所以file-loader 需要给他们导出一个 url 的地址  也就是上面emitFile 发射出去的名字
  */  
  return `module.exports = ${JSON.stringify(outputFilename)}`;
}
loader.raw = true
module.exports = loader
```
### babel-loader
- babel 插件写法(提交例子可以参考 箭头函数的转换=>搜索 ArrowFunctionExpression)
```js
let transformArrayFunction = {
  // visitor 可以访问源代码生成的语法树的所有节点,捕获特定的节点
  visitor:{
    // 节点
    Identifier:(path,state)=>{
      console.log(path.node)
    }
  }
}
let rs = babel.transform(sourceCode,{
  plugins:[transformArrayFunction]
},(err,rs)=>{
  console.log(rs.code)
})
```
- `babel.transform` 将源代码 转义成ast,他的作用只是ast 其他的处理全部交给插件处理,同时加入配置 这里的options和webpack loader里面的配置是一模一样的
```js
const path = require('path')
const babel = require('@babel/core')
const loaderUtils = require('loader-utils');
function loader(inputSource){ 
  // 
  let  options = loaderUtils.getOptions(this);
  console.log(options)
   options = {
     ...options,//二选一
    // presets:[  "@babel/preset-env"],
    sourceMaps:true,// 告诉babel我要生成sourcemap 如果提供了 webpack sourcemap就用它的 不给它自己弄 , 要设置 devtool:'source-map' 自己设置后names 选项就有值了
    filename:path.basename(this.resourcePath)// 内部的api this上提供的 当前处理文件的路径，例如 /src/main.js
  }
  //  转义之后会生成3个文件
  let {code,map,ast} = babel.transform(inputSource,options);
  console.log(code,map,ast)
  // 我们可以吧sourcemap ast 都传给webpack 这样webpack就不需要自己吧源代码转语法树了，也不需要自己生成sourcemap
  return this.callback(null,code,map,ast)
}
module.exports = loader
```
### banner-loader
```js
const loaderUtils = require('loader-utils');
const validateOptions = require('schema-utils');
const fs = require('fs');
function loader(source) {
    //把loader改为异步,任务完成后需要手工执行callback
    let cb = this.async();
    //启用loader缓存
    this.cacheable && this.cacheable();
    //用来验证options的合法性
    let schema = { 
        type: 'object',
        properties: {
            filename: {
                type: 'string'
            },
            text: {
                type: 'string'
            }
        }
    }
    //通过工具方法获取options
    let options = loaderUtils.getOptions(this);
    //用来验证options的合法性
    validateOptions(schema, options, 'Banner-Loader');
    let { text, filename } = options;
    if (text) {
        cb(null, text + source);
    } else if (filename) {
        fs.readFile(filename, 'utf8', (err, text) => {
            cb(err, text + source);
        });
    }
}
module.exports = loader;
```
### exact-loader
```js
//把CSS文件单独放置到一个文件中去，然后在页面中通过link标签去引入
let loader = function (source) {
    //发射或者说输出一个文件，这个文件的内容 就是css文件的内容
    this.emitFile('main.css', source);
    let script = `
    let link  = document.createElement('link');
    link.setAttribute('rel','stylesheet');
    link.setAttribute('href','main.css');
    document.head.appendChild(link);
  `;
    return script;
}
module.exports = loader;
```