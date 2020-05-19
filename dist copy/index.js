(function (modules) {
  var installedModules = {};
   
  function webpackJsonpCallback(data){
    let chunkIds = data[0];//['title']
    let moreModules = data[1];
    var chunkId;
    let resolves = []
    for(let i=0;i<chunkIds.length;i++){
      chunkId = chunkIds[i];
      console.log('installedChunks[chunkId]',installedChunks[chunkId])
      resolves.push(installedChunks[chunkId][0]);
      installedChunks[chunkId] = 0;
    }
    for(let moduleId in moreModules){
      console.log('moduleId',moduleId)
      modules[moduleId] = moreModules[moduleId];
    }
    while(resolves.length){
      console.log('watch')
      resolves.shift()();
    }
  }
 
  var jsonArray = window["webpackJsonp"] = window["webpackJsonp"] ||[];
  jsonArray.push = webpackJsonpCallback;
 //  undefined 未加载  null 准备加载 promise 加载中 0加载完成
 var installedChunks = {
   main:0// 默认情况 我这个文件只包含入口代码块main 0
 }

  __webpack_require__.e = function(chunkId){
   let promises = [];
   var installedChunkData = installedChunks[chunkId];// 先从缓存里取得当前代码块加载的状态
   if(installedChunkData != 0 ){ // 表示未加载,需要立即加载
     var promise = new Promise(function(resolve,reject){
       installedChunkData = installedChunks[chunkId] = [resolve,reject];
     })
     installedChunkData[2] = promise;
     promises.push(promise);
     let script = document.createElement('script');
     script.src = chunkId + '.js';
     document.head.appendChild(script);
   }
   return Promise.all(promises)
  }
  __webpack_require__.t = function(value, mode) {
    if(mode & 1) value = __webpack_require__(value);
    if(mode & 8) return value;
    if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
    var ns = Object.create(null);
    __webpack_require__.r(ns);
    Object.defineProperty(ns, 'default', { enumerable: true, value: value });
    if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
    return ns;
  };
  __webpack_require__.r = function(exports) {
    if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
    }
    Object.defineProperty(exports, '__esModule', { value: true });
  };

  function __webpack_require__(moduleId) {
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports;
    }
    var module = installedModules[moduleId] = {
      i: moduleId,
      l: false,
      exports: {}
    };
    
    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    module.l = true;
    return module.exports;
  }
  return __webpack_require__(__webpack_require__.s = "./src/index.js");
})
  ({
            "./src/index.js":
            (function (module, exports,__webpack_require__) {
              

let button = document.createElement('button');
button.innerHTML = '异步加载额外的模块';
button.onclick = function () {
  __webpack_require__.e("src_title_js").then(__webpack_require__.t.bind(__webpack_require__, "./src/title.js", 7)).then(rs => {
    console.log(rs.default);
  });
};
document.body.appendChild(button);

module.exports = 'index';
            }),
         
  });