let loaderUtils = require('loader-utils')
let validateOptions = require('schema-utils')
// loader1 文件
function loader1 (source){ //normal
  let options =  loaderUtils.getOptions(this)
  console.log('1111',options.filename)
  return source

}


loader1.pitch = ()=>{ //pitch
  console.log('loader1')
}
module.exports = loader1