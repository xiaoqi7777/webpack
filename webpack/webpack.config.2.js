

let path = require('path')
let HtmlWebapckPlugins = require('html-webpack-plugin')
let MiniCssExtractPlugin = require('mini-css-extract-plugin')
let OptimizeCss = require('optimize-css-assets-webpack-plugin')
// let UglifyJsPlugin = require('uglifyjs-webpack-plugin')
let {CleanWebpackPlugin} =  require('clean-webpack-plugin')
let CopyWebpackPlugin = require('copy-webpack-plugin')
let webpack = require('webpack')



// loader2 文件
function loader2 (source){
  console.log('222')
  return source
}
loader2.pitch = ()=>{
  console.log('loader2')
}

// loader3 文件
function loader3 (source){
  console.log('333')
  return source
}
loader3.pitch = ()=>{
  console.log('loader3')
}

module.exports = {
  mode: 'production',
  // optimization: {
  //   minimizer: [new UglifyJsPlugin()],
  // },
  // devtool:'source-map',
  resolveLoader:{
    modules:['node_modules',path.resolve(__dirname,'../loaders')],
    // alias:{
    //   // 在loader中使用 loader1 就指向 __dirname/loaders/loaders1.js
    //   loader1:path.resolve(__dirname,'../loaders','loader1')
    // }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use:{
          loader:'loader1',
          options:{
            presets:{
              text:'珠峰',
            },
          }
        }
        // loader:['loader1','loader2','loader3']
      },

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
      }
    ]
  },
  devServer:{
    hot:true
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
      filename:'css/main.css',
    }),
    new OptimizeCss(),
    new CleanWebpackPlugin() ,
    new CopyWebpackPlugin([
      {from :'./readme.md',to:'./'}
    ]),   
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.HotModuleReplacementPlugin(),//热更新插件
    new webpack.NamedModulesPlugin(),//打印更新的模块路径
    // new webpack.ProvidePlugin({
    //   $:'jquery'
    // })
  ]
}