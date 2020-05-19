class MyPlugin{
  apply(compiler){
    compiler.hooks.environment.tap('MyPlugin',(data)=>{
      console.log('MyPlugin-->',data)
    })
  }
}
module.exports = MyPlugin