let EnterOptionsPlugin = require('./plugins/EnterOptionsPlugin')
class webpackOptionsApply{
  process(options,compiler){
    compiler.hooks.afterPlugins.call(compiler)
    // 挂载入口点  他会监听 make 事件
    new EnterOptionsPlugin().apply(compiler)
    // 触发compiler.hooks.entryOption
    console.log('123123')
    compiler.hooks.entryOption.call(options.context,options.entry)
  }
}
module.exports = webpackOptionsApply