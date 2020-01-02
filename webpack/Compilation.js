
const normalModuleFactory = require('./NormalModuleFactory');
const {Tapable,SyncHook,SyncBailHook,AsyncSeriesHook,AsyncParallelHook} = require("tapable");
const path = require('path');
const Chunk = require('./Chunk');
const fs = require('fs');
const ejs = require('ejs');
const mainTemplate = fs.readFileSync(path.join(__dirname, 'main.ejs'), 'utf8');
const mainRender = ejs.compile(mainTemplate);
class Compilation extends Tapable {
    constructor(compiler) {
        super();
        this.compiler = compiler;
        this.options = compiler.options;
        this.context = compiler.context;
        this.inputFileSystem = compiler.inputFileSystem;
        this.outputFileSystem = compiler.outputFileSystem;
        this.hooks = {
          addEntry: new SyncHook(["entry", "name"]),
          seal: new SyncHook([]),
          beforeChunks: new SyncHook([]),
          afterChunks: new SyncHook(["chunks"])
        }
        this.entries=[];    //入口列表
        this._modules = {}; //模块代码
        this.modules=[];    //所有模块
        this.chunks = [];   //代码块
        this.files=[];  
        this.assets = {};   //资源 
    }
    //context ./src/index.js main callback(终级回调)
    addEntry(context, entry, name, finallyCallback) {
      this.hooks.addEntry.call(entry, name);//开始增加入口
      this._addModuleChain(context,entry,name);
      finallyCallback();
   }
   //增加模块链
   _addModuleChain(context,entry,name){
     let module = normalModuleFactory.create(
         {name,  //模块所属的代码块的名称
         context:this.context,//上下文
         request:path.posix.join(context,entry)});//模块完整路径
     module.build(this);//开始编译模块
     this.entries.push(module);//把编译好的模块添加到入口列表里面
   }
  //编译依赖的模块
  buildDependencies(module,dependencies){
    module.dependencies = dependencies.map(data =>{//映射老模块到新的模块
      let module = normalModuleFactory.create(data);//创建新的模块
      return module.build(this);//编译模块并返回自己
    });
  }
  seal(callback){
    this.hooks.seal.call();
    this.hooks.beforeChunks.call();//生成代码块之前
    for (const module of this.entries) {//循环入口模块
      const chunk = new Chunk(module);//创建代码块
      this.chunks.push(chunk);//把代码块添加到代码块数组中
      //把代码块的模块添加到代码块中
      chunk.modules = this.modules.filter(_module=>_module.name == chunk.name);
    }
    this.hooks.afterChunks.call(this.chunks);//生成代码块之后
    this.createChunkAssets();
    callback();//封装结束
  }
  createChunkAssets(){
    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i];
      chunk.files = [];
      const file = chunk.name+'.js';
      const source = mainRender({entryId:chunk.entryModule.moduleId, modules:chunk.modules});
      chunk.files.push(file);
      this.emitAsset(file, source);
    }
  }
  emitAsset(file, source){
     this.assets[file] = source;
     this.files.push(file);
  }
}
module.exports = Compilation;