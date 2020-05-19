const {Tapable,SyncHook,AsyncParallelHook,AsyncSeriesHook} = require('tapable');
const Compilation  = require('./Compilation')
const Stats = require('./Stats')
const mkdirp = require('mkdirp')
const path = require('path')
class Compiler extends Tapable{
  constructor(context){
    super();
    this.hooks = {
      environment: new SyncHook(['name']),
      afterEnvironment: new SyncHook([]),
      afterPlugins: new SyncHook([]),
      entryOption:new SyncHook(['context','entry']),
      make:new AsyncParallelHook(['compilation']),
      beforeRun:new AsyncSeriesHook(['compiler']),
      run:new AsyncSeriesHook(['compiler']),
      beforeCompile:new AsyncSeriesHook(['params']),
      compile:new SyncHook(['params']),
      thisCompilation:new SyncHook(['compilation','params']),
      compilation:new SyncHook(['compilation','params']),
      afterCompile:new AsyncSeriesHook(['params']),
      emit:new AsyncSeriesHook(['compilation']),
      done:new AsyncSeriesHook(["stats"]),// 一切完成后会触发done
    }
    this.options = {};
    //保存当前的上下文路径 D:\ItData\vueAnalysis\jwt
    this.context = context;
  }
  newCompilation(params){
    let compilation = new Compilation(this)
    // 开始新的编译
    this.hooks.thisCompilation.call(compilation,params)
    // 
    this.hooks.compilation.call(compilation,params)
    return compilation
  }
  
  
  emitAssets(compilation,callback){
    const emitFiles = err=>{
      // 是一个对象 对象上有属性的值 {文件名字:源码}
      let assets = compilation.assets;
      for(let file in assets){
        let source = assets[file];
        // posix 能在不同操作系统上分隔符一致
        let targetPath = path.posix.join(this.options.output.path,file);
        this.outputFileSystem.writeFileSync(targetPath,source);
      }
      callback();
    }
    this.hooks.emit.callAsync(compilation,err=>{
      mkdirp(this.options.output.path,emitFiles)
    });
  }
  run(finallyCallback){
    const onCompiled = (err,compilation)=>{
      // 编译完成后的回调
      this.emitAssets(compilation,(err)=>{
        const stats = new Stats(compilation);
        this.hooks.done.callAsync(stats,err=>{
          return finallyCallback(null,stats)
        })
      })
    }
    this.hooks.beforeRun.callAsync(this,err=>{
      this.hooks.run.callAsync(this,err=>{
        this.compile(onCompiled)
      })
    })
  }
  // 真正 开始编译
  compile(onCompiled){
    this.hooks.beforeCompile.callAsync({},err=>{
      this.hooks.compile.call();
      // 创建一个新的compilation 这里面放着本次编译的结果
      const compilation = this.newCompilation()
      this.hooks.make.callAsync(compilation,err=>{
        compilation.seal(err=>{// 通过模块依赖 生成代码块
          this.hooks.afterCompile.callAsync(compilation,err=>{
            return onCompiled(null,compilation);//写入文件系统
          })
        })
      })
    })
  }
}

module.exports = Compiler