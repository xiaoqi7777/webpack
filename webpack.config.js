let path = require('path')
let HtmlWebpackPlugin = require('html-webpack-plugin')
let {CleanWebpackPlugin} = require('clean-webpack-plugin')
let MyPlugin = require('./plugins/myplugin')
let EmitPlugin = require('./plugins/emitFile')
let zipPlugin = require('./plugins/zipPlugin')
let miniCssExtractPlugin  = require('mini-css-extract-plugin')
let purgecssWebpackPlugin = require('purgecss-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin'); // 压缩js
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");// 压缩css
let glob = require('glob')
module.exports = {
  mode:'development',
  // optimization:{
  //   splitChunks:{// 分隔代码块
  //     cacheGroups:{ // 缓存
  //       vendor:{ //第三方
  //         chunks:'initial',// 指定分隔类型 默认3中选择 all  async(异步) initial(同步)
  //         name:'vendors',// 给分隔出去的代码块取一个名字叫vendors
  //         test:/node_modules/,// 如果模块ID 匹配这个正则 就会添加到vendors代码块中
  //         priority:-10,// 优先级
  //       },
  //       commons:{
  //         chunks:'initial',
  //         name:'commons',
  //         minSize:0,// 最小提取的字节,如果模块的大小 大于多少才需要提取
  //         minChunks:2,// 最少被几个chunk引用才需要被提取
  //         priority:-20
  //       }
  //     }
  //   }
  //   // minimizer:[
  //   //   new TerserPlugin({

  //   //   }),
  //   //   new OptimizeCSSAssetsPlugin({
        
  //   //   })
  //   // ]
  // },
  entry:{
    index:'./src/index.js',
    title:'./src/title.js'
  },
  // entry:{
  //   page1:'./src/page1.js',
  //   page2:'./src/page2.js',
  //   page3:'./src/page3.js',
  // },
  // resolveLoader:{
  //   modules:[path.resolve(__dirname,'loaders'),'node_modules'],
  //   extensions:['.js','.css'],
  // },
  // entry:'./src/index.js',
  module:{
    rules:[
      {
        test:/\.css$/,
        use:[miniCssExtractPlugin.loader,'css-loader']
      }
    ]
  },
  output:{
    filename:'[name].js',
    path:path.resolve(__dirname,'dist')
  },
  plugins:[
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template:'./public/index.html',
      // chunks:['index'],
      filename:'index.html'
    }),
    new miniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename:'[id].css'
    }),
    // new purgecssWebpackPlugin({
    //   paths:glob.sync(`./src/**/*` ,{nodir:true})// 不匹配目录，只匹配文件
      // paths:glob.sync(`${path.join(__dirname,'src')}/**/*` ,{nodir:true})// 不匹配目录，只匹配文件
    // })
    // new MyPlugin(),
    // new EmitPlugin(),
    // new zipPlugin({
    //   name:'dist.zip'
    // })
  ],

}