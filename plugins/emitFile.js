class EmitPlugin{
  apply(compiler){
    compiler.hooks.emit.tapAsync('xx',(compilation,cb)=>{
      compilation.assets['xx.js'] = {
        source(){return 'xxx'},
        size(){return 1}
      }
      cb()
    })
  }
}
module.exports = EmitPlugin