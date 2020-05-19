let postcss = require('postcss')
const Tokenizer = require('css-selector-tokenizer')

  // 插件
 function createPlugin(options) {
   return function(css) {
    // 遍历 import等规则
    css.walkAtRules(function(rule){
      let values = Tokenizer.parseValues(rule.params)
      // let url = values.nodes[0].nodes[0]  //{value:'./base.css'}
      values.nodes.forEach(value=>{
        value.nodes.forEach(item=>{
          console.log(item)
          item.value +='.js' 
        })
      })
      rule.params = Tokenizer.stringifyValues(values)
      // console.log('=>>>>>>>>',url)
     }) 
    // 遍历每一条规则
     css.walkDecls(function(decl){
      let values = Tokenizer.parseValues(decl.value)
      values.nodes.forEach(value=>{
        value.nodes.forEach(item=>{
          // 参数加'' 值就在value中  不加就在name中
          item.name += '123'
        })
      })
      decl.value = Tokenizer.stringifyValues(values)
     })
     
   }
 }

let inputSource = `
@import 'xxxxxxxxxxxxx'
 .div{
   color:red;
   font:12px;
 }
`
 const options = {}
 postcss([createPlugin(options)]).process(inputSource, { from: undefined }).then(rs => { console.log('====>rs', rs.css) })