// loader1 文件
function loader2 (source){ //normal
  console.log('222')
  return source
}
loader2.pitch = ()=>{ //pitch
  console.log('loader2')
}
module.exports = loader2