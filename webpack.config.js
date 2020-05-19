const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    mode:'development',//开发模式，代码不被压缩
    entry:'./src/index.js',//打包的入口
    output:{
        path:path.join(__dirname,'dist'),
        filename:'main.js'
    },
    devServer:{
        hot:true,//启动热更新
        contentBase:path.join(__dirname,'dist')
    },
    plugins:[
        new HtmlWebpackPlugin({
            template:'./src/index.html',
            filename:"index.html"
        }),
        new webpack.HotModuleReplacementPlugin()
    ]
}