let path = require('path')
let HtmlWebapckPlugins = require('html-webpack-plugin')
let MiniCssExtractPlugin = require('mini-css-extract-plugin')
let {CleanWebpackPlugin} =  require('clean-webpack-plugin')
let OptimizeCss = require('optimize-css-assets-webpack-plugin')

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
          'css-loader',
        ]
      },
      {
        test:/\.scss$/,
        use:[
          {
            loader:MiniCssExtractPlugin.loader
          },
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test:/\.(png|jpeg|gif)$/,
        use:[
          {
            loader:'url-loader',
            options:{
              limit:1*1024,
              outputPath:'img'
            }
          }
        ]
      },
      // {
      //   test:/\.js$/,
      //   use:[
      //     {
      //       loader:'babel-loader',
      //       options:{
      //         presets:['@babel/preset-env']
      //       }
      //     }
      //   ]
      // }
    ]
  },
  plugins:[
    new HtmlWebapckPlugins({
      template:path.join(__dirname,'../index.html'),
      filename:'index.html'
    }),
    new MiniCssExtractPlugin({
      filename:'css/main.css',
    }),
    new OptimizeCss(),
    new CleanWebpackPlugin()
  ],
  devServer:{
    contentBase:path.join(__dirname,'../public'),
    port:3000,
    host:'localhost'
  }
}
