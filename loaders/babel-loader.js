const path = require('path')
const babel = require('@babel/core')
const loaderUtils = require('loader-utils');
function loader(inputSource){ 
  console.log('1`111111111111111111111')
  // let  options = loaderUtils.getOptions(this);
  let options = {
    "presets":["@babel/preset-env"]
  }
   options = {
     ...options,//二选一
    // presets:[  "@babel/preset-env"],
    sourceMaps:true,// 告诉babel我要生成sourcemap 如果提供了 webpack sourcemap就用它的 不给它自己弄 , 要设置 devtool:'source-map' 自己设置后names 选项就有值了
    filename:path.basename('src/index.js')// 内部的api this上提供的 当前处理文件的路径，例如 /src/main.js
  }
  //  转义之后会生成3个文件
  let {code,map,ast} = babel.transform(inputSource,options);
  console.log(code,map,ast)
  // 我们可以吧sourcemap ast 都传给webpack 这样webpack就不需要自己吧源代码转语法树了，也不需要自己生成sourcemap
  return code
}
module.exports = loader