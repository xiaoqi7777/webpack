

let path = require('path')
let HtmlWebapckPlugins = require('html-webpack-plugin')
let MiniCssExtractPlugin = require('mini-css-extract-plugin')
let OptimizeCss = require('optimize-css-assets-webpack-plugin')
// let UglifyJsPlugin = require('uglifyjs-webpack-plugin')
let webpack = require('webpack')
module.exports = {
  mode: 'development',
  // optimization: {
  //   minimizer: [new UglifyJsPlugin()],
  // },
  module: {
    rules: [
      // {
      //   test:require.resolve('jquery'),
      //   use:'expose-loader?$!jquery'
      // },
      {
        test:/\.(htm|html)$/,
        use:'html-withimg-loader'
      },
      {
        test:/\.(png|jpeg|gif)$/,
        use:{
          loader:'url-loader',
          options:{
            limit:1*1024,
            outputPath:'img/'
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          {
            loader:MiniCssExtractPlugin.loader,
          },
           'css-loader',
           'postcss-loader',
          ]
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader:'postcss-loader',
            options:{
              ident: 'postcss',
              plugins:[
                require('autoprefixer'),
                require('precss')
              ]
            }
          },
          'sass-loader',
          ]
      },
      {
        test:/\.js$/,
        use:{
          loader:'babel-loader',
          options:{
            presets:[
              '@babel/preset-env',
            ],
          }
        },
        exclude:/node_mdoules/
      },
      {
        test: /\.js$/,
        loader: 'eslint-loader',
        enforce: "pre",
        include: [path.resolve(__dirname, 'src')], // 指定检查的目录
        options: { // 这里的配置项参数将会被传递到 eslint 的 CLIEngine 
            formatter: require('eslint-friendly-formatter') // 指定错误报告的格式规范
        }
      },

    ]
  },
  entry: {
    ss: './src/index.js'
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, '../dist')
  },
  devServer: {
    contentBase: path.join(__dirname, '../dist'),
    port: 3000,
    compress: true,
    host: 'localhost',
    stats: 'errors-only'
  },
  // externals:{
  //   jquery:'$'
  // },
  plugins: [
    new HtmlWebapckPlugins({
      template: './index.html'
    }),
    new MiniCssExtractPlugin({
      filename:'main.css'
    }),
    new OptimizeCss(),
    // new webpack.ProvidePlugin({
    //   $:'jquery'
    // })
  ]
}