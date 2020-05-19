
let button = document.createElement('button');
button.innerHTML = '异步加载额外的模块'
button.onclick = function(){
  // 魔法注释
  import(/* webpackChunkName:'lazy' */'./title.js').then(rs=>{
    console.log(rs.default)
  })
}
document.body.appendChild(button)

  

require('title.js')
// /*
//   1、如果遇到 import语句的时候 会把import模块 单独放到一个代码块里,这个代码块会单独生成一个文件
//   2、首次加载的时候 只需要加载main.js 当遇到import 语句的时候 会向服务器发送一个jsonp请求,请求被分隔出去的异步代码,然后合并到原来的modules

// */ 