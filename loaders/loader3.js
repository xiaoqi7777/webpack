// loader1 文件
function loader3 (source){ //normal
  console.log('333')
  return source
}
loader3.pitch = ()=>{ //pitch
  console.log('loader3')
}
module.exports = loader3