let path = require('path')
let HtmlWebpackPlugin = require('html-webpack-plugin')
let MyPlugin = require('./plugins/myplugin')
let EmitPlugin = require('./plugins/emitFile')
module.exports = {
  mode:'production',
  entry:{
    index:'./src/index.js',
    // main:'./src/main.js'
  },
  // resolveLoader:{
  //   modules:[path.resolve(__dirname,'loaders'),'node_modules'],
  //   extensions:['.js','.css'],
  // },
  module:{
    rules:[
      {
        test:/\.css$/,
        use:['style-loader']
      },
      // {
      //   test:/\.js$/,
      //   use:[
      //     'babel-loader'
      //     // {
      //     // loader:'babel-loader',
      //     // options:{
      //     //   "presets":["@babel/preset-env"]
      //     // }
      //     // }
      //   ]
      // }
    ]
  },
  output:{
    filename:'[name].js',
    path:path.resolve(__dirname,'dist')
  },
  plugins:[
  ],

}