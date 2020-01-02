let fs = require('fs')
class NodeEnvironmentPlugin{
  apply(compiler){
    // 当你读文件的时候用哪个模块来读
    compiler.inputFileSystem = fs;
    // 当你写入文件的时候 通过模块来写
    compiler.outputFileSystem = fs;
    
  }
}
module.exports = NodeEnvironmentPlugin