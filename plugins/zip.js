const JSZip = require('jszip')
const fs = require('fs')
const path = require('path')
const  zip = new JSZip()
zip.file('./1.js','111')
zip.generateAsync({type:'nodebuffer'}).then(content=>{
  fs.writeFileSync(path.resolve(__dirname,'1.zip'),content)
})

// var zip = new JSZip();
 
// zip.file("Hello.txt", "Hello World\n");
 
// var img = zip.folder("images");
// img.file("smile.gif", imgData, {base64: true});
 
// zip.generateAsync({type:"blob"}).then(function(content) {
//     // see FileSaver.js
//     saveAs(content, "example.zip");
// });