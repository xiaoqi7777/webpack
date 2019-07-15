let path = require('path')
let HtmlWebapckPlugins = require('html-webpack-plugin')
let MiniCssExtractPlugin = require('mini-css-extract-plugin')
module.exports = {
  mode:'production',
  entry:{
    main:path.join(__dirname,'../src/index')
  },
  output:{
    filename:'[name].js',
    path:path.join(__dirname,'../public')
  },
  module:{
    rules:[
      {
        test:/\.css$/,
        use:[
          {
            loader:MiniCssExtractPlugin.loader
          },
          'css-loader'
        ]
      }
    ]
  },
  plugins:[
    new HtmlWebapckPlugins({
      template:path.join(__dirname,'../index.html'),
      filename:'index.html'
    }),
    new MiniCssExtractPlugin({
      filename:path.join(__dirname,'../public/css/main.css')
    })
  ],
  devServer:{
    contentBase:path.join(__dirname,'../public'),
    port:3000,
    host:'localhost'
  }
}
