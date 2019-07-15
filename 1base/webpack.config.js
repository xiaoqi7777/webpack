

let path = require('path')
let HtmlWebapckPlugins = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader:'style-loader',
            options:{
              insertAt:'top'
            }
          },
           'css-loader'
          ]
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
          ]
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
  plugins: [
    new HtmlWebapckPlugins({
      template: './index.html'
    })
  ]
}