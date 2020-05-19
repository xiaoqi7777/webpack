import './client.js';
import './world';
console.log('123')
var root = document.getElementById('root');
function render(){
    let title = require('./title').default;
    root.innerHTML = title;
}
render();
//如果说此模块支持热更新的话
if(module.hot){
  //如果此模块依赖的title模块发生变更的时候，就会调用render回调函数  
   module.hot.accept(['./title'],render);
}
//hot._acceptedDependencies={'./title',render}