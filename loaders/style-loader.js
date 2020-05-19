
const loaderUtils = require('loader-utils')

function loader(resource){
  let style = `
    let style = document.createElement('style')
          // style.innerHTML = require('!!../node_modules/_css-loader@3.4.0@css-loader/dist/cjs.js!./index.css')
    style.innerHTML = ${JSON.stringify(resource)}
    document.head.appendChild(style)
  `
  return style
}

// loader.pitch = function(remainingRequest,x,data){
//   data.data = {x:1}
//   let script =(`
//       let style = document.createElement('style')
      
//       // style.innerHTML = require('!!../node_modules/_css-loader@3.4.0@css-loader/dist/cjs.js!./index.css')

//       style.innerHTML = require(${loaderUtils.stringifyRequest(this,"!!"+remainingRequest)})
//       document.head.appendChild(style)
//     `)
//     // return script
// }

module.exports = loader