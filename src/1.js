let button = document.createElement('button');
button.innerHTML = '异步加载额外的模块'
button.onclick = function(){
  // 魔法注释
  import(/* webpackChunkName:'lazy' */'./2.js').then(rs=>{
  console.log('=>',rs.default)
  })
}
document.body.appendChild(button)
