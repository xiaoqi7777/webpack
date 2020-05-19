const postcss = require('postcss')
const Tokenizer = require('css-selector-tokenizer')
const loaderUtils = require('loader-utils');

function createPlugin(options){
  return function(css){
    let {urlItems,importItems} = options
    css.walkAtRules(/^import$/,function(rule){
      let values = Tokenizer.parseValues(rule.params)
      let url = values.nodes[0].nodes[0]  //{value:'./base.css'}
      importItems.push(url.value)
      
    })
    // 遍历每一条规则
    css.walkDecls(function(decl){ 
      // 将字符串转成对象
      let values = Tokenizer.parseValues(decl.value)// '75px solid red'
      values.nodes.forEach(value=>{
        value.nodes.forEach(item=>{
          if(item.type === 'url'){
            let url = item.url
            item.url = `_CSS_URL_${urlItems.length}_`
            urlItems.push(url) // .avatar.gif
          }
        })
      })
      // 将对象转成字符串
      decl.value = Tokenizer.stringifyValues(values)
    })
  }
}

function loader(inputSource,data){
  let callback = this.async()
  let options = {
    importItems:[],
    urlItems:[]
  };
  // loaderUtils.stringifyRequest他 可以把一个绝对路径 转换成合适loader的相对路径
  // background-img:url(./avatar.gif)
  postcss([createPlugin(options)]).process(inputSource,{from:undefined}).then(rs=>{
    let importJs = options.importItems.map(imp=>{
      // return '"+require("'+imp+'")+"'
      return "require("+loaderUtils.stringifyRequest(this,imp)+")"
    }).join('\n')// @import './base.css';
    let cssString = JSON.stringify(rs.css)// url('_CSS_URL_0_')
  
    // 替换 @import './base.css'
    cssString = cssString.replace(/@import\s+?.+?;/,"")
    // 替换 url('_CSS_URL_0_')
    cssString = cssString.replace(/_CSS_URL_(\d+?)_/g,function(matched,group1){
      let imageUrl = options.urlItems[+group1];
      //  打包的时候 imageUrl 变成真实的地址  最后 require是在浏览器执行的
      return '"+require("'+imageUrl+'")+"';
    });
      // ${importJs}
    callback(null,`
      ${importJs}
      module.exports = ${cssString};
    `)
  })
}

module.exports = loader