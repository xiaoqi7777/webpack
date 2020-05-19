
const normalModuleFactory = require('./NormalModuleFactory');
const {Tapable,SyncHook,SyncBailHook,AsyncSeriesHook,AsyncParallelHook} = require("tapable");
const path = require('path');
const Chunk = require('./Chunk');
const fs = require('fs');
const ejs = require('ejs');
const mainTemplate = fs.readFileSync(path.join(__dirname, 'main.ejs'), 'utf8');
const asyncTemplate = fs.readFileSync(path.join(__dirname, 'async.ejs'), 'utf8');
const mainRender = ejs.compile(mainTemplate);
const asyncRender = ejs.compile(asyncTemplate);
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
        this.entries=[];    //入口列表 指的是 entry 入口文件的列表
        this._modules = {}; // 模块代码  {'代码路径':'编译后的代码'}
        this.modules=[];    // 所有模块 每一次require 编译this 存放进去
        this.chunks = [];   // 代码块 存放着入口文件 对应的所有资源
        this.files=[];  
        this.assets = {};   //资源 
    }
    //context ./src/index.js main callback(终级回调)
    addEntry(context, entry, name, finallyCallback) {
      this.hooks.addEntry.call(entry, name);//开始增加入口
      this._addModuleChain(context,entry,name,'main');
      finallyCallback();
   }
   //增加模块链
   _addModuleChain(context,entry,name,main){
        let module = normalModuleFactory.create(
        {name,  //模块所属的代码块的名称
        context:this.context,//上下文
        request:path.posix.join(context,entry)});//模块完整路径
        module.build(this);//开始编译模块
        module.main = main
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
      // 把代码块的模块添加到代码块中 
      // entries 指的是入了文件 和chunk代表同一类  this.modules 每次编译或者 require 都会添加当前的实例
      // this.modules 会有很多 但是chunk里面只需要入口文件的代码   
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
      let source='';
      if(chunk.main=='main'){
        source = mainRender({entryId:chunk.entryModule.moduleId, modules:chunk.modules});
      }else if(chunk.main){
        source = asyncRender({entryId:chunk.entryModule.name, modules:chunk.modules});
      }
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