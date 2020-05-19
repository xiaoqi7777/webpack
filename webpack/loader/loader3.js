function loader(inputSource){
  console.log('loader3',inputSource)
  return inputSource
}

loader.pitch = function(remindingRequest,previousRequest,data){
  console.log('pitch3')
  
}
// 默认情况下loader得到的内容是字符串 如果想要的得到二进制文件 需要把raw=true
loader.raw = true

module.exports = loader