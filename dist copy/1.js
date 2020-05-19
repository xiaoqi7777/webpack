
  // // var jsonArray = window["webpackJsonp"] = window["webpackJsonp"] ||[];
  // // jsonArray.push = webpackJsonpCallback;
  // let window = []
  // var rs = window['a'] =  window['a']||[]

  // rs.push = webpackJsonpCallback

  //  function webpackJsonpCallback(data){
  //   console.log(data)
  // }

  // window['a'].push([["src_title_js"],{

  //   "./src/title.js":
  //   (function(module, exports) {
    
  //   eval("module.exports = '11111111111123'\n\n//# sourceURL=webpack:///./src/title.js?");
    
  //   })
    
  //   }]);
  var uri = "'我'";
  console.log(encodeURI(uri)) // http://www.baidu.com/a%20b 
  console.log(decodeURI(uri)) // http%3A%2F%2Fwww.baidu.com/a%20b 