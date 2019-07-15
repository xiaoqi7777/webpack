# webpack

- 安装
  - cnpm i -D webpack webpack-cli webpack-dev-server 
  - html-webpack-plugin 生成 html模板
  - css-loader style-loader  less less-loader sass-loader node-sass

- css处理
  - let MiniCssExtractPlugin = require('mini-css-extract-plugin')
    - 这个插件主要将css 提取出来生成一个文件 在被html link进去  取代style-loader
    - 用法 先注册插件 生成文件配置 filename位子
    - 将以前style-loader 替换成MiniCssExtractPlugin.loader
  
  - let OptimizeCss = require('optimize-css-assets-webpack-plugin')
    - 这个插件作用主要是将 css 压缩
    - 用法 注册插件就可以了 还可以传入一些配置

- js处理
  - babel-loader(转化) @babel/core(核心模块转化) @babel/preset-env(将es6转换成es5) babel-loader必装

  - babel-loader所有的插件都要写在.babelrc中 是json格式 
  ```js
    {
      "plugins": ["@babel/plugin-transform-runtime", "@babel/plugin-proposal-class-properties"]
    }
  ```
  - @babel/plugin-proposal-class-properties 
    - 处理类
    ```js
    class A{
      a=1
    }
    // @babel/plugin-proposal-class-properties 需要安装这个
    ```
  - @babel/plugin-transform-runtime 将高级语法转换低级 
    - 比如 async await
  - @babel/polyfill 处理 'xxx'.includes('a')

  - eslint-loader eslint JS代码校验

  - expose-loader 将变量暴露到全局上
    - 用法1
      - 内联写法 import $ from 'expose-loader?$!jquery'
      - window.$ 就可以获取到了
    

  - loader 有4中 
    - per 前面执行的loader 
      -  在loader配置这个就可以在所有loader前面执行 enforce: "pre",
    - normal 普通loader   就是我们普通写的
    - liader 内联loader
      - 在import 的时候写loader
    - 后置loader

  - 小插件
    - cleanWebpackPlugin
    - copyWebpackPlugin
    - bannerPlugin内置的
```js
  //删除dist文件
  let {CleanWebpackPlugin} =  require('clean-webpack-plugin')
  plugins:[
      new CleanWebpackPlugin(),    
  ]

    //拷贝文件
  let CopyWebpackPlugin = require('copy-webpack-plugin')
  plugins:[
      new CopyWebpackPlugin([
        {from:'./doc',to:'./'}
      ]),    
  ]

  // 版权声明
  let webpack = require('webpack')
    plugins:[
      new webpack.BannerPlugin('make xxxx')//打包的js文件都加入()内的话 
  ]
``` 