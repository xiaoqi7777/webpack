let path = require('path')
let fs = require('fs')


// 遍历 loader normal
function iterateNormalLoaders(loaderContext,args,finallyCallback){
  // 当遍历完 所有的loader normal 的时候 cb返回
  if(loaderContext.loaderIndex<0){
    return  finallyCallback(null,args)
  }else{
    let currentLoaderObject = loaderContext.loaders[loaderContext.loaderIndex];
    let normalFn = currentLoaderObject.normal
    args = normalFn.apply(loaderContext,[args]);
    loaderContext.loaderIndex--
    iterateNormalLoaders(loaderContext,args,finallyCallback)
  }
}

function processResource(loaderContext,finallyCallback){
  let result = loaderContext.readResource(loaderContext.resource,'utf8')
  iterateNormalLoaders(loaderContext,result,finallyCallback)
}

// 遍历 loader pitch
function iteratePitchingLoaders(loaderContext,finallyCallback){
  // 当 当前的pitch 都处理完的时候 直接执行loader normal
  if(loaderContext.loaderIndex >= loaderContext.loaders.length){
    loaderContext.loaderIndex--;
    // loader normal 接收加载的数据 或者 接收pitch 返回的内容(这里是接收加载的数据,所有的pitch都返回的undefined)
    // processResource 根据 读取resource数据 传给 loader normal
    return processResource(loaderContext,finallyCallback)
  }
  let currentLoaderObject = loaderContext.loaders[loaderContext.loaderIndex];
  let pitchFn = currentLoaderObject.pitch
  // pitch 可有可无 当没有的时候 直接进入下一个loader
  if(!pitchFn){
    loaderContext.loaderIndex++;
    return  iteratePitchingLoaders(loaderContext,finallyCallback)
  }
  // pitch 有的时候 判断返回值 有则执行下一个上一个loader normal 无则执行下一个loader pitch
  let args = pitchFn.apply(loaderContext,[loaderContext.remindingRequest,loaderContext.previousRequest,loaderContext.data])
  if(args){
    // 执行上一个
    loaderContext.loaderIndex--;
    // loader normal 接收加载的数据 或者 接收pitch 返回的内容(这里是接收pitch返回的值)
    iterateNormalLoaders(loaderContext,args,finallyCallback)
  }else{
    // 执行下一个
    loaderContext.loaderIndex++;
    return  iteratePitchingLoaders(loaderContext,finallyCallback)
  }
}
function createLoaderObject(loaderPath){
  let obj = {data:{}};//data是用来在pitch和normal里面传递数据的
  obj.request = loaderPath;//loader这个文件绝对值
  obj.normal = require(loaderPath);//正常的loader函数
  obj.pitch = obj.normal.pitch;//pitch函数
  return obj
}

function runLoaders(options,finallyCallback){
  let loaderContext = options.context||{};// loader的上下文环境
  loaderContext.resource = options.resource;// 要加载的资源 hello.js
  loaderContext.loaders = options.loaders.map(createLoaderObject);
  loaderContext.loaderIndex = 0;// loaderIndex是正在执行loader的索引
  loaderContext.readResource = options.readResource;// fs.readFile
  defineProperty(loaderContext)
  // console.log(loaderContext)
  iteratePitchingLoaders(loaderContext,finallyCallback)
  // 当前索引是 1的时候
}


function defineProperty(loaderContext){
  // 所有的
  Object.defineProperty(loaderContext,'request',{
    get:function(){// request loader1!loader2!loader3!hello.js
      return loaderContext.loaders.map(loader=>loader.request).concat(loaderContext.resource).join('!')
    },
  })
  // 剩下的
  Object.defineProperty(loaderContext,'remindingRequest',{
    get:function(){// request loader3!hello.js
      return loaderContext.loaders.slice(loaderContext.loaderIndex+1).map(loader=>loader.request).concat(loaderContext.resource).join('!')
    },
  })
  // 之前的
  Object.defineProperty(loaderContext,'previousRequest',{
    get:function(){// request loader2
      return loaderContext.loaders.slice(0,loaderContext.loaderIndex).join('!')
    },
  })
  // 当前的
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

runLoaders({
  resource:path.resolve(__dirname,'src','hello.js'),//要加载的资源
  loaders:[// 我们要用这三个loader去转换hello.js
    path.resolve('loader','loader1.js'),
    path.resolve('loader','loader2.js'),
    path.resolve('loader','loader3.js'),
  ],
  context:{ },
  readResource:fs.readFileSync.bind(fs)
},function(err,rs){
  console.log('=>',rs)
})
/**
 * 
 */
