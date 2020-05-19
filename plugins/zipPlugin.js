const JSZip = require('jszip')
const {RawSource} = require('webpack-sources')
class ZipPlugin{
  constructor(options){
    this.options = options
  }
  apply(compiler){
    compiler.hooks.emit.tapAsync('ZipPlugin',(compilation,cb)=>{
      // 获取到 compilation 对象
      // compilation.assets 代表有哪些资源要打包  source 是打包的内容
      // console.log(compilation.assets) 
      var zip = new  JSZip();
      for(let filename in compilation.assets){
        zip.file(filename,compilation.assets[filename].source)
      }
      zip.generateAsync({type:'nodebuffer'}).then(content=>{
        compilation.assets[this.options.name] = {
          source(){ return content},
          size(){return content.length}
        }
        cb(null,compilation)
      })
    })
  }
}

module.exports = ZipPlugin