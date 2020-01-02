let path = require('path')
module.exports = {
  entry:'./src/index.js',
  module:{
    rules:[]
  },
  output:{
    filename:'[name].js',
    path:path.resolve(__dirname,'dist')
  }
}