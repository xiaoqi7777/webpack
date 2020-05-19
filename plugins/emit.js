
class Plugin{
  apply(compiler){
    compiler.hooks.emit.tapAsync('emit',function(name,cb){
      name.assets['xx.js']='xxxxxxxxxxxxxxxxx'
      cb()
    })
  }
}
module.exports = Plugin