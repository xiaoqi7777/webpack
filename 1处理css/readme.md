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
  
  - postcss-loader autoprefixer precss(要安装他)
    - 用法 要创建一个postcss.config.js 配置文件  具体看官网
    - 在loader 里面配置插件
