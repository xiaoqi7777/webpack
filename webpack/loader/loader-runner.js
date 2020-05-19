let path = require('path')
let fs = require('fs')

function createLoaderObject(loaderPath){
  let obj = {data:{}};//data是用来在pitch和normal里面传递数据的
  obj.request = loaderPath;//loader这个文件绝对值
  obj.normal = require(loaderPath);//正常的loader函数
  obj.pitch = obj.normal.pitch;//pitch函数
  return obj
}

function defineProperty(loaderContext){
  // 当index为1的时候
  Object.defineProperty(loaderContext,'request',{
    get:function(){// request loader1!loader2!loader3!hello.js
      return loaderContext.loaders.map(loader=>loader.request).concat(loaderContext.resource).join('!')
    },
  })
  Object.defineProperty(loaderContext,'remindingRequest',{
    get:function(){// request loader3!hello.js
      return loaderContext.loaders.slice(loaderContext.loaderIndex+1).map(loader=>loader.request).concat(loaderContext.resource).join('!')
    },
  })
  Object.defineProperty(loaderContext,'previousRequest',{
    get:function(){// request loader1
      return loaderContext.loaders.slice(0,loaderContext.loaderIndex).join('!')
    },
  })
  Object.defineProperty(loaderContext,'currentRequest',{
    get:function(){// request loader2!loader3!hello.js
      return loaderContext.loaders.slice(loaderContext.loaderIndex).map(loader=>loader.request).concat(loaderContext.resource).join('!')
    },
  })
  Object.defineProperty(loaderContext,'data',{
    get:function(){
      return loaderContext.loaders[loaderContext.loaderIndex].data
    },
  })
}

function iterateNormalLoaders(loaderContext,args,finallyCallback){
  if(loaderContext.loaderIndex<0){
    return  finallyCallback(null,args)
  }else{
    let currentLoaderObject = loaderContext.loaders[loaderContext.loaderIndex];
    let normalFn = currentLoaderObject.normal
    args = normalFn.apply(loaderContext,[args]);
    if(isSync){
      loaderContext.loaderIndex--
      iterateNormalLoaders(loaderContext,args,finallyCallback)
    }
  }
}

function processResource(loaderContext,finallyCallback){
  // 默认读出来的是buffer
  let result = loaderContext.readResource(loaderContext.resource)
  if(!loaderContext.loaders[loaderContext.loaderIndex].normal.raw){
    result = result.toString('utf8')
  }
  iterateNormalLoaders(loaderContext,result,finallyCallback)
}

function iteratePitchingLoaders(loaderContext,finallyCallback){
  if(loaderContext.loaderIndex >= loaderContext.loaders.length){
    console.log('loaderContext.loaderIndex',loaderContext.loaderIndex)
    loaderContext.loaderIndex--;
    return processResource(loaderContext,finallyCallback)
  }
  let currentLoaderObject = loaderContext.loaders[loaderContext.loaderIndex];
  let pitchFn = currentLoaderObject.pitch
  if(!pitchFn){
    loaderContext.loaderIndex++;
    return  iteratePitchingLoaders(loaderContext,finallyCallback)
  }
  // 剩下的 request 前面的 request 
  let args = pitchFn.apply(loaderContext,[loaderContext.remindingRequest,loaderContext.previousRequest,loaderContext.data])
  if(args){
    loaderContext.loaderIndex--;
    iterateNormalLoaders(loaderContext,args,finallyCallback)
  }else{
    loaderContext.loaderIndex++;
    return  iteratePitchingLoaders(loaderContext,finallyCallback)
  }
}

var isSync = true

function runLoaders(options,finallyCallback){
  let loaderContext = options.context||{};// loader的上下文环境
  loaderContext.resource = options.resource;// 要加载的资源 hello.js
  loaderContext.loaders = options.loaders.map(createLoaderObject);
  loaderContext.loaderIndex = 0;// loaderIndex是正在执行loader的索引
  loaderContext.readResource = options.readResource;// fs.readFile
//  挂载4个变量 
//   request 所有的loader
//   remindingRequest  剩下的loader 
//   previousRequest 之前的loader
//   currentRequest  当前及以后的loader
//   data 用来共享数据
  defineProperty(loaderContext)
  
  function asyncCallback(err,result){
    isSync = true
    loaderContext.loaderIndex--;
    iterateNormalLoaders(loaderContext,result,finallyCallback)
  }
  loaderContext.async = function(){
    isSync = false;
    return asyncCallback;
  }
  iteratePitchingLoaders(loaderContext,finallyCallback)
}


// runLoaders 测试的时候要在当前目录执行 

runLoaders({
  resource:path.resolve(__dirname,'hello.js'),//要加载的资源
  loaders:[// 我们要用这三个loader去转换hello.js
    path.resolve('loader1.js'),
    // path.resolve('loader2.js'),
    // path.resolve('loader3.js'),
  ],
  context:{ },
  readResource:fs.readFileSync.bind(fs)
},function(err,rs){
  console.log('=>',rs)
})

module.exports = runLoaders

/**
 * 
 */
