// 创建 webpack.config.react.js
let path = require('path')
let webpack = require('webpack')
module.exports = {
  mode:'development',
  entry:{
    react:['jquery'],
  },
  output:{
    finame:'_dll_[name].js',//产生的文件名字
    path:path.join(__dirname,'dist'),
    library:'_dll_[name]', //打包的文件就是 let ab={内容}
    libraryTarget:'var',
    /*
       不会挂到 var  会是exports[a] = function(){}()
       如果是commonjs 会是 var a  = function(){}()
       如果是commonjs2  会是module.exports = function(){}()
       如果是this   就是this[a] = function(){}()
       global 默认是window[a] = function(){}()
       var 是 var a  = function(){}()
    */ 
  },
  plugins:[
    // 动态连接库的清单 会生成一个manifest.json文件
    new webpack.Dllplugin({//规定好的 name = library
      name:'_dll_[name]',
      path:path.resolve(__dirname,'dist','manifest.json')
    })
  ]
}